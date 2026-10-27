import { useState } from 'react';
import { Mail, ArrowRight, ArrowLeft, Loader2, TriangleAlert } from 'lucide-react';
import { sendResultsEmail } from '../services/resultsApi.js';
import { EMAIL_STATE } from '../constants.js';

// --- CATÁLOGO COMPLETO UAS POR UNIDAD REGIONAL ---
const UAS_DATA = {
  norte: {
    municipios: ['Ahome', 'El Fuerte', 'Choix', 'Guasave (Noroeste / Juan José Ríos)'],
    instituciones: [
      // Facultades y Escuelas Nivel Superior
      'Facultad de Agricultura del Valle del Fuerte',
      'Facultad de Derecho y Ciencia Política (Mochis)',
      'Facultad de Ingeniería Mochis',
      'Facultad de Ciencias Económicas y Administrativas (FCEAT)',
      'Facultad de Trabajo Social (Mochis)',
      'Escuela de Enfermería Los Mochis',
      'Unidad Académica de Negocios (Mochis)',
      'Extensión Facultad de Psicología (Mochis)',
      'Extensión Ciencias de la Educación (Mochis)',
      'Escuela Superior de Educación Física (Mochis)',
      // Preparatorias
      'Preparatoria C.U. Mochis',
      'Preparatoria Mochis',
      'Preparatoria Valle del Carrizo',
      'Preparatoria Choix',
      'Preparatoria El Fuerte',
      'Preparatoria San Blas',
      'Preparatoria Juan José Ríos',
      'Preparatoria Ruiz Cortines',
      'Otra / No aparece en la lista'
    ]
  },
  'centro-norte': {
    municipios: ['Guasave', 'Salvador Alvarado (Guamúchil)', 'Angostura', 'Mocorito', 'Sinaloa de Leyva'],
    instituciones: [
      // Facultades y Escuelas Nivel Superior
      'Facultad de Ciencias Económicas Administrativas Técnológicas (FCEAT Guamúchil)',
      'Facultad de Administración Agropecuaria y Desarrollo Rural (Guamúchil)',
      'Escuela de Ciencias Económicas y Administrativas (Guasave)',
      'Escuela de Derecho (Guasave)',
      'Extensión Facultad de Psicología (Guasave)',
      'Extensión Facultad de Contaduría y Administración (Sinaloa de Leyva)',
      // Preparatorias
      'Preparatoria Guasave Diurna',
      'Preparatoria Venancio Leyva Murillo',
      'Preparatoria Casa Blanca',
      'Preparatoria Guamúchil',
      'Preparatoria Lázaro Cárdenas',
      'Preparatoria Angostura',
      'Preparatoria La Reforma',
      'Preparatoria Mocorito',
      'Otra / No aparece en la lista'
    ]
  },
  centro: {
    municipios: ['Culiacán', 'Navolato', 'Badiraguato', 'Elota', 'Cosalá'],
    instituciones: [
      // Facultades y Escuelas Nivel Superior
      'Facultad de Informática Culiacán (FIC)',
      'Facultad de Contaduría y Administración (FCA)',
      'Facultad de Medicina',
      'Facultad de Odontología',
      'Facultad de Derecho (Culiacán)',
      'Facultad de Arquitectura',
      'Facultad de Ingeniería Culiacán',
      'Facultad de Ciencias de la Tierra y el Espacio (FACITE)',
      'Facultad de Biología',
      'Facultad de Agronomía',
      'Facultad de Medicina Veterinaria y Zootecnia',
      'Facultad de Psicología (Culiacán)',
      'Facultad de Ciencias de la Nutrición y Gastronomía',
      'Facultad de Educación Física y Deportes',
      'Escuela Superior de Enfermería (Culiacán)',
      'Escuela de Ciencias Computacionales (Navolato)',
      'Escuela de Filosofía y Letras',
      'Escuela de Ciencias Antropológicas',
      'Centro de Estudio de Idiomas (CEI Culiacán)',
      'Unidad Académica de Artes / Escuela de Diseño y Artes Visuales',
      // Preparatorias (Culiacán - Zona A)
      'Preparatoria Central Diurna',
      'Preparatoria Central Nocturna',
      'Preparatoria Hermanos Flores Magón',
      'Preparatoria Emiliano Zapata',
      'Preparatoria Augusto César Sandino',
      'Preparatoria Rafael Buelna Tenorio',
      'Preparatoria Dr. Salvador Allende',
      // Preparatorias (Resto - Zona B)
      'Preparatoria Navolato',
      'Preparatoria Badiraguato',
      'Preparatoria Heraclio Bernal (Cosalá)',
      'Preparatoria La Cruz (Elota)',
      'Preparatoria Carlos Marx (Costa Rica)',
      'Preparatoria Vladimir Lenin (Eldorado)',
      'Preparatoria Quilá',
      'Preparatoria Genaro Vázquez Rojas',
      'Otra / No aparece en la lista'
    ]
  },
  sur: {
    municipios: ['Mazatlán', 'Rosario', 'Escuinapa', 'Concordia', 'San Ignacio'],
    instituciones: [
      // Facultades y Escuelas Nivel Superior
      'Facultad de Informática Mazatlán (FIMAZ)',
      'Facultad de Ciencias del Mar (FACIMAR)',
      'Facultad de Ciencias Sociales (Mazatlán)',
      'Facultad de Derecho (Mazatlán)',
      'Facultad de Turismo',
      // Preparatorias
      'Preparatoria Antonio Rosales (Mazatlán)',
      'Preparatoria Rubén Jaramillo (Mazatlán)',
      'Preparatoria Escuinapa',
      'Preparatoria Rosario',
      'Preparatoria San Ignacio',
      'Preparatoria Concordia',
      'Preparatoria Villa Unión',
      'Otra / No aparece en la lista'
    ]
  }
};

