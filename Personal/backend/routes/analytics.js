const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const authMiddleware = require('../middleware/authMiddleware');
const Conversation = require('../models/Conversation');

router.use(authMiddleware);

// GET /api/analytics?range=hourly|daily|yearly
router.get('/', async (req, res) => {
  try {
    const range = req.query.range || 'daily';
    let conversations = [];

    if (mongoose.connection.readyState === 1) {
      try {
        conversations = await Conversation.find({ businessId: req.business });
      } catch (err) {
        conversations = [];
      }
    }

    const totalChats = conversations.length;
    let resolved = 0, open = 0, positiveRatings = 0, negativeRatings = 0;

    conversations.forEach(conv => {
      if (conv.status === 'resolved') resolved++;
      if (conv.status === 'open') open++;
      if (conv.rating === 'up') positiveRatings++;
      if (conv.rating === 'down') negativeRatings++;
    });

    const now = new Date();
    let chartData = [];

    if (range === 'hourly') {
      for (let i = 23; i >= 0; i--) {
        const slotStart = new Date(now);
        slotStart.setMinutes(0, 0, 0);
        slotStart.setHours(slotStart.getHours() - i);
        const slotEnd = new Date(slotStart);
        slotEnd.setHours(slotEnd.getHours() + 1);
        const count = conversations.filter(conv => {
          if (!conv.createdAt) return false;
          const t = new Date(conv.createdAt).getTime();
          return t >= slotStart.getTime() && t < slotEnd.getTime();
        }).length;
        const h = slotStart.getHours().toString().padStart(2, '0');
        chartData.push({ date: `${h}:00`, count });
      }
    } else if (range === 'daily') {
      for (let i = 29; i >= 0; i--) {
        const d = new Date(now);
        d.setDate(d.getDate() - i);
        const dateStr = d.toISOString().split('T')[0];
        const count = conversations.filter(conv => {
          if (!conv.createdAt) return false;
          return new Date(conv.createdAt).toISOString().split('T')[0] === dateStr;
        }).length;
        const label = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        chartData.push({ date: label, count });
      }
    } else if (range === 'yearly') {
      for (let i = 11; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const year = d.getFullYear();
        const month = d.getMonth();
        const count = conversations.filter(conv => {
          if (!conv.createdAt) return false;
          const cd = new Date(conv.createdAt);
          return cd.getFullYear() === year && cd.getMonth() === month;
        }).length;
        const label = d.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
        chartData.push({ date: label, count });
      }
    }

    return res.status(200).json({
      totalChats, resolved, open, positiveRatings, negativeRatings,
      chartData, chatsPerDay: chartData,
    });
  } catch (err) {
    return res.status(200).json({
      totalChats: 0, resolved: 0, open: 0, positiveRatings: 0, negativeRatings: 0,
      chartData: [], chatsPerDay: [],
    });
  }
});

const CANT_ANSWER_PHRASES = [
  "connect you with our team",
  "don't have information",
  "reach out to",
  "unable to help",
  "contact our team",
  "i'll connect you",
  "i don't have",
  "not able to answer",
];

// GET /api/analytics/alerts — unresolved topics grouped by keyword
router.get('/alerts', async (req, res) => {
  try {
    let conversations = [];
    if (mongoose.connection.readyState === 1) {
      try {
        conversations = await Conversation.find({ businessId: req.business });
      } catch (err) {
        conversations = [];
      }
    }

    const allTopics = [];

    conversations.forEach(conv => {
      (conv.unresolvedTopics || []).forEach(t => {
        allTopics.push({ question: t.question, timestamp: t.timestamp || conv.createdAt });
      });

      const msgs = conv.messages || [];
      for (let i = 1; i < msgs.length; i++) {
        const msg = msgs[i];
        if (msg.role !== 'ai') continue;
        const isUnresolved = CANT_ANSWER_PHRASES.some(phrase =>
          msg.content.toLowerCase().includes(phrase)
        );
        if (!isUnresolved) continue;

        const userMsg = msgs[i - 1];
        if (!userMsg || userMsg.role !== 'user') continue;

        const alreadySaved = (conv.unresolvedTopics || []).some(
          t => t.question === userMsg.content
        );
        if (!alreadySaved) {
          allTopics.push({
            question: userMsg.content,
            timestamp: msg.timestamp || conv.createdAt,
          });
        }
      }
    });

    const totalUnresolved = allTopics.length;
    const grouped = {};

    allTopics.forEach(t => {
      const key = t.question
        .trim()
        .split(/\s+/)
        .slice(0, 3)
        .join(' ')
        .toLowerCase();

      if (!grouped[key]) {
        grouped[key] = { topic: t.question, count: 0, latest: t.timestamp };
      }
      grouped[key].count++;
      if (new Date(t.timestamp) > new Date(grouped[key].latest)) {
        grouped[key].latest = t.timestamp;
      }
    });

    const alerts = Object.values(grouped)
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    const mostAsked = alerts.length > 0 ? alerts[0].topic : null;

    return res.status(200).json({ alerts, totalUnresolved, mostAsked });
  } catch (err) {
    return res.status(200).json({ alerts: [], totalUnresolved: 0, mostAsked: null });
  }
});

module.exports = router;
