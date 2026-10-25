import logoUas from '../../assets/images/logo-uas.png';
import logoBienestar from '../../assets/images/logo-bienestar.png';
import logoFic from '../../assets/images/logo-fic.jpg';

/** Clases de los logos: pequeños en teléfono (para que quepan junto al título) y más grandes en pantallas amplias. */
const LOGO_CLASS = 'h-9 sm:h-14 lg:h-16 w-auto shrink-0';

/**
 * Encabezado institucional: logos de la Facultad de Informática, de Bienestar Universitario y de la UAS.
 */
export default function Header() {
  return (
    <header className="bg-white shadow-sm sm:sticky sm:top-0 z-20">
      <div className="h-1.5 bg-gradient-to-r from-navy-900 via-gold-400 to-sun-500" />
      <div className="max-w-5xl mx-auto px-3 sm:px-8 py-2 sm:py-3 flex items-center gap-3 sm:gap-4">
        <div className="flex items-center gap-2 sm:gap-4 shrink-0">
          <img src={logoFic} alt="Logo de la Facultad de Informática" className={LOGO_CLASS} />
          <img src={logoBienestar} alt="Logo de Bienestar Universitario" className={LOGO_CLASS} />
          <img src={logoUas} alt="Escudo de la Universidad Autónoma de Sinaloa" className={LOGO_CLASS} />
        </div>
        <div className="leading-tight min-w-0">
          <p className="hidden sm:block font-display text-xs font-bold tracking-[0.18em] text-sun-600 uppercase">
            Universidad Autónoma de Sinaloa
          </p>
          <p className="font-display text-xs sm:text-xl font-extrabold text-navy-900">Calculadora de Huella de Carbono</p>
        </div>
      </div>
    </header>
  );
}
