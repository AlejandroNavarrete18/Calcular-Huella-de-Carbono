/**
 * Plantilla del correo con los resultados.
 *
 * Es una función "pura": recibe datos y devuelve { subject, html, text }, sin enviar nada.
 * Eso la hace fácil de probar y de modificar (diseño, textos, colores).
 *
 * Notas de diseño para correo electrónico:
 *  - Usa tablas y estilos "inline" porque Gmail/Outlook ignoran casi todo el CSS moderno.
 *  - Todo texto dinámico pasa por `esc()` para evitar inyección de HTML.
 */

const COLOR = {
  navy900: '#0a2352',
  navy800: '#0f2f6b',
  navy100: '#e3eaf7',
  navy50: '#f1f5fc',
  gold400: '#f4c430',
  sun600: '#d96a08',
  ink: '#17223b',
  muted: '#5b6784',
  paper: '#f6f7fb',
  white: '#ffffff',
};

const CATEGORIES = [
  { key: 'hogar', label: 'Hogar' },
  { key: 'transporte', label: 'Transporte' },
  { key: 'consumo', label: 'Alimentación y consumo' },
];

const HTML_ESCAPES = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
const esc = (value) => String(value).replace(/[&<>"']/g, (ch) => HTML_ESCAPES[ch]);

const fmt = (n) => Number(n).toLocaleString('es-MX', { maximumFractionDigits: 2 });
const cleanTitle = (title) => title.replace(/^RESULTADO:\s*/i, '');
// El amarillo necesita texto oscuro para leerse bien.
const pillTextColor = (bg) => (bg.toLowerCase() === '#f4c430' ? COLOR.ink : COLOR.white);

export function buildResultsEmail({ name, results }) {
  const greeting = name ? `Hola, ${name}:` : 'Hola:';
  const title = cleanTitle(results.title);
  const subject = `Tus resultados: ${fmt(results.totalKg)} kg CO₂e al año · Calculadora de Huella de Carbono`;

  // ── Versión HTML ──
  const categoryRows = CATEGORIES.map(({ key, label }) => {
    const width = Math.max(Number(results.percentages[key]) || 0, 2);
    return `
      <tr>
        <td style="padding:10px 0 4px 0;font-family:Arial,Helvetica,sans-serif;font-size:14px;color:${COLOR.ink};">
          <strong>${esc(label)}</strong>
        </td>
        <td align="right" style="padding:10px 0 4px 0;font-family:Arial,Helvetica,sans-serif;font-size:14px;color:${COLOR.ink};">
          ${esc(fmt(results.breakdown[key]))} kg CO₂e
        </td>
      </tr>
      <tr>
        <td colspan="2" style="padding:0 0 6px 0;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${COLOR.navy100};border-radius:6px;">
            <tr><td width="${width}%" height="10" style="background:${esc(results.barColors[key])};border-radius:6px;font-size:0;line-height:0;">&nbsp;</td><td style="font-size:0;line-height:0;">&nbsp;</td></tr>
          </table>
        </td>
      </tr>`;
  }).join('');

  const paragraphs = results.description
    .map((p) => `<p style="margin:0 0 12px 0;font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.6;color:${COLOR.ink};">${esc(p)}</p>`)
    .join('');

  const recommendations = results.recommendations
    .map((r) => `<li style="margin:0 0 8px 0;">${esc(r)}</li>`)
    .join('');

  const html = `<!doctype html>
<html lang="es">
  <body style="margin:0;padding:0;background:${COLOR.paper};">
    <div style="display:none;max-height:0;overflow:hidden;opacity:0;">
      Tu huella estimada es de ${esc(fmt(results.totalKg))} kg CO₂e al año (${esc(results.level)}).
    </div>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${COLOR.paper};padding:24px 12px;">
      <tr><td align="center">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="width:100%;max-width:600px;background:${COLOR.white};border-radius:14px;overflow:hidden;border:1px solid ${COLOR.navy100};">

          <tr><td style="background:${COLOR.navy900};padding:22px 28px;">
            <div style="font-family:Arial,Helvetica,sans-serif;font-size:12px;letter-spacing:2px;text-transform:uppercase;color:${COLOR.gold400};">Calculadora de huella de carbono</div>
            <div style="font-family:Georgia,'Times New Roman',serif;font-size:24px;line-height:1.25;font-weight:bold;color:${COLOR.white};margin-top:6px;">${esc(title)}</div>
          </td></tr>
          <tr><td height="5" style="background:${COLOR.gold400};font-size:0;line-height:0;">&nbsp;</td></tr>

          <tr><td style="padding:28px;">
            <p style="margin:0 0 18px 0;font-family:Arial,Helvetica,sans-serif;font-size:16px;color:${COLOR.ink};">${esc(greeting)}</p>
            <p style="margin:0 0 18px 0;font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.6;color:${COLOR.ink};">
              Gracias por calcular tu huella de carbono. Este es el resumen de tus resultados:
            </p>

            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${COLOR.navy50};border:1px solid ${COLOR.navy100};border-radius:12px;">
              <tr><td align="center" style="padding:22px 16px;">
                <div style="font-family:Arial,Helvetica,sans-serif;font-size:12px;letter-spacing:1.5px;text-transform:uppercase;color:${COLOR.muted};">Tu huella estimada</div>
                <div style="font-family:Georgia,'Times New Roman',serif;font-size:40px;font-weight:bold;color:${COLOR.navy900};margin-top:6px;">
                  ${esc(fmt(results.totalKg))} <span style="font-size:18px;color:${COLOR.sun600};">kg CO₂e / año</span>
                </div>
                <div style="margin-top:12px;">
                  <span style="display:inline-block;background:${esc(results.levelColor)};color:${pillTextColor(results.levelColor)};font-family:Arial,Helvetica,sans-serif;font-size:13px;font-weight:bold;padding:6px 16px;border-radius:999px;">
                    ${esc(results.level)}
                  </span>
                </div>
                <div style="font-family:Arial,Helvetica,sans-serif;font-size:14px;color:${COLOR.navy800};margin-top:12px;">🌳 ${esc(results.treesText)}</div>
              </td></tr>
            </table>

            <h2 style="margin:28px 0 6px 0;font-family:Georgia,'Times New Roman',serif;font-size:18px;color:${COLOR.navy900};">Emisiones por categoría</h2>
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0">${categoryRows}</table>

            <div style="margin-top:24px;">${paragraphs}</div>

            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:8px;background:${COLOR.navy50};border-left:4px solid ${COLOR.gold400};border-radius:6px;">
              <tr><td style="padding:16px 20px;">
                <div style="font-family:Georgia,'Times New Roman',serif;font-size:16px;font-weight:bold;color:${COLOR.navy900};margin-bottom:8px;">Recomendaciones de acción</div>
                <ul style="margin:0;padding-left:20px;font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:1.55;color:${COLOR.ink};">${recommendations}</ul>
              </td></tr>
            </table>
          </td></tr>

          <tr><td style="background:${COLOR.navy50};padding:18px 28px;border-top:1px solid ${COLOR.navy100};">
            <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:1.5;color:${COLOR.muted};">
              Este resultado es una estimación orientativa basada en tus respuestas. Recibes este mensaje porque
              solicitaste tus resultados en la Calculadora de Huella de Carbono. Es un correo automático y no
              guardamos tus datos personales.
            </p>
          </td></tr>
        </table>
      </td></tr>
    </table>
  </body>
</html>`;

  // ── Versión de texto plano (para clientes de correo sin HTML) ──
  const text = [
    greeting,
    '',
    `RESULTADO: ${title}`,
    `Tu huella estimada: ${fmt(results.totalKg)} kg CO2e al año (${results.level}).`,
    results.treesText,
    '',
    'Emisiones por categoría:',
    ...CATEGORIES.map(({ key, label }) => `- ${label}: ${fmt(results.breakdown[key])} kg CO2e`),
    '',
    ...results.description.flatMap((p) => [p, '']),
    'Recomendaciones de acción:',
    ...results.recommendations.map((r) => `- ${r}`),
    '',
    'Este resultado es una estimación orientativa basada en tus respuestas.',
    'Es un correo automático y no guardamos tus datos personales.',
  ].join('\n');

  return { subject, html, text };
}
