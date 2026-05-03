const { validationResult } = require('express-validator');

exports.runValidation = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const msg = errors.array().map(e => `${e.param}: ${e.msg}`).join('; ');
    return res.status(400).json({ error: msg });
  }
  next();
};

