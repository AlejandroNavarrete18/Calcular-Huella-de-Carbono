import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import { createRoutes } from './routes/index.js';
import { createResultsController } from './controllers/results.controller.js';
import { createEmailIpLimiter, createGeneralLimiter } from './middleware/rateLimit.js';
import { createRecipientLimiter } from './middleware/recipientLimiter.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';

/**
 * Construye la aplicación Express. Recibe sus dependencias (configuración, servicio de correo, logger)
 * en lugar de crearlas aquí: así las pruebas automáticas pueden usar un "correo falso".
 */
export function createApp({ config, mailService, logger, recipientLimiter }) {
  const app = express();

  app.disable('x-powered-by'); // no anunciar que usamos Express
  if (config.trustProxy) app.set('trust proxy', config.trustProxy);

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

  // Defensa extra: si la petición declara un origen no autorizado, se rechaza.
  app.use('/api', (req, res, next) => {
    const origin = req.get('origin');
    if (origin && !config.allowedOrigins.includes(origin)) {
      return res.status(403).json({ ok: false, code: 'ORIGIN_NOT_ALLOWED', message: 'Origen no autorizado.' });
    }
    next();
  });

  app.use(express.json({ limit: '10kb' })); // las respuestas del cuestionario pesan muy poco
  app.use('/api', createGeneralLimiter());

  const resultsController = createResultsController({
    mailService,
    logger,
    recipientLimiter:
      recipientLimiter ??
      createRecipientLimiter({ max: config.limits.emailsPerRecipientPerHour, windowMs: 60 * 60 * 1000 }),
  });

  app.use('/api', createRoutes({ resultsController, emailIpLimiter: createEmailIpLimiter(config.limits) }));

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
