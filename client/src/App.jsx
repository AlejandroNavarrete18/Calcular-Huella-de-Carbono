import { useState } from 'react';
import Header from './components/layout/Header.jsx';
import Footer from './components/layout/Footer.jsx';
import IntroScreen from './screens/IntroScreen.jsx';
import QuizScreen from './screens/QuizScreen.jsx';
import ThanksScreen from './screens/ThanksScreen.jsx';
import ContactScreen from './screens/ContactScreen.jsx';
import ResultsScreen from './screens/ResultsScreen.jsx';
import { useQuiz } from './hooks/useQuiz.js';
import { useScreenTransition } from './hooks/useScreenTransition.js';
import { SCREENS, EMAIL_STATE } from './constants.js';

/** Llave que reinicia la animación de entrada: cada pregunta del cuestionario cuenta como "pantalla". */
function getScreenKey(screen, currentStep) {
  if (screen === SCREENS.QUIZ) {
    return `quiz-${currentStep}`;
  }
  return screen;
}

/**
 * Componente raíz: decide qué pantalla mostrar y coordina la navegación.
 * Flujo: introducción -> agradecimientos -> cuestionario -> formulario de correo -> resultados.
 */
export default function App() {
  const [screen, setScreen] = useState(SCREENS.INTRO);
  const [emailStatus, setEmailStatus] = useState({ state: EMAIL_STATE.SKIPPED });
  const quiz = useQuiz();
  const { transition, getAnimationClass } = useScreenTransition();

  const handleStart = () => {
    transition(() => setScreen(SCREENS.THANKS));
  };

  const handleThanksBack = () => {
    transition(() => setScreen(SCREENS.INTRO), 'prev');
  };

  const handleThanksNext = () => {
    transition(() => {
      quiz.goToStep(0);
      setScreen(SCREENS.QUIZ);
    });
  };

  const handleQuizBack = () => {
    if (quiz.currentStep === 0) {
      transition(() => setScreen(SCREENS.THANKS), 'prev');
      return;
    }
    transition(() => quiz.goToStep(quiz.currentStep - 1), 'prev');
  };

  const handleQuizNext = () => {
    if (quiz.isLastStep) {
      transition(() => setScreen(SCREENS.CONTACT));
      return;
    }
    transition(() => quiz.goToStep(quiz.currentStep + 1));
  };

  const handleContactBack = () => {
    transition(() => {
      quiz.goToStep(quiz.totalSteps - 1);
      setScreen(SCREENS.QUIZ);
    }, 'prev');
  };

  const handleContactNext = (status) => {
    setEmailStatus(status);
    transition(() => setScreen(SCREENS.RESULTS));
  };

  const handleRestart = () => {
    transition(() => {
      quiz.reset();
      setEmailStatus({ state: EMAIL_STATE.SKIPPED });
      setScreen(SCREENS.INTRO);
    }, 'prev');
  };

  // ── Pantalla actual ──
  let content = null;
  if (screen === SCREENS.INTRO) {
    content = <IntroScreen onStart={handleStart} />;
  } else if (screen === SCREENS.QUIZ) {
    content = <QuizScreen quiz={quiz} onBack={handleQuizBack} onNext={handleQuizNext} />;
  } else if (screen === SCREENS.THANKS) {
    content = <ThanksScreen onBack={handleThanksBack} onNext={handleThanksNext} />;
  } else if (screen === SCREENS.CONTACT) {
    content = <ContactScreen answers={quiz.answers} onBack={handleContactBack} onNext={handleContactNext} />;
  } else if (screen === SCREENS.RESULTS) {
    content = <ResultsScreen answers={quiz.answers} emailStatus={emailStatus} onRestart={handleRestart} />;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 w-full max-w-4xl mx-auto px-4 sm:px-8 py-6 sm:py-10">
        {/* La "key" reinicia la animación de entrada en cada pantalla/pregunta */}
        <div
          key={getScreenKey(screen, quiz.currentStep)}
          className={getAnimationClass(screen === SCREENS.QUIZ)}
        >
          {content}
        </div>
      </main>

      <Footer />
    </div>
  );
}
