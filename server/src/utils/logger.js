/**
 * Logger.
 */
const timestamp = () => new Date().toISOString();

export const logger = {
  info: (...args) => console.log(timestamp(), '[INFO]', ...args),
  warn: (...args) => console.warn(timestamp(), '[WARN]', ...args),
  error: (...args) => console.error(timestamp(), '[ERROR]', ...args),
};

/**
 * Oculta casi toda la parte local de un correo: "maria.lopez@gmail.com" -> "m***@gmail.com".
 * @param {string} email
 */
export function maskEmail(email = '') {
  const [local = '', domain = ''] = String(email).split('@');
  if (!domain) {
    return '***';
  }
  return `${local.slice(0, 1)}***@${domain}`;
}
