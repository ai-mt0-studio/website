/* ============================================
   AI MT0 Studio - supabase-client.js
   会員システム共通クライアント／ヘルパー関数
   ============================================ */

const SUPABASE_URL = 'https://ntefttoofbntaeaphkad.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_t5SkEWwmbXKHOVX6pYEpUw_9ogyU5Rw';

const sbClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// 現在のセッションを取得。未ログインなら login.html へリダイレクト。
async function requireLogin() {
  const { data: { session } } = await sbClient.auth.getSession();
  if (!session) {
    window.location.href = 'login.html';
    return null;
  }
  return session;
}

// セッション + profiles テーブルの行をまとめて取得
async function getCurrentProfile() {
  const { data: { session } } = await sbClient.auth.getSession();
  if (!session) return null;
  const { data: profile, error } = await sbClient
    .from('profiles')
    .select('*')
    .eq('id', session.user.id)
    .single();
  if (error) {
    console.error('profile fetch error', error);
    return { session, profile: null };
  }
  return { session, profile };
}

async function signOutAndRedirect() {
  await sbClient.auth.signOut();
  window.location.href = 'login.html';
}

// index.html などのヘッダーで「ログイン / マイページ」リンクを出し分ける
async function syncAuthNav() {
  const link = document.getElementById('nav-auth-link');
  if (!link) return;
  const { data: { session } } = await sbClient.auth.getSession();
  if (session) {
    link.textContent = 'マイページ';
    link.href = 'mypage.html';
  } else {
    link.textContent = 'ログイン';
    link.href = 'login.html';
  }
}
