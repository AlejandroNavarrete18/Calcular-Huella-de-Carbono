import { useState } from 'react';
import { QUESTIONS } from './data/questions';
import { calculateFootprint } from './utils/calculator';
import StepIcon from './components/StepIcon';

export default function App() {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState({});

  const question = QUESTIONS[currentStep];
  const isLastStep = currentStep === QUESTIONS.length;

  // VALIDACIÓN: Comprueba si la pregunta actual está respondida obligatoriamente
  const isCurrentStepValid = () => {
    if (!question) return false;
    const userAnswer = answers[question.id];

    if (question.type === 'radio') {
      return Boolean(userAnswer);
    }

    if (question.type === 'checkbox') {
      return Array.isArray(userAnswer) && userAnswer.length > 0;
    }

    if (question.type === 'matrix') {
      if (!userAnswer || typeof userAnswer !== 'object') return false;
      // Verifica que cada fila de la matriz tenga seleccionada una columna
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
    setAnswers({
      ...answers,
      [questionId]: {
        ...currentMatrix,
        [rowId]: colId,
      },
    });
  };

  const isOptionSelected = (questionId, optionId, isCheckbox) => {
    if (isCheckbox) return (answers[questionId] || []).includes(optionId);
    return answers[questionId] === optionId;
  };

  // PANTALLA FINAL DE RESULTADOS
  if (isLastStep) {
    const results = calculateFootprint(answers);
    const fillPercentage = Math.min(Math.round((results.totalKg / 8000) * 100), 100);

    return (
      <div className="min-h-screen bg-green-900 text-white flex flex-col items-center justify-center p-4 sm:p-8">
        <div className="max-w-4xl w-full bg-green-950 p-6 sm:p-10 rounded-2xl shadow-2xl border border-green-700 text-center space-y-8">
          <h1 className="text-2xl sm:text-4xl font-extrabold uppercase text-yellow-300 tracking-wide">
            RESULTADO: TU HUELLA DE CARBONO ANUAL
          </h1>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div className="flex flex-col items-center bg-green-900/50 p-6 rounded-xl border border-green-800">
              <div className="w-16 h-64 bg-gray-200 rounded-full p-2 relative flex flex-col justify-end border-4 border-white shadow-inner">
                <div
                  className={`w-full rounded-full transition-all duration-1000 ${results.levelBg}`}
                  style={{ height: `${fillPercentage}%` }}
                />
              </div>
              <p className="mt-4 font-bold text-xl uppercase tracking-wider text-yellow-300">
                Nivel: {results.level}
              </p>
            </div>

            <div className="text-left space-y-4 bg-green-900/50 p-6 rounded-xl border border-green-800">
              <p className="text-2xl sm:text-3xl font-extrabold">
                Produces <span className="text-yellow-300">{results.totalKg} kg</span> de CO2e al año.
              </p>
              <hr className="border-green-700 my-2" />
              <div className="space-y-3 text-sm sm:text-base">
                <p>🌳 Equivale a cortar aproximadamente <span className="font-extrabold text-yellow-300">{results.treesNeeded} árboles</span> al año.</p>
                <p>🚗 Equivale a recorrer <span className="font-extrabold text-yellow-300">{results.carKm} km</span> en un automóvil particular.</p>
              </div>
            </div>
          </div>

          <div className="bg-green-900/40 p-6 rounded-xl border border-green-800 text-left">
            <h3 className="text-lg font-bold text-yellow-300 uppercase mb-4">Emisiones por Categoría</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-green-950 p-4 rounded-lg border border-green-800">
                <p className="text-xs text-gray-400 font-bold uppercase">🏠 Hogar</p>
                <p className="text-xl font-extrabold text-white">{results.breakdown.hogar} kg CO2e</p>
              </div>
              <div className="bg-green-950 p-4 rounded-lg border border-green-800">
                <p className="text-xs text-gray-400 font-bold uppercase">🚗 Transporte</p>
                <p className="text-xl font-extrabold text-white">{results.breakdown.transporte} kg CO2e</p>
              </div>
              <div className="bg-green-950 p-4 rounded-lg border border-green-800">
                <p className="text-xs text-gray-400 font-bold uppercase">🥗 Consumo</p>
                <p className="text-xl font-extrabold text-white">{results.breakdown.consumo} kg CO2e</p>
              </div>
            </div>
          </div>

          <div className="bg-green-900/40 p-6 rounded-xl border border-green-800 text-left">
            <h3 className="text-lg font-bold text-yellow-300 uppercase mb-3">Recomendaciones de Acción</h3>
            <ul className="list-disc list-inside space-y-2 text-sm sm:text-base text-gray-200">
              {results.recommendations.map((rec, index) => (
                <li key={index}>{rec}</li>
              ))}
            </ul>
          </div>

          <button
            onClick={() => {
              setAnswers({});
              setCurrentStep(0);
            }}
            className="px-8 py-3 bg-yellow-400 hover:bg-yellow-300 text-green-950 font-extrabold rounded-full text-lg cursor-pointer transition-transform hover:scale-105"
          >
            VOLVER A CALCULAR
          </button>
        </div>
      </div>
    );
  }

  const progressPercent = Math.round(((currentStep + 1) / QUESTIONS.length) * 100);
  const isValidStep = isCurrentStepValid();

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-between p-4 sm:p-8 text-gray-800">
      <div className="w-full max-w-4xl mb-6">
        <div className="flex justify-between text-xs sm:text-sm font-bold text-green-900 mb-2">
          <span>Pregunta {currentStep + 1} de {QUESTIONS.length}</span>
          <span>{progressPercent}% Completado</span>
        </div>
        <div className="w-full bg-gray-300 h-3 rounded-full overflow-hidden">
          <div
            className="bg-green-600 h-full transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-lg max-w-4xl w-full border border-gray-200 my-auto">
        <div className="flex items-center space-x-3 mb-2">
          <StepIcon stepNumber={question.number} />
          <h2 className="text-lg sm:text-xl font-extrabold text-green-900 uppercase">
            {question.title}
          </h2>
        </div>

        {question.subtitle && (
          <p className="text-xs font-bold text-green-700 mb-6 pl-10 tracking-wider">
            {question.subtitle}
          </p>
        )}

        {/* PREGUNTAS MATRICIALES (PREGUNTAS 7 Y 10) */}
        {question.type === 'matrix' ? (
          <div className="overflow-x-auto my-6">
            <table className="w-full text-left border-collapse min-w-[500px]">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="p-3 text-sm font-bold text-gray-500">-</th>
                  {question.columns.map((col) => (
                    <th key={col.id} className="p-3 text-xs font-bold text-gray-600 text-center">
                      {col.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {question.rows.map((row) => (
                  <tr key={row.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="p-3 font-semibold text-sm text-gray-700">{row.label}</td>
                    {question.columns.map((col) => {
                      const isSelected = answers[question.id]?.[row.id] === col.id;
                      return (
                        <td key={col.id} className="p-3 text-center">
                          <input
                            type="radio"
                            name={`${question.id}_${row.id}`}
                            checked={isSelected}
                            onChange={() => handleMatrixChange(question.id, row.id, col.id)}
                            className="w-5 h-5 text-green-600 focus:ring-green-500 cursor-pointer"
                          />
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          /* PREGUNTAS CON CHECKBOX Y RADIO */
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 my-6">
            {question.options.map((opt) => {
              const isChecked = isOptionSelected(question.id, opt.id, question.type === 'checkbox');
              return (
                <label
                  key={opt.id}
                  className={`flex items-center space-x-3 p-3.5 border-2 rounded-xl cursor-pointer transition-all ${
                    isChecked
                      ? 'border-green-600 bg-green-50'
                      : 'border-gray-200 hover:border-green-300'
                  }`}
                >
                  <input
                    type={question.type === 'checkbox' ? 'checkbox' : 'radio'}
                    name={question.id}
                    checked={isChecked}
                    onChange={() => handleOptionChange(question.id, opt.id, question.type === 'checkbox')}
                    className="w-5 h-5 text-green-600 focus:ring-green-500 rounded"
                  />
                  <span className="text-gray-700 font-semibold text-sm">{opt.label}</span>
                </label>
              );
            })}
          </div>
        )}

        {/* MENSAJE DE ADVERTENCIA CUANDO NO ESTÁ CONTESTADA */}
        {!isValidStep && (
          <p className="text-xs text-red-500 font-bold text-right mb-2">
            * Selecciona una opción para poder continuar.
          </p>
        )}

        {/* NAVEGACIÓN */}
        <div className="flex justify-between items-center pt-4 border-t border-gray-100">
          <button
            disabled={currentStep === 0}
            onClick={() => setCurrentStep(currentStep - 1)}
            className="px-6 py-2.5 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-xl disabled:opacity-30 font-bold cursor-pointer transition-all"
          >
            ATRÁS
          </button>

          <button
            disabled={!isValidStep}
            onClick={() => setCurrentStep(currentStep + 1)}
            className={`px-8 py-2.5 rounded-xl font-bold transition-all ${
              isValidStep
                ? 'bg-green-600 hover:bg-green-700 text-white cursor-pointer shadow-md'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed opacity-60'
            }`}
          >
            {currentStep === QUESTIONS.length - 1 ? 'VER RESULTADOS' : 'SIGUIENTE'}
          </button>
        </div>
      </div>

      <div className="text-xs text-gray-400 mt-4 text-center">
        Calculadora de Huella de Carbono — Inspirada en Greenpeace
      </div>
    </div>
  );
}