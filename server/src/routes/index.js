import { Router } from 'express';

/**
 * Define las rutas de la API.
 *   GET  /api/health         -> comprobar que el servidor está vivo
 *   POST /api/results/email  -> enviar resultados por correo
 */
export function createRoutes({ resultsController, emailIpLimiter }) {
  const router = Router();

  router.get('/health', (_req, res) => res.json({ ok: true }));
  router.post('/results/email', emailIpLimiter, resultsController.sendResultsEmail);

  return router;
}
