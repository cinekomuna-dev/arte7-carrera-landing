// ============================================================
// Secuencia de nurturing "nuevo" — DÍA 0 → 30, channel-agnostic.
// Hoy se envía por email (Resend). Para WhatsApp: añadir pasos con canal:'whatsapp'
// y un adaptador de envío cuando se dé de alta la API. La cadencia no cambia.
// Voz: cálida, útil, NUNCA insistente ni culpígena. Un solo CTA por mensaje.
// ============================================================

export interface LeadLike {
  id: string;
  nombre: string;
  email: string;
  telefono?: string | null;
  interes?: string | null;
  created_at?: string;
}

export interface Paso {
  dia: number;                       // días desde la creación del lead
  canal: 'email' | 'whatsapp';
  asunto: string;
  cuerpo: string[];                  // párrafos; admite {{nombre}} y {{interes}}
  cta?: { label: string; url: string };
}

const WA = 'https://wa.me/525556590075';

export const SECUENCIA_NUEVO: Paso[] = [
  {
    dia: 0, canal: 'email',
    asunto: 'Gracias por tu interés en Arte7 🎬',
    cuerpo: [
      'Hola {{nombre}}, qué gusto que te acerques a Arte7.',
      'Somos una escuela de cine independiente con 26 años formando cineastas. Aquí no formamos espectadores: se aprende haciendo cine, con profesionales en activo.',
      'En los próximos días te compartiré lo esencial sobre {{interes}} y cómo dar el siguiente paso. Si tienes una duda hoy mismo, respóndeme este correo o escríbenos por WhatsApp; con gusto te orientamos.',
    ],
    cta: { label: 'Hablar con admisiones', url: WA },
  },
  {
    dia: 1, canal: 'email',
    asunto: '{{nombre}}, ¿qué historia quieres contar?',
    cuerpo: [
      'Todo cineasta empieza con una pregunta: ¿qué quiero contar?',
      'En Arte7 te acompañamos a encontrar tu voz y a llevarla a la pantalla. Lo más útil para empezar es una breve charla con admisiones: te contamos cómo es el día a día y resolvemos tus dudas sin compromiso.',
    ],
    cta: { label: 'Agendar una charla', url: WA },
  },
  {
    dia: 3, canal: 'email',
    asunto: 'Lo que distingue a Arte7',
    cuerpo: [
      'Hola {{nombre}}, tres cosas que vale la pena que sepas de nosotros:',
      '• Aprendes filmando desde el primer día, no solo en teoría.\n• Te enseñan cineastas que están haciendo cine ahora.\n• Eres parte de una comunidad: nuestros egresados trabajan en cine, series y festivales.',
      'Si quieres, te paso ejemplos de proyectos de la comunidad o resolvemos cualquier duda sobre {{interes}}.',
    ],
    cta: { label: 'Quiero saber más', url: WA },
  },
  {
    dia: 7, canal: 'email',
    asunto: 'Detalles de {{interes}}',
    cuerpo: [
      'Hola {{nombre}}, ¿seguimos? Para {{interes}} lo mejor es platicar los detalles contigo: fechas de inicio, modalidad, sedes y opciones de pago.',
      'Cada caso es distinto, así que prefiero contártelo en corto y a tu medida en vez de saturarte de información.',
    ],
    cta: { label: 'Ver detalles por WhatsApp', url: WA },
  },
  {
    dia: 14, canal: 'email',
    asunto: '{{nombre}}, ¿hay algo en lo que pueda ayudarte?',
    cuerpo: [
      'A veces lo que detiene a alguien no es las ganas, sino una duda concreta: horarios, presupuesto, si es para su nivel.',
      'Si es tu caso, cuéntame con confianza y vemos juntos cómo resolverlo. Para eso estamos.',
    ],
    cta: { label: 'Cuéntanos tu caso', url: WA },
  },
  {
    dia: 30, canal: 'email',
    asunto: 'Aquí seguimos cuando estés listo',
    cuerpo: [
      'Hola {{nombre}}, no quiero llenarte el correo. Este es mi último mensaje por ahora.',
      'Arte7 va a seguir aquí cuando sea tu momento de hacer cine. Si en este ciclo no es posible, está perfecto: escríbenos cuando quieras retomarlo.',
      'Y si por ahora prefieres no recibir más correos, puedes darte de baja con el enlace de abajo. Gracias por tu interés. 🎬',
    ],
    cta: { label: 'Hablar cuando quiera', url: WA },
  },
];

// Post-charla: lead que ya tuvo contacto (estado en_seguimiento / caliente)
export const SECUENCIA_POSTCHARLA: Paso[] = [
  {
    dia: 0, canal: 'email',
    asunto: 'Gracias por tu tiempo, {{nombre}}',
    cuerpo: [
      'Qué gusto haber platicado contigo. Como te comenté, en Arte7 se aprende haciendo cine desde el primer día.',
      'Cuando quieras damos el siguiente paso —fechas, inscripción o resolver lo que falte—. Aquí estoy.',
    ],
    cta: { label: 'Continuar por WhatsApp', url: WA },
  },
  {
    dia: 2, canal: 'email',
    asunto: '¿Te quedó alguna duda, {{nombre}}?',
    cuerpo: [
      'A veces, después de una charla, surgen nuevas preguntas. Si es tu caso, con gusto las resolvemos.',
      'Mi objetivo es que tomes la mejor decisión para ti, sin presión.',
    ],
    cta: { label: 'Resolver mis dudas', url: WA },
  },
  {
    dia: 5, canal: 'email',
    asunto: 'Tu lugar en Arte7',
    cuerpo: [
      'Los grupos en Arte7 son reducidos para cuidar el acompañamiento. Si ya lo tienes claro, te ayudo a apartar tu lugar.',
      'Y si necesitas más tiempo, también está bien: dímelo y lo vemos.',
    ],
    cta: { label: 'Apartar mi lugar', url: WA },
  },
];

