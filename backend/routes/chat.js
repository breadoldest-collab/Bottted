const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Business = require('../models/Business');
const Conversation = require('../models/Conversation');
const { isVisitorBlocked } = require('../lib/blockedDomains');

function visitorContext(req, extraPageUrl) {
  return {
    pageUrl: extraPageUrl || req.body?.pageUrl || req.query?.pageUrl,
    referer: req.get('referer') || req.get('referrer'),
    origin: req.get('origin'),
  };
}

function blockedChatResponse() {
  return {
    error: 'This support chat is not available on this website.',
    allowed: false,
  };
}

const CANT_ANSWER_PHRASES = [
  "connect you with our team",
  "don't have information",
  "reach out to",
  "unable to help",
  "contact our team",
  "not able to answer",
];

const GREETING_WORDS = ["hi", "hello", "hey", "good morning", "good afternoon", "greetings", "howdy", "hi there", "hello there"];

function getSmartFallbackReply(userMessage, business) {
  const msg = userMessage.toLowerCase();

  // 1. FAQ Matcher
  if (business?.faqs?.length) {
    for (const faq of business.faqs) {
      const q = faq.question.toLowerCase();
      const keywords = q.split(' ').filter(w => w.length > 3);
      if (keywords.length > 0 && keywords.some(kw => msg.includes(kw))) {
        return faq.answer;
      }
    }
  }

  // 2. Bill / Invoice / Payment Intent
  if (msg.includes('bill') || msg.includes('invoice') || msg.includes('payment') || msg.includes('receipt') || msg.includes('charge')) {
    return "Yes, absolutely! You can share your bill details or invoice number right here. If you need payment processing or refund help, I can also log this for our team.";
  }

  // 3. Identity / Who are you / Who am I
  if (msg.includes('who am i') || msg.includes('who are you') || msg.includes('what is this')) {
    return `I am the AI Customer Support Assistant for ${business?.businessName || 'CXBot'}. You are our valued customer! How can I assist you today?`;
  }

  // 4. Contact / Support Intent
  if (msg.includes('contact') || msg.includes('support') || msg.includes('phone') || msg.includes('email') || msg.includes('help')) {
    return `Our support team is ready to assist! You can share your question or contact info here, and we'll follow up with you.`;
  }

  // 5. Default intelligent response for any query
  return `As your AI Assistant for ${business?.businessName || 'CXBot'}, I am happy to help with your inquiry about "${userMessage}". Feel free to ask any question!`;
}

// GET /api/chat/access — used by the widget before it opens
router.get('/access', async (req, res) => {
  try {
    const { businessId, pageUrl } = req.query;
    if (!businessId) {
      return res.status(400).json({ error: 'businessId is required', allowed: false });
    }

    if (mongoose.connection.readyState !== 1) {
      return res.status(200).json({ allowed: true, blockedDomains: [] });
    }

    let business = null;
    try {
      business = await Business.findById(businessId).select('blockedDomains');
    } catch (dbErr) {
      return res.status(200).json({ allowed: true, blockedDomains: [] });
    }

    const blockedDomains = business?.blockedDomains || [];
    const blocked = isVisitorBlocked({
      ...visitorContext(req, pageUrl),
      blockedDomains,
    });

    if (blocked) {
      return res.status(403).json(blockedChatResponse());
    }

    return res.status(200).json({ allowed: true });
  } catch (err) {
    return res.status(200).json({ allowed: true });
  }
});

