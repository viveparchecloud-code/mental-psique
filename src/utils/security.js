/* ============================================================
   MentalPsique — utils/security.js
   Helpers de seguridad — DO-F-012 V08 ítem 8: Seguridad
   ============================================================ */

/**
 * Sanitiza un string para evitar XSS básico
 * @param {string} str
 * @returns {string}
 */
function sanitizeString(str) {
  if (typeof str !== 'string') return str;
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .trim();
}

/**
 * Valida que un email tenga formato correcto
 * @param {string} email
 * @returns {boolean}
 */
function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/**
 * Valida que una contraseña cumpla los requisitos mínimos
 * Mínimo 8 caracteres
 * @param {string} password
 * @returns {{ valid: boolean, message: string }}
 */
function validatePassword(password) {
  if (!password || password.length < 8) {
    return { valid: false, message: 'La contraseña debe tener mínimo 8 caracteres' };
  }
  return { valid: true, message: 'OK' };
}

/**
 * Obtiene la IP real del cliente considerando proxies
 * @param {import('express').Request} req
 * @returns {string}
 */
function getClientIP(req) {
  return (
    req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
    req.headers['x-real-ip'] ||
    req.connection?.remoteAddress ||
    req.ip ||
    'unknown'
  );
}

/**
 * Genera un mensaje de error seguro (no expone detalles internos en producción)
 * @param {Error} err
 * @returns {string}
 */
function safeErrorMessage(err) {
  if (process.env.NODE_ENV === 'production') {
    return 'Error interno del servidor';
  }
  return err.message;
}

module.exports = {
  sanitizeString,
  isValidEmail,
  validatePassword,
  getClientIP,
  safeErrorMessage,
};
