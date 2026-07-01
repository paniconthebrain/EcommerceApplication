const express = require('express');
const { NewsletterSubscriber } = require('../models');
const { ValidationError } = require('../utils/errors');

const router = express.Router();

// POST /api/newsletter/subscribe — public
router.post('/subscribe', async (req, res, next) => {
  try {
    const email = (req.body.email || '').trim().toLowerCase();
    if (!email.includes('@')) throw new ValidationError('Valid email is required');

    const [, created] = await NewsletterSubscriber.findOrCreate({ where: { email } });
    res.status(created ? 201 : 200).json({ message: 'Subscribed', alreadySubscribed: !created });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
