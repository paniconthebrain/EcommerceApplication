const express = require('express');
const multer = require('multer');
const { Op } = require('sequelize');
const { JobApplication } = require('../models');
const { authMiddleware, requireRole } = require('../middleware/authMiddleware');
const { ValidationError } = require('../utils/errors');
const { publicWriteLimiter } = require('../middleware/rateLimiters');

const router = express.Router();

const VALID_POSITIONS = [
  'Store Associate', 'Cashier', 'Delivery Driver', 'Warehouse Staff',
  'Customer Service', 'Shift Supervisor', 'Store Manager', 'Other',
];

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype !== 'application/pdf') return cb(new Error('Only PDF files are allowed'));
    cb(null, true);
  },
});

// POST /api/careers/apply — public
router.post('/apply', publicWriteLimiter, upload.single('resume'), async (req, res, next) => {
  try {
    const { name, email, phone, position, coverLetter } = req.body;

    if (!name?.trim()) throw new ValidationError('Name is required');
    if (!email?.includes('@')) throw new ValidationError('Valid email is required');
    if (!position?.trim() || !VALID_POSITIONS.includes(position.trim())) throw new ValidationError('Invalid position selected');
    if (!req.file) throw new ValidationError('Resume PDF is required');

    // Reject duplicate application for same email within 7 days
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const existing = await JobApplication.findOne({
      where: { email: email.trim().toLowerCase(), createdAt: { [Op.gte]: sevenDaysAgo } },
    });
    if (existing) throw new ValidationError('An application from this email was already submitted recently. Please wait 7 days before reapplying.');

    // Verify actual PDF magic bytes (%PDF = 0x25 0x50 0x44 0x46)
    if (req.file.buffer.slice(0, 4).toString('ascii') !== '%PDF') {
      return res.status(400).json({ error: 'File must be a valid PDF document' });
    }

    const resumeBase64 = `data:application/pdf;base64,${req.file.buffer.toString('base64')}`;

    // Sanitize filename — strip path separators and non-safe characters
    const safeFilename = req.file.originalname
      .replace(/[^a-zA-Z0-9._-]/g, '_')
      .replace(/\.{2,}/g, '.')
      .slice(0, 100);

    const application = await JobApplication.create({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone: phone?.trim() || null,
      position: position.trim(),
      coverLetter: coverLetter?.trim() || null,
      resumeBase64,
      resumeFilename: safeFilename,
    });

    res.status(201).json({ message: 'Application submitted successfully', id: application.id });
  } catch (err) {
    if (err.message === 'Only PDF files are allowed') {
      return res.status(400).json({ error: err.message });
    }
    next(err);
  }
});

// GET /api/careers/applications — admin only
router.get('/applications', authMiddleware, requireRole('admin'), async (req, res, next) => {
  try {
    const applications = await JobApplication.findAll({
      attributes: ['id', 'name', 'email', 'phone', 'position', 'coverLetter', 'resumeFilename', 'status', 'createdAt'],
      order: [['createdAt', 'DESC']],
    });
    res.json(applications);
  } catch (err) {
    next(err);
  }
});

// GET /api/careers/applications/:id/resume — admin only, returns base64 PDF
router.get('/applications/:id/resume', authMiddleware, requireRole('admin'), async (req, res, next) => {
  try {
    const app = await JobApplication.findByPk(req.params.id, {
      attributes: ['resumeBase64', 'resumeFilename'],
    });
    if (!app) throw new ValidationError('Application not found');
    res.json({ resumeBase64: app.resumeBase64, resumeFilename: app.resumeFilename });
  } catch (err) {
    next(err);
  }
});

// PATCH /api/careers/applications/:id/status — admin only
router.patch('/applications/:id/status', authMiddleware, requireRole('admin'), async (req, res, next) => {
  try {
    const { status } = req.body;
    if (!['new', 'reviewed', 'rejected'].includes(status)) throw new ValidationError('Invalid status');
    const app = await JobApplication.findByPk(req.params.id);
    if (!app) throw new ValidationError('Application not found');
    await app.update({ status });
    res.json({ message: 'Status updated' });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/careers/applications/:id — admin only
router.delete('/applications/:id', authMiddleware, requireRole('admin'), async (req, res, next) => {
  try {
    const app = await JobApplication.findByPk(req.params.id);
    if (!app) throw new ValidationError('Application not found');
    await app.destroy();
    res.json({ message: 'Application deleted' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
