/* ============================================
   AI MT0 Studio - share.js
   ページ末尾の X / Threads シェアボタン共通処理
   data-share="x" / data-share="threads" を持つ要素に自動で紐づく
   ============================================ */

(function () {
  function pageShareTitle() {
    return document.title.replace(/\s*[|｜]\s*AI MT0 Studio\s*$/, '');
  }

  function shareX() {
    const url = 'https://twitter.com/intent/tweet?text=' + encodeURIComponent(pageShareTitle()) + '&url=' + encodeURIComponent(location.href);
    window.open(url, '_blank', 'noopener');
  }

  function shareThreads() {
    const text = pageShareTitle() + '\n' + location.href;
    const url = 'https://www.threads.net/intent/post?text=' + encodeURIComponent(text);
    window.open(url, '_blank', 'noopener');
  }

  function initShareButtons() {
    document.querySelectorAll('[data-share="x"]').forEach(function (btn) {
      btn.addEventListener('click', shareX);
    });
    document.querySelectorAll('[data-share="threads"]').forEach(function (btn) {
      btn.addEventListener('click', shareThreads);
    });
  }

  document.addEventListener('DOMContentLoaded', initShareButtons);
})();
