import path from 'node:path';
import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import { createRoutes } from './routes/index.js';
import { createResultsController } from './controllers/results.controller.js';
import { createEmailIpLimiter, createGeneralLimiter } from './middleware/rateLimit.js';
import { createRecipientLimiter } from './middleware/recipientLimiter.js';
import { createOriginGuard } from './middleware/originGuard.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';

/**
 * Construye la aplicación Express.
 * @param {{config: object, mailService: object, logger: object, recipientLimiter?: object}} deps
 */
export function createApp({ config, mailService, logger, recipientLimiter }) {
  const app = express();

  app.disable('x-powered-by'); // no anunciar que usamos Express
  if (config.trustProxy) {
    app.set('trust proxy', config.trustProxy);
  }

  app.use(helmet()); // cabeceras de seguridad HTTP

  // CORS: solo las páginas autorizadas pueden llamar a la API desde un navegador.
  app.use(
    cors({
      origin: (origin, callback) => callback(null, !origin || config.allowedOrigins.includes(origin)),
      methods: ['GET', 'POST', 'OPTIONS'],
      allowedHeaders: ['Content-Type'],
      maxAge: 600,
    })
  );
  app.use('/api', createOriginGuard(config.allowedOrigins));

  app.use(express.json({ limit: '10kb' })); // las respuestas del cuestionario pesan muy poco
  app.use('/api', createGeneralLimiter());

  const resultsController = createResultsController({
    mailService,
    logger,
    recipientLimiter:
      recipientLimiter ??
      createRecipientLimiter({ max: config.limits.emailsPerRecipientPerHour, windowMs: config.limits.windowMs }),
  });
  app.use('/api', createRoutes({ resultsController, emailIpLimiter: createEmailIpLimiter(config.limits) }));

  if (config.serveClient) {
    app.use(express.static(config.clientDistDir, { maxAge: '1h', index: false }));
    // Cualquier GET que no sea /api devuelve la página principal (navegación de la app).
    app.get(/^\/(?!api(\/|$)).*/, (_req, res) => res.sendFile(path.join(config.clientDistDir, 'index.html')));
  }

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
