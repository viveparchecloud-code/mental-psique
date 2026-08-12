const { pool } = require('../config/db');

async function listar(req, res, next) {
  try {
    const [rows] = await pool.execute(
      `SELECT ps.id_psicologo, u.nombre, u.apellido, u.email,
              ps.especialidad, ps.descripcion_bio, ps.foto_url,
              ps.duracion_sesion, ps.precio_sesion,
              ps.numero_tarjeta, u.activo
       FROM psicologos ps
       JOIN usuarios u ON u.id_usuario = ps.id_usuario
       ORDER BY u.apellido`
    );
    res.json(rows);
  } catch (err) { next(err); }
}

async function obtener(req, res, next) {
  try {
    const [rows] = await pool.execute(
      `SELECT ps.*, u.nombre, u.apellido, u.email
       FROM psicologos ps
       JOIN usuarios u ON u.id_usuario = ps.id_usuario
       WHERE ps.id_psicologo = ?`,
      [req.params.id]
    );
    if (!rows.length) return res.status(404).json({ error: 'Psicólogo no encontrado' });
    res.json(rows[0]);
  } catch (err) { next(err); }
}

async function disponibilidad(req, res, next) {
  try {
    const [rows] = await pool.execute(
      'SELECT * FROM disponibilidad WHERE id_psicologo = ? ORDER BY dia_semana, hora_inicio',
      [req.params.id]
    );
    res.json(rows);
  } catch (err) { next(err); }
}


// agrgar funciones para crear, actualizar y eliminar psicólogos si es necesario

async function crear(req, res, next) {
  try {
    const { nombre, apellido, email, password, especialidad,
            numero_tarjeta, duracion_sesion, precio_sesion, descripcion_bio } = req.body;

    // Verificar si el email ya existe
    const [existe] = await pool.execute(
      'SELECT id_usuario FROM usuarios WHERE email = ?', [email]
    );
    if (existe.length) {
      return res.status(409).json({ error: 'El email ya está registrado' });
    }

    const bcrypt = require('bcryptjs');
    const hash = await bcrypt.hash(password, parseInt(process.env.BCRYPT_ROUNDS) || 10);

    // Crear usuario con rol psicólogo
    const [resUser] = await pool.execute(
      'INSERT INTO usuarios (nombre, apellido, email, password_hash, rol) VALUES (?, ?, ?, ?, ?)',
      [nombre, apellido, email, hash, 'psicologo']
    );
    const id_usuario = resUser.insertId;

    // Crear perfil de psicólogo
    await pool.execute(
      `INSERT INTO psicologos (id_usuario, especialidad, numero_tarjeta, duracion_sesion, precio_sesion, descripcion_bio)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [id_usuario, especialidad, numero_tarjeta,
       duracion_sesion || 60, precio_sesion || 0, descripcion_bio || null]
    );

    res.status(201).json({ mensaje: 'Psicólogo creado correctamente' });
  } catch (err) {
    next(err);
  }
}

// agregar funciones para crear, actualizar y eliminar psicólogos si es necesario


async function desactivar(req, res, next) {
  try {
    const { id } = req.params;

    // Primero obtener el id_usuario del psicólogo
    const [rows] = await pool.execute(
      'SELECT id_usuario FROM psicologos WHERE id_psicologo = ?',
      [id]
    );
    if (!rows.length) {
      return res.status(404).json({ error: 'Psicólogo no encontrado' });
    }

    await pool.execute(
      'UPDATE usuarios SET activo = 0 WHERE id_usuario = ?',
      [rows[0].id_usuario]
    );

    res.json({ mensaje: 'Psicólogo desactivado correctamente' });
  } catch (err) { next(err); }
}

async function activar(req, res, next) {
  try {
    const { id } = req.params;

    const [rows] = await pool.execute(
      'SELECT id_usuario FROM psicologos WHERE id_psicologo = ?',
      [id]
    );
    if (!rows.length) {
      return res.status(404).json({ error: 'Psicólogo no encontrado' });
    }

    await pool.execute(
      'UPDATE usuarios SET activo = 1 WHERE id_usuario = ?',
      [rows[0].id_usuario]
    );

    res.json({ mensaje: 'Psicólogo activado correctamente' });
  } catch (err) { next(err); }
}


async function actualizar(req, res, next) {
  try {
    const { id } = req.params;
    const { especialidad, numero_tarjeta, duracion_sesion, 
            precio_sesion, descripcion_bio } = req.body;

    await pool.execute(
      `UPDATE psicologos 
       SET especialidad=?, numero_tarjeta=?, 
           duracion_sesion=?, precio_sesion=?, descripcion_bio=?
       WHERE id_psicologo=?`,
      [especialidad, numero_tarjeta, duracion_sesion, 
       precio_sesion, descripcion_bio || null, id]
    );
    res.json({ mensaje: 'Psicólogo actualizado correctamente' });
  } catch (err) { next(err); }
}


async function eliminar(req, res, next) {
  try {
    const { id } = req.params;

    // Obtener id_usuario del psicólogo
    const [rows] = await pool.execute(
      'SELECT id_usuario FROM psicologos WHERE id_psicologo = ?', [id]
    );
    if (!rows.length) return res.status(404).json({ error: 'Psicólogo no encontrado' });

    const id_usuario = rows[0].id_usuario;

    // Eliminar en orden por las FK
    await pool.execute('DELETE FROM disponibilidad WHERE id_psicologo = ?', [id]);
    await pool.execute('DELETE FROM psicologos WHERE id_psicologo = ?', [id]);
    await pool.execute('DELETE FROM usuarios WHERE id_usuario = ?', [id_usuario]);

    res.json({ mensaje: 'Psicólogo eliminado correctamente' });
  } catch (err) { next(err); }
}



module.exports = { listar, obtener, disponibilidad, crear, actualizar, desactivar, activar, eliminar };
