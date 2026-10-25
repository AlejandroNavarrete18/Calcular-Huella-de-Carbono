import { getAnswerErrors } from '@huella/shared';

/**
 * Validación de lo que envía el navegador.
 * Aquí se comprueba forma, tipos, longitudes y que las respuestas existan realmente en el cuestionario.
 */

const MAX_NAME_LENGTH = 60;
const MAX_EMAIL_LENGTH = 254; // límite del estándar de correo electrónico

// Caracteres de control (saltos de línea, tabuladores...). Se detectan a propósito: sirven para
// impedir la "inyección de cabeceras" en correos.
// eslint-disable-next-line no-control-regex
const CONTROL_CHARS = /[\u0000-\u001F\u007F]/;
// eslint-disable-next-line no-control-regex
const CONTROL_CHARS_GLOBAL = /[\u0000-\u001F\u007F]/g;

// Forma razonable de un correo: sin espacios, comillas, comas ni caracteres peligrosos.
// Acepta cualquier dominio (gmail.com, uas.edu.mx, empresa.com.mx...).
const EMAIL_PATTERN = /^[^\s@<>()[\],;:"\\]{1,64}@[^\s@<>()[\],;:"\\]+\.[^\s@<>()[\],;:"\\]{2,}$/;

const isPlainObject = (value) => value !== null && typeof value === 'object' && !Array.isArray(value);

/** Limpia el nombre: sin caracteres de control, espacios normalizados y longitud máxima. */
export function sanitizeName(raw) {
  if (typeof raw !== 'string') {
    return '';
  }
  return raw.replace(CONTROL_CHARS_GLOBAL, ' ').replace(/\s+/g, ' ').trim().slice(0, MAX_NAME_LENGTH);
}

/** Correo en minúsculas y sin espacios en los extremos*/
export function normalizeEmail(raw) {
  if (typeof raw !== 'string') {
    return '';
  }
  return raw.trim().toLowerCase();
}

/** ¿Tiene forma de correo válida y es seguro usarlo como destinatario? */
export function isValidEmail(email) {
  if (email.length > MAX_EMAIL_LENGTH || CONTROL_CHARS.test(email)) {
    return false;
  }
  return EMAIL_PATTERN.test(email);
}

/**
 * Valida el cuerpo de POST /api/results/email.
 *
 * @param {unknown} body Cuerpo ya interpretado como JSON.
 * @returns {{ok: false, errors: Array<{field: string, message: string}>}
 *   | {ok: true, isBot: boolean, value: {name: string, email: string, answers: object}}}
 */
export function validateEmailRequest(body) {
  if (!isPlainObject(body)) {
    return { ok: false, errors: [{ field: 'body', message: 'Se esperaba un JSON válido.' }] };
  }

  const errors = [];
  const email = normalizeEmail(body.email);

  if (!email) {
    errors.push({ field: 'email', message: 'El correo electrónico es obligatorio.' });
  } else if (!isValidEmail(email)) {
    errors.push({ field: 'email', message: 'El correo electrónico no es válido.' });
  }

  if (getAnswerErrors(body.answers).length > 0) {
    errors.push({ field: 'answers', message: 'Las respuestas del cuestionario no son válidas o están incompletas.' });
  }

  if (errors.length > 0) {
    return { ok: false, errors };
  }

  return {
    ok: true,
    // website es un campo trampa invisible para personas: si trae algo, es un bot.
    isBot: typeof body.website === 'string' && body.website.trim() !== '',
    value: { name: sanitizeName(body.name), email, answers: body.answers },
  };
}
