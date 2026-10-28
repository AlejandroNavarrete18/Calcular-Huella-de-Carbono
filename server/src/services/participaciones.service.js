import { calculateFootprint } from '@huella/shared';
import { badRequest } from '../utils/errors.js';
import { maskEmail } from '../utils/maskEmail.js';

/** Estado del correo que se informa a la persona. */
export const ESTADO_CORREO = Object.freeze({
  EN_COLA: 'queued', // se enviará en segundo plano
  NO_ENVIADO: 'not_sent', // no se intentó (límite de correos por destinatario)
});

const MENSAJES_REFERENCIA = Object.freeze({
  unidad: { field: 'idUnidadRegional', message: 'La unidad regional seleccionada no existe.' },
  municipio: { field: 'idMunicipio', message: 'El municipio seleccionado no existe.' },
  escuela: { field: 'idEscuelaFacultad', message: 'La escuela o facultad no pertenece a la unidad regional elegida.' },
});

/**
 * Servicio principal: guarda la participación con sus respuestas, calcula los resultados y envía el correo.
 *
 * Orden de las operaciones:
 *   1. Confirmar que unidad, municipio y escuela existen y son consistentes entre sí.
 *   2. Calcular los resultados EN EL SERVIDOR con los pesos de MySQL (nunca se confía en cifras del navegador).
 *   3. Guardar participación + respuestas en una transacción.
 *   4. Solo si todo se guardó, devolver los resultados y mandar el correo en segundo plano.
 *
 * El correo NO se espera dentro de la petición: si el SMTP tarda, la persona no queda esperando ni
 * reintenta (lo que duplicaría su participación).
 *
 * @param {object} deps
 * @param {ReturnType<import('../repositories/index.js').createRepositories>} deps.repositories
 * @param {ReturnType<import('./cuestionario.service.js').createCuestionarioService>} deps.cuestionarioService
 * @param {{sendResultsEmail: Function}} deps.mailService
 * @param {{tryConsume: Function, release: Function}} deps.recipientLimiter
 * @param {{info: Function, warn: Function, error: Function}} deps.logger
 */
export function createParticipacionesService({ repositories, cuestionarioService, mailService, recipientLimiter, logger }) {
  /** Envíos de correo en curso (para esperarlos al apagar el servidor). */
  const enviosPendientes = new Set();

  async function verificarReferencias(datos) {
    const existe = await repositories.catalogo.validarReferencias(datos);
    const errores = [];
    for (const clave of Object.keys(MENSAJES_REFERENCIA)) {
      if (!existe[clave]) {
        errores.push(MENSAJES_REFERENCIA[clave]);
      }
    }
    if (errores.length > 0) {
      throw badRequest('INVALID_REFERENCE', 'Revisa la unidad regional, el municipio y la escuela.', errores);
    }
  }

  async function enviarCorreo({ idParticipacion, nombre, correo, results }) {
    try {
      const envio = await mailService.sendResultsEmail({
        to: correo,
        name: nombre,
        results,
        idParticipacion,
      });
      // En modo dry-run no sale ningún correo real, así que no se marca como enviado.
      if (!envio.dryRun) {
        await repositories.participaciones.marcarCorreoEnviado(idParticipacion);
      }
      logger.info(`Resultados enviados a ${maskEmail(correo)}.`);
    } catch (error) {
      recipientLimiter.release(correo);
      logger.error(`No se pudo enviar el correo a ${maskEmail(correo)}:`, error.code ?? '', error.message);
    }
  }

  /** Lanza el envío sin esperarlo y lo registra como pendiente hasta que termine. */
  function enviarCorreoEnSegundoPlano(datos) {
    const tarea = enviarCorreo(datos).finally(() => enviosPendientes.delete(tarea));
    enviosPendientes.add(tarea);
  }

  return {
    /**
     * @param {object} datos Datos ya validados por el middleware (ver participacion.validator.js).
     * @param {{questions: object[], indice: Map}} cuestionario El cuestionario con el que se validó (req.cuestionario).
     * @returns {Promise<{results: object, email: {state: string, to: string}}>}
     * @throws {import('../utils/errors.js').HttpError} 400 si las referencias del catálogo no son válidas.
     */
    async registrar(datos, cuestionario) {
      await verificarReferencias(datos);

      const results = calculateFootprint(datos.answers, cuestionario.questions);
      const respuestas = cuestionarioService.mapearRespuestas(datos.answers, cuestionario);

      const idParticipacion = await repositories.participaciones.guardar({
        participacion: {
          nombre: datos.nombre,
          apellidos: datos.apellidos,
          correo: datos.correo,
          telefono: datos.telefono,
          fechaNacimiento: datos.fechaNacimiento,
          idUnidadRegional: datos.idUnidadRegional,
          idMunicipio: datos.idMunicipio,
          idEscuelaFacultad: datos.idEscuelaFacultad,
          localidadComunidad: datos.localidadComunidad,
          hogarKg: results.breakdown.hogar,
          transporteKg: results.breakdown.transporte,
          consumoKg: results.breakdown.consumo,
          totalKg: results.totalKg,
          nivel: results.levelKey,
          respuestasJson: JSON.stringify(datos.answers),
        },
        respuestas,
      });

      if (!recipientLimiter.tryConsume(datos.correo)) {
        logger.warn(`Correo no enviado a ${maskEmail(datos.correo)}: límite por destinatario alcanzado.`);
        return { results, email: { state: ESTADO_CORREO.NO_ENVIADO, to: datos.correo } };
      }

      enviarCorreoEnSegundoPlano({
        idParticipacion,
        nombre: `${datos.nombre} ${datos.apellidos}`,
        correo: datos.correo,
        results,
      });
      return { results, email: { state: ESTADO_CORREO.EN_COLA, to: datos.correo } };
    },

    /** Espera a que terminen los correos en curso (cierre ordenado del servidor). */
    async esperarEnvios() {
      await Promise.allSettled([...enviosPendientes]);
    },
  };
}
