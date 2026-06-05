const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error('FATAL: JWT_SECRET environment variable is not set.');
}
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '15m';
const JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || '7d';

function generateToken(user, type = 'staff') {
  const payload = { sub: user.id, email: user.email };
  if (type === 'staff') {
    payload.userType = user.userType;
    payload.shopId = user.shopId;
  }
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

function generateRefreshToken(user, type = 'staff') {
  const payload = { sub: user.id, tokenType: 'refresh' };
  if (type === 'staff') {
    payload.userType = user.userType;
    payload.shopId = user.shopId;
  }
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_REFRESH_EXPIRES_IN });
}

function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch {
    return null;
  }
}

module.exports = { generateToken, generateRefreshToken, verifyToken };
