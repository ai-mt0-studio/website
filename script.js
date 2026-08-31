/* ============================================
   AI Solutions - script.js
   ============================================ */

// ---- HEADER SCROLL ----
const header = document.getElementById('header');
window.addEventListener('scroll', () => {
  header.classList.toggle('scrolled', window.scrollY > 40);
});

// ---- HAMBURGER MENU ----
const hamburger = document.getElementById('hamburger');
const nav = document.getElementById('nav');
hamburger.addEventListener('click', () => {
  hamburger.classList.toggle('open');
  nav.classList.toggle('open');
  header.classList.toggle('menu-open');
});
nav.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    hamburger.classList.remove('open');
    nav.classList.remove('open');
    header.classList.remove('menu-open');
  });
});

// ---- SCROLL REVEAL ----
const revealEls = document.querySelectorAll(
  '.service-card, .tool-card, .blog-card, .roadmap-item, .glass-card, .section-header'
);
revealEls.forEach(el => el.classList.add('reveal'));

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

revealEls.forEach(el => observer.observe(el));

// ---- PARTICLE CANVAS ----
(function () {
  const canvas = document.getElementById('particles');
  if (!canvas) return;

  // INP対策：モーション低減設定のユーザーには装飾アニメーションを描画しない
  const reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduceMotion) return;

  const ctx = canvas.getContext('2d');
  let W, H, particles = [], running = false, rafId = null;

  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  function randomBetween(a, b) { return a + Math.random() * (b - a); }

  const COLORS = ['rgba(79,142,247,', 'rgba(155,89,245,', 'rgba(0,229,255,'];

  function createParticle() {
    return {
      x: Math.random() * W,
      y: Math.random() * H,
      r: randomBetween(0.5, 2),
      dx: randomBetween(-0.3, 0.3),
      dy: randomBetween(-0.4, -0.1),
      alpha: randomBetween(0.2, 0.8),
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
    };
  }

  for (let i = 0; i < 80; i++) particles.push(createParticle());

  function draw() {
    if (!running) return;
    ctx.clearRect(0, 0, W, H);
    particles.forEach(p => {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = p.color + p.alpha + ')';
      ctx.fill();
      p.x += p.dx;
      p.y += p.dy;
      p.alpha -= 0.001;
      if (p.y < -10 || p.alpha <= 0) {
        Object.assign(p, createParticle(), { y: H + 10 });
      }
    });
    rafId = requestAnimationFrame(draw);
  }

  // CWV対策：ヒーローが画面外のときはメインスレッドを使う描画ループを止める
  const heroObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting && !running) {
        running = true;
        draw();
      } else if (!entry.isIntersecting && running) {
        running = false;
        if (rafId) cancelAnimationFrame(rafId);
      }
    });
  }, { threshold: 0 });
  heroObserver.observe(canvas);
})();

// ---- CONTACT FORM (UI only) ----
const form = document.getElementById('contact-form');
if (form) {
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const btn = form.querySelector('button[type=submit]');
    btn.textContent = '送信しました ✓';
    btn.style.background = 'linear-gradient(135deg, #22c55e, #16a34a)';
    btn.disabled = true;
    setTimeout(() => {
      btn.textContent = '送信する';
      btn.style.background = '';
      btn.disabled = false;
      form.reset();
    }, 3000);
  });
}

// ---- GA4: 有料ツール購入クリック計測 ----
// note.com上で決済が完結するため、このサイトからは購入完了を直接検知できない。
// 「詳細・購入」リンクのクリックをpurchaseの近似指標として計測する。
const NOTE_TOOL_CATALOG = {
  'nab7079d5e690': 'AI収益管理ツール',
  'nd10e39a5b1a9': 'AI議事録ツール',
  'n05f9e8b2ead1': '業務報告書自動作成ツール',
  'n974e7530893c': '経理・帳簿ツール',
  'n3c74c5eb1bb2': 'SNS投稿自動生成ツール',
  'nd306683712ee': '資料・文章作成ツール',
  'nbf795bc90581': 'AI見積書・請求書作成ツール',
  'n56b5beb5470f': 'AIビジネスグラフ作成ツール',
};
const NOTE_TOOL_PRICE_JPY = 980;

document.addEventListener('click', (e) => {
  const link = e.target.closest('a[href*="note.com/safe_acacia2730/n/"]');
  if (!link || typeof gtag !== 'function') return;

  const match = link.href.match(/\/n\/(n[0-9a-f]+)/);
  const noteId = match ? match[1] : 'unknown';
  const itemName = NOTE_TOOL_CATALOG[noteId] || link.textContent.trim();

  gtag('event', 'purchase', {
    transaction_id: `${noteId}_${Date.now()}`,
    currency: 'JPY',
    value: NOTE_TOOL_PRICE_JPY,
    items: [{ item_id: noteId, item_name: itemName }],
  });
});

// ---- SMOOTH ACTIVE NAV ----
const sections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('.nav-link');
window.addEventListener('scroll', () => {
  let current = '';
  sections.forEach(s => {
    if (window.scrollY >= s.offsetTop - 120) current = s.id;
  });
  navLinks.forEach(link => {
    link.classList.toggle('active-nav', link.getAttribute('href') === '#' + current);
  });
});
