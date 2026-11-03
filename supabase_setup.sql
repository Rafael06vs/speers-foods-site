-- Execute no SQL Editor do seu projeto Supabase.
-- Use a chave PUBLICÁVEL (anon) no frontend; NUNCA exponha a service_role.
create table if not exists public.site_events (
  id bigint generated always as identity primary key,
  created_at timestamptz not null default now(),
  session_id uuid not null,
  event_type text not null check (event_type in ('visit', 'quote_click', 'contact_request')),
  metadata jsonb not null default '{}'::jsonb
);
create table if not exists public.site_reviews (
  id bigint generated always as identity primary key,
  created_at timestamptz not null default now(),
  session_id uuid not null,
  site_rating integer not null check (site_rating between 1 and 5),
  purchase_rating integer not null check (purchase_rating between 1 and 5),
  unique(session_id)
);
create table if not exists public.speers_admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade
);
alter table public.site_events enable row level security;
alter table public.site_reviews enable row level security;
alter table public.speers_admin_users enable row level security;
revoke all on public.site_events from anon, authenticated;
revoke all on public.site_reviews from anon, authenticated;
revoke all on public.speers_admin_users from anon, authenticated;
grant insert on public.site_events to anon, authenticated;
grant insert on public.site_reviews to anon, authenticated;
grant usage, select on sequence public.site_events_id_seq to anon, authenticated;
grant usage, select on sequence public.site_reviews_id_seq to anon, authenticated;
drop policy if exists "site_events_insert" on public.site_events;
create policy "site_events_insert" on public.site_events for insert to anon, authenticated with check (
  event_type in ('visit','quote_click','contact_request')
  and jsonb_typeof(metadata) = 'object'
  and length(metadata::text) < 1500
);
drop policy if exists "site_reviews_insert" on public.site_reviews;
create policy "site_reviews_insert" on public.site_reviews for insert to anon, authenticated with check (
  site_rating between 1 and 5 and purchase_rating between 1 and 5
);
-- Apenas usuários cadastrados em speers_admin_users conseguem executar esta função.
create or replace function public.speers_admin_stats()
returns jsonb
language plpgsql security definer set search_path = ''
as $$
begin
  if auth.uid() is null or not exists (
    select 1 from public.speers_admin_users where user_id = auth.uid()
  ) then
    raise exception 'Acesso não autorizado' using errcode = '42501';
  end if;
  return (
    select jsonb_build_object(
      'visits', (select count(*) from public.site_events where event_type = 'visit'),
      'unique_sessions', (select count(distinct session_id) from public.site_events where event_type = 'visit'),
      'quote_clicks', (select count(*) from public.site_events where event_type = 'quote_click'),
      'review_count', (select count(*) from public.site_reviews),
      'site_avg', (select round(avg(site_rating)::numeric,2) from public.site_reviews),
      'purchase_avg', (select round(avg(purchase_rating)::numeric,2) from public.site_reviews)
    )
  );
end;
$$;
revoke all on function public.speers_admin_stats() from public, anon;
grant execute on function public.speers_admin_stats() to authenticated;
-- Após criar o usuário em Authentication > Users, execute com o UUID real:
-- insert into public.speers_admin_users(user_id) values ('UUID-DO-USUARIO-ADMIN');
