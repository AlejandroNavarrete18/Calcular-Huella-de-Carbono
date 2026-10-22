import { mkdir, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import nodemailer from 'nodemailer';
import { buildResultsEmail } from '../templates/resultsEmail.js';

const DRY_RUN_DIR = fileURLToPath(new URL('../../.dry-run/', import.meta.url));

/**
 * Servicio de correo. Es lo ÚNICO del proyecto que conoce Nodemailer y Gmail:
 * si algún día cambias de proveedor (SendGrid, Resend, Amazon SES...), solo se toca este archivo.
 *
 * Modos:
 *  - Normal:   envía de verdad por Gmail (SMTP seguro, puerto 465 con TLS).
 *  - Dry-run:  (MAIL_DRY_RUN=true) no envía nada; guarda el correo como HTML en server/.dry-run/
 *              para que lo abras en el navegador. Ideal para probar sin credenciales.
 */
export function createMailService(mailConfig, logger) {
  const transporter = mailConfig.dryRun
    ? nodemailer.createTransport({ jsonTransport: true })
    : nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 465,
        secure: true, // conexión cifrada desde el primer byte
        auth: { user: mailConfig.user, pass: mailConfig.appPassword },
        // Tiempos máximos: evitan que una petición se quede colgada si Gmail no responde.
        connectionTimeout: 10_000,
        greetingTimeout: 10_000,
        socketTimeout: 20_000,
      });

  return {
    /** Comprueba al arrancar que Gmail acepta las credenciales (no envía ningún correo). */
    async verify() {
      if (mailConfig.dryRun) {
        logger.warn('Modo DRY-RUN activo: los correos NO se envían, se guardan en server/.dry-run/');
        return;
      }
      await transporter.verify();
      logger.info('Conexión con Gmail verificada correctamente.');
    },

    /** Envía el correo de resultados. `results` es lo que devuelve calculateFootprint(). */
    async sendResultsEmail({ to, name, results }) {
      const { subject, html, text } = buildResultsEmail({ name, results });

      if (mailConfig.dryRun) {
        await mkdir(DRY_RUN_DIR, { recursive: true });
        await writeFile(`${DRY_RUN_DIR}ultimo-correo.html`, html, 'utf8');
        await writeFile(`${DRY_RUN_DIR}ultimo-correo.txt`, `Para: ${to}\nAsunto: ${subject}\n\n${text}`, 'utf8');
        return { messageId: 'dry-run' };
      }

      // Gmail siempre reemplaza el remitente por la cuenta autenticada, por eso usamos GMAIL_USER.
      const info = await transporter.sendMail({
        from: { name: mailConfig.fromName, address: mailConfig.user },
        to,
        subject,
        text,
        html,
      });
      return { messageId: info.messageId };
    },
  };
}
