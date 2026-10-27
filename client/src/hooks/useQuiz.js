import { useCallback, useState } from 'react';
import { QUESTIONS, QUESTION_TYPE, isQuestionAnswered } from '@huella/shared';

/** Agrega el elemento a la lista si no está, o lo quita si ya estaba. */
function toggleListItem(list, item) {
  if (list.includes(item)) {
    return list.filter((current) => current !== item);
  }
  return [...list, item];
}

/**
 * Estado del cuestionario: respuestas, pregunta actual y validación.
 */
export function useQuiz() {
  const [answers, setAnswers] = useState({});
  const [currentStep, setCurrentStep] = useState(0);

  const question = QUESTIONS[currentStep];
  const isLastStep = currentStep === QUESTIONS.length - 1;
  const isStepValid = isQuestionAnswered(question, answers[question.id]);

  /** Marca/desmarca una opción (checkbox) o la elige (radio). */
  const selectOption = useCallback((targetQuestion, optionId) => {
    setAnswers((previous) => {
      if (targetQuestion.type === QUESTION_TYPE.CHECKBOX) {
        const currentList = previous[targetQuestion.id] ?? [];
        return { ...previous, [targetQuestion.id]: toggleListItem(currentList, optionId) };
      }
      return { ...previous, [targetQuestion.id]: optionId };
    });
  }, []);

  /** Elige la columna de una fila en una pregunta. */
  const selectMatrixCell = useCallback((questionId, rowId, columnId) => {
    setAnswers((previous) => {
      const currentMatrix = previous[questionId] ?? {};
      return { ...previous, [questionId]: { ...currentMatrix, [rowId]: columnId } };
    });
  }, []);

  /** Borra todas las respuestas y vuelve a la primera pregunta. */
  const reset = useCallback(() => {
    setAnswers({});
    setCurrentStep(0);
  }, []);

  return {
    answers,
    question,
    currentStep,
    totalSteps: QUESTIONS.length,
    isLastStep,
    isStepValid,
    selectOption,
    selectMatrixCell,
    goToStep: setCurrentStep,
    reset,
  };
}
