import { rateLimit } from 'express-rate-limit';

const tooManyRequests = (code, message) => (_req, res) => res.status(429).json({ ok: false, code, message });

/** Límite general para toda la API: protege de ráfagas de peticiones. */
export function createGeneralLimiter({ apiWindowMs, apiRequestsPerIp }) {
  return rateLimit({
    windowMs: apiWindowMs,
    limit: apiRequestsPerIp,
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    handler: tooManyRequests('RATE_LIMITED', 'Demasiadas peticiones. Inténtalo más tarde.'),
  });
}

/** Límite de participaciones guardadas por dirección IP (evita que un script llene la base de datos). */
export function createSubmissionIpLimiter({ windowMs, submissionsPerIpPerHour }) {
  return rateLimit({
    windowMs,
    limit: submissionsPerIpPerHour,
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    handler: tooManyRequests('RATE_LIMITED', 'Has alcanzado el límite de envíos por hora. Inténtalo más tarde.'),
  });
}
