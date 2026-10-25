import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';

/**
 * Configuración del servidor a partir de variables de entorno.
 */

// Carga server/.env sin importar desde qué carpeta se arranque el proceso.
dotenv.config({ path: fileURLToPath(new URL('../../.env', import.meta.url)), quiet: true });

/** Error de configuración con la lista de problemas encontrados. */
export class ConfigError extends Error {
  constructor(problems) {
    super(`Configuración inválida:\n - ${problems.join('\n - ')}`);
    this.name = 'ConfigError';
    this.problems = problems;
  }
}

const TRUE_VALUES = ['1', 'true', 'yes', 'si', 'sí'];
const EMAIL_SHAPE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const ONE_HOUR_MS = 60 * 60 * 1000;

/** Convierte "true"/"1"/"si" en booleano. Si la variable no existe, usa `fallback`. */
function toBool(value, fallback = false) {
  if (value === undefined || value === '') {
    return fallback;
  }
  return TRUE_VALUES.includes(String(value).toLowerCase());
}

/** Convierte a entero positivo; si no es válido, usa `fallback`. */
function toPositiveInt(value, fallback) {
  const parsed = Number.parseInt(value, 10);
  if (Number.isInteger(parsed) && parsed > 0) {
    return parsed;
  }
  return fallback;
}

/** Lista separada por comas -> arreglo limpio (sin espacios ni "/" final). */
function toList(value, fallback) {
  const source = value ?? fallback;
  return source
    .split(',')
    .map((item) => item.trim().replace(/\/$/, ''))
    .filter(Boolean);
}

/** número de proxies de confianza, o `false` si no se usa proxy. */
function parseTrustProxy(value) {
  if (!value) {
    return false;
  }
  return toPositiveInt(value, 1);
}

/**
 * Lee las variables de entorno, las valida
 *
 * @param {NodeJS.ProcessEnv} [env=process.env]
 * @throws {ConfigError} 
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
          '(NO tu contraseña normal de Gmail). Mira docs/configuracion-correo.md.'
      );
    }
  }

  if (problems.length > 0) {
    throw new ConfigError(problems);
  }

  return Object.freeze({
    nodeEnv: env.NODE_ENV ?? 'development',
    port: toPositiveInt(env.PORT, 3001),
    // Orígenes (páginas web) autorizados a llamar a esta API.
    allowedOrigins: toList(env.ALLOWED_ORIGINS, 'http://localhost:5173'),
    trustProxy: parseTrustProxy(env.TRUST_PROXY),
    serveClient: toBool(env.SERVE_CLIENT),
    clientDistDir: fileURLToPath(new URL('../../../client/dist/', import.meta.url)),
    mail: Object.freeze({
      dryRun,
      user,
      appPassword,
      fromName: (env.MAIL_FROM_NAME ?? 'Calculadora de Huella de Carbono').replace(/[\r\n<>"]/g, '').trim(),
    }),
    limits: Object.freeze({
      windowMs: ONE_HOUR_MS,
      emailsPerIpPerHour: toPositiveInt(env.LIMIT_EMAILS_PER_IP_PER_HOUR, 5),
      emailsPerRecipientPerHour: toPositiveInt(env.LIMIT_EMAILS_PER_RECIPIENT_PER_HOUR, 3),
    }),
  });
}
