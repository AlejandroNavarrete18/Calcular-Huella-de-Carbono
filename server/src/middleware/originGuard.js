/**
 * Defensa extra además de CORS: si la petición declara un origen (cabecera `Origin`) que no está
 * en la lista autorizada, se rechaza con 403.
 *
 * @param {string[]} allowedOrigins
 */
export function createOriginGuard(allowedOrigins) {
  return function originGuard(req, res, next) {
    const origin = req.get('origin');
    if (origin && !allowedOrigins.includes(origin)) {
      return res.status(403).json({ ok: false, code: 'ORIGIN_NOT_ALLOWED', message: 'Origen no autorizado.' });
    }
    return next();
  };
}
