/**
 * Higher-order function to handle async controller errors gracefully.
 * Wraps a controller function and catches any rejected promises.
 *
 * - If the error has `code === "P2025"`, responds with `404 Not Found`.
 * - Otherwise, logs the error and responds with `500 Internal Server Error`.
 *
 * @function asyncErrorHandler
 * @param {Function} fn - The async controller function to wrap. Must accept `(req, res)` and return a Promise.
 * @returns {Function} An Express-compatible controller function `(req, res)` with error handling applied.
 */
module.exports.asyncErrorHandler = (fn) => {
  return (req, res) =>
    fn(req, res).catch((error) => {
      if (error.code === "P2025") {
        return res.status(404).json({ error: "Resource not found" });
      }
      console.error("Controller error:", error);
      res.status(500).json({ error: "Internal server error" });
    });
};
