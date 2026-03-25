const jwt = require('jsonwebtoken');

const cryto = require('crypto');
const JWT_SECRET = process.env.JWT_SECRET || crypto.randomBytes(64).toString('hex');
const JWT_EXPIRATION= process.env.JWT_EXPIRATION ;

module.exports.createJWT = (payload) => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRATION});
};

module.exports.verifyJWT = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET); 
  } catch (err) {
    return null;
  }
};