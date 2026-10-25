import { QUESTIONS } from './questions.js';

/**
 * Utilidades para revisar respuestas del cuestionario.
 */

const isPlainObject = (value) => value !== null && typeof value === 'object' && !Array.isArray(value);

/**
 * Está respondida esta pregunta?
 *
 * @param {object} question Pregunta de QUESTIONS.
 * @param {unknown} answer Respuesta guardada para esa pregunta.
 * @returns {boolean}
 */
export function isQuestionAnswered(question, answer) {
  if (!question) {
    return false;
  }
  if (question.type === 'radio') {
    return Boolean(answer);
  }
  if (question.type === 'checkbox') {
    return Array.isArray(answer) && answer.length > 0;
  }
  if (question.type === 'matrix') {
    if (!isPlainObject(answer)) {
      return false;
    }
    return question.rows.every((row) => Boolean(answer[row.id]));
  }
  return false;
}

/** La respuesta de un radio es una opción que existe? */
function isValidRadio(question, value) {
  return typeof value === 'string' && question.options.some((option) => option.id === value);
}

/** La respuesta de un checkbox es una lista no vacía, sin repetidos y solo con opciones válidas? */
function isValidCheckbox(question, value) {
  if (!Array.isArray(value) || value.length === 0 || value.length > question.options.length) {
    return false;
  }
  if (new Set(value).size !== value.length) {
    return false;
  }
  const validIds = new Set(question.options.map((option) => option.id));
  return value.every((id) => typeof id === 'string' && validIds.has(id));
}

/** La respuesta de una matriz tiene una columna válida para CADA fila? */
function isValidMatrix(question, value) {
  if (!isPlainObject(value)) {
    return false;
  }
  const columnIds = new Set(question.columns.map((column) => column.id));
  return question.rows.every((row) => typeof value[row.id] === 'string' && columnIds.has(value[row.id]));
}

/**
 * Validación ESTRICTA de todas las respuestas (para datos no confiables, como los del navegador).
 * Exige una respuesta válida para cada pregunta.
 *
 * @param {unknown} answers
 * @param {ReadonlyArray<object>} [questions=QUESTIONS]
 * @returns {string[]} Lista de errores; vacía si todo es válido.
 */
export function getAnswerErrors(answers, questions = QUESTIONS) {
  if (!isPlainObject(answers)) {
    return ['answers: debe ser un objeto'];
  }

  const errors = [];
  for (const question of questions) {
    const value = answers[question.id];
    let valid = false;

    if (question.type === 'radio') {
      valid = isValidRadio(question, value);
    } else if (question.type === 'checkbox') {
      valid = isValidCheckbox(question, value);
    } else if (question.type === 'matrix') {
      valid = isValidMatrix(question, value);
    }

    if (!valid) {
      errors.push(`${question.id}: respuesta inválida`);
    }
  }
  return errors;
}
