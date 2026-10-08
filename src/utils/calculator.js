import { QUESTIONS } from '../data/questions';

export function calculateFootprint(answers) {
  let totalKg = 0;
  const breakdown = {
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
          totalKg += opt.kgCO2;
          breakdown[q.category] += opt.kgCO2;
        }
      });
    } else if (q.type === 'radio') {
      const opt = q.options.find((o) => o.id === userAnswer);
      if (opt) {
        totalKg += opt.kgCO2;
        breakdown[q.category] += opt.kgCO2;
      }
    }
  });

  // Equivalencias
  const treesNeeded = Math.round(totalKg / 20); // 1 árbol absorbe ~20kg CO2/año
  const carKm = Math.round(totalKg / 0.19);      // ~0.19kg por km recorrido

  // Nivel de impacto y colores del termómetro
  let level = 'Bajo impacto';
  let levelBg = 'bg-green-500';

  if (totalKg > 4500) {
    level = 'Alto impacto';
    levelBg = 'bg-red-500';
  } else if (totalKg > 2000) {
    level = 'Impacto medio';
    levelBg = 'bg-yellow-500';
  }

  // Recomendaciones personalizadas
  const recommendations = [];

  if (answers.focos === 'incandescentes' || answers.focos === 'no_se') {
    recommendations.push('Sustituye tus focos incandescentes por tecnología LED para reducir hasta un 80% el consumo eléctrico en iluminación.');
  }
  if (Array.isArray(answers.transporte) && answers.transporte.includes('auto')) {
    recommendations.push('Considera compartir auto (carpooling) o usar transporte público 1 o 2 días a la semana.');
  }
  if (answers.carne === 'diario' || answers.carne === '4_6_dias') {
    recommendations.push('Implementa la iniciativa "Lunes sin carne" para reducir significativamente las emisiones derivadas de la producción ganadera.');
  }
  if (answers.plasticos === 'diario') {
    recommendations.push('Lleva contigo termos o bolsas reutilizables para evitar plásticos de un solo uso.');
  }

  if (recommendations.length === 0) {
    recommendations.push('¡Excelente trabajo! Tus hábitos actuales contribuyen activamente a un menor impacto ambiental.');
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