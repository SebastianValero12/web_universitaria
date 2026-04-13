/* ============================================================
   SERVICES.JS — Configuración, HTTP, Auth, API, Toast, LoginDrawer
   Universidad de Pamplona SIU
   ============================================================ */

/* ────────────────────────────────────────────────────────────
   CONFIGURACIÓN GLOBAL
   ──────────────────────────────────────────────────────────── */
const Config = {
  API_BASE:  'http://localhost:3000/api/v1',
  TOKEN_KEY: 'siu_token',
  USER_KEY:  'siu_user',
};

/* ────────────────────────────────────────────────────────────
   HTTP WRAPPER
   ──────────────────────────────────────────────────────────── */
const Http = (() => {
  /* Construir headers con Authorization si hay token */
  function buildHeaders(extra) {
    const headers = { 'Content-Type': 'application/json' };
    const token = Auth.getToken();
    if (token) headers['Authorization'] = 'Bearer ' + token;
    return Object.assign(headers, extra || {});
  }

  /* Manejar respuesta */
  async function handleResponse(res) {
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      const msg = (data && data.error) ? data.error : `Error ${res.status}`;
      throw new Error(msg);
    }
    return data;
  }

  async function get(path, params) {
    let url = Config.API_BASE + path;
    if (params) {
      const q = new URLSearchParams(params).toString();
      if (q) url += '?' + q;
    }
    const res = await fetch(url, { method: 'GET', headers: buildHeaders() });
    return handleResponse(res);
  }

  async function post(path, body) {
    const res = await fetch(Config.API_BASE + path, {
      method: 'POST',
      headers: buildHeaders(),
      body: JSON.stringify(body),
    });
    return handleResponse(res);
  }

  async function put(path, body) {
    const res = await fetch(Config.API_BASE + path, {
      method: 'PUT',
      headers: buildHeaders(),
      body: JSON.stringify(body),
    });
    return handleResponse(res);
  }

  async function patch(path, body) {
    const res = await fetch(Config.API_BASE + path, {
      method: 'PATCH',
      headers: buildHeaders(),
      body: JSON.stringify(body),
    });
    return handleResponse(res);
  }

  async function del(path) {
    const res = await fetch(Config.API_BASE + path, {
      method: 'DELETE',
      headers: buildHeaders(),
    });
    return handleResponse(res);
  }

  return { get, post, put, patch, delete: del };
})();

/* ────────────────────────────────────────────────────────────
   AUTH SERVICE
   ──────────────────────────────────────────────────────────── */
const Auth = (() => {
  /* Iniciar sesión */
  async function login(email, password, role) {
    const endpoint = (role === 'STUDENT') ? '/auth/login/student' : '/auth/login/admin';
    const data = await Http.post(endpoint, { email, password });
    if (data.ok) {
      localStorage.setItem(Config.TOKEN_KEY, data.data.token);
      localStorage.setItem(Config.USER_KEY,  JSON.stringify(data.data.user));
    }
    return data;
  }

  /* Cerrar sesión */
  async function logout() {
    try {
      await Http.post('/auth/logout', {});
    } catch (_) { /* ignorar error de red */ }
    clearSession();
    window.location.href = '/index.html';
  }

  /* Obtener sesión completa */
  function getSession() {
    const token = localStorage.getItem(Config.TOKEN_KEY);
    const raw   = localStorage.getItem(Config.USER_KEY);
    if (!token || !raw) return null;
    try {
      return { token, user: JSON.parse(raw) };
    } catch (_) {
      return null;
    }
  }

  /* Obtener usuario */
  function getUser() {
    const session = getSession();
    return session ? session.user : null;
  }

  /* Obtener token */
  function getToken() {
    return localStorage.getItem(Config.TOKEN_KEY);
  }

  /* Verificar si está autenticado */
  function isLoggedIn() {
    return !!getToken();
  }

  /* Limpiar sesión */
  function clearSession() {
    localStorage.removeItem(Config.TOKEN_KEY);
    localStorage.removeItem(Config.USER_KEY);
  }

  /* Obtener perfil desde la API */
  async function getProfile() {
    return Http.get('/auth/me');
  }

  return { login, logout, getSession, getUser, getToken, isLoggedIn, clearSession, getProfile };
})();

