# 🤖 Motor de Nurturing (seguimiento automático de prospectos)

Pilar 4 del plan de automatización: convierte el seguimiento **manual** (Cary abriendo wa.me/mailto) en una **secuencia automática DÍA 0 → 30**.
Hoy envía por **email** (Resend, ya integrado). **WhatsApp se enchufa después** sin cambiar la cadencia.

> 🛡️ **Seguro por defecto:** si no existe `NURTURE_LIVE=true`, corre en **modo dry-run** (NO envía, NO avanza el estado del lead). No spamea a nadie hasta que tú lo actives tras probarlo.

## Cómo funciona
- Un **cron diario** (Vercel) revisa los leads activos (estados `nuevo`→`inscrito`), no pausados, no dados de baja.
- **3 secuencias por etapa** (cambia sola cuando Cary mueve el estado del lead): `nuevo` (frío, 6 pasos DÍA 0→30) · `postcharla` (en seguimiento/caliente, 3 pasos) · `inscrito` (bienvenida, 2 pasos).
- A cada lead le manda el paso que le toca según los días en su secuencia actual y avanza su `nurture_paso`.
- **Auto-pausa inteligente:** si Cary mueve el lead a `caliente`/`inscrito`/`perdido`, sale de la secuencia solo. El prospecto también puede **darse de baja** (link firmado en cada correo).
- Todo queda registrado en la tabla `message_log`.

## Archivos
| Archivo | Qué es |
|---|---|
| `db/nurture_v1.sql` | Migración: columnas `nurture_*` en `leads` + tabla `message_log` |
| `lib/sequences.ts` | La secuencia (6 pasos) + plantillas de correo (voz cálida, no insistente) |
| `lib/nurture.ts` | Cliente Supabase service, token de baja firmado, guard del cron |
| `app/api/cron/nurture/route.ts` | El motor (cron) + modos `preview` y `test` |
| `app/api/nurture/baja/route.ts` | Página de baja (unsubscribe) |
| `vercel.json` | Cron diario `0 16 * * *` (~10am CDMX) |

## Variables de entorno (en Vercel, proyecto carrera-landing)
| Var | ¿Nueva? | Para qué |
|---|---|---|
| `CRON_SECRET` | **nueva** | Vercel la manda como `Authorization: Bearer` al cron; sin ella el cron no corre |
| `SUPABASE_SERVICE_KEY` | probablemente ya existe | el cron lee/actualiza leads (bypassa RLS) |
| `RESEND_API_KEY` | ya existe | envío de correos |
| `NEXT_PUBLIC_SITE_URL` | recomendada | base para el link de baja (ej. `https://carrera.proyectoarte7.net`) |
| `NURTURE_FROM` / `NURTURE_REPLYTO` | opcionales | remitente y reply-to (default `hola@arte7.net` / `cary@arte7.net`) |
| `NURTURE_LIVE` | **interruptor** | `true` = envía de verdad. Sin poner = dry-run |

## Activación paso a paso
1. **Migración:** corre `db/nurture_v1.sql` en el SQL editor de Supabase (idempotente, no borra nada).
2. **Env vars:** en Vercel pon `CRON_SECRET` (inventa una larga), `NEXT_PUBLIC_SITE_URL`, y confirma `SUPABASE_SERVICE_KEY` + `RESEND_API_KEY`. **Deja `NURTURE_LIVE` SIN poner** (dry-run).
3. **Deploy** (push/redeploy). El cron queda agendado pero inerte (dry-run).
4. **Prueba sin enviar:** abre
   `https://carrera.proyectoarte7.net/api/cron/nurture?secret=TU_CRON_SECRET&preview=1` → ves los 6 asuntos.
   Agrega `&html=0` (…`&html=3`) → ves el HTML de ese paso.
5. **Prueba de envío real (a TI):**
   `…/api/cron/nurture?secret=...&test=tu@correo.com&paso=0` → te llega el correo del paso 0.
6. **Dry-run con datos reales:** `…/api/cron/nurture?secret=...` → devuelve el `report` de a quién LE TOCARÍA, sin enviar ni avanzar nada.
7. **Activar:** cuando te guste, pon `NURTURE_LIVE=true` en Vercel y redeploy. Desde ahí el cron diario envía de verdad.

## Operación
- **Ver qué se mandó:** tabla `message_log` (canal, paso, status, fecha).
- **Pausar un lead:** `nurture_pausada=true` (o mueve su `estado`).
- **Reiniciar a alguien:** `nurture_paso=0, nurture_done=false`.
- **Baja:** el prospecto da clic en el link del correo → `unsubscribed=true`.

## Añadir WhatsApp después (sin rehacer nada)
1. Da de alta WhatsApp Business API (Twilio o 360dialog).
2. En `lib/sequences.ts` agrega pasos con `canal:'whatsapp'` (o duplica la cadencia).
3. En el cron, donde hoy dice `if (step.canal !== 'email') continue;`, añade el adaptador de envío por WhatsApp.
La cadencia, el estado, la auto-pausa y el log ya están listos.

## Notas
- Vercel **Hobby**: cron 1×/día (suficiente para cadencia por días). En Pro se puede subir la frecuencia.
- Verificado: `tsc --noEmit` 0 errores. No toca el endpoint de captura de leads existente.
- Voz de los correos: cálida, útil, **sin presión ni culpa** (respeta la regla de copy del proyecto). Un solo CTA por mensaje + baja siempre visible.
