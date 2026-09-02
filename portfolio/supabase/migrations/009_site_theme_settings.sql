-- ═══════════════════════════════════════════════════════════════════
-- 009_site_theme_settings.sql — Global site theme & customization engine
-- ═══════════════════════════════════════════════════════════════════

create table if not exists public.site_settings (
  id text primary key default 'global',
  active_theme text not null default 'modern'
    check (active_theme in ('modern', 'cafe', 'cyber')),
  updated_at timestamptz not null default now()
);

alter table public.site_settings enable row level security;

-- Everyone (visitors & client) can read the site theme setting
drop policy if exists "Anyone can read site_settings" on public.site_settings;
create policy "Anyone can read site_settings"
  on public.site_settings for select
  using (true);

-- Only admins can update the site theme setting
drop policy if exists "Admins can update site_settings" on public.site_settings;
create policy "Admins can update site_settings"
  on public.site_settings for update
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "Admins can insert site_settings" on public.site_settings;
create policy "Admins can insert site_settings"
  on public.site_settings for insert
  with check (public.is_admin());

-- Seed default global configuration row
insert into public.site_settings (id, active_theme)
values ('global', 'modern')
on conflict (id) do nothing;
