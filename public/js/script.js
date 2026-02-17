/* ============================================
   PABLO & CRIS - WEDDING WEBSITE
   Main JavaScript File
============================================= */

document.addEventListener('DOMContentLoaded', () => {
  initResponsiveImages();
  initNavigation();
  initCountdown();
  initScrollHeader();
  initHeroParallax();
  initParallaxElements();
  initRSVPForm();
  initCopyIBAN();
  initScrollReveal();
});

/* ============================================
   RESPONSIVE IMAGES - Change image based on screen size
============================================= */
function initResponsiveImages() {
  const hero = document.querySelector('.hero');
  
  if (!hero) return;
  
  function updateHeroImage() {
    const isDesktop = window.innerWidth > 900;
    const currentPage = window.location.pathname;
    
    if (isDesktop) {
      // Desktop images
      if (currentPage.includes('confirmar')) {
        hero.style.backgroundImage = "url('images/Principal_Horizontal.png')";
      } else if (!currentPage.includes('como-llegar') && !currentPage.includes('preboda') && 
                 !currentPage.includes('el-dia') && !currentPage.includes('regalos')) {
        // Main index page
        hero.style.backgroundImage = "url('images/Principal_Horizontal.png')";
      }
      hero.style.backgroundPosition = 'center center';
    } else {
      // Mobile images
      if (currentPage.includes('confirmar')) {
        hero.style.backgroundImage = "url('images/image3.png')";
      } else if (!currentPage.includes('como-llegar') && !currentPage.includes('preboda') && 
                 !currentPage.includes('el-dia') && !currentPage.includes('regalos')) {
        // Main index page
        hero.style.backgroundImage = "url('images/Principal.jpeg')";
      }
      hero.style.backgroundPosition = '20% center';
    }
  }
  
  // Initial call
  updateHeroImage();
  
  // Update on window resize
  let resizeTimeout;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(updateHeroImage, 150);
  });
}

/* ============================================
   NAVIGATION (Mobile Menu)
============================================= */
function initNavigation() {
  const navMenu = document.getElementById('nav-menu');
  const navToggle = document.getElementById('nav-toggle');
  const navClose = document.getElementById('nav-close');
  const navLinks = document.querySelectorAll('.nav__link');

  if (navToggle) {
    navToggle.addEventListener('click', () => {
      navMenu.classList.add('show-menu');
      document.body.style.overflow = 'hidden';
    });
  }

  if (navClose) {
    navClose.addEventListener('click', closeMenu);
  }

  navLinks.forEach(link => {
    link.addEventListener('click', closeMenu);
  });

  document.addEventListener('click', (e) => {
    if (navMenu && navMenu.classList.contains('show-menu') && 
        !navMenu.contains(e.target) && 
        !navToggle.contains(e.target)) {
      closeMenu();
    }
  });

  function closeMenu() {
    if (navMenu) {
      navMenu.classList.remove('show-menu');
      document.body.style.overflow = '';
    }
  }
}

/* ============================================
   SCROLL HEADER
============================================= */
function initScrollHeader() {
  const header = document.getElementById('header');
  
  if (!header || header.classList.contains('header--solid')) return;
  
  let lastScroll = 0;
  
  function scrollHeader() {
    const currentScroll = window.scrollY;
    
    if (currentScroll > 50) {
      header.classList.add('scroll-header');
    } else {
      header.classList.remove('scroll-header');
    }
    
    lastScroll = currentScroll;
  }
  
  window.addEventListener('scroll', scrollHeader, { passive: true });
  scrollHeader();
}

