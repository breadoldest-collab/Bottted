const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const Conversation = require('../models/Conversation');

router.use(authMiddleware);

// GET /api/conversations
router.get('/', async (req, res) => {
  try {
    if (require('mongoose').connection.readyState !== 1) {
      return res.status(200).json([]);
    }
    const conversations = await Conversation.find({ businessId: req.business })
      .sort({ createdAt: -1 });

    const result = conversations.map(conv => {
      const lastMsg = conv.messages && conv.messages.length > 0
        ? conv.messages[conv.messages.length - 1].content
        : "";

      return {
        sessionId: conv.sessionId,
        customerName: conv.customerName,
        status: conv.status,
        rating: conv.rating,
        messageCount: conv.messages ? conv.messages.length : 0,
        createdAt: conv.createdAt,
        lastMessage: lastMsg
      };
    });

    return res.status(200).json(result);
  } catch (err) {
    return res.status(200).json([]);
  }
});

// POST /api/conversations/assistant — AI Admin Copilot
router.post('/assistant', async (req, res) => {
  try {
    const { prompt } = req.body;
    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    // Gracefully handle no DB connection
    let conversations = [];
    if (require('mongoose').connection.readyState === 1) {
      try {
        conversations = await Conversation.find({ businessId: req.business })
          .sort({ createdAt: -1 });
      } catch (dbErr) { /* skip */ }
    }

    const total = conversations.length;
    const openConvs = conversations.filter(c => c.status === 'open');
    const resolvedConvs = conversations.filter(c => c.status === 'resolved');

    // Build context summary for Gemini
    const openSummaries = openConvs.map(c => {
      const msgs = (c.messages || []).map(m => `${m.role.toUpperCase()}: ${m.content}`).join(' | ');
      return `Session [${c.sessionId}] (${c.customerName}): ${msgs || 'No messages'}`;
    }).join('\n');

    const resolvedSummaries = resolvedConvs.map(c => {
      const lastMsg = c.messages?.length > 0 ? c.messages[c.messages.length - 1].content : '';
      return `Session [${c.sessionId}] Rating: ${c.rating || 'unrated'}, Last: "${lastMsg}"`;
    }).join('\n');

    const dbStatus = `TOTAL CONVERSATIONS: ${total}\nOPEN / PENDING CONVERSATIONS (${openConvs.length}):\n${openSummaries || 'None'}\n\nRESOLVED CONVERSATIONS (${resolvedConvs.length}):\n${resolvedSummaries || 'None'}`;

    const systemPrompt = `You are CXBot Admin Copilot, an AI assistant for the store owner.\nHere is the real-time conversation data for their business:\n\n${dbStatus}\n\nRULES:\n- DO NOT use any markdown asterisks (no **, no ***, no *).\n- Use clean bullet points (•) or clean headers.\n- Keep formatting minimal, elegant, and readable.`;

    const geminiApiKey = process.env.GEMINI_API_KEY || '';
    const candidateModels = ['gemini-flash-lite-latest', 'gemini-3.5-flash-lite'];

    let reply = `You currently have ${openConvs.length} open conversations and ${total} total chats logged.`;

    let gotReply = false;
    for (const modelName of candidateModels) {
      if (gotReply) break;
      try {
        const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${geminiApiKey}`;
        const response = await fetch(geminiUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          signal: AbortSignal.timeout(10000),
          body: JSON.stringify({
            contents: [{ role: 'user', parts: [{ text: prompt }] }],
            systemInstruction: { parts: [{ text: systemPrompt }] }
          })
        });
        if (response.ok) {
          const data = await response.json();
          const extracted = data?.candidates?.[0]?.content?.parts?.[0]?.text;
          if (extracted) { reply = extracted.trim(); gotReply = true; }
        }
      } catch (apiErr) { /* try next model */ }
    }

    return res.status(200).json({ reply, openCount: openConvs.length, total });
  } catch (err) {
    return res.status(200).json({ reply: 'The database is temporarily unavailable, but I am here to help! Ask me anything about managing customer support.', openCount: 0, total: 0 });
  }
});

// GET /api/conversations/:sessionId
router.get('/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params;
    const conversation = await Conversation.findOne({
      sessionId,
      businessId: req.business
    });

    if (!conversation) {
      return res.status(404).json({ error: 'Conversation not found' });
    }

    return res.status(200).json(conversation);
  } catch (err) {
    return res.status(500).json({ error: err.message || 'Internal server error' });
  }
});

module.exports = router;
