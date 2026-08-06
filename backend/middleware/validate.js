const validate = (schema) => (req, res, next) => {
  try {
    schema.parse(req.body);
    next();
  } catch (err) {
    if (err.errors) {
      const errorMessages = err.errors.map(e => e.message).join(', ');
      return res.status(400).json({ error: errorMessages });
    }
    return res.status(400).json({ error: err.message || 'Validation error' });
  }
};

module.exports = validate;
