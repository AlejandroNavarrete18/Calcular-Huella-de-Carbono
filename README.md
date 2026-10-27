# Calculadora de Huella de Carbono — UAS

Aplicación web que estima la **huella de carbono individual** a partir de 10 preguntas (Hogar, Transporte, Alimentación y consumo) y puede **enviar los resultados por correo electrónico**. Los correos salen rotando entre varias cuentas de Gmail guardadas en MySQL: cuando una llega a su límite diario (o falla), se usa la siguiente.

## Estructura del proyecto

```
Calcular-Huella-de-Carbono/
├── client/                      Interfaz web (React + Vite + Tailwind)
│   └── src/
│       ├── assets/images/       Logos de la UAS, Bienestar Universitario y la Facultad de Informática
│       ├── components/
│       │   ├── layout/          Header y Footer
│       │   ├── quiz/            Preguntas, barra de progreso e íconos
│       │   └── form/            Campos reutilizables del formulario (FormField, HoneypotField)
│       ├── screens/             Una pantalla por paso: Intro, Thanks, Quiz, Contact, Results
│       ├── hooks/               useQuiz (respuestas) y useScreenTransition (animaciones)
│       ├── services/            Comunicación con la API (resultsApi.js)
│       ├── styles/              Tema y estilos globales
│       ├── constants.js         Pantallas, estados del correo y del envío
│       └── App.jsx              Flujo entre pantallas
│
├── server/                      API (Express + Nodemailer + MySQL)
│   ├── .env.example             Variables de entorno (copiar a .env)
│   ├── assets/email/            Logos ligeros que se incrustan en el correo
│   ├── scripts/                 cifrar-contrasena.js: cifra la contraseña de una cuenta de Gmail
│   └── src/
│       ├── index.js             Arranque: config → base de datos → correo → Express
│       ├── app.js               Construcción de la aplicación Express
│       ├── config/              Variables de entorno validadas
│       ├── database/            Pool de conexiones a MySQL
│       ├── repositories/        Único lugar con SQL: un archivo por tabla (cuentasCorreo, enviosCorreo)
│       ├── services/mail/       Envío con rotación de cuentas, clasificación de errores, transportes SMTP, vista previa dry-run
│       ├── routes/              URLs de la API
│       ├── controllers/         Lógica de cada URL
│       ├── validators/          Validación de los datos entrantes
│       ├── templates/           Diseño del correo (HTML + texto)
│       ├── middleware/          Límites de uso, origen permitido, errores
│       └── utils/               Cifrado AES-256-GCM, logger, maskEmail
│
├── shared/                      Dominio compartido (@huella/shared)
│   └── src/                     questions.js (datos), calculator.js (fórmula), levels.js,
│                                answers.js (validación), categories.js, questionTypes.js, recommendations.js
│
├── database/
│   └── schema.sql               Esquema MySQL (mysqldump) de la base `huella_carbono`
│
└── package.json                 Monorepo (npm workspaces) y scripts
```

## Puesta en marcha

```bash
npm install
cp server/.env.example server/.env     # completa DB_* y MAIL_SECRET_KEY
mysql -u root -p < database/schema.sql # crea la base y las tablas
npm run dev                            # servidor (3001) + cliente (5173)
```

Para probar sin base de datos ni envío real: `MAIL_DRY_RUN=true` en `server/.env`. El correo se guarda en `server/.dry-run/ultimo-correo.html`.

### Agregar una cuenta de Gmail

1. Genera una **contraseña de aplicación** de 16 letras en la cuenta de Google.
2. Cífrala: `node server/scripts/cifrar-contrasena.js "abcd efgh ijkl mnop"`.
3. Inserta una fila en `cuentas_correo` con el correo y el texto cifrado en `contrasena_cifrada`.

La llave `MAIL_SECRET_KEY` vive solo en `server/.env`, nunca en la base de datos.

## Scripts

| Comando | Qué hace |
|---|---|
| `npm run dev` | Servidor y cliente con recarga automática |
| `npm run build` | Compila el cliente en `client/dist` |
| `npm start` | Inicia el servidor (con `SERVE_CLIENT=true` también sirve el cliente) |
| `npm run lint` | ESLint en todo el monorepo (incluye la regla **sin operadores ternarios**) |
| `npm run check` | `lint` + `build` |

## Cómo se calcula

Hogar = P1 + P2 + P3 · Transporte = promedio de modos × horas (P4 × P5) + vuelos (P6) · Alimentación y consumo = P7 + P8 + P9 + P10. El resultado es una **estimación orientativa**. Los pesos están en `shared/src/questions.js` y la fórmula en `shared/src/calculator.js`.