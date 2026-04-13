/* ============================================================
   LAYOUT.JS — Inyector de navbar y footer, efectos de scroll,
   animaciones reveal, toggle de sidebar, menú mobile
   Universidad de Pamplona SIU
   ============================================================ */

/* ── Logo institucional ────────────────────────────────────── */
const SHIELD_SVG = '<img src="/src/assets/logo-unipamplona.png" alt="Logo Universidad de Pamplona" class="brand-logo">';

/* ── HTML del navbar ───────────────────────────────────────── */
function buildNavbar() {
  return `
<nav class="navbar" id="main-navbar" role="navigation" aria-label="Navegación principal">
  <div class="navbar-inner">
    <a href="/index.html" class="navbar-brand" aria-label="Universidad de Pamplona">
      ${SHIELD_SVG}
      <div class="navbar-brand-text">
        <span class="navbar-brand-name">Universidad de Pamplona</span>
        <span class="navbar-brand-sub">Sistema de Información Universitaria</span>
      </div>
    </a>

    <nav class="navbar-nav" aria-label="Menú principal">
      <a href="/index.html#programas" class="navbar-link">Programas</a>
      <a href="/index.html#noticias"  class="navbar-link">Noticias</a>
      <a href="/index.html#investigacion" class="navbar-link">Investigación</a>
      <a href="/index.html#contacto" class="navbar-link">Contacto</a>
    </nav>

    <div class="navbar-cta">
      <button class="btn btn-primary btn-sm" id="open-login-btn" aria-expanded="false" aria-controls="login-drawer">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
          <circle cx="12" cy="7" r="4"/>
        </svg>
        Mi portal
      </button>
    </div>

    <button class="navbar-toggler" id="navbar-toggler" aria-label="Abrir menú" aria-expanded="false" aria-controls="navbar-mobile">
      <span></span><span></span><span></span>
    </button>
  </div>
</nav>

<!-- Menú mobile -->
<div class="navbar-mobile" id="navbar-mobile" role="menu" aria-label="Menú mobile">
  <a href="/index.html#programas"     class="navbar-link" role="menuitem">Programas</a>
  <a href="/index.html#noticias"      class="navbar-link" role="menuitem">Noticias</a>
  <a href="/index.html#investigacion" class="navbar-link" role="menuitem">Investigación</a>
  <a href="/index.html#contacto"      class="navbar-link" role="menuitem">Contacto</a>
  <hr>
  <button class="btn btn-primary btn-sm btn-full" id="open-login-btn-mobile">Mi portal</button>
</div>`;
}

