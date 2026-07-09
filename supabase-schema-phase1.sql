-- ============================================
-- AI MT0 Studio 会員システム - フェーズ1 追加スキーマ
-- supabase-schema.sql を実行済みであることが前提です。
-- Supabaseダッシュボード > SQL Editor で一度だけ実行してください
-- https://supabase.com/dashboard/project/ntefttoofbntaeaphkad/sql/new
-- ============================================

create extension if not exists pgcrypto;

-- 将来のロール多様化に備えた列
-- 現状の管理者判定は引き続き is_admin(boolean) を正として使用する。
-- role は今後 'member' / 'admin' / 'editor' 等に拡張する余地を持たせるための予約列。
alter table public.profiles add column if not exists role text not null default 'member';

-- ============================================
-- お知らせ管理（管理者がCRUD、一般ユーザーは公開分のみ閲覧）
-- ============================================
create table if not exists public.announcements (
  id          uuid primary key default gen_random_uuid(),
  title       text not null,
  body        text not null default '',
  published   boolean not null default false,
  created_by  uuid references public.profiles(id),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
alter table public.announcements enable row level security;

drop policy if exists "announcements_select_published" on public.announcements;
create policy "announcements_select_published" on public.announcements
  for select using (published = true or public.is_admin(auth.uid()));

drop policy if exists "announcements_admin_write" on public.announcements;
create policy "announcements_admin_write" on public.announcements
  for all using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));

-- ============================================
-- ツール管理（管理者がCRUD、一般ユーザーは公開中のみ閲覧）
-- ============================================
create table if not exists public.tools (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  description text default '',
  url         text,
  price       numeric,
  is_active   boolean not null default true,
  created_by  uuid references public.profiles(id),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
alter table public.tools enable row level security;

drop policy if exists "tools_select_active" on public.tools;
create policy "tools_select_active" on public.tools
  for select using (is_active = true or public.is_admin(auth.uid()));

drop policy if exists "tools_admin_write" on public.tools;
create policy "tools_admin_write" on public.tools
  for all using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));

-- ============================================
-- 以下3テーブルは「今後実装予定」機能のための先行テーブル設計。
-- UI側はプレースホルダー（準備中）表示のみで、書き込み機能は未実装。
-- ============================================

-- お気に入り
create table if not exists public.favorites (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references public.profiles(id) on delete cascade,
  tool_id    uuid references public.tools(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (user_id, tool_id)
);
alter table public.favorites enable row level security;

drop policy if exists "favorites_own" on public.favorites;
create policy "favorites_own" on public.favorites
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- 購入済みツール／売上管理の元データ
create table if not exists public.purchases (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references public.profiles(id) on delete cascade,
  tool_id      uuid references public.tools(id),
  amount       numeric not null default 0,
  purchased_at timestamptz not null default now()
);
alter table public.purchases enable row level security;

drop policy if exists "purchases_select_own" on public.purchases;
create policy "purchases_select_own" on public.purchases
  for select using (auth.uid() = user_id);

drop policy if exists "purchases_select_admin" on public.purchases;
create policy "purchases_select_admin" on public.purchases
  for select using (public.is_admin(auth.uid()));

-- AI相談履歴
create table if not exists public.ai_consultations (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references public.profiles(id) on delete cascade,
  question   text not null,
  answer     text,
  created_at timestamptz not null default now()
);
alter table public.ai_consultations enable row level security;

drop policy if exists "ai_consultations_select_own" on public.ai_consultations;
create policy "ai_consultations_select_own" on public.ai_consultations
  for select using (auth.uid() = user_id);

drop policy if exists "ai_consultations_insert_own" on public.ai_consultations;
create policy "ai_consultations_insert_own" on public.ai_consultations
  for insert with check (auth.uid() = user_id);

drop policy if exists "ai_consultations_select_admin" on public.ai_consultations;
create policy "ai_consultations_select_admin" on public.ai_consultations
  for select using (public.is_admin(auth.uid()));
