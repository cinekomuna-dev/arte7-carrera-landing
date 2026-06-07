-- ============================================================
-- Motor de nurturing v1 — estado de secuencia en `leads` + log de mensajes
-- Correr en el SQL editor del proyecto Supabase de carrera-landing.
-- Idempotente (IF NOT EXISTS). No borra ni modifica datos existentes.
-- ============================================================

alter table public.leads
  add column if not exists nurture_paso     int         not null default 0,   -- próximo paso a enviar (índice en la secuencia)
  add column if not exists nurture_last_at  timestamptz,                       -- último envío
  add column if not exists nurture_pausada  boolean     not null default false,-- pausa manual
  add column if not exists nurture_done      boolean    not null default false,-- secuencia terminada
  add column if not exists unsubscribed     boolean     not null default false, -- baja del prospecto
  add column if not exists secuencia        text        not null default 'nuevo', -- en qué secuencia está (nuevo|postcharla|inscrito)
  add column if not exists secuencia_inicio timestamptz; -- cuándo entró a la secuencia actual (base para contar días)

create table if not exists public.message_log (
  id          uuid primary key default gen_random_uuid(),
  lead_id     bigint references public.leads(id) on delete cascade,   -- leads.id es bigint
  canal       text not null default 'email',     -- email | whatsapp
  secuencia   text not null default 'nuevo',
  paso        int  not null,
  asunto      text,
  destinatario text,
  status      text not null,                      -- sent | dryrun | error | skipped
  provider_id text,
  error       text,
  created_at  timestamptz not null default now()
);

create index if not exists idx_message_log_lead on public.message_log(lead_id);
create index if not exists idx_leads_nurture on public.leads(estado, nurture_pausada, nurture_done, nurture_paso);

-- El cron usa el service role key (bypassa RLS). No se requieren políticas nuevas.
