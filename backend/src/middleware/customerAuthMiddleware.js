const { verifyToken } = require('../utils/jwt');
const { AuthenticationError } = require('../utils/errors');

// Middleware to verify customer JWT token
const customerAuthMiddleware = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AuthenticationError('Missing or invalid authorization header');
    }

    const token = authHeader.slice(7); // Remove 'Bearer ' prefix
    const decoded = verifyToken(token);

    if (!decoded) {
      throw new AuthenticationError('Invalid or expired token');
    }

    // Verify this is a customer token (doesn't have shopId claim)
    if (decoded.shopId || decoded.userType) {
      throw new AuthenticationError('Invalid token type - use customer auth');
    }

    // Attach customer info to request
    req.customer = {
      id: decoded.sub,
      email: decoded.email,
    };
    req.token = token;

    next();
  } catch (error) {
    next(error);
  }
};

module.exports = customerAuthMiddleware;
