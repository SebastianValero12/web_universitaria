/* ============================================================
   SUPERUSER DASHBOARD.JS — Gestión total del sistema SIU
   Universidad de Pamplona SIU
   ============================================================ */

/* ── Estado global de la página ───────────────────────────── */
const State = {
  users:       [],
  filteredUsers: [],
  currentPage: 1,
  perPage:     10,
  totalUsers:  0,
  editingId:   null,
  confirmAction: null,
};

document.addEventListener('DOMContentLoaded', function() {

  /* ── Guardia ───────────────────────────────────────────── */
  if (typeof Router !== 'undefined') {
    if (!Router.guard(['SUPERUSER'])) return;
  }

  /* ── Usuario en sidebar ────────────────────────────────── */
  const user = (typeof Auth !== 'undefined') ? Auth.getUser() : null;
  if (user) {
    const fullName = (user.firstName || '') + ' ' + (user.lastName || '');
    const el = document.getElementById('sb-name'); if (el) el.textContent = fullName;
  }

  /* ── Fecha ─────────────────────────────────────────────── */
  const dateEl = document.getElementById('current-date');
  if (dateEl) {
    dateEl.textContent = new Date().toLocaleDateString('es-CO', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
    });
  }

  /* ── Cargar datos ──────────────────────────────────────── */
  loadDashboard();

  /* ── Logout ────────────────────────────────────────────── */
  document.getElementById('logout-btn').addEventListener('click', function() {
    if (typeof Auth !== 'undefined') Auth.logout();
  });

  /* ── Abrir modal crear ─────────────────────────────────── */
  document.querySelectorAll('#create-user-btn, #create-user-btn-2').forEach(function(btn) {
    btn.addEventListener('click', function() { openUserModal(null); });
  });

  /* ── Cerrar modales ────────────────────────────────────── */
  initModals();

  /* ── Filtros de búsqueda ───────────────────────────────── */
  let searchDebounce;
  document.getElementById('users-search').addEventListener('input', function() {
    clearTimeout(searchDebounce);
    searchDebounce = setTimeout(applyFilters, 300);
  });
  document.getElementById('role-filter').addEventListener('change', applyFilters);
  document.getElementById('status-filter').addEventListener('change', applyFilters);

  /* ── Guardar usuario ───────────────────────────────────── */
  document.getElementById('save-user-btn').addEventListener('click', saveUser);

  /* ── Navegación ────────────────────────────────────────── */
  document.querySelectorAll('.sb-nav-link[data-section]').forEach(function(link) {
    link.addEventListener('click', function(e) {
      e.preventDefault();
      const sec = document.getElementById('section-' + link.dataset.section);
      if (sec) sec.scrollIntoView({ behavior: 'smooth', block: 'start' });
      const bc = document.getElementById('breadcrumb-current');
      if (bc) bc.textContent = link.textContent.trim();
    });
  });
});

/* ────────────────────────────────────────────────────────────
   CARGAR DASHBOARD
   ──────────────────────────────────────────────────────────── */
async function loadDashboard() {
  try {
    const [dashRes, usersRes, auditRes] = await Promise.all([
      Api.superuser.getDashboard().catch(function() { return null; }),
      Api.superuser.getUsers({ page: 1, limit: 100 }).catch(function() { return null; }),
      Api.superuser.getAuditLogs({ limit: 20 }).catch(function() { return null; }),
    ]);

    const stats   = (dashRes && dashRes.ok)  ? dashRes.data.stats  : DEMO_STATS;
    const users   = (usersRes && usersRes.ok) ? usersRes.data.users : DEMO_USERS;
    const audits  = (auditRes && auditRes.ok) ? auditRes.data       : DEMO_AUDIT;

    renderStats(stats);
    State.users         = users;
    State.filteredUsers = users;
    State.totalUsers    = users.length;
    renderUsersTable();
    renderAuditTable(audits);

  } catch (_) {
    renderStats(DEMO_STATS);
    State.users         = DEMO_USERS;
    State.filteredUsers = DEMO_USERS;
    State.totalUsers    = DEMO_USERS.length;
    renderUsersTable();
    renderAuditTable(DEMO_AUDIT);
  }
}

/* ────────────────────────────────────────────────────────────
   DATOS DE DEMOSTRACIÓN
   ──────────────────────────────────────────────────────────── */
