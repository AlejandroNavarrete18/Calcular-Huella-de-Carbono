import { useCallback, useEffect, useRef, useState } from 'react';
import { LEAVE_MS } from '../constants.js';

/**
 * animación entre pantallas: primero anima la SALIDA del contenido actual, luego
 * aplica el cambio de estado y anima la ENTRADA del nuevo contenido.
 */
export function useScreenTransition() {
  const [phase, setPhase] = useState('in'); // 'in' (entrando/visible) | 'out' (saliendo)
  const [direction, setDirection] = useState('next'); // 'next' | 'prev'
  const timer = useRef(null);

  // Evita actualizar el estado si el componente se desmonta durante la animación.
  useEffect(() => () => clearTimeout(timer.current), []);

  /**
   * @param {() => void} change Cambio de estado a aplicar cuando termina la animación de salida.
   * @param {'next'|'prev'} [dir='next'] Hacia dónde "se mueve" el contenido.
   */
  const transition = useCallback(
    (change, dir = 'next') => {
      if (phase === 'out') {
        return;
      }
      setDirection(dir);
      setPhase('out');
      timer.current = setTimeout(() => {
        change();
        setPhase('in');
        window.scrollTo({ top: 0 });
      }, LEAVE_MS);
    },
    [phase]
  );

  /** Clase CSS (ver styles/index.css) que corresponde al momento actual de la animación. */
  const getAnimationClass = useCallback(
    (isQuizScreen) => {
      if (phase === 'out') {
        if (isQuizScreen) {
          return `leave-${direction}`;
        }
        return 'leave-screen';
      }
      if (isQuizScreen) {
        return `enter-${direction}`;
      }
      return 'enter-screen';
    },
    [phase, direction]
  );

  return { transition, getAnimationClass };
}
