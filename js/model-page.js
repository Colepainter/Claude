/* ═══════════════════════════════════════════════════════════════
   Model Page — Configurator + interactions
   ═══════════════════════════════════════════════════════════════ */

'use strict';

/* ─── Nav scroll ─── */
const nav = document.getElementById('main-nav');
window.addEventListener('scroll', () => {
  nav?.classList.toggle('nav--scrolled', window.scrollY > 50);
}, { passive: true });

/* ─── Color swatch picker ─── */
const swatches = document.querySelectorAll('.swatch');
const swatchLabel = document.getElementById('swatchLabel');

swatches.forEach(sw => {
  sw.addEventListener('click', () => {
    swatches.forEach(s => s.classList.remove('swatch--active'));
    sw.classList.add('swatch--active');
    const label = sw.dataset.label;
    const price = sw.dataset.price;
    if (swatchLabel) {
      swatchLabel.textContent = `${label} — ${price === '+$0' ? 'Included' : price}`;
    }
    updatePrice();
  });
});

/* ─── Option buttons (generic) ─── */
document.querySelectorAll('.mp-config__options').forEach(group => {
  group.querySelectorAll('.mp-option').forEach(btn => {
    btn.addEventListener('click', () => {
      group.querySelectorAll('.mp-option').forEach(b => b.classList.remove('mp-option--active'));
      btn.classList.add('mp-option--active');
      updatePrice();
    });
  });
});

/* ─── Price calculator ─── */
const BASE = 43990;

function parseDelta(str) {
  if (!str || str === '+$0') return 0;
  return parseInt(str.replace(/[^0-9]/g, ''), 10);
}

function updatePrice() {
  let total = BASE;

  // Swatch add-on
  const activeSwatch = document.querySelector('.swatch--active');
  if (activeSwatch) total += parseDelta(activeSwatch.dataset.price);

  // Option add-ons
  document.querySelectorAll('.mp-option--active').forEach(btn => {
    total += parseDelta(btn.dataset.price);
  });

  const fmt = n => '$' + n.toLocaleString('en-US');
  const optTotal = total - BASE;

  const optEl = document.getElementById('optionsTotal');
  const totalEl = document.getElementById('totalPrice');
  const creditEl = document.getElementById('afterCredit');

  if (optEl)    optEl.querySelector('span:last-child').textContent = optTotal ? fmt(optTotal) : '$0';
  if (totalEl)  totalEl.textContent = fmt(total);
  if (creditEl) creditEl.textContent = fmt(Math.max(0, total - 7500));
}

/* ─── Dynamic content from API ─── */
(async function loadModelContent() {
  const slug = document.querySelector('[data-model-slug]')?.dataset.modelSlug || 'model-y';
  try {
    const res = await fetch(`/api/vehicles/${slug}`);
    if (!res.ok) return;
    const data = await res.json();

    // Patch hero
    if (data.heroImage) document.getElementById('mp-hero').style.backgroundImage = `url('${data.heroImage}')`;
    if (data.tagline)   document.querySelector('.mp-hero__tagline').textContent = data.tagline;
    if (data.basePrice) {
      // recompute
    }
  } catch {
    /* static fallback */
  }
})();

/* ─── Fade animations ─── */
const obs = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add('is-visible');
      obs.unobserve(e.target);
    }
  });
}, { threshold: 0.1 });

document.querySelectorAll('.mp-feature__text, .mp-specs__inner').forEach(el => {
  el.classList.add('fade-up');
  obs.observe(el);
});