const DEMO_STATS = { total: 14, students: 3, teachers: 3, admins: 1, superusers: 1 };

const DEMO_USERS = [
  { id:1, code:'SA001', firstName:'Super', lastName:'Admin', email:'superadmin@unipamplona.edu.co', role:'SUPERUSER', status:'ACTIVE' },
  { id:2, code:'20231001', firstName:'Carlos', lastName:'Estudiante Demo', email:'estudiante@unipamplona.edu.co', role:'STUDENT', status:'ACTIVE' },
  { id:3, code:'20231002', firstName:'Valeria', lastName:'Ruiz Morales', email:'valeria.ruiz@unipamplona.edu.co', role:'STUDENT', status:'ACTIVE' },
  { id:4, code:'20231003', firstName:'Andrés', lastName:'Mora Leal', email:'andres.mora@unipamplona.edu.co', role:'STUDENT', status:'ACTIVE' },
  { id:5, code:'T001', firstName:'Juan', lastName:'Pérez González', email:'jperez@unipamplona.edu.co', role:'TEACHER', status:'ACTIVE' },
  { id:6, code:'T002', firstName:'María', lastName:'Martínez Díaz', email:'mmartinez@unipamplona.edu.co', role:'TEACHER', status:'ACTIVE' },
  { id:7, code:'T003', firstName:'Luis', lastName:'Gómez Rueda', email:'lgomez@unipamplona.edu.co', role:'TEACHER', status:'ACTIVE' },
  { id:8, code:'ADM001', firstName:'Secretaria', lastName:'Académica', email:'secretaria@unipamplona.edu.co', role:'ADMIN', status:'ACTIVE' },
];

const DEMO_AUDIT = [
  { id:1, createdAt: new Date().toISOString(), userName:'Super Admin', action:'LOGIN', detail:'Inicio de sesión exitoso', ip:'192.168.1.100' },
  { id:2, createdAt: new Date(Date.now()-300000).toISOString(), userName:'Super Admin', action:'CREATE', detail:'Usuario Carlos Estudiante creado', ip:'192.168.1.100' },
  { id:3, createdAt: new Date(Date.now()-600000).toISOString(), userName:'Super Admin', action:'UPDATE', detail:'Rol de usuario actualizado', ip:'192.168.1.100' },
  { id:4, createdAt: new Date(Date.now()-900000).toISOString(), userName:'Juan Pérez', action:'LOGIN', detail:'Inicio de sesión como docente', ip:'10.0.0.45' },
  { id:5, createdAt: new Date(Date.now()-1200000).toISOString(), userName:'Carlos Estudiante', action:'LOGIN', detail:'Acceso al portal estudiantil', ip:'172.16.0.12' },
  { id:6, createdAt: new Date(Date.now()-1800000).toISOString(), userName:'Super Admin', action:'DISABLE', detail:'Usuario suspendido por inactividad', ip:'192.168.1.100' },
  { id:7, createdAt: new Date(Date.now()-3600000).toISOString(), userName:'Super Admin', action:'ENABLE', detail:'Usuario reactivado', ip:'192.168.1.100' },
  { id:8, createdAt: new Date(Date.now()-7200000).toISOString(), userName:'María Martínez', action:'LOGOUT', detail:'Cierre de sesión', ip:'10.0.0.55' },
];

/* ────────────────────────────────────────────────────────────
   RENDERIZADO
   ──────────────────────────────────────────────────────────── */
function renderStats(stats) {
  const grid = document.getElementById('stats-grid');
  if (!grid) return;

  grid.innerHTML = `
    <div class="stat-card stat-blue">
      <div class="stat-icon blue">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
          <circle cx="9" cy="7" r="4"/>
          <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
        </svg>
      </div>
      <div class="stat-info">
        <span class="stat-value">${stats.total || 0}</span>
        <span class="stat-label">Total de usuarios</span>
      </div>
    </div>

    <div class="stat-card stat-green">
      <div class="stat-icon green">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
          <path d="M22 10v6M2 10l10-5 10 5-10 5z"/>
        </svg>
      </div>
      <div class="stat-info">
        <span class="stat-value">${stats.students || 0}</span>
        <span class="stat-label">Estudiantes</span>
      </div>
    </div>

    <div class="stat-card stat-amber">
      <div class="stat-icon amber">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
          <circle cx="12" cy="7" r="4"/>
        </svg>
      </div>
      <div class="stat-info">
        <span class="stat-value">${stats.teachers || 0}</span>
        <span class="stat-label">Docentes activos</span>
      </div>
    </div>

    <div class="stat-card stat-red">
      <div class="stat-icon red">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
          <circle cx="12" cy="12" r="3"/>
          <path d="M19.07 4.93a10 10 0 0 1 0 14.14M4.93 4.93a10 10 0 0 0 0 14.14"/>
        </svg>
      </div>
      <div class="stat-info">
        <span class="stat-value">${(stats.admins || 0) + (stats.superusers || 0)}</span>
        <span class="stat-label">Admins y superusers</span>
      </div>
    </div>
  `;
}

