import { useState, useRef, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { motion, AnimatePresence } from 'motion/react';
import {
  Bot,
  ThumbsUp,
  ThumbsDown,
  Send,
  Sparkles,
  Copy,
  Check,
  RotateCcw,
  Sun,
  Moon,
  HelpCircle,
  Package,
  CreditCard,
  ShieldCheck,
  X,
  MessageSquare,
  Ban
} from 'lucide-react';
import AITextLoading from '../components/ui/ai-text-loading';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

function visitorPageUrl() {
  const fromParam = new URLSearchParams(window.location.search).get('from');
  if (fromParam) return fromParam;
  if (document.referrer) return document.referrer;
  return window.location.href;
}

export default function CustomerChat() {
  const { businessId } = useParams();
  const [sessionId, setSessionId] = useState(() => 'sess_' + Math.random().toString(36).substring(2, 10));
  const [access, setAccess] = useState('checking');

  const [messages, setMessages] = useState([
    {
      role: 'ai',
      content: 'Hello! I am your 24/7 AI Customer Assistant. How can I help you today?',
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [feedbackGiven, setFeedbackGiven] = useState({});
  const [copiedId, setCopiedId] = useState(false);
  const [copiedMsgIdx, setCopiedMsgIdx] = useState(null);
  const [isDarkMode, setIsDarkMode] = useState(false);

  const messagesEndRef = useRef(null);

  useEffect(() => {
    let cancelled = false;
    const pageUrl = visitorPageUrl();
    axios
      .get(`${API_BASE}/api/chat/access`, { params: { businessId, pageUrl } })
      .then((res) => {
        if (!cancelled) setAccess(res.data?.allowed === false ? 'blocked' : 'allowed');
      })
      .catch((err) => {
        if (!cancelled) setAccess(err.response?.status === 403 ? 'blocked' : 'allowed');
      });
    return () => { cancelled = true; };
  }, [businessId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSend = async (textToSend) => {
    const query = textToSend || input.trim();
    if (!query || loading) return;

    if (!textToSend) setInput('');

    setMessages((prev) => [...prev, { role: 'user', content: query }]);
    setLoading(true);

    try {
      const res = await axios.post(`${API_BASE}/api/chat/message`, {
        sessionId,
        userMessage: query,
        businessId,
        pageUrl: visitorPageUrl(),
      });

      const reply = res.data.reply || "I'll connect you with our team.";
      const flagged = res.data.flagged || false;
      setMessages((prev) => [...prev, { role: 'ai', content: reply, flagged }]);
    } catch (err) {
      if (err.response?.status === 403) {
        setAccess('blocked');
        return;
      }
      setMessages((prev) => [
        ...prev,
        {
          role: 'ai',
          content: "Sorry, I am having trouble connecting right now. I'll connect you with our team.",
          flagged: true,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleFeedback = async (msgIndex, rating) => {
    if (feedbackGiven[msgIndex]) return;
    try {
      await axios.post(`${API_BASE}/api/chat/feedback`, {
        sessionId,
        rating,
      });
      setFeedbackGiven((prev) => ({ ...prev, [msgIndex]: rating }));
    } catch (err) {
      console.error('Failed to submit feedback:', err);
    }
  };

  const copySessionId = () => {
    navigator.clipboard.writeText(sessionId);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  const copyMessage = (txt, idx) => {
    navigator.clipboard.writeText(txt);
    setCopiedMsgIdx(idx);
    setTimeout(() => setCopiedMsgIdx(null), 2000);
  };

  const resetSession = () => {
    const newId = 'sess_' + Math.random().toString(36).substring(2, 10);
    setSessionId(newId);
    setMessages([
      {
        role: 'ai',
        content: 'Hello! I am your 24/7 AI Customer Assistant. How can I help you today?',
      },
    ]);
    setFeedbackGiven({});
  };

  const starterChips = [
    { label: '📦 Order Status', query: 'How can I track my order status?' },
    { label: '💳 Payment & Invoice', query: 'Can I provide my bill or invoice details?' },
    { label: '🔄 Return Policy', query: 'What is your return policy?' },
    { label: '❓ Contact Support', query: 'How do I connect with a support agent?' },
  ];

  if (access === 'checking') {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: "'Plus Jakarta Sans', sans-serif",
          color: '#64748b',
          fontSize: 14,
        }}
      >
        Checking access…
      </div>
    );
  }

  if (access === 'blocked') {
    return (
      <div
        style={{
          minHeight: '100vh',
          background: 'radial-gradient(circle at 50% 10%, #f3f4f6 0%, #f8fafc 50%, #f1f5f9 100%)',
          fontFamily: "'Plus Jakarta Sans', sans-serif",
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 24,
        }}
      >
        <div
          style={{
            maxWidth: 420,
            textAlign: 'center',
            background: '#ffffff',
            border: '1px solid #eaecf0',
            borderRadius: 20,
            padding: '40px 32px',
            boxShadow: '0 20px 40px -15px rgba(0,0,0,0.08)',
          }}
        >
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 16,
              background: '#fef2f2',
              border: '1px solid #fecaca',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px',
            }}
          >
            <Ban size={26} style={{ color: '#ef4444' }} />
          </div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: '#0f172a', margin: '0 0 8px' }}>
            Chat unavailable
          </h1>
          <p style={{ fontSize: 14, color: '#64748b', margin: 0, lineHeight: 1.6 }}>
            This support chat is not available on this website.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        background: isDarkMode
          ? 'radial-gradient(circle at 50% 10%, #1e1b4b 0%, #0f172a 45%, #020617 100%)'
          : 'radial-gradient(circle at 50% 10%, #f3f4f6 0%, #f8fafc 50%, #f1f5f9 100%)',
        color: isDarkMode ? '#f8fafc' : '#0f172a',
        fontFamily: "'Plus Jakarta Sans', sans-serif",
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px 16px',
        position: 'relative',
        overflow: 'hidden',
        transition: 'background 0.3s ease, color 0.3s ease',
      }}
    >
      {/* Background Glowing Ambient Orbs */}
      <div
        style={{
          position: 'absolute', top: '-10%', left: '20%', width: 400, height: 400,
          background: 'radial-gradient(circle, rgba(124, 58, 237, 0.25) 0%, rgba(0,0,0,0) 70%)',
          filter: 'blur(60px)', pointerEvents: 'none',
        }}
      />
      <div
        style={{
          position: 'absolute', bottom: '-10%', right: '20%', width: 400, height: 400,
          background: 'radial-gradient(circle, rgba(59, 130, 246, 0.2) 0%, rgba(0,0,0,0) 70%)',
          filter: 'blur(60px)', pointerEvents: 'none',
        }}
      />

      {/* Main Glassmorphic Container */}
      <div
        style={{
          width: '100%', maxWidth: 720, height: 740,
          background: isDarkMode ? 'rgba(15, 23, 42, 0.85)' : 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(20px)',
          border: isDarkMode ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid #e2e8f0',
          borderRadius: 24, display: 'flex', flexDirection: 'column',
          boxShadow: isDarkMode ? '0 25px 50px -12px rgba(0,0,0,0.5), 0 0 30px rgba(124,58,237,0.15)' : '0 20px 40px -15px rgba(0,0,0,0.08)',
          overflow: 'hidden', zIndex: 1,
        }}
      >
        {/* Header Bar */}
        <div
          style={{
            padding: '18px 24px',
            borderBottom: isDarkMode ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid #eaecf0',
            background: isDarkMode ? 'rgba(30, 41, 59, 0.6)' : 'rgba(248, 250, 252, 0.8)',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            backdropFilter: 'blur(10px)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div
              style={{
                width: 44, height: 44, borderRadius: 14,
                background: '#0f172a',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#ffffff', boxShadow: '0 4px 14px rgba(15, 23, 42, 0.25)',
                position: 'relative',
              }}
            >
              <Bot size={24} />
              <span
                style={{
                  position: 'absolute', bottom: -2, right: -2,
                  width: 12, height: 12, borderRadius: '50%',
                  background: '#22c55e', border: '2px solid #0f172a',
                }}
              />
            </div>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <h2 style={{ fontSize: 16, fontWeight: 700, margin: 0, letterSpacing: '-0.3px' }}>
                  Customer Support AI
                </h2>
                <span
                  style={{
                    fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 9999,
                    background: 'rgba(34, 197, 94, 0.15)', color: '#22c55e', border: '1px solid rgba(34, 197, 94, 0.3)',
                    display: 'inline-flex', alignItems: 'center', gap: 4,
                  }}
                >
                  <ShieldCheck size={11} /> Verified Assistant
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 3 }}>
                <span style={{ fontSize: 12, fontFamily: 'monospace', color: isDarkMode ? '#94a3b8' : '#64748b' }}>
                  ID: {sessionId}
                </span>
                <button
                  onClick={copySessionId}
                  title="Copy Session ID"
                  style={{
                    background: 'none', border: 'none', color: isDarkMode ? '#94a3b8' : '#64748b',
                    cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 3, fontSize: 11,
                  }}
                >
                  {copiedId ? <Check size={12} style={{ color: '#22c55e' }} /> : <Copy size={12} />}
                  {copiedId ? 'Copied' : ''}
                </button>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button
              onClick={resetSession}
              title="Reset Chat Session"
              style={{
                padding: '8px 12px', borderRadius: 10, border: isDarkMode ? '1px solid rgba(255,255,255,0.1)' : '1px solid #cbd5e1',
                background: isDarkMode ? 'rgba(255,255,255,0.05)' : '#ffffff',
                color: isDarkMode ? '#cbd5e1' : '#475569', fontSize: 12, fontWeight: 600,
                cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6,
                transition: 'all 0.15s',
              }}
            >
              <RotateCcw size={13} />
              <span>New Chat</span>
            </button>

            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              title="Toggle Theme"
              style={{
                padding: 8, borderRadius: 10, border: isDarkMode ? '1px solid rgba(255,255,255,0.1)' : '1px solid #cbd5e1',
                background: isDarkMode ? 'rgba(255,255,255,0.05)' : '#ffffff',
                color: isDarkMode ? '#fbbf24' : '#6366f1', cursor: 'pointer', display: 'flex',
              }}
            >
              {isDarkMode ? <Sun size={15} /> : <Moon size={15} />}
            </button>
          </div>
        </div>

        {/* Message Log Container */}
        <div style={{ flex: 1, overflowY: 'auto', padding: 24, display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Quick Starter Chips Header */}
          {messages.length <= 2 && (
            <div style={{ marginBottom: 12 }}>
              <p style={{ fontSize: 12, fontWeight: 600, color: isDarkMode ? '#94a3b8' : '#64748b', margin: '0 0 10px' }}>
                💡 Frequently Asked Topics
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {starterChips.map((chip, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSend(chip.query)}
                    style={{
                      padding: '8px 14px', borderRadius: 9999,
                      border: isDarkMode ? '1px solid rgba(255,255,255,0.12)' : '1px solid #e2e8f0',
                      background: isDarkMode ? 'rgba(255,255,255,0.04)' : '#ffffff',
                      color: isDarkMode ? '#e2e8f0' : '#334155',
                      fontSize: 12, fontWeight: 600, cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
                    }}
                  >
                    {chip.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          <AnimatePresence>
            {messages.map((msg, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.2 }}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: msg.role === 'user' ? 'flex-end' : 'flex-start',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4, paddingLeft: 4, paddingRight: 4 }}>
                  <span style={{ fontSize: 11, fontWeight: 600, color: isDarkMode ? '#64748b' : '#94a3b8' }}>
                    {msg.role === 'user' ? 'You' : 'AI Assistant'}
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, maxWidth: '85%' }}>
                  <div
                    style={{
                      padding: '14px 18px',
                      borderRadius: msg.role === 'user' ? '20px 20px 4px 20px' : '4px 20px 20px 20px',
                      fontSize: 14, lineHeight: 1.6,
                      background: msg.role === 'user'
                        ? 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)'
                        : isDarkMode ? '#1e293b' : '#ffffff',
                      color: msg.role === 'user' ? '#ffffff' : isDarkMode ? '#f8fafc' : '#0f172a',
                      border: msg.role === 'user'
                        ? 'none'
                        : isDarkMode ? '1px solid rgba(255,255,255,0.08)' : '1px solid #eaecf0',
                      borderLeft: msg.role === 'user'
                        ? 'none'
                        : '4px solid #0f172a',
                      boxShadow: msg.role === 'user'
                        ? '0 4px 14px rgba(59, 130, 246, 0.3)'
                        : '0 2px 8px rgba(0,0,0,0.04)',
                      wordBreak: 'break-word',
                      position: 'relative',
                    }}
                  >
                    {msg.content}
                  </div>

                  {msg.role === 'ai' && (
                    <button
                      onClick={() => copyMessage(msg.content, index)}
                      title="Copy text"
                      style={{
                        background: 'none', border: 'none', color: isDarkMode ? '#64748b' : '#94a3b8',
                        cursor: 'pointer', padding: 4, marginTop: 4, borderRadius: 6, display: 'flex',
                      }}
                    >
                      {copiedMsgIdx === index ? <Check size={14} style={{ color: '#22c55e' }} /> : <Copy size={14} />}
                    </button>
                  )}
                </div>

                {/* Flagged warning badge */}
                {msg.role === 'ai' && msg.flagged && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 6, marginLeft: 4, fontSize: 12, color: '#f59e0b', fontWeight: 600 }}>
                    ⚠ Flagged for human support review
                  </div>
                )}

                {/* Helpful feedback rating */}
                {msg.role === 'ai' && index > 0 && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 6, marginLeft: 6 }}>
                    <span style={{ fontSize: 11, color: isDarkMode ? '#64748b' : '#94a3b8' }}>Was this helpful?</span>
                    <button
                      onClick={() => handleFeedback(index, 'up')}
                      disabled={!!feedbackGiven[index]}
                      style={{
                        background: feedbackGiven[index] === 'up' ? 'rgba(34, 197, 94, 0.15)' : 'transparent',
                        border: feedbackGiven[index] === 'up' ? '1px solid rgba(34, 197, 94, 0.3)' : isDarkMode ? '1px solid rgba(255,255,255,0.1)' : '1px solid #cbd5e1',
                        color: feedbackGiven[index] === 'up' ? '#22c55e' : isDarkMode ? '#94a3b8' : '#64748b',
                        borderRadius: 6, padding: '2px 8px', fontSize: 11, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4,
                      }}
                    >
                      <ThumbsUp size={11} /> {feedbackGiven[index] === 'up' ? 'Yes' : ''}
                    </button>
                    <button
                      onClick={() => handleFeedback(index, 'down')}
                      disabled={!!feedbackGiven[index]}
                      style={{
                        background: feedbackGiven[index] === 'down' ? 'rgba(239, 68, 68, 0.15)' : 'transparent',
                        border: feedbackGiven[index] === 'down' ? '1px solid rgba(239, 68, 68, 0.3)' : isDarkMode ? '1px solid rgba(255,255,255,0.1)' : '1px solid #cbd5e1',
                        color: feedbackGiven[index] === 'down' ? '#ef4444' : isDarkMode ? '#94a3b8' : '#64748b',
                        borderRadius: 6, padding: '2px 8px', fontSize: 11, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4,
                      }}
                    >
                      <ThumbsDown size={11} /> {feedbackGiven[index] === 'down' ? 'No' : ''}
                    </button>
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>

          {loading && (
            <motion.div
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', margin: '4px 0' }}
            >
              <span style={{ fontSize: 11, fontWeight: 600, color: isDarkMode ? '#64748b' : '#94a3b8', marginBottom: 4, paddingLeft: 4 }}>
                AI Assistant
              </span>
              <div
                style={{
                  background: isDarkMode ? '#1e293b' : '#ffffff',
                  border: isDarkMode ? '1px solid rgba(255,255,255,0.08)' : '1px solid #eaecf0',
                  borderLeft: '4px solid #0f172a',
                  padding: '8px 14px', borderRadius: '4px 16px 16px 16px',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                }}
              >
                <AITextLoading
                  texts={['Thinking...', 'Analyzing...', 'Responding...']}
                  className="text-xs font-semibold text-slate-700"
                  interval={400}
                />
              </div>
            </motion.div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar Dock */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          style={{
            padding: 16,
            borderTop: isDarkMode ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid #eaecf0',
            background: isDarkMode ? 'rgba(30, 41, 59, 0.6)' : 'rgba(248, 250, 252, 0.8)',
            display: 'flex', gap: 10, alignItems: 'center',
            backdropFilter: 'blur(10px)',
          }}
        >
          <div style={{ position: 'relative', flex: 1, display: 'flex', alignItems: 'center' }}>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={loading}
              placeholder="Ask anything or request support..."
              style={{
                width: '100%',
                background: isDarkMode ? '#0f172a' : '#ffffff',
                border: isDarkMode ? '1px solid rgba(255,255,255,0.12)' : '1px solid #cbd5e1',
                borderRadius: 14, padding: '12px 40px 12px 16px',
                fontSize: 14, color: isDarkMode ? '#f8fafc' : '#0f172a',
                outline: 'none', transition: 'border-color 0.2s',
                boxSizing: 'border-box',
              }}
            />
            {input && (
              <button
                type="button"
                onClick={() => setInput('')}
                style={{
                  position: 'absolute', right: 12, background: 'none', border: 'none',
                  color: isDarkMode ? '#94a3b8' : '#64748b', cursor: 'pointer', display: 'flex',
                }}
              >
                <X size={14} />
              </button>
            )}
          </div>

          <button
            type="submit"
            disabled={loading || !input.trim()}
            style={{
              background: loading || !input.trim()
                ? isDarkMode ? 'rgba(255,255,255,0.1)' : '#cbd5e1'
                : '#0f172a',
              color: '#ffffff', border: 'none', borderRadius: 14,
              padding: '12px 20px', fontSize: 14, fontWeight: 600,
              cursor: loading || !input.trim() ? 'not-allowed' : 'pointer',
              display: 'flex', alignItems: 'center', gap: 8,
              boxShadow: loading || !input.trim() ? 'none' : '0 4px 14px rgba(15, 23, 42, 0.25)',
              transition: 'all 0.2s ease',
            }}
          >
            <Send size={15} />
            <span>Send</span>
          </button>
        </form>
      </div>
    </div>
  );
}
