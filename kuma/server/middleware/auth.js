const jwt = require('jsonwebtoken');

module.exports = function(req, res, next) {
  // Header-дан токенді алу
  const token = req.header('x-auth-token');

  // Токен жоқ па тексеру
  if (!token) {
    return res.status(401).json({ message: 'Токен жоқ, қатынау құқығы жоқ' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
    req.user = decoded.user;
    next();
  } catch (err) {
    res.status(401).json({ message: 'Токен жарамсыз' });
  }
};
