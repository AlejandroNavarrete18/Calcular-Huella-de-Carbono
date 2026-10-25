/**
 * Catálogo del cuestionario: preguntas, opciones y pesos.
 * Este archivo es solo datos: la lógica esta en calculator.js.
 *
 * @type {ReadonlyArray<object>}
 */
export const QUESTIONS = [
  // PREGUNTA 1: ELECTRODOMESTICOS UTILIZADOS 
  {
    id: 'electrodomesticos',
    category: 'hogar',
    number: 1,
    title: '1. ¿QUÉ APARATOS ELECTRÓNICOS TIENES EN CASA?',
    subtitle: 'SELECCIONA TODOS LOS QUE TENGAS',
    type: 'checkbox',
    options: [
      { id: 'refrigerador', label: 'Refrigerador', kgCO2: 237 },
      { id: 'microondas', label: 'Horno de microondas', kgCO2: 19.6 },
      { id: 'computadora', label: 'Computadora', kgCO2: 128 },
      { id: 'laptop', label: 'Laptop', kgCO2: 64 },
      { id: 'consola', label: 'Consola de videojuegos', kgCO2: 20 },
      { id: 'estereo', label: 'Estéreo', kgCO2: 3 },
      { id: 'tv', label: 'Televisión', kgCO2: 82 },
      { id: 'lavadora', label: 'Lavadora', kgCO2: 21 },
      { id: 'secadora', label: 'Secadora de ropa', kgCO2: 57 },
      { id: 'lavatrastes', label: 'Lavatrastes', kgCO2: 68 },
      { id: 'aspiradora', label: 'Aspiradora', kgCO2: 35 },
      { id: 'aire', label: 'Aire acondicionado', kgCO2: 227 },
      { id: 'ventiladores', label: 'Ventiladores', kgCO2: 96 },
    ],
  },
  {
    id: 'gas',
    category: 'hogar',
    number: 2,
    title: '2. EN MI DOMICILIO UTILIZO:',
    type: 'radio',
    options: [
      { id: 'gas_natural', label: 'Gas natural', kgCO2: 189 },
      { id: 'gas_lp', label: 'Gas LP', kgCO2: 153 },
    ],
  },
  {
    id: 'focos',
    category: 'hogar',
    number: 3,
    title: '3. EN MI CASA LOS FOCOS SON:',
    type: 'radio',
    options: [
      { id: 'led', label: 'LED', kgCO2: 12 },
      { id: 'ahorradores', label: 'Ahorradores', kgCO2: 31 },
      { id: 'incandescentes', label: 'Incandescentes', kgCO2: 61 },
      { id: 'no_se', label: 'No lo sé', kgCO2: 35 },
    ],
  },
  {
    id: 'transporte',
    category: 'transporte',
    number: 4,
    title: '4. ¿CÓMO TE TRANSPORTAS PARA IR AL TRABAJO O A LA ESCUELA?',
    subtitle: 'SELECCIONA LAS OPCIONES QUE APLIQUEN',
    type: 'checkbox',
    options: [
      { id: 'auto', label: 'Auto', kgCO2: 4160 },
      { id: 'autobus', label: 'Autobús', kgCO2: 310 },
      { id: 'bicicleta', label: 'Bicicleta', kgCO2: 0 },
      { id: 'combi', label: 'Combi', kgCO2: 1090 },
      { id: 'metro', label: 'Metro', kgCO2: 0 },
      { id: 'metrobus', label: 'Metrobús', kgCO2: 90 },
      { id: 'motocicleta', label: 'Motocicleta', kgCO2: 2080 },
      { id: 'caminando', label: 'Voy caminando', kgCO2: 0 },
    ],
  },
// PREGUNTA 5: TIEMPO DE RECORRIDO
  {
    id: 'tiempo_recorrido',
    category: 'transporte',
    number: 5,
    title: '5. ¿EN CUÁNTO TIEMPO HACES ESE RECORRIDO?',
    type: 'radio',
    options: [
      { id: 'menos_10', label: 'Menos de 10 minutos', hours: 0.08 },
      { id: '10_20', label: 'Entre 10 y 20 minutos', hours: 0.25 },
      { id: '20_40', label: 'Entre 20 y 40 minutos', hours: 0.5 },
      { id: '40_60', label: 'Entre 40 minutos y 1 hora', hours: 0.83 },
      { id: 'hora_media', label: 'Una hora y media', hours: 1.5 },
      { id: 'mas_2_horas', label: 'Más de dos horas', hours: 2.5 },
      { id: 'mas_3_horas', label: 'Más de tres horas', hours: 3.5 },
    ],
  },
  {
    id: 'vuelos',
    category: 'transporte',
    number: 6,
    title: '6. ¿CON QUÉ FRECUENCIA VUELAS EN AVIÓN?',
    type: 'radio',
    options: [
      { id: 'frecuente', label: 'Viajero frecuente (más de dos vuelos int. y dos nac. al año)', kgCO2: 4600 },
      { id: 'int_1', label: 'Aproximadamente un vuelo (ida y vuelta) internacional al año', kgCO2: 2000 },
      { id: 'nac_mas_1', label: 'Más de un vuelo (ida y vuelta) nacional al año', kgCO2: 500 },
      { id: 'nac_1', label: 'Aproximadamente un vuelo (ida y vuelta) nacional al año', kgCO2: 200 },
      { id: 'no_vuelo', label: 'No suelo volar', kgCO2: 0 },
    ],
  },

  // PREGUNTA 7 FRECUENCIA CONSUMO DE CARNE (MATRIZ)
  {
    id: 'carne_matriz',
    category: 'consumo',
    number: 7,
    title: '7. ¿CON QUÉ FRECUENCIA COMES CARNE DE?',
    type: 'matrix',
    columns: [
      { id: 'diario', label: 'Diario' },
      { id: '4_6_dias', label: '4-6 días a la semana' },
      { id: '1_3_dias', label: '1-3 días a la semana' },
      { id: 'no_consumo', label: 'No consumo' },
    ],
    rows: [
      { id: 'res', label: 'Res', weights: { diario: 2360, '4_6_dias': 1865, '1_3_dias': 675, no_consumo: 0 } },
      { id: 'cerdo', label: 'Cerdo', weights: { diario: 540, '4_6_dias': 386, '1_3_dias': 155, no_consumo: 0 } },
      { id: 'pollo', label: 'Pollo', weights: { diario: 344, '4_6_dias': 245, '1_3_dias': 98, no_consumo: 0 } },
      { id: 'pescado', label: 'Pescado', weights: { diario: 128, '4_6_dias': 91, '1_3_dias': 37, no_consumo: 0 } },
    ],
  },

  {
    id: 'plasticos',
    category: 'consumo',
    number: 8,
    title: '8. ¿CON QUÉ REGULARIDAD UTILIZAS PLÁSTICOS DE UN SOLO USO?',
    type: 'radio',
    options: [
      { id: 'diario', label: 'Diario', kgCO2: 8 },
      { id: 'semanal', label: 'De vez en cuando (1 vez por semana)', kgCO2: 3 }, 
      { id: 'rara_vez', label: 'Rara vez', kgCO2: 1 },
      { id: 'no_uso', label: 'No uso plástico', kgCO2: 0 },
    ],
  },
  {
    id: 'ropa',
    category: 'consumo',
    number: 9,
    title: '9. LA ROPA QUE UTILIZO:',
    type: 'radio',
    options: [
      { id: 'nueva_importada', label: 'Siempre es nueva y de importación', kgCO2: 403 },
      { id: 'nueva_nacional', label: 'Siempre es nueva y nacional', kgCO2: 254 },
      { id: 'segunda_mano', label: 'De segunda mano', kgCO2: 127 },
      { id: 'reparo', label: 'La reparo y reutilizo', kgCO2: 85 },
    ],
  },

  // PREGUNTA 10 DISPOSITIVOS ELECTRÓNICOS (MATRIZ)
  {
    id: 'dispositivos_matriz',
    category: 'consumo',
    number: 10,
    title: '10. CADA CUÁNTO CAMBIO MIS DISPOSITIVOS ELECTRÓNICOS',
    type: 'matrix',
    columns: [
      { id: 'cada_6_meses', label: 'Cada 6 meses' },
      { id: 'cada_ano', label: 'Cada año' },
      { id: '2_3_anos', label: 'De 2 a 3 años' },
      { id: 'mas_3_anos', label: 'Más de 3 años' },
      { id: 'no_tengo', label: 'No tengo este dispositivo' },
    ],
    rows: [
      { id: 'celular', label: 'Celular', weights: { cada_6_meses: 120, cada_ano: 60, '2_3_anos': 25, mas_3_anos: 15, no_tengo: 0 } },
      { id: 'tableta', label: 'Tableta', weights: { cada_6_meses: 340, cada_ano: 170, '2_3_anos': 68, mas_3_anos: 43, no_tengo: 0 } },
      { id: 'computadora', label: 'Computadora', weights: { cada_6_meses: 700, cada_ano: 350, '2_3_anos': 140, mas_3_anos: 88, no_tengo: 0 } },
      { id: 'consola', label: 'Consola de videojuegos', weights: { cada_6_meses: 180, cada_ano: 90, '2_3_anos': 36, mas_3_anos: 22, no_tengo: 0 } },
    ],
  },
];