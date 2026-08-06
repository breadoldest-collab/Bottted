export default function StatCard({ title, value, icon: Icon, iconBg = 'bg-blue-50', iconColor = 'text-blue-600' }) {
  return (
    <div style={{
      background: '#ffffff',
      border: '1px solid #eaecf0',
      borderRadius: 16,
      padding: 24,
      boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
      display: 'flex',
      flexDirection: 'column',
      justify: 'space-between',
      height: 140,
    }}>
      {/* Icon Top Left */}
      <div>
        {Icon && (
          <div style={{
            width: 36,
            height: 36,
            borderRadius: 10,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: iconBg,
            color: iconColor,
          }}>
            <Icon size={18} />
          </div>
        )}
      </div>

      {/* Value & Label */}
      <div style={{ marginTop: 'auto' }}>
        <div style={{ fontSize: 36, fontWeight: 700, color: '#0f172a', lineHeight: 1.1 }}>
          {value}
        </div>
        <div style={{ fontSize: 13, fontWeight: 500, color: '#64748b', marginTop: 4 }}>
          {title}
        </div>
      </div>
    </div>
  );
}
