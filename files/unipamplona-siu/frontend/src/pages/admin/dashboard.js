/* ============================================================
   ADMIN DASHBOARD.JS — Portal docente y administrativo
   Universidad de Pamplona SIU
   ============================================================ */

document.addEventListener('DOMContentLoaded', function() {

  /* ── Guardia ───────────────────────────────────────────── */
  if (typeof Router !== 'undefined') {
    if (!Router.guard(['TEACHER', 'ADMIN'])) return;
  }

  /* ── Usuario ───────────────────────────────────────────── */
  const user = (typeof Auth !== 'undefined') ? Auth.getUser() : null;
  if (user) {
    const fullName = (user.firstName || '') + ' ' + (user.lastName || '');
    const initials = ((user.firstName || 'D')[0] + (user.lastName || 'C')[0]).toUpperCase();
    const rolLabel = user.role === 'ADMIN' ? 'Administrador' : 'Docente';

    const el = document.getElementById('sb-name');       if (el) el.textContent = fullName;
    const av = document.getElementById('sb-avatar');     if (av) av.textContent = initials;
    const ta = document.getElementById('topbar-avatar'); if (ta) ta.textContent = initials;
    const wl = document.getElementById('welcome-title'); if (wl) wl.textContent = 'Bienvenido, ' + (user.firstName || 'docente') + '.';
    const rl = document.getElementById('sb-role');       if (rl) rl.textContent = rolLabel;
    const rll= document.getElementById('sb-role-label'); if (rll) rll.textContent = 'Portal ' + rolLabel;
  }

  /* ── Fecha ─────────────────────────────────────────────── */
  const dateEl = document.getElementById('current-date');
  if (dateEl) {
    dateEl.textContent = new Date().toLocaleDateString('es-CO', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    });
  }

  /* ── Cargar datos ──────────────────────────────────────── */
  loadDashboard();

  /* ── Logout ────────────────────────────────────────────── */
  const logoutBtn = document.getElementById('logout-btn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', function() {
      if (typeof Auth !== 'undefined') Auth.logout();
    });
  }

  /* ── Modal de calificaciones ───────────────────────────── */
  initGradeModal();

  /* ── Búsqueda de estudiantes ───────────────────────────── */
  const searchInput = document.getElementById('student-search');
  if (searchInput) {
    let debounce;
    searchInput.addEventListener('input', function() {
      clearTimeout(debounce);
      debounce = setTimeout(function() {
        filterStudents(searchInput.value);
      }, 300);
    });
  }

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

/* ── Datos demo ────────────────────────────────────────────── */
const DEMO_GROUPS = [
  { id: 1, code: 'A', courseName: 'Cálculo Diferencial e Integral', courseCode: 'MAT101', studentCount: 28, room: 'A-201' },
  { id: 2, code: 'B', courseName: 'Álgebra Lineal',                  courseCode: 'MAT201', studentCount: 25, room: 'B-105' },
  { id: 3, code: 'A', courseName: 'Programación I',                  courseCode: 'SIS101', studentCount: 30, room: 'Lab-C' },
];

const DEMO_STUDENTS = [
  { id: 1, code: '20231001', firstName: 'Valeria', lastName: 'Ruiz Morales', groupCode: 'MAT101-A', score: 4.2 },
  { id: 2, code: '20231002', firstName: 'Andrés',  lastName: 'Mora Leal',    groupCode: 'MAT101-A', score: 3.8 },
  { id: 3, code: '20231003', firstName: 'Juan',    lastName: 'García Pérez',  groupCode: 'MAT101-A', score: 2.9 },
  { id: 4, code: '20231004', firstName: 'María',   lastName: 'López Torres',  groupCode: 'MAT201-B', score: 4.5 },
  { id: 5, code: '20231005', firstName: 'Carlos',  lastName: 'Hernández',     groupCode: 'SIS101-A', score: 3.5 },
];

/* ── Cargar dashboard ──────────────────────────────────────── */
async function loadDashboard() {
  try {
    const data = await Api.teacher.getDashboard();
    if (data && data.ok) {
      renderStats(data.data.stats);
      renderGroups(data.data.groups);
      renderStudents(data.data.students);
    }
  } catch (_) {
    renderStats({ groups: DEMO_GROUPS.length, students: 83, gradesPending: 12, avgScore: '3.8' });
    renderGroups(DEMO_GROUPS);
    renderStudents(DEMO_STUDENTS);
  }
}

