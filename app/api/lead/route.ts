import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';
import { calculateLeadScore } from '@/lib/scoring';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const resend = new Resend(process.env.RESEND_API_KEY!);

// ── Rate limiting en memoria (por IP) ──────────────────────────────────────
const rateLimit = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_MAX = 3;       // máximo 3 intentos
const RATE_LIMIT_WINDOW = 60_000; // por minuto

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimit.get(ip);

  if (!entry || now > entry.resetAt) {
    rateLimit.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW });
    return true;
  }

  if (entry.count >= RATE_LIMIT_MAX) return false;

  entry.count += 1;
  return true;
}

// ── Valores válidos ────────────────────────────────────────────────────────
const INTERES_VALIDOS = ['Carrera CDMX', 'Carrera Querétaro', 'Cursos Online', 'Actuación'] as const;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req: NextRequest) {
  try {
    // 1. Rate limiting por IP
    const ip =
      req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      req.headers.get('x-real-ip') ||
      'unknown';

    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        { error: 'Demasiados intentos. Espera un momento e inténtalo de nuevo.' },
        { status: 429 }
      );
    }

    const body = await req.json();
    const { nombre, email, telefono, interes, utm_source, utm_medium, utm_campaign } = body;

    // 2. Validación server-side
    if (!nombre || typeof nombre !== 'string' || nombre.trim().length < 2) {
      return NextResponse.json({ error: 'El nombre debe tener al menos 2 caracteres.' }, { status: 400 });
    }

    if (!email || typeof email !== 'string' || !EMAIL_REGEX.test(email.trim())) {
      return NextResponse.json({ error: 'El email no es válido.' }, { status: 400 });
    }

    if (!interes || !INTERES_VALIDOS.includes(interes)) {
      return NextResponse.json({ error: 'El interés seleccionado no es válido.' }, { status: 400 });
    }

    if (telefono && (typeof telefono !== 'string' || telefono.replace(/\D/g, '').length < 10)) {
      return NextResponse.json({ error: 'El teléfono debe tener al menos 10 dígitos.' }, { status: 400 });
    }

    const nombreClean  = nombre.trim();
    const emailClean   = email.trim().toLowerCase();

    // 3. Detección de duplicados (mismo email)
    const { data: existing } = await supabase
      .from('leads')
      .select('id, created_at')
      .eq('email', emailClean)
      .maybeSingle();

    if (existing) {
      // No revelamos que el email ya existe para evitar enumeración,
      // pero sí lo registramos y devolvemos éxito silencioso.
      console.info(`Lead duplicado ignorado: ${emailClean}`);
      return NextResponse.json({ success: true, duplicate: true });
    }

    // 4. Calcular score
    const score = calculateLeadScore({ interes, telefono, utm_source, utm_campaign });

    // 5. Insertar en Supabase
    const { data, error } = await supabase
      .from('leads')
      .insert({
        nombre: nombreClean,
        email: emailClean,
        telefono: telefono || null,
        interes,
        utm_source: utm_source || null,
        utm_medium: utm_medium || null,
        utm_campaign: utm_campaign || null,
        score,
        estado: 'nuevo',
      })
      .select()
      .single();

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json({ error: 'Error al guardar lead' }, { status: 500 });
    }

    // 6. Email de notificación a Cary
    try {
      await resend.emails.send({
        from: 'Arte7 Leads <leads@arte7.net>',
        to: ['cary@arte7.net'],
        subject: `Nuevo lead: ${nombreClean} — ${interes} (Score: ${score})`,
        html: `
          <div style="font-family:monospace;background:#1A1A1A;color:#FDF3E0;padding:40px;max-width:600px;">
            <h1 style="font-family:sans-serif;color:#FF492F;font-size:28px;margin:0 0 24px;">NUEVO LEAD</h1>
            <table style="width:100%;border-collapse:collapse;">
              <tr><td style="padding:8px 0;color:#038B96;font-size:12px;letter-spacing:2px;">NOMBRE</td><td style="padding:8px 0;">${nombreClean}</td></tr>
              <tr><td style="padding:8px 0;color:#038B96;font-size:12px;letter-spacing:2px;">EMAIL</td><td style="padding:8px 0;">${emailClean}</td></tr>
              <tr><td style="padding:8px 0;color:#038B96;font-size:12px;letter-spacing:2px;">TELÉFONO</td><td style="padding:8px 0;">${telefono || '—'}</td></tr>
              <tr><td style="padding:8px 0;color:#038B96;font-size:12px;letter-spacing:2px;">INTERÉS</td><td style="padding:8px 0;">${interes}</td></tr>
              <tr><td style="padding:8px 0;color:#038B96;font-size:12px;letter-spacing:2px;">SCORE</td><td style="padding:8px 0;color:#FF492F;font-size:20px;font-weight:bold;">${score}/100</td></tr>
              <tr><td style="padding:8px 0;color:#038B96;font-size:12px;letter-spacing:2px;">UTM</td><td style="padding:8px 0;font-size:11px;opacity:0.6;">${utm_source || '—'} / ${utm_medium || '—'} / ${utm_campaign || '—'}</td></tr>
            </table>
            <div style="margin-top:24px;padding-top:16px;border-top:1px solid rgba(253,243,224,0.1);">
              <a href="https://wa.me/${telefono ? telefono.replace(/\D/g, '') : ''}" style="color:#FF492F;">Contactar por WhatsApp</a>
            </div>
          </div>
        `,
      });
    } catch (emailErr) {
      console.error('Email error:', emailErr);
      // No falla el request si el email falla
    }

    return NextResponse.json({ success: true, id: data.id, score });
  } catch (err) {
    console.error('API error:', err);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}
