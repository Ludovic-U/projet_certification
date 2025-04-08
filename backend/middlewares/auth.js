const {verifyJWT } = require('../utils/jwt.js');

module.exports.authenticateUser = (req, res, next) => {
  const token = req.cookies.token;

  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  const user = verifyJWT(token);

  if (!user) {
    return res.status(401).json({ error: 'Invalid token' });
  }

  req.user = user; // make user accessible to other routes
  next();
};