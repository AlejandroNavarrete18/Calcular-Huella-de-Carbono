/**
 * Controlador de los catálogos del formulario (solo lectura).
 *
 * @param {{catalogoService: ReturnType<import('../services/catalogo.service.js').createCatalogoService>}} deps
 */
export function createCatalogoController({ catalogoService }) {
  return {
    async listarUnidades(_req, res) {
      res.json({ ok: true, items: await catalogoService.listarUnidades() });
    },

    async listarEscuelas(req, res) {
      res.json({ ok: true, items: await catalogoService.listarEscuelas(req.params.idUnidad) });
    },

    async listarMunicipios(_req, res) {
      res.json({ ok: true, items: await catalogoService.listarMunicipios() });
    },
  };
}
