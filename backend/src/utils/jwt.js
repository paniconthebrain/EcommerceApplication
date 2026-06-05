const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';

function generateToken(user, type = 'staff') {
  const payload = {
    sub: user.id,
    email: user.email,
  };

  // Add type-specific claims
  if (type === 'staff') {
    payload.userType = user.userType;
    payload.shopId = user.shopId;
  }
  // Customer tokens don't include userType or shopId

  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
}

function decodeToken(token) {
  try {
    return jwt.decode(token);
  } catch (error) {
    return null;
  }
}

module.exports = {
  generateToken,
  verifyToken,
  decodeToken,
};
