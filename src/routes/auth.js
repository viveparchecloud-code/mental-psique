const router = require('express').Router();
const { body } = require('express-validator');
const ctrl = require('../controllers/authController');
const { verificarToken } = require('../middleware/auth');
const { validar } = require('../middleware/errorHandler');

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Autenticación y registro de usuarios
 *
 * /auth/login:
 *   post:
 *     tags: [Auth]
 *     summary: Iniciar sesión
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email:    { type: string, example: laura.gomez@mentalpsique.com }
 *               password: { type: string, example: "MiPass123!" }
 *     responses:
 *       200:
 *         description: Token JWT y datos del usuario
 *       401:
 *         description: Credenciales incorrectas
 *
 * /auth/registro:
 *   post:
 *     tags: [Auth]
 *     summary: Registrar nuevo usuario
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [nombre, apellido, email, password]
 *             properties:
 *               nombre:   { type: string }
 *               apellido: { type: string }
 *               email:    { type: string }
 *               password: { type: string, minLength: 8 }
 *               rol:      { type: string, enum: [paciente, psicologo, admin] }
 *     responses:
 *       201: { description: Usuario creado }
 *       409: { description: Email ya registrado }
 *
 * /auth/perfil:
 *   get:
 *     tags: [Auth]
 *     summary: Obtener perfil del usuario autenticado
 *     responses:
 *       200: { description: Datos del usuario }
 */

router.post('/login',
  [body('email').isEmail(), body('password').notEmpty()],
  validar,
  ctrl.login
);

router.post('/registro',
  [
    body('nombre').notEmpty().trim(),
    body('apellido').notEmpty().trim(),
    body('email').isEmail().normalizeEmail(),
    body('password').isLength({ min: 8 }),
  ],
  validar,
  ctrl.registro
);

router.get('/perfil', verificarToken, ctrl.perfil);

module.exports = router;
