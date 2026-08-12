# SRS — Especificación de Requisitos de Software
## MentalPsique v1.0 — Estándar IEEE-830

---

## 1. Introducción

### 1.1 Propósito
Este documento especifica los requisitos del sistema **MentalPsique**, plataforma web de gestión clínica psicológica. Está dirigido al equipo de desarrollo, evaluadores CNSC y docentes SENA.

### 1.2 Alcance
MentalPsique es un sistema de información que permite:
- Gestión de citas psicológicas (agendar, confirmar, cancelar)
- Almacenamiento seguro de historias clínicas
- Registro de sesiones y evolución del paciente
- Consentimiento informado digital
- Autenticación y autorización por roles

### 1.3 Definiciones y acrónimos
| Término | Definición |
|---------|-----------|
| SRS | Software Requirements Specification |
| JWT | JSON Web Token — mecanismo de autenticación |
| IDOR | Insecure Direct Object Reference — vulnerabilidad de seguridad |
| CIE-10 | Clasificación Internacional de Enfermedades, 10.ª revisión |
| API REST | Interfaz de programación basada en HTTP y JSON |
| MVC | Modelo-Vista-Controlador — patrón arquitectónico |
| PSP | Personal Software Process — disciplina de calidad |

### 1.4 Referencias
- IEEE Std 830-1998: Recommended Practice for Software Requirements Specifications
- Manual de Funciones SENA DO-F-012 V08 — Instructor de Software
- Ley 1581 de 2012 — Habeas Data Colombia
- Resolución 1995 de 1999 — Manejo de historias clínicas

---

## 2. Descripción general del sistema

### 2.1 Perspectiva del producto
Sistema web de tres capas:
```
[Frontend HTML/CSS/JS] ←→ [API REST Node.js/Express] ←→ [MySQL 8.0]
```

### 2.2 Funciones del producto
1. Autenticación y gestión de sesiones
2. Gestión de citas médicas
3. Historias clínicas electrónicas
4. Notas de evolución por sesión
5. Consentimiento informado digital
6. Dashboard por rol (paciente / psicólogo / admin)
7. Auditoría de accesos

### 2.3 Roles de usuario
| Rol | Descripción |
|-----|-------------|
| Paciente | Agenda y cancela citas, ve su historia, firma consentimiento |
| Psicólogo | Gestiona citas, crea historias clínicas y sesiones |
| Admin | Acceso total al sistema |

### 2.4 Restricciones
- Requiere Node.js 18+ y MySQL 8.0+
- Conexión HTTPS en producción
- Contraseñas mínimo 8 caracteres con bcrypt
- Tokens JWT con expiración de 8 horas

---

## 3. Requisitos funcionales

### RF-01 — Autenticación
| Atributo | Descripción |
|---------|-------------|
| ID | RF-01 |
| Nombre | Inicio de sesión |
| Descripción | El sistema debe autenticar usuarios con email y contraseña |
| Entrada | email (string), password (string) |
| Proceso | Verificar credenciales con bcrypt, generar JWT |
| Salida | Token JWT + datos del usuario |
| Prioridad | Alta |
| Estado | ✅ Implementado |

### RF-02 — Registro de usuarios
| Atributo | Descripción |
|---------|-------------|
| ID | RF-02 |
| Nombre | Registro |
| Descripción | Nuevos pacientes pueden crear cuenta. Al registrarse se crea automáticamente su perfil en la tabla `pacientes` |
| Entrada | nombre, apellido, email, password |
| Proceso | Validar datos, hashear password, insertar en `usuarios` y `pacientes` |
| Salida | Confirmación de creación |
| Prioridad | Alta |
| Estado | ✅ Implementado |

### RF-03 — Gestión de citas
| Atributo | Descripción |
|---------|-------------|
| ID | RF-03 |
| Nombre | CRUD Citas |
| Descripción | Crear, listar, consultar, cambiar estado y cancelar citas |
| Reglas de negocio | No se permiten citas en horarios duplicados para el mismo psicólogo |
| Prioridad | Alta |
| Estado | ✅ Implementado |

### RF-04 — Historias clínicas
| Atributo | Descripción |
|---------|-------------|
| ID | RF-04 |
| Nombre | Historia clínica electrónica |
| Descripción | Un psicólogo puede crear y actualizar la historia clínica de un paciente. Incluye motivo, antecedentes y diagnóstico CIE-10 |
| Prioridad | Alta |
| Estado | ✅ Implementado |

