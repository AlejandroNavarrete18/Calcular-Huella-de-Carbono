import { Router } from 'express';
import { validarIdParam } from '../middleware/validarParametros.js';

/**
 * Rutas de la API (todas cuelgan de /api)
 *
 *   GET  /health                                       = comprobar que el servidor está vivo
 *   GET  /cuestionario                                 = preguntas y opciones vigentes (leídas de MySQL, sin pesos)
 *   GET  /catalogo/unidades-regionales                 = unidades regionales activas
 *   GET  /catalogo/unidades-regionales/:idUnidad/escuelas = escuelas/facultades de ESA unidad (cascada)
 *   GET  /catalogo/municipios                          = municipios activos
 *   POST /participaciones                              = guarda datos + respuestas y devuelve los resultados
 *                                                        (400 si falta cualquier dato o respuesta)
 */
export function createRoutes({
  catalogoController,
  cuestionarioController,
  participacionesController,
  validarParticipacion,
  submissionIpLimiter,
}) {
  const router = Router();

  router.get('/health', (_req, res) => res.json({ ok: true }));

  router.get('/cuestionario', cuestionarioController.obtener);

  router.get('/catalogo/unidades-regionales', catalogoController.listarUnidades);
  router.get(
    '/catalogo/unidades-regionales/:idUnidad/escuelas',
    validarIdParam('idUnidad'),
    catalogoController.listarEscuelas
  );
  router.get('/catalogo/municipios', catalogoController.listarMunicipios);

  router.post('/participaciones', submissionIpLimiter, validarParticipacion, participacionesController.crear);

  return router;
}
