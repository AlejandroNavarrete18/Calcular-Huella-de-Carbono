# Calculadora de Huella de Carbono — UAS

Aplicación web que estima la **huella de carbono individual** a partir de 10 preguntas (Hogar, Transporte, Alimentación y consumo) y puede **enviar los resultados por correo electrónico**.

## Estructura del proyecto

```
Calcular-Huella-de-Carbono/
├── client/                  Interfaz web (React + Vite)
│   ├── public/              Archivos estáticos (favicon)
│   └── src/
│       ├── assets/images/   Logos de la UAS y de Bienestar Universitario
│       ├── components/      Piezas reutilizables: layout/ (Header, Footer) y quiz/ (preguntas)
│       ├── screens/         Una pantalla por paso: Intro, Thanks, Quiz, Contact, Results
│       ├── hooks/           Lógica de estado: useQuiz, useScreenTransition
│       ├── services/        Comunicación con la API (resultsApi.js)
│       ├── styles/          Tema y estilos globales (Tailwind)
│       └── App.jsx          Flujo entre pantallas
├── server/                  API de correo (Express + Nodemailer)
│   ├── assets/email/        Logos ligeros que se incrustan en el correo
│   ├── src/
│   │   ├── config/          Variables de entorno validadas
│   │   ├── routes/          URLs de la API
│   │   ├── controllers/     Lógica de cada URL
│   │   ├── validators/      Validación de datos entrantes
│   │   ├── services/        Envío de correo (único lugar que conoce Gmail)
│   │   ├── templates/       Diseño del correo (HTML + texto)
│   │   ├── middleware/      Límites de uso, origen permitido, errores
│   │   └── utils/           Logger
├── shared/                  Dominio compartido (@huella/shared)
│   └── src/                 questions.js (datos), calculator.js (fórmula), levels.js, answers.js...
├── docs/                    Guías: correo, arquitectura y migración
├── .github/workflows/       Integración continua (CI)
└── package.json             Monorepo (npm workspaces) y scripts
```

## Cómo se calcula

Hogar = P1 + P2 + P3 · Transporte = promedio de modos × horas (P4 × P5) + vuelos (P6) · Alimentación y consumo = P7 + P8 + P9 + P10. El resultado es una **estimación orientativa**. Los pesos están en `shared/src/questions.js` y la fórmula en `shared/src/calculator.js`.