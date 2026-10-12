import { QUESTIONS } from '../data/questions';

export function calculateFootprint(answers) {
  let rawTotal = 0;
  const rawBreakdown = {
    hogar: 0,
    transporte: 0,
    consumo: 0,
  };

  QUESTIONS.forEach((q) => {
    const userAnswer = answers[q.id];
    if (!userAnswer) return;

    if (q.type === 'checkbox' && Array.isArray(userAnswer)) {
      userAnswer.forEach((itemId) => {
        const opt = q.options.find((o) => o.id === itemId);
        if (opt) {
          rawTotal += opt.kgCO2;
          rawBreakdown[q.category] += opt.kgCO2;
        }
      });
    } else if (q.type === 'radio') {
      const opt = q.options.find((o) => o.id === userAnswer);
      if (opt) {
        rawTotal += opt.kgCO2;
        rawBreakdown[q.category] += opt.kgCO2;
      }
    } else if (q.type === 'matrix') {
      q.rows.forEach((row) => {
        const selectedCol = userAnswer[row.id];
        if (selectedCol && row.weights[selectedCol] !== undefined) {
          const val = row.weights[selectedCol];
          rawTotal += val;
          rawBreakdown[q.category] += val;
        }
      });
    }
  });

  // REDONDEO A 1 DECIMAL (Resuelve los decimales infinitos)
  const totalKg = Number(rawTotal.toFixed(1));
  const breakdown = {
    hogar: Number(rawBreakdown.hogar.toFixed(1)),
    transporte: Number(rawBreakdown.transporte.toFixed(1)),
    consumo: Number(rawBreakdown.consumo.toFixed(1)),
  };

  const treesNeeded = Math.round(totalKg / 58.5);
  const carKm = Math.round(totalKg / 0.19);

  let level = 'Bajo impacto';
  let levelBg = 'bg-green-500';

  if (totalKg > 4500) {
    level = 'Alto impacto';
    levelBg = 'bg-red-500';
  } else if (totalKg > 2000) {
    level = 'Impacto medio';
    levelBg = 'bg-yellow-500';
  }

  const recommendations = [];

  if (answers.focos === 'incandescentes' || answers.focos === 'no_se') {
    recommendations.push('Sustituye tus focos incandescentes por tecnología LED para reducir el consumo eléctrico.');
  }
  if (Array.isArray(answers.transporte) && answers.transporte.includes('auto')) {
    recommendations.push('Considera compartir auto o usar transporte público 1 o 2 días a la semana.');
  }
  if (answers.carne_matriz?.res === 'diario' || answers.carne_matriz?.res === '4_6_dias') {
    recommendations.push('Reduce el consumo diario de carne de res para disminuir las emisiones ganaderas.');
  }

  if (recommendations.length === 0) {
    recommendations.push('¡Excelente trabajo! Tus hábitos contribuyen a una menor huella ecológica.');
  }

  return {
    totalKg,
    breakdown,
    treesNeeded,
    carKm,
    level,
    levelBg,
    recommendations,
  };
}