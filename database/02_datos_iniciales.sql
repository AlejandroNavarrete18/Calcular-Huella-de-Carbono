-- =====================================================================
--  Datos iniciales (generados desde shared/src/questions.js)
--  Ejecutar DESPUÉS de 01_esquema.sql:
--    mysql -u root -p huella_carbono < 02_datos_iniciales.sql
-- =====================================================================

USE huella_carbono;
-- Misma collation que las tablas (evita "Illegal mix of collations" en los JOIN de abajo)
SET NAMES utf8mb4 COLLATE utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
--  Unidades Regionales (editables desde el panel de administrador).
--  Los municipios y escuelas/facultades se agregan desde el panel.
-- ---------------------------------------------------------------------
INSERT INTO unidades_regionales (nombre) VALUES
  ('Unidad Regional Norte'),
  ('Unidad Regional Centro Norte'),
  ('Unidad Regional Centro'),
  ('Unidad Regional Sur');

-- ---------------------------------------------------------------------
--  Cuestionario: preguntas
-- ---------------------------------------------------------------------
INSERT INTO preguntas (clave, numero, categoria, titulo, subtitulo, tipo) VALUES ('electrodomesticos', 1, 'hogar', '1. ¿QUÉ APARATOS ELECTRÓNICOS TIENES EN CASA?', 'SELECCIONA TODOS LOS QUE TENGAS', 'opcion_multiple');
INSERT INTO preguntas (clave, numero, categoria, titulo, subtitulo, tipo) VALUES ('gas', 2, 'hogar', '2. EN MI DOMICILIO UTILIZO:', NULL, 'opcion_unica');
INSERT INTO preguntas (clave, numero, categoria, titulo, subtitulo, tipo) VALUES ('focos', 3, 'hogar', '3. EN MI CASA LOS FOCOS SON:', NULL, 'opcion_unica');
INSERT INTO preguntas (clave, numero, categoria, titulo, subtitulo, tipo) VALUES ('transporte', 4, 'transporte', '4. ¿CÓMO TE TRANSPORTAS PARA IR AL TRABAJO O A LA ESCUELA?', 'SELECCIONA LAS OPCIONES QUE APLIQUEN', 'opcion_multiple');
INSERT INTO preguntas (clave, numero, categoria, titulo, subtitulo, tipo) VALUES ('tiempo_recorrido', 5, 'transporte', '5. ¿EN CUÁNTO TIEMPO HACES ESE RECORRIDO?', NULL, 'opcion_unica');
INSERT INTO preguntas (clave, numero, categoria, titulo, subtitulo, tipo) VALUES ('vuelos', 6, 'transporte', '6. ¿CON QUÉ FRECUENCIA VUELAS EN AVIÓN?', NULL, 'opcion_unica');
INSERT INTO preguntas (clave, numero, categoria, titulo, subtitulo, tipo) VALUES ('carne_matriz', 7, 'consumo', '7. ¿CON QUÉ FRECUENCIA COMES CARNE DE?', NULL, 'matriz');
INSERT INTO preguntas (clave, numero, categoria, titulo, subtitulo, tipo) VALUES ('plasticos', 8, 'consumo', '8. ¿CON QUÉ REGULARIDAD UTILIZAS PLÁSTICOS DE UN SOLO USO?', NULL, 'opcion_unica');
INSERT INTO preguntas (clave, numero, categoria, titulo, subtitulo, tipo) VALUES ('ropa', 9, 'consumo', '9. LA ROPA QUE UTILIZO:', NULL, 'opcion_unica');
INSERT INTO preguntas (clave, numero, categoria, titulo, subtitulo, tipo) VALUES ('dispositivos_matriz', 10, 'consumo', '10. CADA CUÁNTO CAMBIO MIS DISPOSITIVOS ELECTRÓNICOS', NULL, 'matriz');

-- ---------------------------------------------------------------------
--  Opciones (en las matrices son las columnas)
-- ---------------------------------------------------------------------

