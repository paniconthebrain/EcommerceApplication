const { TokenBlacklist } = require('../models');
const { Op } = require('sequelize');

// Periodically purge expired tokens (runs every hour)
setInterval(async () => {
  try {
    await TokenBlacklist.destroy({ where: { expiresAt: { [Op.lt]: new Date() } } });
  } catch { /* silent */ }
}, 60 * 60 * 1000);

async function blacklistToken(token, expiresInMs = 25 * 60 * 60 * 1000) {
  try {
    const expiresAt = new Date(Date.now() + expiresInMs);
    await TokenBlacklist.upsert({ token, expiresAt });
  } catch (err) {
    console.error('Failed to blacklist token:', err.message);
  }
}

async function isBlacklisted(token) {
  try {
    const entry = await TokenBlacklist.findOne({
      where: { token, expiresAt: { [Op.gt]: new Date() } },
    });
    return !!entry;
  } catch (err) {
    console.error('Blacklist check failed — denying to be safe:', err.message);
    return true;
  }
}

module.exports = { blacklistToken, isBlacklisted };