const EMPTY_FORM = { 
  nombre: '', 
  apellidos: '', 
  email: '', 
  telefono: '', 
  nacimiento: '', 
  unidadRegional: '',
  institucionFacultad: '',
  otraInstitucion: '', 
  municipio: '',
  localidad: '',
  website: '' 
};

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function getEmailErrorId(emailError) {
  if (emailError) return 'email-error';
  return undefined;
}

function getSubmitLabel(status) {
  if (status === 'error') return 'Reintentar';
  return 'Siguiente';
}

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

export default function ContactScreen({ answers, onNext, onBack }) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [status, setStatus] = useState('idle');
  const [emailError, setEmailError] = useState('');
  const [sendError, setSendError] = useState('');

  const sending = status === 'sending';

  const handleChange = (event) => {
    const { name, value } = event.target;
    
    setForm((previous) => {
      const updatedForm = { ...previous, [name]: value };

      // Si cambia la unidad regional, limpiamos municipio e institución
      if (name === 'unidadRegional') {
        updatedForm.municipio = '';
        updatedForm.institucionFacultad = '';
        updatedForm.otraInstitucion = '';
      }
      return updatedForm;
    });

    if (name === 'email') {
      setEmailError('');
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (sending) return;

    const email = form.email.trim();
    if (!email) {
      onNext({ state: EMAIL_STATE.SKIPPED });
      return;
    }
    if (!EMAIL_PATTERN.test(email)) {
      setEmailError('Escribe un correo válido, o déjalo en blanco para continuar sin recibirlo.');
      return;
    }

    const institucionFinal = form.institucionFacultad === 'Otra / No aparece en la lista' 
      ? form.otraInstitucion.trim() 
      : form.institucionFacultad;

    setStatus('sending');
    setSendError('');
    try {
      await sendResultsEmail({
        name: [form.nombre, form.apellidos].join(' ').trim(),
        email,
        unidadRegional: form.unidadRegional,
        institucionFacultad: institucionFinal,
        municipio: form.municipio,
        localidad: form.localidad,
        answers,
        website: form.website,
      });
      onNext({ state: EMAIL_STATE.SENT, email });
    } catch (error) {
      setStatus('error');
      setSendError(error.message);
    }
  };

  // Convertimos a minúsculas para coincidir con UAS_DATA
  const regionKey = form.unidadRegional ? form.unidadRegional.toLowerCase() : '';
  const opcionesActuales = UAS_DATA[regionKey] || { municipios: [], instituciones: [] };

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
              ¡Ya casi terminas! Déjanos tu correo para enviarte tus resultados
            </h2>
            <p className="mt-2 text-muted text-sm sm:text-base leading-relaxed">
              Te enviaremos tu resultado con consejos prácticos para mejorar tu puntaje, cuidar tus hábitos de consumo y
              proteger el medio ambiente. ¡Únete al cambio!
            </p>
          </div>
        </div>

        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-x-5 gap-y-4">
          {/* Nombre y Apellidos */}
          <div>
            <label htmlFor="nombre" className="field-label">Nombre</label>
            <input id="nombre" name="nombre" type="text" maxLength={40} autoComplete="given-name" value={form.nombre} onChange={handleChange} disabled={sending} className="field-input" />
          </div>
          <div>
            <label htmlFor="apellidos" className="field-label">Apellidos</label>
            <input id="apellidos" name="apellidos" type="text" maxLength={40} autoComplete="family-name" value={form.apellidos} onChange={handleChange} disabled={sending} className="field-input" />
          </div>

          <div className="sm:col-span-2">
            <label htmlFor="email" className="field-label">Correo electrónico</label>
            <input id="email" name="email" type="email" maxLength={254} autoComplete="email" placeholder="Aquí recibirás tus resultados" value={form.email} onChange={handleChange} disabled={sending} aria-invalid={Boolean(emailError)} aria-describedby={getEmailErrorId(emailError)} className="field-input" />
            {emailError && (
              <p id="email-error" role="alert" className="mt-1.5 text-sm font-semibold text-red-700">
                {emailError}
              </p>
            )}
          </div>

          {/* --- INFORMACIÓN INSTITUCIONAL UAS --- */}
          <div>
            <label htmlFor="unidadRegional" className="field-label">Unidad Regional UAS</label>
            <select id="unidadRegional" name="unidadRegional" value={form.unidadRegional} onChange={handleChange} disabled={sending} className="field-input bg-white">
              <option value="" disabled>Selecciona tu unidad regional</option>
              <option value="norte">Unidad Regional Norte</option>
              <option value="centro-norte">Unidad Regional Centro-Norte</option>
              <option value="centro">Unidad Regional Centro</option>
              <option value="sur">Unidad Regional Sur</option>
            </select>
          </div>

          <div>
            <label htmlFor="municipio" className="field-label">Municipio</label>
            <select 
              id="municipio" 
              name="municipio" 
              value={form.municipio} 
              onChange={handleChange} 
              disabled={sending || !form.unidadRegional} 
              className="field-input bg-white disabled:bg-gray-100 disabled:text-gray-400"
            >
              <option value="" disabled>
                {form.unidadRegional ? 'Selecciona tu municipio' : 'Primero elige la Unidad Regional'}
              </option>
              {opcionesActuales.municipios.map((muni) => (
                <option key={muni} value={muni}>{muni}</option>
              ))}
            </select>
          </div>

          <div className="sm:col-span-2">
            <label htmlFor="institucionFacultad" className="field-label">Escuela / Facultad UAS</label>
            <select 
              id="institucionFacultad" 
              name="institucionFacultad" 
              value={form.institucionFacultad} 
              onChange={handleChange} 
              disabled={sending || !form.unidadRegional} 
              className="field-input bg-white disabled:bg-gray-100 disabled:text-gray-400"
            >
              <option value="" disabled>
                {form.unidadRegional ? 'Selecciona tu escuela o facultad' : 'Primero elige la Unidad Regional'}
              </option>
              {opcionesActuales.instituciones.map((inst) => (
                <option key={inst} value={inst}>{inst}</option>
              ))}
            </select>
          </div>

          {/* Si elige Otra Escuela, mostramos un campo para escribirla */}
          {form.institucionFacultad === 'Otra / No aparece en la lista' && (
            <div className="sm:col-span-2">
              <label htmlFor="otraInstitucion" className="field-label">Especifica el nombre de tu escuela</label>
              <input id="otraInstitucion" name="otraInstitucion" type="text" maxLength={80} placeholder="Ej. Preparatoria Sandino, Facultad de Odontología, etc." value={form.otraInstitucion} onChange={handleChange} disabled={sending} className="field-input" />
            </div>
          )}

          {/* --- DATOS ADICIONALES --- */}
          <div>
            <label htmlFor="localidad" className="field-label">Localidad / Comunidad (Opcional)</label>
            <input id="localidad" name="localidad" type="text" maxLength={50} placeholder="Ej. Costa Rica, Eldorado..." value={form.localidad} onChange={handleChange} disabled={sending} className="field-input" />
          </div>

          <div>
            <label htmlFor="telefono" className="field-label">Número de teléfono</label>
            <input id="telefono" name="telefono" type="tel" inputMode="numeric" autoComplete="tel" placeholder="Mínimo 10 números" value={form.telefono} onChange={handleChange} disabled={sending} className="field-input" />
          </div>

          <div>
            <label htmlFor="nacimiento" className="field-label">Fecha de nacimiento</label>
            <input id="nacimiento" name="nacimiento" type="date" autoComplete="bday" value={form.nacimiento} onChange={handleChange} disabled={sending} className="field-input" />
          </div>

          <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
            <label htmlFor="website">No llenar este campo</label>
            <input id="website" name="website" type="text" tabIndex={-1} autoComplete="off" value={form.website} onChange={handleChange} />
          </div>
        </div>

        <p className="mt-6 text-xs sm:text-sm text-muted leading-relaxed bg-navy-50 border-l-4 border-navy-700 rounded-r-lg p-3">
          Todos los campos son opcionales: puedes continuar sin llenarlos. Solo usaremos tu información básica para generar reportes estadísticos y enviarte tus resultados. El teléfono y la fecha de nacimiento no se almacenan.
        </p>

        {status === 'error' && (
          <div role="alert" className="mt-5 flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800">
            <TriangleAlert className="w-5 h-5 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">No pudimos enviar tu correo</p>
              <p className="mt-0.5">{sendError}</p>
              <button type="button" onClick={() => onNext({ state: EMAIL_STATE.FAILED })} className="mt-2 font-bold underline underline-offset-2 cursor-pointer">
                Continuar y ver mis resultados sin enviar
              </button>
            </div>
          </div>
        )}

        <div className="mt-8 pt-5 border-t border-navy-100 flex items-center justify-between gap-3">
          <button type="button" onClick={onBack} disabled={sending} className="btn-ghost">
            <ArrowLeft className="w-4 h-4" /> Atrás
          </button>
          <button type="submit" disabled={sending} className="btn-primary">
            <SubmitContent sending={sending} status={status} />
          </button>
        </div>
      </form>
    </section>
  );
}