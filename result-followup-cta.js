/* ============================================
   AI MT0 Studio - result-followup-cta.js
   無料ツールの結果表示エリア末尾に、
   保存を促す会員登録バナー・オーダーメイド開発への導線を追加する共通コンポーネント。
   結果コンテナの表示/非表示にそのまま追従するよう、
   対象要素の最後の子として挿入する(各ツールの計算ロジックには触れない)。

   使い方: <script src="result-followup-cta.js" data-target="resultSection" data-tool-slug="advisor-tool"></script>
   複数対象がある場合: data-target="idA,idB"
   data-tool-slug を指定すると、バナーから登録した直後にそのツールが
   自動でお気に入り（favoritesテーブル）に追加され、マイページで
   「保存しました」の案内が表示される（tools-catalog.js の slug と一致させること）。
   data-tool-slug を省略した場合、登録導線は表示されるが自動お気に入り追加は行われない。

   data-skip="save-banner,save-note,related" のようにカンマ区切りで指定すると、
   ツール自身の画面に同等の表示（会員登録CTA・保存に関する注意書き・関連ツール推薦）が
   既にある場合に、この共通コンポーネント側の重複ブロックだけを出さないようにできる。
   （rf-cta＝オーダーメイド開発への導線は、どのツールページにも独自表示がないため常に表示）
   ============================================ */
