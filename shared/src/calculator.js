import { QUESTIONS } from './questions.js';
import { getLevel, SEMAPHORE } from './levels.js';
import { buildRecommendations } from './recommendations.js';

/**
 * Cálculo de la huella de carbono.
 *   Hogar                   = P1 (suma de aparatos) + P2 (gas) + P3 (focos)
 *   Transporte              = P4 (PROMEDIO de los modos con peso >= 1) × P5 (horas) + P6 (vuelos)
 *   Alimentación y consumo  = P7 (carne) + P8 (plásticos) + P9 (ropa) + P10 (dispositivos)
 *   Barras por categoría    = suma / tope (854, 4080 y 2249 kg), máximo 100 %
 *   Termómetro              = total / 8000, máximo 98 %
 */

/** Tope de cada categoría para calcular el porcentaje de su barra. */
const CATEGORY_MAX_KG = Object.freeze({ hogar: 854, transporte: 4080, consumo: 2249 });
const THERMOMETER_MAX_KG = 8000;
const THERMOMETER_CAP_PERCENT = 98;

/** Índice de preguntas por id*/
const QUESTIONS_BY_ID = new Map(QUESTIONS.map((question) => [question.id, question]));

/** @returns {object} */
function getQuestion(id) {
  const question = QUESTIONS_BY_ID.get(id);
  if (!question) {
    throw new Error(`Pregunta desconocida: ${id}`);
  }
  return question;
}

/** Peso (kg CO2e/año) de una opción; 0 si la opción no existe o no tiene peso. */
function getOptionWeight(questionId, optionId) {
  const option = getQuestion(questionId).options.find((candidate) => candidate.id === optionId);
  if (!option || typeof option.kgCO2 !== 'number') {
    return 0;
  }
  return option.kgCO2;
}

/** Suma los pesos de las opciones marcadas en una pregunta de checkbox. */
function sumCheckboxWeights(answers, questionId) {
  const selected = answers[questionId];
  if (!Array.isArray(selected)) {
    return 0;
  }
  let total = 0;
  for (const optionId of selected) {
    total += getOptionWeight(questionId, optionId);
  }
  return total;
}

/** Peso de la opción elegida en una pregunta de opción única (radio). */
function getRadioWeight(answers, questionId) {
  return getOptionWeight(questionId, answers[questionId]);
}

/** Suma el peso elegido en cada fila de una pregunta matricial. */
function sumMatrixWeights(answers, questionId) {
  const selection = answers[questionId];
  if (!selection || typeof selection !== 'object') {
    return 0;
  }
  let total = 0;
  for (const row of getQuestion(questionId).rows) {
    const weight = row.weights[selection[row.id]];
    if (typeof weight === 'number') {
      total += weight;
    }
  }
  return total;
}

/**
 * Emisiones del trayecto diario (P4 × P5).
 */
function calculateCommute(answers) {
  const selected = answers.transporte;
  if (!Array.isArray(selected)) {
    return 0;
  }

  let sum = 0;
  let countedModes = 0;
  for (const modeId of selected) {
    const weight = getOptionWeight('transporte', modeId);
    sum += weight;
    if (weight >= 1) {
      countedModes += 1;
    }
  }
  if (countedModes === 0) {
    return 0;
  }

  const hoursOption = getQuestion('tiempo_recorrido').options.find(
    (candidate) => candidate.id === answers.tiempo_recorrido
  );
  if (!hoursOption) {
    return 0;
  }
  return (sum / countedModes) * hoursOption.hours;
}

/** Porcentaje entero (0-100) que representa `sum` respecto de `max`. */
function toPercent(sum, max) {
  return Math.min(Number((100 * (sum / max)).toFixed()), 100);
}

/** Color de la barra según el porcentaje que ocupa. */
function getBarColor(percent) {
  if (percent >= 76) {
    return SEMAPHORE.red;
  }
  if (percent >= 51) {
    return SEMAPHORE.orange;
  }
  if (percent >= 26) {
    return SEMAPHORE.yellow;
  }
  return SEMAPHORE.green;
}

const roundTwoDecimals = (value) => Number(value.toFixed(2));

/**
 * Calcula la huella de carbono a partir de las respuestas.
 *
 * @param {Record<string, unknown>} answers Respuestas del cuestionario (ver questions.js).
 * @returns {{
 *   totalKg: number,
 *   breakdown: {hogar: number, transporte: number, consumo: number},
 *   percentages: {hogar: number, transporte: number, consumo: number},
 *   barColors: {hogar: string, transporte: string, consumo: string},
 *   termoPercent: number,
 *   level: string, levelColor: string, title: string, description: string[],
 *   treesText: string, recommendations: string[]
 * }}
 */
export function calculateFootprint(answers) {
  const hogar =
    sumCheckboxWeights(answers, 'electrodomesticos') +
    getRadioWeight(answers, 'gas') +
    getRadioWeight(answers, 'focos');

  const transporte = calculateCommute(answers) + getRadioWeight(answers, 'vuelos');

  const consumo =
    sumMatrixWeights(answers, 'carne_matriz') +
    getRadioWeight(answers, 'plasticos') +
    getRadioWeight(answers, 'ropa') +
    sumMatrixWeights(answers, 'dispositivos_matriz');

  const total = hogar + transporte + consumo;
  const level = getLevel(total);

  const percentages = {
    hogar: toPercent(hogar, CATEGORY_MAX_KG.hogar),
    transporte: toPercent(transporte, CATEGORY_MAX_KG.transporte),
    consumo: toPercent(consumo, CATEGORY_MAX_KG.consumo),
  };

  return {
    totalKg: roundTwoDecimals(total),
    breakdown: {
      hogar: roundTwoDecimals(hogar),
      transporte: roundTwoDecimals(transporte),
      consumo: roundTwoDecimals(consumo),
    },
    percentages,
    barColors: {
      hogar: getBarColor(percentages.hogar),
      transporte: getBarColor(percentages.transporte),
      consumo: getBarColor(percentages.consumo),
    },
    termoPercent: Math.min(Number((100 * (total / THERMOMETER_MAX_KG)).toFixed()), THERMOMETER_CAP_PERCENT),
    level: level.name,
    levelColor: level.color,
    title: level.title,
    description: level.description,
    treesText: level.treesText,
    recommendations: buildRecommendations(answers),
  };
}