-- P1 electrodomesticos
INSERT INTO opciones (id_pregunta, clave, etiqueta, kg_co2, horas, orden) VALUES
  ((SELECT id_pregunta FROM preguntas WHERE clave = 'electrodomesticos'), 'refrigerador', 'Refrigerador', 237, NULL, 1),
  ((SELECT id_pregunta FROM preguntas WHERE clave = 'electrodomesticos'), 'microondas', 'Horno de microondas', 19.6, NULL, 2),
  ((SELECT id_pregunta FROM preguntas WHERE clave = 'electrodomesticos'), 'computadora', 'Computadora', 128, NULL, 3),
  ((SELECT id_pregunta FROM preguntas WHERE clave = 'electrodomesticos'), 'laptop', 'Laptop', 64, NULL, 4),
  ((SELECT id_pregunta FROM preguntas WHERE clave = 'electrodomesticos'), 'consola', 'Consola de videojuegos', 20, NULL, 5),
  ((SELECT id_pregunta FROM preguntas WHERE clave = 'electrodomesticos'), 'estereo', 'Estéreo', 3, NULL, 6),
  ((SELECT id_pregunta FROM preguntas WHERE clave = 'electrodomesticos'), 'tv', 'Televisión', 82, NULL, 7),
  ((SELECT id_pregunta FROM preguntas WHERE clave = 'electrodomesticos'), 'lavadora', 'Lavadora', 21, NULL, 8),
  ((SELECT id_pregunta FROM preguntas WHERE clave = 'electrodomesticos'), 'secadora', 'Secadora de ropa', 57, NULL, 9),
  ((SELECT id_pregunta FROM preguntas WHERE clave = 'electrodomesticos'), 'lavatrastes', 'Lavatrastes', 68, NULL, 10),
  ((SELECT id_pregunta FROM preguntas WHERE clave = 'electrodomesticos'), 'aspiradora', 'Aspiradora', 35, NULL, 11),
  ((SELECT id_pregunta FROM preguntas WHERE clave = 'electrodomesticos'), 'aire', 'Aire acondicionado', 227, NULL, 12),
  ((SELECT id_pregunta FROM preguntas WHERE clave = 'electrodomesticos'), 'ventiladores', 'Ventiladores', 96, NULL, 13);

-- P2 gas
INSERT INTO opciones (id_pregunta, clave, etiqueta, kg_co2, horas, orden) VALUES
  ((SELECT id_pregunta FROM preguntas WHERE clave = 'gas'), 'gas_natural', 'Gas natural', 189, NULL, 1),
  ((SELECT id_pregunta FROM preguntas WHERE clave = 'gas'), 'gas_lp', 'Gas LP', 153, NULL, 2);

-- P3 focos
INSERT INTO opciones (id_pregunta, clave, etiqueta, kg_co2, horas, orden) VALUES
  ((SELECT id_pregunta FROM preguntas WHERE clave = 'focos'), 'led', 'LED', 12, NULL, 1),
  ((SELECT id_pregunta FROM preguntas WHERE clave = 'focos'), 'ahorradores', 'Ahorradores', 31, NULL, 2),
  ((SELECT id_pregunta FROM preguntas WHERE clave = 'focos'), 'incandescentes', 'Incandescentes', 61, NULL, 3),
  ((SELECT id_pregunta FROM preguntas WHERE clave = 'focos'), 'no_se', 'No lo sé', 35, NULL, 4);

-- P4 transporte
INSERT INTO opciones (id_pregunta, clave, etiqueta, kg_co2, horas, orden) VALUES
  ((SELECT id_pregunta FROM preguntas WHERE clave = 'transporte'), 'auto', 'Auto', 4160, NULL, 1),
  ((SELECT id_pregunta FROM preguntas WHERE clave = 'transporte'), 'autobus', 'Autobús', 310, NULL, 2),
  ((SELECT id_pregunta FROM preguntas WHERE clave = 'transporte'), 'bicicleta', 'Bicicleta', 0, NULL, 3),
  ((SELECT id_pregunta FROM preguntas WHERE clave = 'transporte'), 'combi', 'Combi', 1090, NULL, 4),
  ((SELECT id_pregunta FROM preguntas WHERE clave = 'transporte'), 'metro', 'Metro', 0, NULL, 5),
  ((SELECT id_pregunta FROM preguntas WHERE clave = 'transporte'), 'metrobus', 'Metrobús', 90, NULL, 6),
  ((SELECT id_pregunta FROM preguntas WHERE clave = 'transporte'), 'motocicleta', 'Motocicleta', 2080, NULL, 7),
  ((SELECT id_pregunta FROM preguntas WHERE clave = 'transporte'), 'caminando', 'Voy caminando', 0, NULL, 8);

