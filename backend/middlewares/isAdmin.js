const { isAdmin } = require("../utils/roles");

module.exports.isAdmin = (req, res, next) => {
  if (!isAdmin(req.user)) {
    return res.status(403).json({ error: "Forbidden ADMIN ONLY!!!" });
  }
  next();
};
