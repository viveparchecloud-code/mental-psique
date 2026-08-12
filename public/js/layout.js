/* ============================================================
   MentalPsique — layout.js
   Inyecta navbar + sidebar en cada página del dashboard
   ============================================================ */

function renderLayout(pageTitle) {
  const user = Auth.getUser();
  if (!user) return;

  const isAdmin    = user.rol === 'admin';
  const isPsicologo= user.rol === 'psicologo';
  const isPaciente = user.rol === 'paciente';

  const navbar = `
  <nav class="navbar">
    <span class="navbar__logo">Mental<span>Psique</span></span>
    <div class="navbar__user">
      <div class="navbar__avatar" id="nav-avatar">${(user.nombre?.[0]||'U').toUpperCase()}</div>
      <div>
        <div style="font-weight:500;color:var(--clr-text);font-size:.85rem" id="nav-name">${user.nombre} ${user.apellido}</div>
        <div style="font-size:.75rem" id="nav-rol">${user.rol}</div>
      </div>
      <button class="navbar__logout btn btn--sm" id="btn-logout">Salir</button>
    </div>
  </nav>`;

  const adminLinks = isAdmin ? `
    <span class="sidebar__section">Administración</span>
    <a href="pacientes.html" class="sidebar__link">
      <span class="sidebar__icon">◎</span> Pacientes
    </a>
    <a href="psicologos.html" class="sidebar__link">
      <span class="sidebar__icon">◉</span> Psicólogos
    </a>` : '';

  const psicoLinks = (isPsicologo || isAdmin) ? `
    <span class="sidebar__section">Clínico</span>
    <a href="historias.html" class="sidebar__link">
      <span class="sidebar__icon">◈</span> Historias clínicas
    </a>
    <a href="sesiones.html" class="sidebar__link">
      <span class="sidebar__icon">◧</span> Sesiones
    </a>` : '';

  const pacienteLinks = isPaciente ? `
    <span class="sidebar__section">Mi cuenta</span>
    <a href="mi-perfil.html" class="sidebar__link">
      <span class="sidebar__icon">◎</span> Mi perfil
    </a>
    <a href="consentimiento.html" class="sidebar__link">
      <span class="sidebar__icon">◉</span> Consentimiento
    </a>` : '';

  const sidebar = `
  <aside class="sidebar">
    <span class="sidebar__section">General</span>
    <a href="dashboard.html" class="sidebar__link">
      <span class="sidebar__icon">◆</span> Dashboard
    </a>
    <a href="citas.html" class="sidebar__link">
      <span class="sidebar__icon">◇</span> Citas
    </a>
    ${psicoLinks}
    ${pacienteLinks}
    ${adminLinks}
  </aside>`;

  document.body.insertAdjacentHTML('afterbegin', `
    <div class="app-shell">
      ${navbar}
      ${sidebar}
      <main class="main-content" id="main-content"></main>
    </div>
    <div id="toast-container"></div>
  `);

  // Marcar link activo
  const current = window.location.pathname.split('/').pop();
  document.querySelectorAll('.sidebar__link').forEach(a => {
    if (a.getAttribute('href') === current) a.classList.add('active');
  });

  // Logout
  document.getElementById('btn-logout').addEventListener('click', () => {
    Auth.clear();
    window.location.href = 'login.html';
  });

  return document.getElementById('main-content');
}
