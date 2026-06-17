const bcrypt = require('bcryptjs');

module.exports = async (req, res, next) => {
  try {
    if (req.body.password) {
      const salt = await bcrypt.genSalt(10);
      req.body.password_hash = await bcrypt.hash(req.body.password, salt);
      delete req.body.password;
    }
    next();
  } catch (error) {
    next(error);
  }
};
