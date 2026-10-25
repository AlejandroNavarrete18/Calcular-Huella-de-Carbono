/**
 * Recomendaciones de acción personalizadas según las respuestas.
 */

const TIPS = Object.freeze({
  led: 'Sustituye tus focos incandescentes por tecnología LED para reducir el consumo eléctrico.',
  carpool: 'Considera compartir auto o usar transporte público 1 o 2 días a la semana.',
  beef: 'Reduce el consumo de carne de res para disminuir las emisiones ganaderas.',
  keepGoing: '¡Excelente trabajo! Tus hábitos contribuyen a una menor huella ecológica.',
});

/**
 * @param {Record<string, unknown>} answers Respuestas del cuestionario.
 * @returns {string[]} Al menos una recomendación.
 */
export function buildRecommendations(answers) {
  const tips = [];

  if (answers.focos === 'incandescentes' || answers.focos === 'no_se') {
    tips.push(TIPS.led);
  }

  if (Array.isArray(answers.transporte) && answers.transporte.includes('auto')) {
    tips.push(TIPS.carpool);
  }

  const beef = answers.carne_matriz?.res;
  if (beef === 'diario' || beef === '4_6_dias') {
    tips.push(TIPS.beef);
  }

  if (tips.length === 0) {
    tips.push(TIPS.keepGoing);
  }
  return tips;
}
