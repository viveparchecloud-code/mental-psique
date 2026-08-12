const { pool } = require('../config/db');

const TEXTO_CONSENTIMIENTO = `
CONSENTIMIENTO INFORMADO — MentalPsique v1.0

Yo, como paciente, autorizo a MentalPsique y al profesional de la salud mental asignado a:
1. Recopilar y almacenar mi información personal y clínica de forma confidencial.
2. Usar dicha información exclusivamente para fines terapéuticos.
3. Compartir información con otros profesionales de salud únicamente en caso de riesgo para mi vida o la de terceros.

La información será tratada conforme a la Ley 1581 de 2012 (Habeas Data - Colombia).
`.trim();

async function obtener(req, res, next) {
  try {
    const [rows] = await pool.execute(
      'SELECT * FROM consentimientos WHERE id_paciente = ? ORDER BY id_consentimiento DESC LIMIT 1',
      [req.params.id_paciente]
    );
    res.json(rows[0] || { aceptado: false, texto: TEXTO_CONSENTIMIENTO });
  } catch (err) { next(err); }
}

async function firmar(req, res, next) {
  try {
    const { id_paciente } = req.params;
    const ip = req.ip;

    const [existe] = await pool.execute(
      'SELECT id_consentimiento FROM consentimientos WHERE id_paciente = ? AND aceptado = 1',
      [id_paciente]
    );
    if (existe.length) {
      return res.status(409).json({ error: 'El paciente ya tiene un consentimiento firmado' });
    }

    const [result] = await pool.execute(
      `INSERT INTO consentimientos (id_paciente, contenido, aceptado, fecha_firma, ip_firma)
       VALUES (?, ?, 1, NOW(), ?)`,
      [id_paciente, TEXTO_CONSENTIMIENTO, ip]
    );
    res.status(201).json({ mensaje: 'Consentimiento firmado', id: result.insertId });
  } catch (err) { next(err); }
}

module.exports = { obtener, firmar };
