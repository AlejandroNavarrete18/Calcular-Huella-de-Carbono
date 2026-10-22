/**
 * Logger mínimo. Nunca registres contraseñas, tokens ni correos completos.
 * Para identificar a un destinatario en los logs usa `maskEmail`.
 */
const stamp = () => new Date().toISOString();

export const logger = {
  info: (...args) => console.log(stamp(), '[INFO]', ...args),
  warn: (...args) => console.warn(stamp(), '[WARN]', ...args),
  error: (...args) => console.error(stamp(), '[ERROR]', ...args),
};

/** "maria.lopez@gmail.com" -> "m***@gmail.com" */
export function maskEmail(email = '') {
  const [local = '', domain = ''] = String(email).split('@');
  if (!domain) return '***';
  return `${local.slice(0, 1)}***@${domain}`;
}
