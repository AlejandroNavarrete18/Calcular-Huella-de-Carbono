import { copyFile, mkdir, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import nodemailer from 'nodemailer';
import { buildResultsEmail } from '../templates/resultsEmail.js';
import { EMAIL_LOGOS, getEmailAttachments } from '../templates/emailAssets.js';

const DEFAULT_PREVIEW_DIR = fileURLToPath(new URL('../../.dry-run/', import.meta.url));

/**
 * Crea el "transporte" de Nodemailer.
 *  - Modo normal: SMTP seguro de Gmail (puerto 465 con TLS desde el primer byte).
 *  - Modo dry-run: transporte falso que no envía nada.
 */
function createTransporter(mailConfig) {
  if (mailConfig.dryRun) {
    return nodemailer.createTransport({ jsonTransport: true });
  }
  return nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: { user: mailConfig.user, pass: mailConfig.appPassword },
    // Tiempos máximos: evitan que una petición quede colgada si Gmail no responde.
    connectionTimeout: 10_000,
    greetingTimeout: 10_000,
    socketTimeout: 20_000,
  });
}

/**
 * guarda el correo como HTML/texto para revisarlo en el navegador.
 */
async function writeDryRunPreview(previewDir, { to, subject, html, text }) {
  await mkdir(previewDir, { recursive: true });

  let previewHtml = html;
  for (const attachment of getEmailAttachments()) {
    await copyFile(attachment.path, `${previewDir}${attachment.filename}`);
  }
  for (const logo of Object.values(EMAIL_LOGOS)) {
    previewHtml = previewHtml.replaceAll(`cid:${logo.cid}`, logo.filename);
  }

  await writeFile(`${previewDir}ultimo-correo.html`, previewHtml, 'utf8');
  await writeFile(`${previewDir}ultimo-correo.txt`, `Para: ${to}\nAsunto: ${subject}\n\n${text}`, 'utf8');
}

/**
 * Servicio de correo.
 *
 * @param {{dryRun: boolean, user: string, appPassword: string, fromName: string}} mailConfig
 * @param {{info: Function, warn: Function, error: Function}} logger
 * @param {{previewDir?: string}} [options] `previewDir`: carpeta del modo dry-run (termina en "/").
 */
export function createMailService(mailConfig, logger, options = {}) {
  const previewDir = options.previewDir ?? DEFAULT_PREVIEW_DIR;
  const transporter = createTransporter(mailConfig);

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

    /**
     * Envía el correo de resultados.
     * @param {{to: string, name: string, results: object}} params `results` = calculateFootprint(...)
     */
    async sendResultsEmail({ to, name, results }) {
      const { subject, html, text } = buildResultsEmail({ name, results });

      if (mailConfig.dryRun) {
        await writeDryRunPreview(previewDir, { to, subject, html, text });
        return { messageId: 'dry-run' };
      }

      // Gmail siempre reemplaza el remitente por la cuenta autenticada, por eso usamos GMAIL_USER.
      const info = await transporter.sendMail({
        from: { name: mailConfig.fromName, address: mailConfig.user },
        to,
        subject,
        text,
        html,
        attachments: getEmailAttachments(),
      });
      return { messageId: info.messageId };
    },
  };
}
