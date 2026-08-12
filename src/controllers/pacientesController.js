const { pool } = require('../config/db');

async function listar(req, res, next) {
  try {
    const [rows] = await pool.execute(
      `SELECT p.id_paciente, u.nombre, u.apellido, u.email,
              p.fecha_nacimiento, p.telefono, p.ciudad, p.eps, p.estado
       FROM pacientes p
       JOIN usuarios u ON u.id_usuario = p.id_usuario
       ORDER BY u.apellido, u.nombre`
    );
    res.json(rows);
  } catch (err) { next(err); }
}

async function obtener(req, res, next) {
  try {
    const { id } = req.params;

    // IDOR: paciente solo puede ver su propio perfil
    if (req.usuario.rol === 'paciente') {
      const [mine] = await pool.execute(
        'SELECT id_paciente FROM pacientes WHERE id_usuario = ?',
        [req.usuario.id_usuario]
      );
      if (!mine.length || mine[0].id_paciente !== parseInt(id)) {
        return res.status(403).json({ error: 'Acceso denegado' });
      }
    }

    const [rows] = await pool.execute(
      `SELECT p.*, u.nombre, u.apellido, u.email, u.rol
       FROM pacientes p
       JOIN usuarios u ON u.id_usuario = p.id_usuario
       WHERE p.id_paciente = ?`,
      [id]
    );
    if (!rows.length) return res.status(404).json({ error: 'Paciente no encontrado' });
    res.json(rows[0]);
  } catch (err) { next(err); }
}

async function actualizar(req, res, next) {
  try {
    const { id } = req.params;
    const { telefono, direccion, ciudad, eps } = req.body;
    await pool.execute(
      'UPDATE pacientes SET telefono=?, direccion=?, ciudad=?, eps=? WHERE id_paciente=?',
      [telefono, direccion, ciudad, eps, id]
    );
    res.json({ mensaje: 'Paciente actualizado' });
  } catch (err) { next(err); }
}

async function miPerfil(req, res, next) {
  try {
    const [rows] = await pool.execute(
      `SELECT p.*, u.nombre, u.apellido, u.email
       FROM pacientes p
       JOIN usuarios u ON u.id_usuario = p.id_usuario
       WHERE p.id_usuario = ?`,
      [req.usuario.id_usuario]
    );
    if (!rows.length) return res.status(404).json({ error: 'Perfil no encontrado' });
    res.json(rows[0]);
  } catch (err) { next(err); }
}

async function desactivar(req, res, next) {
  try {
    const { id } = req.params;
    await pool.execute(
      'UPDATE pacientes SET estado = ? WHERE id_paciente = ?',
      ['inactivo', id]
    );
    await pool.execute(
      'UPDATE usuarios SET activo = 0 WHERE id_usuario = (SELECT id_usuario FROM pacientes WHERE id_paciente = ?)',
      [id]
    );
    res.json({ mensaje: 'Paciente desactivado correctamente' });
  } catch (err) { next(err); }
}

async function activar(req, res, next) {
  try {
    const { id } = req.params;
    await pool.execute(
      'UPDATE pacientes SET estado = ? WHERE id_paciente = ?',
      ['activo', id]
    );
    await pool.execute(
      'UPDATE usuarios SET activo = 1 WHERE id_usuario = (SELECT id_usuario FROM pacientes WHERE id_paciente = ?)',
      [id]
    );
    res.json({ mensaje: 'Paciente activado correctamente' });
  } catch (err) { next(err); }
}

module.exports = { listar, obtener, actualizar, miPerfil, desactivar, activar };
