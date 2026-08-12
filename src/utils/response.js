/* ============================================================
   MentalPsique — utils/response.js
   Respuestas HTTP estandarizadas para toda la API
   ============================================================ */

/**
 * Respuesta exitosa estándar
 * @param {import('express').Response} res
 * @param {*} data
 * @param {string} mensaje
 * @param {number} status
 */
function ok(res, data, mensaje = 'OK', status = 200) {
  return res.status(status).json({ ok: true, mensaje, data });
}

/**
 * Respuesta de creación exitosa
 */
function created(res, data, mensaje = 'Recurso creado') {
  return ok(res, data, mensaje, 201);
}

/**
 * Respuesta de error con mensaje
 */
function error(res, mensaje, status = 400) {
  return res.status(status).json({ ok: false, error: mensaje });
}

/**
 * Respuesta 404 estándar
 */
function notFound(res, recurso = 'Recurso') {
  return error(res, `${recurso} no encontrado`, 404);
}

/**
 * Respuesta 403 estándar (autorización)
 */
function forbidden(res, msg = 'Acceso denegado') {
  return error(res, msg, 403);
}

/**
 * Respuesta 401 estándar (autenticación)
 */
function unauthorized(res, msg = 'No autenticado') {
  return error(res, msg, 401);
}

module.exports = { ok, created, error, notFound, forbidden, unauthorized };
