import { createCuentasCorreoRepository } from './cuentasCorreo.repository.js';
import { createEnviosCorreoRepository } from './enviosCorreo.repository.js';

/**
 * Reúne todos los repositorios en un solo objeto.
 * Cuando se guarden participaciones y respuestas, sus repositorios se agregan aquí.
 *
 * @param {import('mysql2/promise').Pool} pool
 */
export function createRepositories(pool) {
  return {
    cuentasCorreo: createCuentasCorreoRepository(pool),
    enviosCorreo: createEnviosCorreoRepository(pool),
  };
}
