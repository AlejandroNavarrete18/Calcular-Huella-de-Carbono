import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';

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
const SECRET_KEY_PATTERN = /^[0-9a-fA-F]{64}$/;
const REQUIRED_DB_VARIABLES = ['DB_HOST', 'DB_USER', 'DB_PASSWORD', 'DB_NAME'];
const DEFAULT_PORT = 3001;
const DEFAULT_DB_PORT = 3306;
const ONE_HOUR_MS = 60 * 60 * 1000;

/** Convierte "true"/"1"/"si" en booleano. Si la variable no existe, devuelve false. */
function toBool(value) {
  if (value === undefined || value === '') {
    return false;
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

/** Número de proxies de confianza, o `false` si no se usa proxy. */
function parseTrustProxy(value) {
  if (!value) {
    return false;
  }
  return toPositiveInt(value, 1);
}

/**
 * Problemas con las variables que solo se exigen cuando se envían correos de verdad
 * (en modo dry-run no hacen falta).
 */
function findMailProblems(env) {
  const problems = [];

  for (const name of REQUIRED_DB_VARIABLES) {
    if (!env[name]) {
      problems.push(`Falta la variable ${name}.`);
    }
  }
  if (!SECRET_KEY_PATTERN.test(env.MAIL_SECRET_KEY ?? '')) {
    problems.push('MAIL_SECRET_KEY debe tener exactamente 64 caracteres hexadecimales (32 bytes).');
  }
  return problems;
}

/**
 * Lee las variables de entorno y las valida.
 *
 * @param {NodeJS.ProcessEnv} [env=process.env]
 * @throws {ConfigError} si falta alguna variable obligatoria
 */
export function loadConfig(env = process.env) {
  const dryRun = toBool(env.MAIL_DRY_RUN);

  if (!dryRun) {
    const problems = findMailProblems(env);
    if (problems.length > 0) {
      throw new ConfigError(problems);
    }
  }

  return Object.freeze({
    port: toPositiveInt(env.PORT, DEFAULT_PORT),
    // Orígenes (páginas web) autorizados a llamar a esta API.
    allowedOrigins: toList(env.ALLOWED_ORIGINS, 'http://localhost:5173'),
    trustProxy: parseTrustProxy(env.TRUST_PROXY),
    serveClient: toBool(env.SERVE_CLIENT),
    clientDistDir: fileURLToPath(new URL('../../../client/dist/', import.meta.url)),
    db: Object.freeze({
      host: env.DB_HOST,
      port: toPositiveInt(env.DB_PORT, DEFAULT_DB_PORT),
      user: env.DB_USER,
      password: env.DB_PASSWORD,
      database: env.DB_NAME,
    }),
    mail: Object.freeze({
      dryRun,
      secretKey: env.MAIL_SECRET_KEY,
      fromName: (env.MAIL_FROM_NAME ?? 'Calculadora de Huella de Carbono').replace(/[\r\n<>"]/g, '').trim(),
      // Opcional: correo al que responderán las personas.
      replyTo: (env.MAIL_REPLY_TO ?? '').trim(),
    }),
    limits: Object.freeze({
      windowMs: ONE_HOUR_MS,
      emailsPerIpPerHour: toPositiveInt(env.LIMIT_EMAILS_PER_IP_PER_HOUR, 5),
      emailsPerRecipientPerHour: toPositiveInt(env.LIMIT_EMAILS_PER_RECIPIENT_PER_HOUR, 3),
    }),
  });
}
