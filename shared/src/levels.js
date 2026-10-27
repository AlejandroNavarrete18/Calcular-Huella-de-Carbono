/**
 * Niveles de impacto según la huella total anual (kg CO2e).
 */

/** Se usan en barras, termómetro y correo. */
export const SEMAPHORE = Object.freeze({
  green: '#1E8A4C',
  yellow: '#F4C430',
  orange: '#EF7D17',
  red: '#C4250F',
});

export const LEVELS = Object.freeze([
  {
    maxKg: 2000,
    name: 'Bajo impacto',
    color: SEMAPHORE.green,
    title: '¡Vas por buen camino!',
    treesText: 'Tus hábitos de consumo nos hacen ganar 66 árboles al año.',
    description: [
      '¡Felicidades! Eres muy responsable en tu consumo. Para ti el medio ambiente está presente en cada decisión de compra; el transporte que usas o cada que dices “sin plásticos, por favor”, pones bastante empeño en modificar tus hábitos y en impactar al planeta lo menos posible. Muchas gracias por ser un actor de cambio.',
      'Si todos consumieran como tú, podríamos combatir eficientemente el cambio climático y proteger ecosistemas y especies en todo el mundo. ¡Sigue así!',
    ],
  },
  {
    maxKg: 4000,
    name: 'Impacto medio',
    color: SEMAPHORE.yellow,
    title: '¡Aún puedes mejorar!',
    treesText: 'Tus emisiones equivalen a cortar 66 árboles al año.',
    description: [
      'Sabes que deberías usar más bici, planificar mejor tus compras, evitar plásticos desechables o comer más verduras de temporada, pero aún no logras llegar a tu meta. ¡No te desanimes! Lo positivo es que empiezas a modificar tus hábitos de consumo y que te importa disminuir tu impacto. Obtén más información y pregunta a quienes ya lograron un cambio.',
      'Si todos consumieran como tú la lucha contra el cambio climático sería un poco más dura de sortear. ¡Es tu momento para ser un actor de cambio!',
    ],
  },
  {
    maxKg: 6000,
    name: 'Alto impacto',
    color: SEMAPHORE.orange,
    title: '¡Tus hábitos hacen peligrar el planeta!',
    treesText: 'Tus emisiones equivalen a cortar 99 árboles al año.',
    description: [
      'Cada compra que haces, cada decisión sobre tu alimentación o el transporte que usas impacta positiva o negativamente al mundo y si no hacemos conciencia, preservar nuestro planeta y las especies que viven en él será extremadamente difícil. Piensas poco en el costo ambiental de tus hábitos de consumo y aunque logras pequeños cambios no logras mantenerte motivado.',
      'Si todos consumieran como tú, el cambio climático nos llevaría ventaja y perderíamos biodiversidad y ecosistemas a mayor velocidad. ¡Es momento de cambiar! Enfócate en pequeños cambios, un paso a la vez.',
    ],
  },
  {
    maxKg: Infinity,
    name: 'Impacto muy alto',
    color: SEMAPHORE.red,
    title: '¡Tus hábitos devastan el planeta!',
    treesText: 'Tus emisiones equivalen a cortar más de 100 árboles al año.',
    description: [
      '¿Has pensado que tus actividades diarias afectan al planeta y que está en tus manos evitarlo? Tus hábitos de consumo están por arriba del promedio en México, lo que significa que si todos consumieran como tú, necesitaríamos muchos planetas para soportar el ritmo de consumo que estaríamos llevando, perderíamos miles de especies, ecosistemas y la lucha por el cambio climático sería muy difícil de sortear.',
      'El medio ambiente no es algo que tengas presente al decidir adquirir algo, usar algún tipo de transporte o alimentarte diariamente, ya que priorizas la comodidad. ¡Aún puedes cambiar! Empieza hoy.',
    ],
  },
]);

/**
 * Devuelve el nivel que corresponde a una huella total.
 * @param {number} totalKg Huella total anual en kg CO2e.
 * @returns {typeof LEVELS[number]}
 */
export function getLevel(totalKg) {
  for (const level of LEVELS) {
    if (totalKg <= level.maxKg) {
      return level;
    }
  }
  return LEVELS[LEVELS.length - 1];
}