/* ============================================
   HERO PARALLAX FADE EFFECT
============================================= */
function initHeroParallax() {
  const hero = document.querySelector('.hero');
  const heroContent = document.querySelector('.hero__content');
  const heroScroll = document.querySelector('.hero__scroll');
  const heroOverlay = document.querySelector('.hero__overlay');
  
  if (!hero || !heroContent) return;
  
  let ticking = false;
  
  function updateHeroOnScroll() {
    const scrollY = window.scrollY;
    const heroHeight = hero.offsetHeight;
    const scrollProgress = Math.min(scrollY / (heroHeight * 0.7), 1);
    
    // Easing function for smoother animation
    const easeOut = t => 1 - Math.pow(1 - t, 3);
    const easedProgress = easeOut(scrollProgress);
    
    // Fade out and move up hero content with parallax
    const opacity = 1 - easedProgress * 1.2;
    const translateY = scrollY * 0.5;
    const scale = 1 - easedProgress * 0.15;
    const blur = easedProgress * 8;
    
    heroContent.style.opacity = Math.max(opacity, 0);
    heroContent.style.transform = `translate3d(0, ${translateY}px, 0) scale(${scale})`;
    heroContent.style.filter = `blur(${blur}px)`;
    
    // Parallax background
    hero.style.backgroundPositionY = `${scrollY * 0.3}px`;
    
    // Fade out scroll indicator faster
    if (heroScroll) {
      heroScroll.style.opacity = Math.max(0.6 - scrollProgress * 2.5, 0);
      heroScroll.style.transform = `translateX(-50%) translateY(${scrollY * 0.8}px)`;
    }
    
    // Darken and shift overlay as we scroll
    if (heroOverlay) {
      const overlayOpacity = 0.35 + easedProgress * 0.4;
      heroOverlay.style.background = `linear-gradient(
        180deg,
        rgba(0,0,0,${0.15 + easedProgress * 0.25}) 0%,
        rgba(0,0,0,${overlayOpacity}) 50%,
        rgba(0,0,0,${0.45 + easedProgress * 0.35}) 100%
      )`;
    }
    
    ticking = false;
  }
  
  function onScroll() {
    if (!ticking) {
      requestAnimationFrame(updateHeroOnScroll);
      ticking = true;
    }
  }
  
  window.addEventListener('scroll', onScroll, { passive: true });
  updateHeroOnScroll();
}

/* ============================================
   PARALLAX ELEMENTS (Images, Cards, etc.)
============================================= */
function initParallaxElements() {
  const parallaxImages = document.querySelectorAll('.eldia__image, .ubicacion__image, .historia__img-container');
  const parallaxCards = document.querySelectorAll('.eldia__content, .preboda__card, .regalos__card, .rsvp-form');
  const ubicacionCards = document.querySelectorAll('.ubicacion__card');
  const sectionTitles = document.querySelectorAll('.section__title, .section__subtitle');
  
  if (parallaxImages.length === 0 && parallaxCards.length === 0) return;
  
  let ticking = false;
  
  // Smooth lerp function for butter-smooth animations
  function lerp(start, end, factor) {
    return start + (end - start) * factor;
  }
  
  // Store current values for smooth interpolation
  const elementStates = new Map();
  
  function initElementStates() {
    parallaxImages.forEach(el => elementStates.set(el, { y: 0, scale: 1 }));
    parallaxCards.forEach(el => elementStates.set(el, { y: 0 }));
    ubicacionCards.forEach(el => elementStates.set(el, { y: 0 }));
    sectionTitles.forEach(el => elementStates.set(el, { y: 0, opacity: 1 }));
  }
  
  initElementStates();
  
  function updateParallax() {
    const windowHeight = window.innerHeight;
    const scrollY = window.scrollY;
    
    // Parallax for images - subtle upward movement with scale
    parallaxImages.forEach(img => {
      const rect = img.getBoundingClientRect();
      const elementCenter = rect.top + rect.height / 2;
      const distanceFromCenter = (elementCenter - windowHeight / 2) / windowHeight;
      
      if (rect.bottom > -100 && rect.top < windowHeight + 100) {
        const state = elementStates.get(img);
        const targetY = distanceFromCenter * -40;
        const targetScale = 1 + Math.abs(distanceFromCenter) * 0.03;
        
        // Smooth interpolation
        state.y = lerp(state.y, targetY, 0.1);
        state.scale = lerp(state.scale, targetScale, 0.1);
        
        img.style.transform = `translate3d(0, ${state.y}px, 0) scale(${state.scale})`;
      }
    });
    
    // Parallax for content cards - subtle floating effect
    parallaxCards.forEach(card => {
      const rect = card.getBoundingClientRect();
      const elementCenter = rect.top + rect.height / 2;
      const distanceFromCenter = (elementCenter - windowHeight / 2) / windowHeight;
      
      if (rect.bottom > -100 && rect.top < windowHeight + 100) {
        const state = elementStates.get(card);
        const targetY = distanceFromCenter * -25;
        
        state.y = lerp(state.y, targetY, 0.08);
        card.style.transform = `translate3d(0, ${state.y}px, 0)`;
      }
    });
    
    // Staggered parallax for ubicacion cards
    ubicacionCards.forEach((card, index) => {
      const rect = card.getBoundingClientRect();
      const elementCenter = rect.top + rect.height / 2;
      const distanceFromCenter = (elementCenter - windowHeight / 2) / windowHeight;
      
      if (rect.bottom > -100 && rect.top < windowHeight + 100) {
        const state = elementStates.get(card);
        // Stagger effect - each card has slightly different movement
        const staggerMultiplier = 1 + (index * 0.15);
        const targetY = distanceFromCenter * -15 * staggerMultiplier;
        
        state.y = lerp(state.y, targetY, 0.06);
        card.style.transform = `translate3d(0, ${state.y}px, 0)`;
      }
    });
    
    // Subtle title parallax
    sectionTitles.forEach(title => {
      const rect = title.getBoundingClientRect();
      const elementCenter = rect.top + rect.height / 2;
      const distanceFromCenter = (elementCenter - windowHeight / 2) / windowHeight;
      
      if (rect.bottom > -50 && rect.top < windowHeight + 50) {
        const state = elementStates.get(title);
        const targetY = distanceFromCenter * -10;
        
        state.y = lerp(state.y, targetY, 0.05);
        title.style.transform = `translate3d(0, ${state.y}px, 0)`;
      }
    });
    
    ticking = false;
  }
  
  function onScroll() {
    if (!ticking) {
      requestAnimationFrame(updateParallax);
      ticking = true;
    }
  }
  
  // Use smooth animation loop for buttery parallax
  function smoothParallaxLoop() {
    updateParallax();
    requestAnimationFrame(smoothParallaxLoop);
  }
  
  // Start the smooth animation loop
  smoothParallaxLoop();
}

