import { useState } from 'react';
import { Mail, ArrowRight, ArrowLeft, Loader2, TriangleAlert } from 'lucide-react';
import { sendResultsEmail } from '../services/resultsApi';

const EMPTY = { nombre: '', apellidos: '', email: '', telefono: '', nacimiento: '', website: '' };
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/**
 * Formulario final (todos los campos son opcionales).
 *
 * - Si la persona escribe su correo, se envían a la API SOLO su nombre, su correo y las
 *   respuestas del cuestionario, y recibe sus resultados por email.
 * - Si lo deja vacío, pasa directo a los resultados sin enviar nada.
 * - Teléfono y fecha de nacimiento son solo visuales por ahora: no se envían ni se guardan.
 * - "website" es un campo trampa (honeypot) invisible para personas; los bots suelen llenarlo.
 */
export default function ContactForm({ answers, onNext, onBack }) {
  const [form, setForm] = useState(EMPTY);
  const [status, setStatus] = useState('idle'); // idle | sending | error
  const [emailError, setEmailError] = useState('');
  const [sendError, setSendError] = useState('');

  const sending = status === 'sending';

  const update = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (e.target.name === 'email') setEmailError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (sending) return;

    const email = form.email.trim();
    if (!email) return onNext({ state: 'skipped' }); // sin correo: solo mostrar resultados

    if (!EMAIL_PATTERN.test(email)) {
      setEmailError('Escribe un correo válido, o déjalo en blanco para continuar sin recibirlo.');
      return;
    }

    setStatus('sending');
    setSendError('');
    try {
      await sendResultsEmail({
        name: [form.nombre, form.apellidos].join(' ').trim(),
        email,
        answers,
        website: form.website,
      });
      onNext({ state: 'sent', email });
    } catch (err) {
      setStatus('error');
      setSendError(err.message);
    }
  };

  return (
    <section className="bg-white rounded-2xl shadow-lg border border-navy-100 overflow-hidden">
      <div className="h-1.5 bg-gradient-to-r from-gold-400 to-sun-500" />
      <form onSubmit={handleSubmit} noValidate className="p-6 sm:p-10">
        <div className="flex items-start gap-4">
          <div className="shrink-0 w-12 h-12 rounded-full bg-navy-900 text-gold-400 flex items-center justify-center">
            <Mail className="w-6 h-6" />
          </div>
          <div>
            <p className="font-display text-xs font-bold tracking-[0.2em] uppercase text-sun-600">Último paso</p>
            <h2 className="mt-1 font-display text-xl sm:text-2xl font-extrabold text-navy-900 leading-snug">
              ¡Ya casi terminas! Déjanos tu correo para enviarte tus resultados completos
            </h2>
            <p className="mt-2 text-muted text-sm sm:text-base leading-relaxed">
              Te enviaremos tu resultado con consejos prácticos para mejorar tu puntaje, cuidar tus hábitos de
              consumo y proteger el medio ambiente. ¡Únete al cambio!
            </p>
          </div>
        </div>

        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-x-5 gap-y-4">
          <div>
            <label htmlFor="nombre" className="field-label">Nombre</label>
            <input id="nombre" name="nombre" type="text" maxLength={40} autoComplete="given-name" value={form.nombre} onChange={update} disabled={sending} className="field-input" />
          </div>
          <div>
            <label htmlFor="apellidos" className="field-label">Apellidos</label>
            <input id="apellidos" name="apellidos" type="text" maxLength={40} autoComplete="family-name" value={form.apellidos} onChange={update} disabled={sending} className="field-input" />
          </div>
          <div className="sm:col-span-2">
            <label htmlFor="email" className="field-label">Correo electrónico</label>
            <input
              id="email"
              name="email"
              type="email"
              maxLength={254}
              autoComplete="email"
              placeholder="Aquí recibirás tus resultados"
              value={form.email}
              onChange={update}
              disabled={sending}
              aria-invalid={Boolean(emailError)}
              aria-describedby={emailError ? 'email-error' : undefined}
              className="field-input"
            />
            {emailError && (
              <p id="email-error" role="alert" className="mt-1.5 text-sm font-semibold text-red-700">{emailError}</p>
            )}
          </div>
          <div>
            <label htmlFor="telefono" className="field-label">Número de teléfono</label>
            <input id="telefono" name="telefono" type="tel" inputMode="numeric" autoComplete="tel" placeholder="Mínimo 10 números" value={form.telefono} onChange={update} disabled={sending} className="field-input" />
          </div>
          <div>
            <label htmlFor="nacimiento" className="field-label">Fecha de nacimiento</label>
            <input id="nacimiento" name="nacimiento" type="date" autoComplete="bday" value={form.nacimiento} onChange={update} disabled={sending} className="field-input" />
          </div>

          {/* Campo trampa anti-bots: oculto para personas y para lectores de pantalla */}
          <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
            <label htmlFor="website">No llenar este campo</label>
            <input id="website" name="website" type="text" tabIndex={-1} autoComplete="off" value={form.website} onChange={update} />
          </div>
        </div>

        <p className="mt-6 text-xs sm:text-sm text-muted leading-relaxed bg-navy-50 border-l-4 border-navy-700 rounded-r-lg p-3">
          Todos los campos son opcionales: puedes continuar sin llenarlos. Solo usaremos tu nombre y tu correo para
          enviarte tus resultados y no los guardamos. El teléfono y la fecha de nacimiento son ilustrativos por
          ahora: no se envían ni se almacenan.
        </p>

        {status === 'error' && (
          <div role="alert" className="mt-5 flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800">
            <TriangleAlert className="w-5 h-5 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">No pudimos enviar tu correo</p>
              <p className="mt-0.5">{sendError}</p>
              <button
                type="button"
                onClick={() => onNext({ state: 'failed' })}
                className="mt-2 font-bold underline underline-offset-2 cursor-pointer"
              >
                Continuar y ver mis resultados sin enviar
              </button>
            </div>
          </div>
        )}

        <div className="mt-8 pt-5 border-t border-navy-100 flex items-center justify-between gap-3">
          <button type="button" onClick={onBack} disabled={sending} className="btn-ghost">
            <ArrowLeft className="w-4 h-4" />
            Atrás
          </button>
          <button type="submit" disabled={sending} className="btn-primary">
            {sending ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Enviando…
              </>
            ) : (
              <>
                {status === 'error' ? 'Reintentar' : 'Siguiente'}
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>
        </div>
      </form>
    </section>
  );
}