(function () {
  var scriptEl = document.currentScript;
  var PENDING_KEY = 'rf_pending_favorite';

  function buildSaveBanner(toolSlug) {
    var wrap = document.createElement('div');
    wrap.className = 'rf-save-banner';
    wrap.innerHTML =
      '<div class="rf-save-head">' +
        '<span class="rf-save-icon">💾</span>' +
        '<h3 class="rf-save-title">この結果を保存しますか？</h3>' +
      '</div>' +
      '<p class="rf-save-lead">無料登録すると</p>' +
      '<ul class="rf-save-list">' +
        '<li>このツールをマイページの「お気に入り」に保存</li>' +
        '<li>お気に入りツールはワンクリックでいつでも呼び出せる</li>' +
        '<li>次回は同じ入力の手間なく、すぐ使える</li>' +
        '<li>気になった他のツールもお気に入り登録できる</li>' +
      '</ul>' +
      '<div class="rf-save-actions">' +
        '<a href="register.html" class="rf-save-btn-primary">無料登録して保存する（メールとパスワードだけ・30秒）→</a>' +
        '<button type="button" class="rf-save-skip">今回はスキップ</button>' +
      '</div>';

    var primaryBtn = wrap.querySelector('.rf-save-btn-primary');
    if (toolSlug) {
      primaryBtn.addEventListener('click', function () {
        try {
          localStorage.setItem(PENDING_KEY, JSON.stringify({ slug: toolSlug, ts: Date.now() }));
        } catch (e) { /* localStorageが使えない環境では何もしない */ }
      });
    }

    wrap.querySelector('.rf-save-skip').addEventListener('click', function () {
      wrap.style.display = 'none';
    });

    return wrap;
  }

  function buildSaveNote() {
    var note = document.createElement('p');
    note.className = 'rf-save-note';
    note.textContent = '※ 未登録の場合、入力内容や結果は保存されません';
    return note;
  }

  function buildCTA() {
    var wrap = document.createElement('div');
    wrap.className = 'rf-cta';
    wrap.innerHTML =
      '<div class="rf-cta-item">' +
        '<p class="rf-cta-text">🛠 このツールをベースに、自社の業務に合わせたカスタマイズも可能です。お気軽にご相談ください</p>' +
        '<a href="contact.html" class="rf-cta-btn rf-cta-btn-outline">オーダーメイド開発を相談する →</a>' +
      '</div>';
    return wrap;
  }

  function buildRelatedTools(slugs) {
    var catalog = window.TOOL_CATALOG || {};
    var items = slugs
      .map(function (slug) { return catalog[slug] ? { slug: slug, info: catalog[slug] } : null; })
      .filter(Boolean);
    if (!items.length) return null;

    var wrap = document.createElement('div');
    wrap.className = 'rf-related';
    var linksHtml = items.map(function (item) {
      return '<a href="' + item.info.url + '" class="rf-related-link">' + item.info.icon + ' ' + item.info.name + ' →</a>';
    }).join('');
    wrap.innerHTML =
      '<p class="rf-related-label">関連する他のツール</p>' +
      '<div class="rf-related-links">' + linksHtml + '</div>';
    return wrap;
  }

  function injectStyle() {
    if (document.getElementById('rf-cta-style')) return;
    var style = document.createElement('style');
    style.id = 'rf-cta-style';
    style.textContent =
      '.rf-save-banner{margin-top:1.5rem;padding:1.25rem 1.4rem;border-radius:16px;' +
      'background:linear-gradient(135deg,rgba(79,142,247,0.10),rgba(155,89,245,0.08));' +
      'border:1px solid rgba(155,89,245,0.35);}' +
      '.rf-save-head{display:flex;align-items:center;gap:0.6rem;margin-bottom:0.5rem;}' +
      '.rf-save-icon{font-size:1.2rem;line-height:1;}' +
      '.rf-save-title{margin:0;font-size:1.02rem;font-weight:800;color:#fff;}' +
      '.rf-save-lead{margin:0 0 0.4rem;font-size:0.82rem;color:rgba(255,255,255,0.65);}' +
      '.rf-save-list{margin:0 0 1rem;padding:0;list-style:none;display:flex;flex-direction:column;gap:0.4rem;}' +
      '.rf-save-list li{position:relative;padding-left:1.3rem;font-size:0.85rem;line-height:1.6;color:rgba(255,255,255,0.85);}' +
      '.rf-save-list li::before{content:"✓";position:absolute;left:0;top:0;color:#67e8f9;font-weight:700;}' +
      '.rf-save-actions{display:flex;align-items:center;gap:1rem;flex-wrap:wrap;}' +
      '.rf-save-btn-primary{display:inline-block;padding:0.8rem 1.3rem;border-radius:12px;' +
      'background:linear-gradient(135deg,#4f8ef7,#9b59f5);color:#fff;font-size:0.85rem;font-weight:700;' +
      'text-decoration:none;white-space:normal;text-align:center;box-shadow:0 4px 16px rgba(124,92,246,0.35);' +
      'transition:transform .15s,box-shadow .15s;}' +
      '.rf-save-btn-primary:hover{transform:translateY(-1px);box-shadow:0 6px 20px rgba(124,92,246,0.45);}' +
      '.rf-save-skip{background:none;border:none;padding:0.4rem 0;font-size:0.8rem;color:rgba(255,255,255,0.55);' +
      'text-decoration:underline;cursor:pointer;font-family:inherit;}' +
      '.rf-save-skip:hover{color:rgba(255,255,255,0.8);}' +
      '.rf-save-note{margin:0.6rem 0 0;font-size:0.72rem;color:rgba(255,255,255,0.4);}' +
      '.rf-cta{margin-top:1rem;padding:1.1rem 1.25rem;border-radius:14px;' +
      'background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.12);' +
      'display:flex;flex-direction:column;gap:0.9rem;}' +
      '.rf-cta-item{display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:0.75rem;}' +
      '.rf-cta-text{margin:0;font-size:0.85rem;line-height:1.6;color:rgba(255,255,255,0.75);flex:1;min-width:220px;}' +
      '.rf-cta-btn{flex-shrink:0;font-size:0.82rem;font-weight:600;color:#fff;background:rgba(255,255,255,0.12);' +
      'padding:0.55rem 1.1rem;border-radius:50px;text-decoration:none;white-space:nowrap;' +
      'transition:background .2s;border:1px solid rgba(255,255,255,0.2);}' +
      '.rf-cta-btn:hover{background:rgba(255,255,255,0.22);}' +
      '.rf-cta-btn-outline{background:transparent;}' +
      '.rf-cta-btn-outline:hover{background:rgba(255,255,255,0.08);}' +
      '.rf-related{margin-top:1rem;padding:1rem 1.25rem;border-radius:14px;' +
      'background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.1);}' +
      '.rf-related-label{margin:0 0 0.6rem;font-size:0.78rem;font-weight:700;color:rgba(255,255,255,0.5);}' +
      '.rf-related-links{display:flex;flex-wrap:wrap;gap:0.6rem;}' +
      '.rf-related-link{font-size:0.82rem;font-weight:600;color:#fff;background:rgba(255,255,255,0.08);' +
      'padding:0.5rem 1rem;border-radius:50px;text-decoration:none;white-space:nowrap;' +
      'border:1px solid rgba(255,255,255,0.16);transition:background .2s;}' +
      '.rf-related-link:hover{background:rgba(255,255,255,0.18);}' +
      '@media print{.rf-save-banner,.rf-save-note,.rf-cta,.rf-related{display:none !important;}}' +
      '@media (max-width:480px){' +
      '.rf-save-actions{flex-direction:column;align-items:stretch;}' +
      '.rf-save-btn-primary{text-align:center;}' +
      '.rf-save-skip{text-align:center;}' +
      '.rf-cta-item{flex-direction:column;align-items:stretch;}.rf-cta-btn{text-align:center;}' +
      '}';
    document.head.appendChild(style);
  }

  function init() {
    var targetsAttr = (scriptEl && scriptEl.getAttribute('data-target')) || 'resultSection';
    var targets = targetsAttr.split(',').map(function (s) { return s.trim(); }).filter(Boolean);
    var toolSlug = (scriptEl && scriptEl.getAttribute('data-tool-slug')) || '';
    var relatedAttr = (scriptEl && scriptEl.getAttribute('data-related-tools')) || '';
    var relatedSlugs = relatedAttr.split(',').map(function (s) { return s.trim(); }).filter(Boolean);
    var skipAttr = (scriptEl && scriptEl.getAttribute('data-skip')) || '';
    var skip = {};
    skipAttr.split(',').forEach(function (s) { s = s.trim(); if (s) skip[s] = true; });
    injectStyle();
    targets.forEach(function (id) {
      var el = document.getElementById(id);
      if (!el || el.querySelector('.rf-save-banner') || el.querySelector('.rf-cta')) return;
      if (!skip['save-banner']) el.appendChild(buildSaveBanner(toolSlug));
      if (!skip['save-note']) el.appendChild(buildSaveNote());
      el.appendChild(buildCTA());
      if (relatedSlugs.length && !skip['related']) {
        var relatedEl = buildRelatedTools(relatedSlugs);
        if (relatedEl) el.appendChild(relatedEl);
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
