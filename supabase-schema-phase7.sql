-- ============================================
-- AI MT0 Studio 会員システム - フェーズ7 追加スキーマ
-- supabase-schema.sql 〜 phase6.sql を実行済みであることが前提です。
-- Supabaseダッシュボード > SQL Editor で一度だけ実行してください
-- https://supabase.com/dashboard/project/ntefttoofbntaeaphkad/sql/new
-- ============================================

-- ============================================
-- ブログ管理
-- 既存の blog.json（静的ファイル）はアーカイブとしてそのまま残し、
-- 新規記事はこのテーブルで管理する。blog.js が両方をマージして表示する。
-- ============================================
create table if not exists public.blog_posts (
  id             uuid primary key default gen_random_uuid(),
  slug           text unique not null,
  title          text not null,
  category       text not null default 'ai',
  category_label text not null default 'AI',
  summary        text default '',
  content        text not null default '',
  status         text not null default 'draft',
  published_at   timestamptz,
  created_by     uuid references public.profiles(id),
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);
alter table public.blog_posts enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'blog_posts_status_check'
  ) then
    alter table public.blog_posts
      add constraint blog_posts_status_check check (status in ('draft', 'published'));
  end if;
end $$;

drop policy if exists "blog_posts_select_published" on public.blog_posts;
create policy "blog_posts_select_published" on public.blog_posts
  for select using (status = 'published' or public.is_admin(auth.uid()));

drop policy if exists "blog_posts_admin_write" on public.blog_posts;
create policy "blog_posts_admin_write" on public.blog_posts
  for all using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));

-- ブログ公開時の通知（type = 'admin_note' と同じ手動系統として扱わず、
-- 既存のnotifications型チェックへ 'blog_published' を追加した上でトリガーを張る）
do $$
begin
  if exists (
    select 1 from pg_constraint where conname = 'notifications_type_check'
  ) then
    alter table public.notifications drop constraint notifications_type_check;
  end if;
  alter table public.notifications
    add constraint notifications_type_check check (type in ('signup', 'ai_consult', 'inquiry', 'admin_note', 'blog_published'));
end $$;

create or replace function public.notify_blog_published()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.status = 'published' and (old.status is distinct from 'published') then
    insert into public.notifications (type, title, body, link)
    values ('blog_published', 'ブログ記事を公開しました', new.title, 'admin.html?tab=blog');
  end if;
  return new;
end;
$$;

drop trigger if exists on_blog_post_published_notify on public.blog_posts;
create trigger on_blog_post_published_notify
  after update on public.blog_posts
  for each row execute function public.notify_blog_published();

-- 新規作成と同時に公開した場合もカバーする
create or replace function public.notify_blog_published_insert()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.status = 'published' then
    insert into public.notifications (type, title, body, link)
    values ('blog_published', 'ブログ記事を公開しました', new.title, 'admin.html?tab=blog');
  end if;
  return new;
end;
$$;

drop trigger if exists on_blog_post_inserted_notify on public.blog_posts;
create trigger on_blog_post_inserted_notify
  after insert on public.blog_posts
  for each row execute function public.notify_blog_published_insert();
