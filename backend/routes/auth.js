const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const { z } = require('zod');
const Business = require('../models/Business');
const validate = require('../middleware/validate');

const registerSchema = z.object({
  businessName: z.string().min(1, 'Business name is required'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters')
});

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required')
});

function getJwtSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret || secret === 'your_secret_key') {
    throw new Error('JWT_SECRET is not configured');
  }
  return secret;
}

function requireDb(res) {
  if (mongoose.connection.readyState !== 1) {
    res.status(503).json({ error: 'Database unavailable. Please try again shortly.' });
    return false;
  }
  return true;
}

// POST /api/auth/register
router.post('/register', validate(registerSchema), async (req, res) => {
  try {
    if (!requireDb(res)) return;

    const { businessName, email, password } = req.body;

    const existing = await Business.findOne({ email });
    if (existing) {
      return res.status(409).json({ error: 'Email already registered' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const newBusiness = new Business({
      businessName,
      email,
      passwordHash
    });
    await newBusiness.save();

    const token = jwt.sign(
      { businessId: newBusiness._id },
      getJwtSecret(),
      { expiresIn: '7d' }
    );

    return res.status(201).json({
      token,
      businessId: newBusiness._id,
      businessName: newBusiness.businessName,
      email: newBusiness.email
    });
  } catch (err) {
    if (err.message === 'JWT_SECRET is not configured') {
      return res.status(500).json({ error: 'Server auth is misconfigured' });
    }
    return res.status(500).json({ error: err.message || 'Internal server error' });
  }
});

// POST /api/auth/login
router.post('/login', validate(loginSchema), async (req, res) => {
  try {
    if (!requireDb(res)) return;

    const { email, password } = req.body;

    const business = await Business.findOne({ email });
    if (!business) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const isMatch = await bcrypt.compare(password, business.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const token = jwt.sign(
      { businessId: business._id },
      getJwtSecret(),
      { expiresIn: '7d' }
    );

    return res.status(200).json({
      token,
      businessId: business._id,
      businessName: business.businessName,
      email: business.email
    });
  } catch (err) {
    console.error('Login error:', err);
    if (err.message === 'JWT_SECRET is not configured') {
      return res.status(500).json({ error: 'Server auth is misconfigured' });
    }
    return res.status(500).json({ error: err.message || 'Internal server error' });
  }
});

module.exports = router;