/* ── HTML del footer ───────────────────────────────────────── */
function buildFooter() {
  const year = new Date().getFullYear();
  return `
<footer class="footer" role="contentinfo">
  <div class="footer-inner">
    <div class="footer-grid">

      <!-- Columna brand -->
      <div class="footer-col footer-col-brand">
        <a href="/index.html" class="footer-brand" aria-label="Universidad de Pamplona">
          ${SHIELD_SVG}
          <div>
            <span class="footer-brand-name">Universidad de Pamplona</span>
            <span class="footer-brand-sub">Fundada en 1960 · Norte de Santander, Colombia</span>
          </div>
        </a>
        <p class="footer-desc">
          Institución de educación superior comprometida con la excelencia académica,
          la investigación y el desarrollo regional de Colombia.
        </p>
        <div class="footer-social" aria-label="Redes sociales">
          <a href="#" class="footer-social-link" aria-label="Facebook">
            <svg viewBox="0 0 24 24" fill="currentColor"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
          </a>
          <a href="#" class="footer-social-link" aria-label="Twitter / X">
            <svg viewBox="0 0 24 24" fill="currentColor"><path d="M4 4l16 16M4 20L20 4" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round"/></svg>
          </a>
          <a href="#" class="footer-social-link" aria-label="Instagram">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="2" width="20" height="20" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"/></svg>
          </a>
          <a href="#" class="footer-social-link" aria-label="YouTube">
            <svg viewBox="0 0 24 24" fill="currentColor"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46A2.78 2.78 0 0 0 1.46 6.42 29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58 2.78 2.78 0 0 0 1.95 1.96C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 0 0 1.95-1.96A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z"/><polygon points="9.75,15.02 15.5,12 9.75,8.98 9.75,15.02" fill="white"/></svg>
          </a>
          <a href="#" class="footer-social-link" aria-label="LinkedIn">
            <svg viewBox="0 0 24 24" fill="currentColor"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/></svg>
          </a>
        </div>
      </div>

      <!-- Columna institucional -->
      <div class="footer-col">
        <h4>Institucional</h4>
        <nav class="footer-links" aria-label="Links institucionales">
          <a href="#" class="footer-link">Historia y misión</a>
          <a href="#" class="footer-link">Gobierno universitario</a>
          <a href="#" class="footer-link">Plan de desarrollo</a>
          <a href="#" class="footer-link">Acreditación</a>
          <a href="#" class="footer-link">Transparencia</a>
          <a href="#" class="footer-link">Normatividad</a>
        </nav>
      </div>

      <!-- Columna académica -->
      <div class="footer-col">
        <h4>Académico</h4>
        <nav class="footer-links" aria-label="Links académicos">
          <a href="#" class="footer-link">Facultades</a>
          <a href="#" class="footer-link">Programas pregrado</a>
          <a href="#" class="footer-link">Posgrados</a>
          <a href="#" class="footer-link">Educación continua</a>
          <a href="#" class="footer-link">Calendario académico</a>
          <a href="#" class="footer-link">Investigación</a>
        </nav>
      </div>

      <!-- Columna servicios -->
      <div class="footer-col">
        <h4>Servicios</h4>
        <nav class="footer-links" aria-label="Links de servicios">
          <a href="#" class="footer-link">Biblioteca</a>
          <a href="#" class="footer-link">Bienestar universitario</a>
          <a href="#" class="footer-link">Egresados</a>
          <a href="#" class="footer-link">Admisiones</a>
          <a href="#" class="footer-link">Pagos en línea</a>
          <a href="/src/pages/auth/admin-login.html" class="footer-link">Portal docentes</a>
        </nav>
      </div>
    </div>

    <!-- Bottom bar -->
    <div class="footer-bottom">
      <p class="footer-copy">
        &copy; ${year} Universidad de Pamplona. Todos los derechos reservados.
        NIT 890.501.572-6 &bull; Norte de Santander, Colombia.
      </p>
      <nav class="footer-legal" aria-label="Links legales">
        <a href="#">Política de privacidad</a>
        <a href="#">Términos de uso</a>
        <a href="#">Accesibilidad</a>
      </nav>
    </div>
  </div>
</footer>`;
}

/* ── Inyector ──────────────────────────────────────────────── */
function injectNavbar() {
  const placeholder = document.getElementById('navbar-placeholder');
  if (placeholder) {
    placeholder.outerHTML = buildNavbar();
  } else {
    const existing = document.querySelector('.navbar');
    if (!existing) {
      const div = document.createElement('div');
      div.innerHTML = buildNavbar();
      document.body.insertBefore(div.firstElementChild, document.body.firstChild);
    }
  }
}

function injectFooter() {
  const placeholder = document.getElementById('footer-placeholder');
  if (placeholder) {
    placeholder.outerHTML = buildFooter();
  } else {
    const existing = document.querySelector('.footer');
    if (!existing) {
      const div = document.createElement('div');
      div.innerHTML = buildFooter();
      document.body.appendChild(div.firstElementChild);
    }
  }
}

/* ── Efecto scroll en navbar ───────────────────────────────── */
function initNavbarScroll() {
  const navbar = document.querySelector('.navbar');
  if (!navbar) return;

  function handleScroll() {
    if (window.scrollY > 10) {
      navbar.classList.add('is-scrolled');
    } else {
      navbar.classList.remove('is-scrolled');
    }
  }

  window.addEventListener('scroll', handleScroll, { passive: true });
  handleScroll();
}

