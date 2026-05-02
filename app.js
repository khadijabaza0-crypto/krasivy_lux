// ── CONFIG ─────────────────────────────────────────────────────────────────
// Replace with your Google Apps Script Web App URL after deployment
const SCRIPT_URL = 'ehttps://script.google.com/macros/s/AKfycbwsUeo6LSyaZEQVBkaA4Uzi6yixPhMAf4yDbTXUJNeNnJwdcjnegIoAYsZcbJYezmb_/exec';

// Social media links - update these
const INSTAGRAM_URL = 'https://www.instagram.com/krasivy_lux?igsh=b2k0Z3V6OWl1OWZn';
const TIKTOK_URL    = 'https://www.tiktok.com/@krasivy_lux?_r=1&_t=ZS-960XHQtrWPo';

// Admin secret (used only as a hint; actual gate is in admin.js)
const ADMIN_HINT_KEY = 'kl_admin_auth';

// ── UTILITY ─────────────────────────────────────────────────────────────────
function $(sel, ctx = document) { return ctx.querySelector(sel); }
function $$(sel, ctx = document) { return [...ctx.querySelectorAll(sel)]; }

function showToast(msg, duration = 3000) {
  let t = document.getElementById('toast');
  if (!t) { t = document.createElement('div'); t.id = 'toast'; t.className = 'toast'; document.body.appendChild(t); }
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), duration);
}

// ── NAV / MENU ───────────────────────────────────────────────────────────────
function initNav() {
  const hamburger = document.getElementById('hamburger');
  const sideMenu  = document.getElementById('sideMenu');
  const overlay   = document.getElementById('menuOverlay');
  if (!hamburger) return;

  function closeMenu() {
    hamburger.classList.remove('open');
    sideMenu.classList.remove('open');
    overlay.classList.remove('open');
    document.body.style.overflow = '';
  }
  function openMenu() {
    hamburger.classList.add('open');
    sideMenu.classList.add('open');
    overlay.classList.add('open');
    document.body.style.overflow = 'hidden';
  }
  hamburger.addEventListener('click', () => hamburger.classList.contains('open') ? closeMenu() : openMenu());
  overlay.addEventListener('click', closeMenu);
  $$('.side-menu nav a').forEach(a => a.addEventListener('click', closeMenu));

  // Admin link visibility: show only if previously authenticated
  const adminLink = document.getElementById('adminNavLink');
  if (adminLink && localStorage.getItem(ADMIN_HINT_KEY) === '1') {
    adminLink.style.display = 'flex';
  }

  // Social links
  const igLink  = document.getElementById('footerInstagram');
  const ttLink  = document.getElementById('footerTiktok');
  if (igLink) igLink.href = INSTAGRAM_URL;
  if (ttLink) ttLink.href = TIKTOK_URL;
}

// ── GOOGLE SHEETS DATA ───────────────────────────────────────────────────────
async function fetchWatches() {
  try {
    const res = await fetch(`${SCRIPT_URL}?action=getWatches`);
    const data = await res.json();
    return data.watches || [];
  } catch (e) {
    console.error('Failed to fetch watches:', e);
    return [];
  }
}

/**
 * POST vers Google Apps Script. Utilise text/plain + JSON pour éviter le preflight CORS
 * (application/json + no-cors faisait souvent perdre le corps côté mobile / navigateur).
 */
async function postToScript(payload) {
  try {
    const res = await fetch(SCRIPT_URL, {
      method: 'POST',
      redirect: 'follow',
      mode: 'cors',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify(payload),
    });
    const text = await res.text();
    let data;
    try {
      data = JSON.parse(text);
    } catch {
      return { error: 'Réponse invalide du serveur', raw: text.slice(0, 120) };
    }
    return data;
  } catch (e) {
    console.error('postToScript', e);
    return { error: e.message || 'Erreur réseau' };
  }
}

function watchesMatchCategory(watch, cat) {
  const t = (watch.type || '').toLowerCase();
  if (cat === 'cuir') {
    return t.includes('cuir') || t.includes('جلد') || t.includes('leather');
  }
  if (cat === 'acier') {
    return t.includes('acier') || t.includes('ستيل') || t.includes('steel') || t.includes('inox');
  }
  return true;
}

// ── RENDER HOME PAGE ─────────────────────────────────────────────────────────
async function renderHome(allWatches, category = 'all') {
  const grid = document.getElementById('watchesGrid');
  if (!grid) return;

  const filtered = (allWatches || []).filter(w => watchesMatchCategory(w, category));

  const titleEl = document.getElementById('shopTitle');
  if (titleEl) {
    if (category === 'cuir') titleEl.textContent = 'جلد';
    else if (category === 'acier') titleEl.textContent = 'فولاذ';
    else titleEl.textContent = 'ساعات';
  }

  if (!allWatches || allWatches.length === 0) {
    grid.innerHTML = `<div class="loading-grid"><p style="color:var(--gray);font-size:13px;text-align:center">المجموعة قريباً</p></div>`;
    return;
  }

  if (filtered.length === 0) {
    grid.innerHTML = `
      <div class="loading-grid loading-grid--empty" style="grid-column:1/-1">
        <p class="home-empty-msg">${category === 'cuir'
          ? 'لا توجد ساعات جلد حالياً. اختر «الكل» لعرض المجموعة كاملة.'
          : 'لا توجد ساعات فولاذ حالياً. اختر «الكل» لعرض المجموعة كاملة.'}</p>
      </div>`;
    return;
  }

  grid.innerHTML = filtered.map(w => `
    <article class="watch-card" data-watch-id="${encodeURIComponent(w.id)}">
      <div class="card-img">
        <img src="${w.mainImage}" alt="" loading="lazy" onerror="this.src='https://via.placeholder.com/400x480/f5ede0/b8956a?text=Krasivy'">
      </div>
      <div class="card-info">
        <div class="card-type">${w.type || 'فاخرة'}</div>
        <div class="card-name">${w.name}</div>
        <div class="card-price">${w.price} <span class="card-currency">دج</span></div>
        <button type="button" class="btn-order">اطلب الآن</button>
      </div>
    </article>
  `).join('');
}

