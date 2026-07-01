const { AuthorizationError } = require('../utils/errors');

// Admins can access any shop; staff are restricted to their own shopId.
function assertShopAccess(req, shopId) {
  if (req.user.userType !== 'admin' && req.user.shopId !== shopId) {
    throw new AuthorizationError('Staff can only access their own shop data');
  }
}

// Like assertShopAccess, but passes if the user's shop matches ANY of the given shopIds.
// Useful for two-shop resources (transfers) where staff should be able to see/act on
// a transfer that touches their shop even if they aren't the "primary" shop.
function assertAnyShopAccess(req, shopIds) {
  if (req.user.userType === 'admin') return;
  if (!shopIds.includes(req.user.shopId)) {
    throw new AuthorizationError('Staff can only access transfers involving their own shop');
  }
}

// Express middleware form for routes where the shopId is a path param available
// before any DB lookup (e.g. /shops/:shopId/inventory).
function requireShopParam(paramName = 'shopId') {
  return (req, res, next) => {
    try {
      assertShopAccess(req, req.params[paramName]);
      next();
    } catch (err) {
      next(err);
    }
  };
}

module.exports = { assertShopAccess, assertAnyShopAccess, requireShopParam };