-- P5 tiempo_recorrido
INSERT INTO opciones (id_pregunta, clave, etiqueta, kg_co2, horas, orden) VALUES
  ((SELECT id_pregunta FROM preguntas WHERE clave = 'tiempo_recorrido'), 'menos_10', 'Menos de 10 minutos', NULL, 0.08, 1),
  ((SELECT id_pregunta FROM preguntas WHERE clave = 'tiempo_recorrido'), '10_20', 'Entre 10 y 20 minutos', NULL, 0.25, 2),
  ((SELECT id_pregunta FROM preguntas WHERE clave = 'tiempo_recorrido'), '20_40', 'Entre 20 y 40 minutos', NULL, 0.5, 3),
  ((SELECT id_pregunta FROM preguntas WHERE clave = 'tiempo_recorrido'), '40_60', 'Entre 40 minutos y 1 hora', NULL, 0.83, 4),
  ((SELECT id_pregunta FROM preguntas WHERE clave = 'tiempo_recorrido'), 'hora_media', 'Una hora y media', NULL, 1.5, 5),
  ((SELECT id_pregunta FROM preguntas WHERE clave = 'tiempo_recorrido'), 'mas_2_horas', 'Más de dos horas', NULL, 2.5, 6),
  ((SELECT id_pregunta FROM preguntas WHERE clave = 'tiempo_recorrido'), 'mas_3_horas', 'Más de tres horas', NULL, 3.5, 7);

-- P6 vuelos
INSERT INTO opciones (id_pregunta, clave, etiqueta, kg_co2, horas, orden) VALUES
  ((SELECT id_pregunta FROM preguntas WHERE clave = 'vuelos'), 'frecuente', 'Viajero frecuente (más de dos vuelos int. y dos nac. al año)', 4600, NULL, 1),
  ((SELECT id_pregunta FROM preguntas WHERE clave = 'vuelos'), 'int_1', 'Aproximadamente un vuelo (ida y vuelta) internacional al año', 2000, NULL, 2),
  ((SELECT id_pregunta FROM preguntas WHERE clave = 'vuelos'), 'nac_mas_1', 'Más de un vuelo (ida y vuelta) nacional al año', 500, NULL, 3),
  ((SELECT id_pregunta FROM preguntas WHERE clave = 'vuelos'), 'nac_1', 'Aproximadamente un vuelo (ida y vuelta) nacional al año', 200, NULL, 4),
  ((SELECT id_pregunta FROM preguntas WHERE clave = 'vuelos'), 'no_vuelo', 'No suelo volar', 0, NULL, 5);

-- P7 carne_matriz
INSERT INTO opciones (id_pregunta, clave, etiqueta, kg_co2, horas, orden) VALUES
  ((SELECT id_pregunta FROM preguntas WHERE clave = 'carne_matriz'), 'diario', 'Diario', NULL, NULL, 1),
  ((SELECT id_pregunta FROM preguntas WHERE clave = 'carne_matriz'), '4_6_dias', '4-6 días a la semana', NULL, NULL, 2),
  ((SELECT id_pregunta FROM preguntas WHERE clave = 'carne_matriz'), '1_3_dias', '1-3 días a la semana', NULL, NULL, 3),
  ((SELECT id_pregunta FROM preguntas WHERE clave = 'carne_matriz'), 'no_consumo', 'No consumo', NULL, NULL, 4);

-- P8 plasticos
INSERT INTO opciones (id_pregunta, clave, etiqueta, kg_co2, horas, orden) VALUES
  ((SELECT id_pregunta FROM preguntas WHERE clave = 'plasticos'), 'diario', 'Diario', 8, NULL, 1),
  ((SELECT id_pregunta FROM preguntas WHERE clave = 'plasticos'), 'semanal', 'De vez en cuando (1 vez por semana)', 3, NULL, 2),
  ((SELECT id_pregunta FROM preguntas WHERE clave = 'plasticos'), 'rara_vez', 'Rara vez', 1, NULL, 3),
  ((SELECT id_pregunta FROM preguntas WHERE clave = 'plasticos'), 'no_uso', 'No uso plástico', 0, NULL, 4);

