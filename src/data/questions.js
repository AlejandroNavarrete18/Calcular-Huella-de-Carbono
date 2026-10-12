export const QUESTIONS = [
  // Preguntas 1 a 6 se mantienen igual...
  {
    id: 'electrodomesticos',
    category: 'hogar',
    number: 1,
    title: '1. ¿QUÉ APARATOS ELECTRÓNICOS TIENES EN CASA?',
    subtitle: 'SELECCIONA TODOS LOS QUE TENGAS',
    type: 'checkbox',
    options: [
      { id: 'refrigerador', label: 'Refrigerador', kgCO2: 120 },
      { id: 'microondas', label: 'Horno de microondas', kgCO2: 40 },
      { id: 'computadora', label: 'Computadora', kgCO2: 60 },
      { id: 'laptop', label: 'Laptop', kgCO2: 30 },
      { id: 'consola', label: 'Consola de videojuegos', kgCO2: 50 },
      { id: 'estereo', label: 'Estéreo', kgCO2: 30 },
      { id: 'tv', label: 'Televisión', kgCO2: 70 },
      { id: 'lavadora', label: 'Lavadora', kgCO2: 80 },
      { id: 'secadora', label: 'Secadora de ropa', kgCO2: 150 },
      { id: 'lavatrastes', label: 'Lavatrastes', kgCO2: 100 },
      { id: 'aspiradora', label: 'Aspiradora', kgCO2: 40 },
      { id: 'aire', label: 'Aire acondicionado', kgCO2: 250 },
      { id: 'ventiladores', label: 'Ventiladores', kgCO2: 30 },
    ],
  },
  {
    id: 'gas',
    category: 'hogar',
    number: 2,
    title: '2. EN MI DOMICILIO UTILIZO:',
    type: 'radio',
    options: [
      { id: 'gas_natural', label: 'Gas natural', kgCO2: 200 },
      { id: 'gas_lp', label: 'Gas LP', kgCO2: 280 },
    ],
  },
  {
    id: 'focos',
    category: 'hogar',
    number: 3,
    title: '3. EN MI CASA LOS FOCOS SON:',
    type: 'radio',
    options: [
      { id: 'led', label: 'LED', kgCO2: 15 },
      { id: 'ahorradores', label: 'Ahorradores', kgCO2: 35 },
      { id: 'incandescentes', label: 'Incandescentes', kgCO2: 120 },
      { id: 'no_se', label: 'No lo sé', kgCO2: 50 },
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
      { id: 'auto', label: 'Auto', kgCO2: 1200 },
      { id: 'autobus', label: 'Autobús', kgCO2: 300 },
      { id: 'bicicleta', label: 'Bicicleta', kgCO2: 0 },
      { id: 'combi', label: 'Combi', kgCO2: 250 },
      { id: 'metro', label: 'Metro', kgCO2: 150 },
      { id: 'metrobus', label: 'Metrobús', kgCO2: 150 },
      { id: 'motocicleta', label: 'Motocicleta', kgCO2: 600 },
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
      { id: 'menos_10', label: 'Menos de 10 minutos', kgCO2: 120 },
      { id: '10_20', label: 'Entre 10 y 20 minutos', kgCO2: 350 },
      { id: '20_40', label: 'Entre 20 y 40 minutos', kgCO2: 680 },
      { id: '40_60', label: 'Entre 40 minutos y 1 hora', kgCO2: 1050 },
      { id: 'hora_media', label: 'Una hora y media', kgCO2: 1450 },
      { id: 'mas_2_horas', label: 'Más de dos horas', kgCO2: 1950 },
      { id: 'mas_3_horas', label: 'Más de tres horas', kgCO2: 2204.64 }, // <-- CAMBIAR AQUÍ (2204.64 en lugar de 2274.64)
    ],
  },

  // PREGUNTA 6: VUELOS (Valores exactos de Greenpeace)
  {
    id: 'vuelos',
    category: 'transporte',
    number: 6,
    title: '6. ¿CON QUÉ FRECUENCIA VUELAS EN AVIÓN?',
    type: 'radio',
    options: [
      { id: 'frecuente', label: 'Viajero frecuente (más de dos vuelos int. y dos nac. al año)', kgCO2: 4074.64 },
      { id: 'int_1', label: 'Aproximadamente un vuelo (ida y vuelta) internacional al año', kgCO2: 1800 },
      { id: 'nac_mas_1', label: 'Más de un vuelo (ida y vuelta) nacional al año', kgCO2: 850 },
      { id: 'nac_1', label: 'Aproximadamente un vuelo (ida y vuelta) nacional al año', kgCO2: 420 },
      { id: 'no_vuelo', label: 'No suelo volar', kgCO2: 0 },
    ],
  },

  // PREGUNTA 7 MATRICIAL
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
      { id: 'res', label: 'Res', weights: { diario: 1478.25, '4_6_dias': 1053.0, '1_3_dias': 421.2, no_consumo: 0 } },
      { id: 'cerdo', label: 'Cerdo', weights: { diario: 662.48, '4_6_dias': 471.9, '1_3_dias': 188.76, no_consumo: 0 } },
      { id: 'pollo', label: 'Pollo', weights: { diario: 377.78, '4_6_dias': 269.1, '1_3_dias': 107.64, no_consumo: 0 } },
      { id: 'pescado', label: 'Pescado', weights: { diario: 295.65, '4_6_dias': 210.6, '1_3_dias': 84.24, no_consumo: 0 } },
    ],
  },

  {
    id: 'plasticos',
    category: 'consumo',
    number: 8,
    title: '8. ¿CON QUÉ REGULARIDAD UTILIZAS PLÁSTICOS DE UN SOLO USO?',
    type: 'radio',
    options: [
      { id: 'diario', label: 'Diario', kgCO2: 300 },
      { id: 'semanal', label: 'De vez en cuando (1 vez por semana)', kgCO2: 160.5 }, // <-- Cambiar 100 por 160.5
      { id: 'rara_vez', label: 'Rara vez', kgCO2: 40 },
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
      { id: 'nueva_importada', label: 'Siempre es nueva y de importación', kgCO2: 400 },
      { id: 'nueva_nacional', label: 'Siempre es nueva y nacional', kgCO2: 200 },
      { id: 'segunda_mano', label: 'De segunda mano', kgCO2: 50 },
      { id: 'reparo', label: 'La reparo y reutilizo', kgCO2: 20 },
    ],
  },

  // PREGUNTA 10 MATRICIAL
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
      { id: 'celular', label: 'Celular', weights: { cada_6_meses: 70.0, cada_ano: 35.0, '2_3_anos': 14.0, mas_3_anos: 8.75, no_tengo: 0 } },
      { id: 'tableta', label: 'Tableta', weights: { cada_6_meses: 180.0, cada_ano: 90.0, '2_3_anos': 36.0, mas_3_anos: 22.5, no_tengo: 0 } },
      { id: 'computadora', label: 'Computadora', weights: { cada_6_meses: 700.0, cada_ano: 350.0, '2_3_anos': 140.0, mas_3_anos: 87.5, no_tengo: 0 } },
      { id: 'consola', label: 'Consola de videojuegos', weights: { cada_6_meses: 300.0, cada_ano: 150.0, '2_3_anos': 60.0, mas_3_anos: 37.5, no_tengo: 0 } },
    ],
  },
];