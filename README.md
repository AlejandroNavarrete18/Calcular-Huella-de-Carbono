# 🌿 Calculadora de Huella de Carbono — UAS

Aplicación web interactiva (**React + Vite + Tailwind CSS**) que estima la huella de carbono individual a partir de 10 preguntas sobre **Hogar**, **Transporte** y **Alimentación y consumo**, y puede **enviar los resultados por correo** mediante un pequeño servidor **Node.js + Nodemailer (Gmail)**.

## Contenido

- `src/` — aplicación web (pantalla de introducción, cuestionario, formulario y resultados).
- `server/` — API de correo. **Guía completa: [`server/README.md`](server/README.md)**.

## Requisitos

- **Node.js 20 o superior** (incluye `npm`). Comprueba con `node -v`.
- Una cuenta de Gmail con *contraseña de aplicación* (solo si quieres enviar correos reales; se explica en `server/README.md`).

## Instalación y uso rápido

```bash
npm run install:all                      # instala web + servidor
cp server/.env.example server/.env       # Windows: copy server\.env.example server\.env
# edita server/.env con tu Gmail y tu contraseña de aplicación
npm run dev:all                          # web en :5173 + API en :3001
```

Abre <http://localhost:5173>.

¿Aún no tienes la contraseña de aplicación? Pon `MAIL_DRY_RUN=true` en `server/.env`: el correo no se envía, se guarda en `server/.dry-run/ultimo-correo.html` para que lo veas.

## Scripts

| Comando | Descripción |
|---|---|
| `npm run dev:all` | Web + API a la vez |
| `npm run dev` | Solo la web |
| `npm run server` | Solo la API |
| `npm run build` / `npm run preview` | Compilar y previsualizar la web |
| `npm run test:server` | Pruebas automáticas del servidor |
| `npm run lint` | Revisión de código |

## Estructura

```
├── src/
│   ├── components/      Pantallas e interfaz (Intro, Question, ContactForm, Results...)
│   ├── data/questions.js    Preguntas y pesos (kg CO₂e/año)
│   ├── utils/calculator.js  Fórmula del cálculo (la usan la web Y el servidor)
│   └── services/resultsApi.js  Llamada a la API de correo
├── server/              API de correo (ver server/README.md)
└── .env.example         Variables de la web (solo producción)
```

## Cómo se calcula

La fórmula replica la lógica de la calculadora de Greenpeace México: Hogar = P1 + P2 + P3; Transporte = promedio de modos × horas (P4 × P5) + vuelos (P6); Alimentación y consumo = P7 + P8 + P9 + P10. El resultado es una **estimación orientativa**. Los pesos están en `src/data/questions.js` y la lógica en `src/utils/calculator.js`.

## Privacidad

El nombre y el correo escritos en el formulario se usan **solo** para enviar el mensaje con los resultados; **no se almacenan**. El teléfono y la fecha de nacimiento son visuales por ahora y no se transmiten.
