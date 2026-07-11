-- ============================================
-- AI MT0 Studio 会員システム - フェーズ6 追加スキーマ
-- supabase-schema.sql 〜 phase5.sql を実行済みであることが前提です。
-- Supabaseダッシュボード > SQL Editor で一度だけ実行してください
-- https://supabase.com/dashboard/project/ntefttoofbntaeaphkad/sql/new
-- ============================================

-- ============================================
-- 通知機能
-- 新規会員登録・AI相談送信・お問い合わせ送信は各テーブルへの
-- insertトリガーで自動作成。「管理者へのお知らせ」は管理画面から
-- 手動で作成する（type = 'admin_note'）。
-- ============================================
create table if not exists public.notifications (
  id         uuid primary key default gen_random_uuid(),
  type       text not null,
  title      text not null,
  body       text,
  link       text,
  is_read    boolean not null default false,
  created_at timestamptz not null default now()
);
alter table public.notifications enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'notifications_type_check'
  ) then
    alter table public.notifications
      add constraint notifications_type_check check (type in ('signup', 'ai_consult', 'inquiry', 'admin_note'));
  end if;
end $$;

drop policy if exists "notifications_select_admin" on public.notifications;
create policy "notifications_select_admin" on public.notifications
  for select using (public.is_admin(auth.uid()));

drop policy if exists "notifications_insert_admin" on public.notifications;
create policy "notifications_insert_admin" on public.notifications
  for insert with check (public.is_admin(auth.uid()));

drop policy if exists "notifications_update_admin" on public.notifications;
create policy "notifications_update_admin" on public.notifications
  for update using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));

drop policy if exists "notifications_delete_admin" on public.notifications;
create policy "notifications_delete_admin" on public.notifications
  for delete using (public.is_admin(auth.uid()));

-- Realtimeでベルアイコンのバッジを即時更新するために配信対象へ追加
alter publication supabase_realtime add table public.notifications;

-- ============================================
-- 自動通知トリガー（security definerでRLSをバイパスしてINSERTする。
-- handle_new_user() と同じパターン）
-- ============================================

-- 新規会員登録
create or replace function public.notify_new_signup()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.notifications (type, title, body, link)
  values ('signup', '新規会員登録', new.email, 'admin.html?tab=users');
  return new;
end;
$$;

drop trigger if exists on_profile_created_notify on public.profiles;
create trigger on_profile_created_notify
  after insert on public.profiles
  for each row execute function public.notify_new_signup();

-- AI相談送信
create or replace function public.notify_new_consultation()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.notifications (type, title, body, link)
  values ('ai_consult', 'AI相談を受信しました', coalesce(new.email, '') || ' ／ ' || left(new.question, 60), 'admin.html?tab=ai-consult');
  return new;
end;
$$;

drop trigger if exists on_consultation_created_notify on public.ai_consultations;
create trigger on_consultation_created_notify
  after insert on public.ai_consultations
  for each row execute function public.notify_new_consultation();

-- お問い合わせ送信
create or replace function public.notify_new_inquiry()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.notifications (type, title, body, link)
  values ('inquiry', 'お問い合わせを受信しました', new.name || ' ／ ' || left(new.message, 60), 'admin.html?tab=inquiries');
  return new;
end;
$$;

drop trigger if exists on_inquiry_created_notify on public.inquiries;
create trigger on_inquiry_created_notify
  after insert on public.inquiries
  for each row execute function public.notify_new_inquiry();