/* ============================================
   COUNTDOWN TIMER
============================================= */
function initCountdown() {
  // Wedding date: June 20, 2026 at 12:00 PM
  const weddingDate = new Date('June 20, 2026 12:00:00').getTime();

  const daysEl = document.getElementById('days');
  const hoursEl = document.getElementById('hours');
  const minutesEl = document.getElementById('minutes');
  const secondsEl = document.getElementById('seconds');

  if (!daysEl || !hoursEl || !minutesEl || !secondsEl) return;

  function updateCountdown() {
    const now = new Date().getTime();
    const distance = weddingDate - now;

    if (distance < 0) {
      daysEl.textContent = '0';
      hoursEl.textContent = '0';
      minutesEl.textContent = '0';
      secondsEl.textContent = '0';
      return;
    }

    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);

    daysEl.textContent = days;
    hoursEl.textContent = hours;
    minutesEl.textContent = minutes;
    secondsEl.textContent = seconds;
  }

  updateCountdown();
  setInterval(updateCountdown, 1000);
}

/* ============================================
   RSVP FORM
============================================= */
function initRSVPForm() {
  const form = document.getElementById('rsvp-form');
  const submitBtn = document.getElementById('submit-btn');

  if (!form || !submitBtn) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    // Get form data
    const formData = new FormData(form);
    const busHorarioSelected = document.querySelector('input[name="busHorario"]:checked');
    const data = {
      nombre: formData.get('nombre'),
      asistenciaBoda: formData.get('asistenciaBoda') || 'No especificado',
      acompañante: formData.get('acompanante') || 'No especificado',
      nombreAcompanante: formData.get('nombreAcompanante') || 'No especificado',
      bus: formData.get('bus') || 'No especificado',
      busHorario: (busHorarioSelected && busHorarioSelected.value) || 'No especificado',
      alergias: formData.get('alergias') || '',
      asistenciaPreboda: formData.get('asistenciaPreboda') || '',
      sandalias: formData.get('sandalias') || 'No especificado',
      sandaliaTalla: formData.get('sandaliaTalla') || ''
    };

    console.log('Datos a enviar:', data); // Para depurar

    // Validate required fields
    if (!data.nombre.trim()) {
      Swal.fire({
        icon: 'warning',
        title: 'Campos requeridos',
        text: 'Por favor, introduce tu nombre.',
        confirmButtonColor: '#9caa8b'
      });
      return;
    }

    if (data.asistenciaBoda === 'No especificado') {
      Swal.fire({
        icon: 'warning',
        title: 'Campos requeridos',
        text: 'Por favor, indica si asistirás a la boda.',
        confirmButtonColor: '#9caa8b'
      });
      return;
    }

    if (data.bus === 'Sí' && data.busHorario === 'No especificado') {
      Swal.fire({
        icon: 'warning',
        title: 'Campos requeridos',
        text: 'Por favor, indica el horario de vuelta del bus.',
        confirmButtonColor: '#9caa8b'
      });
      return;
    }

    // Show loading state
    submitBtn.classList.add('loading');
    submitBtn.disabled = true;

    try {
      const response = await fetch('/api/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });

      const result = await response.json();

      if (response.ok) {
        console.log('Respuesta del servidor:', result); // Para ver updatedRange
        Swal.fire({
          icon: 'success',
          title: '¡Gracias!',
          html: `<p>Tu confirmación ha sido enviada correctamente.</p>
                 <p style="margin-top: 1rem; font-style: italic;">¡Nos vemos el 20 de Junio! 💒</p>`,
          confirmButtonColor: '#9caa8b'
        });
        form.reset();
      } else {
        throw new Error(result.error || 'Error al enviar');
      }
    } catch (error) {
      console.error('Error:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Hubo un problema al enviar tu confirmación. Por favor, inténtalo de nuevo.',
        confirmButtonColor: '#9caa8b'
      });
    } finally {
      submitBtn.classList.remove('loading');
      submitBtn.disabled = false;
    }
  });
}

