import { loadConfig, ConfigError } from './config.js';
import { createApp } from './app.js';
import { createMailService } from './services/mail.service.js';
import { logger } from './utils/logger.js';

let config;
try {
  config = loadConfig();
} catch (err) {
  if (err instanceof ConfigError) {
    logger.error(err.message);
    logger.error('Copia server/.env.example a server/.env y complétalo (guía: server/README.md).');
    process.exit(1);
  }
  throw err;
}

const mailService = createMailService(config.mail, logger);

// Verificar Gmail al arrancar da un aviso inmediato si la contraseña es incorrecta.
// Si falla no detenemos el servidor: el error volverá a mostrarse al intentar enviar.
mailService.verify().catch((err) => {
  logger.error('No se pudo verificar la conexión con Gmail:', err.code ?? '', err.message);
  logger.error('Revisa GMAIL_USER y GMAIL_APP_PASSWORD en server/.env (ver "Solución de problemas" en server/README.md).');
});

const app = createApp({ config, mailService, logger });
const server = app.listen(config.port, () => {
  logger.info(`API escuchando en http://localhost:${config.port}  (orígenes permitidos: ${config.allowedOrigins.join(', ')})`);
});

// Cierre ordenado (Ctrl+C o al detener el servicio en un hosting).
for (const signal of ['SIGINT', 'SIGTERM']) {
  process.on(signal, () => {
    logger.info(`${signal} recibido, cerrando servidor...`);
    server.close(() => process.exit(0));
  });
}
