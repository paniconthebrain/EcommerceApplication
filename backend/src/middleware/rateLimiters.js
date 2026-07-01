const rateLimit = require('express-rate-limit');

// Login/signup/password-reset endpoints — kept tight against credential stuffing.
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20,
  message: { error: 'Too many login attempts, please try again later' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Order placement — generous enough for a real shopping session, but stops
// automated stock-griefing (rapidly submitting orders to lock inventory rows).
const orderLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { error: 'Too many orders placed, please try again later' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Public, unauthenticated write endpoints prone to spam (newsletter signup,
// job application submission).
const publicWriteLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { error: 'Too many requests, please try again later' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Public order tracking — no auth, low-entropy order IDs, so this bounds how
// fast an attacker can brute-force IDs to harvest order/delivery details.
const trackLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  message: { error: 'Too many requests, please try again later' },
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = { authLimiter, orderLimiter, publicWriteLimiter, trackLimiter };
