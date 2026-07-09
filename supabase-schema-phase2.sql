-- ============================================
-- AI MT0 Studio 会員システム - フェーズ2 追加スキーマ
-- supabase-schema.sql / supabase-schema-phase1.sql を実行済みであることが前提です。
-- Supabaseダッシュボード > SQL Editor で一度だけ実行してください
-- https://supabase.com/dashboard/project/ntefttoofbntaeaphkad/sql/new
-- ============================================

-- ============================================
-- プロフィール拡張：氏名・アイコン画像
-- ============================================
alter table public.profiles add column if not exists full_name text;
alter table public.profiles add column if not exists avatar_url text;

-- ============================================
-- お知らせ：公開日
-- ============================================
alter table public.announcements add column if not exists published_at timestamptz;

-- ============================================
-- ツール：無料/有料の種別
-- ============================================
alter table public.tools add column if not exists is_free boolean not null default false;

-- ============================================
-- お気に入り：実際のツールページ（静的スラッグ文字列）を対象にするため再設計。
-- フェーズ1では tools テーブル（管理者CRUD用の器）へのUUID参照だったが、
-- 実際にユーザーがお気に入りしたいのは公開中の実ツールページ
-- （advisor-tool.html 等）のため、tool_id(uuid) → tool_slug(text) に変更する。
-- まだ機能を実装しておらずデータも無いため、テーブルを作り直す。
-- ============================================
drop table if exists public.favorites cascade;

create table public.favorites (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references public.profiles(id) on delete cascade,
  tool_slug  text not null,
  created_at timestamptz not null default now(),
  unique (user_id, tool_slug)
);
alter table public.favorites enable row level security;

drop policy if exists "favorites_own" on public.favorites;
create policy "favorites_own" on public.favorites
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ============================================
-- アイコン画像用ストレージバケット
-- パス規則: avatars/{user_id}/xxxx  （本人のみ書き込み可、閲覧は公開）
-- ============================================
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

drop policy if exists "avatars_public_read" on storage.objects;
create policy "avatars_public_read" on storage.objects
  for select using (bucket_id = 'avatars');

drop policy if exists "avatars_owner_insert" on storage.objects;
create policy "avatars_owner_insert" on storage.objects
  for insert with check (
    bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "avatars_owner_update" on storage.objects;
create policy "avatars_owner_update" on storage.objects
  for update using (
    bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "avatars_owner_delete" on storage.objects;
create policy "avatars_owner_delete" on storage.objects
  for delete using (
    bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text
  );
