-- ============================================
-- AI MT0 Studio 会員システム - フェーズ3 追加スキーマ
-- supabase-schema.sql / phase1 / phase2 を実行済みであることが前提です。
-- Supabaseダッシュボード > SQL Editor で一度だけ実行してください
-- https://supabase.com/dashboard/project/ntefttoofbntaeaphkad/sql/new
-- ============================================

-- ============================================
-- AI相談：ステータス・区分・メール・更新日時を追加
-- ============================================
alter table public.ai_consultations add column if not exists email text;
alter table public.ai_consultations add column if not exists consultation_type text;
alter table public.ai_consultations add column if not exists status text not null default '未対応';
alter table public.ai_consultations add column if not exists updated_at timestamptz not null default now();

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'ai_consultations_status_check'
  ) then
    alter table public.ai_consultations
      add constraint ai_consultations_status_check check (status in ('未対応', '対応中', '完了'));
  end if;
end $$;

-- 管理者はステータス変更などの更新ができるようにする
-- （select系のポリシーはphase1で作成済み。updateポリシーが無かったため追加）
drop policy if exists "ai_consultations_update_admin" on public.ai_consultations;
create policy "ai_consultations_update_admin" on public.ai_consultations
  for update using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));
