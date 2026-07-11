-- ============================================
-- AI MT0 Studio 会員システム - フェーズ8 追加スキーマ
-- supabase-schema.sql 〜 phase7.sql を実行済みであることが前提です。
-- Supabaseダッシュボード > SQL Editor で一度だけ実行してください
-- https://supabase.com/dashboard/project/ntefttoofbntaeaphkad/sql/new
-- ============================================

-- ============================================
-- 売上管理（手動入力）
-- note等の外部サービスでの販売は自動連携できないため、
-- 管理者が手動で商品名・金額・販売日を記録する。
-- 会員アカウントに紐付く自動購入用の purchases テーブルとは別物。
-- 商品名は自由入力（将来 note 以外の商品にも対応するため）。
-- ============================================
create table if not exists public.sales (
  id           uuid primary key default gen_random_uuid(),
  product_name text not null,
  amount       numeric not null default 0,
  sold_at      date not null default current_date,
  note         text,
  created_by   uuid references public.profiles(id),
  created_at   timestamptz not null default now()
);
alter table public.sales enable row level security;

drop policy if exists "sales_admin_all" on public.sales;
create policy "sales_admin_all" on public.sales
  for all using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));
