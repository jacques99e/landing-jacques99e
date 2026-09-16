-- Assistant WhatsApp (Landing Cloud API). Service role only.
create table if not exists public.whatsapp_assistant_threads (
  phone text primary key,
  mode text not null default 'bot',
  name text,
  messages jsonb not null default '[]'::jsonb,
  merchant jsonb,
  referral jsonb,
  last_human_at timestamptz,
  seen_ids jsonb not null default '[]'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.whatsapp_assistant_threads enable row level security;

comment on table public.whatsapp_assistant_threads is
  'Fils WhatsApp Cloud API — lecture/écriture uniquement via SUPABASE_SERVICE_ROLE_KEY';
