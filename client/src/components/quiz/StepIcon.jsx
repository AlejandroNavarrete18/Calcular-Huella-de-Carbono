import { Tv, Flame, Lightbulb, Car, Clock, Plane, Beef, Recycle, Shirt, Smartphone } from 'lucide-react';

/** Ícono de cada pregunta, según su número. */
const ICONS_BY_STEP = {
  1: Tv,
  2: Flame,
  3: Lightbulb,
  4: Car,
  5: Clock,
  6: Plane,
  7: Beef,
  8: Recycle,
  9: Shirt,
  10: Smartphone,
};

export default function StepIcon({ stepNumber, className = 'w-7 h-7 text-navy-700' }) {
  const Icon = ICONS_BY_STEP[stepNumber] ?? Lightbulb;
  return <Icon className={className} />;
}
