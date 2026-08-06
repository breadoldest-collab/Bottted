import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import StatCard from '../components/StatCard';
import API from '../api/axios';
import { MessageSquare, CheckCircle2, Clock, CheckCircle, Plus, AlertCircle } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from 'recharts';

export default function Dashboard() {
  const navigate = useNavigate();
  const [analytics, setAnalytics] = useState(null);
  const [alerts, setAlerts]       = useState(null);
  const [loading, setLoading]     = useState(true);

  // Formatted date string like "Thursday, August 6, 2026"
  const formattedDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        const [aRes, alRes] = await Promise.all([
          API.get('/api/analytics?range=daily'),
          API.get('/api/analytics/alerts'),
        ]);
        setAnalytics(aRes.data);
        setAlerts(alRes.data);
      } catch (err) {
        console.error('Dashboard load error:', err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  // Format chart data for Last 7 Days
  const rawChartData = analytics?.chartData || [];
  const last7DaysData = rawChartData.length >= 7
    ? rawChartData.slice(-7)
    : (rawChartData.length > 0 ? rawChartData : [
        { date: 'Fri', count: 0 },
        { date: 'Sat', count: 0 },
        { date: 'Sun', count: 0 },
        { date: 'Mon', count: 0 },
        { date: 'Tue', count: 0 },
        { date: 'Wed', count: 0 },
        { date: 'Thu', count: 0 },
      ]);

  const handleAddToFaq = (topic) => {
    navigate('/settings', { state: { prefillFaq: { question: topic, answer: '' } } });
  };

  const timeAgo = (ts) => {
    const diff = Date.now() - new Date(ts).getTime();
    const m = Math.floor(diff / 60000);
    const h = Math.floor(diff / 3600000);
    const d = Math.floor(diff / 86400000);
    if (d > 0) return `${d}d ago`;
    if (h > 0) return `${h}h ago`;
    if (m > 0) return `${m}m ago`;
    return 'just now';
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f8fafc', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      <Sidebar />

      <main style={{ flex: 1, padding: '40px 48px', maxWidth: 1200, margin: '0 auto', boxSizing: 'border-box' }}>
        
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 32 }}>
          <div>
            <h1 style={{ fontSize: 28, fontWeight: 700, color: '#0f172a', margin: 0, letterSpacing: '-0.5px' }}>
              Dashboard
            </h1>
            <p style={{ fontSize: 14, color: '#64748b', margin: '4px 0 0' }}>
              How your AI assistant is performing
            </p>
          </div>
          <div style={{ fontSize: 13, color: '#64748b', fontWeight: 500, paddingTop: 4 }}>
            {formattedDate}
          </div>
        </div>

        {/* 3 Stat Cards */}
        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24, marginBottom: 32 }}>
            {[1, 2, 3].map(i => (
              <div key={i} style={{ height: 140, background: '#ffffff', border: '1px solid #eaecf0', borderRadius: 16 }} />
            ))}
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24, marginBottom: 32 }}>
            <StatCard
              title="Total Chats"
              value={analytics?.totalChats ?? 0}
              icon={MessageSquare}
              iconBg="#eff6ff"
              iconColor="#3b82f6"
            />
            <StatCard
              title="Resolved"
              value={analytics?.resolved ?? 0}
              icon={CheckCircle2}
              iconBg="#ecfdf5"
              iconColor="#10b981"
            />
            <StatCard
              title="Open"
              value={analytics?.open ?? 0}
              icon={Clock}
              iconBg="#fffbeb"
              iconColor="#f59e0b"
            />
          </div>
        )}

        {/* Chat Activity Card */}
        <div style={{
          background: '#ffffff',
          border: '1px solid #eaecf0',
          borderRadius: 16,
          padding: 24,
          boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
          marginBottom: 32,
        }}>
          <h2 style={{ fontSize: 16, fontWeight: 600, color: '#0f172a', margin: '0 0 20px' }}>
            Chat Activity – Last 7 Days
          </h2>

          <div style={{ height: 260, width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={last7DaysData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis
                  dataKey="date"
                  stroke="#94a3b8"
                  tick={{ fill: '#94a3b8', fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  stroke="#94a3b8"
                  tick={{ fill: '#94a3b8', fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                  allowDecimals={false}
                />
                <Tooltip
                  cursor={{ fill: '#f8fafc' }}
                  contentStyle={{
                    background: '#ffffff',
                    border: '1px solid #eaecf0',
                    borderRadius: 10,
                    boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                    fontSize: 13,
                  }}
                  labelStyle={{ fontWeight: 600, color: '#0f172a' }}
                  formatter={(val) => [`${val} chats`, 'Volume']}
                />
                <Bar dataKey="count" fill="#3b82f6" radius={[6, 6, 0, 0]} maxBarSize={48} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Unanswered Questions Card */}
        <div style={{
          background: '#ffffff',
          border: '1px solid #eaecf0',
          borderLeft: '4px solid #f59e0b',
          borderRadius: 16,
          padding: 24,
          boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
        }}>
          <h2 style={{ fontSize: 16, fontWeight: 600, color: '#0f172a', margin: 0 }}>
            Unanswered Questions
          </h2>
          <p style={{ fontSize: 13, color: '#64748b', margin: '4px 0 20px' }}>
            Questions your AI couldn't resolve — add them to your FAQ to improve it
          </p>

          {!alerts || alerts.alerts?.length === 0 ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: '#059669', fontSize: 14, fontWeight: 500 }}>
              <CheckCircle size={18} style={{ color: '#10b981' }} />
              <span>All caught up — your AI answered every question.</span>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {alerts.alerts.map((item, idx) => (
                <div key={idx} style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px 16px',
                  background: '#f8fafc',
                  border: '1px solid #eaecf0',
                  borderRadius: 12,
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0, flex: 1 }}>
                    <AlertCircle size={16} style={{ color: '#f59e0b', flexShrink: 0 }} />
                    <span style={{ fontSize: 14, fontWeight: 500, color: '#0f172a', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {item.topic}
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexShrink: 0 }}>
                    <span style={{ fontSize: 12, color: '#64748b' }}>
                      asked {item.count}×
                    </span>
                    <span style={{ fontSize: 12, color: '#94a3b8' }}>
                      {timeAgo(item.latest)}
                    </span>
                    <button
                      onClick={() => handleAddToFaq(item.topic)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 6,
                        padding: '6px 14px',
                        borderRadius: 8,
                        border: 'none',
                        background: '#3b82f6',
                        color: '#ffffff',
                        fontSize: 12,
                        fontWeight: 600,
                        cursor: 'pointer',
                      }}
                    >
                      <Plus size={14} /> Add to FAQ
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </main>
    </div>
  );
}
