/* ============================================================
   ROUTER — Guardas de navegación y redirección por rol
   Universidad de Pamplona SIU
   ============================================================ */
const Router = (() => {
  // Mapa de rutas: ruta → roles permitidos (null = público)
  const ROUTES = {
    '/src/pages/student/dashboard.html':   ['STUDENT'],
    '/src/pages/admin/dashboard.html':     ['TEACHER', 'ADMIN'],
    '/src/pages/superuser/dashboard.html': ['SUPERUSER'],
    '/src/pages/auth/admin-login.html':    null, // público
  };

  /* Retorna la URL del home según el rol del usuario */
  function getHomeForRole(role) {
    const map = {
      STUDENT:   '/src/pages/student/dashboard.html',
      TEACHER:   '/src/pages/admin/dashboard.html',
      ADMIN:     '/src/pages/admin/dashboard.html',
      SUPERUSER: '/src/pages/superuser/dashboard.html',
    };
    return map[role] || '/index.html';
  }

  /* Verifica si el usuario actual tiene permiso para la página */
  function guard(allowedRoles) {
    const session = (typeof Auth !== 'undefined') ? Auth.getSession() : null;

    if (!session || !session.token) {
      // No autenticado → login público
      window.location.href = '/index.html';
      return false;
    }

    if (allowedRoles && !allowedRoles.includes(session.user.role)) {
      // Rol incorrecto → redirigir al home del rol
      window.location.href = getHomeForRole(session.user.role);
      return false;
    }

    return true;
  }

  /* Evalúa la ruta actual automáticamente */
  function autoGuard() {
    const path = window.location.pathname;

    for (const [route, roles] of Object.entries(ROUTES)) {
      // Comparar la ruta normalizada
      const normalizedRoute = route.replace(/^\//, '');
      if (path.includes(normalizedRoute)) {
        if (roles === null) return true; // página pública
        return guard(roles);
      }
    }
    return true; // ruta no registrada → permitir
  }

  /* Redirigir al home del rol actual */
  function redirectToHome(role) {
    window.location.href = getHomeForRole(role);
  }

  /* Proteger la ruta actual según la sesión */
  function protectPage(allowedRoles) {
    document.addEventListener('DOMContentLoaded', function() {
      guard(allowedRoles);
    });
  }

  return {
    guard,
    autoGuard,
    redirectToHome,
    getHomeForRole,
    protectPage,
  };
})();