// Inscrito: bienvenida / retención (estado inscrito)
export const SECUENCIA_INSCRITO: Paso[] = [
  {
    dia: 0, canal: 'email',
    asunto: '¡Bienvenidx a Arte7, {{nombre}}! 🎬',
    cuerpo: [
      'Qué emoción tenerte en la comunidad. Estás por empezar a hacer cine de verdad.',
      'En breve te compartimos los detalles para tu arranque. Si necesitas algo antes, escríbenos.',
    ],
    cta: { label: 'Hablar con la escuela', url: WA },
  },
  {
    dia: 3, canal: 'email',
    asunto: 'Prepárate para tu primer día',
    cuerpo: [
      'Un consejo para aprovechar desde el inicio: llega con ganas de filmar y con tus historias en mente. El resto lo construimos juntos.',
      'Cualquier duda logística —horarios, materiales, sede—, aquí estamos.',
    ],
    cta: { label: 'Tengo una duda', url: WA },
  },
];

// Registro de secuencias + selección por etapa del CRM
export const SEQUENCES: Record<string, Paso[]> = {
  nuevo: SECUENCIA_NUEVO,
  postcharla: SECUENCIA_POSTCHARLA,
  inscrito: SECUENCIA_INSCRITO,
};

export function secuenciaParaEstado(estado: string): string | null {
  if (estado === 'nuevo' || estado === 'contactado') return 'nuevo';
  if (estado === 'en_seguimiento' || estado === 'caliente') return 'postcharla';
  if (estado === 'inscrito') return 'inscrito';
  return null; // perdido u otros → fuera del nurturing
}

function firstName(nombre: string): string {
  return (nombre || '').trim().split(/\s+/)[0] || 'hola';
}
function fill(s: string, lead: LeadLike): string {
  return s
    .replace(/\{\{nombre\}\}/g, firstName(lead.nombre))
    .replace(/\{\{interes\}\}/g, (lead.interes || 'estudiar cine').toString());
}
function esc(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

/** Renderiza un paso de email a {asunto, html, text}. */
export function renderEmail(lead: LeadLike, paso: Paso, bajaUrl: string) {
  const asunto = fill(paso.asunto, lead);
  const parrafos = paso.cuerpo.map((p) => fill(p, lead));
  const cta = paso.cta;

  const htmlParrafos = parrafos
    .map((p) => `<p style="margin:0 0 16px;font-size:16px;line-height:1.6;color:#FDF3E0;white-space:pre-line;">${esc(p)}</p>`)
    .join('');

  const ctaHtml = cta
    ? `<a href="${cta.url}" style="display:inline-block;margin:8px 0 4px;background:#FF492F;color:#fff;text-decoration:none;font-family:Arial,sans-serif;font-size:14px;font-weight:bold;letter-spacing:1px;text-transform:uppercase;padding:14px 26px;border-radius:4px;">${esc(cta.label)} →</a>`
    : '';

  const html = `<!DOCTYPE html><html lang="es"><body style="margin:0;background:#0E0E0E;padding:0;">
  <div style="max-width:600px;margin:0 auto;background:#1A1A1A;">
    <div style="padding:28px 36px 8px;border-bottom:1px solid rgba(253,243,224,0.12);">
      <span style="font-family:Arial,sans-serif;font-size:24px;font-weight:bold;letter-spacing:3px;color:#FDF3E0;">ARTE<span style="color:#FF492F;">7</span></span>
      <span style="font-family:Arial,sans-serif;font-size:11px;letter-spacing:2px;color:rgba(253,243,224,0.5);"> · ESCUELA DE CINE</span>
    </div>
    <div style="padding:32px 36px;font-family:Arial,Helvetica,sans-serif;">
      ${htmlParrafos}
      ${ctaHtml}
    </div>
    <div style="padding:20px 36px 28px;border-top:1px solid rgba(253,243,224,0.12);font-family:Arial,sans-serif;font-size:11px;line-height:1.6;color:rgba(253,243,224,0.45);">
      Arte7 Escuela de Cine · CDMX · Querétaro · Mérida · En línea<br>
      Responde este correo o escríbenos por WhatsApp y te atendemos.<br>
      <a href="${bajaUrl}" style="color:rgba(253,243,224,0.55);">Darme de baja de estos correos</a>
    </div>
  </div></body></html>`;

  const text =
    parrafos.join('\n\n') +
    (cta ? `\n\n${cta.label}: ${cta.url}` : '') +
    `\n\n—\nArte7 Escuela de Cine\nDarme de baja: ${bajaUrl}`;

  return { asunto, html, text };
}
