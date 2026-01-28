/*
  Como Llegar motion layer (anime.js)
  - Editorial, minimal, functional
  - IntersectionObserver-driven storytelling
  - Respects prefers-reduced-motion
*/

(function () {
  const prefersReducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Enable motion-only initial states (CSS gated by this class)
  if (!prefersReducedMotion) {
    document.documentElement.classList.add('motion-enabled');
  }

  function qs(sel, root = document) { return root.querySelector(sel); }
  function qsa(sel, root = document) { return Array.from(root.querySelectorAll(sel)); }

  function safeAnime() {
    return typeof window.anime === 'function';
  }

  function setFinalStates() {
    // In reduced motion, ensure nothing is hidden.
    const heroSubtitle = qs('.hero__subtitle');
    const heroTitle = qs('.hero__title');
    const heroLine = qs('.hero__line');
    const heroScroll = qs('.hero__scroll');

    [heroSubtitle, heroTitle, heroLine, heroScroll].forEach((el) => {
      if (!el) return;
      el.style.opacity = '1';
      el.style.transform = 'none';
    });

    qsa('.location-card').forEach((card) => {
      card.style.opacity = '1';
      card.style.transform = 'none';

      const img = qs('.location-card__image img', card);
      if (img) {
        img.style.opacity = '1';
        img.style.transform = 'none';
      }

      qsa('.location-card__subtitle, .location-card__title, .location-card__text, .btn', card).forEach((el) => {
        el.style.opacity = '1';
        el.style.transform = 'none';
      });

      const wipe = qs('.location-card__wipe', card);
      if (wipe) wipe.style.display = 'none';
    });
  }

  function heroIntro() {
    if (prefersReducedMotion || !safeAnime()) return;

    const subtitle = qs('.hero__subtitle');
    const title = qs('.hero__title');
    const line = qs('.hero__line');
    const scroll = qs('.hero__scroll');

    const tl = window.anime.timeline({
      easing: 'easeOutExpo',
      duration: 700,
    });

    tl.add({
      targets: subtitle,
      opacity: [0, 1],
      translateY: [10, 0],
      delay: 150,
    })
      .add({
        targets: title,
        opacity: [0, 1],
        translateY: [12, 0],
        duration: 800,
      }, '-=450')
      .add({
        targets: line,
        opacity: [0, 1],
        scaleX: [0, 1],
        duration: 650,
      }, '-=520')
      .add({
        targets: scroll,
        opacity: [0, 1],
        translateY: [8, 0],
        duration: 650,
      }, '-=420');

    // Subtle loop on chevron
    if (scroll) {
      window.anime({
        targets: scroll,
        translateY: [0, 6],
        direction: 'alternate',
        easing: 'easeInOutSine',
        duration: 1400,
        loop: true,
      });
    }
  }

  function smoothScrollWithFocus() {
    const link = qs('.hero__scroll');
    const target = qs('#locations');
    if (!link || !target) return;

    link.addEventListener('click', (e) => {
      // Keep default hash behavior if reduced motion (still OK), but we can smooth-scroll.
      e.preventDefault();
      target.scrollIntoView({ behavior: prefersReducedMotion ? 'auto' : 'smooth', block: 'start' });

      if (prefersReducedMotion || !safeAnime()) return;

      // Light pulse on first chapter
      const first = qs('.location-card', target);
      if (!first) return;

      // Delay a bit to match scroll finish.
      window.setTimeout(() => {
        window.anime({
          targets: first,
          scale: [{ value: 1.01, duration: 220 }, { value: 1, duration: 420 }],
          easing: 'easeOutQuad',
        });
      }, 550);
    }, { passive: false });
  }

  function chapterAnimations() {
    const cards = qsa('.location-card');
    if (cards.length === 0) return;

    if (prefersReducedMotion || !safeAnime()) {
      // Still add click feedback (safe even in reduced)
      clickFeedback();
      return;
    }

    const observer = new IntersectionObserver((entries, obs) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;

        const card = entry.target;
        obs.unobserve(card);
        animateCard(card);
      });
    }, {
      root: null,
      threshold: 0.18,
      rootMargin: '0px 0px -10% 0px',
    });

    cards.forEach((card) => observer.observe(card));

    clickFeedback();
    parallaxImages();
    buttonIconHover();
  }

  function animateCard(card) {
    const isReverse = card.classList.contains('location-card--reverse');
    const img = qs('.location-card__image img', card);
    const wipe = qs('.location-card__wipe', card);

    const subtitle = qs('.location-card__subtitle', card);
    const title = qs('.location-card__title', card);
    const text = qs('.location-card__text', card);
    const btn = qs('.btn', card);

    // Ensure wipe starts covering
    if (wipe) wipe.style.transform = 'translateX(0%)';

    // Chapter: card in, image reveal, then content
    const tl = window.anime.timeline({
      easing: 'easeOutCubic',
      autoplay: true,
    });

    tl.add({
      targets: card,
      opacity: [0, 1],
      translateY: [16, 0],
      duration: 650,
    })
      .add({
        targets: wipe,
        translateX: ['0%', '105%'],
        duration: 900,
        easing: 'easeInOutQuart',
      }, '-=520')
      .add({
        targets: img,
        opacity: [0, 1],
        scale: [1.06, 1],
        duration: 1100,
        easing: 'easeOutExpo',
      }, '-=900')
      .add({
        targets: [subtitle, title, text, btn].filter(Boolean),
        opacity: [0, 1],
        translateY: [14, 0],
        delay: window.anime.stagger(110),
        duration: 650,
      }, '-=650');

    // Clean up wipe after animation
    tl.finished.then(() => {
      if (wipe) {
        wipe.style.transform = 'translateX(105%)';
      }
      card.dataset.revealed = 'true';
    }).catch(() => {
      // no-op
    });

    // Slight directional hint (very subtle) on reverse chapters
    if (isReverse) {
      window.anime({
        targets: card,
        translateX: [6, 0],
        duration: 650,
        easing: 'easeOutCubic',
      });
    }
  }

  function clickFeedback() {
    qsa('.location-card .btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        if (prefersReducedMotion || !safeAnime()) return;
        window.anime({
          targets: btn,
          scale: [{ value: 0.985, duration: 90 }, { value: 1, duration: 220 }],
          easing: 'easeOutQuad',
        });
      }, { passive: true });
    });
  }

  function buttonIconHover() {
    // Animate just the icon, underline handled via CSS.
    qsa('.location-card .btn i').forEach((icon) => {
      const btn = icon.closest('.btn');
      if (!btn) return;

      let hovering = false;
      btn.addEventListener('mouseenter', () => {
        if (hovering) return;
        hovering = true;
        window.anime({
          targets: icon,
          translateX: [0, 4],
          duration: 260,
          easing: 'easeOutQuad',
          complete: () => { hovering = false; },
        });
      });

      btn.addEventListener('mouseleave', () => {
        window.anime({
          targets: icon,
          translateX: 0,
          duration: 320,
          easing: 'easeOutExpo',
        });
      });
    });
  }

  function parallaxImages() {
    // Optional: desktop only, subtle, throttled.
    if (prefersReducedMotion) return;
    if (window.matchMedia && window.matchMedia('(hover: none)').matches) return;

    const maxOffset = 8; // px

    qsa('.location-card__image').forEach((wrap) => {
      const img = qs('img', wrap);
      if (!img) return;

      let rafId = 0;
      let targetX = 0;
      let targetY = 0;

      function apply() {
        rafId = 0;
        const revealed = wrap.closest('.location-card')?.dataset?.revealed === 'true';
        const baseScale = revealed ? 1.02 : 1.0;
        img.style.transform = `translate3d(${targetX}px, ${targetY}px, 0) scale(${baseScale})`;
      }

      wrap.addEventListener('mousemove', (e) => {
        const rect = wrap.getBoundingClientRect();
        const px = (e.clientX - rect.left) / rect.width;
        const py = (e.clientY - rect.top) / rect.height;
        targetX = (px - 0.5) * (maxOffset * 2);
        targetY = (py - 0.5) * (maxOffset * 2);
        if (!rafId) rafId = window.requestAnimationFrame(apply);
      });

      wrap.addEventListener('mouseleave', () => {
        targetX = 0;
        targetY = 0;
        if (!safeAnime()) {
          img.style.transform = 'translate3d(0,0,0) scale(1)';
          return;
        }
        window.anime({
          targets: img,
          translateX: 0,
          translateY: 0,
          duration: 450,
          easing: 'easeOutExpo',
        });
      });
    });
  }

  function injectWipesIfMissing() {
    // Minimal markup fallback: if HTML wasn't edited, we can inject the wipe spans.
    qsa('.location-card__image').forEach((wrap) => {
      if (qs('.location-card__wipe', wrap)) return;
      const wipe = document.createElement('span');
      wipe.className = 'location-card__wipe';
      wipe.setAttribute('aria-hidden', 'true');
      wrap.prepend(wipe);
    });
  }

  function init() {
    if (prefersReducedMotion) {
      setFinalStates();
      // Still keep smooth scroll (auto)
      smoothScrollWithFocus();
      return;
    }

    if (!safeAnime()) {
      // If anime.js failed to load, avoid hiding content.
      setFinalStates();
      return;
    }

    injectWipesIfMissing();
    heroIntro();
    smoothScrollWithFocus();
    chapterAnimations();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
