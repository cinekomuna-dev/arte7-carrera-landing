# Variables de entorno — Tracking (20 may 2026)

**9 variables nuevas** para activar Meta Pixel + GA4 + GTM + Conversions API en las 4 landings (carrera CDMX/QRO + diplomado CDMX/QRO).

Configurar en:
1. **Local:** agregar al `.env.local` (gitignored)
2. **Vercel:** Settings → Environment Variables → Production + Preview

Detalles de cómo obtener cada valor: `00_ECOSISTEMA_ARTE7/MIGRACION_TRACKING_PA7_20MAY.html` (las landings usan el mismo Pixel + GA4 que sitio-net porque la Custom Audience se comparte y el equipo de Meta optimiza mejor con señal consolidada).

---

## Meta Pixel (client-side)

```
NEXT_PUBLIC_META_PIXEL_PA7_ID=<pixel-id-pa7-de-abril>
NEXT_PUBLIC_META_PIXEL_ARTE7_ID=1592563890903457
```

Dual-pixel: las landings cargan ambos. PA7 dispara todos los eventos (PageView, ViewContent, Lead). Arte7 dispara solo PageView + ViewContent para mantener viva la Custom Audience legacy.

---

## Meta Conversions API (server-side, SECRET)

```
META_CAPI_PIXEL_ID=<mismo-que-pixel-pa7-id>
META_CAPI_TOKEN=<system-user-token-de-abril>     # SENSITIVE
META_CAPI_TEST_EVENT_CODE=                        # Opcional, solo QA
```

---

## Verificación dominio Meta

```
META_DOMAIN_VERIFICATION_TOKEN=<token-business-settings-brand-safety>
```

Inyecta el meta-tag `facebook-domain-verification` en `<head>` via `metadata.verification` del `app/layout.tsx`. Verificar el dominio `carrera.proyectoarte7.net` en Brand Safety → Domains.

---

## Google Analytics 4

```
NEXT_PUBLIC_GA4_PA7_ID=G-XXXXXXXX
GA4_MEASUREMENT_ID=G-XXXXXXXX
GA4_API_SECRET=<measurement-protocol-api-secret>  # SENSITIVE
```

---

## Google Tag Manager

```
NEXT_PUBLIC_GTM_PA7_ID=GTM-XXXXXXX
```

---

## Comportamiento sin env vars

Fail-safe: si las variables no están configuradas, los scripts no se cargan y los endpoints CAPI / GA4 MP devuelven `{ ok: false, error: "Missing ..." }` sin tirar excepción. El `/api/lead` sigue funcionando normalmente (Supabase + Resend a Cary).

Permite deployar el código hoy y activar tracking cuando Abril termine su parte en Meta + Nino cree GA4/GTM PA7.

---

## Eventos que se disparan en cada landing

| Landing | trackViewContent name | trackLead program (default) | WhatsApp redirect |
|---|---|---|---|
| `/` (CDMX) | `carrera_cdmx` | `carrera_cdmx` | wa.me/525527323335 |
| `/qro` | `carrera_qro` | `Carrera Querétaro` | wa.me/524422810663 |
| `/diplomado-cdmx` | `diplomado_cdmx` | `Diplomado CDMX` | wa.me/525527323335 |
| `/diplomado-qro` | `diplomado_qro` | `Diplomado QRO` | wa.me/524422810663 |

Cada evento dispara:
- **Browser:** `fbq('trackSingle', PA7_PIXEL, 'Lead', {...}, { eventID })`
- **Server:** Meta CAPI con email + phone hasheados SHA-256 + IP + UA + fbp/fbc cookies
- **GA4:** evento `generate_lead` con currency MXN, score, utm_*, event_id (browser via gtag + server via Measurement Protocol)

Meta deduplica browser+server por el mismo `event_id` UUID.
