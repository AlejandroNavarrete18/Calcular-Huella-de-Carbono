import { ArrowLeft, ArrowRight } from 'lucide-react';
import ProgressBar from '../components/quiz/ProgressBar.jsx';
import QuestionCard from '../components/quiz/QuestionCard.jsx';

/** Pantalla del cuestionario: barra de progreso, pregunta actual y botones de navegación. */
export default function QuizScreen({ quiz, onBack, onNext }) {
  const { question, answers, currentStep, totalSteps, isStepValid, selectOption, selectMatrixCell } = quiz;

  return (
    <>
      <ProgressBar currentStep={currentStep} totalSteps={totalSteps} />

      <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-lg border border-navy-100">
        <QuestionCard
          question={question}
          answer={answers[question.id]}
          onSelectOption={selectOption}
          onSelectCell={selectMatrixCell}
        />

        {!isStepValid && (
          <p className="text-xs text-sun-600 font-bold text-right mb-2">* Selecciona una opción para poder continuar.</p>
        )}

        <div className="flex justify-between items-center pt-4 border-t border-navy-100">
          <button type="button" onClick={onBack} className="btn-ghost">
            <ArrowLeft className="w-4 h-4" />
            Atrás
          </button>
          <button type="button" disabled={!isStepValid} onClick={onNext} className="btn-primary">
            Siguiente
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </>
  );
}