// POST /api/chat/message
router.post('/message', async (req, res) => {
  try {
    const { sessionId, userMessage, businessId, pageUrl } = req.body;

    if (!sessionId || !userMessage || !businessId) {
      return res.status(400).json({ error: 'sessionId, userMessage, and businessId are required' });
    }

    // Strip punctuation to normalize greetings (e.g., "hi'", "hi!", "hello...")
    const normalized = userMessage.trim().toLowerCase().replace(/[^a-z0-9\s]/g, '');
    const isGreeting = GREETING_WORDS.some(w => normalized === w || normalized.startsWith(w + " "));

    const dbReady = mongoose.connection.readyState === 1;

    let business = null;
    if (dbReady) {
      try {
        business = await Business.findById(businessId);
      } catch (dbErr) {
        // Skip DB if error
      }
    }

    if (isVisitorBlocked({
      ...visitorContext(req, pageUrl),
      blockedDomains: business?.blockedDomains || [],
    })) {
      return res.status(403).json(blockedChatResponse());
    }

    const businessName = business?.businessName || 'CXBot Support';
    const description = business?.description || 'We provide 24/7 customer support.';
    const faqList = (business?.faqs || [])
      .map(faq => `Q: ${faq.question}\nA: ${faq.answer}`)
      .join('\n\n');

    let conversation = null;
    if (dbReady) {
      try {
        conversation = await Conversation.findOne({ sessionId });
        if (!conversation) {
          conversation = new Conversation({
            businessId,
            sessionId,
            customerName: 'Customer',
            messages: [],
            unresolvedTopics: [],
          });
        }
      } catch (dbErr) { /* skip */ }
    }

    // Use a plain in-memory object when DB is unavailable
    if (!conversation) {
      conversation = {
        businessId,
        sessionId,
        customerName: 'Customer',
        messages: [],
        unresolvedTopics: [],
        _isPlain: true,
      };
    }

    // ── Prepare response ──────────────────────────────────────────────────────
    let aiReplyText = '';

    if (isGreeting) {
      aiReplyText = `Hello! Welcome to ${businessName}. How can I help you today?`;
    } else {
      const systemPrompt = `You are a friendly, highly intelligent AI Assistant for ${businessName}.

STORE KNOWLEDGE BASE & OVERVIEW:
${description}

FAQS:
${faqList || "None provided"}

YOUR INSTRUCTIONS:
1. You are a fully capable AI language model. You can answer ANYTHING the user asks (general knowledge, science, math, technology, recommendations, store questions, products, policies, or general conversation).
2. For questions about store products, FAQs, shipping, or business details, use the STORE KNOWLEDGE BASE above.
3. For any other query, question, or task, answer helpful, accurately, and intelligently as an AI assistant for ${businessName}.
4. Keep answers engaging, polite, and concise (1-4 sentences).`;

      const history = (conversation.messages || []).map(msg => ({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: msg.content }]
      }));

      const geminiApiKey = process.env.GEMINI_API_KEY || '';
      const candidateModels = ['gemini-flash-lite-latest', 'gemini-3.5-flash-lite'];

      for (const modelName of candidateModels) {
        if (aiReplyText) break;
        try {
          const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${geminiApiKey}`;
          const response = await fetch(geminiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            signal: AbortSignal.timeout(10000), // 10-second timeout
            body: JSON.stringify({
              contents: [...history, { role: 'user', parts: [{ text: userMessage }] }],
              systemInstruction: { parts: [{ text: systemPrompt }] }
            })
          });

          if (response.ok) {
            const data = await response.json();
            const extracted = data?.candidates?.[0]?.content?.parts?.[0]?.text;
            if (extracted) {
              aiReplyText = extracted.trim();
            }
          }
        } catch (apiErr) {
          // Timeout or API error -> fallback immediately
        }
      }

      if (!aiReplyText) {
        aiReplyText = getSmartFallbackReply(userMessage, business);
      }
    }

    // ── Flag unresolved ONLY if explicitly matched AND NOT a greeting ───────
    const cantAnswer = !isGreeting && CANT_ANSWER_PHRASES.some(phrase =>
      aiReplyText.toLowerCase().includes(phrase)
    );

    if (cantAnswer) {
      conversation.unresolvedTopics.push({
        question: userMessage,
        timestamp: new Date(),
      });
    }

    conversation.messages.push({ role: 'user', content: userMessage });
    conversation.messages.push({ role: 'ai', content: aiReplyText, flagged: cantAnswer });

    // Persist new and existing conversations when DB is available
    if (dbReady && !conversation._isPlain) {
      try {
        await conversation.save();
      } catch (saveErr) {
        console.warn('Conversation save failed:', saveErr.message);
      }
    }

    return res.status(200).json({
      reply: aiReplyText,
      flagged: cantAnswer,
      sessionId: conversation.sessionId,
    });

  } catch (err) {
    console.error('Chat error:', err);
    return res.status(200).json({
      reply: "Hello! How can I help you today?",
      flagged: false,
      sessionId: req.body.sessionId || 'sess_default',
    });
  }
});

// POST /api/chat/feedback
router.post('/feedback', async (req, res) => {
  try {
    const { sessionId, rating } = req.body;

    if (!sessionId || !['up', 'down'].includes(rating)) {
      return res.status(400).json({ error: 'sessionId and rating (up|down) are required' });
    }

    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({ error: 'Database unavailable. Please try again shortly.' });
    }

    const conversation = await Conversation.findOneAndUpdate(
      { sessionId },
      { rating },
      { new: true }
    );

    if (!conversation) {
      return res.status(404).json({ error: 'Conversation not found' });
    }

    return res.status(200).json({ sessionId, rating: conversation.rating });
  } catch (err) {
    console.error('Feedback error:', err);
    return res.status(500).json({ error: err.message || 'Internal server error' });
  }
});

module.exports = router;
