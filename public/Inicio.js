/* ============================================================
   MentalPsique — Inicio.js
   Slider de testimonios, formulario de contacto y animaciones
   ============================================================ */

'use strict';

/* ── Datos de testimonios ──────────────────────────────────── */
const testimonios = [
  {
    texto: 'MentalPsique cambió mi vida. Por primera vez pude hablar con alguien que realmente me escuchó. El proceso de agendar la cita fue muy fácil y la psicóloga es increíble.',
    nombre: 'Valentina R.',
    cargo: 'Paciente — Psicología clínica',
    inicial: 'V',
  },
  {
    texto: 'Después de años evitando buscar ayuda, finalmente lo hice aquí. La terapia de parejas nos ayudó a reconstruir la comunicación. No puedo creer que esperé tanto tiempo.',
    nombre: 'Carlos & María P.',
    cargo: 'Pacientes — Terapia de parejas',
    inicial: 'C',
  },
  {
    texto: 'El servicio de psicología infantil fue fundamental para mi hijo. Los profesionales son pacientes, empáticos y muy preparados. Lo recomiendo 100%.',
    nombre: 'Andrea M.',
    cargo: 'Madre de paciente — Psicología infantil',
    inicial: 'A',
  },
  {
    texto: 'La modalidad virtual me permitió recibir atención desde casa. La plataforma es intuitiva, la psiquiatra es excelente y el seguimiento del tratamiento es muy detallado.',
    nombre: 'Diego F.',
    cargo: 'Paciente — Psiquiatría',
    inicial: 'D',
  },
];

/* ── Estado del slider ─────────────────────────────────────── */
let currentSlide  = 0;
let autoplayTimer = null;
const AUTOPLAY_MS = 5000;

/* ── Inicializar slider ────────────────────────────────────── */
function initSlider() {
  const container = document.getElementById('slider-container');
  const dotsBox   = document.getElementById('dots-container');
  if (!container || !dotsBox) return;

  // Crear tarjetas
  container.innerHTML = testimonios.map((t, i) => `
    <article class="testimonio-card" role="tabpanel"
             id="slide-${i}" aria-hidden="${i !== 0}"
             style="min-width:100%;flex-shrink:0">
      <p class="testimonio-texto">${t.texto}</p>
      <div class="testimonio-autor">
        <div class="testimonio-avatar" aria-hidden="true">${t.inicial}</div>
        <div>
          <div class="testimonio-nombre">${t.nombre}</div>
          <div class="testimonio-cargo">${t.cargo}</div>
        </div>
      </div>
    </article>
  `).join('');

  // Crear dots
  dotsBox.innerHTML = testimonios.map((_, i) => `
    <button class="dot ${i === 0 ? 'active' : ''}"
            role="tab" aria-selected="${i === 0}"
            aria-controls="slide-${i}"
            aria-label="Ir al testimonio ${i + 1}"
            onclick="goToSlide(${i})"></button>
  `).join('');

  startAutoplay();
}

function goToSlide(index) {
  const container = document.getElementById('slider-container');
  const dots      = document.querySelectorAll('.dot');
  const slides    = document.querySelectorAll('.testimonio-card');
  if (!container) return;

  currentSlide = (index + testimonios.length) % testimonios.length;

  // Mover el slider con transform (TEMA 11)
  container.style.transform    = `translateX(-${currentSlide * 100}%)`;
  container.style.transition   = 'transform 0.4s ease';
  container.style.display      = 'flex';

  // Actualizar dots
  dots.forEach((d, i) => {
    d.classList.toggle('active', i === currentSlide);
    d.setAttribute('aria-selected', i === currentSlide);
  });

  // Accesibilidad: aria-hidden en slides ocultos
  slides.forEach((s, i) => {
    s.setAttribute('aria-hidden', i !== currentSlide);
  });
}

function nextSlide() {
  resetAutoplay();
  goToSlide(currentSlide + 1);
}

function prevSlide() {
  resetAutoplay();
  goToSlide(currentSlide - 1);
}

function startAutoplay() {
  autoplayTimer = setInterval(() => goToSlide(currentSlide + 1), AUTOPLAY_MS);
}

function resetAutoplay() {
  clearInterval(autoplayTimer);
  startAutoplay();
}

