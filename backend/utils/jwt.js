const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRATION= process.env.JWT_EXPIRATION ;

module.exports.createJWT = (payload) => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRATION});
};

module.exports.verifyJWT = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET); // TODO: token should be meaningless, should ask the db to retrieve and return user_data
  } catch (err) {
    return null;
  }
};