/* ============================================
   COPY IBAN
============================================= */
function initCopyIBAN() {
  const copyBtn = document.getElementById('copy-iban');
  const ibanEl = document.getElementById('iban');

  if (!copyBtn || !ibanEl) return;

  copyBtn.addEventListener('click', async () => {
    const iban = ibanEl.textContent.replace(/\s/g, '');
    
    try {
      await navigator.clipboard.writeText(iban);
      
      copyBtn.classList.add('copied');
      copyBtn.innerHTML = '<i class="fas fa-check"></i>';
      
      setTimeout(() => {
        copyBtn.classList.remove('copied');
        copyBtn.innerHTML = '<i class="far fa-copy"></i>';
      }, 2000);
      
    } catch (err) {
      // Fallback for older browsers
      const textarea = document.createElement('textarea');
      textarea.value = iban;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      
      copyBtn.classList.add('copied');
      copyBtn.innerHTML = '<i class="fas fa-check"></i>';
      
      setTimeout(() => {
        copyBtn.classList.remove('copied');
        copyBtn.innerHTML = '<i class="far fa-copy"></i>';
      }, 2000);
    }
  });
}

/* ============================================
   SCROLL REVEAL - Enhanced with Stagger
============================================= */
function initScrollReveal() {
  const reveals = document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-scale');
  
  if (reveals.length === 0) return;
  
  const observerOptions = {
    root: null,
    rootMargin: '0px 0px -60px 0px',
    threshold: 0.12
  };
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry, index) => {
      if (entry.isIntersecting) {
        // Add staggered delay based on element position
        const delay = entry.target.dataset.delay || 0;
        setTimeout(() => {
          entry.target.classList.add('visible');
        }, delay * 100);
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);
  
  reveals.forEach((el, index) => {
    // Set stagger delay for siblings
    if (!el.classList.contains('reveal-delay-1') && 
        !el.classList.contains('reveal-delay-2') && 
        !el.classList.contains('reveal-delay-3') && 
        !el.classList.contains('reveal-delay-4')) {
      el.dataset.delay = 0;
    }
    observer.observe(el);
  });
}
