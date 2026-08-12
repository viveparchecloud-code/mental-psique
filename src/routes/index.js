const router = require('express').Router();
const { verificarToken, soloRoles } = require('../middleware/auth');

// ── Pacientes ─────────────────────────────────────────────
const pac = require('../controllers/pacientesController');
/**
 * @swagger
 * tags:
 *   name: Pacientes
 *   description: Gestión de pacientes
 * /pacientes:
 *   get:
 *     tags: [Pacientes]
 *     summary: Listar todos los pacientes (admin/psicologo)
 *     responses:
 *       200: { description: Lista de pacientes }
 * /pacientes/mi-perfil:
 *   get:
 *     tags: [Pacientes]
 *     summary: Perfil del paciente autenticado
 *     responses:
 *       200: { description: Perfil }
 * /pacientes/{id}:
 *   get:
 *     tags: [Pacientes]
 *     summary: Obtener paciente por ID
 *     parameters:
 *       - in: path
 *         name: id
 *         schema: { type: integer }
 *     responses:
 *       200: { description: Datos del paciente }
 *       403: { description: Acceso denegado (IDOR) }
 *   put:
 *     tags: [Pacientes]
 *     summary: Actualizar datos del paciente
 *     parameters:
 *       - in: path
 *         name: id
 *         schema: { type: integer }
 *     responses:
 *       200: { description: Actualizado }
 */
const pacRouter = require('express').Router();
pacRouter.use(verificarToken);
pacRouter.get('/', soloRoles('admin', 'psicologo'), pac.listar);
pacRouter.get('/mi-perfil', soloRoles('paciente'), pac.miPerfil);
pacRouter.get('/:id', pac.obtener);
pacRouter.put('/:id', soloRoles('paciente', 'admin'), pac.actualizar);

pacRouter.patch('/:id/desactivar', soloRoles('admin'), pac.desactivar);
pacRouter.patch('/:id/activar',    soloRoles('admin'), pac.activar);

// ── Psicólogos ────────────────────────────────────────────
const ps = require('../controllers/psicologosController');

/**
 * @swagger
 * tags:
 *   name: Psicólogos
 * /psicologos:
 *   get:
 *     tags: [Psicólogos]
 *     summary: Listar psicólogos disponibles
 *     security: []
 *     responses:
 *       200: { description: Lista }
 * /psicologos/{id}/disponibilidad:
 *   get:
 *     tags: [Psicólogos]
 *     summary: Horarios disponibles del psicólogo
 *     parameters:
 *       - in: path
 *         name: id
 *         schema: { type: integer }
 *     responses:
 *       200: { description: Horarios }
 */
const psRouter = require('express').Router();
psRouter.get('/', ps.listar);
psRouter.get('/:id', ps.obtener);
psRouter.get('/:id/disponibilidad', verificarToken, ps.disponibilidad);
// solo admin puede crear psicólogos, no es una función pública 30-04-26
psRouter.post('/', verificarToken, soloRoles('admin'), ps.crear);

psRouter.patch('/:id/desactivar', verificarToken, soloRoles('admin'), ps.desactivar);
psRouter.patch('/:id/activar',    verificarToken, soloRoles('admin'), ps.activar);
psRouter.put('/:id', verificarToken, soloRoles('admin'), ps.actualizar);
psRouter.delete('/:id', verificarToken, soloRoles('admin'), ps.eliminar);


// ── Historias clínicas ────────────────────────────────────
const hist = require('../controllers/historiasController');
/**
 * @swagger
 * tags:
 *   name: Historias clínicas
 * /historias/{id_paciente}:
 *   get:
 *     tags: [Historias clínicas]
 *     summary: Obtener historia clínica del paciente
 *     parameters:
 *       - in: path
 *         name: id_paciente
 *         schema: { type: integer }
 *     responses:
 *       200: { description: Historia clínica }
 *       403: { description: Acceso denegado }
 *   post:
 *     tags: [Historias clínicas]
 *     summary: Crear historia clínica (solo psicólogo)
 *     responses:
 *       201: { description: Creada }
 *   put:
 *     tags: [Historias clínicas]
 *     summary: Actualizar historia clínica
 *     responses:
 *       200: { description: Actualizada }
 */
const histRouter = require('express').Router();
histRouter.use(verificarToken);
histRouter.get('/:id_paciente', hist.obtener);
histRouter.post('/', soloRoles('psicologo', 'admin'), hist.crear);
histRouter.put('/:id_paciente', soloRoles('psicologo', 'admin'), hist.actualizar);

// ── Sesiones ──────────────────────────────────────────────
const ses = require('../controllers/sesionesController');
/**
 * @swagger
 * tags:
 *   name: Sesiones
 * /sesiones/historia/{id_historia}:
 *   get:
 *     tags: [Sesiones]
 *     summary: Sesiones de una historia clínica
 *     responses:
 *       200: { description: Lista de sesiones }
 * /sesiones:
 *   post:
 *     tags: [Sesiones]
 *     summary: Registrar nota de sesión (solo psicólogo)
 *     responses:
 *       201: { description: Sesión registrada }
 * /sesiones/{id}:
 *   get:
 *     tags: [Sesiones]
 *     summary: Obtener sesión por ID
 *     responses:
 *       200: { description: Sesión }
 */
const sesRouter = require('express').Router();
sesRouter.use(verificarToken);
sesRouter.get('/historia/:id_historia', ses.listarPorHistoria);
sesRouter.post('/', soloRoles('psicologo', 'admin'), ses.crear);
sesRouter.get('/:id', ses.obtener);
sesRouter.put('/:id',    soloRoles('psicologo', 'admin'), ses.actualizar);
sesRouter.delete('/:id', soloRoles('psicologo', 'admin'), ses.eliminar);

// ── Consentimientos ───────────────────────────────────────
const con = require('../controllers/consentimientosController');
/**
 * @swagger
 * tags:
 *   name: Consentimientos
 * /consentimientos/{id_paciente}:
 *   get:
 *     tags: [Consentimientos]
 *     summary: Obtener estado de consentimiento
 *     responses:
 *       200: { description: Estado }
 *   post:
 *     tags: [Consentimientos]
 *     summary: Firmar consentimiento informado
 *     responses:
 *       201: { description: Firmado }
 */
const conRouter = require('express').Router();
conRouter.use(verificarToken);
conRouter.get('/:id_paciente', con.obtener);
conRouter.post('/:id_paciente', soloRoles('paciente'), con.firmar);

module.exports = { pacRouter, psRouter, histRouter, sesRouter, conRouter };
