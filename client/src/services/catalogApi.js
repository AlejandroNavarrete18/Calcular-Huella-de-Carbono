import { requestJson } from './httpClient.js';

/**
 * Catálogos del formulario final, leídos de MySQL a través de la API.
 * Cada función devuelve una lista de { id, nombre }.
 * Los dos primeros parámetros (param, signal) tienen la forma que espera useRemoteData.
 */

export async function fetchUnidadesRegionales(_param, signal) {
  const data = await requestJson('/api/catalogo/unidades-regionales', { signal });
  return data.items;
}

export async function fetchMunicipios(_param, signal) {
  const data = await requestJson('/api/catalogo/municipios', { signal });
  return data.items;
}

/** Escuelas y facultades de UNA unidad regional (la cascada). */
export async function fetchEscuelas(idUnidadRegional, signal) {
  const data = await requestJson(`/api/catalogo/unidades-regionales/${encodeURIComponent(idUnidadRegional)}/escuelas`, {
    signal,
  });
  return data.items;
}
