/* ============================================
   AI MT0 Studio - result-followup-cta.js
   無料ツールの結果表示エリア末尾に、
   会員登録・オーダーメイド開発への導線を追加する共通コンポーネント。
   結果コンテナの表示/非表示にそのまま追従するよう、
   対象要素の最後の子として挿入する(各ツールの計算ロジックには触れない)。

   使い方: <script src="result-followup-cta.js" data-target="resultSection"></script>
   複数対象がある場合: data-target="idA,idB"
   ============================================ */
(function () {
  var scriptEl = document.currentScript;

  function buildCTA() {
    var wrap = document.createElement('div');
    wrap.className = 'rf-cta';
    wrap.innerHTML =
      '<div class="rf-cta-item">' +
        '<p class="rf-cta-text">💾 無料会員登録すると、この結果をマイページに保存できます</p>' +
        '<a href="register.html" class="rf-cta-btn">無料会員登録する →</a>' +
      '</div>' +
      '<div class="rf-cta-item">' +
        '<p class="rf-cta-text">🛠 このツールをベースに、自社の業務に合わせたカスタマイズも可能です。お気軽にご相談ください</p>' +
        '<a href="contact.html" class="rf-cta-btn rf-cta-btn-outline">オーダーメイド開発を相談する →</a>' +
      '</div>';
    return wrap;
  }

  function injectStyle() {
    if (document.getElementById('rf-cta-style')) return;
    var style = document.createElement('style');
    style.id = 'rf-cta-style';
    style.textContent =
      '.rf-cta{margin-top:1.5rem;padding:1.1rem 1.25rem;border-radius:14px;' +
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
      '@media print{.rf-cta{display:none !important;}}' +
      '@media (max-width:480px){.rf-cta-item{flex-direction:column;align-items:stretch;}.rf-cta-btn{text-align:center;}}';
    document.head.appendChild(style);
  }

  function init() {
    var targetsAttr = (scriptEl && scriptEl.getAttribute('data-target')) || 'resultSection';
    var targets = targetsAttr.split(',').map(function (s) { return s.trim(); }).filter(Boolean);
    injectStyle();
    targets.forEach(function (id) {
      var el = document.getElementById(id);
      if (!el || el.querySelector('.rf-cta')) return;
      el.appendChild(buildCTA());
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
