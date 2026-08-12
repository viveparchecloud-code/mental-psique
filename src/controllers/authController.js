const bcrypt = require('bcryptjs');
const jwt    = require('jsonwebtoken');
const { pool } = require('../config/db');

async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    const [rows] = await pool.execute(
      'SELECT * FROM usuarios WHERE email = ? AND activo = 1',
      [email]
    );
    if (!rows.length) {
      return res.status(401).json({ error: 'Credenciales incorrectas' });
    }

    const usuario = rows[0];
    const valid   = await bcrypt.compare(password, usuario.password_hash);
    if (!valid) {
      await registrarLog(usuario.id_usuario, req.ip, 'fallido');
      return res.status(401).json({ error: 'Credenciales incorrectas' });
    }

    const token = jwt.sign(
      { id_usuario: usuario.id_usuario, rol: usuario.rol, nombre: usuario.nombre },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '8h' }
    );

    await registrarLog(usuario.id_usuario, req.ip, 'exitoso');

    res.json({
      token,
      usuario: {
        id:      usuario.id_usuario,
        nombre:  usuario.nombre,
        apellido: usuario.apellido,
        email:   usuario.email,
        rol:     usuario.rol,
      },
    });
  } catch (err) {
    next(err);
  }
}

async function registro(req, res, next) {
  try {
    const { nombre, apellido, email, password, rol = 'paciente' } = req.body;

    const [existe] = await pool.execute(
      'SELECT id_usuario FROM usuarios WHERE email = ?', [email]
    );
    if (existe.length) {
      return res.status(409).json({ error: 'El email ya está registrado' });
    }

    const hash = await bcrypt.hash(password, parseInt(process.env.BCRYPT_ROUNDS) || 10);

    const [result] = await pool.execute(
      'INSERT INTO usuarios (nombre, apellido, email, password_hash, rol) VALUES (?, ?, ?, ?, ?)',
      [nombre, apellido, email, hash, rol]
    );

    const id_usuario = result.insertId;

    // Si es paciente, crear automáticamente su fila en la tabla pacientes
    if (rol === 'paciente') {
      await pool.execute(
        `INSERT INTO pacientes (id_usuario, fecha_nacimiento, genero, telefono, estado)
         VALUES (?, '2000-01-01', 'prefiero_no_decir', 'Sin especificar', 'activo')`,
        [id_usuario]
      );
    }

    res.status(201).json({ mensaje: 'Usuario creado', id_usuario });
  } catch (err) {
    next(err);
  }
}

async function perfil(req, res, next) {
  try {
    const [rows] = await pool.execute(
      'SELECT id_usuario, nombre, apellido, email, rol, created_at FROM usuarios WHERE id_usuario = ?',
      [req.usuario.id_usuario]
    );
    if (!rows.length) return res.status(404).json({ error: 'Usuario no encontrado' });
    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
}

async function registrarLog(id_usuario, ip, resultado) {
  try {
    await pool.execute(
      'INSERT INTO logs_acceso (id_usuario, ip, resultado) VALUES (?, ?, ?)',
      [id_usuario, ip, resultado]
    );
  } catch (_) {}
}

module.exports = { login, registro, perfil };