/* ────────────────────────────────────────────────────────────
   API — Endpoints del sistema
   ──────────────────────────────────────────────────────────── */
const Api = {
  /* ── Auth ─────────────────────────────────────────────── */
  auth: {
    loginStudent: (email, pw)    => Http.post('/auth/login/student', { email, password: pw }),
    loginAdmin:   (email, pw)    => Http.post('/auth/login/admin',   { email, password: pw }),
    logout:       ()             => Http.post('/auth/logout', {}),
    getProfile:   ()             => Http.get('/auth/me'),
  },

  /* ── Estudiante ────────────────────────────────────────── */
  student: {
    getDashboard:    ()             => Http.get('/student/dashboard'),
    getSchedule:     ()             => Http.get('/student/schedule'),
    getGrades:       ()             => Http.get('/student/grades'),
    getCertificates: ()             => Http.get('/student/certificates'),
    requestCert:     (type)         => Http.post('/student/certificates', { type }),
    getProfile:      ()             => Http.get('/student/profile'),
    updateProfile:   (data)         => Http.patch('/student/profile', data),
    getAnnouncements: ()            => Http.get('/student/announcements'),
    submitPQRS:      (data)         => Http.post('/student/pqrs', data),
  },

  /* ── Docente ───────────────────────────────────────────── */
  teacher: {
    getDashboard:   ()              => Http.get('/teacher/dashboard'),
    getGroups:      ()              => Http.get('/teacher/groups'),
    getGroupStudents: (groupId)     => Http.get('/teacher/groups/' + groupId + '/students'),
    uploadGrades:   (groupId, data) => Http.post('/teacher/groups/' + groupId + '/grades', data),
    updateGrade:    (gradeId, data) => Http.patch('/teacher/grades/' + gradeId, data),
    getSchedule:    ()              => Http.get('/teacher/schedule'),
    getProfile:     ()              => Http.get('/teacher/profile'),
  },

  /* ── Admin ─────────────────────────────────────────────── */
  admin: {
    getDashboard:   ()              => Http.get('/admin/dashboard'),
    getStudents:    (params)        => Http.get('/admin/students', params),
    getStudent:     (id)            => Http.get('/admin/students/' + id),
    createEnrollment: (data)        => Http.post('/admin/enrollments', data),
    getReports:     ()              => Http.get('/admin/reports'),
  },

  /* ── Superusuario ──────────────────────────────────────── */
  superuser: {
    getDashboard:   ()              => Http.get('/superuser/dashboard'),
    getUsers:       (params)        => Http.get('/superuser/users', params),
    getUser:        (id)            => Http.get('/superuser/users/' + id),
    createUser:     (data)          => Http.post('/superuser/users', data),
    updateUser:     (id, data)      => Http.put('/superuser/users/' + id, data),
    deleteUser:     (id)            => Http.delete('/superuser/users/' + id),
    toggleStatus:   (id)            => Http.patch('/superuser/users/' + id + '/toggle-status', {}),
    getAuditLogs:   (params)        => Http.get('/superuser/audit-logs', params),
  },
};

/* ────────────────────────────────────────────────────────────
   TOAST SYSTEM
   ──────────────────────────────────────────────────────────── */
