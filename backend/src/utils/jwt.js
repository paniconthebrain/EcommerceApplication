const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  console.error('WARNING: JWT_SECRET environment variable is not set — auth will fail');
}
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '15m';
const JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || '7d';

const JWT_ALGORITHM = 'HS256';

function generateToken(user, type = 'staff') {
  const payload = { sub: user.id, email: user.email };
  if (type === 'staff') {
    payload.userType = user.userType;
    payload.shopId = user.shopId;
  }
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN, algorithm: JWT_ALGORITHM });
}

function generateRefreshToken(user, type = 'staff') {
  const payload = { sub: user.id, tokenType: 'refresh' };
  if (type === 'staff') {
    payload.userType = user.userType;
    payload.shopId = user.shopId;
  }
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_REFRESH_EXPIRES_IN, algorithm: JWT_ALGORITHM });
}

function verifyToken(token) {
  try {
    // Pin the algorithm so a token signed (or forged) with a different
    // algorithm than the server issues is never accepted (alg-confusion).
    return jwt.verify(token, JWT_SECRET, { algorithms: [JWT_ALGORITHM] });
  } catch {
    return null;
  }
}

module.exports = { generateToken, generateRefreshToken, verifyToken };