/* ── Toggle menú mobile ────────────────────────────────────── */
function initMobileMenu() {
  document.addEventListener('click', function(e) {
    const toggler = e.target.closest('#navbar-toggler');
    if (toggler) {
      const menu    = document.getElementById('navbar-mobile');
      const isOpen  = toggler.classList.toggle('is-active');
      toggler.setAttribute('aria-expanded', isOpen);
      if (menu) menu.classList.toggle('is-open', isOpen);
    }

    // Cerrar al hacer click fuera
    if (!e.target.closest('.navbar') && !e.target.closest('.navbar-mobile')) {
      const toggler2 = document.getElementById('navbar-toggler');
      const menu2    = document.getElementById('navbar-mobile');
      if (toggler2) { toggler2.classList.remove('is-active'); toggler2.setAttribute('aria-expanded', 'false'); }
      if (menu2)    menu2.classList.remove('is-open');
    }
  });
}

/* ── Toggle sidebar en dashboards ──────────────────────────── */
function initSidebarToggle() {
  const overlay = document.getElementById('sidebar-overlay');

  document.addEventListener('click', function(e) {
    const toggleBtn = e.target.closest('[data-sidebar-toggle]');
    if (toggleBtn) {
      const sidebar = document.getElementById('sidebar');
      if (sidebar) sidebar.classList.toggle('is-open');
      if (overlay) overlay.classList.toggle('is-active');
    }
  });

  if (overlay) {
    overlay.addEventListener('click', function() {
      const sidebar = document.getElementById('sidebar');
      if (sidebar) sidebar.classList.remove('is-open');
      overlay.classList.remove('is-active');
    });
  }
}

/* ── Animaciones reveal con IntersectionObserver ───────────── */
function initReveal() {
  if (!('IntersectionObserver' in window)) {
    // Fallback: mostrar todo inmediatamente
    document.querySelectorAll('[data-reveal]').forEach(function(el) {
      el.classList.add('is-revealed');
    });
    return;
  }

  const observer = new IntersectionObserver(function(entries) {
    entries.forEach(function(entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-revealed');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

  document.querySelectorAll('[data-reveal]').forEach(function(el) {
    const delay = parseInt(el.getAttribute('data-delay') || '0', 10);
    if (!Number.isNaN(delay) && delay > 0) {
      el.style.transitionDelay = delay + 'ms';
    }
    observer.observe(el);
  });
}

/* ── Scroll spy para links del navbar ──────────────────────── */
function initScrollSpy() {
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.navbar-link');
  if (!sections.length || !navLinks.length) return;

  const observer = new IntersectionObserver(function(entries) {
    entries.forEach(function(entry) {
      if (entry.isIntersecting) {
        const id = entry.target.getAttribute('id');
        navLinks.forEach(function(link) {
          const href = link.getAttribute('href') || '';
          link.classList.toggle('is-active', href.includes('#' + id));
        });
      }
    });
  }, { threshold: 0.3 });

  sections.forEach(function(sec) { observer.observe(sec); });
}

/* ── Active sidebar link ───────────────────────────────────── */
function initActiveSidebarLink() {
  const path = window.location.pathname;
  document.querySelectorAll('.sb-nav-link').forEach(function(link) {
    const href = link.getAttribute('href') || '';
    if (href && path.endsWith(href.replace(/^\//, '').replace(/^\.\//, ''))) {
      link.classList.add('is-active');
    }
  });
}

/* ── Init global ───────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', function() {
  injectNavbar();
  injectFooter();
  initNavbarScroll();
  initMobileMenu();
  initSidebarToggle();
  initReveal();
  initScrollSpy();
  initActiveSidebarLink();
});

/* Exportar para uso externo */
window.Layout = {
  injectNavbar,
  injectFooter,
  initReveal,
  initActiveSidebarLink,
};
