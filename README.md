# MentalPsique — Sistema de Gestión Clínica Psicológica

> Proyecto de software full-stack desarrollado como evidencia técnica para el concurso
> de méritos CNSC — Instructor de Software · SENA · DO-F-012 V08

---

## Checklist técnico

| # | Competencia SENA (DO-F-012 V08) | Implementación |
|---|---|---|
| 1 | Documentación de requisitos (SRS, IEEE-830) | `docs/SRS.md` + Swagger OpenAPI 3.0 |
| 2 | Arquitecturas tecnológicas (web, 3 capas) | Frontend → Express API → MySQL |
| 3 | Metodologías de desarrollo (SCRUM) | Entregables por sprints documentados |
| 4 | UML / Modelado (MER) | Diagrama ER — 8 tablas relacionadas |
| 5 | Motor BD relacional (MySQL) | Pool de conexiones mysql2/promise |
| 6 | Lenguaje OO (Node.js / JS) | Controllers, routes, middleware |
| 7 | Calidad PSP | 16 pruebas automatizadas Jest |
| 8 | Seguridad | JWT + bcrypt + Rate limiting + IDOR bloqueado |
| 9 | Pruebas de software | Unitarias + integración (Jest + Supertest) |
| 10 | Implementación | `npm start` — listo para despliegue |

---

## Stack tecnológico

```
Frontend   → HTML5 · CSS3 · JavaScript vanilla
Backend    → Node.js · Express.js 4
Base datos → MySQL 8.0 (pool mysql2/promise)
Auth       → JWT (jsonwebtoken) + bcrypt
Docs API   → Swagger UI (OpenAPI 3.0)
Tests      → Jest + Supertest (16 tests)
Seguridad  → express-rate-limit · express-validator · IDOR middleware
```

---

## Estructura del proyecto

```
mentalpsique/
├── src/
│   ├── app.js                     ← Servidor Express principal
│   ├── config/
│   │   ├── db.js                  ← Pool MySQL
│   │   └── swagger.js             ← Configuración OpenAPI
│   ├── controllers/
│   │   ├── authController.js      ← Login · registro · perfil
│   │   ├── citasController.js     ← CRUD citas + conflicto horario
│   │   ├── historiasController.js ← Historias clínicas
│   │   ├── sesionesController.js  ← Notas de evolución
│   │   ├── pacientesController.js ← Perfil paciente + IDOR
│   │   ├── psicologosController.js← Perfil + disponibilidad
│   │   └── consentimientosController.js ← Firma digital
│   ├── middleware/
│   │   ├── auth.js                ← verificarToken · soloRoles
│   │   └── errorHandler.js       ← validar · errorHandler global
│   ├── routes/
│   │   ├── auth.js                ← POST /login · /registro · GET /perfil
│   │   ├── citas.js               ← CRUD /citas
│   │   └── index.js               ← /pacientes /psicologos /historias /sesiones /consentimientos
│   └── tests/
│       └── app.test.js            ← 16 tests (Jest + Supertest)
├── public/                        ← Frontend estático (HTML/CSS/JS)
├── .env.example                   ← Variables de entorno (plantilla)
├── package.json
└── README.md
```

---

## Instalación y ejecución

### Requisitos previos
- Node.js 18+
- MySQL 8.0+

### Pasos

```bash
# 1. Clonar / descomprimir el proyecto
cd mentalpsique

# 2. Instalar dependencias
npm install

# 3. Configurar variables de entorno
cp .env.example .env
# Editar .env con tus credenciales de MySQL

# 4. Crear la base de datos
mysql -u root -p < mentalpsique_db.sql

# 5. Iniciar servidor
npm start
# o en modo desarrollo:
npm run dev
```

El servidor queda disponible en: **http://localhost:3000**

---

## Endpoints de la API

Base URL: `http://localhost:3000/api/v1`

### Autenticación (sin token)
| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | `/auth/login` | Iniciar sesión → retorna JWT |
| POST | `/auth/registro` | Registrar nuevo usuario |
| GET | `/auth/perfil` | Perfil del usuario autenticado 🔒 |

