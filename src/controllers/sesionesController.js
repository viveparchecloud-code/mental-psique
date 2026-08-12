const { pool } = require('../config/db');

async function listarPorHistoria(req, res, next) {
  try {
    const [rows] = await pool.execute(
      `SELECT s.*, c.fecha_hora, c.modalidad
       FROM sesiones s
       JOIN citas c ON c.id_cita = s.id_cita
       WHERE s.id_historia = ?
       ORDER BY s.fecha DESC`,
      [req.params.id_historia]
    );
    res.json(rows);
  } catch (err) { next(err); }
}

async function crear(req, res, next) {
  try {
    const { id_historia, id_cita, fecha, evolucion, plan_tratamiento, observaciones, proxima_cita_sugerida } = req.body;
    const [result] = await pool.execute(
      `INSERT INTO sesiones (id_historia, id_cita, fecha, evolucion, plan_tratamiento, observaciones, proxima_cita_sugerida)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [id_historia, id_cita, fecha, evolucion, plan_tratamiento || null,
       observaciones || null, proxima_cita_sugerida || null]
    );
    // Marcar cita como completada
    await pool.execute("UPDATE citas SET estado='completada' WHERE id_cita=?", [id_cita]);
    res.status(201).json({ mensaje: 'Sesión registrada', id_sesion: result.insertId });
  } catch (err) { next(err); }
}

async function obtener(req, res, next) {
  try {
    const [rows] = await pool.execute(
      'SELECT * FROM sesiones WHERE id_sesion = ?', [req.params.id]
    );
    if (!rows.length) return res.status(404).json({ error: 'Sesión no encontrada' });
    res.json(rows[0]);
  } catch (err) { next(err); }
}

async function actualizar(req, res, next) {
  try {
    const { id } = req.params;
    const { evolucion, plan_tratamiento, observaciones } = req.body;

    if (!evolucion) {
      return res.status(422).json({ error: 'La evolución es obligatoria' });
    }

    await pool.execute(
      `UPDATE sesiones 
       SET evolucion = ?, plan_tratamiento = ?, observaciones = ?
       WHERE id_sesion = ?`,
      [evolucion, plan_tratamiento || null, observaciones || null, id]
    );

    res.json({ mensaje: 'Sesión actualizada correctamente' });
  } catch (err) { next(err); }
}

async function eliminar(req, res, next) {
  try {
    const { id } = req.params;

    const [rows] = await pool.execute(
      'SELECT id_sesion, id_cita FROM sesiones WHERE id_sesion = ?', [id]
    );
    if (!rows.length) {
      return res.status(404).json({ error: 'Sesión no encontrada' });
    }

    // Revertir la cita a confirmada para que pueda registrarse de nuevo
    await pool.execute(
      "UPDATE citas SET estado = 'confirmada' WHERE id_cita = ?",
      [rows[0].id_cita]
    );

    await pool.execute(
      'DELETE FROM sesiones WHERE id_sesion = ?', [id]
    );

    res.json({ mensaje: 'Sesión eliminada correctamente' });
  } catch (err) { next(err); }
}

module.exports = { listarPorHistoria, crear, obtener, actualizar, eliminar };
