const express = require('express');
const router = express.Router();
const { z } = require('zod');
const mongoose = require('mongoose');
const authMiddleware = require('../middleware/authMiddleware');
const validate = require('../middleware/validate');
const Business = require('../models/Business');
const { uniqueNormalizedDomains } = require('../lib/blockedDomains');

const settingsSchema = z.object({
  description: z.string().optional().default(""),
  faqs: z.array(z.object({
    question: z.string().min(1, 'Question is required'),
    answer: z.string().min(1, 'Answer is required')
  })).optional().default([]),
  blockedDomains: z.array(z.string().trim().min(1).max(253)).max(50).optional().default([])
});

router.use(authMiddleware);

// GET /api/settings
router.get('/', async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.status(200).json({ description: '', faqs: [], blockedDomains: [] });
    }
    const business = await Business.findById(req.business);
    if (!business) {
      return res.status(200).json({ description: '', faqs: [], blockedDomains: [] });
    }
    return res.status(200).json({
      description: business.description,
      faqs: business.faqs,
      blockedDomains: business.blockedDomains || []
    });
  } catch (err) {
    return res.status(200).json({ description: '', faqs: [], blockedDomains: [] });
  }
});

// POST /api/settings
router.post('/', validate(settingsSchema), async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({ error: 'Database unavailable. Please try again shortly.' });
    }
    const { description, faqs, blockedDomains } = req.body;
    const business = await Business.findByIdAndUpdate(
      req.business,
      { description, faqs, blockedDomains: uniqueNormalizedDomains(blockedDomains) },
      { new: true }
    );

    if (!business) {
      return res.status(404).json({ error: 'Business not found' });
    }

    return res.status(200).json({
      description: business.description,
      faqs: business.faqs,
      blockedDomains: business.blockedDomains || []
    });
  } catch (err) {
    return res.status(500).json({ error: err.message || 'Internal server error' });
  }
});

module.exports = router;
