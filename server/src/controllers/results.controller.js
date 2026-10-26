import { calculateFootprint } from '@huella/shared';
import { validateEmailRequest } from '../validators/results.validator.js';
import { maskEmail } from '../utils/logger.js';

/**
 * Controlador de POST /api/results/email.
 */
export function createResultsController({ mailService, recipientLimiter, logger }) {
  return {
    async sendResultsEmail(req, res) {
      const parsed = validateEmailRequest(req.body);

      if (!parsed.ok) {
        return res.status(400).json({
          ok: false,
          code: 'VALIDATION_ERROR',
          message: 'Revisa los datos enviados.',
          errors: parsed.errors,
        });
      }

      // Campo trampa lleno = es un bot
      if (parsed.isBot) {
        logger.warn('Petición descartada por honeypot.');
        return res.status(200).json({ ok: true });
      }

      const { name, email, answers } = parsed.value;

      if (!recipientLimiter.tryConsume(email)) {
        return res.status(429).json({
          ok: false,
          code: 'RECIPIENT_RATE_LIMITED',
          message: 'Ya enviamos varios correos a esta dirección. Inténtalo más tarde.',
        });
      }

      const results = calculateFootprint(answers);

      try {
        await mailService.sendResultsEmail({ to: email, name, results });
      } catch (err) {
        recipientLimiter.release(email);
        logger.error(`No se pudo enviar el correo a ${maskEmail(email)}:`, err.code ?? '', err.message);
        return res.status(502).json({
          ok: false,
          code: 'MAIL_FAILED',
          message: 'No pudimos enviar el correo en este momento. Inténtalo de nuevo más tarde.',
        });
      }

      logger.info(`Resultados enviados a ${maskEmail(email)}.`);
      return res.status(200).json({ ok: true, message: 'Correo enviado correctamente.' });
    },
  };
}
