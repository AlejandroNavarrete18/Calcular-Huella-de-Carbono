import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildResultsEmail } from '../src/templates/resultsEmail.js';
import { calculateFootprint } from '../src/shared/footprint.js';
import { validAnswers } from './fixtures.js';

const results = calculateFootprint(validAnswers);

test('el correo incluye total, nivel y recomendaciones', () => {
  const { subject, html, text } = buildResultsEmail({ name: 'Ana', results });
  assert.match(subject, /kg CO₂e al año/);
  assert.ok(html.includes('Hola, Ana:'));
  assert.ok(html.includes(results.level));
  assert.ok(text.includes(results.recommendations[0]));
  assert.ok(text.includes('Hogar'));
});

test('escapa HTML en el nombre (evita inyección)', () => {
  const { html } = buildResultsEmail({ name: '<script>alert(1)</script>', results });
  assert.ok(!html.includes('<script>'));
  assert.ok(html.includes('&lt;script&gt;'));
});

test('funciona sin nombre', () => {
  const { html } = buildResultsEmail({ name: '', results });
  assert.ok(html.includes('Hola:'));
});
