/**
 * Punto único de acceso a la lógica de cálculo de la web.
 *
 * El servidor NO confía en los resultados que calcula el navegador: recibe solo
 * las respuestas del cuestionario y vuelve a calcular la huella con exactamente
 * el mismo código que usa la interfaz. Así nadie puede usar este servicio para
 * enviar números o textos inventados con tu cuenta de Gmail.
 */
export { QUESTIONS } from '../../../src/data/questions.js';
export { calculateFootprint } from '../../../src/utils/calculator.js';
