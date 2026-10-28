import { notFound } from '../utils/errors.js';

/**
 * Catálogos del formulario (unidades regionales, escuelas y municipios).
 *
 * @param {{catalogo: ReturnType<import('../repositories/catalogo.repository.js').createCatalogoRepository>}} deps
 */
export function createCatalogoService({ catalogo }) {
  return {
    listarUnidades: () => catalogo.listarUnidades(),
    listarMunicipios: () => catalogo.listarMunicipios(),

    /** Escuelas de una unidad regional. 404 si la unidad no existe o está desactivada. */
    async listarEscuelas(idUnidad) {
      const escuelas = await catalogo.listarEscuelas(idUnidad);
      if (escuelas.length === 0 && !(await catalogo.existeUnidad(idUnidad))) {
        throw notFound('UNIDAD_NOT_FOUND', 'La unidad regional no existe.');
      }
      return escuelas;
    },
  };
}
