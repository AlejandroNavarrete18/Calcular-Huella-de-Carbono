/**
 * Cliente HTTP mínimo para hablar con la API (carpeta /server).
 * En desarrollo, Vite redirige /api al servidor (ver vite.config.js); en otro caso usa VITE_API_URL.
 */
const API_BASE = (import.meta.env.VITE_API_URL ?? '').replace(/\/$/, '');
const DEFAULT_TIMEOUT_MS = 20_000;

/** Error de la API con un mensaje listo para mostrar a la persona. */
export class ApiError extends Error {
  constructor(message, { status, code, errors } = {}) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.errors = errors ?? [];
  }
}

/** ¿La petición se canceló a propósito (la pantalla ya no la necesita)? No es un error que mostrar. */
export const isAbortError = (error) => error?.name === 'AbortError';

/** Lee el cuerpo JSON de la respuesta; devuelve null si no hay JSON. */
async function readJsonSafely(response) {
  try {
    return await response.json();
  } catch {
    return null;
  }
}

/** Opciones de fetch: solo agrega cabecera y cuerpo cuando hay datos que enviar. */
function buildFetchOptions({ method, body, signal }) {
  const options = { method, signal };
  if (body !== undefined) {
    options.headers = { 'Content-Type': 'application/json' };
    options.body = JSON.stringify(body);
  }
  return options;
}

/**
 * Hace una petición a la API y devuelve el JSON de la respuesta.
 *
 * @param {string} path Ruta que empieza con "/api/...".
 * @param {{method?: string, body?: unknown, signal?: AbortSignal, timeoutMs?: number}} [options]
 *   `signal` permite cancelar la petición (por ejemplo, al salir de la pantalla).
 * @throws {ApiError} con un mensaje en español listo para mostrar.
 * @throws {DOMException} AbortError si la petición se canceló con `signal` (usa isAbortError).
 */
export async function requestJson(path, { method = 'GET', body, signal, timeoutMs = DEFAULT_TIMEOUT_MS } = {}) {
  const controller = new AbortController();
  let timedOut = false;
  const timer = setTimeout(() => {
    timedOut = true;
    controller.abort();
  }, timeoutMs);

  // Si quien llama cancela, se cancela también la petición real.
  const forwardCancel = () => controller.abort();
  if (signal?.aborted) {
    controller.abort();
  } else {
    signal?.addEventListener('abort', forwardCancel, { once: true });
  }

  try {
    const response = await fetch(`${API_BASE}${path}`, buildFetchOptions({ method, body, signal: controller.signal }));
    const data = await readJsonSafely(response);

    if (!response.ok) {
      throw new ApiError(data?.message ?? 'No pudimos completar la solicitud. Inténtalo de nuevo.', {
        status: response.status,
        code: data?.code,
        errors: data?.errors,
      });
    }
    return data;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    if (isAbortError(error)) {
      if (timedOut) {
        throw new ApiError('El servidor tardó demasiado en responder. Inténtalo de nuevo.');
      }
      throw error;
    }
    throw new ApiError('No pudimos conectar con el servidor. Verifica tu conexión e inténtalo de nuevo.');
  } finally {
    clearTimeout(timer);
    signal?.removeEventListener('abort', forwardCancel);
  }
}
