import StepIcon from './StepIcon';

export default function Question({ question, answers, onOption, onMatrix }) {
  const isCheckbox = question.type === 'checkbox';

  const isSelected = (optionId) =>
    isCheckbox ? (answers[question.id] || []).includes(optionId) : answers[question.id] === optionId;

  return (
    <>
      <div className="flex items-start gap-3">
        <div className="shrink-0 w-11 h-11 rounded-full bg-navy-900 flex items-center justify-center">
          <StepIcon stepNumber={question.number} className="w-6 h-6 text-gold-400" />
        </div>
        <div>
          <h2 className="font-display text-base sm:text-xl font-extrabold text-navy-900 uppercase leading-snug">
            {question.title}
          </h2>
          {question.subtitle && (
            <p className="mt-1 text-xs font-bold text-sun-600 tracking-wider">{question.subtitle}</p>
          )}
        </div>
      </div>

      {/* PREGUNTAS MATRICIALES (7 Y 10) */}
      {question.type === 'matrix' ? (
        <div className="overflow-x-auto my-6 rounded-xl border border-navy-100">
          <table className="w-full text-left border-collapse min-w-[500px]">
            <thead>
              <tr className="bg-navy-900 text-white">
                <th className="p-3" />
                {question.columns.map((col) => (
                  <th key={col.id} className="p-3 text-xs font-bold text-center font-display">
                    {col.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {question.rows.map((row, i) => (
                <tr key={row.id} className={`border-t border-navy-100 hover:bg-gold-300/20 ${i % 2 ? 'bg-navy-50/60' : 'bg-white'}`}>
                  <td className="p-3 font-semibold text-sm text-navy-900">{row.label}</td>
                  {question.columns.map((col) => (
                    <td key={col.id} className="p-3 text-center">
                      <input
                        type="radio"
                        aria-label={`${row.label}: ${col.label}`}
                        name={`${question.id}_${row.id}`}
                        checked={answers[question.id]?.[row.id] === col.id}
                        onChange={() => onMatrix(question.id, row.id, col.id)}
                        className="w-5 h-5 cursor-pointer"
                      />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        /* PREGUNTAS CON CHECKBOX Y RADIO */
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 my-6">
          {question.options.map((opt, i) => {
            const checked = isSelected(opt.id);
            return (
              <label
                key={opt.id}
                style={{ animationDelay: `${0.05 + i * 0.04}s` }}
                className={`pop-in flex items-center gap-3 p-3.5 border-2 rounded-xl cursor-pointer transition-all duration-200 ${
                  checked
                    ? 'border-navy-700 bg-navy-50 shadow-md -translate-y-0.5'
                    : 'border-navy-100 bg-white hover:border-gold-400 hover:bg-gold-300/10'
                }`}
              >
                <input
                  type={isCheckbox ? 'checkbox' : 'radio'}
                  name={question.id}
                  checked={checked}
                  onChange={() => onOption(question.id, opt.id, isCheckbox)}
                  className="w-5 h-5 shrink-0"
                />
                <span className="text-navy-900 font-semibold text-sm">{opt.label}</span>
              </label>
            );
          })}
        </div>
      )}
    </>
  );
}
