import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import API from '../api/axios';
import { FileText, HelpCircle, Plus, Trash2, Save, CheckCircle2, Globe, Ban } from 'lucide-react';

const MAX_DESC = 500;

export default function Settings() {
  const location = useLocation();
  const [description, setDescription] = useState('');
  const [faqs, setFaqs]               = useState([]);
  const [blockedDomains, setBlockedDomains] = useState([]);
  const [newBlockedSite, setNewBlockedSite] = useState('');
  const [loading, setLoading]         = useState(true);
  const [saving, setSaving]           = useState(false);
  const [toast, setToast]             = useState(false);
  const [errorMsg, setErrorMsg]       = useState('');

  useEffect(() => { fetchSettings(); }, []);

  // Auto-add prefillFaq from Dashboard "Add to FAQ" button
  useEffect(() => {
    if (!loading && location.state?.prefillFaq) {
      const { question, answer } = location.state.prefillFaq;
      setFaqs(prev => {
        const alreadyExists = prev.some(f => f.question === question);
        if (alreadyExists) return prev;
        return [...prev, { question, answer: answer || '' }];
      });
      setTimeout(() => window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' }), 100);
    }
  }, [loading, location.state]);

  const fetchSettings = async () => {
    try {
      const res = await API.get('/api/settings');
      setDescription(res.data.description || '');
      setFaqs(res.data.faqs || []);
      setBlockedDomains(res.data.blockedDomains || []);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setErrorMsg('');
    try {
      await API.post('/api/settings', { description, faqs, blockedDomains });
      setToast(true);
      setTimeout(() => setToast(false), 2500);
    } catch {
      setErrorMsg('Failed to save. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const addFaq    = () => setFaqs(prev => [...prev, { question: '', answer: '' }]);
  const removeFaq = (i) => setFaqs(prev => prev.filter((_, idx) => idx !== i));
  const changeFaq = (i, field, val) => {
    setFaqs(prev => {
      const next = [...prev];
      next[i] = { ...next[i], [field]: val };
      return next;
    });
  };

  const addBlockedSite = () => {
    const value = newBlockedSite.trim();
    if (!value) return;
    const host = value
      .replace(/^[a-z][a-z0-9+.-]*:\/\//i, '')
      .split('/')[0]
      .replace(/^www\./i, '')
      .toLowerCase();
    if (!host) return;
    setBlockedDomains(prev => (prev.includes(host) ? prev : [...prev, host]));
    setNewBlockedSite('');
  };

  const removeBlockedSite = (i) => setBlockedDomains(prev => prev.filter((_, idx) => idx !== i));

  const inputStyle = {
    width: '100%',
    background: '#f8fafc',
    border: '1px solid #eaecf0',
    borderRadius: 12,
    padding: '12px 14px',
    color: '#0f172a',
    fontSize: 14,
    outline: 'none',
    boxSizing: 'border-box',
    transition: 'border-color 0.15s, box-shadow 0.15s',
  };

  const focusStyle = (e) => {
    e.target.style.borderColor = '#3b82f6';
    e.target.style.boxShadow = '0 0 0 3px rgba(59,130,246,0.1)';
  };
  const blurStyle  = (e) => {
    e.target.style.borderColor = '#eaecf0';
    e.target.style.boxShadow = 'none';
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f8fafc', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      <Sidebar />

      {/* Success Toast */}
      {toast && (
        <div style={{
          position: 'fixed', top: 24, right: 24, zIndex: 9999,
          display: 'flex', alignItems: 'center', gap: 10,
          padding: '14px 20px', borderRadius: 14,
          background: '#ffffff', border: '1px solid #10b981',
          color: '#10b981', fontWeight: 600, fontSize: 14,
          boxShadow: '0 10px 30px rgba(0,0,0,0.08)',
          animation: 'slideDownToast 0.2s ease',
        }}>
          <style>{`@keyframes slideDownToast { from { opacity:0; transform:translateY(-10px); } to { opacity:1; transform:translateY(0); } }`}</style>
          <CheckCircle2 size={18} />
          Settings saved!
        </div>
      )}

      <main style={{ flex: 1, padding: '40px 48px', maxWidth: 1000, margin: '0 auto', boxSizing: 'border-box' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

          {/* Page Header */}
          <div>
            <h1 style={{ fontSize: 28, fontWeight: 700, color: '#0f172a', margin: 0, letterSpacing: '-0.5px' }}>
              AI Support Settings
            </h1>
            <p style={{ fontSize: 14, color: '#64748b', margin: '4px 0 0' }}>
              Configure your knowledge base and FAQ pairs for the Gemini AI bot
            </p>
          </div>

          {errorMsg && (
            <div style={{
              padding: '12px 16px', borderRadius: 12, fontSize: 14,
              background: '#fef2f2', border: '1px solid #fecaca',
              color: '#ef4444',
            }}>
              {errorMsg}
            </div>
          )}

          {loading ? (
            <div style={{ padding: 48, textAlign: 'center', color: '#64748b' }}>Loading settings…</div>
          ) : (
            <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

              {/* Business Description Card */}
              <div style={{
                background: '#ffffff', border: '1px solid #eaecf0',
                borderRadius: 16, padding: 24, boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
              }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 6 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{
                      width: 34, height: 34, borderRadius: 10,
                      background: '#eff6ff', border: '1px solid #dbeafe',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <FileText size={16} style={{ color: '#3b82f6' }} />
                    </div>
                    <div>
                      <h2 style={{ fontSize: 16, fontWeight: 600, color: '#0f172a', margin: 0 }}>Business Description</h2>
                      <p style={{ fontSize: 12, color: '#64748b', margin: '2px 0 0' }}>
                        Context used by the AI to answer customer questions
                      </p>
                    </div>
                  </div>
                  <span style={{
                    fontSize: 12, fontWeight: 600, color: description.length > MAX_DESC * 0.9 ? '#ef4444' : '#64748b',
                    background: '#f8fafc', border: '1px solid #eaecf0',
                    padding: '4px 10px', borderRadius: 8, whiteSpace: 'nowrap',
                  }}>
                    {description.length} / {MAX_DESC}
                  </span>
                </div>

                <textarea
                  rows={6}
                  value={description}
                  maxLength={MAX_DESC}
                  onChange={e => setDescription(e.target.value)}
                  onFocus={focusStyle}
                  onBlur={blurStyle}
                  placeholder="We are a premium SaaS company offering 24/7 customer support. Our products include…"
                  style={{ ...inputStyle, resize: 'none', marginTop: 16, minHeight: 140, lineHeight: 1.7 }}
                />
              </div>

              {/* FAQs Card */}
              <div style={{
                background: '#ffffff', border: '1px solid #eaecf0',
                borderRadius: 16, padding: 24, boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{
                      width: 34, height: 34, borderRadius: 10,
                      background: '#f3f4f6', border: '1px solid #e2e8f0',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <HelpCircle size={16} style={{ color: '#0f172a' }} />
                    </div>
                    <div>
                      <h2 style={{ fontSize: 16, fontWeight: 600, color: '#0f172a', margin: 0 }}>
                        Frequently Asked Questions
                      </h2>
                      <p style={{ fontSize: 12, color: '#64748b', margin: '2px 0 0' }}>
                        {faqs.length} FAQ{faqs.length !== 1 ? 's' : ''} configured
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={addFaq}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 7,
                      padding: '9px 16px', borderRadius: 10, border: 'none',
                      background: '#3b82f6', color: '#fff',
                      fontSize: 13, fontWeight: 600, cursor: 'pointer',
                      boxShadow: '0 2px 8px rgba(59,130,246,0.2)',
                      transition: 'background 0.15s',
                      whiteSpace: 'nowrap',
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = '#2563eb'}
                    onMouseLeave={e => e.currentTarget.style.background = '#3b82f6'}
                  >
                    <Plus size={15} /> Add FAQ
                  </button>
                </div>

                {/* Empty state */}
                {faqs.length === 0 ? (
                  <div style={{
                    border: '2px dashed #cbd5e1', borderRadius: 14,
                    padding: '40px 20px', textAlign: 'center',
                    color: '#64748b', fontSize: 14,
                  }}>
                    <HelpCircle size={28} style={{ margin: '0 auto 10px', display: 'block', opacity: 0.4 }} />
                    No FAQs added yet.<br />
                    <span style={{ color: '#3b82f6', fontWeight: 600, cursor: 'pointer' }} onClick={addFaq}>
                      + Add your first FAQ
                    </span>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {faqs.map((faq, i) => (
                      <div key={i} style={{
                        background: '#f8fafc', border: '1px solid #eaecf0',
                        borderRadius: 14, padding: 16, position: 'relative',
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                          <span style={{
                            fontSize: 11, fontWeight: 700, color: '#3b82f6',
                            textTransform: 'uppercase', letterSpacing: '0.08em',
                          }}>
                            FAQ #{i + 1}
                          </span>
                          <button
                            type="button"
                            onClick={() => removeFaq(i)}
                            style={{
                              background: 'none', border: 'none', cursor: 'pointer',
                              color: '#94a3b8', display: 'flex', padding: 4, borderRadius: 6,
                              transition: 'color 0.15s',
                            }}
                            onMouseEnter={e => e.currentTarget.style.color = '#ef4444'}
                            onMouseLeave={e => e.currentTarget.style.color = '#94a3b8'}
                            title="Remove FAQ"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>

                        {/* Question */}
                        <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start', marginBottom: 10 }}>
                          <span style={{ fontSize: 13, fontWeight: 700, color: '#3b82f6', marginTop: 10, flexShrink: 0 }}>Q:</span>
                          <input
                            type="text" required value={faq.question}
                            onChange={e => changeFaq(i, 'question', e.target.value)}
                            onFocus={focusStyle} onBlur={blurStyle}
                            placeholder="e.g. What is your refund policy?"
                            style={inputStyle}
                          />
                        </div>

                        {/* Answer */}
                        <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                          <span style={{ fontSize: 13, fontWeight: 700, color: '#64748b', marginTop: 10, flexShrink: 0 }}>A:</span>
                          <textarea
                            rows={2} required value={faq.answer}
                            onChange={e => changeFaq(i, 'answer', e.target.value)}
                            onFocus={focusStyle} onBlur={blurStyle}
                            placeholder="e.g. We offer full refunds within 30 days of purchase."
                            style={{ ...inputStyle, resize: 'vertical' }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Blocked websites */}
              <div style={{
                background: '#ffffff', border: '1px solid #eaecf0',
                borderRadius: 16, padding: 24, boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
              }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{
                      width: 34, height: 34, borderRadius: 10,
                      background: '#fef2f2', border: '1px solid #fecaca',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <Ban size={16} style={{ color: '#ef4444' }} />
                    </div>
                    <div>
                      <h2 style={{ fontSize: 16, fontWeight: 600, color: '#0f172a', margin: 0 }}>
                        Blocked websites
                      </h2>
                      <p style={{ fontSize: 12, color: '#64748b', margin: '2px 0 0' }}>
                        Visitors on these sites cannot open your support chat in their browser
                      </p>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 10, marginBottom: 14 }}>
                  <div style={{ position: 'relative', flex: 1 }}>
                    <Globe size={15} style={{ position: 'absolute', left: 12, top: 14, color: '#94a3b8' }} />
                    <input
                      type="text"
                      value={newBlockedSite}
                      onChange={e => setNewBlockedSite(e.target.value)}
                      onFocus={focusStyle}
                      onBlur={blurStyle}
                      onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addBlockedSite(); } }}
                      placeholder="e.g. competitor.com or https://spam-site.example/page"
                      style={{ ...inputStyle, paddingLeft: 34 }}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={addBlockedSite}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 7,
                      padding: '9px 16px', borderRadius: 10, border: 'none',
                      background: '#0f172a', color: '#fff',
                      fontSize: 13, fontWeight: 600, cursor: 'pointer',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    <Plus size={15} /> Block site
                  </button>
                </div>

                {blockedDomains.length === 0 ? (
                  <div style={{
                    border: '2px dashed #cbd5e1', borderRadius: 14,
                    padding: '24px 20px', textAlign: 'center',
                    color: '#64748b', fontSize: 13,
                  }}>
                    No websites blocked. Add a domain so the chat widget will not open there.
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {blockedDomains.map((site, i) => (
                      <div key={site} style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        background: '#f8fafc', border: '1px solid #eaecf0',
                        borderRadius: 12, padding: '10px 12px',
                      }}>
                        <span style={{ fontSize: 13, fontFamily: 'monospace', color: '#0f172a' }}>{site}</span>
                        <button
                          type="button"
                          onClick={() => removeBlockedSite(i)}
                          style={{
                            background: 'none', border: 'none', cursor: 'pointer',
                            color: '#94a3b8', display: 'flex', padding: 4, borderRadius: 6,
                          }}
                          onMouseEnter={e => e.currentTarget.style.color = '#ef4444'}
                          onMouseLeave={e => e.currentTarget.style.color = '#94a3b8'}
                          title="Allow this website again"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Save Button Row */}
              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button
                  type="submit"
                  disabled={saving}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 9,
                    padding: '12px 28px', borderRadius: 10, border: 'none',
                    background: saving ? '#1d4ed8' : '#3b82f6',
                    color: '#fff', fontSize: 15, fontWeight: 600,
                    cursor: saving ? 'not-allowed' : 'pointer',
                    minWidth: 160, justifyContent: 'center',
                    boxShadow: '0 4px 14px rgba(59,130,246,0.25)',
                    transition: 'background 0.15s',
                    opacity: saving ? 0.8 : 1,
                  }}
                  onMouseEnter={e => { if (!saving) e.currentTarget.style.background = '#2563eb'; }}
                  onMouseLeave={e => { if (!saving) e.currentTarget.style.background = '#3b82f6'; }}
                >
                  <Save size={16} />
                  {saving ? 'Saving…' : 'Save Settings'}
                </button>
              </div>

            </form>
          )}
        </div>
      </main>
    </div>
  );
}
