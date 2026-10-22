import { useEffect, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { QUESTIONS } from './data/questions';
import { calculateFootprint } from './utils/calculator';
import { Header, Footer } from './components/Layout';
import Intro from './components/Intro';
import Question from './components/Question';
import ContactForm from './components/ContactForm';
import Results from './components/Results';

const LEAVE_MS = 220; // duracion de la animacion de salida

export default function App() {
  // pantallas: intro - quiz - form - results
  const [screen, setScreen] = useState('intro');
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const [emailStatus, setEmailStatus] = useState({ state: 'skipped' }); // resultado del envío por correo
  const [phase, setPhase] = useState('in');
  const [direction, setDirection] = useState('next');
  const timer = useRef(null);

  useEffect(() => () => clearTimeout(timer.current), []);

  // Anima la salida del contenido actual, aplica el cambio y anima la entrada del nuevo
  const transition = (change, dir = 'next') => {
    if (phase === 'out') return;
    setDirection(dir);
    setPhase('out');
    timer.current = setTimeout(() => {
      change();
      setPhase('in');
      window.scrollTo({ top: 0 });
    }, LEAVE_MS);
  };

  const question = QUESTIONS[currentStep];

  // VALIDACIÓN: la pregunta actual debe estar respondida
  const isCurrentStepValid = () => {
    if (!question) return false;
    const userAnswer = answers[question.id];

    if (question.type === 'radio') return Boolean(userAnswer);
    if (question.type === 'checkbox') return Array.isArray(userAnswer) && userAnswer.length > 0;
    if (question.type === 'matrix') {
      if (!userAnswer || typeof userAnswer !== 'object') return false;
      return question.rows.every((row) => Boolean(userAnswer[row.id]));
    }
    return false;
  };

  const handleOptionChange = (questionId, optionId, isCheckbox) => {
    if (isCheckbox) {
      const currentList = answers[questionId] || [];
      const updatedList = currentList.includes(optionId)
        ? currentList.filter((id) => id !== optionId)
        : [...currentList, optionId];
      setAnswers({ ...answers, [questionId]: updatedList });
    } else {
      setAnswers({ ...answers, [questionId]: optionId });
    }
  };

  const handleMatrixChange = (questionId, rowId, colId) => {
    const currentMatrix = answers[questionId] || {};
    setAnswers({ ...answers, [questionId]: { ...currentMatrix, [rowId]: colId } });
  };

  // ── Navegacion ──
  const start = () => transition(() => { setScreen('quiz'); setCurrentStep(0); });

  const goBack = () => {
    if (currentStep === 0) transition(() => setScreen('intro'), 'prev');
    else transition(() => setCurrentStep(currentStep - 1), 'prev');
  };

  const goNext = () => {
    if (currentStep === QUESTIONS.length - 1) transition(() => setScreen('form'));
    else transition(() => setCurrentStep(currentStep + 1));
  };

  const restart = () =>
    transition(() => {
      setAnswers({});
      setEmailStatus({ state: 'skipped' });
      setCurrentStep(0);
      setScreen('intro');
    }, 'prev');

  // Clases de animacion del contenedor
  const isStepChange = screen === 'quiz';
  const animClass =
    phase === 'out'
      ? isStepChange ? `leave-${direction}` : 'leave-screen'
      : isStepChange ? `enter-${direction}` : 'enter-screen';

  const progressPercent = Math.round(((currentStep + 1) / QUESTIONS.length) * 100);
  const isValidStep = isCurrentStepValid();

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 w-full max-w-4xl mx-auto px-4 sm:px-8 py-6 sm:py-10">
        {/* La "key" reinicia la animación de entrada en cada pantalla/pregunta */}
        <div key={screen === 'quiz' ? `q-${currentStep}` : screen} className={animClass}>
          {screen === 'intro' && <Intro onStart={start} />}

          {screen === 'quiz' && (
            <>
              <div className="mb-6">
                <div className="flex justify-between text-xs sm:text-sm font-bold text-navy-900 mb-2 font-display">
                  <span>Pregunta {currentStep + 1} de {QUESTIONS.length}</span>
                  <span>{progressPercent}% completado</span>
                </div>
                <div className="w-full bg-navy-100 h-3 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-gold-400 to-sun-500 transition-all duration-500 ease-out"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>

              <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-lg border border-navy-100">
                <Question
                  question={question}
                  answers={answers}
                  onOption={handleOptionChange}
                  onMatrix={handleMatrixChange}
                />

                {!isValidStep && (
                  <p className="text-xs text-sun-600 font-bold text-right mb-2">
                    * Selecciona una opción para poder continuar.
                  </p>
                )}

                <div className="flex justify-between items-center pt-4 border-t border-navy-100">
                  <button type="button" onClick={goBack} className="btn-ghost">
                    <ArrowLeft className="w-4 h-4" />
                    Atrás
                  </button>
                  <button type="button" disabled={!isValidStep} onClick={goNext} className="btn-primary">
                    {currentStep === QUESTIONS.length - 1 ? 'Continuar' : 'Siguiente'}
                    <ArrowRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </>
          )}

          {screen === 'form' && (
            <ContactForm
              answers={answers}
              onBack={() => transition(() => { setScreen('quiz'); setCurrentStep(QUESTIONS.length - 1); }, 'prev')}
              onNext={(status) => {
                setEmailStatus(status);
                transition(() => setScreen('results'));
              }}
            />
          )}

          {screen === 'results' && <Results results={calculateFootprint(answers)} emailStatus={emailStatus} onRestart={restart} />}
        </div>
      </main>

      <Footer />
    </div>
  );
}
