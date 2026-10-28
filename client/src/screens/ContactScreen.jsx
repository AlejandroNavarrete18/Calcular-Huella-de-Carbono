import { useState } from 'react';
import { Mail, ArrowRight, ArrowLeft, Loader2, TriangleAlert } from 'lucide-react';
import FormField from '../components/form/FormField.jsx';
import SelectField from '../components/form/SelectField.jsx';
import HoneypotField from '../components/form/HoneypotField.jsx';
import MissingFieldsNotice from '../components/form/MissingFieldsNotice.jsx';
import { useCatalog } from '../hooks/useCatalog.js';
import { useParticipantForm } from '../hooks/useParticipantForm.js';
import { useParticipationSubmit } from '../hooks/useParticipationSubmit.js';
import { PARTICIPANT_LIMITS } from '@huella/shared';
import { SEND_STATUS } from '../constants.js';

/** Fecha de hoy como AAAA-MM-DD (la fecha de nacimiento no puede ser posterior). */
function getTodayIso() {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${now.getFullYear()}-${month}-${day}`;
}

/** Contenido del botón principal: cargando o "Ver mis resultados". */
function SubmitContent({ sending }) {
  if (sending) {
    return (
      <>
        <Loader2 className="w-5 h-5 animate-spin" />
        Guardando…
      </>
    );
  }
  return (
    <>
      Ver mis resultados
      <ArrowRight className="w-5 h-5" />
    </>
  );
}

/**
 * Formulario final (OBLIGATORIO): todos los campos deben estar completos y válidos.
 * Mientras falte algo, el botón permanece bloqueado y un aviso lista lo que falta.
 * Al enviar, el servidor guarda la participación y solo entonces se muestran los resultados.
 *
 * @param {{answers: object, questionnaireVersion: string, isQuizComplete: boolean,
 *          onBack: () => void, onSubmitted: (response: object) => void}} props
 */
export default function ContactScreen({ answers, questionnaireVersion, isQuizComplete, onBack, onSubmitted }) {
  const form = useParticipantForm();
  const catalog = useCatalog(form.values.idUnidadRegional);
  const { status, errorMessage, submit } = useParticipationSubmit();
  const [today] = useState(getTodayIso);

  const sending = status === SEND_STATUS.SENDING;
  const locked = sending || status === SEND_STATUS.DONE;
  const canSubmit = isQuizComplete && form.isValid && !locked;

  const handleChange = (event) => form.setField(event.target.name, event.target.value);
  const handleBlur = (event) => form.touchField(event.target.name);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!canSubmit) {
      return;
    }
    const response = await submit(form.buildPayload(answers, questionnaireVersion));
    if (response) {
      onSubmitted(response);
    }
  };

  const fieldProps = (name) => ({
    value: form.values[name],
    error: form.errors[name],
    onChange: handleChange,
    onBlur: handleBlur,
    disabled: locked,
  });

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
              ¡Ya casi terminas! Completa tus datos para ver y recibir tus resultados
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
            maxLength={PARTICIPANT_LIMITS.nombre}
            autoComplete="given-name"
            required
            {...fieldProps('nombre')}
          />
          <FormField
            id="apellidos"
            label="Apellidos"
            type="text"
            maxLength={PARTICIPANT_LIMITS.apellidos}
            autoComplete="family-name"
            required
            {...fieldProps('apellidos')}
          />

          <FormField
            id="correo"
            label="Correo electrónico"
            type="email"
            maxLength={PARTICIPANT_LIMITS.correo}
            autoComplete="email"
            placeholder="Aquí recibirás tus resultados"
            className="sm:col-span-2"
            required
            {...fieldProps('correo')}
          />

          {/* Cascada: Unidad Regional -> Escuela / Facultad (las escuelas se piden al servidor al elegir la unidad) */}
          <SelectField
            id="idUnidadRegional"
            label="Unidad Regional UAS"
            options={catalog.unidades.data}
            status={catalog.unidades.status}
            placeholder="Selecciona tu unidad regional"
            onRetry={catalog.unidades.reload}
            {...fieldProps('idUnidadRegional')}
          />
          <SelectField
            id="idMunicipio"
            label="Municipio"
            options={catalog.municipios.data}
            status={catalog.municipios.status}
            placeholder="Selecciona tu municipio"
            onRetry={catalog.municipios.reload}
            {...fieldProps('idMunicipio')}
          />
          <SelectField
            id="idEscuelaFacultad"
            label="Escuela / Facultad UAS"
            className="sm:col-span-2"
            options={catalog.escuelas.data}
            status={catalog.escuelas.status}
            placeholder="Selecciona tu escuela o facultad"
            waitingText="Primero elige la Unidad Regional"
            onRetry={catalog.escuelas.reload}
            {...fieldProps('idEscuelaFacultad')}
          />

          <FormField
            id="localidadComunidad"
            label="Localidad / Comunidad"
            type="text"
            maxLength={PARTICIPANT_LIMITS.localidadComunidad}
            placeholder="Ej. Costa Rica, Eldorado..."
            required
            {...fieldProps('localidadComunidad')}
          />
          <FormField
            id="telefono"
            label="Número de teléfono"
            type="tel"
            inputMode="numeric"
            autoComplete="tel"
            placeholder="Mínimo 10 números"
            required
            {...fieldProps('telefono')}
          />
          <FormField
            id="fechaNacimiento"
            label="Fecha de nacimiento"
            type="date"
            max={today}
            autoComplete="bday"
            required
            {...fieldProps('fechaNacimiento')}
          />

          <HoneypotField value={form.values.website} onChange={handleChange} />
        </div>

        <p className="mt-6 text-xs sm:text-sm text-muted leading-relaxed bg-navy-50 border-l-4 border-navy-700 rounded-r-lg p-3">
          Todos los campos son obligatorios para poder mostrarte tus resultados. Usaremos tu información para generar
          reportes estadísticos y enviarte tus resultados por correo.
        </p>

        <MissingFieldsNotice missingLabels={form.missingLabels} quizIncomplete={!isQuizComplete} />

        {status === SEND_STATUS.ERROR && (
          <div
            role="alert"
            className="mt-5 flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800"
          >
            <TriangleAlert className="w-5 h-5 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">No pudimos guardar tu participación</p>
              <p className="mt-0.5">{errorMessage}</p>
            </div>
          </div>
        )}

        <div className="mt-8 pt-5 border-t border-navy-100 flex items-center justify-between gap-3">
          <button type="button" onClick={onBack} disabled={locked} className="btn-ghost">
            <ArrowLeft className="w-4 h-4" /> Atrás
          </button>
          <button type="submit" disabled={!canSubmit} className="btn-primary">
            <SubmitContent sending={sending} />
          </button>
        </div>
      </form>
    </section>
  );
}
