# Plan de Desarrollo — Metodología SCRUM
## MentalPsique v1.0

---

## Equipo y roles SCRUM

| Rol | Responsable |
|-----|------------|
| Product Owner | Cliente (consultorio MentalPsique) |
| Scrum Master | Líder del proyecto |
| Development Team | Equipo de desarrollo (fullstack) |

---

## Definición de Done (DoD)
Un ítem se considera terminado cuando:
- ✅ Código implementado y funcional
- ✅ Al menos 1 prueba automatizada cubre el caso
- ✅ Documentado en Swagger (si es endpoint)
- ✅ Revisado por otro miembro del equipo
- ✅ Integrado en rama principal sin conflictos

---

## Sprint 1 — Base del sistema
**Duración:** 2 semanas  
**Objetivo:** Tener la infraestructura base funcionando

| ID | Historia de usuario | Puntos | Estado |
|----|-------------------|--------|--------|
| US-01 | Como desarrollador, necesito la BD con todas las tablas relacionadas | 3 | ✅ Done |
| US-02 | Como desarrollador, necesito el servidor Express configurado con CORS y middlewares | 2 | ✅ Done |
| US-03 | Como desarrollador, necesito el sistema de autenticación JWT + bcrypt | 5 | ✅ Done |
| US-04 | Como desarrollador, necesito el pool de conexiones MySQL configurado | 2 | ✅ Done |
| US-05 | Como usuario, necesito poder registrarme con email y contraseña | 3 | ✅ Done |

**Velocidad del sprint:** 15 puntos  
**Entregable:** Servidor corriendo en localhost con auth funcional

---

## Sprint 2 — Módulo de citas
**Duración:** 2 semanas  
**Objetivo:** Gestión completa del ciclo de citas

| ID | Historia de usuario | Puntos | Estado |
|----|-------------------|--------|--------|
| US-06 | Como paciente, quiero agendar una cita eligiendo psicólogo, fecha y modalidad | 5 | ✅ Done |
| US-07 | Como paciente, quiero cancelar una cita pendiente | 2 | ✅ Done |
| US-08 | Como psicólogo, quiero confirmar o rechazar citas asignadas | 3 | ✅ Done |
| US-09 | Como admin, quiero ver todas las citas con filtro por estado | 3 | ✅ Done |
| US-10 | Como sistema, debo bloquear citas duplicadas en el mismo horario | 2 | ✅ Done |

**Velocidad del sprint:** 15 puntos  
**Entregable:** CRUD completo de citas con reglas de negocio

---

## Sprint 3 — Historias clínicas y sesiones
**Duración:** 2 semanas  
**Objetivo:** Gestión del registro clínico del paciente

| ID | Historia de usuario | Puntos | Estado |
|----|-------------------|--------|--------|
| US-11 | Como psicólogo, quiero crear la historia clínica de un paciente con diagnóstico CIE-10 | 5 | ✅ Done |
| US-12 | Como psicólogo, quiero registrar notas de evolución por cada sesión | 5 | ✅ Done |
| US-13 | Como paciente, quiero ver mi historia clínica y sesiones (solo lectura) | 3 | ✅ Done |
| US-14 | Como sistema, debo proteger que cada paciente solo vea su propia historia (anti-IDOR) | 3 | ✅ Done |

**Velocidad del sprint:** 16 puntos  
**Entregable:** Módulo clínico completo con control de acceso

---

## Sprint 4 — Seguridad y calidad
**Duración:** 2 semanas  
**Objetivo:** Blindar el sistema y garantizar calidad

| ID | Historia de usuario | Puntos | Estado |
|----|-------------------|--------|--------|
| US-15 | Como admin, necesito que todos los logins queden registrados con IP y resultado | 2 | ✅ Done |
| US-16 | Como desarrollador, necesito 16 pruebas automatizadas con Jest + Supertest | 8 | ✅ Done |
| US-17 | Como sistema, debo limitar intentos de acceso con rate limiting | 2 | ✅ Done |
| US-18 | Como paciente, quiero firmar el consentimiento informado digitalmente | 3 | ✅ Done |

**Velocidad del sprint:** 15 puntos  
**Entregable:** Sistema seguro con suite de tests completa

---

## Sprint 5 — Frontend completo
**Duración:** 2 semanas  
**Objetivo:** Interfaz de usuario funcional para todos los roles

| ID | Historia de usuario | Puntos | Estado |
|----|-------------------|--------|--------|
| US-19 | Como usuario, quiero una pantalla de login y registro con validación | 3 | ✅ Done |
| US-20 | Como usuario, quiero un dashboard con estadísticas según mi rol | 5 | ✅ Done |
| US-21 | Como paciente, quiero gestionar mis citas desde la interfaz web | 5 | ✅ Done |
| US-22 | Como psicólogo/admin, quiero ver el directorio de pacientes con búsqueda | 3 | ✅ Done |
| US-23 | Como paciente, quiero actualizar mi perfil y firmar el consentimiento | 3 | ✅ Done |

**Velocidad del sprint:** 19 puntos  
**Entregable:** Frontend completo HTML/CSS/JS integrado con la API

---

## Sprint 6 — Documentación y despliegue
**Duración:** 1 semana  
**Objetivo:** Documentar y desplegar en producción

| ID | Historia de usuario | Puntos | Estado |
|----|-------------------|--------|--------|
| US-24 | Como desarrollador, necesito documentación Swagger de todos los endpoints | 5 | ✅ Done |
| US-25 | Como equipo, necesito el SRS completo bajo estándar IEEE-830 | 3 | ✅ Done |
| US-26 | Como equipo, necesito el README con instrucciones de instalación | 2 | ✅ Done |
| US-27 | Como cliente, quiero el sistema desplegado en un servidor público | 8 | ⏳ Pendiente |

**Velocidad del sprint:** 18 puntos  
**Entregable:** Sistema documentado y listo para producción

---

## Burndown chart (resumen)

| Sprint | Puntos planificados | Puntos completados | Acumulado completado |
|--------|--------------------|--------------------|---------------------|
| Sprint 1 | 15 | 15 | 15 |
| Sprint 2 | 15 | 15 | 30 |
| Sprint 3 | 16 | 16 | 46 |
| Sprint 4 | 15 | 15 | 61 |
| Sprint 5 | 19 | 19 | 80 |
| Sprint 6 | 18 | 10 | 90 |
| **Total** | **98** | **90** | **90/98** |

---

## Product Backlog — ítems futuros (v2.0)

| ID | Historia | Prioridad |
|----|---------|-----------|
| US-28 | Notificaciones por email (recordatorio de citas) | Alta |
| US-29 | Módulo de pagos en línea | Media |
| US-30 | Videollamada integrada (WebRTC) | Media |
| US-31 | App móvil (React Native) | Baja |
| US-32 | Exportar historia clínica a PDF | Alta |
| US-33 | Reportes estadísticos para admin | Media |

---

*Plan SCRUM — MentalPsique v1.0 — Alineado con DO-F-012 V08 SENA*
