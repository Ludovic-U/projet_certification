// hash.js
const bcrypt = require("bcrypt");
const crypto = require('crypto');


module.exports.hashPassword = async (plainText) => {
  const saltRounds = parseInt(process.env.HASH_SALT) || 10;
  return await bcrypt.hash(plainText, saltRounds);
}

module.exports.hashToken = (token) => {
  return crypto.createHash('sha256').update(token).digest('hex');
}

// obsolete, use hashPassword instead
module.exports.hashString = async (plainText) => {
  const saltRounds = parseInt(process.env.HASH_SALT) || 10;
  return await bcrypt.hash(plainText, saltRounds);
}

