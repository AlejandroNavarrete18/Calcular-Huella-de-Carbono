import { useState } from 'react';
import { Mail, ArrowRight, ArrowLeft, Loader2, TriangleAlert } from 'lucide-react';
import FormField from '../components/form/FormField.jsx';
import HoneypotField from '../components/form/HoneypotField.jsx';
import { sendResultsEmail } from '../services/resultsApi.js';
import { EMAIL_STATE, SEND_STATUS } from '../constants.js';

const EMPTY_FORM = { nombre: '', apellidos: '', email: '', telefono: '', nacimiento: '', website: '' };
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/** Texto del botón de envío según el estado (tras un error se ofrece "Reintentar"). */
function getSubmitLabel(status) {
  if (status === SEND_STATUS.ERROR) {
    return 'Reintentar';
  }
  return 'Siguiente';
}

/** Contenido del botón de envío: animacion mientras se envía */
function SubmitContent({ sending, status }) {
  if (sending) {
    return (
      <>
        <Loader2 className="w-5 h-5 animate-spin" />
        Enviando…
      </>
    );
  }
  return (
    <>
      {getSubmitLabel(status)}
      <ArrowRight className="w-5 h-5" />
    </>
  );
}

/**
 * Formulario final (todos los campos son opcionales).
 *
 * - Si la persona escribe su correo, se envían a la API SOLO su nombre, su correo y las respuestas del
 *   cuestionario, y recibe sus resultados por email.
 * - Si lo deja vacío, pasa directo a los resultados sin enviar nada.
 * - Teléfono y fecha de nacimiento son solo visuales por ahora: no se envían ni se guardan.
 *
 * @param {{answers: object, onNext: (status: {state: string, email?: string}) => void, onBack: () => void}} props
 */
export default function ContactScreen({ answers, onNext, onBack }) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [status, setStatus] = useState(SEND_STATUS.IDLE);
  const [emailError, setEmailError] = useState('');
  const [sendError, setSendError] = useState('');

  const sending = status === SEND_STATUS.SENDING;

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((previous) => ({ ...previous, [name]: value }));
    if (name === 'email') {
      setEmailError('');
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (sending) {
      return;
    }

    const email = form.email.trim();
    if (!email) {
      onNext({ state: EMAIL_STATE.SKIPPED }); // sin correo: solo mostrar resultados
      return;
    }
    if (!EMAIL_PATTERN.test(email)) {
      setEmailError('Escribe un correo válido, o déjalo en blanco para continuar sin recibirlo.');
      return;
    }

    setStatus(SEND_STATUS.SENDING);
    setSendError('');
    try {
      await sendResultsEmail({
        name: [form.nombre, form.apellidos].join(' ').trim(),
        email,
        answers,
        website: form.website,
      });
      onNext({ state: EMAIL_STATE.SENT, email });
    } catch (error) {
      setStatus(SEND_STATUS.ERROR);
      setSendError(error.message);
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
              Te enviaremos tu resultado con consejos prácticos para mejorar tu puntaje, cuidar tus hábitos de consumo y
              proteger el medio ambiente. ¡Únete al cambio!
            </p>
          </div>
        </div>

        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-x-5 gap-y-4">
          <FormField
            id="nombre"
            label="Nombre"
            type="text"
            maxLength={40}
            autoComplete="given-name"
            value={form.nombre}
            onChange={handleChange}
            disabled={sending}
          />
          <FormField
            id="apellidos"
            label="Apellidos"
            type="text"
            maxLength={40}
            autoComplete="family-name"
            value={form.apellidos}
            onChange={handleChange}
            disabled={sending}
          />
          <FormField
            id="email"
            label="Correo electrónico"
            type="email"
            maxLength={254}
            autoComplete="email"
            placeholder="Aquí recibirás tus resultados"
            value={form.email}
            onChange={handleChange}
            disabled={sending}
            error={emailError}
            className="sm:col-span-2"
          />
          <FormField
            id="telefono"
            label="Número de teléfono"
            type="tel"
            inputMode="numeric"
            autoComplete="tel"
            placeholder="Mínimo 10 números"
            value={form.telefono}
            onChange={handleChange}
            disabled={sending}
          />
          <FormField
            id="nacimiento"
            label="Fecha de nacimiento"
            type="date"
            autoComplete="bday"
            value={form.nacimiento}
            onChange={handleChange}
            disabled={sending}
          />
          <HoneypotField value={form.website} onChange={handleChange} />
        </div>

        <p className="mt-6 text-xs sm:text-sm text-muted leading-relaxed bg-navy-50 border-l-4 border-navy-700 rounded-r-lg p-3">
          Todos los campos son opcionales: puedes continuar sin llenarlos. Solo usaremos tu nombre y tu correo para
          enviarte tus resultados y no los guardamos. El teléfono y la fecha de nacimiento son ilustrativos por ahora: no
          se envían ni se almacenan.
        </p>

        {status === SEND_STATUS.ERROR && (
          <div
            role="alert"
            className="mt-5 flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800"
          >
            <TriangleAlert className="w-5 h-5 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">No pudimos enviar tu correo</p>
              <p className="mt-0.5">{sendError}</p>
              <button
                type="button"
                onClick={() => onNext({ state: EMAIL_STATE.FAILED })}
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
            <SubmitContent sending={sending} status={status} />
          </button>
        </div>
      </form>
    </section>
  );
}
