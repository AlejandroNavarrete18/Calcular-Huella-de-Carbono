import { test } from 'node:test';
import assert from 'node:assert/strict';
import { validateEmailRequest, validateAnswers, isValidEmail, sanitizeName } from '../src/validators/results.validator.js';
import { validAnswers } from './fixtures.js';

test('acepta una petición válida y normaliza el correo', () => {
  const r = validateEmailRequest({ name: '  Ana   López ', email: ' ANA@Gmail.com ', answers: validAnswers });
  assert.equal(r.ok, true);
  assert.equal(r.value.email, 'ana@gmail.com');
  assert.equal(r.value.name, 'Ana López');
  assert.equal(r.isBot, false);
});

test('el nombre es opcional', () => {
  const r = validateEmailRequest({ email: 'ana@gmail.com', answers: validAnswers });
  assert.equal(r.ok, true);
  assert.equal(r.value.name, '');
});

test('rechaza correos inválidos o con intentos de inyección de cabeceras', () => {
  for (const bad of ['', 'sin-arroba', 'a@b', 'a b@c.com', 'a@c.com\r\nBcc: x@y.com', 'a@c.com,b@c.com', '<x@c.com>']) {
    assert.equal(isValidEmail(bad), false, `debería rechazar: ${JSON.stringify(bad)}`);
  }
  assert.equal(validateEmailRequest({ email: 'nope', answers: validAnswers }).ok, false);
});

test('rechaza respuestas incompletas o con opciones inexistentes', () => {
  const { gas, ...incompletas } = validAnswers; // eslint-disable-line no-unused-vars
  assert.ok(validateAnswers(incompletas).length > 0);
  assert.ok(validateAnswers({ ...validAnswers, gas: 'opcion_inventada' }).length > 0);
  assert.ok(validateAnswers({ ...validAnswers, electrodomesticos: [] }).length > 0);
  assert.ok(validateAnswers({ ...validAnswers, electrodomesticos: ['tv', 'tv'] }).length > 0);
  assert.ok(validateAnswers({ ...validAnswers, carne_matriz: { res: 'diario' } }).length > 0);
  assert.ok(validateAnswers('texto').length > 0);
  assert.equal(validateAnswers(validAnswers).length, 0);
});

test('detecta el campo trampa (honeypot)', () => {
  const r = validateEmailRequest({ email: 'ana@gmail.com', answers: validAnswers, website: 'http://spam.com' });
  assert.equal(r.ok, true);
  assert.equal(r.isBot, true);
});

test('sanitizeName limpia caracteres de control y limita la longitud', () => {
  assert.equal(sanitizeName('Ana\r\nBcc: x'), 'Ana Bcc: x');
  assert.equal(sanitizeName('x'.repeat(200)).length, 60);
  assert.equal(sanitizeName(123), '');
});

test('rechaza cuerpos que no son objetos', () => {
  for (const body of [undefined, null, 'texto', [], 5]) assert.equal(validateEmailRequest(body).ok, false);
});
