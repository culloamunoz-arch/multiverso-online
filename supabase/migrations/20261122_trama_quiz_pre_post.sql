-- Aplicada en Supabase (proyecto bsbufxnyrtggsaqwttau) el 2026-11-22.
-- Preguntas antes/después del Viaje al interior. Anónimo: solo un id aleatorio del navegador.
create table if not exists public.trama_quiz (
  id bigint generated always as identity primary key,
  visitor text not null check (char_length(visitor) between 4 and 64),
  phase text not null check (phase in ('pre','post')),
  answers smallint[] not null,
  correct boolean[] not null,
  score smallint not null,
  created_at timestamptz not null default now(),
  unique (visitor, phase)
);
alter table public.trama_quiz enable row level security;
revoke all on public.trama_quiz from anon, authenticated;
-- Funciones trama_quiz_submit(p_visitor, p_phase, p_answers) y trama_quiz_stats():
-- security definer, search_path vacío; la clave de respuestas se valida en el servidor.
