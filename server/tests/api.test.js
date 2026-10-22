import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { createApp } from '../src/app.js';
import { calculateFootprint } from '../src/shared/footprint.js';
import { validAnswers, silentLogger, testConfig } from './fixtures.js';

const sent = [];
let failNext = false;
const fakeMailService = {
  async sendResultsEmail(payload) {
    if (failNext) {
      failNext = false;
      throw Object.assign(new Error('SMTP caído'), { code: 'ECONNECTION' });
    }
    sent.push(payload);
    return { messageId: 'fake' };
  },
};

let server;
let base;

before(async () => {
  const app = createApp({ config: testConfig, mailService: fakeMailService, logger: silentLogger });
  await new Promise((resolve) => {
    server = app.listen(0, resolve);
  });
  base = `http://127.0.0.1:${server.address().port}`;
});

after(() => server.close());

const post = (body, headers = {}) =>
  fetch(`${base}/api/results/email`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...headers },
    body: typeof body === 'string' ? body : JSON.stringify(body),
  });

test('GET /api/health responde ok y no revela Express', async () => {
  const res = await fetch(`${base}/api/health`);
  assert.equal(res.status, 200);
  assert.equal(res.headers.get('x-powered-by'), null);
  assert.deepEqual(await res.json(), { ok: true });
});

test('envía el correo con la huella RECALCULADA en el servidor', async () => {
  const res = await post({ name: 'Ana', email: 'ana1@example.com', answers: validAnswers, totalKg: 1 /* se ignora */ });
  assert.equal(res.status, 200);
  const last = sent.at(-1);
  assert.equal(last.to, 'ana1@example.com');
  assert.equal(last.results.totalKg, calculateFootprint(validAnswers).totalKg);
});

test('400 si faltan datos', async () => {
  const res = await post({ email: 'x', answers: {} });
  assert.equal(res.status, 400);
  const body = await res.json();
  assert.equal(body.code, 'VALIDATION_ERROR');
});

test('400 si el JSON está roto', async () => {
  const res = await post('{ esto no es json');
  assert.equal(res.status, 400);
  assert.equal((await res.json()).code, 'INVALID_JSON');
});

test('413 si el cuerpo es demasiado grande', async () => {
  const res = await post({ email: 'a@b.co', answers: validAnswers, name: 'x'.repeat(20_000) });
  assert.equal(res.status, 413);
});

test('403 si el origen no está autorizado', async () => {
  const res = await post({ email: 'ana2@example.com', answers: validAnswers }, { Origin: 'https://sitio-malo.com' });
  assert.equal(res.status, 403);
});

test('acepta el origen autorizado', async () => {
  const res = await post({ email: 'ana3@example.com', answers: validAnswers }, { Origin: 'http://localhost:5173' });
  assert.equal(res.status, 200);
});

test('honeypot: responde ok pero NO envía', async () => {
  const before = sent.length;
  const res = await post({ email: 'bot@example.com', answers: validAnswers, website: 'spam' });
  assert.equal(res.status, 200);
  assert.equal(sent.length, before);
});

test('límite por destinatario: el 3.º envío seguido recibe 429', async () => {
  const body = { email: 'limite@example.com', answers: validAnswers };
  assert.equal((await post(body)).status, 200);
  assert.equal((await post(body)).status, 200);
  const third = await post(body);
  assert.equal(third.status, 429);
  assert.equal((await third.json()).code, 'RECIPIENT_RATE_LIMITED');
});

test('502 genérico si falla el envío y no se gasta el cupo del destinatario', async () => {
  const body = { email: 'falla@example.com', answers: validAnswers };
  failNext = true;
  const res = await post(body);
  assert.equal(res.status, 502);
  const json = await res.json();
  assert.equal(json.code, 'MAIL_FAILED');
  assert.ok(!JSON.stringify(json).includes('SMTP'), 'no debe filtrar detalles internos');
  assert.equal((await post(body)).status, 200); // el cupo se devolvió
});

test('404 para rutas desconocidas', async () => {
  assert.equal((await fetch(`${base}/api/nada`)).status, 404);
});
