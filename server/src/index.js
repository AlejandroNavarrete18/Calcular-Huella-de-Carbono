import { existsSync } from 'node:fs';
import path from 'node:path';
import { loadConfig, ConfigError } from './config/index.js';
import { createApp } from './app.js';
import { createDatabasePool } from './database/pool.js';
import { createRepositories } from './repositories/index.js';
import { createMailService } from './services/mail/mail.service.js';
import { logger } from './utils/logger.js';

/** Punto de entrada: configuración, base de datos, servicio de correo y servidor Express. */

let config;
try {
  config = loadConfig();
} catch (err) {
  if (err instanceof ConfigError) {
    logger.error(err.message);
    process.exit(1);
  }
  throw err;
}

if (config.serveClient && !existsSync(path.join(config.clientDistDir, 'index.html'))) {
  logger.error('SERVE_CLIENT=true pero no existe client/dist. Ejecuta primero: npm run build');
  process.exit(1);
}

const pool = createDatabasePool(config.db);
const repositories = createRepositories(pool);
const mailService = createMailService({
  cuentasCorreo: repositories.cuentasCorreo,
  enviosCorreo: repositories.enviosCorreo,
  mailConfig: config.mail,
  secretKey: config.mail.secretKey,
  logger,
});

// Verifica las cuentas activas al arrancar: avisa de inmediato si alguna contraseña es incorrecta.
mailService.verify().catch((err) => {
  logger.error('No se pudo verificar las cuentas de correo:', err.message);
});

const app = createApp({ config, mailService, logger });
const server = app.listen(config.port, () => {
  logger.info(`API escuchando en http://localhost:${config.port} (orígenes permitidos: ${config.allowedOrigins.join(', ')})`);
});

// Cierre ordenado: primero el servidor HTTP y después las conexiones a MySQL.
for (const signal of ['SIGINT', 'SIGTERM']) {
  process.on(signal, () => {
    logger.info(`${signal} recibido, cerrando servidor...`);
    server.close(async () => {
      await pool.end();
      process.exit(0);
    });
  });
}
