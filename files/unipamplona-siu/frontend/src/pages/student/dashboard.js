/* ============================================================
   STUDENT DASHBOARD.JS — Lógica del portal estudiantil
   Universidad de Pamplona SIU
   ============================================================ */

document.addEventListener('DOMContentLoaded', function() {

  /* ── Guardia de autenticación ──────────────────────────── */
  if (typeof Router !== 'undefined') {
    if (!Router.guard(['STUDENT'])) return;
  }

  /* ── Inicializar componentes ───────────────────────────── */
  initUser();
  initDate();
  initDashboard();

  /* ── Logout ────────────────────────────────────────────── */
  const logoutBtn = document.getElementById('logout-btn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', function() {
      if (typeof Auth !== 'undefined') Auth.logout();
    });
  }

  /* ── Navegación lateral ────────────────────────────────── */
  initSidebarNav();
});

/* ── Datos del usuario ─────────────────────────────────────── */
function initUser() {
  const user = (typeof Auth !== 'undefined') ? Auth.getUser() : null;
  if (!user) return;

  const fullName  = (user.firstName || '') + ' ' + (user.lastName || '');
  const initials  = ((user.firstName || 'E')[0] + (user.lastName || 'S')[0]).toUpperCase();

  const sbName    = document.getElementById('sb-name');
  const sbAvatar  = document.getElementById('sb-avatar');
  const tbAvatar  = document.getElementById('topbar-avatar');
  const welcome   = document.getElementById('welcome-title');

  if (sbName)   sbName.textContent   = fullName;
  if (sbAvatar) sbAvatar.textContent = initials;
  if (tbAvatar) tbAvatar.textContent = initials;
  if (welcome)  welcome.textContent  = 'Bienvenido, ' + (user.firstName || 'estudiante') + '.';
}