/* ── Tabla de usuarios ─────────────────────────────────────── */
function renderUsersTable() {
  const tbody = document.getElementById('users-tbody');
  const info  = document.getElementById('users-info');
  if (!tbody) return;

  const { filteredUsers, currentPage, perPage } = State;
  const start = (currentPage - 1) * perPage;
  const page  = filteredUsers.slice(start, start + perPage);

  if (info) info.textContent = `Mostrando ${Math.min(start + 1, filteredUsers.length)}–${Math.min(start + perPage, filteredUsers.length)} de ${filteredUsers.length} usuarios`;

  if (!page.length) {
    tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;padding:var(--sp-8);">Sin usuarios que coincidan con el filtro.</td></tr>';
    renderPagination();
    return;
  }

  tbody.innerHTML = page.map(function(u) {
    const initials = ((u.firstName || 'U')[0] + (u.lastName || 'S')[0]).toUpperCase();
    const roleBadge  = roleBadgeHTML(u.role);
    const statusBadge = statusBadgeHTML(u.status);

    return `
      <tr data-user-id="${u.id}">
        <td>
          <div class="user-name-cell">
            <div class="avatar avatar-sm ${avatarClass(u.role)}">${initials}</div>
            <div>
              <div class="user-name-text">${u.firstName} ${u.lastName}</div>
              <div class="user-sub-text">${u.email}</div>
            </div>
          </div>
        </td>
        <td><span class="user-code">${u.code || '—'}</span></td>
        <td class="ellipsis" style="max-width:200px;">${u.email}</td>
        <td>${roleBadge}</td>
        <td>${statusBadge}</td>
        <td>
          <div class="table-actions">
            <button class="btn btn-ghost btn-icon" title="Editar usuario"
              onclick="openUserModal(${u.id})" aria-label="Editar ${u.firstName}">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:16px;height:16px;">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
              </svg>
            </button>
            <button class="btn btn-ghost btn-icon" title="${u.status === 'ACTIVE' ? 'Desactivar' : 'Activar'}"
              onclick="toggleUserStatus(${u.id}, '${u.status}', '${u.firstName}')"
              aria-label="${u.status === 'ACTIVE' ? 'Desactivar' : 'Activar'} a ${u.firstName}">
              ${u.status === 'ACTIVE'
                ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:16px;height:16px;color:var(--col-warning);"><circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/></svg>'
                : '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:16px;height:16px;color:var(--col-success);"><polyline points="20 6 9 17 4 12"/></svg>'
              }
            </button>
            <button class="btn btn-ghost btn-icon" title="Eliminar usuario"
              onclick="confirmDeleteUser(${u.id}, '${u.firstName} ${u.lastName}')"
              aria-label="Eliminar a ${u.firstName} ${u.lastName}">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:16px;height:16px;color:var(--col-danger);">
                <polyline points="3 6 5 6 21 6"/>
                <path d="M19 6l-1 14H6L5 6"/>
                <path d="M10 11v6M14 11v6"/>
                <path d="M9 6V4h6v2"/>
              </svg>
            </button>
          </div>
        </td>
      </tr>
    `;
  }).join('');

  renderPagination();
}

/* ── Paginación ────────────────────────────────────────────── */
function renderPagination() {
  const nav    = document.getElementById('users-pagination');
  if (!nav) return;

  const total = Math.ceil(State.filteredUsers.length / State.perPage);
  const cur   = State.currentPage;

  let html = `<button class="page-btn" ${cur === 1 ? 'disabled' : ''} onclick="goPage(${cur - 1})" aria-label="Anterior">&#8249;</button>`;

  for (let i = 1; i <= total; i++) {
    if (total > 7 && i > 2 && i < total - 1 && Math.abs(i - cur) > 1) {
      if (i === 3 || i === total - 2) html += '<span class="page-info">…</span>';
      continue;
    }
    html += `<button class="page-btn ${i === cur ? 'is-active' : ''}" onclick="goPage(${i})" aria-label="Página ${i}" aria-current="${i === cur ? 'page' : 'false'}">${i}</button>`;
  }

  html += `<button class="page-btn" ${cur === total || total === 0 ? 'disabled' : ''} onclick="goPage(${cur + 1})" aria-label="Siguiente">&#8250;</button>`;
  nav.innerHTML = html;
}

