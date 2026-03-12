import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';
import { calculateLeadScore } from '@/lib/scoring';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const resend = new Resend(process.env.RESEND_API_KEY!);

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const { nombre, email, telefono, interes, utm_source, utm_medium, utm_campaign } = body;

    if (!nombre || !email || !interes) {
      return NextResponse.json({ error: 'Faltan campos requeridos' }, { status: 400 });
    }

    const score = calculateLeadScore({ interes, telefono, utm_source, utm_campaign });

    // Insertar en Supabase
    const { data, error } = await supabase
      .from('leads')
      .insert({
        nombre,
        email,
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

    // Email de notificación a Cary
    try {
      await resend.emails.send({
        from: 'Arte7 Leads <leads@arte7.net>',
        to: ['cary@arte7.net'],
        subject: `Nuevo lead: ${nombre} — ${interes} (Score: ${score})`,
        html: `
          <div style="font-family:monospace;background:#1A1A1A;color:#FDF3E0;padding:40px;max-width:600px;">
            <h1 style="font-family:sans-serif;color:#FF492F;font-size:28px;margin:0 0 24px;">NUEVO LEAD</h1>
            <table style="width:100%;border-collapse:collapse;">
              <tr><td style="padding:8px 0;color:#038B96;font-size:12px;letter-spacing:2px;">NOMBRE</td><td style="padding:8px 0;">${nombre}</td></tr>
              <tr><td style="padding:8px 0;color:#038B96;font-size:12px;letter-spacing:2px;">EMAIL</td><td style="padding:8px 0;">${email}</td></tr>
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
