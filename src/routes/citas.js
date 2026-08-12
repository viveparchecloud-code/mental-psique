const router = require('express').Router();
const { body } = require('express-validator');
const ctrl = require('../controllers/citasController');
const { verificarToken, soloRoles } = require('../middleware/auth');
const { validar } = require('../middleware/errorHandler');

/**
 * @swagger
 * tags:
 *   name: Citas
 *   description: Gestión de citas médicas
 *
 * /citas:
 *   get:
 *     tags: [Citas]
 *     summary: Listar citas (filtradas por rol)
 *     responses:
 *       200: { description: Lista de citas }
 *   post:
 *     tags: [Citas]
 *     summary: Crear nueva cita
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [id_paciente, id_psicologo, fecha_hora]
 *             properties:
 *               id_paciente:  { type: integer }
 *               id_psicologo: { type: integer }
 *               fecha_hora:   { type: string, format: date-time }
 *               modalidad:    { type: string, enum: [presencial, videollamada, telefonica] }
 *               notas_previas: { type: string }
 *     responses:
 *       201: { description: Cita creada }
 *       409: { description: Conflicto de horario }
 *
 * /citas/{id}:
 *   get:
 *     tags: [Citas]
 *     summary: Obtener cita por ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200: { description: Datos de la cita }
 *       404: { description: No encontrada }
 *
 * /citas/{id}/estado:
 *   patch:
 *     tags: [Citas]
 *     summary: Cambiar estado de la cita
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               estado: { type: string, enum: [pendiente,confirmada,completada,cancelada,no_asistio] }
 *     responses:
 *       200: { description: Estado actualizado }
 *
 * /citas/{id}/cancelar:
 *   patch:
 *     tags: [Citas]
 *     summary: Cancelar una cita
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200: { description: Cita cancelada }
 */

router.use(verificarToken);

router.get('/', ctrl.listar);

router.post('/',
  soloRoles('paciente', 'admin'),
  [
    body('id_paciente').isInt(),
    body('id_psicologo').isInt(),
    body('fecha_hora').isISO8601(),
  ],
  validar,
  ctrl.crear
);

router.get('/:id', ctrl.obtener);

router.patch('/:id/estado',
  soloRoles('psicologo', 'admin'),
  ctrl.cambiarEstado
);

router.patch('/:id/cancelar', ctrl.cancelar);

/**
 * @swagger
 * /citas/{id}:
 *   put:
 *     tags: [Citas]
 *     summary: Editar fecha, modalidad y notas de una cita
 *     parameters:
 *       - in: path
 *         name: id
 *         schema: { type: integer }
 *     responses:
 *       200: { description: Cita actualizada }
 *       409: { description: Conflicto de horario }
 *   delete:
 *     tags: [Citas]
 *     summary: Eliminar cita definitivamente
 *     parameters:
 *       - in: path
 *         name: id
 *         schema: { type: integer }
 *     responses:
 *       200: { description: Eliminada }
 *       409: { description: Tiene sesión registrada }
 */
router.put('/:id',
  soloRoles('admin', 'psicologo'),
  ctrl.editar
);

router.delete('/:id',
  soloRoles('admin'),
  ctrl.eliminar
);



module.exports = router;