const Toast = (() => {
  /* Asegurar contenedor */
  function ensureContainer() {
    let container = document.getElementById('toast-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'toast-container';
      container.className = 'toast-container';
      container.setAttribute('role', 'live');
      container.setAttribute('aria-live', 'polite');
      container.setAttribute('aria-label', 'Notificaciones');
      document.body.appendChild(container);
    }
    return container;
  }

  /* Íconos SVG por tipo */
  const ICONS = {
    success: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>',
    error:   '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>',
    warning: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>',
    info:    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>',
  };

  const TITLES = {
    success: 'Éxito',
    error:   'Error',
    warning: 'Advertencia',
    info:    'Información',
  };

  function show(type, message, title, duration) {
    const container = ensureContainer();
    const t         = duration || 4000;
    const el        = document.createElement('div');
    el.className    = 'toast toast-' + type;
    el.setAttribute('role', 'alert');

    el.innerHTML = `
      <div class="toast-icon">${ICONS[type] || ICONS.info}</div>
      <div class="toast-body">
        <div class="toast-title">${title || TITLES[type]}</div>
        <div class="toast-message">${message}</div>
      </div>
      <button class="toast-close" aria-label="Cerrar notificación">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
        </svg>
      </button>
    `;

    /* Cerrar manualmente */
    el.querySelector('.toast-close').addEventListener('click', function() {
      dismiss(el);
    });

    container.appendChild(el);

    /* Auto-dismiss */
    const timer = setTimeout(function() { dismiss(el); }, t);
    el._dismissTimer = timer;
  }

  function dismiss(el) {
    if (!el.parentNode) return;
    clearTimeout(el._dismissTimer);
    el.classList.add('is-leaving');
    el.addEventListener('animationend', function() {
      if (el.parentNode) el.parentNode.removeChild(el);
    });
    setTimeout(function() {
      if (el.parentNode) el.parentNode.removeChild(el);
    }, 400);
  }

  return {
    success: (msg, title, dur) => show('success', msg, title, dur),
    error:   (msg, title, dur) => show('error',   msg, title, dur),
    warning: (msg, title, dur) => show('warning', msg, title, dur),
    info:    (msg, title, dur) => show('info',    msg, title, dur),
  };
})();

/* ────────────────────────────────────────────────────────────
   LOGIN DRAWER WIDGET
   ──────────────────────────────────────────────────────────── */
