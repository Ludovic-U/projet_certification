module.exports.validateId = (value, name, res) => {
  if (!Number.isInteger(value) || value <= 0) {
    res.status(400).json({ error: `Invalid ${name}` });
    return false;
  }
  return true;
};
