# 📧 Servidor de correo — Calculadora de Huella de Carbono

Pequeña API en **Node.js + Express** que envía por correo (con **Nodemailer** y una cuenta **gratuita de Gmail**) los resultados del cuestionario a la persona que escribe su correo en el formulario.

> Pensado para **pruebas y desarrollo**. Al final hay una sección con lo que conviene cambiar antes de usarlo en producción.

---

## 1. ¿Cómo funciona?

```
 Navegador (React)                    Servidor (este proyecto)                  Gmail
 ─────────────────                    ────────────────────────                  ─────
 La persona responde las 10 preguntas
 y escribe su correo en el formulario
        │
        │  POST /api/results/email
        │  { name, email, answers }          ← solo respuestas, NO resultados
        ▼
                                  1. Valida los datos (correo, respuestas)
                                  2. Aplica límites anti-abuso
                                  3. RECALCULA la huella con el mismo código de la web
                                  4. Genera el correo (HTML + texto)
                                  5. Lo envía con Nodemailer ───────────────►  smtp.gmail.com
        ◄── { ok: true }  ◄─────────────────────────────────────────────────  (puerto 465, TLS)
 Se muestran los resultados y el aviso
 "Te enviamos tus resultados a ..."
```

Puntos clave:

- **No se guarda nada.** El nombre y el correo solo existen en memoria durante la petición. No hay base de datos.
- **El servidor no se fía del navegador.** La web envía únicamente las *respuestas*; el servidor calcula la huella con el mismo archivo (`src/utils/calculator.js`). Así nadie puede usar tu Gmail para mandar cifras o textos inventados.
- El formulario sigue siendo **opcional**: sin correo, la persona ve sus resultados igual.
- El teléfono y la fecha de nacimiento del formulario **no se envían** (siguen siendo solo visuales).

---

## 2. Qué debes poner de tu correo (paso a paso)

Necesitas **2 datos** de tu cuenta de Gmail:

| Variable (`server/.env`) | Qué poner | Ejemplo |
|---|---|---|
| `GMAIL_USER` | Tu dirección de Gmail **completa**. Es la cuenta que *envía* los correos. | `huella.pruebas@gmail.com` |
| `GMAIL_APP_PASSWORD` | Una **contraseña de aplicación** de 16 letras. **No** es tu contraseña normal de Gmail. | `abcd efgh ijkl mnop` |

> 💡 **Recomendación:** crea una cuenta de Gmail **solo para pruebas** en lugar de usar tu correo personal.

### Cómo obtener la contraseña de aplicación

Google ya no permite iniciar sesión con la contraseña normal desde programas externos. Hay que crear una contraseña especial:

