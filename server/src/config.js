import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';

// Carga server/.env sin importar desde qué carpeta se arranque el servidor.
dotenv.config({ path: fileURLToPath(new URL('../.env', import.meta.url)), quiet: true });

export class ConfigError extends Error {
  constructor(problems) {
    super(`Configuración inválida:\n - ${problems.join('\n - ')}`);
    this.name = 'ConfigError';
    this.problems = problems;
  }
}

const toBool = (value, fallback = false) =>
  value === undefined || value === '' ? fallback : ['1', 'true', 'yes', 'si', 'sí'].includes(String(value).toLowerCase());

const toPositiveInt = (value, fallback) => {
  const n = Number.parseInt(value, 10);
  return Number.isInteger(n) && n > 0 ? n : fallback;
};

const EMAIL_SHAPE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Lee las variables de entorno, las valida y devuelve un objeto de configuración inmutable.
 * Si falta algo importante, falla al arrancar con un mensaje claro (mejor que fallar al enviar).
 */
export function loadConfig(env = process.env) {
  const problems = [];
  const dryRun = toBool(env.MAIL_DRY_RUN);

  const user = (env.GMAIL_USER ?? '').trim();
  // Google muestra la contraseña de aplicación en 4 grupos ("abcd efgh ijkl mnop"): quitamos los espacios.
  const appPassword = (env.GMAIL_APP_PASSWORD ?? '').replace(/\s+/g, '');

  if (!dryRun) {
    if (!EMAIL_SHAPE.test(user) || user.includes('tu-correo')) {
      problems.push('GMAIL_USER debe ser tu dirección de Gmail completa (ej. nombre@gmail.com).');
    }
    if (appPassword.length !== 16) {
      problems.push(
        'GMAIL_APP_PASSWORD debe ser la "contraseña de aplicación" de 16 letras que genera Google ' +
          '(NO tu contraseña normal de Gmail). Mira server/README.md, paso 2.'
      );
    }
  }

  if (problems.length) throw new ConfigError(problems);

  return Object.freeze({
    nodeEnv: env.NODE_ENV ?? 'development',
    port: toPositiveInt(env.PORT, 3001),
    // Orígenes (páginas web) autorizados a llamar a esta API, separados por comas.
    allowedOrigins: (env.ALLOWED_ORIGINS ?? 'http://localhost:5173')
      .split(',')
      .map((o) => o.trim().replace(/\/$/, ''))
      .filter(Boolean),
    // Solo actívalo si el servidor está detrás de un proxy (Render, Railway, Nginx...). Ej. TRUST_PROXY=1
    trustProxy: env.TRUST_PROXY ? toPositiveInt(env.TRUST_PROXY, 1) : false,
    mail: Object.freeze({
      dryRun,
      user,
      appPassword,
      fromName: (env.MAIL_FROM_NAME ?? 'Calculadora de Huella de Carbono').replace(/[\r\n<>"]/g, '').trim(),
    }),
    limits: Object.freeze({
      emailsPerIpPerHour: toPositiveInt(env.LIMIT_EMAILS_PER_IP_PER_HOUR, 5),
      emailsPerRecipientPerHour: toPositiveInt(env.LIMIT_EMAILS_PER_RECIPIENT_PER_HOUR, 3),
    }),
  });
}