### Citas 🔒
| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/citas` | Listar citas (filtradas por rol) |
| POST | `/citas` | Crear cita (paciente/admin) |
| GET | `/citas/:id` | Obtener cita por ID |
| PATCH | `/citas/:id/cancelar` | Cancelar cita |
| PATCH | `/citas/:id/estado` | Cambiar estado (psicólogo/admin) |

### Psicólogos (público)
| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/psicologos` | Listar psicólogos |
| GET | `/psicologos/:id` | Detalle psicólogo |
| GET | `/psicologos/:id/disponibilidad` | Horarios 🔒 |

### Historias clínicas 🔒 (psicólogo/admin)
| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/historias/:id_paciente` | Ver historia clínica |
| POST | `/historias` | Crear historia |
| PUT | `/historias/:id_paciente` | Actualizar |

### Sesiones 🔒
| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/sesiones/historia/:id` | Sesiones de una historia |
| POST | `/sesiones` | Registrar sesión (psicólogo) |
| GET | `/sesiones/:id` | Ver sesión |

### Consentimientos 🔒
| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/consentimientos/:id_paciente` | Ver estado |
| POST | `/consentimientos/:id_paciente` | Firmar digitalmente |

**Documentación interactiva:** http://localhost:3000/api/v1/docs

---

## Seguridad implementada

| Mecanismo | Descripción |
|-----------|-------------|
| **JWT** | Token firmado con HS256, expiración configurable |
| **bcrypt** | Hash de contraseñas con salt rounds configurables |
| **Rate Limiting** | Máx. 100 req/15min por IP |
| **IDOR bloqueado** | Paciente solo accede a sus propios recursos (403 si intenta otro ID) |
| **SQL Injection** | Placeholders `?` en todos los queries (mysql2 prepared statements) |
| **Roles** | `admin` · `psicologo` · `paciente` — middleware `soloRoles()` |
| **Logs de acceso** | Tabla `logs_acceso` registra cada login con IP y resultado |
| **Validación** | express-validator en todos los endpoints de entrada |

---

## Pruebas automatizadas

```bash
npm test
```

```
Tests: 16 passed, 16 total

  1. Auth — Login
    ✓ T01 login admin exitoso → 200 + token
    ✓ T02 login paciente → 200 + token
    ✓ T03 login psicólogo → 200 + token
    ✓ T04 credenciales incorrectas → 401
    ✓ T05 email inválido → 422

  2. Auth — Perfil y registro
    ✓ T06 GET /perfil sin token → 401
    ✓ T07 GET /perfil con token válido → 200
    ✓ T08 registro nuevo usuario → 201

  3. Citas — CRUD
    ✓ T09 listar citas con token → 200 array
    ✓ T10 crear cita como paciente → 201
    ✓ T11 obtener cita por ID → 200
    ✓ T12 cancelar cita → 200

  4. Seguridad — Control de acceso
    ✓ T13 ruta protegida sin token → 401
    ✓ T14 paciente cambia estado (solo psicólogo/admin) → 403

  5. Historias clínicas y psicólogos
    ✓ T15 psicólogo obtiene historia clínica → 200
    ✓ T16 listar psicólogos (endpoint público) → 200 array
```

---

## Alineación con competencias SENA

Este proyecto evidencia las **habilidades técnicas específicas** del cargo Instructor de Software
(DO-F-012 V08, páginas 399-400):

- **Gestiona Requisitos** → SRS documentado, Swagger con contratos de API
- **Analiza requisitos del cliente** → Módulos derivados de necesidades reales de MentalPsique
- **Diseña software y bases de datos** → ERD + arquitectura 3 capas
- **Codifica en lenguaje OO** → Node.js con patrones MVC
- **Gestiona Bases de Datos relacionales** → MySQL con JOINs, índices, FK, pool
- **Adopta modelos de calidad (PSP)** → 16 tests automatizados
- **Gestiona Seguridad** → JWT + bcrypt + IDOR + rate limiting + logs
- **Gestiona pruebas** → Jest unitarias + Supertest integración
- **Implementa el software** → Servidor listo para producción

---

*Desarrollado con Node.js · Express · MySQL · Jest — 2025*
