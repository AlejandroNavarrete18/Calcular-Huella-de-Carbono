import path from 'node:path';
import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import { createRoutes } from './routes/index.js';
import { createCatalogoController } from './controllers/catalogo.controller.js';
import { createCuestionarioController } from './controllers/cuestionario.controller.js';
import { createParticipacionesController } from './controllers/participaciones.controller.js';
import { createValidarParticipacion } from './middleware/validarParticipacion.js';
import { createGeneralLimiter, createSubmissionIpLimiter } from './middleware/rateLimit.js';
import { createOriginGuard } from './middleware/originGuard.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';

/**
 * Construye la aplicación Express.
 *
 * @param {object} deps
 * @param {object} deps.config Configuración validada (ver config/index.js).
 * @param {{catalogo: object, cuestionario: object, participaciones: object}} deps.services Servicios de la aplicación.
 * @param {{info: Function, warn: Function, error: Function}} deps.logger
 */
export function createApp({ config, services, logger }) {
  const app = express();

  app.disable('x-powered-by'); // no anunciar que usamos Express
  if (config.trustProxy) {
    app.set('trust proxy', config.trustProxy);
  }

  // Cabeceras de seguridad HTTP. `upgrade-insecure-requests` se desactiva para que la página siga
  // funcionando si se sirve por http dentro de la red de la universidad (en https no cambia nada).
  app.use(
    helmet({
      contentSecurityPolicy: { useDefaults: true, directives: { 'upgrade-insecure-requests': null } },
    })
  );

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

  app.use(express.json({ limit: '10kb' })); // los datos y respuestas del cuestionario pesan muy poco
  app.use('/api', createGeneralLimiter(config.limits));

  const catalogoController = createCatalogoController({ catalogoService: services.catalogo });
  const cuestionarioController = createCuestionarioController({ cuestionarioService: services.cuestionario });
  const participacionesController = createParticipacionesController({
    participacionesService: services.participaciones,
    logger,
  });
  app.use(
    '/api',
    createRoutes({
      catalogoController,
      cuestionarioController,
      participacionesController,
      validarParticipacion: createValidarParticipacion({ cuestionarioService: services.cuestionario }),
      submissionIpLimiter: createSubmissionIpLimiter(config.limits),
    })
  );

  if (config.serveClient) {
    app.use(express.static(config.clientDistDir, { maxAge: '1h', index: false }));
    // Cualquier GET que no sea /api devuelve la página principal (navegación de la app).
    app.get(/^\/(?!api(\/|$)).*/, (_req, res) => res.sendFile(path.join(config.clientDistDir, 'index.html')));
  }

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
