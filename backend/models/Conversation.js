const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema({
  role: { type: String, enum: ["user", "ai"], required: true },
  content: { type: String, required: true },
  timestamp: { type: Date, default: Date.now }
});

const UnresolvedTopicSchema = new mongoose.Schema({
  question: { type: String, required: true },
  timestamp: { type: Date, default: Date.now }
});

const ConversationSchema = new mongoose.Schema({
  businessId: { type: mongoose.Schema.Types.ObjectId, ref: 'Business', required: true },
  sessionId: { type: String, required: true, unique: true },
  customerName: { type: String, default: "Customer" },
  status: { type: String, enum: ["open", "resolved"], default: "open" },
  rating: { type: String, enum: ["up", "down", null], default: null },
  messages: [MessageSchema],
  unresolvedTopics: [UnresolvedTopicSchema],
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Conversation', ConversationSchema);
