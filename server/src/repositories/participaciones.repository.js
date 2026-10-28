const COLUMNAS_RESPUESTA = 4;

/**
 * Acceso a las tablas `participaciones` y `respuestas`.
 *
 * @param {import('mysql2/promise').Pool} pool
 */
export function createParticipacionesRepository(pool) {
  /** "(?, ?, ?, ?), (?, ?, ?, ?)..." — solo se genera la forma; los datos siempre viajan como parámetros. */
  function placeholdersRespuestas(cantidad) {
    const grupo = `(${Array(COLUMNAS_RESPUESTA).fill('?').join(', ')})`;
    return Array(cantidad).fill(grupo).join(', ');
  }

  return {
    /**
     * Guarda la participación y TODAS sus respuestas en una sola transacción:
     * o se guarda todo, o no se guarda nada.
     *
     * @param {{
     *   participacion: {nombre, apellidos, correo, telefono, fechaNacimiento, idUnidadRegional, idMunicipio,
     *                   idEscuelaFacultad, localidadComunidad, hogarKg, transporteKg, consumoKg, totalKg,
     *                   nivel, respuestasJson},
     *   respuestas: Array<{idPregunta: number, idFila: number|null, idOpcion: number}>
     * }} datos
     * @returns {Promise<number>} id de la participación creada
     */
    async guardar({ participacion, respuestas }) {
      const conexion = await pool.getConnection();
      try {
        await conexion.beginTransaction();

        const [insercion] = await conexion.execute(
          `INSERT INTO participaciones
             (nombre, apellidos, correo, telefono, fecha_nacimiento, id_unidad_regional, id_municipio,
              id_escuela_facultad, localidad_comunidad, hogar_kg, transporte_kg, consumo_kg, total_kg,
              nivel, respuestas_json)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            participacion.nombre,
            participacion.apellidos,
            participacion.correo,
            participacion.telefono,
            participacion.fechaNacimiento,
            participacion.idUnidadRegional,
            participacion.idMunicipio,
            participacion.idEscuelaFacultad,
            participacion.localidadComunidad,
            participacion.hogarKg,
            participacion.transporteKg,
            participacion.consumoKg,
            participacion.totalKg,
            participacion.nivel,
            participacion.respuestasJson,
          ]
        );
        const idParticipacion = insercion.insertId;

        const parametros = respuestas.flatMap((r) => [idParticipacion, r.idPregunta, r.idFila, r.idOpcion]);
        await conexion.execute(
          `INSERT INTO respuestas (id_participacion, id_pregunta, id_fila, id_opcion)
           VALUES ${placeholdersRespuestas(respuestas.length)}`,
          parametros
        );

        await conexion.commit();
        return idParticipacion;
      } catch (error) {
        try {
          await conexion.rollback();
        } catch {
          // Si el rollback también falla, se conserva el error original (el importante).
        }
        throw error;
      } finally {
        conexion.release();
      }
    },

    /** Marca que el correo con los resultados sí salió. */
    async marcarCorreoEnviado(idParticipacion) {
      await pool.execute('UPDATE participaciones SET correo_enviado = 1 WHERE id_participacion = ?', [idParticipacion]);
    },
  };
}
