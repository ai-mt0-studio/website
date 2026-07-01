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
});
nav.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    hamburger.classList.remove('open');
    nav.classList.remove('open');
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

// ---- CHAT BUBBLES ANIMATION ----
const chatBubbles = document.querySelectorAll('.chat-bubble');
const consultSection = document.getElementById('consult');
const consultObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      chatBubbles.forEach(b => b.classList.add('visible'));
    }
  });
}, { threshold: 0.3 });
if (consultSection) consultObserver.observe(consultSection);

// ---- PARTICLE CANVAS ----
(function () {
  const canvas = document.getElementById('particles');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let W, H, particles = [];

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
    requestAnimationFrame(draw);
  }
  draw();
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

// ---- OTHER TOOLS EXPAND/COLLAPSE ----
const otherToggle = document.getElementById('other-tools-toggle');
const otherPanel = document.getElementById('other-tools-panel');
if (otherToggle && otherPanel) {
  const otherPanelInner = otherPanel.querySelector('.other-tools-panel-inner');

  function setOtherToolsOpen(isOpen) {
    otherToggle.classList.toggle('active', isOpen);
    otherToggle.setAttribute('aria-expanded', String(isOpen));
    if (isOpen) {
      otherPanel.classList.add('open');
      otherPanel.style.maxHeight = otherPanelInner.scrollHeight + 'px';
      otherPanel.querySelectorAll('.tool-card').forEach(c => c.classList.add('visible'));
    } else {
      otherPanel.style.maxHeight = '0px';
      otherPanel.classList.remove('open');
    }
  }

  otherToggle.addEventListener('click', () => {
    setOtherToolsOpen(!otherToggle.classList.contains('active'));
  });
  otherToggle.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      otherToggle.click();
    }
  });
  window.addEventListener('resize', () => {
    if (otherToggle.classList.contains('active')) {
      otherPanel.style.maxHeight = otherPanelInner.scrollHeight + 'px';
    }
  });
}

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
