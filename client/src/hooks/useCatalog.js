import { useRemoteData } from './useRemoteData.js';
import { fetchEscuelas, fetchMunicipios, fetchUnidadesRegionales } from '../services/catalogApi.js';

const NO_ITEMS = Object.freeze([]);
const LIST_OPTIONS = Object.freeze({ emptyValue: NO_ITEMS });

/**
 * Catálogos del formulario final con la lógica en cascada:
 * las escuelas SOLO se piden cuando hay una unidad regional elegida, y se vuelven a pedir cada vez que cambia.
 *
 * @param {string} idUnidadRegional Valor del <select> de unidad regional ('' si no hay ninguna elegida).
 */
export function useCatalog(idUnidadRegional) {
  const unidades = useRemoteData(fetchUnidadesRegionales, 'todas', LIST_OPTIONS);
  const municipios = useRemoteData(fetchMunicipios, 'todos', LIST_OPTIONS);
  const escuelas = useRemoteData(fetchEscuelas, idUnidadRegional, {
    emptyValue: NO_ITEMS,
    enabled: idUnidadRegional !== '',
  });

  return { unidades, municipios, escuelas };
}
