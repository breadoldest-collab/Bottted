const express = require('express');
const router = express.Router();
const { z } = require('zod');
const mongoose = require('mongoose');
const authMiddleware = require('../middleware/authMiddleware');
const validate = require('../middleware/validate');
const Business = require('../models/Business');

const settingsSchema = z.object({
  description: z.string().optional().default(""),
  faqs: z.array(z.object({
    question: z.string().min(1, 'Question is required'),
    answer: z.string().min(1, 'Answer is required')
  })).optional().default([])
});

router.use(authMiddleware);

// GET /api/settings
router.get('/', async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.status(200).json({ description: '', faqs: [] });
    }
    const business = await Business.findById(req.business);
    if (!business) {
      return res.status(200).json({ description: '', faqs: [] });
    }
    return res.status(200).json({
      description: business.description,
      faqs: business.faqs
    });
  } catch (err) {
    return res.status(200).json({ description: '', faqs: [] });
  }
});

// POST /api/settings
router.post('/', validate(settingsSchema), async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({ error: 'Database unavailable. Please try again shortly.' });
    }
    const { description, faqs } = req.body;
    const business = await Business.findByIdAndUpdate(
      req.business,
      { description, faqs },
      { new: true }
    );

    if (!business) {
      return res.status(404).json({ error: 'Business not found' });
    }

    return res.status(200).json({
      description: business.description,
      faqs: business.faqs
    });
  } catch (err) {
    return res.status(500).json({ error: err.message || 'Internal server error' });
  }
});

module.exports = router;
