const { validationResult } = require('express-validator');

function validar(req, res, next) {
  const errores = validationResult(req);
  if (!errores.isEmpty()) {
    return res.status(422).json({ errores: errores.array() });
  }
  next();
}

function errorHandler(err, req, res, next) {
  console.error(`[ERROR] ${err.message}`);
  const status = err.status || 500;
  res.status(status).json({
    error: status === 500 ? 'Error interno del servidor' : err.message,
  });
}

module.exports = { validar, errorHandler };
