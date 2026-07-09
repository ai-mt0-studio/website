-- ============================================
-- AI MT0 Studio 会員システム - フェーズ4 追加スキーマ
-- supabase-schema.sql / phase1 / phase2 / phase3 を実行済みであることが前提です。
-- Supabaseダッシュボード > SQL Editor で一度だけ実行してください
-- https://supabase.com/dashboard/project/ntefttoofbntaeaphkad/sql/new
-- ============================================

-- 送信時点で「初回相談だったか」を記録（後から集計・請求管理をしやすくするため）
alter table public.ai_consultations add column if not exists is_first_time boolean not null default true;

-- 有料相談の入金確認チェック（運用の目印。金額そのものはDBでは持たずコード側の定数で管理）
alter table public.ai_consultations add column if not exists payment_confirmed boolean not null default false;
