module.exports.validateId = (paramName) => (req, res, next) => {
  const value = Number(req.params[paramName]);
  if (!Number.isInteger(value) || value <= 0) {
    return res.status(400).json({ error: `Invalid ${paramName}` });
  }
  req.params[paramName] = value;
  next();
};