-- P9 ropa
INSERT INTO opciones (id_pregunta, clave, etiqueta, kg_co2, horas, orden) VALUES
  ((SELECT id_pregunta FROM preguntas WHERE clave = 'ropa'), 'nueva_importada', 'Siempre es nueva y de importación', 403, NULL, 1),
  ((SELECT id_pregunta FROM preguntas WHERE clave = 'ropa'), 'nueva_nacional', 'Siempre es nueva y nacional', 254, NULL, 2),
  ((SELECT id_pregunta FROM preguntas WHERE clave = 'ropa'), 'segunda_mano', 'De segunda mano', 127, NULL, 3),
  ((SELECT id_pregunta FROM preguntas WHERE clave = 'ropa'), 'reparo', 'La reparo y reutilizo', 85, NULL, 4);

-- P10 dispositivos_matriz
INSERT INTO opciones (id_pregunta, clave, etiqueta, kg_co2, horas, orden) VALUES
  ((SELECT id_pregunta FROM preguntas WHERE clave = 'dispositivos_matriz'), 'cada_6_meses', 'Cada 6 meses', NULL, NULL, 1),
  ((SELECT id_pregunta FROM preguntas WHERE clave = 'dispositivos_matriz'), 'cada_ano', 'Cada año', NULL, NULL, 2),
  ((SELECT id_pregunta FROM preguntas WHERE clave = 'dispositivos_matriz'), '2_3_anos', 'De 2 a 3 años', NULL, NULL, 3),
  ((SELECT id_pregunta FROM preguntas WHERE clave = 'dispositivos_matriz'), 'mas_3_anos', 'Más de 3 años', NULL, NULL, 4),
  ((SELECT id_pregunta FROM preguntas WHERE clave = 'dispositivos_matriz'), 'no_tengo', 'No tengo este dispositivo', NULL, NULL, 5);

-- ---------------------------------------------------------------------
--  Filas de las matrices y sus pesos
-- ---------------------------------------------------------------------

-- P7 carne_matriz: filas
INSERT INTO filas_matriz (id_pregunta, clave, etiqueta, orden) VALUES
  ((SELECT id_pregunta FROM preguntas WHERE clave = 'carne_matriz'), 'res', 'Res', 1),
  ((SELECT id_pregunta FROM preguntas WHERE clave = 'carne_matriz'), 'cerdo', 'Cerdo', 2),
  ((SELECT id_pregunta FROM preguntas WHERE clave = 'carne_matriz'), 'pollo', 'Pollo', 3),
  ((SELECT id_pregunta FROM preguntas WHERE clave = 'carne_matriz'), 'pescado', 'Pescado', 4);

-- P7 carne_matriz: pesos (kg CO2e)
INSERT INTO pesos_matriz (id_fila, id_opcion, kg_co2)
SELECT f.id_fila, op.id_opcion, v.kg
FROM (
  SELECT 'res' AS fila, 'diario' AS col, 2360 AS kg
  UNION ALL
  SELECT 'res' AS fila, '4_6_dias' AS col, 1865 AS kg
  UNION ALL
  SELECT 'res' AS fila, '1_3_dias' AS col, 675 AS kg
  UNION ALL
  SELECT 'res' AS fila, 'no_consumo' AS col, 0 AS kg
  UNION ALL
  SELECT 'cerdo' AS fila, 'diario' AS col, 540 AS kg
  UNION ALL
  SELECT 'cerdo' AS fila, '4_6_dias' AS col, 386 AS kg
  UNION ALL
  SELECT 'cerdo' AS fila, '1_3_dias' AS col, 155 AS kg
  UNION ALL
  SELECT 'cerdo' AS fila, 'no_consumo' AS col, 0 AS kg
  UNION ALL
  SELECT 'pollo' AS fila, 'diario' AS col, 344 AS kg
  UNION ALL
  SELECT 'pollo' AS fila, '4_6_dias' AS col, 245 AS kg
  UNION ALL
  SELECT 'pollo' AS fila, '1_3_dias' AS col, 98 AS kg
  UNION ALL
  SELECT 'pollo' AS fila, 'no_consumo' AS col, 0 AS kg
  UNION ALL
  SELECT 'pescado' AS fila, 'diario' AS col, 128 AS kg
  UNION ALL
  SELECT 'pescado' AS fila, '4_6_dias' AS col, 91 AS kg
  UNION ALL
  SELECT 'pescado' AS fila, '1_3_dias' AS col, 37 AS kg
  UNION ALL
  SELECT 'pescado' AS fila, 'no_consumo' AS col, 0 AS kg
) v
JOIN preguntas pr ON pr.clave = 'carne_matriz'
JOIN filas_matriz f ON f.id_pregunta = pr.id_pregunta AND f.clave = v.fila
JOIN opciones op ON op.id_pregunta = pr.id_pregunta AND op.clave = v.col;

