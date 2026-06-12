// middlewares/validate.js
// Tiny declarative validator so controllers stay clean.
// Usage: router.post('/register', validate(['name', 'email', 'password']), handler)

function validate(requiredFields = []) {
  return (req, res, next) => {
    const missing = requiredFields.filter(
      (f) => req.body[f] === undefined || String(req.body[f]).trim() === ''
    );
    if (missing.length > 0) {
      return res.status(400).json({
        message: `Missing required field(s): ${missing.join(', ')}`,
      });
    }
    next();
  };
}

module.exports = validate;
