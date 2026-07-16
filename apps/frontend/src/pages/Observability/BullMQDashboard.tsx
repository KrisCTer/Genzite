const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';

export default function BullMQDashboard() {
  const bullBoardUrl = `${baseURL}/ai/admin/queues`;

  return (
    <div style={{ 
      width: '100%', 
      height: 'calc(100vh - 130px)', 
      overflow: 'hidden',
      borderRadius: '16px',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      boxShadow: '0 4px 24px rgba(0,0,0,0.2)'
    }}>
      <iframe
        src={bullBoardUrl}
        style={{ width: '100%', height: '100%', border: 'none', background: '#fff' }}
        title="BullMQ Dashboard"
      />
    </div>
  );
}
