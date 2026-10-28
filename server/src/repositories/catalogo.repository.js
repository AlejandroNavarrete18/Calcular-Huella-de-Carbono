/**
 * Acceso a los catálogos que llenan el formulario: unidades regionales, escuelas/facultades y municipios.
 * Solo devuelve registros activos. Todas las consultas son parametrizadas.
 *
 * @param {import('mysql2/promise').Pool} pool
 */
export function createCatalogoRepository(pool) {
  const aItems = (filas) => filas.map(({ id, nombre }) => ({ id, nombre }));

  return {
    async listarUnidades() {
      const [filas] = await pool.execute(
        `SELECT id_unidad_regional AS id, nombre
           FROM unidades_regionales
          WHERE activo = 1
          ORDER BY id_unidad_regional`
      );
      return aItems(filas);
    },

    async existeUnidad(idUnidad) {
      const [filas] = await pool.execute(
        'SELECT 1 AS existe FROM unidades_regionales WHERE id_unidad_regional = ? AND activo = 1',
        [idUnidad]
      );
      return filas.length > 0;
    },

    /** Escuelas de UNA unidad regional. La opción "Otra / No aparece..." se muestra al final de la lista. */
    async listarEscuelas(idUnidad) {
      const [filas] = await pool.execute(
        `SELECT id_escuela_facultad AS id, nombre
           FROM escuelas_facultades
          WHERE id_unidad_regional = ? AND activo = 1
          ORDER BY nombre LIKE 'Otra%', nombre`,
        [idUnidad]
      );
      return aItems(filas);
    },

    async listarMunicipios() {
      const [filas] = await pool.execute('SELECT id_municipio AS id, nombre FROM municipios WHERE activo = 1 ORDER BY nombre');
      return aItems(filas);
    },

    /**
     * Comprueba en UNA consulta que la unidad y el municipio existen y que la escuela
     * pertenece de verdad a esa unidad (la misma regla que la clave foránea compuesta de la base).
     */
    async validarReferencias({ idUnidadRegional, idMunicipio, idEscuelaFacultad }) {
      const [[fila]] = await pool.execute(
        `SELECT
           EXISTS(SELECT 1 FROM unidades_regionales WHERE id_unidad_regional = ? AND activo = 1) AS unidad,
           EXISTS(SELECT 1 FROM municipios WHERE id_municipio = ? AND activo = 1) AS municipio,
           EXISTS(SELECT 1 FROM escuelas_facultades
                   WHERE id_escuela_facultad = ? AND id_unidad_regional = ? AND activo = 1) AS escuela`,
        [idUnidadRegional, idMunicipio, idEscuelaFacultad, idUnidadRegional]
      );
      return {
        unidad: fila.unidad === 1,
        municipio: fila.municipio === 1,
        escuela: fila.escuela === 1,
      };
    },
  };
}
