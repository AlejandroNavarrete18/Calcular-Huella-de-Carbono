import { useCallback, useMemo, useState } from 'react';
import { PARTICIPANT_FIELDS, validateParticipant } from '@huella/shared';

const EMPTY_FORM = Object.freeze({
  nombre: '',
  apellidos: '',
  correo: '',
  telefono: '',
  fechaNacimiento: '',
  idUnidadRegional: '',
  idMunicipio: '',
  idEscuelaFacultad: '',
  localidadComunidad: '',
  website: '', // campo trampa (honeypot): las personas no lo ven ni lo llenan
});

/**
 * Estado y validación del formulario final. Usa las MISMAS reglas que el servidor (@huella/shared).
 *
 *  - `isValid` es false mientras falte o esté mal cualquier campo (la pantalla bloquea el envío).
 *  - `errors` solo trae los campos que la persona ya tocó, para no mostrar todo en rojo desde el inicio.
 *  - `missingLabels` lista siempre lo que falta (para el aviso general).
 */
export function useParticipantForm() {
  const [values, setValues] = useState(EMPTY_FORM);
  const [touched, setTouched] = useState({});

  const validation = useMemo(() => validateParticipant(values), [values]);

  const setField = useCallback((name, value) => {
    setValues((previous) => {
      const next = { ...previous, [name]: value };
      // Cascada: al cambiar la unidad regional, la escuela elegida deja de ser válida.
      if (name === 'idUnidadRegional') {
        next.idEscuelaFacultad = '';
      }
      return next;
    });
    if (name === 'idUnidadRegional') {
      setTouched((previous) => ({ ...previous, idEscuelaFacultad: false }));
    }
  }, []);

  const touchField = useCallback((name) => {
    setTouched((previous) => ({ ...previous, [name]: true }));
  }, []);

  const errors = {};
  const missingLabels = [];
  for (const { key, label } of PARTICIPANT_FIELDS) {
    if (validation.errors[key]) {
      missingLabels.push(label);
      if (touched[key]) {
        errors[key] = validation.errors[key];
      }
    }
  }

  /**
   * Datos listos para enviar al servidor (ya normalizados) junto con las respuestas del cuestionario.
   * `cuestionarioVersion` permite al servidor avisar si el cuestionario cambió mientras la persona contestaba.
   */
  const buildPayload = useCallback(
    (answers, cuestionarioVersion) => ({ ...validation.value, answers, cuestionarioVersion, website: values.website }),
    [validation, values.website]
  );

  return {
    values,
    errors,
    missingLabels,
    isValid: validation.ok,
    setField,
    touchField,
    buildPayload,
  };
}
