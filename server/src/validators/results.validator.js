import { QUESTIONS } from '../shared/footprint.js';

/**
 * Validación de lo que envía el navegador. Regla de oro: todo lo que llega es
 * "no confiable". Aquí se comprueba forma, tipos, longitudes y que las
 * respuestas existan realmente en el cuestionario.
 */

const MAX_NAME_LENGTH = 60;
const MAX_EMAIL_LENGTH = 254; // límite del estándar de correo electrónico
// Caracteres de control (saltos de línea, tabuladores...). Se detectan a propósito: sirven para impedir
// "inyección de cabeceras" en correos.
// eslint-disable-next-line no-control-regex
const CONTROL_CHARS = /[\u0000-\u001F\u007F]/;
// eslint-disable-next-line no-control-regex
const CONTROL_CHARS_GLOBAL = /[\u0000-\u001F\u007F]/g;
// Forma razonable de un correo: sin espacios, comillas, comas ni caracteres peligrosos.
const EMAIL_PATTERN = /^[^\s@<>()[\],;:"\\]{1,64}@[^\s@<>()[\],;:"\\]+\.[^\s@<>()[\],;:"\\]{2,}$/;

const isPlainObject = (v) => v !== null && typeof v === 'object' && !Array.isArray(v);

export function sanitizeName(raw) {
  if (typeof raw !== 'string') return '';
  return raw.replace(CONTROL_CHARS_GLOBAL, ' ').replace(/\s+/g, ' ').trim().slice(0, MAX_NAME_LENGTH);
}

export function normalizeEmail(raw) {
  return typeof raw === 'string' ? raw.trim().toLowerCase() : '';
}

export function isValidEmail(email) {
  return email.length <= MAX_EMAIL_LENGTH && !CONTROL_CHARS.test(email) && EMAIL_PATTERN.test(email);
}

/**
 * Comprueba que `answers` contenga una respuesta válida para CADA pregunta.
 * Devuelve la lista de errores (vacía si todo está bien).
 */
export function validateAnswers(answers, questions = QUESTIONS) {
  if (!isPlainObject(answers)) return ['answers: debe ser un objeto'];

  const errors = [];
  for (const q of questions) {
    const value = answers[q.id];

    if (q.type === 'radio') {
      if (typeof value !== 'string' || !q.options.some((o) => o.id === value)) {
        errors.push(`${q.id}: respuesta inválida`);
      }
    } else if (q.type === 'checkbox') {
      const validIds = new Set(q.options.map((o) => o.id));
      const ok =
        Array.isArray(value) &&
        value.length > 0 &&
        value.length <= q.options.length &&
        new Set(value).size === value.length &&
        value.every((id) => typeof id === 'string' && validIds.has(id));
      if (!ok) errors.push(`${q.id}: respuesta inválida`);
    } else if (q.type === 'matrix') {
      const columnIds = new Set(q.columns.map((c) => c.id));
      const ok =
        isPlainObject(value) &&
        q.rows.every((row) => typeof value[row.id] === 'string' && columnIds.has(value[row.id]));
      if (!ok) errors.push(`${q.id}: respuesta inválida`);
    }
  }
  return errors;
}

/**
 * Valida el cuerpo de POST /api/results/email.
 * Devuelve { ok: false, errors } o { ok: true, value: { name, email, answers }, isBot }.
 */
export function validateEmailRequest(body) {
  if (!isPlainObject(body)) {
    return { ok: false, errors: [{ field: 'body', message: 'Se esperaba un JSON válido.' }] };
  }

  const errors = [];
  const email = normalizeEmail(body.email);
  if (!email) errors.push({ field: 'email', message: 'El correo electrónico es obligatorio.' });
  else if (!isValidEmail(email)) errors.push({ field: 'email', message: 'El correo electrónico no es válido.' });

  if (validateAnswers(body.answers).length) {
    errors.push({ field: 'answers', message: 'Las respuestas del cuestionario no son válidas o están incompletas.' });
  }

  if (errors.length) return { ok: false, errors };

  return {
    ok: true,
    // "website" es un campo trampa invisible para personas: si trae algo, es un bot.
    isBot: typeof body.website === 'string' && body.website.trim() !== '',
    value: { name: sanitizeName(body.name), email, answers: body.answers },
  };
}
