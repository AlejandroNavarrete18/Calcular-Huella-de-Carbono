import { createHash } from 'node:crypto';

/**
 * Límite de correos por DESTINATARIO (además del límite por IP).
 * Evita que alguien use tu servidor para llenar de correos la bandeja de otra persona.
 *
 * - Guarda solo un hash del correo (no el correo en claro).
 * - Vive en memoria: se reinicia al reiniciar el servidor. Suficiente para pruebas;
 *   en producción con varias instancias conviene Redis.
 */
export function createRecipientLimiter({ max, windowMs, now = () => Date.now() }) {
  const hits = new Map(); // hash -> [timestamps]

  const key = (email) => createHash('sha256').update(email).digest('hex');
  const recent = (list, t) => list.filter((ts) => t - ts < windowMs);

  return {
    /** Intenta "gastar" un envío. Devuelve false si el destinatario ya alcanzó su límite. */
    tryConsume(email) {
      const t = now();
      const k = key(email);
      const list = recent(hits.get(k) ?? [], t);
      if (list.length >= max) {
        hits.set(k, list);
        return false;
      }
      list.push(t);
      hits.set(k, list);
      if (hits.size > 5000) this.sweep(); // evita crecer sin control
      return true;
    },

    /** Devuelve el envío si falló (para no penalizar a quien no recibió nada). */
    release(email) {
      const k = key(email);
      const list = hits.get(k);
      if (list?.length) list.pop();
    },

    sweep() {
      const t = now();
      for (const [k, list] of hits) {
        const kept = recent(list, t);
        if (kept.length) hits.set(k, kept);
        else hits.delete(k);
      }
    },
  };
}
