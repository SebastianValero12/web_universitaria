/* ============================================================
   ADMIN-LOGIN.JS — Lógica del formulario de acceso institucional
   Universidad de Pamplona SIU
   ============================================================ */

document.addEventListener('DOMContentLoaded', function() {

  /* ── Si ya está autenticado, redirigir ─────────────────── */
  if (typeof Auth !== 'undefined' && Auth.isLoggedIn()) {
    const user = Auth.getUser();
    if (user && typeof Router !== 'undefined') {
      Router.redirectToHome(user.role);
      return;
    }
  }

  /* ── Tabs ──────────────────────────────────────────────── */
  const tabs   = document.querySelectorAll('.login-tab');
  const panels = document.querySelectorAll('.login-panel');

  tabs.forEach(function(tab) {
    tab.addEventListener('click', function() {
      const target = tab.dataset.tab;

      tabs.forEach(function(t) {
        t.classList.remove('is-active');
        t.setAttribute('aria-selected', 'false');
      });
      panels.forEach(function(p) { p.classList.remove('is-active'); });

      tab.classList.add('is-active');
      tab.setAttribute('aria-selected', 'true');

      const panel = document.getElementById('panel-' + target);
      if (panel) panel.classList.add('is-active');

      // Limpiar errores
      clearErrors();
    });
  });

  /* ── Toggle de contraseña ──────────────────────────────── */
  function setupPwdToggle(toggleId, inputId) {
    const toggle = document.getElementById(toggleId);
    const input  = document.getElementById(inputId);
    if (!toggle || !input) return;

    toggle.addEventListener('click', function() {
      input.type = (input.type === 'password') ? 'text' : 'password';
      toggle.setAttribute('aria-label', input.type === 'password' ? 'Mostrar contraseña' : 'Ocultar contraseña');
    });
  }

  setupPwdToggle('staff-pwd-toggle', 'staff-pwd-input');
  setupPwdToggle('super-pwd-toggle', 'super-pwd-input');

  /* ── Mostrar error ─────────────────────────────────────── */
  function showError(type, message) {
    const errorEl = document.getElementById(type + '-error');
    const msgEl   = document.getElementById(type + '-error-msg');
    if (errorEl) errorEl.classList.add('is-visible');
    if (msgEl)   msgEl.textContent = message;
  }

  /* ── Limpiar errores ───────────────────────────────────── */
  function clearErrors() {
    document.querySelectorAll('.login-error').forEach(function(el) {
      el.classList.remove('is-visible');
    });
    document.querySelectorAll('.form-control.is-error').forEach(function(el) {
      el.classList.remove('is-error');
    });
  }

  /* ── Submit del formulario de staff ───────────────────── */
  const staffForm   = document.getElementById('staff-form');
  const staffSubmit = document.getElementById('staff-submit');

  if (staffForm) {
    staffForm.addEventListener('submit', async function(e) {
      e.preventDefault();
      clearErrors();

      const email    = document.getElementById('staff-email-input').value.trim();
      const password = document.getElementById('staff-pwd-input').value;

      if (!email || !password) {
        showError('staff', 'Por favor completa todos los campos.');
        return;
      }

      if (staffSubmit) staffSubmit.classList.add('is-loading');

      try {
        const res = await fetch(Config.API_BASE + '/auth/login/admin', {
          method:  'POST',
          headers: { 'Content-Type': 'application/json' },
          body:    JSON.stringify({ email, password }),
        });
        const data = await res.json();

        if (!res.ok || !data.ok) {
          throw new Error(data.error || 'Credenciales incorrectas.');
        }

        // Guardar sesión
        localStorage.setItem(Config.TOKEN_KEY, data.data.token);
        localStorage.setItem(Config.USER_KEY,  JSON.stringify(data.data.user));

        if (typeof Toast !== 'undefined') {
          Toast.success('Bienvenido, ' + data.data.user.firstName + '.', 'Acceso exitoso');
        }

        setTimeout(function() {
          if (typeof Router !== 'undefined') {
            Router.redirectToHome(data.data.user.role);
          }
        }, 700);

      } catch (err) {
        showError('staff', err.message || 'Error al conectar con el servidor.');
      } finally {
        if (staffSubmit) staffSubmit.classList.remove('is-loading');
      }
    });
  }

  /* ── Submit del formulario de superadmin ──────────────── */
  const superForm   = document.getElementById('super-form');
  const superSubmit = document.getElementById('super-submit');

  if (superForm) {
    superForm.addEventListener('submit', async function(e) {
      e.preventDefault();
      clearErrors();

      const email    = document.getElementById('super-email-input').value.trim();
      const password = document.getElementById('super-pwd-input').value;

      if (!email || !password) {
        showError('super', 'Por favor completa todos los campos.');
        return;
      }

      if (superSubmit) superSubmit.classList.add('is-loading');

      try {
        const res = await fetch(Config.API_BASE + '/auth/login/admin', {
          method:  'POST',
          headers: { 'Content-Type': 'application/json' },
          body:    JSON.stringify({ email, password }),
        });
        const data = await res.json();

        if (!res.ok || !data.ok) {
          throw new Error(data.error || 'Credenciales incorrectas.');
        }

        // Verificar que sea SUPERUSER
        if (data.data.user.role !== 'SUPERUSER') {
          throw new Error('Tu cuenta no tiene permisos de superadministrador.');
        }

        // Guardar sesión
        localStorage.setItem(Config.TOKEN_KEY, data.data.token);
        localStorage.setItem(Config.USER_KEY,  JSON.stringify(data.data.user));

        if (typeof Toast !== 'undefined') {
          Toast.success('Acceso de superadministrador concedido.', 'Bienvenido');
        }

        setTimeout(function() {
          window.location.href = '../../pages/superuser/dashboard.html';
        }, 700);

      } catch (err) {
        showError('super', err.message || 'Error al conectar con el servidor.');
      } finally {
        if (superSubmit) superSubmit.classList.remove('is-loading');
      }
    });
  }

  /* ── Enter entre campos ────────────────────────────────── */
  document.querySelectorAll('.form-control').forEach(function(input) {
    input.addEventListener('keydown', function(e) {
      if (e.key === 'Enter') {
        const form = input.closest('form');
        if (form) form.dispatchEvent(new Event('submit'));
      }
    });
  });
});