const LoginDrawer = (() => {
  let currentTab = 'student';

  function getDrawer()  { return document.getElementById('login-drawer'); }
  function getOverlay() { return document.getElementById('login-overlay'); }

  /* Abrir */
  function open(tab) {
    const drawer  = getDrawer();
    const overlay = getOverlay();
    if (!drawer || !overlay) return;

    drawer.classList.add('is-open');
    overlay.classList.add('is-active');
    document.body.style.overflow = 'hidden';

    if (tab) switchTab(tab);

    // Foco al primer campo
    setTimeout(function() {
      const firstInput = drawer.querySelector('input:not([disabled])');
      if (firstInput) firstInput.focus();
    }, 320);

    // Actualizar aria del botón que lo abrió
    const btn = document.getElementById('open-login-btn');
    if (btn) btn.setAttribute('aria-expanded', 'true');
  }

  /* Cerrar */
  function close() {
    const drawer  = getDrawer();
    const overlay = getOverlay();
    if (!drawer || !overlay) return;

    drawer.classList.remove('is-open');
    overlay.classList.remove('is-active');
    document.body.style.overflow = '';

    clearErrors();

    const btn = document.getElementById('open-login-btn');
    if (btn) { btn.setAttribute('aria-expanded', 'false'); btn.focus(); }
  }

  /* Cambiar pestaña */
  function switchTab(tab) {
    currentTab = tab;
    const drawer = getDrawer();
    if (!drawer) return;

    drawer.querySelectorAll('.drawer-tab').forEach(function(btn) {
      btn.classList.toggle('is-active', btn.dataset.tab === tab);
    });

    drawer.querySelectorAll('.drawer-panel').forEach(function(panel) {
      panel.classList.toggle('is-active', panel.dataset.panel === tab);
    });

    clearErrors();
  }

  /* Limpiar errores */
  function clearErrors() {
    const drawer = getDrawer();
    if (!drawer) return;
    drawer.querySelectorAll('.drawer-error').forEach(function(el) {
      el.classList.remove('is-visible');
    });
    drawer.querySelectorAll('.form-control.is-error').forEach(function(el) {
      el.classList.remove('is-error');
    });
  }

  /* Mostrar error */
  function showError(panelId, message) {
    const panel = document.querySelector('[data-panel="' + panelId + '"]');
    if (!panel) return;
    const errorEl = panel.querySelector('.drawer-error');
    if (errorEl) {
      const msg = errorEl.querySelector('.drawer-error-msg');
      if (msg) msg.textContent = message;
      errorEl.classList.add('is-visible');
    }
  }

  /* Toggle visibilidad contraseña */
  function togglePwd(inputId) {
    const input = document.getElementById(inputId);
    if (!input) return;
    input.type = (input.type === 'password') ? 'text' : 'password';
  }

  /* Submit del formulario */
  async function submit(panelId) {
    const panel = document.querySelector('[data-panel="' + panelId + '"]');
    if (!panel) return;

    const emailInput = panel.querySelector('input[type="email"]');
    const pwInput    = panel.querySelector('input[type="password"], input[data-type="password"]');
    const submitBtn  = panel.querySelector('button[type="submit"]');

    const email    = emailInput ? emailInput.value.trim() : '';
    const password = pwInput    ? pwInput.value           : '';

    // Validación básica
    if (!email || !password) {
      showError(panelId, 'Por favor complete todos los campos.');
      return;
    }

    // Botón loading
    if (submitBtn) submitBtn.classList.add('is-loading');
    clearErrors();

    try {
      const role     = (panelId === 'student') ? 'STUDENT' : 'ADMIN';
      const endpoint = (role === 'STUDENT') ? '/auth/login/student' : '/auth/login/admin';
      const res      = await fetch(Config.API_BASE + endpoint, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ email, password }),
      });
      const data = await res.json();

      if (!res.ok || !data.ok) {
        throw new Error(data.error || 'Credenciales incorrectas');
      }

      // Guardar sesión
      localStorage.setItem(Config.TOKEN_KEY, data.data.token);
      localStorage.setItem(Config.USER_KEY,  JSON.stringify(data.data.user));

      Toast.success('Bienvenido, ' + data.data.user.firstName + '.', 'Acceso exitoso');
      close();

      // Redirigir según rol
      setTimeout(function() {
        if (typeof Router !== 'undefined') {
          Router.redirectToHome(data.data.user.role);
        }
      }, 600);

    } catch (err) {
      showError(panelId, err.message || 'Error al iniciar sesión.');
    } finally {
      if (submitBtn) submitBtn.classList.remove('is-loading');
    }
  }

  /* Inicializar eventos */
  function init() {
    document.addEventListener('click', function(e) {
      // Abrir drawer
      if (e.target.closest('#open-login-btn') || e.target.closest('#open-login-btn-mobile')) {
        open('student');
      }

      // Cerrar
      if (e.target.closest('#drawer-close-btn') || e.target.closest('#login-overlay')) {
        close();
      }

      // Tabs
      const tabBtn = e.target.closest('.drawer-tab');
      if (tabBtn && tabBtn.dataset.tab) {
        switchTab(tabBtn.dataset.tab);
      }

      // Toggle pwd
      const pwToggle = e.target.closest('[data-pwd-toggle]');
      if (pwToggle) {
        togglePwd(pwToggle.dataset.pwdToggle);
      }
    });

    // Tecla Escape
    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape') close();
    });

    // Submit forms
    document.addEventListener('submit', function(e) {
      const form = e.target.closest('[data-drawer-form]');
      if (form) {
        e.preventDefault();
        submit(form.dataset.drawerForm);
      }
    });
  }

  // Inicializar cuando el DOM esté listo
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  return { open, close, switchTab, submit, togglePwd };
})();

/* ── Exportar globales ─────────────────────────────────────── */
window.Config      = Config;
window.Http        = Http;
window.Auth        = Auth;
window.Api         = Api;
window.Toast       = Toast;
window.LoginDrawer = LoginDrawer;
