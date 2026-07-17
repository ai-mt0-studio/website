/* ============================================
   blog.js - Blog management utilities
   記事データを blog.json から読み込み、各ページに描画する
   ============================================ */

async function fetchStaticBlogData() {
  try {
    const res = await fetch('blog.json');
    if (!res.ok) throw new Error('HTTP ' + res.status);
    return await res.json();
  } catch (e) {
    console.error('blog.json の読み込みに失敗しました:', e);
    return { articles: [] };
  }
}

// 管理画面（admin.html ブログ管理）で作成された記事を取得
async function fetchSupabaseBlogPosts() {
  if (typeof sbClient === 'undefined') return [];
  try {
    const { data, error } = await sbClient
      .from('blog_posts')
      .select('*')
      .eq('status', 'published')
      .order('published_at', { ascending: false });
    if (error) throw error;
    return (data || []).map(function (p) {
      var d = new Date(p.published_at || p.created_at);
      return {
        id: p.slug,
        title: p.title,
        category: p.category,
        categoryLabel: p.category_label,
        date: d.getFullYear() + '.' + String(d.getMonth() + 1).padStart(2, '0') + '.' + String(d.getDate()).padStart(2, '0'),
        summary: p.summary,
        content: p.content,
      };
    });
  } catch (e) {
    console.error('blog_posts の読み込みに失敗しました:', e);
    return [];
  }
}

// blog.json（既存のアーカイブ記事）と Supabase blog_posts（管理画面で作成した記事）をマージして返す
async function fetchBlogData() {
  const [staticData, supabaseArticles] = await Promise.all([
    fetchStaticBlogData(),
    fetchSupabaseBlogPosts(),
  ]);
  const articles = staticData.articles.concat(supabaseArticles);
  articles.sort(function (a, b) {
    return new Date(String(b.date).replace(/\./g, '-')) - new Date(String(a.date).replace(/\./g, '-'));
  });
  return { articles: articles };
}

function createBlogCard(article, readMoreUrl) {
  var href = readMoreUrl || article.url || ('blog-post.html?id=' + article.id);
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

// 既にHTMLに静的表示済みのカードのhrefを集める（SEO対策：SSGなしでもクロール可能な
// 静的リンクをHTMLに埋め込んであるため、JSは重複描画せず「追加分」だけを描画する）
function existingCardHrefs(grid) {
  return Array.prototype.map.call(grid.querySelectorAll('.read-more'), function (a) {
    return a.getAttribute('href');
  });
}

// index.html 用：最新3件を表示（静的カードに無い新着のみ追記）
async function initIndexBlog() {
  var grid = document.getElementById('blog-grid');
  if (!grid) return;
  var data = await fetchBlogData();
  var existingHrefs = existingCardHrefs(grid);
  data.articles.slice(0, 3).forEach(function(a) {
    var href = a.url || ('blog-post.html?id=' + a.id);
    if (existingHrefs.indexOf(href) !== -1) return;
    grid.appendChild(createBlogCard(a));
  });
  initBlogReveal(grid.querySelectorAll('.blog-card'));
  initBlogFilter();
}

// blog.html 用：全件表示（静的カードに無い新着のみ追記、記事数を更新）
async function initBlogList() {
  var grid = document.getElementById('blog-grid');
  if (!grid) return;
  var data = await fetchBlogData();

  var existingHrefs = existingCardHrefs(grid);
  var added = 0;
  data.articles.forEach(function(a) {
    var href = a.url || ('blog-post.html?id=' + a.id);
    if (existingHrefs.indexOf(href) !== -1) return;
    grid.appendChild(createBlogCard(a));
    added++;
  });

  var countEl = document.getElementById('article-count');
  if (countEl) countEl.textContent = existingHrefs.length + added;

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

  var pageTitle = article.title + ' | AI MT0 Studio';
  document.title = pageTitle;

  var descEl = document.querySelector('meta[name="description"]');
  if (descEl && article.summary) descEl.setAttribute('content', article.summary);

  var titleEl  = document.getElementById('post-title');
  var catEl    = document.getElementById('post-category');
  var dateEl   = document.getElementById('post-date');
  var bodyEl   = document.getElementById('post-body');

  if (titleEl)  titleEl.textContent  = article.title;
  if (catEl)  { catEl.textContent    = article.categoryLabel; catEl.dataset.cat = article.category; }
  if (dateEl)   dateEl.textContent   = article.date;
  if (bodyEl)   bodyEl.innerHTML     = article.content;

  // canonical・OGP（管理画面から追加された記事など、静的HTMLが存在しない記事向けのフォールバック）
  var canonicalUrl = location.origin + location.pathname + '?id=' + encodeURIComponent(article.id);
  var canonicalEl = document.querySelector('link[rel="canonical"]');
  if (!canonicalEl) {
    canonicalEl = document.createElement('link');
    canonicalEl.setAttribute('rel', 'canonical');
    document.head.appendChild(canonicalEl);
  }
  canonicalEl.setAttribute('href', canonicalUrl);

  [
    ['property', 'og:type', 'article'],
    ['property', 'og:site_name', 'AI MT0 Studio'],
    ['property', 'og:title', pageTitle],
    ['property', 'og:description', article.summary || ''],
    ['property', 'og:url', canonicalUrl],
    ['property', 'og:image', location.origin + '/images/og-default.png'],
    ['property', 'og:image:width', '1200'],
    ['property', 'og:image:height', '630'],
    ['name', 'twitter:card', 'summary_large_image'],
    ['name', 'twitter:title', pageTitle],
    ['name', 'twitter:description', article.summary || ''],
    ['name', 'twitter:image', location.origin + '/images/og-default.png'],
  ].forEach(function (tag) {
    var attr = tag[0], key = tag[1], value = tag[2];
    var el = document.querySelector('meta[' + attr + '="' + key + '"]');
    if (!el) {
      el = document.createElement('meta');
      el.setAttribute(attr, key);
      document.head.appendChild(el);
    }
    el.setAttribute('content', value);
  });

  var blogPosting = document.createElement('script');
  blogPosting.type = 'application/ld+json';
  blogPosting.textContent = JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    'mainEntityOfPage': { '@type': 'WebPage', '@id': canonicalUrl },
    'headline': article.title,
    'description': article.summary,
    'datePublished': String(article.date).replace(/\./g, '-'),
    'author': { '@type': 'Organization', 'name': 'AI MT0 Studio', 'url': location.origin + '/' },
    'publisher': { '@type': 'Organization', 'name': 'AI MT0 Studio', 'url': location.origin + '/' },
    'url': canonicalUrl
  });
  document.head.appendChild(blogPosting);

  var breadcrumb = document.createElement('script');
  breadcrumb.type = 'application/ld+json';
  breadcrumb.textContent = JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    'itemListElement': [
      { '@type': 'ListItem', 'position': 1, 'name': 'ホーム', 'item': location.origin + '/' },
      { '@type': 'ListItem', 'position': 2, 'name': 'ブログ', 'item': location.origin + '/blog.html' },
      { '@type': 'ListItem', 'position': 3, 'name': article.title, 'item': canonicalUrl }
    ]
  });
  document.head.appendChild(breadcrumb);
}
