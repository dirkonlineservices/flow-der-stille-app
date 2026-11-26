-- public.app_config: small key/value store for live settings (app update popup, web promotions).
-- The frontend already read it, but the table did not exist yet in production.
create table if not exists public.app_config (
  key text primary key,
  value text not null default '',
  updated_at timestamptz not null default now()
);

alter table public.app_config enable row level security;

drop policy if exists "app_config_read_all" on public.app_config;
create policy "app_config_read_all" on public.app_config
  for select to anon, authenticated
  using (true);

drop policy if exists "app_config_admin_write" on public.app_config;
create policy "app_config_admin_write" on public.app_config
  for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

grant select on public.app_config to anon, authenticated;
grant insert, update, delete on public.app_config to authenticated;

-- Web promotion (Black Friday weekend 2026): 10 % on all Ruhe-Shop products via PayPal.
-- Read by src/lib/promo.ts (banner, prices, PayPal amount) and by the edge function process-purchase.
insert into public.app_config (key, value, updated_at) values
  ('promo_aktiv', 'true', now()),
  ('promo_rabatt_prozent', '10', now()),
  ('promo_start', '2026-11-27T00:00:00+01:00', now()),
  ('promo_ende', '2026-11-29T23:59:59+01:00', now()),
  ('promo_titel', 'Black Friday Wochenende', now())
on conflict (key) do update set value = excluded.value, updated_at = excluded.updated_at;
