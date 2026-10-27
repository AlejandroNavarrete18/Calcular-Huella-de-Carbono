import { useMemo } from 'react';
import { TreePine, RotateCcw, Lightbulb, House, Car, Salad, MailCheck, MailWarning } from 'lucide-react';
import { CATEGORIES, SEMAPHORE, calculateFootprint } from '@huella/shared';
import { EMAIL_STATE } from '../constants.js';

/** Ícono de cada categoría (las categorías y sus nombres vienen de @huella/shared). */
const CATEGORY_ICONS = { hogar: House, transporte: Car, consumo: Salad };

function getReadableTextColor(color) {
  if (color === SEMAPHORE.yellow) {
    return '#a87a00';
  }
  return color;
}

/** Tarjeta con las emisiones de una categoría y su barra de progreso. */
function CategoryCard({ label, icon: Icon, kg, percent, color }) {
  return (
    <div className="rounded-xl bg-navy-50 border border-navy-100 p-4">
      <p className="flex items-center gap-2 text-xs text-navy-800 font-bold uppercase tracking-wide">
        <Icon className="w-4 h-4 text-sun-600" />
        {label}
      </p>
      <p className="mt-1 font-display text-xl font-extrabold text-navy-900">
        {kg.toLocaleString('es-MX')} <span className="text-sm font-bold text-muted">kg CO₂e</span>
      </p>
      <div className="w-full h-2.5 bg-navy-100 rounded-full mt-3 overflow-hidden">
        <div className="grow-width h-full rounded-full" style={{ '--target': `${percent}%`, backgroundColor: color }} />
      </div>
    </div>
  );
}

/** Aviso sobre el envío del correo. No muestra nada si la persona no escribió su correo. */
function EmailStatusBanner({ emailStatus }) {
  if (emailStatus.state === EMAIL_STATE.SENT) {
    return (
      <div
        role="status"
        className="flex items-start gap-3 rounded-xl border border-navy-100 border-l-4 border-l-gold-400 bg-white p-4 shadow-sm"
      >
        <MailCheck className="w-6 h-6 shrink-0 text-navy-700" />
        <p className="text-sm sm:text-base text-ink">
          <strong>¡Listo!</strong> Te enviamos tus resultados a <strong className="break-all">{emailStatus.email}</strong>.
          Si no lo ves en unos minutos, revisa tu carpeta de spam.
        </p>
      </div>
    );
  }

  if (emailStatus.state === EMAIL_STATE.FAILED) {
    return (
      <div
        role="status"
        className="flex items-start gap-3 rounded-xl border border-red-200 border-l-4 border-l-red-600 bg-red-50 p-4"
      >
        <MailWarning className="w-6 h-6 shrink-0 text-red-700" />
        <p className="text-sm sm:text-base text-red-900">
          No pudimos enviar el correo, pero tus resultados están aquí abajo. Puedes volver a calcular e intentarlo de
          nuevo.
        </p>
      </div>
    );
  }

  return null;
}

/**
 * Pantalla de resultados: resumen, nivel de impacto, desglose por categoría y recomendaciones.
 *
 * @param {{answers: object, emailStatus: {state: string, email?: string}, onRestart: () => void}} props
 */
export default function ResultsScreen({ answers, emailStatus, onRestart }) {
  const results = useMemo(() => calculateFootprint(answers), [answers]);

  return (
    <div className="space-y-6">
      <EmailStatusBanner emailStatus={emailStatus} />

      {/* Resumen */}
      <section className="relative overflow-hidden rounded-2xl bg-navy-900 text-white shadow-xl">
        <div className="h-1.5 bg-gradient-to-r from-gold-400 to-sun-500" />
        <div className="p-6 sm:p-10">
          <p className="font-display text-xs font-bold tracking-[0.2em] uppercase text-gold-400">Tu resultado</p>
          <h1 className="mt-2 font-display text-2xl sm:text-4xl font-extrabold leading-tight">
            {results.title}
          </h1>
          <div className="mt-4 space-y-3 text-navy-100 text-sm sm:text-base leading-relaxed max-w-3xl">
            {results.description.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
        </div>
      </section>

      {/* Termómetro + total */}
      <section className="grid grid-cols-1 md:grid-cols-5 gap-6">
        <div className="md:col-span-2 bg-white rounded-2xl border border-navy-100 shadow-md p-6 flex flex-col items-center">
          <h2 className="font-display text-sm font-bold tracking-[0.15em] uppercase text-navy-800 mb-4">
            Nivel de impacto
          </h2>
          <div
            className="w-14 h-64 rounded-full bg-navy-50 border-4 border-navy-100 p-1.5 flex flex-col justify-end overflow-hidden"
            role="img"
            aria-label={`Nivel de impacto: ${results.level}`}
          >
            <div
              className="grow-height w-full rounded-full"
              style={{ '--target': `${Math.max(results.termoPercent, 4)}%`, backgroundColor: results.levelColor }}
            />
          </div>
          <p
            className="mt-4 font-display font-extrabold text-lg uppercase tracking-wide"
            style={{ color: getReadableTextColor(results.levelColor) }}
          >
            {results.level}
          </p>
        </div>

        <div className="md:col-span-3 bg-white rounded-2xl border border-navy-100 shadow-md p-6 flex flex-col justify-center">
          <p className="text-sm font-bold text-muted uppercase tracking-wider">Tu huella estimada</p>
          <p className="mt-1 font-display text-4xl sm:text-5xl font-extrabold text-navy-900">
            {results.totalKg.toLocaleString('es-MX')}
            <span className="text-xl sm:text-2xl font-bold text-sun-600"> kg CO₂e</span>
          </p>
          <p className="text-muted">al año</p>
          <hr className="my-4 border-navy-100" />
          <p className="flex items-start gap-3 text-navy-900 font-semibold">
            <TreePine className="w-6 h-6 shrink-0 text-navy-700" />
            {results.treesText}
          </p>
        </div>
      </section>

      {/* Categorías */}
      <section className="bg-white rounded-2xl border border-navy-100 shadow-md p-6">
        <h2 className="font-display text-sm font-bold tracking-[0.15em] uppercase text-navy-800 mb-4">
          Emisiones por categoría
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {CATEGORIES.map(({ key, label }) => (
            <CategoryCard
              key={key}
              label={label}
              icon={CATEGORY_ICONS[key]}
              kg={results.breakdown[key]}
              percent={results.percentages[key]}
              color={results.barColors[key]}
            />
          ))}
        </div>
      </section>

      {/* Recomendaciones */}
      <section className="bg-white rounded-2xl border border-navy-100 border-l-4 border-l-gold-400 shadow-md p-6">
        <h2 className="flex items-center gap-2 font-display text-sm font-bold tracking-[0.15em] uppercase text-navy-800 mb-3">
          <Lightbulb className="w-5 h-5 text-gold-500" />
          Recomendaciones de acción
        </h2>
        <ul className="space-y-2 text-sm sm:text-base text-ink">
          {results.recommendations.map((tip) => (
            <li key={tip} className="flex gap-3">
              <span className="mt-2 w-2 h-2 shrink-0 rounded-full bg-sun-500" />
              {tip}
            </li>
          ))}
        </ul>
      </section>

      <div className="flex justify-center pt-2">
        <button type="button" onClick={onRestart} className="btn-primary">
          <RotateCcw className="w-5 h-5" />
          Volver a calcular
        </button>
      </div>
    </div>
  );
}
