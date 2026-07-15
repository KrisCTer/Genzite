import React, { useState } from 'react';
import { X } from 'lucide-react';

export interface ExportPanelProps {
  onClose: () => void;
  onDownloadZip: () => void;
  onCopyCode: () => void;
  onSummarizeProject: (description: string) => void;
}

export const ExportPanel: React.FC<ExportPanelProps> = ({
  onClose,
  onDownloadZip,
  onCopyCode,
  onSummarizeProject
}) => {
  const [selectedOption, setSelectedOption] = useState<'zip' | 'copy' | 'summarize'>('zip');
  const [description, setDescription] = useState('');

  const getDynamicDescription = () => {
    switch (selectedOption) {
      case 'zip': return "Tải xuống tệp .zip chứa mã nguồn HTML, CSS và tài sản của trang web.";
      case 'copy': return "Sao chép toàn bộ mã HTML của trang hiện tại vào bảng nhớ tạm.";
      case 'summarize': return "Tạo tài liệu về yêu cầu đối với sản phẩm cho dự án của bạn";
      default: return "";
    }
  };

  const handleAction = () => {
    if (selectedOption === 'zip') {
      onDownloadZip();
    } else if (selectedOption === 'copy') {
      onCopyCode();
    } else if (selectedOption === 'summarize') {
      onSummarizeProject(description);
    }
  };

  const getButtonText = () => {
    switch (selectedOption) {
      case 'zip': return "Xuất";
      case 'copy': return "Sao chép";
      case 'summarize': return "Tóm tắt dự án";
      default: return "";
    }
  };

  return (
    <div
      style={{
        position: 'absolute',
        top: '50%',
        right: 70,
        transform: 'translateY(-50%)',
        width: 320,
        background: 'rgba(17, 24, 39, 0.85)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        borderRadius: 16,
        border: '1px solid rgba(255, 255, 255, 0.08)',
        boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
        zIndex: 100,
        color: '#F8FAFC',
        fontFamily: 'var(--font-sans)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden'
      }}
    >
      <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: 14, fontWeight: 600 }}>Xuất</span>
        <button
          onClick={onClose}
          style={{ background: 'transparent', border: 'none', color: '#94A3B8', cursor: 'pointer', padding: 4, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          onMouseEnter={e => e.currentTarget.style.color = '#fff'}
          onMouseLeave={e => e.currentTarget.style.color = '#94A3B8'}
        >
          <X size={16} />
        </button>
      </div>

      <div style={{ padding: 20, display: 'flex', flexDirection: 'column' }}>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 24 }}>
        {[
          { id: 'zip', label: '.zip' },
          { id: 'copy', label: 'Sao chép mã vào bảng nhớ tạm' },
          { id: 'summarize', label: 'Tóm tắt dự án' }
        ].map((opt) => (
          <label 
            key={opt.id} 
            style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }}
            onClick={() => setSelectedOption(opt.id as any)}
          >
            <div
              style={{
                width: 20,
                height: 20,
                borderRadius: '50%',
                border: selectedOption === opt.id ? '5px solid #3B3B3B' : '1px solid rgba(255,255,255,0.3)',
                background: selectedOption === opt.id ? '#D1D5DB' : 'transparent',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.2s',
                flexShrink: 0
              }}
            />
            <span style={{ fontSize: 14, fontWeight: 500, color: selectedOption === opt.id ? '#fff' : '#D1D5DB' }}>
              {opt.label}
            </span>
          </label>
        ))}
      </div>

      <p style={{ fontSize: 13, color: '#9CA3AF', lineHeight: 1.5, margin: '0 0 20px 0' }}>
        {getDynamicDescription()}
      </p>





      <button
        onClick={handleAction}
        style={{
          width: '100%',
          padding: '12px',
          background: 'rgba(255,255,255,0.1)',
          border: '1px solid rgba(255,255,255,0.05)',
          borderRadius: 24,
          color: '#fff',
          fontSize: 14,
          fontWeight: 600,
          cursor: 'pointer',
          transition: 'all 0.2s',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center'
        }}
        onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.15)')}
        onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.1)')}
      >
        {getButtonText()}
      </button>
      </div>
    </div>
  );
};
