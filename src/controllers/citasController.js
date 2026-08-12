const { pool } = require('../config/db');

async function listar(req, res, next) {
  try {
    const { rol, id_usuario } = req.usuario;
    let query, params;

    if (rol === 'paciente') {
      query = `SELECT c.*, u_ps.nombre AS nombre_psicologo, u_ps.apellido AS apellido_psicologo
               FROM citas c
               JOIN pacientes pa ON pa.id_paciente = c.id_paciente
               JOIN psicologos ps ON ps.id_psicologo = c.id_psicologo
               JOIN usuarios u_ps ON u_ps.id_usuario = ps.id_usuario
               WHERE pa.id_usuario = ? ORDER BY c.fecha_hora DESC`;
      params = [id_usuario];
    } else if (rol === 'psicologo') {
      query = `SELECT c.*, u_pa.nombre AS nombre_paciente, u_pa.apellido AS apellido_paciente
               FROM citas c
               JOIN pacientes pa ON pa.id_paciente = c.id_paciente
               JOIN usuarios u_pa ON u_pa.id_usuario = pa.id_usuario
               JOIN psicologos ps ON ps.id_psicologo = c.id_psicologo
               WHERE ps.id_usuario = ? ORDER BY c.fecha_hora DESC`;
      params = [id_usuario];
    } else {
      query = `SELECT c.*,
                 u_pa.nombre AS nombre_paciente, u_pa.apellido AS apellido_paciente,
                 u_ps.nombre AS nombre_psicologo, u_ps.apellido AS apellido_psicologo
               FROM citas c
               JOIN pacientes pa ON pa.id_paciente = c.id_paciente
               JOIN usuarios u_pa ON u_pa.id_usuario = pa.id_usuario
               JOIN psicologos ps ON ps.id_psicologo = c.id_psicologo
               JOIN usuarios u_ps ON u_ps.id_usuario = ps.id_usuario
               ORDER BY c.fecha_hora DESC`;
      params = [];
    }

    const [rows] = await pool.execute(query, params);
    res.json(rows);
  } catch (err) { next(err); }
}

async function crear(req, res, next) {
  try {
    const { id_paciente, id_psicologo, fecha_hora, modalidad, notas_previas } = req.body;

    // Verificar que no haya conflicto de horario
    const [conflicto] = await pool.execute(
      `SELECT id_cita FROM citas
       WHERE id_psicologo = ? AND fecha_hora = ? AND estado NOT IN ('cancelada')`,
      [id_psicologo, fecha_hora]
    );
    if (conflicto.length) {
      return res.status(409).json({ error: 'El psicólogo ya tiene una cita en ese horario' });
    }

    const [result] = await pool.execute(
      `INSERT INTO citas (id_paciente, id_psicologo, fecha_hora, modalidad, notas_previas)
       VALUES (?, ?, ?, ?, ?)`,
      [id_paciente, id_psicologo, fecha_hora, modalidad || 'presencial', notas_previas || null]
    );
    res.status(201).json({ mensaje: 'Cita creada', id_cita: result.insertId });
  } catch (err) { next(err); }
}

async function obtener(req, res, next) {
  try {
    const [rows] = await pool.execute(
      `SELECT c.*,
         u_pa.nombre AS nombre_paciente, u_pa.apellido AS apellido_paciente,
         u_ps.nombre AS nombre_psicologo, u_ps.apellido AS apellido_psicologo
       FROM citas c
       JOIN pacientes pa ON pa.id_paciente = c.id_paciente
       JOIN usuarios u_pa ON u_pa.id_usuario = pa.id_usuario
       JOIN psicologos ps ON ps.id_psicologo = c.id_psicologo
       JOIN usuarios u_ps ON u_ps.id_usuario = ps.id_usuario
       WHERE c.id_cita = ?`,
      [req.params.id]
    );
    if (!rows.length) return res.status(404).json({ error: 'Cita no encontrada' });
    res.json(rows[0]);
  } catch (err) { next(err); }
}

async function cambiarEstado(req, res, next) {
  try {
    const { estado } = req.body;
    const estados = ['pendiente','confirmada','completada','cancelada','no_asistio'];
    if (!estados.includes(estado)) {
      return res.status(422).json({ error: 'Estado inválido' });
    }
    await pool.execute(
      'UPDATE citas SET estado = ? WHERE id_cita = ?',
      [estado, req.params.id]
    );
    res.json({ mensaje: 'Estado actualizado' });
  } catch (err) { next(err); }
}

async function cancelar(req, res, next) {
  req.body.estado = 'cancelada';
  return cambiarEstado(req, res, next);
}


async function editar(req, res, next) {
  try {
    const { id } = req.params;
    const { fecha_hora, modalidad, notas_previas } = req.body;

    if (!fecha_hora) {
      return res.status(422).json({ error: 'La fecha y hora son obligatorias' });
    }

    // Verificar conflicto de horario con otro psicólogo
    const [cita] = await pool.execute(
      'SELECT id_psicologo FROM citas WHERE id_cita = ?', [id]
    );
    if (!cita.length) {
      return res.status(404).json({ error: 'Cita no encontrada' });
    }

    const [conflicto] = await pool.execute(
      `SELECT id_cita FROM citas
       WHERE id_psicologo = ? AND fecha_hora = ?
       AND estado NOT IN ('cancelada') AND id_cita != ?`,
      [cita[0].id_psicologo, fecha_hora, id]
    );
    if (conflicto.length) {
      return res.status(409).json({ error: 'El psicólogo ya tiene una cita en ese horario' });
    }

    await pool.execute(
      `UPDATE citas SET fecha_hora = ?, modalidad = ?, notas_previas = ?
       WHERE id_cita = ?`,
      [fecha_hora, modalidad || 'presencial', notas_previas || null, id]
    );

    res.json({ mensaje: 'Cita actualizada correctamente' });
  } catch (err) { next(err); }
}

async function eliminar(req, res, next) {
  try {
    const { id } = req.params;

    // Verificar que no tenga sesión registrada
    const [sesion] = await pool.execute(
      'SELECT id_sesion FROM sesiones WHERE id_cita = ?', [id]
    );
    if (sesion.length) {
      return res.status(409).json({
        error: 'No se puede eliminar una cita que ya tiene sesión registrada. Elimina la sesión primero.'
      });
    }

    await pool.execute('DELETE FROM citas WHERE id_cita = ?', [id]);

    res.json({ mensaje: 'Cita eliminada correctamente' });
  } catch (err) { next(err); }
}

module.exports = { listar, crear, obtener, cambiarEstado, cancelar, editar, eliminar };
