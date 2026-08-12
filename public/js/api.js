/* ============================================================
   MentalPsique — api.js
   Cliente HTTP centralizado para todos los fetch a la API REST
   ============================================================ */

const API_BASE = (location.hostname === 'localhost' || location.hostname === '127.0.0.1')
  ? '/api/v1'
  : '/.netlify/functions/server/api/v1';

// ── Auth helpers ─────────────────────────────────────────────
const Auth = {
  getToken:  ()      => localStorage.getItem('mp_token'),
  getUser:   ()      => JSON.parse(localStorage.getItem('mp_user') || 'null'),
  setSession:(token, user) => {
    localStorage.setItem('mp_token', token);
    localStorage.setItem('mp_user', JSON.stringify(user));
  },
  clear: () => {
    localStorage.removeItem('mp_token');
    localStorage.removeItem('mp_user');
  },
  isLoggedIn: () => !!localStorage.getItem('mp_token'),
  requireAuth: () => {
    if (!localStorage.getItem('mp_token')) {
      window.location.href = '/pages/login.html';
      return false;
    }
    return true;
  },
};

// ── Fetch wrapper ─────────────────────────────────────────────
async function apiFetch(endpoint, options = {}) {
  const token = Auth.getToken();
  const headers = { 'Content-Type': 'application/json', ...options.headers };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}${endpoint}`, { ...options, headers });

  if (res.status === 401) {
    Auth.clear();
    window.location.href = '/pages/login.html';
    return;
  }

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    const msg = data.error || data.errores?.[0]?.msg || 'Error desconocido';
    throw new Error(msg);
  }

  return data;
}

const API = {
  // Auth
  login:    (body)    => apiFetch('/auth/login',    { method:'POST', body: JSON.stringify(body) }),
  registro: (body)    => apiFetch('/auth/registro', { method:'POST', body: JSON.stringify(body) }),
  perfil:   ()        => apiFetch('/auth/perfil'),

  // Pacientes
  pacientes: {
    listar:    ()     => apiFetch('/pacientes'),
    obtener:   (id)   => apiFetch(`/pacientes/${id}`),
    miPerfil:  ()     => apiFetch('/pacientes/mi-perfil'),
    actualizar:(id,b) => apiFetch(`/pacientes/${id}`, { method:'PUT', body: JSON.stringify(b) }),

    desactivar: (id) => apiFetch(`/pacientes/${id}/desactivar`, { method: 'PATCH' }),
    activar:    (id) => apiFetch(`/pacientes/${id}/activar`,    { method: 'PATCH' }),
  },

  // Psicólogos
  psicologos: {
    listar:         ()   => apiFetch('/psicologos'),
    obtener:        (id) => apiFetch(`/psicologos/${id}`),
    disponibilidad: (id) => apiFetch(`/psicologos/${id}/disponibilidad`),

    // solo admin puede crear psicólogos, no es una función pública 30-04-26
    crear:          (body) => apiFetch('/psicologos', { method:'POST', body: JSON.stringify(body) }),

    desactivar: (id) => apiFetch(`/psicologos/${id}/desactivar`, { method: 'PATCH' }),
    activar:    (id) => apiFetch(`/psicologos/${id}/activar`,    { method: 'PATCH' }),
    actualizar: (id, body) => apiFetch(`/psicologos/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
    eliminar: (id) => apiFetch(`/psicologos/${id}`, { method: 'DELETE' }),
  },


  // Citas
  citas: {
    listar:       ()      => apiFetch('/citas'),
    obtener:      (id)    => apiFetch(`/citas/${id}`),
    crear:        (body)  => apiFetch('/citas',              { method:'POST',  body: JSON.stringify(body) }),
    cancelar:     (id)    => apiFetch(`/citas/${id}/cancelar`, { method:'PATCH' }),
    cambiarEstado:(id,est)=> apiFetch(`/citas/${id}/estado`, { method:'PATCH', body: JSON.stringify({ estado: est }) }),
    editar:   (id, body) => apiFetch(`/citas/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
    eliminar: (id)       => apiFetch(`/citas/${id}`, { method: 'DELETE' }),
  
  },

  // Historias clínicas
  historias: {
    obtener:    (id_paciente) => apiFetch(`/historias/${id_paciente}`),
    crear:      (body)        => apiFetch('/historias',            { method:'POST', body: JSON.stringify(body) }),
    actualizar: (id_paciente, body) => apiFetch(`/historias/${id_paciente}`, { method:'PUT', body: JSON.stringify(body) }),
  },

  // Sesiones
  sesiones: {
    listar: (id_historia) => apiFetch(`/sesiones/historia/${id_historia}`),
    crear:  (body)        => apiFetch('/sesiones', { method:'POST', body: JSON.stringify(body) }),
    obtener:(id)          => apiFetch(`/sesiones/${id}`),
    actualizar: (id, body) => apiFetch(`/sesiones/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
    eliminar:   (id)       => apiFetch(`/sesiones/${id}`, { method: 'DELETE' }),
  },

  // Consentimientos
  consentimientos: {
    obtener: (id_paciente) => apiFetch(`/consentimientos/${id_paciente}`),
    firmar:  (id_paciente) => apiFetch(`/consentimientos/${id_paciente}`, { method:'POST' }),
  },
};

