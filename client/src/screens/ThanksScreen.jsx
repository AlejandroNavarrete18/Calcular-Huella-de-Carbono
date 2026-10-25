import { HeartHandshake, ArrowLeft, ArrowRight } from 'lucide-react';

/**
 * Pantalla de agradecimientos
 *
 * @param {{onBack: () => void, onNext: () => void}} props
 */
export default function ThanksScreen({ onBack, onNext }) {
  return (
    <section data-screen="thanks" className="bg-white rounded-2xl shadow-lg border border-navy-100 overflow-hidden">
      <div className="h-1.5 bg-gradient-to-r from-gold-400 to-sun-500" />
      <div className="p-5 sm:p-10">
        <div className="flex items-start gap-3 sm:gap-4">
          <div className="shrink-0 w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-navy-900 text-gold-400 flex items-center justify-center">
            <HeartHandshake className="w-6 h-6" />
          </div>
          <div className="min-w-0">
            <p className="font-display text-xs font-bold tracking-[0.2em] uppercase text-sun-600">Agradecimientos</p>
            <h2 className="mt-1 font-display text-xl sm:text-2xl font-extrabold text-navy-900 leading-snug">
              Gracias por ser parte de esta iniciativa
            </h2>
          </div>
        </div>

        <div className="mt-6 space-y-4 text-sm sm:text-base text-ink leading-relaxed">
          <p>
            En el marco del fortalecimiento de los procesos de transformación digital y sustentabilidad institucional,
            se expresa un agradecimiento a la Directora General, <strong>Dra. Sofía Angulo de Madueña</strong>, y a la Coordinadora de
            Sustentabilidad, <strong>L.I. Magdalena Cruz Hernández</strong>, por la confianza, aceptación e impulso otorgados para dar
            continuidad al proceso de implementación del Sistema de Huella de Carbono de la Universidad Autónoma de
            Sinaloa.
          </p>
          <p>
            Asimismo, se reconoce la participación y colaboración del{' '}
            <strong>Dr. Zeus del Valle Castillo Nájera, Lic. Axel Manuel Aguilar Pérez, MC. Alejandro Yahir Sicairos Ochoa, LI. Thelma Berenice Cervantes Verdugo y Dr. José de Jesús Uriarte Adrián</strong>, así como el compromiso y la contribución de los
            estudiantes <strong>Luis Alejandro Navarrete Díaz, César Alberto López Zavala, Jesús Rubén Monzón García y Kleber Retamoza Mayorga</strong>, de la Licenciatura en Informática de la
            Facultad de Informática Culiacán de la Universidad Autónoma de Sinaloa. La colaboración de todos los
            participantes fortalece el desarrollo de esta iniciativa y reafirma el compromiso de la comunidad
            universitaria con la sustentabilidad y el cuidado del medio ambiente.
          </p>
        </div>

        <div className="mt-8 pt-5 border-t border-navy-100 flex items-center justify-between gap-3">
          <button type="button" onClick={onBack} className="btn-ghost">
            <ArrowLeft className="w-4 h-4" />
            Atrás
          </button>
          <button type="button" onClick={onNext} className="btn-primary">
            Continuar
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </section>
  );
}
