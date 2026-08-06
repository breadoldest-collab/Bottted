import { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import AdminCopilotWidget from '../components/AdminCopilotWidget';
import API from '../api/axios';
import { MessageSquare, CheckCircle2, Clock, ThumbsUp, ThumbsDown, X, User, Bot, Search, Sparkles, RefreshCw, Calendar, Tag } from 'lucide-react';

const cleanText = (txt) => {
  if (!txt) return '';
  return txt
    .replace(/\*\*\*/g, '')
    .replace(/\*\*/g, '')
    .replace(/`/g, '')
    .trim();
};

export default function Conversations() {
  const [conversations, setConversations]             = useState([]);
  const [selectedSession, setSelectedSession]         = useState(null);
  const [activeConversation, setActiveConversation]   = useState(null);
  const [loading, setLoading]                         = useState(true);
  const [loadingDetail, setLoadingDetail]             = useState(false);
  const [searchTerm, setSearchTerm]                   = useState('');
  const [summary, setSummary]                         = useState('');
  const [summarizing, setSummarizing]                 = useState(false);

  useEffect(() => { fetchConversations(); }, []);

  const fetchConversations = async () => {
    try {
      const res = await API.get('/api/conversations');
      setConversations(res.data || []);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const handleSelectRow = async (sessionId) => {
    setSelectedSession(sessionId);
    setLoadingDetail(true);
    setSummary('');
    try {
      const [detailRes, summaryRes] = await Promise.all([
        API.get(`/api/conversations/${sessionId}`),
        API.post('/api/conversations/assistant', {
          prompt: `Give a clean structured summary for session ${sessionId}. Bullet point 1: Customer query/intent. Bullet point 2: Current resolution status & next steps.`
        }).catch(() => null)
      ]);
      setActiveConversation(detailRes.data);
      if (summaryRes?.data?.reply) {
        setSummary(summaryRes.data.reply);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingDetail(false);
    }
  };

  const handleManualSummary = async () => {
    if (!selectedSession || summarizing) return;
    setSummarizing(true);
    try {
      const res = await API.post('/api/conversations/assistant', {
        prompt: `Summarize session ${selectedSession} clearly with bullet points.`
      });
      setSummary(res.data.reply || 'Summary generated.');
    } catch (err) {
      setSummary('Could not generate summary at this time.');
    } finally {
      setSummarizing(false);
    }
  };

  const filtered = conversations.filter(c =>
    c.sessionId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (c.customerName && c.customerName.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f8fafc', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      <Sidebar />

      <main style={{ flex: 1, padding: '40px 48px', maxWidth: 1200, margin: '0 auto', boxSizing: 'border-box', display: 'flex', flexDirection: 'column', gap: 32, position: 'relative' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <h1 style={{ fontSize: 28, fontWeight: 700, color: '#0f172a', margin: 0, letterSpacing: '-0.5px' }}>
              Customer Conversations
            </h1>
            <p style={{ fontSize: 14, color: '#64748b', margin: '4px 0 0' }}>
              View customer chat sessions, AI summaries, and pending requests
            </p>
          </div>

          <div style={{ position: 'relative' }}>
            <Search size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
            <input
              type="text" value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
              placeholder="Search session ID..."
              style={{
                paddingLeft: 40, width: 260,
                background: '#ffffff', border: '1px solid #eaecf0',
                borderRadius: 12, padding: '10px 14px 10px 40px',
                fontSize: 14, color: '#0f172a', outline: 'none',
              }}
            />
          </div>
        </div>

        {/* Table Card */}
        <div style={{
          background: '#ffffff', border: '1px solid #eaecf0',
          borderRadius: 16, overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
        }}>
          {loading ? (
            <div style={{ padding: 48, textAlign: 'center', color: '#64748b', fontSize: 14 }}>Loading conversations...</div>
          ) : filtered.length === 0 ? (
            <div style={{ padding: 48, textAlign: 'center', color: '#64748b', fontSize: 14 }}>
              <MessageSquare size={32} style={{ margin: '0 auto 12px', display: 'block', opacity: 0.4 }} />
              No conversation records found
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
                <thead>
                  <tr style={{ background: '#f8fafc', borderBottom: '1px solid #eaecf0' }}>
                    <th style={{ padding: '14px 20px', textAlign: 'left', color: '#64748b', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Session ID</th>
                    <th style={{ padding: '14px 20px', textAlign: 'left', color: '#64748b', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Customer</th>
                    <th style={{ padding: '14px 20px', textAlign: 'left', color: '#64748b', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Status</th>
                    <th style={{ padding: '14px 20px', textAlign: 'left', color: '#64748b', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Rating</th>
                    <th style={{ padding: '14px 20px', textAlign: 'left', color: '#64748b', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(conv => (
                    <tr
                      key={conv.sessionId}
                      onClick={() => handleSelectRow(conv.sessionId)}
                      style={{
                        borderBottom: '1px solid #eaecf0', cursor: 'pointer',
                        background: selectedSession === conv.sessionId ? '#f1f5f9' : 'transparent',
                        transition: 'background 0.15s',
                      }}
                    >
                      <td style={{ padding: '14px 20px', fontFamily: 'monospace', color: '#3b82f6', fontWeight: 700, fontSize: 12 }}>
                        {conv.sessionId}
                      </td>
                      <td style={{ padding: '14px 20px', color: '#0f172a', fontWeight: 500 }}>{conv.customerName || 'Customer'}</td>
                      <td style={{ padding: '14px 20px' }}>
                        {conv.status === 'resolved'
                          ? <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '3px 9px', borderRadius: 9999, fontSize: 12, fontWeight: 600, background: '#ecfdf5', color: '#10b981', border: '1px solid #a7f3d0' }}><CheckCircle2 size={12} /> resolved</span>
                          : <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '3px 9px', borderRadius: 9999, fontSize: 12, fontWeight: 600, background: '#eff6ff', color: '#3b82f6', border: '1px solid #bfdbfe' }}><Clock size={12} /> open</span>
                        }
                      </td>
                      <td style={{ padding: '14px 20px' }}>
                        {conv.rating === 'up' && (
                          <span style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#10b981', fontSize: 12, fontWeight: 600 }}>
                            <ThumbsUp size={14} /> Positive
                          </span>
                        )}
                        {conv.rating === 'down' && (
                          <span style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#ef4444', fontSize: 12, fontWeight: 600 }}>
                            <ThumbsDown size={14} /> Negative
                          </span>
                        )}
                        {!conv.rating && <span style={{ color: '#94a3b8', fontSize: 12 }}>Unrated</span>}
                      </td>
                      <td style={{ padding: '14px 20px', color: '#64748b', fontSize: 12 }}>
                        {conv.createdAt
                          ? new Date(conv.createdAt).toLocaleDateString() + ' ' +
                            new Date(conv.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                          : 'N/A'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Structured Detail & Summary Panel */}
        {selectedSession && activeConversation && (
          <div style={{
            background: '#ffffff', border: '1px solid #eaecf0',
            borderRadius: 16, padding: 24, boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
            display: 'flex', flexDirection: 'column', gap: 24,
          }}>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: 16, borderBottom: '1px solid #eaecf0' }}>
              <div>
                <h2 style={{ fontSize: 18, fontWeight: 700, color: '#0f172a', margin: 0 }}>Conversation Workspace</h2>
                <p style={{ fontSize: 12, fontFamily: 'monospace', color: '#3b82f6', margin: '4px 0 0' }}>Session ID: {selectedSession}</p>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <button
                  onClick={handleManualSummary}
                  disabled={summarizing}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 6,
                    padding: '6px 14px', borderRadius: 8, border: 'none',
                    background: '#f1f5f9', color: '#0f172a',
                    fontSize: 12, fontWeight: 600, cursor: summarizing ? 'not-allowed' : 'pointer',
                  }}
                >
                  {summarizing ? <RefreshCw size={13} className="animate-spin" /> : <Sparkles size={13} />}
                  <span>Re-summarize AI</span>
                </button>

                <button
                  onClick={() => { setSelectedSession(null); setActiveConversation(null); setSummary(''); }}
                  style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: 6, borderRadius: 8, display: 'flex' }}
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* 1. TOP SECTION: Customer Details Grid */}
            <div>
              <p style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 10px' }}>
                👤 Customer Details
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
                {/* Tile 1: Customer Name */}
                <div style={{ background: '#f8fafc', border: '1px solid #eaecf0', borderRadius: 12, padding: 14 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#64748b', fontSize: 12, marginBottom: 4 }}>
                    <User size={14} style={{ color: '#3b82f6' }} /> Customer
                  </div>
                  <div style={{ fontSize: 15, fontWeight: 600, color: '#0f172a' }}>
                    {activeConversation.customerName || 'Customer'}
                  </div>
                </div>

                {/* Tile 2: Status */}
                <div style={{ background: '#f8fafc', border: '1px solid #eaecf0', borderRadius: 12, padding: 14 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#64748b', fontSize: 12, marginBottom: 4 }}>
                    <Clock size={14} style={{ color: '#f59e0b' }} /> Status
                  </div>
                  <div>
                    {activeConversation.status === 'resolved'
                      ? <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '2px 8px', borderRadius: 9999, fontSize: 12, fontWeight: 600, background: '#ecfdf5', color: '#10b981' }}><CheckCircle2 size={12} /> Resolved</span>
                      : <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '2px 8px', borderRadius: 9999, fontSize: 12, fontWeight: 600, background: '#eff6ff', color: '#3b82f6' }}><Clock size={12} /> Pending Review</span>
                    }
                  </div>
                </div>

                {/* Tile 3: Rating */}
                <div style={{ background: '#f8fafc', border: '1px solid #eaecf0', borderRadius: 12, padding: 14 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#64748b', fontSize: 12, marginBottom: 4 }}>
                    <ThumbsUp size={14} style={{ color: '#10b981' }} /> Customer Rating
                  </div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: '#0f172a' }}>
                    {activeConversation.rating === 'up' ? 'Positive (👍)' : activeConversation.rating === 'down' ? 'Negative (👎)' : 'Unrated'}
                  </div>
                </div>

                {/* Tile 4: Timestamp */}
                <div style={{ background: '#f8fafc', border: '1px solid #eaecf0', borderRadius: 12, padding: 14 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#64748b', fontSize: 12, marginBottom: 4 }}>
                    <Calendar size={14} style={{ color: '#0f172a' }} /> Session Date
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#0f172a' }}>
                    {activeConversation.createdAt ? new Date(activeConversation.createdAt).toLocaleDateString() : 'N/A'}
                  </div>
                </div>
              </div>
            </div>

            {/* 2. MIDDLE SECTION: AI Conversation Summary */}
            <div>
              <p style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 10px' }}>
                ✨ AI Executive Summary
              </p>
              <div style={{
                background: '#f8fafc', border: '1px solid #eaecf0',
                borderLeft: '4px solid #0f172a', borderRadius: 14, padding: 16,
              }}>
                {loadingDetail || summarizing ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#0f172a', fontSize: 13 }}>
                    <RefreshCw size={14} className="animate-spin" /> Generating AI conversation summary...
                  </div>
                ) : summary ? (
                  <div style={{ fontSize: 13, color: '#0f172a', lineHeight: 1.6, whiteSpace: 'pre-line' }}>
                    {cleanText(summary)}
                  </div>
                ) : (
                  <p style={{ margin: 0, fontSize: 13, color: '#64748b' }}>
                    Click "Re-summarize AI" above to generate a real-time summary for this chat.
                  </p>
                )}
              </div>
            </div>

            {/* 3. BOTTOM SECTION: Full Message Log */}
            <div>
              <p style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 12px' }}>
                💬 Full Message History ({activeConversation.messages?.length || 0} messages)
              </p>
              <div style={{
                background: '#f8fafc', border: '1px solid #eaecf0', borderRadius: 14, padding: 16,
                display: 'flex', flexDirection: 'column', gap: 16, maxHeight: 350, overflowY: 'auto',
              }}>
                {activeConversation.messages?.map((msg, idx) => (
                  <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: 12, flexDirection: msg.role === 'user' ? 'row-reverse' : 'row' }}>
                    <div style={{
                      width: 32, height: 32, borderRadius: '50%',
                      background: msg.role === 'user' ? '#3b82f6' : '#0f172a',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: 'white', flexShrink: 0,
                    }}>
                      {msg.role === 'user' ? <User size={14} /> : <Bot size={14} />}
                    </div>
                    <div style={{
                      background: msg.role === 'user' ? '#3b82f6' : '#ffffff',
                      color: msg.role === 'user' ? '#ffffff' : '#0f172a',
                      border: msg.role === 'user' ? 'none' : '1px solid #eaecf0',
                      borderLeft: msg.role === 'user' ? 'none' : '4px solid #0f172a',
                      padding: '12px 18px',
                      borderRadius: msg.role === 'user' ? '16px 16px 4px 16px' : '4px 16px 16px 16px',
                      maxWidth: '85%',
                      fontSize: 14,
                      lineHeight: 1.5,
                      boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
                    }}>
                      {msg.content}
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

        {/* 🤖 Floating AI Admin Copilot Widget */}
        <AdminCopilotWidget />
      </main>
    </div>
  );
}
