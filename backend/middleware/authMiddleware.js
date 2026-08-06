const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized: Missing or invalid token' });
  }

  const secret = process.env.JWT_SECRET;
  if (!secret || secret === 'your_secret_key') {
    return res.status(500).json({ error: 'Server auth is misconfigured' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, secret);
    req.business = decoded.businessId || decoded.id;
    if (!req.business) {
      return res.status(401).json({ error: 'Unauthorized: Invalid token payload' });
    }
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Unauthorized: Invalid token' });
  }
};

module.exports = authMiddleware;
