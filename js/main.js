/* ═══════════════════════════════════════════════════════════════
   EV Primitive — Main JavaScript
   Navigation · Scroll effects · Animations · Content loading
   ═══════════════════════════════════════════════════════════════ */

'use strict';

/* ─── Nav scroll state ─── */
const nav = document.getElementById('main-nav');

function onScroll() {
  const scrolled = window.scrollY > 20
    || document.querySelector('main')?.scrollTop > 20;
  nav?.classList.toggle('nav--scrolled', scrolled);
}

// Main may have overflow-y: scroll so we watch both
window.addEventListener('scroll', onScroll, { passive: true });
document.querySelector('main')?.addEventListener('scroll', onScroll, { passive: true });
onScroll();

/* ─── Mobile menu ─── */
const menuToggle = document.getElementById('menuToggle');
const menuClose  = document.getElementById('menuClose');
const mobileMenu = document.getElementById('mobileMenu');

menuToggle?.addEventListener('click', () => {
  mobileMenu.classList.add('is-open');
  mobileMenu.setAttribute('aria-hidden', 'false');
  menuToggle.setAttribute('aria-expanded', 'true');
  document.body.style.overflow = 'hidden';
});

function closeMenu() {
  mobileMenu.classList.remove('is-open');
  mobileMenu.setAttribute('aria-hidden', 'true');
  menuToggle?.setAttribute('aria-expanded', 'false');
  document.body.style.overflow = '';
}

menuClose?.addEventListener('click', closeMenu);
mobileMenu?.querySelectorAll('a').forEach(a => a.addEventListener('click', closeMenu));

// Close on Escape
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') closeMenu();
});

/* ─── Hero parallax / active class ─── */
const heroSections = document.querySelectorAll('.hero');

const heroObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    entry.target.classList.toggle('is-active', entry.isIntersecting);
  });
}, { threshold: 0.5 });

heroSections.forEach(h => heroObserver.observe(h));

/* ─── Fade-up animations (non-hero elements) ─── */
const fadeEls = document.querySelectorAll(
  '.feature-card, .compare__header, .compare__table-wrap, .why-ev__text, .why-ev__visual, .cta-banner__inner'
);
fadeEls.forEach(el => el.classList.add('fade-up'));

const fadeObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry, i) => {
    if (entry.isIntersecting) {
      // Stagger siblings
      const delay = Array.from(entry.target.parentElement.children).indexOf(entry.target) * 80;
      setTimeout(() => entry.target.classList.add('is-visible'), delay);
      fadeObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.15 });

fadeEls.forEach(el => fadeObserver.observe(el));

/* ─── Dynamic hero content from API ─── */
async function loadHeroContent() {
  try {
    const res = await fetch('/api/content/heroes');
    if (!res.ok) return; // gracefully degrade if backend isn't running
    const heroes = await res.json();

    heroes.forEach(hero => {
      const section = document.querySelector(`.hero--${hero.slug}`);
      if (!section) return;

      const bg = section.querySelector('.hero__bg');
      const title = section.querySelector('.hero__title');
      const subtitle = section.querySelector('.hero__subtitle');

      if (bg && hero.backgroundImage) bg.style.backgroundImage = `url('${hero.backgroundImage}')`;
      if (title && hero.title) title.textContent = hero.title;
      if (subtitle && hero.subtitle) subtitle.textContent = hero.subtitle;

      // Update stats
      const statValues = section.querySelectorAll('.hero__stat-value');
      const statLabels = section.querySelectorAll('.hero__stat-label');
      if (hero.stats) {
        hero.stats.forEach((stat, i) => {
          if (statValues[i]) statValues[i].textContent = stat.value;
          if (statLabels[i]) statLabels[i].textContent = stat.label;
        });
      }
    });
  } catch (err) {
    // Backend not running — static content remains
    console.debug('[EV] Running in static mode');
  }
}

loadHeroContent();

/* ─── Smooth scroll for anchor links ─── */
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function(e) {
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});

/* ─── Lazy-load background images ─── */
const bgEls = document.querySelectorAll('[style*="background-image"]');
const bgObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const el = entry.target;
      const src = el.dataset.bgSrc;
      if (src) {
        const img = new Image();
        img.onload = () => { el.style.backgroundImage = `url('${src}')`; };
        img.src = src;
      }
      bgObserver.unobserve(el);
    }
  });
}, { rootMargin: '400px' });

bgEls.forEach(el => bgObserver.observe(el));

/* ─── Prefers reduced motion ─── */
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
if (prefersReducedMotion) {
  document.querySelectorAll('.fade-up').forEach(el => el.classList.add('is-visible'));
}
