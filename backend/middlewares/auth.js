// middlewares/auth.js
// Protects routes: requires a valid "Authorization: Bearer <token>" header.

const jwt = require('jsonwebtoken');

function verifyToken(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;

  if (!token) {
    return res.status(401).json({ message: 'Not authenticated. Please log in.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = { id: decoded.id, role: decoded.role };
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Session expired. Please log in again.' });
  }
}

module.exports = verifyToken;
