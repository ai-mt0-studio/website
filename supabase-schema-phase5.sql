-- ============================================
-- AI MT0 Studio 会員システム - フェーズ5 追加スキーマ
-- supabase-schema.sql / phase1 / phase2 / phase3 / phase4 を実行済みであることが前提です。
-- Supabaseダッシュボード > SQL Editor で一度だけ実行してください
-- https://supabase.com/dashboard/project/ntefttoofbntaeaphkad/sql/new
-- ============================================

-- ============================================
-- お問い合わせ管理
-- contact.html のネイティブフォームから送信される。
-- 未ログイン訪問者でも送信できる必要があるため insert は誰でも可、
-- 閲覧・更新・削除は管理者のみに限定する。
-- ============================================
create table if not exists public.inquiries (
  id         uuid primary key default gen_random_uuid(),
  name       text not null,
  company    text,
  email      text not null,
  message    text not null,
  status     text not null default '未対応',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.inquiries enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'inquiries_status_check'
  ) then
    alter table public.inquiries
      add constraint inquiries_status_check check (status in ('未対応', '対応中', '完了'));
  end if;
end $$;

drop policy if exists "inquiries_insert_public" on public.inquiries;
create policy "inquiries_insert_public" on public.inquiries
  for insert with check (true);

drop policy if exists "inquiries_select_admin" on public.inquiries;
create policy "inquiries_select_admin" on public.inquiries
  for select using (public.is_admin(auth.uid()));

drop policy if exists "inquiries_update_admin" on public.inquiries;
create policy "inquiries_update_admin" on public.inquiries
  for update using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));

drop policy if exists "inquiries_delete_admin" on public.inquiries;
create policy "inquiries_delete_admin" on public.inquiries
  for delete using (public.is_admin(auth.uid()));
