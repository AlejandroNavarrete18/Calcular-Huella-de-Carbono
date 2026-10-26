import { rateLimit } from 'express-rate-limit';

const tooManyRequests = (code, message) => (_req, res) => res.status(429).json({ ok: false, code, message });

/**
 * Límite de envíos de correo por dirección IP.
 * @param {{windowMs: number, emailsPerIpPerHour: number}} limits
 */
export function createEmailIpLimiter(limits) {
  return rateLimit({
    windowMs: limits.windowMs,
    limit: limits.emailsPerIpPerHour,
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    handler: tooManyRequests('RATE_LIMITED', 'Has alcanzado el límite de envíos por hora. Inténtalo más tarde.'),
  });
}

/** Límite general para toda la API protege de ráfagas de peticiones */
export function createGeneralLimiter() {
  return rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 200,
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    handler: tooManyRequests('RATE_LIMITED', 'Demasiadas peticiones. Inténtalo más tarde.'),
  });
}
