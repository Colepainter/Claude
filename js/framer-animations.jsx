/**
 * EV Primitive — Framer Motion Animations
 *
 * This file provides React/Framer Motion components that enhance
 * the homepage hero sections and page transitions.
 *
 * Usage:
 *   Bundled via: npm run build:animations
 *   Output:      js/framer-animations.js  (loaded in index.html)
 *
 * Install deps first:
 *   npm install react react-dom framer-motion
 */

import React, { useEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import {
  motion,
  useScroll,
  useTransform,
  useSpring,
  AnimatePresence,
  useInView,
} from 'framer-motion';

/* ─── Ease presets ─── */
const EASE_OUT_EXPO = [0.16, 1, 0.3, 1];
const EASE_IN_OUT  = [0.4, 0, 0.2, 1];

/* ─── FadeUp: staggered children ─── */
export function FadeUpGroup({ children, delay = 0, stagger = 0.12, threshold = 0.2 }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, amount: threshold });

  const containerVariants = {
    hidden: {},
    visible: { transition: { staggerChildren: stagger, delayChildren: delay } }
  };
  const childVariants = {
    hidden:  { opacity: 0, y: 40 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: EASE_OUT_EXPO } }
  };

  return (
    <motion.div
      ref={ref}
      variants={containerVariants}
      initial="hidden"
      animate={inView ? 'visible' : 'hidden'}
    >
      {React.Children.map(children, child => (
        <motion.div variants={childVariants}>{child}</motion.div>
      ))}
    </motion.div>
  );
}

/* ─── HeroTitle: letter-by-letter reveal ─── */
export function HeroTitle({ text, className = '' }) {
  const words = text.split(' ');
  return (
    <motion.h1
      className={className}
      initial="hidden"
      animate="visible"
      variants={{ visible: { transition: { staggerChildren: 0.08 } } }}
    >
      {words.map((word, wi) => (
        <span key={wi} style={{ display: 'inline-block', marginRight: '0.3em', overflow: 'hidden' }}>
          <motion.span
            style={{ display: 'inline-block' }}
            variants={{
              hidden:  { y: '110%', opacity: 0 },
              visible: { y: 0, opacity: 1, transition: { duration: 0.65, ease: EASE_OUT_EXPO } }
            }}
          >
            {word}
          </motion.span>
        </span>
      ))}
    </motion.h1>
  );
}

