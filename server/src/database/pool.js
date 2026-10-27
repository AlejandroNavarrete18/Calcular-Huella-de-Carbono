import mysql from 'mysql2/promise';

const MAX_CONNECTIONS = 10;

/**
 * Crea el pool de conexiones a MySQL.
 * El pool no se conecta hasta la primera consulta, así que el modo dry-run funciona sin base de datos.
 *
 * @param {{host: string, port: number, user: string, password: string, database: string}} dbConfig
 */
export function createDatabasePool(dbConfig) {
  return mysql.createPool({
    ...dbConfig,
    waitForConnections: true,
    connectionLimit: MAX_CONNECTIONS,
    charset: 'utf8mb4',
    timezone: 'local',
  });
}
