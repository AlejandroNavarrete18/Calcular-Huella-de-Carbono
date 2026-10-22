import { QUESTIONS } from '../data/questions.js';
// - Hogar        = P1 (suma de aparatos) + P2 (gas) + P3 (focos)
// - Transporte   = P4 (PROMEDIO de los modos con peso >= 1) × P5 (horas) + P6 (vuelos)
// - Consumo      = P7 (carne) + P8 (plásticos) + P9 (ropa) + P10 (dispositivos)
// - Barras por categoría: suma / 854 (hogar), / 4080 (transporte), / 2249 (consumo), tope 100 %
// - Termometro: total / 8000, tope 98 %
// - Niveles: <=2000, 2001-4000, 4001-6000, >6000 kg CO2e.

const MAX_HOME = 854;
const MAX_TRANSPORT = 4080;
const MAX_CONSUMPTION = 2249;
const MAX_TOTAL = 8000;

const COLORS = { green: '#1E8A4C', yellow: '#F4C430', orange: '#EF7D17', red: '#C4250F' };

function barColor(pct) {
  if (pct >= 76) return COLORS.red;
  if (pct >= 51) return COLORS.orange;
  if (pct >= 26) return COLORS.yellow;
  return COLORS.green;
}

function pct(sum, max) {
  return Math.min(Number((100 * (sum / max)).toFixed()), 100);
}

const LEVELS = [
  {
    max: 2000,
    level: 'Bajo impacto',
    title: 'RESULTADO: ¡Vas por buen camino!',
    treesText: 'Tus hábitos de consumo nos hacen ganar 66 árboles al año.',
    description: [
      '¡Felicidades! Eres muy responsable en tu consumo. Para ti el medio ambiente está presente en cada decisión de compra; el transporte que usas o cada que dices “sin plásticos, por favor”, pones bastante empeño en modificar tus hábitos y en impactar al planeta lo menos posible. Muchas gracias por ser un actor de cambio.',
      'Si todos consumieran como tú, podríamos combatir eficientemente el cambio climático y proteger ecosistemas y especies en todo el mundo. ¡Sigue así!',
    ],
  },
  {
    max: 4000,
    level: 'Impacto medio',
    title: 'RESULTADO: ¡Aún puedes mejorar!',
    treesText: 'Tus emisiones equivalen a cortar 66 árboles al año.',
    description: [
      'Sabes que deberías usar más bici, planificar mejor tus compras, evitar plásticos desechables o comer más verduras de temporada, pero aún no logras llegar a tu meta. ¡No te desanimes! Lo positivo es que empiezas a modificar tus hábitos de consumo y que te importa disminuir tu impacto. Obtén más información y pregunta a quienes ya lograron un cambio.',
      'Si todos consumieran como tú la lucha contra el cambio climático sería un poco más dura de sortear. ¡Es tu momento para ser un actor de cambio!',
    ],
  },
  {
    max: 6000,
    level: 'Alto impacto',
    title: 'RESULTADO: ¡Tus hábitos hacen peligrar el planeta!',
    treesText: 'Tus emisiones equivalen a cortar 99 árboles al año.',
    description: [
      'Cada compra que haces, cada decisión sobre tu alimentación o el transporte que usas impacta positiva o negativamente al mundo y si no hacemos conciencia, preservar nuestro planeta y las especies que viven en él será extremadamente difícil. Piensas poco en el costo ambiental de tus hábitos de consumo y aunque logras pequeños cambios no logras mantenerte motivado.',
      'Si todos consumieran como tú, el cambio climático nos llevaría ventaja y perderíamos biodiversidad y ecosistemas a mayor velocidad. ¡Es momento de cambiar! Enfócate en pequeños cambios, un paso a la vez.',
    ],
  },
  {
    max: Infinity,
    level: 'Impacto muy alto',
    title: 'RESULTADO: ¡Tus hábitos devastan el planeta!',
    treesText: 'Tus emisiones equivalen a cortar más de 100 árboles al año.',
    description: [
      '¿Has pensado que tus actividades diarias afectan al planeta y que está en tus manos evitarlo? Tus hábitos de consumo están por arriba del promedio en México, lo que significa que si todos consumieran como tú, necesitaríamos muchos planetas para soportar el ritmo de consumo que estaríamos llevando, perderíamos miles de especies, ecosistemas y la lucha por el cambio climático sería muy difícil de sortear.',
      'El medio ambiente no es algo que tengas presente al decidir adquirir algo, usar algún tipo de transporte o alimentarte diariamente, ya que priorizas la comodidad. ¡Aún puedes cambiar! Empieza hoy.',
    ],
  },
];

