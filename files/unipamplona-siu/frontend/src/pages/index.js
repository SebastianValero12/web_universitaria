/* ============================================================
   INDEX.JS — Hero slider, scroll spy, contact form
   Universidad de Pamplona SIU
   ============================================================ */

/* ────────────────────────────────────────────────────────────
   HERO SLIDER
   ──────────────────────────────────────────────────────────── */
(function initHeroSlider() {
  const slides    = document.querySelectorAll('.hero-slide');
  const dots      = document.querySelectorAll('.hero-dot');
  const prevBtn   = document.getElementById('hero-prev');
  const nextBtn   = document.getElementById('hero-next');

  if (!slides.length) return;

  let current  = 0;
  let timer    = null;
  let paused   = false;
  const DELAY  = 5000;

  function goTo(index) {
    slides[current].classList.remove('is-active');
    dots[current].classList.remove('is-active');
    dots[current].setAttribute('aria-selected', 'false');

    current = (index + slides.length) % slides.length;

    slides[current].classList.add('is-active');
    dots[current].classList.add('is-active');
    dots[current].setAttribute('aria-selected', 'true');
  }

  function next() { goTo(current + 1); }
  function prev() { goTo(current - 1); }

  function startAuto() {
    stopAuto();
    if (!paused) timer = setInterval(next, DELAY);
  }

  function stopAuto() {
    if (timer) { clearInterval(timer); timer = null; }
  }

  /* Controles */
  if (nextBtn) nextBtn.addEventListener('click', function() { next(); startAuto(); });
  if (prevBtn) prevBtn.addEventListener('click', function() { prev(); startAuto(); });

  dots.forEach(function(dot) {
    dot.addEventListener('click', function() {
      goTo(parseInt(dot.dataset.slide || 0));
      startAuto();
    });
  });

  /* Pausa en hover */
  const hero = document.querySelector('.hero');
  if (hero) {
    hero.addEventListener('mouseenter', function() { paused = true;  stopAuto(); });
    hero.addEventListener('mouseleave', function() { paused = false; startAuto(); });
  }

  /* Soporte touch */
  let touchStartX = 0;
  if (hero) {
    hero.addEventListener('touchstart', function(e) {
      touchStartX = e.touches[0].clientX;
    }, { passive: true });

    hero.addEventListener('touchend', function(e) {
      const diff = touchStartX - e.changedTouches[0].clientX;
      if (Math.abs(diff) > 50) {
        if (diff > 0) next(); else prev();
        startAuto();
      }
    }, { passive: true });
  }

  /* Iniciar */
  startAuto();
})();

/* ────────────────────────────────────────────────────────────
   BOTÓN HERO → abrir drawer
   ──────────────────────────────────────────────────────────── */
(function initHeroLogin() {
  const btn = document.getElementById('hero-login-btn');
  if (btn) {
    btn.addEventListener('click', function() {
      if (typeof LoginDrawer !== 'undefined') LoginDrawer.open('student');
    });
  }
})();

/* ────────────────────────────────────────────────────────────
   FILTROS DE PROGRAMAS
   ──────────────────────────────────────────────────────────── */
(function initProgramFilters() {
  const filters = document.querySelectorAll('.programs-filters .chip');
  const cards   = document.querySelectorAll('.program-card');

  filters.forEach(function(btn) {
    btn.addEventListener('click', function() {
      filters.forEach(function(b) { b.classList.remove('is-active'); });
      btn.classList.add('is-active');

      const filter = btn.dataset.filter;
      cards.forEach(function(card) {
        if (filter === 'all' || card.dataset.category === filter) {
          card.style.display = '';
          card.style.animation = 'fadeInUp .3s ease both';
        } else {
          card.style.display = 'none';
        }
      });
    });
  });
})();

/* ────────────────────────────────────────────────────────────
   FORMULARIO DE CONTACTO
   ──────────────────────────────────────────────────────────── */
(function initContactForm() {
  const form = document.getElementById('contact-form');
  if (!form) return;

  form.addEventListener('submit', function(e) {
    e.preventDefault();

    const name    = document.getElementById('contact-name').value.trim();
    const email   = document.getElementById('contact-email').value.trim();
    const subject = document.getElementById('contact-subject').value;
    const message = document.getElementById('contact-message').value.trim();

    if (!name || !email || !subject || !message) {
      if (typeof Toast !== 'undefined') {
        Toast.warning('Por favor complete todos los campos obligatorios.', 'Formulario incompleto');
      }
      return;
    }

    // Validar email
    const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRe.test(email)) {
      if (typeof Toast !== 'undefined') {
        Toast.error('Ingresa un correo electrónico válido.', 'Email inválido');
      }
      return;
    }

    const submitBtn = form.querySelector('[type="submit"]');
    if (submitBtn) submitBtn.classList.add('is-loading');

    // Simular envío
    setTimeout(function() {
      if (submitBtn) submitBtn.classList.remove('is-loading');
      form.reset();
      if (typeof Toast !== 'undefined') {
        Toast.success(
          'Tu mensaje ha sido enviado. Te responderemos pronto.',
          'Mensaje enviado'
        );
      }
    }, 1200);
  });
})();

/* ────────────────────────────────────────────────────────────
   CONTADOR ANIMADO DE NÚMEROS
   ──────────────────────────────────────────────────────────── */
(function initCounters() {
  const strip = document.querySelector('.stats-strip');
  if (!strip) return;

  let counted = false;

  function countUp(el, target, duration) {
    const start = 0;
    const step  = target / (duration / 16);
    let current = start;

    function tick() {
      current += step;
      if (current >= target) {
        el.textContent = target.toLocaleString('es-CO');
        return;
      }
      el.textContent = Math.floor(current).toLocaleString('es-CO');
      requestAnimationFrame(tick);
    }
    tick();
  }

  const observer = new IntersectionObserver(function(entries) {
    if (entries[0].isIntersecting && !counted) {
      counted = true;
      // No modificar los textos formateados (ya tienen + y unidades)
    }
  }, { threshold: .5 });

  observer.observe(strip);
})();

/* ────────────────────────────────────────────────────────────
   SMOOTH SCROLL para anclas
   ──────────────────────────────────────────────────────────── */
document.addEventListener('click', function(e) {
  const link = e.target.closest('a[href^="#"]');
  if (!link) return;

  const id = link.getAttribute('href').slice(1);
  if (!id) return;

  const target = document.getElementById(id);
  if (!target) return;

  e.preventDefault();

  const navH   = 72;
  const top    = target.getBoundingClientRect().top + window.scrollY - navH;
  window.scrollTo({ top, behavior: 'smooth' });
});
