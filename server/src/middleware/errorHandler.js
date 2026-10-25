import { logger } from '../utils/logger.js';

/** 404 en formato JSON para rutas /api desconocidas. */
export function notFoundHandler(_req, res) {
  res.status(404).json({ ok: false, code: 'NOT_FOUND', message: 'Ruta no encontrada.' });
}

/**
 * Manejo centralizado de errores. Al cliente solo le llegan mensajes genéricos: los detalles
 */
export function errorHandler(err, _req, res, _next) {
  if (err?.type === 'entity.parse.failed') {
    return res
      .status(400)
      .json({ ok: false, code: 'INVALID_JSON', message: 'El cuerpo de la petición no es un JSON válido.' });
  }
  if (err?.type === 'entity.too.large') {
    return res.status(413).json({ ok: false, code: 'PAYLOAD_TOO_LARGE', message: 'La petición es demasiado grande.' });
  }

  logger.error('Error no controlado:', err?.message ?? err);
  return res
    .status(500)
    .json({ ok: false, code: 'INTERNAL_ERROR', message: 'Ocurrió un error inesperado en el servidor.' });
}
