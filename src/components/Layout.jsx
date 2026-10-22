import logo from '../assets/logo-uas.png';
import logobienestar from '../assets/logo-bienestar.png';

export function Header() {
  return (
    <header className="bg-white shadow-sm sticky top-0 z-20">
      <div className="h-1.5 bg-gradient-to-r from-navy-900 via-gold-400 to-sun-500" />
      <div className="max-w-5xl mx-auto px-4 sm:px-8 py-3 flex items-center gap-4">
        <img src={logobienestar} alt="Logo de Bienestar Universitario" className="h-14 sm:h-16 w-auto" />
        <img src={logo} alt="Escudo de la Universidad Autónoma de Sinaloa" className="h-14 sm:h-16 w-auto" />
        <div className="leading-tight">
          <p className="font-display text-[0.65rem] sm:text-xs font-bold tracking-[0.18em] text-sun-600 uppercase">
            Universidad Autónoma de Sinaloa
          </p>
          <p className="font-display text-base sm:text-xl font-extrabold text-navy-900">
            Calculadora de Huella de Carbono
          </p>
        </div>
      </div>
    </header>
  );
}

export function Footer() {
  return (
    <footer className="bg-navy-950 text-navy-100 mt-auto">
      <div className="h-1 bg-gradient-to-r from-sun-500 via-gold-400 to-sun-500" />
      <div className="max-w-5xl mx-auto px-4 sm:px-8 py-6 flex flex-col sm:flex-row items-center justify-between gap-2 text-center sm:text-left">
        <p className="font-display text-gold-400 font-bold tracking-[0.3em] text-sm uppercase">Sursum Versus</p>
        <p className="text-xs text-navy-100/70">
          Universidad Autónoma de Sinaloa · Calculadora de Huella de Carbono
        </p>
      </div>
    </footer>
  );
}
