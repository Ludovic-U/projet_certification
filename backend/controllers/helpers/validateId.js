/**
 * Validate that a given value is a positive integer ID.
 *
 * - If invalid, sends a `400 Bad Request` response with an error message
 *   and returns `false`.
 * - If valid, returns `true`.
 *
 * @function validateId
 * @param {number} value - The value to validate.
 * @param {string} name - The name of the parameter (used in the error message).
 * @param {import("express").Response} res - Express response object.
 * @returns {boolean} `true` if valid, otherwise `false` (and response sent).
 */
module.exports.validateId = (value, name, res) => {
  if (!Number.isInteger(value) || value <= 0) {
    res.status(400).json({ error: `Invalid ${name}` });
    return false;
  }
  return true;
};
