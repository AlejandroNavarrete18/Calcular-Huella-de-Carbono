/**
 * Comunicación con el servidor de correo (carpeta /server).
 */
const API_BASE = (import.meta.env.VITE_API_URL ?? '').replace(/\/$/, '');
const TIMEOUT_MS = 20_000;

/** Error de la API con un mensaje listo para mostrar a la persona. */
class ApiError extends Error {
  constructor(message, { status, code } = {}) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
  }
}

/** Lee el cuerpo JSON de la respuesta; devuelve null si no hay JSON. */
async function readJsonSafely(response) {
  try {
    return await response.json();
  } catch {
    return null;
  }
}

/**
 * Pide al servidor que envíe por correo los resultados del cuestionario.
 * Solo se envían las RESPUESTAS: el servidor vuelve a calcular la huella por su cuenta.
 *
 * @param {{name: string, email: string, answers: object, website?: string}} payload
 * @throws {ApiError}
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

    const data = await readJsonSafely(response);

    if (!response.ok) {
      throw new ApiError(data?.message ?? 'No pudimos enviar el correo. Inténtalo de nuevo.', {
        status: response.status,
        code: data?.code,
      });
    }
    return data;
  } catch (err) {
    if (err instanceof ApiError) {
      throw err;
    }
    if (err.name === 'AbortError') {
      throw new ApiError('El servidor tardó demasiado en responder. Inténtalo de nuevo.');
    }
    throw new ApiError('No pudimos conectar con el servidor de correo. Verifica que esté encendido.');
  } finally {
    clearTimeout(timer);
  }
}
