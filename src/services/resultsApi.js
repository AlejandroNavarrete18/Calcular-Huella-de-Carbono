/**
 * Comunicación con el servidor de correo (carpeta /server).
 *
 * En desarrollo, Vite redirige automáticamente las peticiones que empiezan con /api
 * hacia http://localhost:3001 (ver vite.config.js), así que no hay que configurar nada.
 * En producción, si la API vive en otra dirección, define VITE_API_URL (ver .env.example).
 */
const API_BASE = (import.meta.env.VITE_API_URL ?? '').replace(/\/$/, '');
const TIMEOUT_MS = 20_000;

export class ApiError extends Error {
  constructor(message, { status, code } = {}) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
  }
}

/**
 * Pide al servidor que envíe por correo los resultados del cuestionario.
 * Solo se envían las RESPUESTAS: el servidor vuelve a calcular la huella por su cuenta.
 */
export async function sendResultsEmail({ name, email, answers, website = '' }) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const response = await fetch(`${API_BASE}/api/results/email`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, answers, website }),
      signal: controller.signal,
    });

    let data = null;
    try {
      data = await response.json();
    } catch {
      // respuesta sin JSON: se maneja abajo con un mensaje genérico
    }

    if (!response.ok) {
      throw new ApiError(data?.message ?? 'No pudimos enviar el correo. Inténtalo de nuevo.', {
        status: response.status,
        code: data?.code,
      });
    }
    return data;
  } catch (err) {
    if (err instanceof ApiError) throw err;
    if (err.name === 'AbortError') throw new ApiError('El servidor tardó demasiado en responder. Inténtalo de nuevo.');
    throw new ApiError('No pudimos conectar con el servidor de correo. Verifica que esté encendido.');
  } finally {
    clearTimeout(timer);
  }
}
