/** Constantes de la interfaz. */

/** Pantallas del flujo, en orden. */
export const SCREENS = Object.freeze({
  INTRO: 'intro',
  QUIZ: 'quiz',
  THANKS: 'thanks',
  CONTACT: 'contact',
  RESULTS: 'results',
});

/** Estado del envío del correo (se muestra como aviso en los resultados). */
export const EMAIL_STATE = Object.freeze({
  SKIPPED: 'skipped', // la persona no escribió su correo
  SENT: 'sent', // correo enviado
  FAILED: 'failed', // el envío falló y se continuó sin correo
});

/** Duración (ms) de la animación de salida entre pantallas. */
export const LEAVE_MS = 220;