/* ─── ParallaxHero: scroll-driven background shift ─── */
export function ParallaxHero({ backgroundImage, children, className = '' }) {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] });
  const rawY = useTransform(scrollYProgress, [0, 1], ['0%', '30%']);
  const y     = useSpring(rawY, { stiffness: 80, damping: 30 });

  return (
    <motion.section ref={ref} className={`hero ${className}`} style={{ overflow: 'hidden', position: 'relative' }}>
      <motion.div
        className="hero__bg"
        style={{
          backgroundImage: `url('${backgroundImage}')`,
          y,
          scale: 1.1,
          position: 'absolute',
          inset: 0,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />
      {children}
    </motion.section>
  );
}

/* ─── StatCounter: animates numbers on enter ─── */
export function StatCounter({ value, label, duration = 1.5 }) {
  const ref        = useRef(null);
  const inView     = useInView(ref, { once: true, amount: 0.5 });
  const [display, setDisplay] = useState('0');

  // Parse the numeric part (handles "3.5s", "330", "1,020")
  const numStr   = value.replace(/[^0-9.]/g, '');
  const suffix   = value.replace(/[0-9.,]/g, '');
  const target   = parseFloat(numStr) || 0;
  const isFloat  = numStr.includes('.');
  const decimals = isFloat ? (numStr.split('.')[1]?.length || 1) : 0;

  useEffect(() => {
    if (!inView) return;
    let start = null;
    const step = (ts) => {
      if (!start) start = ts;
      const progress = Math.min((ts - start) / (duration * 1000), 1);
      const eased    = 1 - Math.pow(1 - progress, 3); // ease-out-cubic
      const current  = eased * target;
      setDisplay(
        current.toLocaleString('en-US', {
          minimumFractionDigits: decimals,
          maximumFractionDigits: decimals,
        }) + suffix
      );
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [inView, target, suffix, decimals, duration]);

  return (
    <div className="hero__stat" ref={ref}>
      <motion.span
        className="hero__stat-value"
        initial={{ opacity: 0, y: 20 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.5, ease: EASE_OUT_EXPO }}
      >
        {display}
      </motion.span>
      <motion.span
        className="hero__stat-label"
        initial={{ opacity: 0 }}
        animate={inView ? { opacity: 0.85 } : {}}
        transition={{ delay: 0.3, duration: 0.4 }}
      >
        {label}
      </motion.span>
    </div>
  );
}

/* ─── FeatureRow: slide in from left/right ─── */
export function FeatureRow({ title, eyebrow, body, image, reversed = false, dark = true }) {
  const ref    = useRef(null);
  const inView = useInView(ref, { once: true, amount: 0.25 });

  const textVariants = {
    hidden:  { opacity: 0, x: reversed ? 60 : -60 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.8, ease: EASE_OUT_EXPO } }
  };
  const imageVariants = {
    hidden:  { opacity: 0, scale: 1.05 },
    visible: { opacity: 1, scale: 1, transition: { duration: 1, ease: EASE_IN_OUT } }
  };

  return (
    <div ref={ref} className={`mp-feature ${dark ? 'mp-feature--dark' : 'mp-feature--light'} ${reversed ? 'mp-feature--reversed' : ''}`}>
      <motion.div
        className="mp-feature__media"
        style={{ backgroundImage: `url('${image}')` }}
        variants={imageVariants}
        initial="hidden"
        animate={inView ? 'visible' : 'hidden'}
      />
      <motion.div
        className="mp-feature__text"
        variants={textVariants}
        initial="hidden"
        animate={inView ? 'visible' : 'hidden'}
      >
        <span className="mp-feature__eyebrow">{eyebrow}</span>
        <h2 className="mp-feature__title" dangerouslySetInnerHTML={{ __html: title }} />
        <p className="mp-feature__body">{body}</p>
      </motion.div>
    </div>
  );
}

/* ─── Page transition wrapper ─── */
export function PageTransition({ children }) {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -12 }}
        transition={{ duration: 0.4, ease: EASE_OUT_EXPO }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}

/* ─── Nav background blur on scroll ─── */
export function AnimatedNav({ logoSrc, links }) {
  const { scrollY } = useScroll();
  const bgOpacity  = useTransform(scrollY, [0, 80], [0, 0.92]);
  const blur       = useTransform(scrollY, [0, 80], [0, 20]);

  return (
    <motion.nav
      style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        height: 56,
        backgroundColor: `rgba(255,255,255,${bgOpacity})`,
        backdropFilter: `blur(${blur}px)`,
      }}
    >
      {/* Nav contents injected here */}
    </motion.nav>
  );
}

/* ─── Mount animation overlays onto existing DOM ─── */
function mountAnimations() {
  // Animate stat numbers on homepage hero sections
  document.querySelectorAll('.hero__stat').forEach(statEl => {
    const valEl   = statEl.querySelector('.hero__stat-value');
    const lblEl   = statEl.querySelector('.hero__stat-label');
    if (!valEl || !lblEl) return;

    const container = document.createElement('div');
    statEl.replaceWith(container);

    createRoot(container).render(
      <StatCounter value={valEl.textContent.trim()} label={lblEl.textContent.trim()} />
    );
  });

  // Fade up feature cards
  const featureCards = document.querySelectorAll('.feature-card');
  if (featureCards.length > 0) {
    const wrapper = document.createElement('div');
    wrapper.className = 'features__grid';
    featureCards[0].parentNode.replaceWith(wrapper);

    createRoot(wrapper).render(
      <FadeUpGroup stagger={0.1}>
        {Array.from(featureCards).map((card, i) => (
          <div key={i} dangerouslySetInnerHTML={{ __html: card.outerHTML }} />
        ))}
      </FadeUpGroup>
    );
  }
}

// Auto-mount when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', mountAnimations);
} else {
  mountAnimations();
}

export default { FadeUpGroup, HeroTitle, ParallaxHero, StatCounter, FeatureRow, PageTransition };
