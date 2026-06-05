const { verifyToken } = require('../utils/jwt');
const { isBlacklisted } = require('../utils/tokenBlacklist');
const { AuthenticationError, AuthorizationError } = require('../utils/errors');

function authMiddleware(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AuthenticationError('Missing or invalid authorization header');
    }

    const token = authHeader.substring(7);

    if (isBlacklisted(token)) {
      throw new AuthenticationError('Token has been revoked — please log in again');
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      throw new AuthenticationError('Invalid or expired token');
    }

    if (!decoded.userType) {
      throw new AuthenticationError('Invalid token type — staff access required');
    }

    req.user = decoded;
    req.token = token;
    next();
  } catch (error) {
    next(error);
  }
}

function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user) {
      return next(new AuthenticationError('Authentication required'));
    }
    if (!roles.includes(req.user.userType)) {
      return next(new AuthorizationError('Insufficient permissions'));
    }
    next();
  };
}

module.exports = { authMiddleware, requireRole };