window.goPage = function(page) {
  State.currentPage = page;
  renderUsersTable();
};

/* ── Audit table ───────────────────────────────────────────── */
function renderAuditTable(logs) {
  const tbody = document.getElementById('audit-tbody');
  const count = document.getElementById('audit-count');
  if (!tbody) return;

  if (count) count.textContent = (logs ? logs.length : 0) + ' registros';

  if (!logs || !logs.length) {
    tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;padding:var(--sp-6);">Sin registros.</td></tr>';
    return;
  }

  tbody.innerHTML = logs.map(function(log) {
    const dt  = new Date(log.createdAt).toLocaleString('es-CO', { dateStyle: 'short', timeStyle: 'short' });
    const badge = auditBadgeHTML(log.action);
    return `
      <tr>
        <td style="white-space:nowrap;font-size:var(--text-xs);">${dt}</td>
        <td>${log.userName || '—'}</td>
        <td>${badge}</td>
        <td style="font-size:var(--text-sm);">${log.detail || '—'}</td>
        <td><span class="audit-ip">${log.ip || '—'}</span></td>
      </tr>
    `;
  }).join('');
}

/* ────────────────────────────────────────────────────────────
   HELPERS DE BADGES
   ──────────────────────────────────────────────────────────── */
function roleBadgeHTML(role) {
  const map = {
    STUDENT:   ['badge-blue',  'Estudiante'],
    TEACHER:   ['badge-green', 'Docente'],
    ADMIN:     ['badge-amber', 'Admin'],
    SUPERUSER: ['badge-red',   'Superuser'],
  };
  const [cls, label] = map[role] || ['badge-gray', role];
  return `<span class="badge ${cls} badge-no-dot">${label}</span>`;
}

function statusBadgeHTML(status) {
  const dot = `<span class="status-dot ${status === 'ACTIVE' ? 'active' : 'suspended'}" style="margin-right:6px;"></span>`;
  const map = {
    ACTIVE:    ['text-success', 'Activo'],
    INACTIVE:  ['text-gray',    'Inactivo'],
    SUSPENDED: ['text-danger',  'Suspendido'],
  };
  const [cls, label] = map[status] || ['text-gray', status];
  return `<span class="${cls} fw-600 text-size-sm flex items-center">${dot}${label}</span>`;
}

function auditBadgeHTML(action) {
  const map = {
    LOGIN:   'audit-badge-login',
    LOGOUT:  'audit-badge-logout',
    CREATE:  'audit-badge-create',
    UPDATE:  'audit-badge-update',
    DELETE:  'audit-badge-delete',
    DISABLE: 'audit-badge-disable',
    ENABLE:  'audit-badge-enable',
  };
  const cls = map[action] || 'badge-gray';
  return `<span class="badge badge-no-dot ${cls}">${action}</span>`;
}

function avatarClass(role) {
  const map = { STUDENT: 'avatar-blue', TEACHER: '', ADMIN: 'avatar-red', SUPERUSER: '' };
  return map[role] || 'avatar-blue';
}

/* ────────────────────────────────────────────────────────────
   FILTROS
   ──────────────────────────────────────────────────────────── */
function applyFilters() {
  const query  = (document.getElementById('users-search').value || '').toLowerCase();
  const role   = document.getElementById('role-filter').value;
  const status = document.getElementById('status-filter').value;

  State.filteredUsers = State.users.filter(function(u) {
    const matchQ = !query ||
      (u.firstName + ' ' + u.lastName).toLowerCase().includes(query) ||
      (u.email || '').toLowerCase().includes(query) ||
      (u.code  || '').toLowerCase().includes(query);
    const matchR = !role   || u.role   === role;
    const matchS = !status || u.status === status;
    return matchQ && matchR && matchS;
  });

  State.currentPage = 1;
  renderUsersTable();
}