1. Entra a tu cuenta de Google → **Seguridad** (<https://myaccount.google.com/security>).
2. Activa la **Verificación en dos pasos** (si no, Google no muestra la opción del siguiente paso).
3. Abre <https://myaccount.google.com/apppasswords> (o busca "Contraseñas de aplicaciones" en la barra de búsqueda de tu cuenta).
4. Escribe un nombre, por ejemplo `Calculadora Huella`, y pulsa **Crear**.
5. Google te muestra **16 letras en 4 grupos**. Cópialas (solo se muestran una vez) y pégalas en `GMAIL_APP_PASSWORD`. Con o sin espacios, funciona.

Si algún día sospechas que se filtró, elimina esa contraseña de aplicación en la misma página y crea otra.

---

## 3. Puesta en marcha

Desde la **carpeta raíz** del proyecto (la que contiene `package.json` y `src/`):

```bash
# 1) Instalar dependencias de la web y del servidor
npm run install:all

# 2) Crear tu archivo de configuración
#    Mac / Linux:
cp server/.env.example server/.env
#    Windows (CMD):
copy server\.env.example server\.env

# 3) Abrir server/.env y rellenar GMAIL_USER y GMAIL_APP_PASSWORD

# 4) Arrancar web + servidor al mismo tiempo
npm run dev:all
```

Abre <http://localhost:5173>, completa el cuestionario, escribe tu correo en el último paso y pulsa **Siguiente**.

Al arrancar, el servidor imprime `Conexión con Gmail verificada correctamente.` si las credenciales son correctas. Si no, te dice qué revisar.

Comandos útiles:

| Comando | Qué hace |
|---|---|
| `npm run dev:all` | Arranca la web (puerto 5173) y la API (puerto 3001) juntas |
| `npm run dev` | Solo la web |
| `npm run server` | Solo la API (se reinicia sola al guardar cambios) |
| `npm run test:server` | Ejecuta las pruebas automáticas del servidor |
| `npm run lint` | Revisa el estilo del código |

### Probar SIN Gmail (modo dry-run)

Si todavía no tienes la contraseña de aplicación, pon en `server/.env`:

```
MAIL_DRY_RUN=true
```

En ese modo **no se envía nada**: el correo se guarda en `server/.dry-run/ultimo-correo.html` para que lo abras con el navegador y veas cómo queda el diseño. No hace falta rellenar `GMAIL_USER` ni `GMAIL_APP_PASSWORD`.

---

## 4. Configuración (`server/.env`)

| Variable | Obligatoria | Descripción | Valor por defecto |
|---|---|---|---|
| `GMAIL_USER` | Sí (salvo dry-run) | Tu Gmail completo | — |
| `GMAIL_APP_PASSWORD` | Sí (salvo dry-run) | Contraseña de aplicación de 16 letras | — |
| `MAIL_FROM_NAME` | No | Nombre del remitente que ve quien recibe el correo | `Calculadora de Huella de Carbono` |
| `PORT` | No | Puerto de la API | `3001` |
| `ALLOWED_ORIGINS` | No | Páginas autorizadas a usar la API (separadas por coma, sin `/` final) | `http://localhost:5173` |
| `LIMIT_EMAILS_PER_IP_PER_HOUR` | No | Máximo de envíos por IP cada hora | `5` |
| `LIMIT_EMAILS_PER_RECIPIENT_PER_HOUR` | No | Máximo de envíos a un mismo correo cada hora | `3` |
| `MAIL_DRY_RUN` | No | `true` = no enviar, guardar el correo en `.dry-run/` | `false` |
| `TRUST_PROXY` | No | Solo si publicas detrás de un proxy (Render, Nginx...) | desactivado |

---

## 5. Estructura de carpetas

```
server/
├── .env.example            Plantilla de configuración (se copia a .env)
├── package.json
├── src/
│   ├── index.js            Arranque: lee la configuración, verifica Gmail y enciende el servidor
│   ├── app.js              Arma Express: seguridad, CORS, límites, rutas
│   ├── config.js           Lee y valida las variables de entorno (.env)
│   ├── routes/             Define las URLs de la API
│   ├── controllers/        Lógica de cada URL (validar → calcular → enviar → responder)
│   ├── validators/         Revisa que lo recibido sea correcto y seguro
│   ├── services/
│   │   └── mail.service.js ÚNICO lugar que conoce Nodemailer/Gmail
│   ├── templates/
│   │   └── resultsEmail.js Diseño del correo (HTML + texto plano)
│   ├── middleware/         Límites anti-abuso y manejo de errores
│   ├── shared/
│   │   └── footprint.js    Reutiliza el cálculo de la web (misma fórmula)
│   └── utils/logger.js     Logs sin datos sensibles
└── tests/                  Pruebas automáticas (node --test)
```

¿Quieres cambiar el **diseño del correo**? Edita `src/templates/resultsEmail.js`.
¿Quieres cambiar de **Gmail a otro proveedor**? Solo cambia `src/services/mail.service.js`.

---

## 6. Seguridad: qué se hizo y por qué

| Medida | Para qué sirve |
|---|---|
| Credenciales solo en `server/.env` (ignorado por Git) | Que la contraseña nunca llegue al repositorio ni al navegador |
| Contraseña de **aplicación**, no la contraseña real | Si se filtra, se revoca sin tocar tu cuenta |
| Conexión SMTP cifrada (TLS, puerto 465) | Nadie puede leer el tráfico hacia Gmail |
| El servidor **recalcula** la huella | Impide enviar resultados falsos usando tu cuenta |
| Validación estricta (correo, respuestas, longitudes) y rechazo de saltos de línea | Evita "inyección de cabeceras" de correo |
| Todo texto dinámico va **escapado** en el HTML del correo | Evita inyección de HTML/scripts |
| Asunto y contenido fijos (el usuario solo aporta su nombre y respuestas) | La API no sirve como "relé" para mandar mensajes arbitrarios |
| Límite por IP y por destinatario (hash, no correo en claro) | Frena el spam y el bombardeo a terceros |
| CORS y comprobación de `Origin` | Solo tu web puede llamar a la API desde un navegador |
| Campo trampa invisible (honeypot) | Descarta bots básicos |
| `helmet`, límite de 10 KB por petición, sin cabecera `X-Powered-By` | Endurecimiento general de Express |
| Errores genéricos al cliente, detalles solo en el log; correos enmascarados (`m***@gmail.com`) | No filtrar información interna ni datos personales |
| Tiempos máximos en SMTP | La API no se queda colgada si Gmail no responde |

**Límites a tener presentes:**

- Los límites viven en memoria: se reinician al reiniciar el servidor.
- Gmail limita los envíos diarios de las cuentas gratuitas (históricamente alrededor de 500 al día; confirma el límite vigente en la ayuda de Google). Si se supera, Google bloquea el envío temporalmente.
- Gmail siempre muestra como remitente tu cuenta de Gmail, aunque configures otro.
- Los correos enviados con un Gmail gratuito pueden caer en **spam**. Pide que revisen esa carpeta.

---

## 7. Solución de problemas

| Síntoma | Causa probable | Qué hacer |
|---|---|---|
| El servidor se cierra al arrancar con `Configuración inválida` | Falta o está mal `GMAIL_USER` / `GMAIL_APP_PASSWORD` | Revisa `server/.env` (paso 2). Debe tener 16 letras |
| `Invalid login` / `535` / `Username and Password not accepted` | Usaste tu contraseña normal, o la verificación en 2 pasos está desactivada, o la contraseña de aplicación fue revocada | Crea una nueva contraseña de aplicación y reemplázala |
| `ETIMEDOUT` / `ECONNECTION` | Firewall, antivirus o red que bloquea el puerto 465 | Prueba en otra red; abre el puerto 465 de salida |
| La web muestra "No pudimos conectar con el servidor" | La API no está encendida | Ejecuta `npm run dev:all` (o `npm run server`) |
| Error `ORIGIN_NOT_ALLOWED` (403) | La web corre en un puerto distinto a 5173 | Agrega ese origen en `ALLOWED_ORIGINS` y reinicia la API |
| Error `RATE_LIMITED` / `RECIPIENT_RATE_LIMITED` (429) | Se superó el límite de envíos | Espera una hora o sube los límites en `.env` (solo pruebas) |
| El correo no aparece | Está en spam, o el modo `MAIL_DRY_RUN=true` sigue activo | Revisa spam y la variable |

---

## 8. Antes de pasar a producción

Este servicio es una base sólida para pruebas. Para uso real, considera:

1. **No depender de Gmail**: usa un servicio transaccional (Resend, SendGrid, Amazon SES, Brevo...) o, al menos, Gmail con **OAuth 2.0** (Nodemailer lo recomienda para proyectos nuevos). Solo cambia `mail.service.js`.
2. **HTTPS** y un hosting con variables de entorno seguras (nunca subas `.env`).
3. **Límites compartidos** (Redis) si hay más de una instancia del servidor.
4. **CAPTCHA** (Turnstile, reCAPTCHA) en el formulario si se publica abierto a Internet.
5. Un **aviso de privacidad** y consentimiento claro para el uso del correo electrónico.
6. Un dominio propio con SPF/DKIM para mejorar la entrega y evitar spam.

---

## 9. Pruebas automáticas

```bash
npm run test:server
```

Cubren la validación de datos, la plantilla del correo (incluido el escapado de HTML) y la API completa con un servicio de correo simulado: éxito, datos inválidos, JSON roto, cuerpo demasiado grande, origen no autorizado, honeypot, límite por destinatario y fallo de envío.
