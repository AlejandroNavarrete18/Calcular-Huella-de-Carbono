/** Tipos de error de envío. Coinciden con el enum `envios_correo.tipo_error` de la base de datos. */
export const TIPO_ERROR = Object.freeze({
  CUOTA: 'cuota',
  CREDENCIALES: 'credenciales',
  DESTINATARIO: 'destinatario',
  TEMPORAL: 'temporal',
});

const PATRON_CUOTA = /quota|rate limit|limit exceeded|too many|5\.4\.5|4\.7\.0|daily user sending/i;
const PATRON_DESTINATARIO = /5\.1\.[123]|user unknown|no such user|invalid (recipient|address)|mailbox unavailable/i;

/** Error cuando ninguna cuenta puede enviar (todas llenas, bloqueadas o desactivadas). */
export class SinCuentasDisponiblesError extends Error {
  constructor() {
    super('No hay cuentas de correo disponibles: todas están llenas, pausadas o desactivadas.');
    this.name = 'SinCuentasDisponiblesError';
    this.code = 'NO_MAIL_ACCOUNTS';
  }
}

/**
 * Clasifica un error de Nodemailer/SMTP para decidir qué hacer con la cuenta:
 *   cuota        → la cuenta llegó al límite del proveedor: se pausa 24 h y se usa otra.
 *   credenciales → contraseña inválida o revocada: se desactiva y se usa otra.
 *   destinatario → el correo de la persona es inválido: no es culpa de la cuenta, no se reintenta.
 *   temporal     → red, timeout, etc.: se prueba con otra cuenta sin penalizar a esta.
 *
 * @param {Error & {code?: string, responseCode?: number, response?: string}} err
 * @returns {string} uno de TIPO_ERROR
 */
export function clasificarError(err) {
  const codigo = err?.code ?? '';
  const respuesta = Number(err?.responseCode) || 0;
  const texto = `${err?.response ?? ''} ${err?.message ?? ''}`;

  if (codigo === 'EAUTH' || respuesta === 535 || respuesta === 534) {
    return TIPO_ERROR.CREDENCIALES;
  }
  if (PATRON_CUOTA.test(texto)) {
    return TIPO_ERROR.CUOTA;
  }
  if (codigo === 'EENVELOPE' || PATRON_DESTINATARIO.test(texto)) {
    return TIPO_ERROR.DESTINATARIO;
  }
  return TIPO_ERROR.TEMPORAL;
}
