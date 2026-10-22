/** Respuestas válidas de ejemplo (una por cada pregunta del cuestionario). */
export const validAnswers = {
  electrodomesticos: ['refrigerador', 'tv'],
  gas: 'gas_lp',
  focos: 'led',
  transporte: ['auto', 'caminando', 'autobus'],
  tiempo_recorrido: '20_40',
  vuelos: 'nac_1',
  carne_matriz: { res: '1_3_dias', cerdo: 'no_consumo', pollo: '4_6_dias', pescado: 'no_consumo' },
  plasticos: 'semanal',
  ropa: 'segunda_mano',
  dispositivos_matriz: { celular: 'cada_ano', tableta: 'no_tengo', computadora: 'mas_3_anos', consola: 'no_tengo' },
};

export const silentLogger = { info() {}, warn() {}, error() {} };

export const testConfig = {
  nodeEnv: 'test',
  port: 0,
  allowedOrigins: ['http://localhost:5173'],
  trustProxy: false,
  mail: { dryRun: true, user: '', appPassword: '', fromName: 'Test' },
  limits: { emailsPerIpPerHour: 100, emailsPerRecipientPerHour: 2 },
};