/* ────────────────────────────────────────────────────────────
   MODAL DE USUARIO
   ──────────────────────────────────────────────────────────── */
window.openUserModal = function(userId) {
  State.editingId = userId;
  const modal   = document.getElementById('user-modal');
  const overlay = document.getElementById('user-overlay');
  const title   = document.getElementById('user-modal-title');
  const errDiv  = document.getElementById('user-modal-error');

  if (errDiv) errDiv.style.display = 'none';

  if (userId) {
    // Editar usuario existente
    const u = State.users.find(function(x) { return x.id === userId; });
    if (!u) return;

    if (title) title.textContent = 'Editar usuario';
    document.getElementById('user-id').value        = u.id;
    document.getElementById('user-firstname').value = u.firstName;
    document.getElementById('user-lastname').value  = u.lastName;
    document.getElementById('user-email').value     = u.email;
    document.getElementById('user-role').value      = u.role;
    document.getElementById('user-password').value  = '';
    document.getElementById('user-password').required = false;

  } else {
    // Nuevo usuario
    if (title) title.textContent = 'Crear usuario';
    document.getElementById('user-id').value        = '';
    document.getElementById('user-firstname').value = '';
    document.getElementById('user-lastname').value  = '';
    document.getElementById('user-email').value     = '';
    document.getElementById('user-role').value      = '';
    document.getElementById('user-password').value  = '';
    document.getElementById('user-password').required = true;
  }

  overlay.classList.add('is-active');
  modal.classList.add('is-active');
  document.getElementById('user-firstname').focus();
};

/* ── Guardar usuario ───────────────────────────────────────── */
async function saveUser() {
  const errDiv = document.getElementById('user-modal-error');
  const btn    = document.getElementById('save-user-btn');

  const id        = document.getElementById('user-id').value;
  const firstName = document.getElementById('user-firstname').value.trim();
  const lastName  = document.getElementById('user-lastname').value.trim();
  const email     = document.getElementById('user-email').value.trim();
  const role      = document.getElementById('user-role').value;
  const password  = document.getElementById('user-password').value;

  if (!firstName || !lastName || !email || !role) {
    showModalError(errDiv, 'Completa todos los campos obligatorios.');
    return;
  }

  if (!id && !password) {
    showModalError(errDiv, 'La contraseña es obligatoria para crear un usuario.');
    return;
  }

  btn.classList.add('is-loading');
  if (errDiv) errDiv.style.display = 'none';

  const payload = { firstName, lastName, email, role };
  if (password) payload.password = password;

  try {
    let savedUser;
    if (id) {
      const res = await Api.superuser.updateUser(id, payload);
      savedUser = res.data;
    } else {
      const res = await Api.superuser.createUser(payload);
      savedUser = res.data;
    }

    // Actualizar lista local
    if (id) {
      const idx = State.users.findIndex(function(u) { return u.id === parseInt(id); });
      if (idx >= 0) State.users[idx] = Object.assign(State.users[idx], payload);
    } else {
      savedUser = Object.assign({ id: Date.now(), code: 'NEW', status: 'ACTIVE' }, payload);
      State.users.unshift(savedUser);
    }

    State.filteredUsers = State.users;
    renderUsersTable();
    closeUserModal();
    if (typeof Toast !== 'undefined') {
      Toast.success(id ? 'Usuario actualizado.' : 'Usuario creado correctamente.', 'Guardado');
    }

  } catch (err) {
    // Demo fallback
    if (!id) {
      const newUser = { id: Date.now(), code: 'NEW', status: 'ACTIVE', firstName, lastName, email, role };
      State.users.unshift(newUser);
      State.filteredUsers = State.users;
      renderUsersTable();
      closeUserModal();
      if (typeof Toast !== 'undefined') Toast.success('Usuario creado (modo demo).', 'Guardado');
    } else {
      showModalError(errDiv, err.message || 'Error al guardar.');
    }
  } finally {
    btn.classList.remove('is-loading');
  }
}

function showModalError(el, msg) {
  if (!el) return;
  el.textContent = msg;
  el.style.display = 'flex';
  el.classList.add('is-visible');
}

function closeUserModal() {
  document.getElementById('user-modal').classList.remove('is-active');
  document.getElementById('user-overlay').classList.remove('is-active');
}

