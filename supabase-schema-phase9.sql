-- ============================================
-- AI MT0 Studio 会員システム - フェーズ9 追加スキーマ
-- supabase-schema.sql 〜 phase8.sql を実行済みであることが前提です。
-- Supabaseダッシュボード > SQL Editor で一度だけ実行してください
-- https://supabase.com/dashboard/project/ntefttoofbntaeaphkad/sql/new
-- ============================================

-- ============================================
-- メルマガ・お知らせ登録
-- 会員登録不要・メールアドレスのみで登録できる簡易フォーム用。
-- 誰でも登録（insert）できるが、一覧の閲覧（select）は管理者のみ。
-- 実際の配信システムは未実装で、まずはアドレス収集のみ行う。
-- ============================================
create table if not exists public.newsletter_subscribers (
  id         uuid primary key default gen_random_uuid(),
  email      text not null unique,
  source     text,
  created_at timestamptz not null default now()
);
alter table public.newsletter_subscribers enable row level security;

drop policy if exists "newsletter_public_insert" on public.newsletter_subscribers;
create policy "newsletter_public_insert" on public.newsletter_subscribers
  for insert to anon, authenticated with check (true);

drop policy if exists "newsletter_admin_select" on public.newsletter_subscribers;
create policy "newsletter_admin_select" on public.newsletter_subscribers
  for select using (public.is_admin(auth.uid()));

drop policy if exists "newsletter_admin_delete" on public.newsletter_subscribers;
create policy "newsletter_admin_delete" on public.newsletter_subscribers
  for delete using (public.is_admin(auth.uid()));