/* ── Fecha actual ──────────────────────────────────────────── */
function initDate() {
  const el = document.getElementById('current-date');
  if (!el) return;
  const now = new Date();
  el.textContent = now.toLocaleDateString('es-CO', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
}

/* ── Cargar dashboard ──────────────────────────────────────── */
async function initDashboard() {
  try {
    const data = await Api.student.getDashboard();
    if (data && data.ok) {
      renderStats(data.data.stats);
      renderSchedule(data.data.schedule);
      renderGrades(data.data.grades);
      renderProgress(data.data.progress);
      renderNotices(data.data.announcements);
    }
  } catch (_) {
    renderStats({ subjects: 0, average: '—', credits: 0, attendance: '—' });
    renderSchedule([]);
    renderGrades([]);
    renderProgress({ creditsCompleted: 0, creditsTotal: 160, semestersCompleted: 0, semestersTotal: 10, gpa: '—' });
    renderNotices([]);
    if (typeof Toast !== 'undefined') {
      Toast.warning('No fue posible cargar datos del dashboard desde el servidor.', 'Sin conexión');
    }
  }
}

/* ── Datos de demostración ─────────────────────────────────── */
const DEMO_STATS = {
  subjects:    6,
  average:     '3.8',
  credits:     18,
  attendance:  '94%',
};

const DEMO_SCHEDULE = [
  { day: 'LUN', startTime: '07:00', endTime: '09:00', courseName: 'Cálculo I', room: 'A-201', color: 'blue' },
  { day: 'LUN', startTime: '09:00', endTime: '11:00', courseName: 'Física I',  room: 'Lab-1', color: 'green' },
  { day: 'MAR', startTime: '07:00', endTime: '09:00', courseName: 'Álgebra',   room: 'B-105', color: 'red' },
  { day: 'MAR', startTime: '14:00', endTime: '16:00', courseName: 'Prog. I',   room: 'Sala-C',color: 'amber' },
  { day: 'MIÉ', startTime: '07:00', endTime: '09:00', courseName: 'Cálculo I', room: 'A-201', color: 'blue' },
  { day: 'JUE', startTime: '09:00', endTime: '11:00', courseName: 'Álgebra',   room: 'B-105', color: 'red' },
  { day: 'JUE', startTime: '14:00', endTime: '16:00', courseName: 'Humanid.',  room: 'C-301', color: 'indigo' },
  { day: 'VIE', startTime: '07:00', endTime: '09:00', courseName: 'Física I',  room: 'Lab-1', color: 'green' },
  { day: 'VIE', startTime: '09:00', endTime: '11:00', courseName: 'Prog. I',   room: 'Sala-C',color: 'amber' },
];

const DEMO_GRADES = [
  { code: 'MAT101', name: 'Cálculo Diferencial e Integral', score: 4.2, credits: 4 },
  { code: 'SIS101', name: 'Programación I',                  score: 3.9, credits: 3 },
  { code: 'FIS101', name: 'Física I',                        score: 3.5, credits: 4 },
  { code: 'MAT201', name: 'Álgebra Lineal',                  score: 4.5, credits: 3 },
  { code: 'HUM101', name: 'Humanidades y Ética',             score: 4.0, credits: 2 },
  { code: 'ING101', name: 'Inglés Técnico I',                score: 3.2, credits: 2 },
];

const DEMO_PROGRESS = {
  creditsCompleted: 42,
  creditsTotal:     160,
  semestersCompleted: 3,
  semestersTotal:     10,
  gpa:              '3.82',
};

const DEMO_NOTICES = [
  { title: 'Inicio del periodo académico 2025-I', body: 'Las clases comienzan el 3 de febrero. Verifica tu horario en el portal.', date: 'Hace 2 días', type: 'blue', unread: true },
  { title: 'Fecha límite de pago de matrícula', body: 'El último día para pago sin recargo es el 31 de enero.', date: 'Hace 3 días', type: 'red', unread: true },
  { title: 'Apertura biblioteca virtual', body: 'La biblioteca virtual amplia su catálogo con 5.000 nuevos títulos.', date: 'Hace 5 días', type: 'green', unread: true },
  { title: 'Encuesta de satisfacción estudiantil', body: 'Participa en la encuesta y contribuye a mejorar la calidad educativa.', date: 'Hace 1 semana', type: 'amber', unread: false },
];

/* ── Renderizar stat cards ─────────────────────────────────── */
function renderStats(stats) {
  const grid = document.getElementById('stats-grid');
  if (!grid) return;

  grid.innerHTML = `
    <div class="stat-card stat-blue">
      <div class="stat-icon blue">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
          <path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/>
        </svg>
      </div>
      <div class="stat-info">
        <span class="stat-value">${stats.subjects}</span>
        <span class="stat-label">Materias activas</span>
      </div>
    </div>

    <div class="stat-card stat-green">
      <div class="stat-icon green">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
          <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
        </svg>
      </div>
      <div class="stat-info">
        <span class="stat-value">${stats.average}</span>
        <span class="stat-label">Promedio acumulado</span>
      </div>
    </div>

    <div class="stat-card stat-amber">
      <div class="stat-icon amber">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
          <circle cx="12" cy="12" r="10"/>
          <polyline points="12 6 12 12 16 14"/>
        </svg>
      </div>
      <div class="stat-info">
        <span class="stat-value">${stats.credits}</span>
        <span class="stat-label">Créditos este periodo</span>
      </div>
    </div>

    <div class="stat-card stat-red">
      <div class="stat-icon red">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
          <circle cx="9" cy="7" r="4"/>
          <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
        </svg>
      </div>
      <div class="stat-info">
        <span class="stat-value">${stats.attendance}</span>
        <span class="stat-label">Asistencia global</span>
      </div>
    </div>
  `;
}

/* ── Renderizar horario ────────────────────────────────────── */
function renderSchedule(schedule) {
  const container = document.getElementById('schedule-container');
  if (!container) return;

  const days = ['LUN','MAR','MIÉ','JUE','VIE'];
  const hours = ['07:00','08:00','09:00','10:00','11:00','12:00','14:00','15:00','16:00','17:00','18:00'];

  // Crear mapa: dia+hora → clase
  const map = {};
  (schedule || []).forEach(function(item) {
    const key = item.day + '_' + item.startTime;
    map[key] = item;
  });

  let html = '<table class="schedule-table" role="grid" aria-label="Horario semanal"><thead><tr>';
  html += '<th scope="col">Hora</th>';
  days.forEach(function(d) { html += '<th scope="col">' + d + '</th>'; });
  html += '</tr></thead><tbody>';

  hours.forEach(function(hour) {
    html += '<tr><td>' + hour + '</td>';
    days.forEach(function(day) {
      const key  = day + '_' + hour;
      const item = map[key];
      if (item) {
        html += `<td>
          <div class="schedule-block block-${item.color}" role="gridcell" aria-label="${item.courseName}, ${item.startTime} a ${item.endTime}">
            <span class="schedule-block-name">${item.courseName}</span>
            <span class="schedule-block-room">${item.room}</span>
          </div>
        </td>`;
      } else {
        html += '<td></td>';
      }
    });
    html += '</tr>';
  });

  html += '</tbody></table>';
  container.innerHTML = html;
}

/* ── Renderizar calificaciones ─────────────────────────────── */
function renderGrades(grades) {
  const list = document.getElementById('grades-list');
  if (!list) return;

  if (!grades || !grades.length) {
    list.innerHTML = '<div class="empty-state" style="padding:var(--sp-8);"><p class="empty-state-title">Sin calificaciones registradas</p></div>';
    return;
  }

  const colors = ['red','blue','amber','indigo','pink','green'];

  const html = grades.map(function(g, i) {
    const hasScore = g.score !== null && g.score !== undefined && g.score !== '';
    const score = hasScore ? parseFloat(g.score) : null;
    const cls     = score >= 3.5 ? 'grade-score-pass' : (score >= 3.0 ? 'grade-score-warn' : 'grade-score-fail');
    const pct     = score !== null ? Math.min(100, (score / 5.0) * 100) : 0;
    const barColor= score >= 3.5 ? 'green' : (score >= 3.0 ? 'amber' : 'red');
    const color   = colors[i % colors.length];

    return `
      <div class="grade-item">
        <div class="grade-item-color" style="background: var(--col-${color}-400);"></div>
        <div class="grade-item-info">
          <div class="grade-item-name">${g.name}</div>
          <div class="grade-item-code">${g.code} · ${g.credits} créditos</div>
        </div>
        <div class="grade-item-bar">
          <div class="progress progress-sm">
            <div class="progress-bar ${barColor}" style="width:${pct}%;"></div>
          </div>
        </div>
        <span class="grade-item-score ${hasScore ? cls : ''}">${hasScore ? score.toFixed(1) : '—'}</span>
      </div>
    `;
  }).join('');

  list.innerHTML = html;
}

/* ── Renderizar progreso con donut ─────────────────────────── */
function renderProgress(progress) {
  const details = document.getElementById('progress-details');
  const circle  = document.getElementById('donut-circle');
  const value   = document.getElementById('donut-value');
  if (!details || !circle || !value) return;

  const pct         = Math.round((progress.creditsCompleted / progress.creditsTotal) * 100);
  const circumference = 376.99; // 2π × 60
  const offset      = circumference - (pct / 100) * circumference;

  // Animar con pequeño delay
  setTimeout(function() {
    circle.style.strokeDashoffset = offset;
    value.textContent = pct + '%';
  }, 400);

  details.innerHTML = `
    <div class="progress-row">
      <span class="progress-row-label">Créditos cursados</span>
      <span class="progress-row-value">${progress.creditsCompleted} / ${progress.creditsTotal}</span>
    </div>
    <div class="progress" style="margin-bottom:var(--sp-4);">
      <div class="progress-bar" style="width:${pct}%;"></div>
    </div>
    <div class="progress-row">
      <span class="progress-row-label">Semestres cursados</span>
      <span class="progress-row-value">${progress.semestersCompleted} / ${progress.semestersTotal}</span>
    </div>
    <div class="progress-row">
      <span class="progress-row-label">Promedio acumulado</span>
      <span class="progress-row-value fw-800 text-blue">${progress.gpa}</span>
    </div>
  `;
}

/* ── Renderizar avisos ─────────────────────────────────────── */
function renderNotices(notices) {
  const list = document.getElementById('notices-list');
  if (!list) return;
  if (!notices || !notices.length) {
    list.innerHTML = '<div class="empty-state" style="padding:var(--sp-8);"><p class="empty-state-title">Sin avisos recientes</p></div>';
    return;
  }

  const iconMap = {
    red: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>',
    blue: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>',
    green: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>',
    amber: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/></svg>',
  };

  const html = notices.map(function(n) {
    return `
      <div class="notice-item ${n.unread ? 'is-unread' : ''}" role="article">
        <div class="notice-icon ${mapNoticeType(n)}">${iconMap[mapNoticeType(n)] || iconMap.blue}</div>
        <div class="notice-body">
          <div class="notice-title">${n.title}</div>
          <p class="notice-text">${n.body}</p>
        </div>
        <span class="notice-meta">${formatNoticeDate(n)}</span>
      </div>
    `;
  }).join('');

  list.innerHTML = html;
}

function mapNoticeType(notice) {
  if (notice.type) return notice.type;
  if (notice.priority === 'HIGH') return 'red';
  if (notice.priority === 'LOW') return 'blue';
  return 'amber';
}

function formatNoticeDate(notice) {
  if (notice.date) return notice.date;
  if (!notice.createdAt) return 'Reciente';
  return new Date(notice.createdAt).toLocaleDateString('es-CO', { day: '2-digit', month: 'short' });
}

/* ── Navegación lateral ────────────────────────────────────── */
function initSidebarNav() {
  const links = document.querySelectorAll('.sb-nav-link[data-section]');
  links.forEach(function(link) {
    link.addEventListener('click', function(e) {
      e.preventDefault();
      const sectionId = 'section-' + link.dataset.section;
      const section   = document.getElementById(sectionId);
      if (section) {
        section.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }

      // Actualizar breadcrumb
      const bc = document.getElementById('breadcrumb-current');
      if (bc) bc.textContent = link.textContent.trim();

      // Cerrar sidebar en mobile
      const sidebar = document.getElementById('sidebar');
      const overlay = document.getElementById('sidebar-overlay');
      if (sidebar) sidebar.classList.remove('is-open');
      if (overlay) overlay.classList.remove('is-active');
    });
  });
}
