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
