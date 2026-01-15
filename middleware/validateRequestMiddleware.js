const { validationResult } = require('express-validator');

function validateRequest(req, res, next) {
  console.log("Validating request:", req.body, req.query, req.params);
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log("Validation errors:", errors.array());
    return res.status(400).json({ errors: errors.array() });
  }
  next();
}

module.exports = { validateRequest };
