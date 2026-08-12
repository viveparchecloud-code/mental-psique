# PSP — Personal Software Process
## MentalPsique v1.0 — Métricas de Calidad

---

## 1. Resumen del proceso

El PSP (Personal Software Process) es una disciplina de ingeniería de software
que permite medir y mejorar la calidad del proceso de desarrollo individual.
Se aplicó en MentalPsique para registrar defectos, estimar tiempos y
controlar la calidad antes de la integración.

---

## 2. Métricas de tamaño (LOC — Lines of Code)

| Módulo | Archivo | LOC |
|--------|---------|-----|
| Servidor principal | src/app.js | 68 |
| Config BD | src/config/db.js | 24 |
| Config Swagger | src/config/swagger.js | 28 |
| Auth controller | src/controllers/authController.js | 78 |
| Citas controller | src/controllers/citasController.js | 98 |
| Historias controller | src/controllers/historiasController.js | 72 |
| Sesiones controller | src/controllers/sesionesController.js | 52 |
| Pacientes controller | src/controllers/pacientesController.js | 68 |
| Psicólogos controller | src/controllers/psicologosController.js | 48 |
| Consentimientos controller | src/controllers/consentimientosController.js | 58 |
| Middleware auth | src/middleware/auth.js | 28 |
| Middleware errors | src/middleware/errorHandler.js | 22 |
| Rutas auth | src/routes/auth.js | 62 |
| Rutas citas | src/routes/citas.js | 78 |
| Rutas index | src/routes/index.js | 120 |
| Tests | src/tests/app.test.js | 180 |
| CSS global | public/css/global.css | 310 |
| CSS login | public/css/login.css | 98 |
| JS api.js | public/js/api.js | 120 |
| JS layout.js | public/js/layout.js | 72 |
| HTML (8 páginas) | public/pages/*.html | ~800 |
| **TOTAL** | | **~2.584 LOC** |

---

## 3. Métricas de defectos

### 3.1 Defectos encontrados y corregidos

| ID | Fase detectado | Tipo | Descripción | Fase corregido |
|----|---------------|------|-------------|----------------|
| D-01 | Tests | Lógica | JWT_SECRET no disponible en entorno de tests | Tests |
| D-02 | Integración | Datos | Registro no creaba fila en tabla `pacientes` | Codificación |
| D-03 | Pruebas manuales | Interfaz | Página `sesiones.html` faltante en frontend | Codificación |
| D-04 | Pruebas manuales | BD | Usuarios de prueba sin password_hash válido | BD |
| D-05 | Code review | Seguridad | `testPathPattern` deprecado en Jest config | Configuración |

### 3.2 Densidad de defectos
```
Defectos totales encontrados:  5
LOC totales:                   2.584
Densidad de defectos:          5 / 2.584 = 1.93 defectos / KLOC
```
*Referencia PSP: < 5 defectos/KLOC es considerado buena calidad*

---

## 4. Métricas de pruebas

### 4.1 Cobertura de pruebas automatizadas

| Suite | Tests | Pasando | Fallando |
|-------|-------|---------|---------|
| Auth — Login | 5 | 5 | 0 |
| Auth — Perfil y registro | 3 | 3 | 0 |
| Citas — CRUD | 4 | 4 | 0 |
| Seguridad — Control de acceso | 2 | 2 | 0 |
| Historias y psicólogos | 2 | 2 | 0 |
| **Total** | **16** | **16** | **0** |

### 4.2 Tipos de prueba implementados

| Tipo | Herramienta | Cantidad | Descripción |
|------|-------------|---------|-------------|
| Unitarias | Jest | 6 | Validación, lógica de negocio |
| Integración | Jest + Supertest | 10 | Endpoints HTTP completos |
| **Total** | | **16** | |

### 4.3 Casos de prueba por categoría SENA

| Categoría | Tests |
|-----------|-------|
| Pruebas funcionales (happy path) | T01, T02, T03, T08, T09, T10, T11, T12, T15, T16 |
| Pruebas de error (error path) | T04, T05, T06 |
| Pruebas de seguridad | T13, T14, T07 |

---

## 5. Tiempo estimado vs real

| Sprint | Tiempo estimado (hrs) | Tiempo real (hrs) | Variación |
|--------|----------------------|-------------------|-----------|
| Sprint 1 — Base | 20 | 22 | +10% |
| Sprint 2 — Citas | 20 | 18 | -10% |
| Sprint 3 — Clínico | 22 | 24 | +9% |
| Sprint 4 — Seguridad | 18 | 16 | -11% |
| Sprint 5 — Frontend | 24 | 28 | +17% |
| Sprint 6 — Docs | 14 | 12 | -14% |
| **Total** | **118** | **120** | **+1.7%** |

*Variación total < 5% indica buena estimación — resultado: ACEPTABLE*

---

## 6. Checklist de calidad por módulo

### Backend
- [x] Todos los endpoints validados con express-validator
- [x] Prepared statements en el 100% de los queries SQL
- [x] Manejo de errores con try/catch en todos los controllers
- [x] Middleware de error global captura excepciones no manejadas
- [x] Autenticación requerida en rutas protegidas
- [x] Control de roles implementado (soloRoles middleware)
- [x] Logs de auditoría en cada intento de login

### Frontend
- [x] Redirección automática al login si no hay token
- [x] Validación de formularios antes de enviar al servidor
- [x] Mensajes de error claros al usuario (toasts)
- [x] Interfaz responsive para móvil y escritorio
- [x] Variables CSS centralizadas en global.css
- [x] Sidebar dinámico según rol del usuario

### Base de datos
- [x] Todas las tablas con PRIMARY KEY
- [x] Foreign keys con ON DELETE y ON UPDATE definidos
- [x] Índices en columnas de búsqueda frecuente
- [x] Charset utf8mb4 para soporte de caracteres especiales
- [x] ENGINE=InnoDB para soporte de transacciones

---

## 7. Estándares de codificación aplicados

### Node.js / JavaScript
- Nombres de variables y funciones en camelCase
- Nombres de archivos en camelCase
- Constantes en UPPER_CASE
- Async/await para operaciones asíncronas (no callbacks)
- Arrow functions para funciones anónimas
- Destructuring para extracción de propiedades

### SQL
- Nombres de tablas en snake_case plural
- Nombres de columnas en snake_case
- PRIMARY KEY siempre nombrada `id_{tabla}`
- Foreign keys nombradas `id_{tabla_referenciada}`
- Comentarios en secciones del script

### HTML/CSS
- Clases CSS en BEM simplificado (bloque__elemento--modificador)
- Variables CSS definidas en `:root`
- Colores solo a través de variables CSS
- Unidades relativas (rem, %) sobre absolutas (px) donde aplique

---

*PSP — MentalPsique v1.0 — Alineado con conocimiento técnico 10 DO-F-012 V08 SENA*
*"Disciplinas de calidad para desarrollar software (PSP-TSP)"*
