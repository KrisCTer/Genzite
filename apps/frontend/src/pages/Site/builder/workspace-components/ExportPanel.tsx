import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

export interface ExportPageItem {
  id: string;
  title: string;
  slug?: string;
}

export interface ExportPanelProps {
  onClose: () => void;
  onDownloadZip: (options: {
    selectedPageIds: string[];
    rootFolderName: string;
    zipFileName: string;
  }) => void;
  onCopyCode: () => void;
  onSummarizeProject: (description: string) => void;
  pages?: ExportPageItem[];
  defaultProjectName?: string;
}

export const ExportPanel: React.FC<ExportPanelProps> = ({
  onClose,
  onDownloadZip,
  onCopyCode,
  onSummarizeProject,
  pages = [],
  defaultProjectName = 'Project'
}) => {
  const [selectedOption, setSelectedOption] = useState<'zip' | 'copy' | 'summarize'>('zip');
  const [description] = useState('');
  const [rootFolderName, setRootFolderName] = useState(defaultProjectName);
  const [selectedPageIds, setSelectedPageIds] = useState<string[]>(() => pages.map(p => p.id));

  useEffect(() => {
    if (pages && pages.length > 0 && selectedPageIds.length === 0) {
      setSelectedPageIds(pages.map(p => p.id));
    }
  }, [pages]);

  useEffect(() => {
    if (defaultProjectName && !rootFolderName) {
      setRootFolderName(defaultProjectName);
    }
  }, [defaultProjectName]);

  const getDynamicDescription = () => {
    switch (selectedOption) {
      case 'zip': return "Download a structure with 1 root folder containing sub-folders for each selected page (including .html and DESIGN.md files).";
      case 'copy': return "Copy the full HTML code of the current page to clipboard.";
      case 'summarize': return "Generate a Product Requirements Document (PRD) for your project.";
      default: return "";
    }
  };

  const handleAction = () => {
    if (selectedOption === 'zip') {
      onDownloadZip({
        selectedPageIds,
        rootFolderName: (rootFolderName || defaultProjectName || 'Project').trim(),
        zipFileName: (rootFolderName || defaultProjectName || 'Project').trim()
      });
    } else if (selectedOption === 'copy') {
      onCopyCode();
    } else if (selectedOption === 'summarize') {
      onSummarizeProject(description);
    }
  };

  const getButtonText = () => {
    switch (selectedOption) {
      case 'zip': return "Download (.zip)";
      case 'copy': return "Copy Code";
      case 'summarize': return "Project Summary";
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
        width: 340,
        maxHeight: '85vh',
        background: 'rgba(17, 24, 39, 0.95)',
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
      <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
        <span style={{ fontSize: 14, fontWeight: 600 }}>Export Project</span>
        <button
          onClick={onClose}
          style={{ background: 'transparent', border: 'none', color: '#94A3B8', cursor: 'pointer', padding: 4, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          onMouseEnter={e => e.currentTarget.style.color = '#fff'}
          onMouseLeave={e => e.currentTarget.style.color = '#94A3B8'}
        >
          <X size={16} />
        </button>
      </div>

      <div style={{ padding: 20, display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 20 }}>
          {[
            { id: 'zip', label: 'Download Project Package (.zip)' },
            { id: 'copy', label: 'Copy HTML of Current Page' },
            { id: 'summarize', label: 'Project Summary' }
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
                  border: selectedOption === opt.id ? '5px solid #3B82F6' : '1px solid rgba(255,255,255,0.3)',
                  background: selectedOption === opt.id ? '#fff' : 'transparent',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.2s',
                  flexShrink: 0
                }}
              />
              <span style={{ fontSize: 13, fontWeight: 500, color: selectedOption === opt.id ? '#fff' : '#CBD5E1' }}>
                {opt.label}
              </span>
            </label>
          ))}
        </div>

        {selectedOption === 'zip' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 20, borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: 16 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <label style={{ fontSize: 12, fontWeight: 500, color: '#94A3B8' }}>ZIP File Name & Root Folder:</label>
              <input
                type="text"
                value={rootFolderName}
                onChange={e => setRootFolderName(e.target.value)}
                placeholder="Project Name..."
                style={{
                  background: 'rgba(0, 0, 0, 0.3)',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  borderRadius: 8,
                  padding: '8px 12px',
                  color: '#fff',
                  fontSize: 13,
                  outline: 'none',
                  width: '100%',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label style={{ fontSize: 12, fontWeight: 500, color: '#94A3B8' }}>
                  Select pages to download ({selectedPageIds.length}/{pages.length}):
                </label>
                <button
                  type="button"
                  onClick={() => {
                    if (selectedPageIds.length === pages.length) {
                      setSelectedPageIds([]);
                    } else {
                      setSelectedPageIds(pages.map(p => p.id));
                    }
                  }}
                  style={{ background: 'transparent', border: 'none', color: '#60A5FA', fontSize: 11, cursor: 'pointer', padding: 0 }}
                >
                  {selectedPageIds.length === pages.length ? 'Deselect all' : 'Select all'}
                </button>
              </div>

              <div style={{ maxHeight: 160, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 8, background: 'rgba(0,0,0,0.25)', padding: 10, borderRadius: 8, border: '1px solid rgba(255,255,255,0.06)' }}>
                {pages && pages.length > 0 ? (
                  pages.map(page => {
                    const isChecked = selectedPageIds.includes(page.id);
                    return (
                      <label key={page.id} style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', fontSize: 13, color: isChecked ? '#fff' : '#94A3B8' }}>
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => {
                            if (isChecked) {
                              setSelectedPageIds(selectedPageIds.filter(id => id !== page.id));
                            } else {
                              setSelectedPageIds([...selectedPageIds, page.id]);
                            }
                          }}
                          style={{ cursor: 'pointer', width: 14, height: 14, accentColor: '#3B82F6' }}
                        />
                        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {page.title || page.slug || 'Untitled Page'}
                        </span>
                      </label>
                    );
                  })
                ) : (
                  <span style={{ fontSize: 12, color: '#64748B' }}>No pages found</span>
                )}
              </div>
            </div>
          </div>
        )}

        <p style={{ fontSize: 12, color: '#9CA3AF', lineHeight: 1.5, margin: '0 0 16px 0' }}>
          {getDynamicDescription()}
        </p>

        <button
          onClick={handleAction}
          disabled={selectedOption === 'zip' && selectedPageIds.length === 0}
          style={{
            width: '100%',
            padding: '12px',
            background: selectedOption === 'zip' && selectedPageIds.length === 0 ? 'rgba(255,255,255,0.05)' : '#3B82F6',
            border: 'none',
            borderRadius: 24,
            color: selectedOption === 'zip' && selectedPageIds.length === 0 ? '#64748B' : '#fff',
            fontSize: 14,
            fontWeight: 600,
            cursor: selectedOption === 'zip' && selectedPageIds.length === 0 ? 'not-allowed' : 'pointer',
            transition: 'all 0.2s',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            boxShadow: selectedOption === 'zip' && selectedPageIds.length === 0 ? 'none' : '0 4px 12px rgba(59, 130, 246, 0.3)'
          }}
          onMouseEnter={(e) => {
            if (!(selectedOption === 'zip' && selectedPageIds.length === 0)) {
              e.currentTarget.style.background = '#2563EB';
            }
          }}
          onMouseLeave={(e) => {
            if (!(selectedOption === 'zip' && selectedPageIds.length === 0)) {
              e.currentTarget.style.background = '#3B82F6';
            }
          }}
        >
          {getButtonText()}
        </button>
      </div>
    </div>
  );
};