/* ── Toggle estado ─────────────────────────────────────────── */
window.toggleUserStatus = function(userId, currentStatus, userName) {
  const action = currentStatus === 'ACTIVE' ? 'desactivar' : 'activar';
  openConfirm(
    '¿Estás seguro de que deseas ' + action + ' al usuario <strong>' + userName + '</strong>?',
    currentStatus === 'ACTIVE' ? 'warning' : 'success',
    async function() {
      try {
        await Api.superuser.toggleStatus(userId);
      } catch (_) { /* demo */ }

      const u = State.users.find(function(x) { return x.id === userId; });
      if (u) u.status = (currentStatus === 'ACTIVE') ? 'SUSPENDED' : 'ACTIVE';
      State.filteredUsers = State.users;
      renderUsersTable();
      if (typeof Toast !== 'undefined') Toast.success('Estado del usuario actualizado.', 'Actualizado');
    }
  );
};

/* ── Confirmar eliminación ─────────────────────────────────── */
window.confirmDeleteUser = function(userId, userName) {
  openConfirm(
    '¿Eliminar permanentemente al usuario <strong>' + userName + '</strong>? Esta acción no se puede deshacer.',
    'danger',
    async function() {
      try {
        await Api.superuser.deleteUser(userId);
      } catch (_) { /* demo */ }

      State.users         = State.users.filter(function(u) { return u.id !== userId; });
      State.filteredUsers = State.filteredUsers.filter(function(u) { return u.id !== userId; });
      renderUsersTable();
      if (typeof Toast !== 'undefined') Toast.success('Usuario eliminado.', 'Eliminado');
    }
  );
};

/* ────────────────────────────────────────────────────────────
   MODAL DE CONFIRMACIÓN
   ──────────────────────────────────────────────────────────── */
function openConfirm(message, type, callback) {
  State.confirmAction = callback;

  const modal   = document.getElementById('confirm-modal');
  const overlay = document.getElementById('confirm-overlay');
  const msgEl   = document.getElementById('confirm-message');
  const iconEl  = document.getElementById('confirm-icon');
  const okBtn   = document.getElementById('ok-confirm');

  msgEl.innerHTML = message;

  const iconMap = {
    danger: { icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:28px;height:28px;"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/></svg>', bg: 'background:var(--col-red-100);color:var(--col-red-700);' },
    warning:{ icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:28px;height:28px;"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/></svg>', bg: 'background:var(--col-warning-bg);color:#e08800;' },
    success:{ icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:28px;height:28px;"><polyline points="20 6 9 17 4 12"/></svg>', bg: 'background:var(--col-success-bg);color:var(--col-success);' },
  };

  const ic = iconMap[type] || iconMap.warning;
  iconEl.innerHTML = ic.icon;
  iconEl.setAttribute('style', ic.bg + 'margin:0 auto var(--sp-4);width:56px;height:56px;border-radius:50%;display:flex;align-items:center;justify-content:center;');

  okBtn.className = type === 'danger' ? 'btn btn-danger' : 'btn btn-primary';

  overlay.classList.add('is-active');
  modal.classList.add('is-active');
}

/* ────────────────────────────────────────────────────────────
   INICIALIZAR MODALES
   ──────────────────────────────────────────────────────────── */
function initModals() {
  // Cerrar modal usuario
  document.querySelectorAll('#close-user-modal, #cancel-user-modal').forEach(function(btn) {
    btn.addEventListener('click', closeUserModal);
  });
  document.getElementById('user-overlay').addEventListener('click', closeUserModal);

  // Cerrar confirm modal
  const cancelConfirm = document.getElementById('cancel-confirm');
  const confirmOverlay= document.getElementById('confirm-overlay');
  const okConfirm     = document.getElementById('ok-confirm');
  const confirmModal  = document.getElementById('confirm-modal');

  function closeConfirm() {
    confirmModal.classList.remove('is-active');
    document.getElementById('confirm-overlay').classList.remove('is-active');
    State.confirmAction = null;
  }

  if (cancelConfirm) cancelConfirm.addEventListener('click', closeConfirm);
  if (confirmOverlay) confirmOverlay.addEventListener('click', closeConfirm);
  if (okConfirm) {
    okConfirm.addEventListener('click', function() {
      if (typeof State.confirmAction === 'function') State.confirmAction();
      closeConfirm();
    });
  }

  // ESC cierra modales
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
      closeUserModal();
      closeConfirm();
    }
  });
}
