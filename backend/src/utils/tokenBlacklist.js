/**
 * In-memory JWT blacklist for logout invalidation.
 * Tokens are auto-evicted after 25h (longer than max JWT lifetime).
 * For multi-server deployments, replace the Set with a Redis client:
 *   await redis.set(token, '1', 'EX', 90000)
 *   await redis.exists(token)
 */
const blacklist = new Set();

function blacklistToken(token) {
  blacklist.add(token);
  setTimeout(() => blacklist.delete(token), 25 * 60 * 60 * 1000);
}

function isBlacklisted(token) {
  return blacklist.has(token);
}

module.exports = { blacklistToken, isBlacklisted };
