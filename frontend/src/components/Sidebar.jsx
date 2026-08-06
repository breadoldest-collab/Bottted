import { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, MessageSquare, Settings, LogOut, X, Copy, Check, Hash, Store, FileText, HelpCircle } from 'lucide-react';
import API from '../api/axios';

export default function Sidebar() {
  const location = useLocation();
  const navigate  = useNavigate();

  const businessName = localStorage.getItem('businessName') || 'My Business';
  const businessId   = localStorage.getItem('businessId')   || '';
  const userEmail    = localStorage.getItem('userEmail')    || 'admin@cxbot.io';
  const initial      = businessName.charAt(0).toUpperCase();
  const supportUrl   = `${window.location.origin}/support/${businessId}`;

  const [profileOpen, setProfileOpen] = useState(false);
  const [profile, setProfile]         = useState(null);
  const [analytics, setAnalytics]     = useState(null);
  const [copied, setCopied]           = useState(false);
  const [alertCount, setAlertCount]   = useState(0);
  const bottomRef = useRef(null);

  useEffect(() => {
    API.get('/api/analytics/alerts')
      .then(res => setAlertCount(res.data.totalUnresolved || 0))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!profileOpen) return;
    const fetchData = async () => {
      try {
        const [sRes, aRes] = await Promise.all([
          API.get('/api/settings'),
          API.get('/api/analytics?range=daily'),
        ]);
        setProfile(sRes.data);
        setAnalytics(aRes.data);
      } catch (err) { console.error(err); }
    };
    fetchData();
  }, [profileOpen]);

  useEffect(() => {
    const handleClick = (e) => {
      if (bottomRef.current && !bottomRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
    };
    if (profileOpen) document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [profileOpen]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('businessId');
    localStorage.removeItem('businessName');
    navigate('/login');
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(supportUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const navItems = [
    { name: 'Dashboard',     path: '/dashboard',     icon: LayoutDashboard, alert: alertCount > 0 },
    { name: 'Conversations', path: '/conversations', icon: MessageSquare },
    { name: 'Settings',      path: '/settings',      icon: Settings },
  ];

  return (
    <aside style={{
      width: 240,
      minWidth: 240,
      background: '#ffffff',
      borderRight: '1px solid #eaecf0',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      padding: '24px 16px',
      minHeight: '100vh',
      height: '100vh',
      position: 'sticky',
      top: 0,
      zIndex: 20,
      boxSizing: 'border-box',
    }}>
      <div>
        {/* Brand */}
        <div style={{ padding: '0 8px', marginBottom: 32 }}>
          <span style={{
            fontSize: 22,
            fontWeight: 800,
            color: '#0f172a',
            letterSpacing: '-0.5px',
            fontFamily: "'Plus Jakarta Sans', sans-serif",
          }}>
            CXBot
          </span>
        </div>

        {/* Navigation */}
        <nav style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {navItems.map(({ name, path, icon: Icon, alert }) => {
            const isActive = location.pathname === path;
            return (
              <Link
                key={path}
                to={path}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: '10px 14px',
                  borderRadius: 12,
                  fontSize: 14,
                  fontWeight: isActive ? 600 : 500,
                  textDecoration: 'none',
                  color: isActive ? '#0f172a' : '#64748b',
                  background: isActive ? '#f1f5f9' : 'transparent',
                  transition: 'all 0.15s ease',
                }}
              >
                <div style={{ position: 'relative', display: 'flex' }}>
                  <Icon size={18} style={{ color: isActive ? '#0f172a' : '#64748b' }} />
                  {alert && (
                    <span style={{
                      position: 'absolute', top: -3, right: -4,
                      width: 8, height: 8, borderRadius: '50%',
                      background: '#ef4444',
                      border: '1.5px solid #ffffff',
                    }} />
                  )}
                </div>
                <span>{name}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Bottom User Section */}
      <div ref={bottomRef} style={{ position: 'relative' }}>
        {/* Profile Popover */}
        {profileOpen && (
          <div style={{
            position: 'absolute',
            bottom: 'calc(100% + 10px)',
            left: 0,
            right: 0,
            background: '#ffffff',
            border: '1px solid #eaecf0',
            borderRadius: 16,
            boxShadow: '0 10px 30px rgba(0,0,0,0.08)',
            overflow: 'hidden',
            zIndex: 100,
            animation: 'fadePop 0.18s ease',
            width: 260,
          }}>
            <style>{`@keyframes fadePop { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:translateY(0); } }`}</style>
            
            {/* Header */}
            <div style={{
              padding: '14px 16px',
              background: '#f8fafc',
              borderBottom: '1px solid #eaecf0',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{
                  width: 36, height: 36, borderRadius: '50%',
                  background: '#0f172a', color: '#fff',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 15, fontWeight: 700,
                }}>
                  {initial}
                </div>
                <div style={{ minWidth: 0 }}>
                  <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: '#0f172a' }}>{businessName}</p>
                  <p style={{ margin: '1px 0 0', fontSize: 11, color: '#64748b' }}>Admin</p>
                </div>
              </div>
              <button onClick={() => setProfileOpen(false)} style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', padding: 4 }}>
                <X size={14} />
              </button>
            </div>

            {/* Content */}
            <div style={{ padding: 12 }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 12, color: '#475569' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Hash size={13} style={{ color: '#94a3b8' }} />
                  <span style={{ fontFamily: 'monospace', color: '#0f172a' }}>{businessId.slice(0, 14)}…</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Store size={13} style={{ color: '#94a3b8' }} />
                  <span>{businessName}</span>
                </div>
                {profile?.faqs && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <HelpCircle size={13} style={{ color: '#94a3b8' }} />
                    <span>{profile.faqs.length} FAQs</span>
                  </div>
                )}
              </div>

              {/* Widget URL */}
              <div style={{ borderTop: '1px solid #eaecf0', marginTop: 10, paddingTop: 10 }}>
                <p style={{ fontSize: 10, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', marginBottom: 4 }}>Widget Link</p>
                <div style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  background: '#f8fafc', border: '1px solid #eaecf0', borderRadius: 8, padding: '6px 8px',
                }}>
                  <span style={{ fontSize: 11, fontFamily: 'monospace', color: '#0f172a', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {supportUrl}
                  </span>
                  <button onClick={handleCopy} style={{ background: 'none', border: 'none', color: copied ? '#10b981' : '#64748b', cursor: 'pointer' }}>
                    {copied ? <Check size={12} /> : <Copy size={12} />}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* User Card Row */}
        <div style={{
          borderTop: '1px solid #eaecf0',
          paddingTop: 16,
          display: 'flex',
          alignItems: 'center',
          justify: 'space-between',
        }}>
          <button
            onClick={() => setProfileOpen(prev => !prev)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: 0,
              textAlign: 'left',
              flex: 1,
              minWidth: 0,
            }}
          >
            <div style={{
              width: 34,
              height: 34,
              borderRadius: '50%',
              background: '#0f172a',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justify: 'center',
              fontWeight: 700,
              fontSize: 14,
              flexShrink: 0,
            }}>
              {initial}
            </div>
            <div style={{ overflow: 'hidden', minWidth: 0 }}>
              <p style={{ fontSize: 13, fontWeight: 600, color: '#0f172a', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {businessName}
              </p>
              <p style={{ fontSize: 11, color: '#94a3b8', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {userEmail}
              </p>
            </div>
          </button>

          <button
            onClick={handleLogout}
            title="Log Out"
            style={{
              background: 'none',
              border: 'none',
              color: '#94a3b8',
              cursor: 'pointer',
              padding: 6,
              borderRadius: 8,
              display: 'flex',
              alignItems: 'center',
              justify: 'center',
              transition: 'color 0.15s',
              flexShrink: 0,
            }}
            onMouseEnter={e => e.currentTarget.style.color = '#ef4444'}
            onMouseLeave={e => e.currentTarget.style.color = '#94a3b8'}
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </aside>
  );
}
