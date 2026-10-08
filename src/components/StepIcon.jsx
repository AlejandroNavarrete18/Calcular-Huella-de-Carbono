import { 
  Tv, 
  Flame, 
  Lightbulb, 
  Car, 
  Clock, 
  Plane, 
  Beef, 
  Recycle, 
  Shirt 
} from 'lucide-react';

export default function StepIcon({ stepNumber, className = "w-7 h-7 text-green-600" }) {
  switch (stepNumber) {
    case 1: return <Tv className={className} />;
    case 2: return <Flame className={className} />;
    case 3: return <Lightbulb className={className} />;
    case 4: return <Car className={className} />;
    case 5: return <Clock className={className} />;
    case 6: return <Plane className={className} />;
    case 7: return <Beef className={className} />;
    case 8: return <Recycle className={className} />;
    case 9: return <Shirt className={className} />;
    default: return <Lightbulb className={className} />;
  }
}