-- P10 dispositivos_matriz: filas
INSERT INTO filas_matriz (id_pregunta, clave, etiqueta, orden) VALUES
  ((SELECT id_pregunta FROM preguntas WHERE clave = 'dispositivos_matriz'), 'celular', 'Celular', 1),
  ((SELECT id_pregunta FROM preguntas WHERE clave = 'dispositivos_matriz'), 'tableta', 'Tableta', 2),
  ((SELECT id_pregunta FROM preguntas WHERE clave = 'dispositivos_matriz'), 'computadora', 'Computadora', 3),
  ((SELECT id_pregunta FROM preguntas WHERE clave = 'dispositivos_matriz'), 'consola', 'Consola de videojuegos', 4);

-- P10 dispositivos_matriz: pesos (kg CO2e)
INSERT INTO pesos_matriz (id_fila, id_opcion, kg_co2)
SELECT f.id_fila, op.id_opcion, v.kg
FROM (
  SELECT 'celular' AS fila, 'cada_6_meses' AS col, 120 AS kg
  UNION ALL
  SELECT 'celular' AS fila, 'cada_ano' AS col, 60 AS kg
  UNION ALL
  SELECT 'celular' AS fila, '2_3_anos' AS col, 25 AS kg
  UNION ALL
  SELECT 'celular' AS fila, 'mas_3_anos' AS col, 15 AS kg
  UNION ALL
  SELECT 'celular' AS fila, 'no_tengo' AS col, 0 AS kg
  UNION ALL
  SELECT 'tableta' AS fila, 'cada_6_meses' AS col, 340 AS kg
  UNION ALL
  SELECT 'tableta' AS fila, 'cada_ano' AS col, 170 AS kg
  UNION ALL
  SELECT 'tableta' AS fila, '2_3_anos' AS col, 68 AS kg
  UNION ALL
  SELECT 'tableta' AS fila, 'mas_3_anos' AS col, 43 AS kg
  UNION ALL
  SELECT 'tableta' AS fila, 'no_tengo' AS col, 0 AS kg
  UNION ALL
  SELECT 'computadora' AS fila, 'cada_6_meses' AS col, 700 AS kg
  UNION ALL
  SELECT 'computadora' AS fila, 'cada_ano' AS col, 350 AS kg
  UNION ALL
  SELECT 'computadora' AS fila, '2_3_anos' AS col, 140 AS kg
  UNION ALL
  SELECT 'computadora' AS fila, 'mas_3_anos' AS col, 88 AS kg
  UNION ALL
  SELECT 'computadora' AS fila, 'no_tengo' AS col, 0 AS kg
  UNION ALL
  SELECT 'consola' AS fila, 'cada_6_meses' AS col, 180 AS kg
  UNION ALL
  SELECT 'consola' AS fila, 'cada_ano' AS col, 90 AS kg
  UNION ALL
  SELECT 'consola' AS fila, '2_3_anos' AS col, 36 AS kg
  UNION ALL
  SELECT 'consola' AS fila, 'mas_3_anos' AS col, 22 AS kg
  UNION ALL
  SELECT 'consola' AS fila, 'no_tengo' AS col, 0 AS kg
) v
JOIN preguntas pr ON pr.clave = 'dispositivos_matriz'
JOIN filas_matriz f ON f.id_pregunta = pr.id_pregunta AND f.clave = v.fila
JOIN opciones op ON op.id_pregunta = pr.id_pregunta AND op.clave = v.col;

