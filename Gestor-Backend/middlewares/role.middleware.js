module.exports = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Autenticación requerida' });
    }

    const userRol = String(req.user.rol || '').toLowerCase();
    const isAllowed = allowedRoles.some(
      (role) => role.toLowerCase() === userRol
    );

    if (!isAllowed) {
      return res.status(403).json({ message: 'No tienes permisos suficientes para realizar esta acción' });
    }

    next();
  };
};
