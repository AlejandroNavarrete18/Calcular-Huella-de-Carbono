/** Punto de entrada del paquete @huella/shared: solo lo que usan el cliente y el servidor. */
export { QUESTION_TYPE } from './questionTypes.js';
export { CATEGORIES } from './categories.js';
export { calculateFootprint, COMMUTE_QUESTIONS } from './calculator.js';
export { isQuestionAnswered, areAllQuestionsAnswered, getAnswerErrors } from './answers.js';
export { findQuestionnaireProblems, toPublicQuestionnaire } from './questionnaire.js';
export { PARTICIPANT_FIELDS, PARTICIPANT_LIMITS, validateParticipant } from './participant.js';
export { SEMAPHORE } from './levels.js';
