import { rateLimit } from 'express-rate-limit';

/** Límite de envíos por dirección IP (por hora). */
export function createEmailIpLimiter({ emailsPerIpPerHour }) {
  return rateLimit({
    windowMs: 60 * 60 * 1000,
    limit: emailsPerIpPerHour,
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    handler: (_req, res) =>
      res.status(429).json({
        ok: false,
        code: 'RATE_LIMITED',
        message: 'Has alcanzado el límite de envíos por hora. Inténtalo más tarde.',
      }),
  });
}

/** Límite general para todo /api (protege de ráfagas de peticiones). */
export function createGeneralLimiter() {
  return rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 200,
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    handler: (_req, res) =>
      res.status(429).json({ ok: false, code: 'RATE_LIMITED', message: 'Demasiadas peticiones. Inténtalo más tarde.' }),
  });
}
