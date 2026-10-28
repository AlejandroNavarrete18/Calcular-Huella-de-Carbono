import { requestJson } from './httpClient.js';

/**
 * Cuestionario vigente, leído de MySQL a través de la API.
 * Los dos parámetros (param, signal) tienen la forma que espera useRemoteData.
 *
 * @returns {Promise<{version: string, questions: object[]}>} Preguntas con sus opciones, SIN pesos.
 */
export async function fetchCuestionario(_param, signal) {
  const data = await requestJson('/api/cuestionario', { signal });
  return { version: data.version, questions: data.questions };
}
