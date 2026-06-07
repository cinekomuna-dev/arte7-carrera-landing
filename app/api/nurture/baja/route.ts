// Baja (unsubscribe) de la secuencia de nurturing. Link firmado en cada correo.
import { NextResponse } from 'next/server';
import { serviceClient, verifyBaja } from '@/lib/nurture';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function page(msg: string) {
  return new NextResponse(
    `<!DOCTYPE html><html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Arte7</title></head>
<body style="margin:0;background:#0E0E0E;color:#FDF3E0;font-family:Arial,Helvetica,sans-serif;display:flex;min-height:100vh;align-items:center;justify-content:center;">
<div style="max-width:440px;padding:40px;text-align:center;">
<div style="font-size:26px;font-weight:bold;letter-spacing:3px;">ARTE<span style="color:#FF492F">7</span></div>
<p style="font-size:16px;line-height:1.6;color:rgba(253,243,224,.85);margin-top:22px;">${msg}</p>
</div></body></html>`,
    { headers: { 'content-type': 'text/html; charset=utf-8' } }
  );
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const id = url.searchParams.get('id') || '';
  const t = url.searchParams.get('t') || '';
  if (!id || !verifyBaja(id, t)) return page('Enlace inválido o expirado.');

  const sb = serviceClient();
  if (!sb) return page('No pudimos procesar la baja en este momento. Escríbenos a cary@arte7.net y la aplicamos.');

  const { error } = await sb.from('leads').update({ unsubscribed: true, nurture_pausada: true }).eq('id', id);
  if (error) return page('Ocurrió un error. Escríbenos a cary@arte7.net y la aplicamos.');

  return page('Listo, no recibirás más correos de seguimiento. Gracias por tu interés en Arte7. 🎬');
}