/* ── Formulario de contacto ────────────────────────────────── */
function initForm() {
  const form = document.getElementById('form-contacto');
  const msg  = document.getElementById('form-msg');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = form.querySelector('.btn-enviar');

    // Validación básica
    const nombre   = document.getElementById('contacto-nombre').value.trim();
    const apellido = document.getElementById('contacto-apellido').value.trim();
    const email    = document.getElementById('contacto-email').value.trim();
    const mensaje  = document.getElementById('contacto-mensaje').value.trim();

    if (!nombre || !apellido || !email || !mensaje) {
      showMsg('Por favor completa todos los campos.', 'error');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      showMsg('Ingresa un correo electrónico válido.', 'error');
      return;
    }

    // Simular envío
    btn.disabled    = true;
    btn.innerHTML   = '<i class="fas fa-spinner fa-spin"></i> Enviando...';

    await new Promise(r => setTimeout(r, 1200)); // simula delay de red

    showMsg('¡Mensaje enviado correctamente! Te responderemos pronto.', 'success');
    form.reset();
    btn.disabled  = false;
    btn.innerHTML = '<i class="fas fa-paper-plane"></i> Enviar';
  });

  function showMsg(texto, tipo) {
    msg.style.display = 'block';
    msg.textContent   = texto;
    msg.style.background = tipo === 'success'
      ? 'rgba(6,182,212,0.12)'
      : 'rgba(236,72,153,0.12)';
    msg.style.color  = tipo === 'success' ? '#67E8F9' : '#F9A8D4';
    msg.style.border = `1px solid ${tipo === 'success' ? 'rgba(6,182,212,0.3)' : 'rgba(236,72,153,0.3)'}`;
    setTimeout(() => { msg.style.display = 'none'; }, 5000);
  }
}

/* ── Animaciones al hacer scroll (Intersection Observer) ───── */
function initScrollAnimations() {
  const items = document.querySelectorAll(
    '.servicio-item, .testimonio-card, .contacto-inner'
  );

  if (!('IntersectionObserver' in window)) {
    items.forEach(el => el.style.opacity = '1');
    return;
  }

  // Ocultar elementos antes de animarlos
  items.forEach((el, i) => {
    el.style.opacity   = '0';
    el.style.transform = 'translateY(24px)';
    el.style.transition= `opacity 0.5s ease ${i * 0.06}s, transform 0.5s ease ${i * 0.06}s`;
  });

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity   = '1';
        entry.target.style.transform = 'translateY(0)';
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });

  items.forEach(el => observer.observe(el));
}

/* ── Navbar activo al hacer scroll ─────────────────────────── */
function initNavScroll() {
  const sections = document.querySelectorAll('section[id]');
  const links    = document.querySelectorAll('.nav-links a[href^="#"]');

  window.addEventListener('scroll', () => {
    const scrollY = window.scrollY + 100;
    sections.forEach(section => {
      const top    = section.offsetTop;
      const height = section.offsetHeight;
      const id     = section.getAttribute('id');
      if (scrollY >= top && scrollY < top + height) {
        links.forEach(a => {
          a.classList.toggle('active', a.getAttribute('href') === `#${id}`);
        });
      }
    });
  }, { passive: true });
}

/* ── Buscador toggle ────────────────────────────────────────── */
function toggleSearch() {
  // Funcionalidad básica — redirige al login para buscar psicólogos
  window.location.href = 'pages/psicologos.html';
}

/* ── Keyboard navigation para servicios ─────────────────────── */
function initKeyboardNav() {
  document.querySelectorAll('.servicio-item').forEach(item => {
    item.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        item.click();
      }
    });
  });
}

/* ── Swipe touch para slider ────────────────────────────────── */
function initSwipe() {
  const slider = document.querySelector('.testimonios-slider');
  if (!slider) return;

  let startX = 0;

  slider.addEventListener('touchstart', e => {
    startX = e.touches[0].clientX;
  }, { passive: true });

  slider.addEventListener('touchend', e => {
    const diff = startX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) {
      diff > 0 ? nextSlide() : prevSlide();
    }
  }, { passive: true });
}

/* ── Bootstrap ──────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  initSlider();
  initForm();
  initScrollAnimations();
  initNavScroll();
  initKeyboardNav();
  initSwipe();
});
