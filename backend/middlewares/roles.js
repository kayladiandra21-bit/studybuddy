// middlewares/roles.js
// Role-based access control. Use AFTER verifyToken:
//   router.get('/admin/stats', verifyToken, requireRole('admin'), handler)

function requireRole(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Not authenticated.' });
    }
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ message: 'You do not have permission to do that.' });
    }
    next();
  };
}

module.exports = requireRole;