### RF-05 — Sesiones clínicas
| Atributo | Descripción |
|---------|-------------|
| ID | RF-05 |
| Nombre | Notas de evolución |
| Descripción | Por cada cita completada se puede registrar una nota de sesión con evolución, plan de tratamiento y observaciones |
| Prioridad | Media |
| Estado | ✅ Implementado |

### RF-06 — Consentimiento informado
| Atributo | Descripción |
|---------|-------------|
| ID | RF-06 |
| Nombre | Consentimiento digital |
| Descripción | El paciente puede leer y firmar el consentimiento informado. Se registra fecha, IP y versión del documento |
| Prioridad | Alta |
| Estado | ✅ Implementado |

### RF-07 — Dashboard por roles
| Atributo | Descripción |
|---------|-------------|
| ID | RF-07 |
| Nombre | Panel de control |
| Descripción | Cada rol ve estadísticas y accesos diferentes. El admin ve todo, el psicólogo sus citas y pacientes, el paciente sus propias citas |
| Prioridad | Media |
| Estado | ✅ Implementado |

### RF-08 — Logs de auditoría
| Atributo | Descripción |
|---------|-------------|
| ID | RF-08 |
| Nombre | Auditoría de accesos |
| Descripción | Cada intento de login (exitoso o fallido) queda registrado con IP, fecha y resultado en la tabla `logs_acceso` |
| Prioridad | Media |
| Estado | ✅ Implementado |

---

## 4. Requisitos no funcionales

### RNF-01 — Seguridad
- Contraseñas hasheadas con bcrypt (10 rounds)
- Autenticación stateless con JWT (HS256)
- Protección SQL Injection mediante prepared statements (placeholders `?`)
- Protección IDOR: cada usuario solo accede a sus propios recursos
- Rate limiting: máximo 100 solicitudes por 15 minutos por IP
- Validación de entradas con express-validator

### RNF-02 — Rendimiento
- Pool de conexiones MySQL: máximo 10 conexiones simultáneas
- Tiempo de respuesta API: < 200ms para consultas simples
- Índices en columnas de búsqueda frecuente: `fecha_hora`, `id_psicologo`

### RNF-03 — Disponibilidad
- Servidor Express con manejo global de errores
- Reconexión automática del pool MySQL
- Logs de errores en consola con timestamp

### RNF-04 — Mantenibilidad
- Arquitectura MVC: separación controllers / routes / middleware
- Código documentado con JSDoc en rutas (Swagger OpenAPI 3.0)
- Tests automatizados con Jest + Supertest (16 pruebas)

### RNF-05 — Usabilidad
- Interfaz responsive (mobile y desktop)
- Mensajes de error claros en formularios
- Sistema de toasts para retroalimentación inmediata
- Navegación por sidebar con indicador de página activa

### RNF-06 — Portabilidad
- Compatible con Node.js 18+
- Base de datos MySQL 8.0+ o MariaDB 10.6+
- Frontend sin frameworks — HTML/CSS/JS vanilla

---

## 5. Modelo de datos (resumen)

```
usuarios (1) ──── (1) pacientes
usuarios (1) ──── (1) psicologos
pacientes (1) ─── (N) citas
psicologos (1) ── (N) citas
pacientes (1) ─── (1) historias_clinicas
historias_clinicas (1) ── (N) sesiones
citas (1) ──────── (1) sesiones
pacientes (1) ─── (N) consentimientos
usuarios (1) ──── (N) logs_acceso
psicologos (1) ── (N) disponibilidad
```

---

## 6. Interfaces del sistema

### 6.1 Interfaz de usuario
- Login / Registro
- Dashboard (estadísticas por rol)
- Gestión de citas (CRUD completo)
- Historias clínicas y sesiones
- Perfil del paciente y consentimiento
- Directorio de psicólogos

### 6.2 Interfaz de API REST
- Base URL: `/api/v1`
- Formato: JSON
- Autenticación: Bearer Token (JWT)
- Documentación: Swagger UI en `/api/v1/docs`

### 6.3 Interfaz de base de datos
- Motor: MySQL 8.0
- Charset: utf8mb4
- Pool: mysql2/promise con 10 conexiones máximo

---

*Documento elaborado bajo estándar IEEE-830 — MentalPsique v1.0 — 2025*
*Alineado con Manual de Funciones SENA DO-F-012 V08 — Área Temática: Software*