function goToWatch(id) {
  window.location.href = `watch.html?id=${id}`;
}

// صور ثابتة لم يعد يستبدلها كتالوج (روابط CDN ثابتة) — عمود Cuir لا يعتمد على صورة المتجر لتجنب الانقطاع
const HERO_DEFAULT_CUIR  = 'https://images.unsplash.com/photo-1524592094714-0f0654e20314?fm=jpg&fit=crop&w=1600&q=82&auto=format';
const HERO_DEFAULT_ACIER = 'https://images.unsplash.com/photo-1547996160-81dfa63595aa?fm=jpg&fit=crop&w=1600&q=82&auto=format';

// ── RENDER HERO BANNERS ───────────────────────────────────────────────────────
async function renderHeroBanners(preloaded) {
  const container = document.getElementById('heroBanners');
  if (!container) return;

  const watches = preloaded ?? await fetchWatches();
  const t = s => (s || '').toLowerCase();
  const cuirWatch  = watches.find(w => t(w.type).includes('cuir') || (w.type || '').includes('جلد'));
  const acierWatch = watches.find(w => t(w.type).includes('acier') || t(w.type).includes('steel') || t(w.type).includes('inox'));

  const banners = [
    {
      id:    cuirWatch?.id,
      img:   HERO_DEFAULT_CUIR,
      label: 'جلد',
      sub:   'سوار جلد طبيعي',
    },
    {
      id:    acierWatch?.id,
      img:   (acierWatch?.mainImage && String(acierWatch.mainImage).trim()) || HERO_DEFAULT_ACIER,
      label: 'فولاذ',
      sub:   'ستانلس ستيل',
    },
  ];

  container.innerHTML = banners.map((b, i) => {
    const onClick = b.id
      ? `goToWatch('${b.id}')`
      : `document.getElementById('categories')?.scrollIntoView({behavior:'smooth'})`;
    const lastClass = i === 1 ? ' hero-banner--last' : '';
    return `
    <div class="hero-banner${lastClass}" onclick="${onClick}">
      <img src="${b.img}" alt="${b.label}" onerror="this.src='https://via.placeholder.com/800x400/1a1a1a/888?text=${encodeURIComponent(b.label)}'">
      <div class="overlay">
        <div class="label">
          <small>${b.sub}</small>
          ${b.label}
        </div>
      </div>
    </div>`;
  }).join('');
}

// ── CART (simple count) ───────────────────────────────────────────────────────
function updateCartBadge() {
  const cart   = JSON.parse(localStorage.getItem('kl_cart') || '[]');
  const badge  = document.getElementById('cartBadge');
  if (!badge) return;
  if (cart.length > 0) {
    badge.textContent = cart.length;
    badge.classList.add('visible');
  } else {
    badge.classList.remove('visible');
  }
}

function bindHomeCategoryChips(homeWatches) {
  const chips = document.querySelectorAll('.home-cat-chip');
  if (!chips.length) return;

  const setActive = cat => {
    chips.forEach(c => {
      const on = c.dataset.cat === cat;
      c.classList.toggle('is-active', on);
      c.setAttribute('aria-pressed', on ? 'true' : 'false');
    });
    renderHome(homeWatches, cat);
  };

  chips.forEach(chip => {
    chip.addEventListener('click', () => {
      setActive(chip.dataset.cat || 'all');
      document.getElementById('watches')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });
}

// ── INIT ─────────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  initNav();
  updateCartBadge();

  const page = document.body.dataset.page;
  if (page === 'home') {
    const grid = document.getElementById('watchesGrid');
    if (grid && !grid.dataset.navDelegate) {
      grid.dataset.navDelegate = '1';
      grid.addEventListener('click', (ev) => {
        const card = ev.target.closest('.watch-card[data-watch-id]');
        if (!card) return;
        const raw = card.getAttribute('data-watch-id');
        if (!raw) return;
        let id = raw;
        try {
          id = decodeURIComponent(raw);
        } catch (_) {}
        window.location.href = `watch.html?id=${encodeURIComponent(id)}`;
      });
    }
    (async () => {
      const homeWatches = await fetchWatches();
      renderHeroBanners(homeWatches);
      bindHomeCategoryChips(homeWatches);
      await renderHome(homeWatches, 'all');
    })();
  }
});
