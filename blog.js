/* ============================================
   blog.js - Blog management utilities
   記事データを blog.json から読み込み、各ページに描画する
   ============================================ */

async function fetchBlogData() {
  try {
    const res = await fetch('blog.json');
    if (!res.ok) throw new Error('HTTP ' + res.status);
    return await res.json();
  } catch (e) {
    console.error('blog.json の読み込みに失敗しました:', e);
    return { articles: [] };
  }
}

function createBlogCard(article, readMoreUrl) {
  var href = readMoreUrl || ('blog-post.html?id=' + article.id);
  var el = document.createElement('article');
  el.className = 'blog-card glass-card';
  el.dataset.cat = article.category;
  el.innerHTML =
    '<div class="blog-cat-label">' + article.categoryLabel + '</div>' +
    '<h3>' + article.title + '</h3>' +
    '<p>' + article.summary + '</p>' +
    '<div class="blog-meta">' +
      '<span>' + article.date + '</span>' +
      '<a href="' + href + '" class="read-more">続きを読む →</a>' +
    '</div>';
  return el;
}

function initBlogReveal(elements) {
  var obs = new IntersectionObserver(function(entries) {
    entries.forEach(function(e) {
      if (e.isIntersecting) {
        e.target.classList.add('visible');
        obs.unobserve(e.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });
  elements.forEach(function(el) {
    el.classList.add('reveal');
    obs.observe(el);
  });
}

function initBlogFilter() {
  var catBtns = document.querySelectorAll('.cat-btn');
  catBtns.forEach(function(btn) {
    btn.addEventListener('click', function() {
      catBtns.forEach(function(b) { b.classList.remove('active'); });
      btn.classList.add('active');
      var cat = btn.dataset.cat;
      document.querySelectorAll('.blog-card').forEach(function(card) {
        card.style.display = (cat === 'all' || card.dataset.cat === cat) ? '' : 'none';
      });
    });
  });
}

// index.html 用：最新3件を表示、続きを読む → blog.html
async function initIndexBlog() {
  var grid = document.getElementById('blog-grid');
  if (!grid) return;
  var data = await fetchBlogData();
  data.articles.slice(0, 3).forEach(function(a) {
    grid.appendChild(createBlogCard(a, 'blog.html'));
  });
  initBlogReveal(grid.querySelectorAll('.blog-card'));
  initBlogFilter();
}

// blog.html 用：全件表示、続きを読む → blog-post.html
async function initBlogList() {
  var grid = document.getElementById('blog-grid');
  if (!grid) return;
  var data = await fetchBlogData();

  var countEl = document.getElementById('article-count');
  if (countEl) countEl.textContent = data.articles.length;

  data.articles.forEach(function(a) {
    grid.appendChild(createBlogCard(a));
  });
  initBlogReveal(grid.querySelectorAll('.blog-card'));
  initBlogFilter();
}

// blog-post.html 用：URLパラメータ id に対応する記事を表示
async function initBlogPost() {
  var params = new URLSearchParams(location.search);
  var id = params.get('id');
  var data = await fetchBlogData();
  var article = id ? data.articles.find(function(a) { return a.id === id; }) : null;

  var container = document.getElementById('post-container');
  if (!article) {
    if (container) {
      container.innerHTML = '<p style="text-align:center;color:var(--c-text-sub);padding:80px 0;">記事が見つかりませんでした。<br><a href="blog.html" style="color:var(--c-blue);">← ブログ一覧へ戻る</a></p>';
    }
    return;
  }

  document.title = article.title + ' | AI Solutions';

  var titleEl  = document.getElementById('post-title');
  var catEl    = document.getElementById('post-category');
  var dateEl   = document.getElementById('post-date');
  var bodyEl   = document.getElementById('post-body');

  if (titleEl)  titleEl.textContent  = article.title;
  if (catEl)  { catEl.textContent    = article.categoryLabel; catEl.dataset.cat = article.category; }
  if (dateEl)   dateEl.textContent   = article.date;
  if (bodyEl)   bodyEl.innerHTML     = article.content;
}
