/**
 * Middleware to validate and sanitize a route parameter as a positive integer ID.
 *
 * @middleware
 * @function validateId
 * @param {string} paramName - The name of the route parameter to validate.
 * @returns {Function} Express middleware function.
 * @throws {400} If the parameter is not a valid positive integer.
 */
module.exports.validateId = (paramName) => (req, res, next) => {
  const value = Number(req.params[paramName]);
  if (!Number.isInteger(value) || value <= 0) {
    return res.status(400).json({ error: `Invalid ${paramName}` });
  }
  req.params[paramName] = value;
  next();
};
