/* ============================================
   AI MT0 Studio - favorites.js
   ツール一覧カードへの「お気に入り」ハートボタン注入・同期
   ============================================ */

(function () {
  function setActive(btn, active) {
    btn.classList.toggle('active', active);
    btn.textContent = active ? '♥' : '♡';
  }

  async function toggleFavorite(btn) {
    const { data: { session } } = await sbClient.auth.getSession();
    if (!session) {
      window.location.href = 'login.html';
      return;
    }

    const slug = btn.dataset.slug;
    const isActive = btn.classList.contains('active');
    btn.disabled = true;

    if (isActive) {
      await sbClient.from('favorites').delete().eq('user_id', session.user.id).eq('tool_slug', slug);
      setActive(btn, false);
    } else {
      await sbClient.from('favorites').insert({ user_id: session.user.id, tool_slug: slug });
      setActive(btn, true);
    }
    btn.disabled = false;
  }

  async function initFavorites() {
    const cards = document.querySelectorAll('.tool-card[data-tool-slug]');
    if (!cards.length) return;

    cards.forEach(card => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'fav-btn';
      btn.setAttribute('aria-label', 'お気に入りに追加');
      btn.dataset.slug = card.dataset.toolSlug;
      btn.textContent = '♡';
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        toggleFavorite(btn);
      });
      card.appendChild(btn);
    });

    const { data: { session } } = await sbClient.auth.getSession();
    if (!session) return;

    const { data: favs } = await sbClient
      .from('favorites')
      .select('tool_slug')
      .eq('user_id', session.user.id);

    const favSet = new Set((favs || []).map(f => f.tool_slug));
    document.querySelectorAll('.fav-btn').forEach(btn => {
      if (favSet.has(btn.dataset.slug)) setActive(btn, true);
    });
  }

  document.addEventListener('DOMContentLoaded', initFavorites);
})();