/* ── Stat cards ────────────────────────────────────────────── */
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
        <span class="stat-value">${stats.groups || 0}</span>
        <span class="stat-label">Grupos asignados</span>
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
        <span class="stat-label">Estudiantes totales</span>
      </div>
    </div>
    <div class="stat-card stat-amber">
      <div class="stat-icon amber">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
        </svg>
      </div>
      <div class="stat-info">
        <span class="stat-value">${stats.gradesPending || 0}</span>
        <span class="stat-label">Notas pendientes</span>
      </div>
    </div>
    <div class="stat-card stat-red">
      <div class="stat-icon red">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
          <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
        </svg>
      </div>
      <div class="stat-info">
        <span class="stat-value">${stats.avgScore || '—'}</span>
        <span class="stat-label">Promedio general</span>
      </div>
    </div>
  `;
}

/* ── Grupos ────────────────────────────────────────────────── */
function renderGroups(groups) {
  const list   = document.getElementById('groups-list');
  const select = document.getElementById('group-select');
  if (!list) return;

  if (!groups || !groups.length) {
    list.innerHTML = '<div class="empty-state" style="padding:var(--sp-8);"><p class="empty-state-title">Sin grupos asignados</p></div>';
    return;
  }

  // Poblar select
  if (select) {
    groups.forEach(function(g) {
      const opt = document.createElement('option');
      opt.value = g.id;
      opt.textContent = g.courseCode + '-' + g.code + ': ' + g.courseName;
      select.appendChild(opt);
    });

    select.addEventListener('change', function() {
      const gid   = parseInt(select.value);
      const group = groups.find(function(g) { return g.id === gid; });
      if (group) loadGroupStudents(group);
    });
  }

  list.innerHTML = groups.map(function(g) {
    return `
      <div class="group-item" data-group-id="${g.id}">
        <div class="group-icon">${g.code}</div>
        <div class="group-info">
          <div class="group-name">${g.courseName}</div>
          <div class="group-meta">${g.courseCode} · Aula ${g.room}</div>
        </div>
        <span class="group-count">${g.studentCount} estudiantes</span>
        <span class="badge badge-blue badge-no-dot">Activo</span>
      </div>
    `;
  }).join('');
}

/* ── Cargar estudiantes del grupo seleccionado ─────────────── */
async function loadGroupStudents(group) {
  const body = document.getElementById('grades-upload-body');
  if (!body) return;

  body.innerHTML = '<div class="spinner" style="margin:var(--sp-8) auto;"></div>';

  try {
    const data = await Api.teacher.getGroupStudents(group.id);
    const students = (data && data.ok) ? data.data : DEMO_STUDENTS;
    renderGradeUploadTable(group, students);
  } catch (_) {
    renderGradeUploadTable(group, DEMO_STUDENTS);
  }
}

/* ── Tabla de carga de notas ───────────────────────────────── */
function renderGradeUploadTable(group, students) {
  const body = document.getElementById('grades-upload-body');
  if (!body) return;

  const rows = students.map(function(s) {
    const score = s.score || '';
    const cls   = score >= 3.5 ? 'text-success' : (score >= 3.0 ? 'text-warning' : (score ? 'text-danger' : ''));
    return `
      <tr>
        <td>
          <div class="student-name-cell">
            <div class="avatar avatar-sm avatar-blue">${(s.firstName[0] + s.lastName[0]).toUpperCase()}</div>
            <span>${s.firstName} ${s.lastName}</span>
          </div>
        </td>
        <td><span class="student-code">${s.code}</span></td>
        <td><span class="${cls} fw-700">${score || '—'}</span></td>
        <td>
          <button class="btn btn-ghost btn-sm" onclick="openGradeModal(${s.id}, '${s.firstName} ${s.lastName}', ${score || 0})">
            Editar nota
          </button>
        </td>
      </tr>
    `;
  }).join('');

  body.innerHTML = `
    <p class="mb-4 text-gray text-size-sm">Grupo: <strong>${group.courseCode}-${group.code} · ${group.courseName}</strong> · ${students.length} estudiantes</p>
    <div class="table-wrapper">
      <table class="table" aria-label="Notas del grupo">
        <thead><tr>
          <th scope="col">Estudiante</th>
          <th scope="col">Código</th>
          <th scope="col">Nota actual</th>
          <th scope="col">Acción</th>
        </tr></thead>
        <tbody>${rows}</tbody>
      </table>
    </div>
  `;
}

/* ── Tabla de todos los estudiantes ───────────────────────── */
function renderStudents(students) {
  const tbody = document.getElementById('students-tbody');
  if (!tbody) return;

  if (!students || !students.length) {
    tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;padding:var(--sp-8);">Sin estudiantes.</td></tr>';
    return;
  }

  tbody.innerHTML = students.map(function(s) {
    const score = s.score || 0;
    const cls   = score >= 3.5 ? 'text-success' : (score >= 3.0 ? 'text-warning' : 'text-danger');
    return `
      <tr>
        <td>
          <div class="student-name-cell">
            <div class="avatar avatar-sm avatar-blue">${(s.firstName[0] + s.lastName[0]).toUpperCase()}</div>
            ${s.firstName} ${s.lastName}
          </div>
        </td>
        <td><span class="student-code">${s.code}</span></td>
        <td>${s.groupCode || '—'}</td>
        <td><span class="${cls} fw-700">${score || '—'}</span></td>
        <td><span class="badge badge-green">Activo</span></td>
      </tr>
    `;
  }).join('');

  // Guardar referencia para búsqueda
  window._allStudentsHTML = students;
}

/* ── Filtrar estudiantes ───────────────────────────────────── */
function filterStudents(query) {
  const tbody = document.getElementById('students-tbody');
  if (!tbody || !window._allStudentsHTML) return;

  const q = query.toLowerCase();
  const students = window._allStudentsHTML;

  const filtered = students.filter(function(s) {
    return (
      (s.firstName + ' ' + s.lastName).toLowerCase().includes(q) ||
      s.code.toLowerCase().includes(q) ||
      (s.groupCode || '').toLowerCase().includes(q)
    );
  });

  renderStudents(filtered);
}

/* ── Modal de calificación ─────────────────────────────────── */
function initGradeModal() {
  const overlay  = document.getElementById('modal-overlay');
  const modal    = document.getElementById('grade-modal');
  const closeBtns= document.querySelectorAll('#close-grade-modal, #cancel-grade-modal');
  const saveBtn  = document.getElementById('save-grade-btn');

  closeBtns.forEach(function(btn) {
    btn.addEventListener('click', function() {
      if (modal)   modal.classList.remove('is-active');
      if (overlay) overlay.classList.remove('is-active');
    });
  });

  if (overlay) {
    overlay.addEventListener('click', function() {
      if (modal) modal.classList.remove('is-active');
      overlay.classList.remove('is-active');
    });
  }

  if (saveBtn) {
    saveBtn.addEventListener('click', async function() {
      const enrollId = document.getElementById('grade-enrollment-id').value;
      const score    = parseFloat(document.getElementById('grade-score').value);
      const remarks  = document.getElementById('grade-remarks').value;

      if (isNaN(score) || score < 0 || score > 5) {
        if (typeof Toast !== 'undefined') Toast.warning('Ingresa una nota entre 0.0 y 5.0.', 'Nota inválida');
        return;
      }

      saveBtn.classList.add('is-loading');
      try {
        // Intentar guardar en API, si falla mostrar éxito demo
        await Api.teacher.updateGrade(enrollId || 1, { score, remarks });
        if (typeof Toast !== 'undefined') Toast.success('Calificación guardada correctamente.', 'Guardado');
      } catch (_) {
        // Demo: mostrar éxito igual
        if (typeof Toast !== 'undefined') Toast.success('Calificación guardada (modo demo).', 'Guardado');
      }
      saveBtn.classList.remove('is-loading');
      if (modal)   modal.classList.remove('is-active');
      if (overlay) overlay.classList.remove('is-active');
    });
  }
}

/* ── Abrir modal de nota (global) ──────────────────────────── */
window.openGradeModal = function(studentId, studentName, currentScore) {
  const overlay  = document.getElementById('modal-overlay');
  const modal    = document.getElementById('grade-modal');
  const nameInput= document.getElementById('grade-student-name');
  const scoreInp = document.getElementById('grade-score');
  const enrollId = document.getElementById('grade-enrollment-id');

  if (nameInput) nameInput.value  = studentName;
  if (scoreInp)  scoreInp.value   = currentScore || '';
  if (enrollId)  enrollId.value   = studentId;

  if (overlay) overlay.classList.add('is-active');
  if (modal)   modal.classList.add('is-active');
  if (scoreInp) scoreInp.focus();
};
