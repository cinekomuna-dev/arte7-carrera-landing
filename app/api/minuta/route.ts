import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY!);

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { fecha, pendientes, agenda, notas, pasos } = body;

    const fmtCheck = (done: boolean) =>
      done
        ? `<span style="color:#2ECC71;font-weight:bold;">✓</span>`
        : `<span style="color:#FF492F;">✗</span>`;

    const pendientesRows = (pendientes || [])
      .map(
        (p: { title: string; done: boolean; input: string }) => `
        <tr style="border-bottom:1px solid rgba(253,243,224,0.08);">
          <td style="padding:10px 8px;width:32px;text-align:center;">${fmtCheck(p.done)}</td>
          <td style="padding:10px 8px;font-family:monospace;font-size:12px;letter-spacing:1px;color:${p.done ? '#2ECC71' : '#FDF3E0'};${p.done ? 'text-decoration:line-through;opacity:0.6;' : ''}">${p.title}</td>
          <td style="padding:10px 8px;font-size:12px;color:rgba(253,243,224,0.55);">${p.input || '—'}</td>
        </tr>`
      )
      .join('');

    const agendaRows = (agenda || [])
      .map(
        (a: { title: string; done: boolean }) => `
        <tr style="border-bottom:1px solid rgba(253,243,224,0.08);">
          <td style="padding:10px 8px;width:32px;text-align:center;">${fmtCheck(a.done)}</td>
          <td style="padding:10px 8px;font-size:13px;color:${a.done ? '#2ECC71' : '#FDF3E0'};${a.done ? 'opacity:0.6;text-decoration:line-through;' : ''}">${a.title}</td>
        </tr>`
      )
      .join('');

    const pasosRows = (pasos || [])
      .map(
        (p: { label: string; title: string; done: boolean }) => `
        <tr style="border-bottom:1px solid rgba(253,243,224,0.08);">
          <td style="padding:10px 8px;width:32px;text-align:center;">${fmtCheck(p.done)}</td>
          <td style="padding:10px 8px;font-family:monospace;font-size:11px;color:#FF492F;width:28px;">${p.label}</td>
          <td style="padding:10px 8px;font-family:monospace;font-size:12px;letter-spacing:1px;color:${p.done ? '#2ECC71' : '#FDF3E0'};${p.done ? 'text-decoration:line-through;opacity:0.6;' : ''}">${p.title}</td>
        </tr>`
      )
      .join('');

    const donePendientes = (pendientes || []).filter((p: { done: boolean }) => p.done).length;
    const doneAgenda = (agenda || []).filter((a: { done: boolean }) => a.done).length;
    const donePasos = (pasos || []).filter((p: { done: boolean }) => p.done).length;
    const totalDone = donePendientes + doneAgenda + donePasos;
    const totalItems = (pendientes?.length || 0) + (agenda?.length || 0) + (pasos?.length || 0);
    const pct = totalItems > 0 ? Math.round((totalDone / totalItems) * 100) : 0;

    const html = `
<!DOCTYPE html>
<html lang="es">
<head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/></head>
<body style="margin:0;padding:0;background:#111;font-family:'Helvetica Neue',sans-serif;">
<div style="max-width:680px;margin:0 auto;background:#1A1A1A;color:#FDF3E0;">

  <!-- HEADER -->
  <div style="background:#FF492F;padding:40px 40px 32px;">
    <div style="font-family:monospace;font-size:10px;letter-spacing:3px;color:rgba(253,243,224,0.7);margin-bottom:8px;">// MINUTA DE SESIÓN</div>
    <div style="font-size:36px;font-weight:900;letter-spacing:-1px;line-height:1;">ARTE7</div>
    <div style="font-size:20px;font-weight:700;letter-spacing:2px;margin-top:4px;">JUNTA ${fecha || '—'}</div>
    <div style="font-family:monospace;font-size:11px;letter-spacing:2px;margin-top:16px;opacity:0.8;">ESTRATEGIA DIGITAL · NINO COZZI · DREAMSMATTER.AI</div>
  </div>

  <!-- PROGRESO -->
  <div style="background:#111;padding:20px 40px;display:flex;align-items:center;gap:16px;">
    <div style="font-family:monospace;font-size:10px;letter-spacing:2px;color:#038B96;">PROGRESO TOTAL</div>
    <div style="flex:1;height:4px;background:#2E2E2E;border-radius:2px;">
      <div style="height:4px;background:#FF492F;width:${pct}%;border-radius:2px;"></div>
    </div>
    <div style="font-family:monospace;font-size:14px;color:#FF492F;font-weight:bold;">${pct}%</div>
    <div style="font-family:monospace;font-size:10px;color:rgba(253,243,224,0.4);">${totalDone}/${totalItems}</div>
  </div>

  <div style="padding:0 40px 40px;">

    <!-- PENDIENTES -->
    <div style="margin-top:36px;">
      <div style="font-family:monospace;font-size:10px;letter-spacing:3px;color:#FF492F;margin-bottom:12px;">// PENDIENTES DE ARTE7 — ${donePendientes}/${pendientes?.length || 0} resueltos</div>
      <table style="width:100%;border-collapse:collapse;background:#111;">
        <tr style="background:#2E2E2E;">
          <th style="padding:8px;width:32px;"></th>
          <th style="padding:8px;text-align:left;font-family:monospace;font-size:10px;letter-spacing:2px;color:rgba(253,243,224,0.4);">PENDIENTE</th>
          <th style="padding:8px;text-align:left;font-family:monospace;font-size:10px;letter-spacing:2px;color:rgba(253,243,224,0.4);">ACUERDO / VALOR</th>
        </tr>
        ${pendientesRows}
      </table>
    </div>

    <!-- AGENDA -->
    <div style="margin-top:36px;">
      <div style="font-family:monospace;font-size:10px;letter-spacing:3px;color:#FF492F;margin-bottom:12px;">// AGENDA — ${doneAgenda}/${agenda?.length || 0} puntos cubiertos</div>
      <table style="width:100%;border-collapse:collapse;background:#111;">
        <tr style="background:#2E2E2E;">
          <th style="padding:8px;width:32px;"></th>
          <th style="padding:8px;text-align:left;font-family:monospace;font-size:10px;letter-spacing:2px;color:rgba(253,243,224,0.4);">PUNTO DE AGENDA</th>
        </tr>
        ${agendaRows}
      </table>
    </div>

    <!-- NOTAS -->
    ${
      notas
        ? `<div style="margin-top:36px;">
      <div style="font-family:monospace;font-size:10px;letter-spacing:3px;color:#FF492F;margin-bottom:12px;">// NOTAS DE SESIÓN</div>
      <div style="background:#111;border-left:3px solid #FF492F;padding:20px 24px;font-size:13px;line-height:1.8;white-space:pre-wrap;color:rgba(253,243,224,0.85);">${notas}</div>
    </div>`
        : ''
    }

    <!-- PRÓXIMOS PASOS -->
    <div style="margin-top:36px;">
      <div style="font-family:monospace;font-size:10px;letter-spacing:3px;color:#FF492F;margin-bottom:12px;">// PRÓXIMOS PASOS — ${donePasos}/${pasos?.length || 0} completados</div>
      <table style="width:100%;border-collapse:collapse;background:#111;">
        <tr style="background:#2E2E2E;">
          <th style="padding:8px;width:32px;"></th>
          <th style="padding:8px;width:28px;"></th>
          <th style="padding:8px;text-align:left;font-family:monospace;font-size:10px;letter-spacing:2px;color:rgba(253,243,224,0.4);">TAREA</th>
        </tr>
        ${pasosRows}
      </table>
    </div>

  </div>

  <!-- FOOTER -->
  <div style="background:#111;border-top:1px solid #2E2E2E;padding:24px 40px;display:flex;justify-content:space-between;align-items:center;">
    <div style="font-family:monospace;font-size:10px;letter-spacing:2px;color:rgba(253,243,224,0.3);">ARTE7 // ESCUELA DE CINE · CDMX</div>
    <div style="font-family:monospace;font-size:10px;letter-spacing:2px;color:rgba(253,243,224,0.3);">DREAMSMATTER.AI</div>
  </div>

</div>
</body>
</html>`;

    await resend.emails.send({
      from: 'Arte7 Junta <noreply@arte7.net>',
      to: ['nino@dreamsmatter.ai'],
      subject: `MINUTA — ARTE7 Junta ${fecha || new Date().toLocaleDateString('es-MX')} · ${pct}% completado`,
      html,
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Minuta API error:', err);
    return NextResponse.json({ error: 'Error al generar minuta' }, { status: 500 });
  }
}
