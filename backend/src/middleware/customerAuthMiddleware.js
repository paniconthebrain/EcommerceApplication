const { verifyToken } = require('../utils/jwt');
const { isBlacklisted } = require('../utils/tokenBlacklist');
const { AuthenticationError } = require('../utils/errors');

const customerAuthMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AuthenticationError('Missing or invalid authorization header');
    }

    const token = authHeader.slice(7);

    if (await isBlacklisted(token)) {
      throw new AuthenticationError('Token has been revoked — please log in again');
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      throw new AuthenticationError('Invalid or expired token');
    }

    if (decoded.shopId || decoded.userType) {
      throw new AuthenticationError('Invalid token type — use customer auth');
    }

    req.customer = { id: decoded.sub, email: decoded.email };
    req.token = token;
    next();
  } catch (error) {
    next(error);
  }
};

module.exports = customerAuthMiddleware;
