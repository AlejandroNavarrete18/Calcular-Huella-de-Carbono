# Calculadora de Huella de Carbono — UAS

Aplicación web que estima la **huella de carbono individual** a partir de un cuestionario (Hogar, Transporte, Alimentación y consumo). **Versión 3.5**: todo se guarda en MySQL, **las preguntas, opciones y pesos se leen de la base de datos** (se editan sin tocar código) y los resultados solo se entregan cuando el cuestionario y el formulario final están completos.

## Cómo funciona el flujo (v3.5)

1. La persona responde **todas las preguntas** que haya en la base (el botón *Siguiente* se bloquea hasta responder cada una).
2. En el **formulario final** todos los campos son obligatorios. La **Unidad Regional** se lee de MySQL y, al elegirla, la lista de **Escuelas / Facultades** se vuelve a pedir al servidor solo con las de esa unidad.
3. `POST /api/participaciones` valida todo **otra vez en el servidor** (`400` si falta algo), guarda la participación y sus respuestas en una transacción, **calcula** los resultados y los devuelve. La pantalla de resultados solo existe después de esa respuesta.
4. El correo con los resultados se envía en segundo plano (rotando cuentas de Gmail guardadas en MySQL); el resultado se muestra sin esperarlo.

### API

| Método y ruta | Qué hace |
|---|---|
| `GET /api/health` | Comprueba que el servidor está vivo |
| `GET /api/cuestionario` | Preguntas y opciones vigentes, leídas de MySQL (sin pesos) y su `version` |
| `GET /api/catalogo/unidades-regionales` | Unidades regionales activas |
| `GET /api/catalogo/unidades-regionales/:idUnidad/escuelas` | Escuelas y facultades de esa unidad (`404` si no existe) |
| `GET /api/catalogo/municipios` | Municipios activos |
| `POST /api/participaciones` | Guarda datos + respuestas y devuelve los resultados (`400` si algo falta o es inválido) |

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
│       ├── hooks/               useAppFlow (flujo y candado), useQuiz, useParticipantForm, useCatalog (cascada),
│       │                        useRemoteData, useParticipationSubmit, useScreenTransition
│       ├── services/            httpClient, cuestionarioApi, catalogApi y participacionesApi
│       ├── styles/              Tema y estilos globales
│       ├── constants.js         Pantallas y estados
│       └── App.jsx              Muestra la pantalla que indica useAppFlow
│
├── server/                      API (Express + Nodemailer + MySQL)
│   ├── .env.example             Variables de entorno (copiar a .env)
│   ├── assets/email/            Logos ligeros que se incrustan en el correo
│   ├── scripts/                 cifrar-contrasena.js (cifra la contraseña de Gmail)
│   └── src/
│       ├── index.js             Arranque: config → base de datos → correo → Express
│       ├── app.js               Construcción de la aplicación Express
│       ├── config/              Variables de entorno validadas
│       ├── database/            Pool de conexiones a MySQL
│       ├── repositories/        Único lugar con SQL (siempre parametrizado): catálogo, cuestionario, participaciones, correo
│       ├── services/            participaciones, catálogo y cuestionario; y mail/ (rotación de cuentas, errores, SMTP, dry-run)
│       ├── routes/              URLs de la API
│       ├── controllers/         Lógica de cada URL
│       ├── validators/          Validación de los datos entrantes (reglas compartidas con el cliente)
│       ├── templates/           Diseño del correo (HTML + texto)
│       ├── middleware/          Límites de uso, origen permitido, errores
│       └── utils/               Cifrado AES-256-GCM, logger, maskEmail
│
├── shared/                      Dominio compartido (@huella/shared)
│   └── src/                     calculator.js (fórmula, recibe el cuestionario), questionnaire.js (revisión de integridad), levels.js,
│                                answers.js y participant.js (validación, usada por cliente Y servidor),
│                                categories.js, questionTypes.js, recommendations.js
│
├── database/
│   ├── 01_esquema.sql           Esquema MySQL (mysqldump, SOLO estructura) de la base `huella_carbono`
│   └── 02_datos_iniciales.sql   Unidades regionales y el cuestionario completo (preguntas, opciones, pesos)
│
└── package.json                 Monorepo (npm workspaces) y scripts
```

## Puesta en marcha

```bash
npm install
cp server/.env.example server/.env     # completa DB_* y MAIL_SECRET_KEY
mysql -u root -p -e "CREATE DATABASE huella_carbono CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci"
mysql -u root -p huella_carbono < database/01_esquema.sql          # solo en una base NUEVA (ver aviso)
mysql -u root -p huella_carbono < database/02_datos_iniciales.sql  # unidades regionales + cuestionario
npm run dev                            # servidor (3001) + cliente (5173)
```

> **Aviso:** `database/01_esquema.sql` empieza cada tabla con `DROP TABLE IF EXISTS`. Impórtalo **solo en una base nueva**; en una base con datos borraría todo. Los **municipios** y las **escuelas/facultades** no vienen en los archivos: se capturan desde el panel de administración (o se importan de tu base existente).

Al arrancar, el servidor lee el cuestionario de MySQL y comprueba que se pueda usar; si no (por ejemplo, una base sin `02_datos_iniciales.sql`), se detiene explicando qué falta.

Se recomienda que la aplicación use un usuario de MySQL con permisos solo de datos (`SELECT, INSERT, UPDATE, DELETE`) sobre `huella_carbono`.

## Editar el cuestionario (preguntas, opciones y pesos)

El cuestionario vive en las tablas `preguntas`, `opciones`, `filas_matriz` y `pesos_matriz`. Lo que cambies ahí se ve en la aplicación y se usa en el cálculo **sin reiniciar el servidor**, en máximo `CUESTIONARIO_CACHE_SECONDS` (60 s por defecto). Las participaciones ya guardadas conservan el total que tenían.

**Se puede cambiar libremente:** textos y subtítulos, el orden (`numero`, `orden`), los pesos (`kg_co2`, `horas`, `pesos_matriz`), y agregar preguntas, opciones, filas o columnas nuevas en las categorías `hogar`, `transporte` y `consumo`. El número que se muestra sale de `numero`; si el título trae uno escrito ("1. ...") se ignora.

**Reglas que el servidor revisa** (al arrancar y en cada relectura):
- Toda opción de una pregunta de lista necesita `kg_co2` (usa `0` si no emite) y toda combinación fila × columna de una matriz necesita su peso en `pesos_matriz`.
- Las opciones de `tiempo_recorrido` necesitan `horas`.
- Deben existir `transporte` (opción múltiple) y `tiempo_recorrido` (opción única): el trayecto diario se calcula con ellas (promedio de los modos × horas). Sus textos y opciones sí se pueden editar.

Si una edición rompe una regla, el servidor lo registra en el log y **sigue con la última versión válida**.

**Lo que sigue en el código:** los topes de las barras (854, 4080 y 2249 kg) y el termómetro (8000 kg) en `shared/src/calculator.js`, los umbrales de nivel en `shared/src/levels.js`, y las recomendaciones (`shared/src/recommendations.js`), que dependen de las claves `focos` (`incandescentes`, `no_se`), `transporte` (`auto`) y `carne_matriz` (fila `res`, columnas `diario` y `4_6_dias`): si renombras esas claves, ese consejo deja de aparecer. Una pregunta nueva sin ícono propio usa una bombilla.

**Borrar:** una pregunta u opción que ya tiene respuestas guardadas no se puede eliminar (las claves foráneas de `respuestas` lo impiden).

Para revisar el correo sin enviarlo: `MAIL_DRY_RUN=true` en `server/.env` (se guarda en `server/.dry-run/ultimo-correo.html`). **La base de datos es obligatoria** también en ese modo.

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

Cada pregunta suma a su categoría (`hogar`, `transporte`, `consumo`); con las preguntas actuales: Hogar = P1 + P2 + P3 · Transporte = promedio de modos × horas (P4 × P5) + vuelos (P6) · Alimentación y consumo = P7 + P8 + P9 + P10. El resultado es una **estimación orientativa**. Los pesos están en la base de datos (tablas `opciones` y `pesos_matriz`) y la fórmula en `shared/src/calculator.js`.

## Seguridad

- Consultas **siempre parametrizadas** (`execute`); los nombres de tablas nunca vienen del usuario.
- `helmet`, `cors` con lista de orígenes, límites de uso por IP y por destinatario, cuerpo máximo de 10 KB y campo trampa (honeypot).
- Validación en el navegador **y** en el servidor con las mismas reglas (`shared/src/participant.js`); el servidor nunca confía en cifras del navegador: recalcula todo con los pesos de MySQL (que el navegador ni siquiera recibe).
- Errores globales sin detalles internos: la persona solo ve mensajes genéricos; el detalle queda en el log del servidor.
- Credenciales solo en `server/.env` (fuera de git).
