import { existsSync } from 'node:fs';
import path from 'node:path';
import { loadConfig, ConfigError } from './config/index.js';
import { createApp } from './app.js';
import { createMailService } from './services/mail.service.js';
import { logger } from './utils/logger.js';

/**
 * lee la configuración, verifica Gmail y enciende Express.
 */
let config;
try {
  config = loadConfig();
} catch (err) {
  if (err instanceof ConfigError) {
    logger.error(err.message);
    logger.error('Copia server/.env.example a server/.env y complétalo (guía: docs/configuracion-correo.md).');
    process.exit(1);
  }
  throw err;
}

if (config.serveClient && !existsSync(path.join(config.clientDistDir, 'index.html'))) {
  logger.error('SERVE_CLIENT=true pero no existe client/dist. Ejecuta primero: npm run build');
  process.exit(1);
}

const mailService = createMailService(config.mail, logger);

// Verificar Gmail al arrancar da un aviso inmediato si la contraseña es incorrecta.
mailService.verify().catch((err) => {
  logger.error('No se pudo verificar la conexión con Gmail:', err.code ?? '', err.message);
  logger.error('Revisa GMAIL_USER y GMAIL_APP_PASSWORD en server/.env (ver docs/configuracion-correo.md).');
});

const app = createApp({ config, mailService, logger });
const server = app.listen(config.port, () => {
  logger.info(`API escuchando en http://localhost:${config.port} (orígenes permitidos: ${config.allowedOrigins.join(', ')})`);
});

// Cierre ordenado
for (const signal of ['SIGINT', 'SIGTERM']) {
  process.on(signal, () => {
    logger.info(`${signal} recibido, cerrando servidor...`);
    server.close(() => process.exit(0));
  });
}