// ── Toast ─────────────────────────────────────────────────────
const Toast = {
  show(msg, type = 'success', duration = 3500) {
    let container = document.getElementById('toast-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'toast-container';
      document.body.appendChild(container);
    }
    const icons = { success: '✓', error: '✕', info: 'i' };
    const el = document.createElement('div');
    el.className = `toast toast--${type}`;
    el.innerHTML = `<span>${icons[type]}</span><span>${msg}</span>`;
    container.appendChild(el);
    setTimeout(() => el.remove(), duration);
  },
  success: (msg) => Toast.show(msg, 'success'),
  error:   (msg) => Toast.show(msg, 'error'),
  info:    (msg) => Toast.show(msg, 'info'),
};

// ── Helpers de UI ─────────────────────────────────────────────
const UI = {
  badge(estado) {
    return `<span class="badge badge--${estado}">${estado.replace('_',' ')}</span>`;
  },
  fecha(iso) {
    if (!iso) return '—';
    return new Date(iso).toLocaleString('es-CO', {
      dateStyle: 'medium', timeStyle: 'short'
    });
  },
  fechaCorta(iso) {
    if (!iso) return '—';
    return new Date(iso).toLocaleDateString('es-CO', { dateStyle: 'medium' });
  },
  spinner() {
    return '<div class="spinner"></div>';
  },
  emptyState(msg = 'No hay registros') {
    return `<div class="empty-state">
      <div class="empty-state__icon">○</div>
      <h3>${msg}</h3>
    </div>`;
  },
  initSidebar() {
    const user = Auth.getUser();
    if (!user) return;
    const avatar = document.getElementById('nav-avatar');
    const name   = document.getElementById('nav-name');
    const rol    = document.getElementById('nav-rol');
    if (avatar) avatar.textContent = (user.nombre?.[0] || 'U').toUpperCase();
    if (name)   name.textContent   = `${user.nombre} ${user.apellido}`;
    if (rol)    rol.textContent    = user.rol;

    // Marcar link activo
    const current = window.location.pathname.split('/').pop();
    document.querySelectorAll('.sidebar__link').forEach(a => {
      if (a.getAttribute('href') === current) a.classList.add('active');
    });

    // Ocultar links según rol
    document.querySelectorAll('[data-roles]').forEach(el => {
      const roles = el.dataset.roles.split(',');
      if (!roles.includes(user.rol)) el.style.display = 'none';
    });
  },
};

// ── Logout ────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  const btn = document.getElementById('btn-logout');
  if (btn) btn.addEventListener('click', () => {
    Auth.clear();
    window.location.href = '/pages/login.html';
  });
  UI.initSidebar();
});
