// ============================================================
// Motor de nurturing — cron diario, multi-secuencia por etapa del CRM.
// Vercel Cron llama GET con Authorization: Bearer $CRON_SECRET.
// SEGURO POR DEFECTO: si NURTURE_LIVE !== 'true' → dry-run (no envía, no cambia BD).
// Validación:
//   ?secret=...&preview=1            → asuntos de la secuencia (seq=nuevo|postcharla|inscrito)
//   ?secret=...&preview=1&html=0     → HTML de ese paso
//   ?secret=...&test=tu@correo&paso=0&seq=nuevo → envío de prueba
// ============================================================
import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import { serviceClient, authorizedCron, bajaToken } from '@/lib/nurture';
import { SEQUENCES, secuenciaParaEstado, renderEmail } from '@/lib/sequences';
import type { LeadLike, Paso } from '@/lib/sequences';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60;

const BASE = process.env.NEXT_PUBLIC_SITE_URL || 'https://carrera.proyectoarte7.net';
const FROM = process.env.NURTURE_FROM || 'Arte7 Escuela de Cine <hola@arte7.net>';
const REPLY_TO = process.env.NURTURE_REPLYTO || 'cary@arte7.net';
const ESTADOS = ['nuevo', 'contactado', 'en_seguimiento', 'caliente', 'inscrito'];
const MAX_PER_RUN = 80;
const DAY = 86400000;

const bajaUrlFor = (id: string) => `${BASE}/api/nurture/baja?id=${id}&t=${bajaToken(id)}`;

export async function GET(req: Request) {
  if (!authorizedCron(req)) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  const url = new URL(req.url);
  const LIVE = process.env.NURTURE_LIVE === 'true';
  const resend = new Resend(process.env.RESEND_API_KEY || '');
  const sample: LeadLike = { id: 'demo', nombre: 'Ana López', email: 'demo@example.com', interes: 'Carrera CDMX' };
  const pickSeq = (k: string | null): Paso[] => SEQUENCES[k || 'nuevo'] || SEQUENCES.nuevo;

  // ── PREVIEW ──
  if (url.searchParams.get('preview')) {
    const seq = pickSeq(url.searchParams.get('seq'));
    const htmlParam = url.searchParams.get('html');
    if (htmlParam !== null) {
      const i = Math.max(0, Math.min(seq.length - 1, parseInt(htmlParam || '0', 10)));
      const r = renderEmail(sample, seq[i], bajaUrlFor('demo'));
      return new NextResponse(r.html, { headers: { 'content-type': 'text/html; charset=utf-8' } });
    }
    return NextResponse.json({
      preview: true,
      secuencias: Object.keys(SEQUENCES),
      pasos: seq.map((p, i) => ({ paso: i, dia: p.dia, canal: p.canal, asunto: renderEmail(sample, p, '#').asunto })),
    });
  }

  // ── TEST (envío a un correo, sin tocar leads) ──
  const testEmail = url.searchParams.get('test');
  if (testEmail) {
    const seq = pickSeq(url.searchParams.get('seq'));
    const i = Math.max(0, Math.min(seq.length - 1, parseInt(url.searchParams.get('paso') || '0', 10)));
    const lead: LeadLike = { id: 'test', nombre: url.searchParams.get('nombre') || 'Prueba', email: testEmail, interes: url.searchParams.get('interes') || 'Carrera CDMX' };
    const r = renderEmail(lead, seq[i], bajaUrlFor('test'));
    try {
      const { data, error } = await resend.emails.send({ from: FROM, to: [testEmail], replyTo: REPLY_TO, subject: `[PRUEBA] ${r.asunto}`, html: r.html, text: r.text });
      return NextResponse.json({ test: true, ok: !error, to: testEmail, id: data?.id, error });
    } catch (e) { return NextResponse.json({ test: true, ok: false, error: String(e) }); }
  }

  // ── RUN ──
  const sb = serviceClient();
  if (!sb) return NextResponse.json({ error: 'Falta SUPABASE_SERVICE_KEY' }, { status: 500 });

  const { data: leads, error } = await sb
    .from('leads')
    .select('id,nombre,email,telefono,interes,created_at,estado,secuencia,secuencia_inicio,nurture_paso,nurture_last_at')
    .in('estado', ESTADOS)
    .eq('nurture_pausada', false)
    .eq('nurture_done', false)
    .eq('unsubscribed', false)
    .order('created_at', { ascending: true })
    .limit(500);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const now = Date.now();
  const nowIso = new Date(now).toISOString();
  const report: Array<Record<string, unknown>> = [];
  let sent = 0, dryrun = 0, errors = 0, processed = 0;

  for (const lead of leads || []) {
    if (processed >= MAX_PER_RUN) break;

    const target = secuenciaParaEstado(lead.estado || 'nuevo');
    if (!target) continue;                       // perdido u otros → fuera
    const seq = SEQUENCES[target];
    const switched = (lead.secuencia || 'nuevo') !== target;
    const paso = switched ? 0 : (lead.nurture_paso ?? 0);

    if (paso >= seq.length) {                     // terminó esta secuencia
      if (LIVE) await sb.from('leads').update({ nurture_done: true }).eq('id', lead.id);
      continue;
    }
    const step = seq[paso];
    if (step.canal !== 'email') continue;         // WhatsApp aún no conectado

    const baseMs = switched
      ? now
      : (lead.secuencia_inicio ? new Date(lead.secuencia_inicio).getTime()
        : (lead.created_at ? new Date(lead.created_at).getTime() : now));
    if (now < baseMs + step.dia * DAY) continue;  // aún no toca
    if (!switched && lead.nurture_last_at && now - new Date(lead.nurture_last_at).getTime() < 18 * 3600000) continue;

    processed++;
    const r = renderEmail(lead as LeadLike, step, bajaUrlFor(lead.id));

    if (!LIVE) {
      dryrun++;
      report.push({ id: lead.id, email: lead.email, secuencia: target, paso, dia: step.dia, switched, status: 'dryrun', asunto: r.asunto });
      continue;                                   // dry-run NO escribe en BD
    }

    let status = 'sent', providerId: string | null = null, errMsg: string | null = null;
    try {
      const { data, error: sErr } = await resend.emails.send({ from: FROM, to: [lead.email], replyTo: REPLY_TO, subject: r.asunto, html: r.html, text: r.text });
      if (sErr) { status = 'error'; errMsg = JSON.stringify(sErr); errors++; } else { providerId = data?.id || null; sent++; }
    } catch (e) { status = 'error'; errMsg = String(e); errors++; }

    await sb.from('message_log').insert({ lead_id: lead.id, canal: 'email', secuencia: target, paso, asunto: r.asunto, destinatario: lead.email, status, provider_id: providerId, error: errMsg });

    if (status !== 'error') {
      const next = paso + 1;
      const upd: Record<string, unknown> = { nurture_paso: next, nurture_last_at: nowIso, nurture_done: next >= seq.length };
      if (switched) { upd.secuencia = target; upd.secuencia_inicio = nowIso; }
      await sb.from('leads').update(upd).eq('id', lead.id);
    }
    report.push({ id: lead.id, email: lead.email, secuencia: target, paso, dia: step.dia, switched, status });
  }

  return NextResponse.json({ live: LIVE, candidates: (leads || []).length, processed, sent, dryrun, errors, report });
}
