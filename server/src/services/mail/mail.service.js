import { buildResultsEmail } from '../../templates/resultsEmail.js';
import { getEmailAttachments } from '../../templates/emailAssets.js';
import { maskEmail } from '../../utils/maskEmail.js';
import { TIPO_ERROR, SinCuentasDisponiblesError, clasificarError } from './errores.js';
import { createTransportCache } from './transportes.js';
import { writeDryRunPreview } from './vistaPrevia.js';

/** Cuántas cuentas se prueban para un mismo correo antes de rendirse. */
const MAX_CUENTAS_POR_ENVIO = 3;
/** Cuánto se pausa una cuenta que alcanzó el límite del proveedor. */
const MINUTOS_BLOQUEO_CUOTA = 24 * 60;

/**
 * Servicio de correo con rotación de cuentas.
 * Cada envío usa la cuenta disponible de menor prioridad; si falla, se prueba con otra.
 *
 * @param {object} deps
 * @param {ReturnType<import('../../repositories/cuentasCorreo.repository.js').createCuentasCorreoRepository>} deps.cuentasCorreo
 * @param {ReturnType<import('../../repositories/enviosCorreo.repository.js').createEnviosCorreoRepository>} deps.enviosCorreo
 * @param {{dryRun: boolean, fromName: string, replyTo: string}} deps.mailConfig
 * @param {string} deps.secretKey MAIL_SECRET_KEY (64 caracteres hexadecimales)
 * @param {{info: Function, warn: Function, error: Function}} deps.logger
 */
export function createMailService({ cuentasCorreo, enviosCorreo, mailConfig, secretKey, logger }) {
  const transportes = createTransportCache(secretKey);

  /** Aplica a la cuenta la consecuencia que corresponde al tipo de error. */
  async function aplicarConsecuencia(cuenta, tipo, motivo) {
    const id = cuenta.id_cuenta_correo;

    if (tipo === TIPO_ERROR.CUOTA) {
      await cuentasCorreo.bloquearCuenta(id, MINUTOS_BLOQUEO_CUOTA, motivo);
      logger.warn(`Cuenta ${maskEmail(cuenta.correo)} alcanzó su límite: pausada ${MINUTOS_BLOQUEO_CUOTA} min.`);
      return;
    }

    // En los demás casos el correo no salió, así que el cupo reservado se devuelve.
    await cuentasCorreo.liberarCupo(id);

    if (tipo === TIPO_ERROR.CREDENCIALES) {
      await cuentasCorreo.desactivarCuenta(id, motivo);
      logger.error(`Cuenta ${maskEmail(cuenta.correo)} desactivada: credenciales rechazadas.`);
    } else if (tipo === TIPO_ERROR.TEMPORAL) {
      await cuentasCorreo.registrarError(id, motivo);
    }
  }

  /**
   * Guarda el éxito en la base de datos. Si la base falla NO se lanza error: el correo ya salió y
   * reintentar con otra cuenta enviaría un duplicado.
   */
  async function registrarExito(cuenta, to, subject, messageId, idParticipacion) {
    try {
      await cuentasCorreo.confirmarEnvio(cuenta.id_cuenta_correo);
      await enviosCorreo.registrarEnvio({
        idParticipacion,
        idCuenta: cuenta.id_cuenta_correo,
        remitente: cuenta.correo,
        destinatario: to,
        asunto: subject,
        estado: 'enviado',
        idMensaje: messageId,
      });
    } catch (err) {
      logger.error(`El correo salió, pero no se pudo registrar en la base de datos: ${err.message}`);
    }
  }

  async function registrarFallo(cuenta, to, subject, err, tipo, motivo, idParticipacion) {
    await enviosCorreo.registrarEnvio({
      idParticipacion,
      idCuenta: cuenta.id_cuenta_correo,
      remitente: cuenta.correo,
      destinatario: to,
      asunto: subject,
      estado: 'fallido',
      tipoError: tipo,
      codigoError: String(err.code ?? err.responseCode ?? ''),
      mensajeError: motivo,
    });
  }

  return {
    /** Al arrancar: comprueba las credenciales de cada cuenta activa (no envía nada). */
    async verify() {
      if (mailConfig.dryRun) {
        logger.warn('Modo DRY-RUN activo: los correos NO se envían, se guardan en server/.dry-run/');
        return;
      }

      const cuentas = await cuentasCorreo.listarActivas();
      if (cuentas.length === 0) {
        logger.error('No hay cuentas activas en cuentas_correo: no se podrán enviar correos.');
        return;
      }

      for (const cuenta of cuentas) {
        try {
          await transportes.obtener(cuenta).verify();
          logger.info(`Cuenta ${maskEmail(cuenta.correo)} verificada.`);
        } catch (err) {
          logger.error(`Cuenta ${maskEmail(cuenta.correo)} NO válida:`, err.code ?? '', err.message);
        }
      }
    },

    /**
     * Envía el correo de resultados rotando de cuenta si hace falta.
     *
     * @param {{to: string, name: string, results: object, idParticipacion?: number|null}} params
     * @returns {Promise<{messageId: string, dryRun?: boolean}>}
     * @throws el error original si el destinatario es inválido, o SinCuentasDisponiblesError
     */
    async sendResultsEmail({ to, name, results, idParticipacion = null }) {
      const { subject, html, text } = buildResultsEmail({ name, results });

      if (mailConfig.dryRun) {
        await writeDryRunPreview({ to, subject, html, text });
        return { messageId: 'dry-run', dryRun: true };
      }

      const intentadas = [];
      let ultimoError = null;

      for (let intento = 0; intento < MAX_CUENTAS_POR_ENVIO; intento += 1) {
        const cuenta = await cuentasCorreo.reservarCuenta(intentadas);
        if (!cuenta) {
          break;
        }
        intentadas.push(cuenta.id_cuenta_correo);

        let info;
        try {
          info = await transportes.obtener(cuenta).sendMail({
            from: { name: cuenta.nombre_remitente || mailConfig.fromName, address: cuenta.correo },
            replyTo: mailConfig.replyTo || undefined,
            to,
            subject,
            text,
            html,
            attachments: getEmailAttachments(),
          });
        } catch (err) {
          ultimoError = err;
          const tipo = clasificarError(err);
          const motivo = `${err.code ?? ''} ${err.responseCode ?? ''} ${err.message}`.trim();

          await registrarFallo(cuenta, to, subject, err, tipo, motivo, idParticipacion);
          await aplicarConsecuencia(cuenta, tipo, motivo);

          if (tipo === TIPO_ERROR.DESTINATARIO) {
            // El problema es el correo de la persona: otra cuenta fallaría igual.
            throw err;
          }
          logger.warn(`Falló ${maskEmail(cuenta.correo)} (${tipo}); se intenta con otra cuenta.`);
          continue;
        }

        await registrarExito(cuenta, to, subject, info.messageId, idParticipacion);
        return { messageId: info.messageId, dryRun: false };
      }

      if (ultimoError) {
        throw ultimoError;
      }
      throw new SinCuentasDisponiblesError();
    },
  };
}