const round2 = (n) => Number(n.toFixed(2));

export function calculateFootprint(answers) {
  const q = (id) => QUESTIONS.find((x) => x.id === id);

  const sumChecked = (id) =>
    (Array.isArray(answers[id]) ? answers[id] : []).reduce(
      (acc, optId) => acc + (q(id).options.find((o) => o.id === optId)?.kgCO2 ?? 0),
      0
    );

  const radioValue = (id) => q(id).options.find((o) => o.id === answers[id])?.kgCO2 ?? 0;

  const matrixSum = (id) => {
    const sel = answers[id] || {};
    return q(id).rows.reduce((acc, row) => acc + (row.weights[sel[row.id]] ?? 0), 0);
  };

  // ── HOGAR ──
  const hogar = sumChecked('electrodomesticos') + radioValue('gas') + radioValue('focos');

  // ── TRANSPORTE ──
  // Promedio de los modos seleccionados con peso >= 1 (bici, metro y caminar no cuentan)
  const picked = (Array.isArray(answers.transporte) ? answers.transporte : [])
    .map((id) => q('transporte').options.find((o) => o.id === id)?.kgCO2 ?? 0);
  const counted = picked.filter((v) => v >= 1);
  const transportTotal = picked.reduce((a, b) => a + b, 0);
  const hours = q('tiempo_recorrido').options.find((o) => o.id === answers.tiempo_recorrido)?.hours ?? 0;
  const commute = counted.length >= 1 ? (transportTotal / counted.length) * hours : 0;
  const transporte = commute + radioValue('vuelos');

  // ── CONSUMO 
  const consumo =
    matrixSum('carne_matriz') + radioValue('plasticos') + radioValue('ropa') + matrixSum('dispositivos_matriz');

  const total = hogar + transporte + consumo;
  const band = LEVELS.find((l) => total <= l.max);

  const percentages = {
    hogar: pct(hogar, MAX_HOME),
    transporte: pct(transporte, MAX_TRANSPORT),
    consumo: pct(consumo, MAX_CONSUMPTION),
  };
  const termoPercent = Math.min(Number((100 * (total / MAX_TOTAL)).toFixed()), 98);

  // Recomendaciones 
  const recommendations = [];
  if (answers.focos === 'incandescentes' || answers.focos === 'no_se') {
    recommendations.push('Sustituye tus focos incandescentes por tecnología LED para reducir el consumo eléctrico.');
  }
  if (Array.isArray(answers.transporte) && answers.transporte.includes('auto')) {
    recommendations.push('Considera compartir auto o usar transporte público 1 o 2 días a la semana.');
  }
  if (answers.carne_matriz?.res === 'diario' || answers.carne_matriz?.res === '4_6_dias') {
    recommendations.push('Reduce el consumo de carne de res para disminuir las emisiones ganaderas.');
  }
  if (recommendations.length === 0) {
    recommendations.push('¡Excelente trabajo! Tus hábitos contribuyen a una menor huella ecológica.');
  }

  return {
    totalKg: round2(total),
    breakdown: { hogar: round2(hogar), transporte: round2(transporte), consumo: round2(consumo) },
    percentages,
    barColors: {
      hogar: barColor(percentages.hogar),
      transporte: barColor(percentages.transporte),
      consumo: barColor(percentages.consumo),
    },
    termoPercent,
    levelColor: total <= 2000 ? COLORS.green : total <= 4000 ? COLORS.yellow : total <= 6000 ? COLORS.orange : COLORS.red,
    level: band.level,
    title: band.title,
    description: band.description,
    treesText: band.treesText,
    recommendations,
  };
}
