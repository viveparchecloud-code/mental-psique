const { pool } = require('../config/db');

async function obtener(req, res, next) {
  try {
    const { id_paciente } = req.params;

    // IDOR: paciente solo ve su propia historia
    if (req.usuario.rol === 'paciente') {
      const [mine] = await pool.execute(
        'SELECT id_paciente FROM pacientes WHERE id_usuario = ?',
        [req.usuario.id_usuario]
      );
      if (!mine.length || mine[0].id_paciente !== parseInt(id_paciente)) {
        return res.status(403).json({ error: 'Acceso denegado' });
      }
    }

    const [rows] = await pool.execute(
      `SELECT h.*,
         u_pa.nombre AS nombre_paciente, u_pa.apellido AS apellido_paciente,
         u_ps.nombre AS nombre_psicologo, u_ps.apellido AS apellido_psicologo
       FROM historias_clinicas h
       JOIN pacientes pa ON pa.id_paciente = h.id_paciente
       JOIN usuarios u_pa ON u_pa.id_usuario = pa.id_usuario
       JOIN psicologos ps ON ps.id_psicologo = h.id_psicologo
       JOIN usuarios u_ps ON u_ps.id_usuario = ps.id_usuario
       WHERE h.id_paciente = ?`,
      [id_paciente]
    );
    if (!rows.length) return res.status(404).json({ error: 'Historia clínica no encontrada' });
    res.json(rows[0]);
  } catch (err) { next(err); }
}

async function crear(req, res, next) {
  try {
    const { id_paciente, motivo_consulta, antecedentes, diagnostico_cie, diagnostico_desc } = req.body;

    const [existe] = await pool.execute(
      'SELECT id_historia FROM historias_clinicas WHERE id_paciente = ?', [id_paciente]
    );
    if (existe.length) {
      return res.status(409).json({ error: 'El paciente ya tiene una historia clínica abierta' });
    }

    const [psRows] = await pool.execute(
      'SELECT id_psicologo FROM psicologos WHERE id_usuario = ?', [req.usuario.id_usuario]
    );
    if (!psRows.length) return res.status(403).json({ error: 'No eres psicólogo registrado' });

    const [result] = await pool.execute(
      `INSERT INTO historias_clinicas
         (id_paciente, id_psicologo, motivo_consulta, antecedentes, diagnostico_cie, diagnostico_desc)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [id_paciente, psRows[0].id_psicologo, motivo_consulta, antecedentes || null,
       diagnostico_cie || null, diagnostico_desc || null]
    );
    res.status(201).json({ mensaje: 'Historia clínica creada', id_historia: result.insertId });
  } catch (err) { next(err); }
}

async function actualizar(req, res, next) {
  try {
    const { diagnostico_cie, diagnostico_desc, antecedentes, estado } = req.body;
    await pool.execute(
      `UPDATE historias_clinicas
       SET diagnostico_cie=?, diagnostico_desc=?, antecedentes=?, estado=?
       WHERE id_paciente=?`,
      [diagnostico_cie, diagnostico_desc, antecedentes, estado || 'abierta', req.params.id_paciente]
    );
    res.json({ mensaje: 'Historia clínica actualizada' });
  } catch (err) { next(err); }
}

module.exports = { obtener, crear, actualizar };
