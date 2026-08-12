require('dotenv').config();  // Carga variables secretas desde un archivo .env para seguridad
const express        = require('express');  // Importa Express, el framework para crear el servidor web
const cors           = require('cors');  // Importa CORS para permitir conexiones desde otros sitios web
const morgan         = require('morgan');  // Importa Morgan para registrar logs de peticiones al servidor
const rateLimit      = require('express-rate-limit');  // Importa Rate Limit para limitar peticiones y evitar ataques
const swaggerUi      = require('swagger-ui-express');  // Importa Swagger UI para mostrar documentación de la API
const swaggerSpec    = require('./config/swagger');  // Importa la configuración de Swagger desde otro archivo
const { testConnection, pool } = require('./config/db');  // Importa funciones para probar y conectar a la base de datos
const { errorHandler } = require('./middleware/errorHandler');  // Importa el manejador de errores desde otro archivo

const authRouter = require('./routes/auth');  // Importa las rutas de autenticación (login, registro)
const citasRouter = require('./routes/citas');  // Importa las rutas de citas
const { pacRouter, psRouter, histRouter, sesRouter, conRouter } = require('./routes/index');  // Importa rutas de pacientes, psicólogos, historias, sesiones y consentimientos

const app = express();  // Crea la aplicación principal de Express (el servidor)

app.use((req, res, next) => {  // Aplica una función a todas las peticiones para agregar headers de seguridad
  res.setHeader('X-Content-Type-Options', 'nosniff');  // Bloquea tipos de contenido peligrosos
  res.setHeader('X-Frame-Options', 'DENY');  // Evita que el sitio se cargue en frames de otros sitios
  res.setHeader('X-XSS-Protection', '1; mode=block');  // Protege contra ataques XSS (inyección de código)
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');  // Controla cómo se envía la información de referencia
  if (process.env.NODE_ENV === 'production') {  // Si el entorno es producción (no desarrollo)
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');  // Fuerza conexiones seguras HTTPS
  }
  next();  // Pasa al siguiente middleware
});

app.use(cors());  // Permite conexiones desde otros dominios (útil para el frontend)
app.use(express.json({ limit: '10kb' }));  // Permite recibir datos en formato JSON con un límite de 10KB
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));  // Registra logs de peticiones (modo dev o combined)
app.use(express.static('public'));  // Sirve archivos estáticos (CSS, JS, imágenes) desde la carpeta public
app.get('/', (req, res) => res.redirect('/index.html'));  // Si van a la raíz, redirige a index.html

app.use(rateLimit({  // Aplica límite de peticiones
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,  // Ventana de tiempo: 15 minutos por defecto
  max:      parseInt(process.env.RATE_LIMIT_MAX)        || 100,  // Máximo 100 peticiones por ventana
  message:  { error: 'Demasiadas solicitudes, intenta más tarde' },  // Mensaje de error si se excede
  standardHeaders: true,  // Incluye headers estándar
  legacyHeaders: false,  // No incluye headers antiguos
}));

const API = '/api/v1';  // Define el prefijo para todas las rutas de la API
app.use(`${API}/auth`,            authRouter);  // Conecta rutas de autenticación bajo /api/v1/auth
app.use(`${API}/citas`,           citasRouter);  // Conecta rutas de citas bajo /api/v1/citas
app.use(`${API}/pacientes`,       pacRouter);  // Conecta rutas de pacientes bajo /api/v1/pacientes
app.use(`${API}/psicologos`,      psRouter);  // Conecta rutas de psicólogos bajo /api/v1/psicologos
app.use(`${API}/historias`,       histRouter);  // Conecta rutas de historias bajo /api/v1/historias
app.use(`${API}/sesiones`,        sesRouter);  // Conecta rutas de sesiones bajo /api/v1/sesiones
app.use(`${API}/consentimientos`, conRouter);  // Conecta rutas de consentimientos bajo /api/v1/consentimientos

app.use(`${API}/docs`, swaggerUi.serve, swaggerUi.setup(swaggerSpec, {  // Sirve la documentación Swagger
  customSiteTitle: 'MentalPsique API Docs',  // Título personalizado para la página
  customCss: '.swagger-ui .topbar { background-color: #3D5445; }',  // Estilo CSS personalizado
}));

app.get(`${API}/health`, async (req, res) => {  // Ruta para chequeo de salud
  let dbStatus = 'ok';  // Asume que la DB está OK
  try { await pool.execute('SELECT 1'); } catch { dbStatus = 'error'; }  // Prueba la conexión a la DB
  res.json({  // Responde con un JSON
    status:    dbStatus === 'ok' ? 'ok' : 'degraded',  // Estado general
    version:   '1.0.0',  // Versión de la app
    timestamp: new Date().toISOString(),  // Fecha y hora actual
    uptime:    `${Math.floor(process.uptime())}s`,  // Tiempo que el servidor ha estado corriendo
    entorno:   process.env.NODE_ENV || 'development',  // Entorno (desarrollo o producción)
    servicios: { api: 'ok', database: dbStatus },  // Estado de servicios
  });
});

app.use((req, res) => {  // Middleware para rutas no encontradas (404)
  res.status(404).json({ error: `Ruta ${req.originalUrl} no encontrada` });  // Responde con error 404
});

app.use(errorHandler);  // Aplica el manejador global de errores

const PORT = process.env.PORT || 3000;  // Define el puerto (del .env o 3000 por defecto)
if (require.main === module) {  // Si este archivo se ejecuta directamente (no importado)
  testConnection().then(() => {  // Prueba la conexión a la DB primero
    app.listen(PORT, () => {  // Inicia el servidor en el puerto
      console.log(`\n🚀 Servidor corriendo en http://localhost:${PORT}`);  // Mensaje en consola
      console.log(`📖 Swagger docs:  http://localhost:${PORT}${API}/docs`);  // URL de documentación
      console.log(`💚 Health check:  http://localhost:${PORT}${API}/health`);  // URL de health check
      console.log(`🌐 Frontend:      http://localhost:${PORT}\n`);  // URL del frontend
    });
  });
}

module.exports = app;  // Exporta la app para que otros archivos puedan usarla