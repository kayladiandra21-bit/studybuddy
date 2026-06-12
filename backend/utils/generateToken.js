// utils/generateToken.js
const jwt = require('jsonwebtoken');

/**
 * Create a signed JWT for a user.
 * @param {object} user - { id, role }
 * @param {boolean} rememberMe - if true, token lives much longer (30d vs 1d)
 */
function generateToken(user, rememberMe = false) {
  const expiresIn = rememberMe
    ? process.env.JWT_EXPIRES_REMEMBER || '30d'
    : process.env.JWT_EXPIRES || '1d';

  return jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn,
  });
}

module.exports = generateToken;
