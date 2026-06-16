const express = require('express');
const { EmailTemplate } = require('../models');
const { authMiddleware } = require('../middleware/authMiddleware');
const { sendEmail } = require('../utils/emailService');
const { ValidationError } = require('../utils/errors');

const router = express.Router();

const DEFAULT_TEMPLATES = [
  {
    type: 'password_reset',
    label: 'Password Reset',
    subject: 'Reset your GoGoPantry password',
    body: `<div style="font-family:sans-serif;max-width:560px;margin:0 auto;padding:32px 24px;background:#fff;border-radius:12px;">
  <h2 style="color:#1a1a1a;margin-bottom:8px;">Reset your password</h2>
  <p style="color:#555;margin-bottom:24px;">Hi {{name}},</p>
  <p style="color:#555;margin-bottom:24px;">We received a request to reset the password for your GoGoPantry account.</p>
  <a href="{{reset_link}}" style="display:inline-block;background:#16a34a;color:#fff;padding:12px 28px;border-radius:8px;text-decoration:none;font-weight:600;margin-bottom:24px;">Reset Password</a>
  <p style="color:#888;font-size:13px;">This link expires in 1 hour. If you didn't request a reset, you can safely ignore this email.</p>
  <hr style="border:none;border-top:1px solid #eee;margin:24px 0;">
  <p style="color:#aaa;font-size:12px;">GoGoPantry · Fresh groceries delivered to your door</p>
</div>`,
    enabled: true,
  },
];

async function seedDefaultTemplates() {
  for (const tpl of DEFAULT_TEMPLATES) {
    await EmailTemplate.findOrCreate({ where: { type: tpl.type }, defaults: tpl });
  }
}

// Seed on route load
seedDefaultTemplates().catch(console.error);

// GET /api/email/templates — admin only
router.get('/templates', authMiddleware, async (req, res, next) => {
  try {
    if (req.user.userType !== 'admin') return res.status(403).json({ error: 'Admin only' });
    const templates = await EmailTemplate.findAll({ order: [['type', 'ASC']] });
    res.json({ templates });
  } catch (err) {
    next(err);
  }
});

// PUT /api/email/templates/:type — admin only
router.put('/templates/:type', authMiddleware, async (req, res, next) => {
  try {
    if (req.user.userType !== 'admin') return res.status(403).json({ error: 'Admin only' });
    const { subject, body, enabled } = req.body;
    if (!subject || !body) throw new ValidationError('Subject and body are required');

    const tpl = await EmailTemplate.findOne({ where: { type: req.params.type } });
    if (!tpl) return res.status(404).json({ error: 'Template not found' });

    await tpl.update({ subject, body, ...(enabled !== undefined && { enabled }) });
    res.json({ template: tpl });
  } catch (err) {
    next(err);
  }
});

// POST /api/email/test — send a test email to the logged-in admin
router.post('/test', authMiddleware, async (req, res, next) => {
  try {
    if (req.user.userType !== 'admin') return res.status(403).json({ error: 'Admin only' });
    const { type, to } = req.body;
    if (!to) throw new ValidationError('Recipient email is required');

    const tpl = await EmailTemplate.findOne({ where: { type } });
    if (!tpl) return res.status(404).json({ error: 'Template not found' });

    await sendEmail({
      to,
      subject: tpl.subject,
      body: tpl.body,
      vars: {
        name: 'Test User',
        reset_link: `${process.env.APP_URL || 'http://localhost:3001'}/#reset-password-preview`,
      },
    });

    res.json({ success: true, message: `Test email sent to ${to}` });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
