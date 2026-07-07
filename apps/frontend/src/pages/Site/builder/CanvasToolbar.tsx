import React, { useState, useEffect, useRef } from 'react';
import {
  MenuOutlined,
  ShareAltOutlined,
  EditOutlined,
  LeftOutlined,
  DownloadOutlined,
  CopyOutlined,
  QuestionCircleOutlined,
  SettingOutlined,
  DeleteOutlined,
  MessageOutlined,
  BugOutlined,
} from '@ant-design/icons';
import { Dropdown, Modal, message, type MenuProps } from 'antd';
import { Sparkles, Pen, Eye, ChevronDown, MoreVertical, Play, PlusSquare, RotateCcw, Flame, Smartphone, Layers, PlayCircle, Store, Globe, Megaphone, Type, Palette, ExternalLink, QrCode, Tablet, Monitor, ArrowUpDown, Info, Code, Upload, Download, RotateCw, Trash2, Delete } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useQueryClient, useQuery } from '@tanstack/react-query';
import { UserPopover } from '@genzite/shared-ui';
import { useAuthStore } from '../../../store/auth';
import { updateSiteApi, deleteSiteApi } from '../../../api/sites';
import { fetchAiModelsApi } from '../../../api/ai';
import { CanvasToolbarModals } from './modals/CanvasToolbarModals';

interface CanvasToolbarProps {
  zoom?: number;
  onZoomIn?: () => void;
  onZoomOut?: () => void;
  onResetZoom?: () => void;
  onPreview?: () => void;
  onPublish?: () => void;
  siteTitle?: string;
  siteId?: string;
  site?: any;
  selectedId?: string | null;
  canvasDevice?: 'mobile' | 'tablet' | 'desktop' | 'full';
  onDeviceChange?: (device: 'mobile' | 'tablet' | 'desktop' | 'full') => void;
  onViewDetails?: () => void;
  onViewCode?: () => void;
  onDownload?: () => void;
  onReloadPage?: () => void;
  onDeletePage?: () => void;
}

const CanvasToolbar: React.FC<CanvasToolbarProps> = ({
  onPublish,
  siteTitle,
  siteId,
  site,
  selectedId,
  canvasDevice,
  onDeviceChange,
  onViewDetails,
  onViewCode,
  onDownload,
  onReloadPage,
  onDeletePage,
}) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);

  const [isRenameModalOpen, setIsRenameModalOpen] = useState(false);
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);
  const [isChatSettingsOpen, setIsChatSettingsOpen] = useState(false);
  const [isBugReportOpen, setIsBugReportOpen] = useState(false);
  const [bugReportText, setBugReportText] = useState('');
  
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const avatarRef = useRef<HTMLDivElement>(null);
  const [activeDrawerTab, setActiveDrawerTab] = useState<'chat' | 'share' | 'publish' | 'versions' | 'integrations'>('chat');
  
  // Use real models from backend
  const { data: models = [] } = useQuery({
    queryKey: ['ai-models'],
    queryFn: fetchAiModelsApi,
    staleTime: 1000 * 60 * 5,
  });

  const [selectedModel, setSelectedModel] = useState(site?.settings?.chatModel || 'gemini-2.5-flash');
  
  // Keep selectedModel synced if site settings change externally
  useEffect(() => {
    if (site?.settings?.chatModel) {
      setSelectedModel(site.settings.chatModel);
    }
  }, [site?.settings?.chatModel]);

  const handleModelChange = async (val: string) => {
    setSelectedModel(val);
    if (siteId) {
      try {
        await updateSiteApi(siteId, {
          settings: {
            ...site?.settings,
            chatModel: val,
          },
        });
        queryClient.invalidateQueries({ queryKey: ['site', siteId] });
      } catch (err) {
        console.error('Failed to update model in backend:', err);
      }
    }
  };

  const [micSource, setMicSource] = useState('Default');
  const [isCustomInstOpen, setIsCustomInstOpen] = useState(false);
  
  const [shareAccess, setShareAccess] = useState(site?.settings?.shareAccess || 'Restricted: Only people you specify can access');
  const [defaultFullscreen, setDefaultFullscreen] = useState(site?.settings?.defaultFullscreen || false);
  const [includeChatHistory, setIncludeChatHistory] = useState(site?.settings?.includeChatHistory || false);
  
  // Keep settings synced if they change externally
  useEffect(() => {
    if (site?.settings) {
      if (site.settings.shareAccess !== undefined) setShareAccess(site.settings.shareAccess);
      if (site.settings.defaultFullscreen !== undefined) setDefaultFullscreen(site.settings.defaultFullscreen);
      if (site.settings.includeChatHistory !== undefined) setIncludeChatHistory(site.settings.includeChatHistory);
    }
  }, [site?.settings]);

  const updateSetting = async (key: string, value: any) => {
    if (!siteId) return;
    try {
      await updateSiteApi(siteId, {
        settings: {
          ...site?.settings,
          [key]: value,
        },
      });
      queryClient.invalidateQueries({ queryKey: ['site', siteId] });
    } catch (err) {
      console.error(`Failed to update ${key} in backend:`, err);
    }
  };

  const handleShareAccessChange = (val: string) => {
    setShareAccess(val);
    updateSetting('shareAccess', val);
  };

  const handleDefaultFullscreenChange = (val: boolean) => {
    setDefaultFullscreen(val);
    updateSetting('defaultFullscreen', val);
  };

  const handleIncludeChatHistoryChange = (val: boolean) => {
    setIncludeChatHistory(val);
    updateSetting('includeChatHistory', val);
  };

  const [displayTitle, setDisplayTitle] = useState(site?.name || siteTitle || 'Product Mockup Visualizer');
  const [nameVal, setNameVal] = useState('');
  const [descVal, setDescVal] = useState('');
  const [promptVal, setPromptVal] = useState('');

  useEffect(() => {
    if (site?.name) setDisplayTitle(site.name);
    else if (siteTitle) setDisplayTitle(siteTitle);
  }, [site?.name, siteTitle]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        menuRef.current && 
        !menuRef.current.contains(event.target as Node) &&
        avatarRef.current &&
        !avatarRef.current.contains(event.target as Node)
      ) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleOpenRename = () => {
    setNameVal(displayTitle || 'Product Mockup Visualizer');
    setDescVal(
      site?.description ||
      'An AI-powered application that takes a product image and visualizes it in various marketing mediums like coffee mugs, billboards, and t-shirts.'
    );
    setPromptVal(
      site?.settings?.prompt ||
      'Create an app that takes a product image and visualizes it in various marketing mediums like coffee mugs, billboards, and t-shirts using generative AI. Ensure product consistency between each frame using nano banana'
    );
    setIsRenameModalOpen(true);
  };

  const handleSaveRename = async () => {
    setDisplayTitle(nameVal || 'Product Mockup Visualizer');
    setIsRenameModalOpen(false);
    message.success('Đã cập nhật thông tin ứng dụng!');

    if (siteId) {
      try {
        await updateSiteApi(siteId, {
          name: nameVal,
          description: descVal,
          settings: {
            ...site?.settings,
            prompt: promptVal,
          },
        });
        queryClient.invalidateQueries({ queryKey: ['site', siteId] });
        queryClient.invalidateQueries({ queryKey: ['sites'] });
      } catch (err) {
        console.error('Failed to update site in backend:', err);
      }
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    message.success('Đã sao chép liên kết chia sẻ dự án!');
  };

  const menuItems: MenuProps['items'] = [
    {
      key: 'all-projects',
      icon: <LeftOutlined />,
      label: 'Chuyển đến tất cả dự án',
      onClick: () => navigate('/project'),
    },
    {
      key: 'share',
      icon: <ShareAltOutlined />,
      label: 'Chia sẻ',
      onClick: () => {
        setActiveDrawerTab('share');
        setIsChatSettingsOpen(true);
      },
    },
    {
      key: 'download',
      icon: <DownloadOutlined />,
      label: 'Tải dự án xuống',
      onClick: () => {
        if (onDownload) onDownload();
        else message.success('Đang bắt đầu tải xuống dự án...');
      },
    },
    {
      key: 'duplicate',
      icon: <CopyOutlined />,
      label: 'Tạo bản sao dự án',
      onClick: () => {
        message.success('Đã tạo bản sao dự án!');
      },
    },
    {
      type: 'divider',
    },
    {
      key: 'feedback',
      icon: <MessageOutlined />,
      label: 'Gửi phản hồi',
      onClick: () => setIsBugReportOpen(true),
    },
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: 'Cài đặt',
      onClick: () => {
        setActiveDrawerTab('chat');
        setIsChatSettingsOpen(true);
      },
    },
    {
      type: 'divider',
    },
    {
      key: 'command-menu',
      icon: <span className="anticon" style={{ fontSize: 16, fontWeight: 700, lineHeight: 1 }}>⌘</span>,
      label: (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', gap: 24 }}>
          <span>Command menu</span>
          <span style={{ fontSize: 12, color: '#64748B', fontWeight: 600 }}>Ctrl+K</span>
        </div>
      ),
      onClick: () => message.info('Command Menu (Ctrl+K)'),
    },
    {
      key: 'delete',
      icon: <DeleteOutlined />,
      label: 'Xoá dự án',
      onClick: () => {
        Modal.confirm({
          title: 'Xoá dự án',
          content: 'Bạn có chắc chắn muốn xoá dự án này không? Hành động này không thể hoàn tác.',
          okText: 'Xoá',
          okType: 'danger',
          cancelText: 'Hủy',
          onOk: async () => {
            if (siteId) {
              try {
                await deleteSiteApi(siteId);
                queryClient.invalidateQueries({ queryKey: ['sites'] });
              } catch (e) {
                console.error(e);
              }
            }
            message.success('Đã xoá dự án!');
            navigate('/project');
          },
        });
      },
    },
  ];

  const generateMenuItems: MenuProps['items'] = [
    {
      key: '1',
      label: (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: 260, padding: '6px 4px', color: '#fff' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Play size={16} style={{ opacity: 0.7 }} />
            <span style={{ fontSize: 14, fontWeight: 500 }}>Nguyên mẫu lấy liền</span>
          </div>
          <div style={{ fontSize: 10, background: 'rgba(99, 102, 241, 0.15)', border: '1px solid rgba(99, 102, 241, 0.3)', color: '#818CF8', padding: '2px 6px', borderRadius: 6, fontWeight: 600 }}>NEW</div>
        </div>
      ),
    },
    {
      key: '2',
      label: (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 4px', color: '#fff' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <PlusSquare size={16} style={{ opacity: 0.7 }} />
            <span style={{ fontSize: 14, fontWeight: 500 }}>Biến thể</span>
          </div>
          <div style={{ fontSize: 12, color: '#94A3B8', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 2, letterSpacing: '0.05em' }}>
            ⇧V
          </div>
        </div>
      ),
    },
    {
      key: '3',
      label: (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 4px', color: '#fff' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <RotateCcw size={16} style={{ opacity: 0.7 }} />
            <span style={{ fontSize: 14, fontWeight: 500 }}>Tạo lại</span>
          </div>
          <div style={{ fontSize: 12, color: '#94A3B8', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 2, letterSpacing: '0.05em' }}>
            ⇧R
          </div>
        </div>
      ),
    },
    {
      key: '4',
      label: (
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '6px 4px', color: '#fff' }}>
          <Flame size={16} style={{ opacity: 0.7 }} />
          <span style={{ fontSize: 14, fontWeight: 500 }}>Bản đồ nhiệt dự đoán</span>
        </div>
      ),
    },
    {
      key: '5',
      label: (
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '6px 4px', color: '#fff' }}>
          <Smartphone size={16} style={{ opacity: 0.7 }} />
          <span style={{ fontSize: 14, fontWeight: 500 }}>Phiên bản ứng dụng di động</span>
        </div>
      ),
    },
    { type: 'divider', style: { borderColor: 'rgba(255,255,255,0.06)', margin: '8px 0' } },
    {
      key: '6',
      label: (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 4px', color: '#fff' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Layers size={16} style={{ opacity: 0.7 }} />
            <span style={{ fontSize: 14, fontWeight: 500 }}>Trạng thái bị thiếu</span>
          </div>
          <div style={{ fontSize: 10, background: 'rgba(99, 102, 241, 0.15)', border: '1px solid rgba(99, 102, 241, 0.3)', color: '#818CF8', padding: '2px 6px', borderRadius: 6, fontWeight: 600 }}>NEW</div>
        </div>
      ),
    },
    {
      key: '7',
      label: (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 4px', color: '#fff' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <PlayCircle size={16} style={{ opacity: 0.7 }} />
            <span style={{ fontSize: 14, fontWeight: 500 }}>Tạo ảnh động</span>
          </div>
          <div style={{ fontSize: 10, background: 'rgba(99, 102, 241, 0.15)', border: '1px solid rgba(99, 102, 241, 0.3)', color: '#818CF8', padding: '2px 6px', borderRadius: 6, fontWeight: 600 }}>NEW</div>
        </div>
      ),
    },
    {
      key: '8',
      label: (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 4px', color: '#fff' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Store size={16} style={{ opacity: 0.7 }} />
            <span style={{ fontSize: 14, fontWeight: 500 }}>App Store Assets</span>
          </div>
          <div style={{ fontSize: 10, background: 'rgba(99, 102, 241, 0.15)', border: '1px solid rgba(99, 102, 241, 0.3)', color: '#818CF8', padding: '2px 6px', borderRadius: 6, fontWeight: 600 }}>NEW</div>
        </div>
      ),
    },
    {
      key: '9',
      label: (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 4px', color: '#fff' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Globe size={16} style={{ opacity: 0.7 }} />
            <span style={{ fontSize: 14, fontWeight: 500 }}>Web Assets</span>
          </div>
          <div style={{ fontSize: 10, background: 'rgba(99, 102, 241, 0.15)', border: '1px solid rgba(99, 102, 241, 0.3)', color: '#818CF8', padding: '2px 6px', borderRadius: 6, fontWeight: 600 }}>NEW</div>
        </div>
      ),
    },
    {
      key: '10',
      label: (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 4px', color: '#fff' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Megaphone size={16} style={{ opacity: 0.7 }} />
            <span style={{ fontSize: 14, fontWeight: 500 }}>Marketing Kit</span>
          </div>
          <div style={{ fontSize: 10, background: 'rgba(99, 102, 241, 0.15)', border: '1px solid rgba(99, 102, 241, 0.3)', color: '#818CF8', padding: '2px 6px', borderRadius: 6, fontWeight: 600 }}>NEW</div>
        </div>
      ),
    },
    {
      key: '11',
      label: (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 4px', color: '#fff' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Eye size={16} style={{ opacity: 0.7 }} />
            <span style={{ fontSize: 14, fontWeight: 500 }}>Accessibility Audit</span>
          </div>
          <div style={{ fontSize: 10, background: 'rgba(99, 102, 241, 0.15)', border: '1px solid rgba(99, 102, 241, 0.3)', color: '#818CF8', padding: '2px 6px', borderRadius: 6, fontWeight: 600 }}>NEW</div>
        </div>
      ),
    }
  ];

  const modifyMenuItems: MenuProps['items'] = [
    {
      key: '1',
      label: (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: 220, padding: '6px 4px', color: '#fff' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Pen size={16} style={{ opacity: 0.7 }} />
            <span style={{ fontSize: 14, fontWeight: 500 }}>Chỉnh sửa</span>
          </div>
          <div style={{ fontSize: 12, color: '#94A3B8', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 2, letterSpacing: '0.05em' }}>
            E
          </div>
        </div>
      ),
    },
    {
      key: '2',
      label: (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 4px', color: '#fff' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Type size={16} style={{ opacity: 0.7 }} />
            <span style={{ fontSize: 14, fontWeight: 500 }}>Chú thích</span>
          </div>
          <div style={{ fontSize: 12, color: '#94A3B8', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 2, letterSpacing: '0.05em' }}>
            A
          </div>
        </div>
      ),
    },
    {
      key: '3',
      label: (
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '6px 4px', color: '#fff' }}>
          <Palette size={16} style={{ opacity: 0.7 }} />
          <span style={{ fontSize: 14, fontWeight: 500 }}>DESIGN.md</span>
        </div>
      ),
    }
  ];

  const previewMenuItems: MenuProps['items'] = [
    {
      key: '1',
      onClick: () => {
        if (siteId) {
          window.open(`/preview/${siteId}`, '_blank');
        } else {
          message.warning('Vui lòng lưu dự án trước khi xem trước');
        }
      },
      label: (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: 220, padding: '6px 4px', color: '#fff' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <ExternalLink size={16} style={{ opacity: 0.7 }} />
            <span style={{ fontSize: 14, fontWeight: 500 }}>New Tab</span>
          </div>
          <div style={{ fontSize: 12, color: '#94A3B8', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 2, letterSpacing: '0.05em' }}>
            ⇧P
          </div>
        </div>
      ),
    },
    {
      key: '2',
      onClick: () => setIsQrModalOpen(true),
      label: (
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '6px 4px', color: '#fff' }}>
          <QrCode size={16} style={{ opacity: 0.7 }} />
          <span style={{ fontSize: 14, fontWeight: 500 }}>Show QR Code</span>
        </div>
      ),
    },
    {
      key: '3',
      onClick: () => onDeviceChange?.('mobile'),
      label: (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 4px', color: canvasDevice === 'mobile' ? '#38bdf8' : '#fff' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Smartphone size={16} style={{ opacity: canvasDevice === 'mobile' ? 1 : 0.7 }} />
            <span style={{ fontSize: 14, fontWeight: 500 }}>Mobile</span>
          </div>
          <div style={{ fontSize: 12, color: canvasDevice === 'mobile' ? '#38bdf8' : '#94A3B8', fontWeight: 500 }}>
            390×884
          </div>
        </div>
      ),
    },
    {
      key: '4',
      onClick: () => onDeviceChange?.('tablet'),
      label: (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 4px', color: canvasDevice === 'tablet' ? '#38bdf8' : '#fff' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Tablet size={16} style={{ opacity: canvasDevice === 'tablet' ? 1 : 0.7 }} />
            <span style={{ fontSize: 14, fontWeight: 500 }}>Tablet</span>
          </div>
          <div style={{ fontSize: 12, color: canvasDevice === 'tablet' ? '#38bdf8' : '#94A3B8', fontWeight: 500 }}>
            768×1024
          </div>
        </div>
      ),
    },
    {
      key: '5',
      onClick: () => onDeviceChange?.('desktop'),
      label: (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 4px', color: canvasDevice === 'desktop' ? '#38bdf8' : '#fff' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Monitor size={16} style={{ opacity: canvasDevice === 'desktop' ? 1 : 0.7 }} />
            <span style={{ fontSize: 14, fontWeight: 500 }}>Desktop</span>
          </div>
          <div style={{ fontSize: 12, color: canvasDevice === 'desktop' ? '#38bdf8' : '#94A3B8', fontWeight: 500 }}>
            1280×1024
          </div>
        </div>
      ),
    },
    {
      key: '6',
      onClick: () => onDeviceChange?.('full'),
      label: (
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '6px 4px', color: canvasDevice === 'full' ? '#38bdf8' : '#fff' }}>
          <ArrowUpDown size={16} style={{ opacity: canvasDevice === 'full' ? 1 : 0.7 }} />
          <span style={{ fontSize: 14, fontWeight: 500 }}>Full Height</span>
        </div>
      ),
    }
  ];

  const moreMenuItems: MenuProps['items'] = [
    {
      key: '1',
      label: (
        <div 
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: 220, padding: '6px 4px', color: '#fff' }}
          onClick={() => {
            if (onViewDetails) onViewDetails();
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Info size={16} style={{ opacity: 0.7 }} />
            <span style={{ fontSize: 14, fontWeight: 500 }}>View Details</span>
          </div>
          <div style={{ fontSize: 12, color: '#94A3B8', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 2, letterSpacing: '0.05em' }}>
            I
          </div>
        </div>
      ),
    },
    {
      key: '2',
      label: (
        <div 
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 4px', color: '#fff' }}
          onClick={() => {
            if (onViewCode) onViewCode();
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Code size={16} style={{ opacity: 0.7 }} />
            <span style={{ fontSize: 14, fontWeight: 500 }}>Xem mã</span>
          </div>
          <div style={{ fontSize: 12, color: '#94A3B8', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 2, letterSpacing: '0.05em' }}>
            ⇧C
          </div>
        </div>
      ),
    },
    {
      key: '3',
      label: (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 4px', color: '#fff' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Upload size={16} style={{ opacity: 0.7 }} />
            <span style={{ fontSize: 14, fontWeight: 500 }}>Xuất</span>
          </div>
          <div style={{ fontSize: 12, color: '#94A3B8', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 2, letterSpacing: '0.05em' }}>
            Ctrl⇧E
          </div>
        </div>
      ),
    },
    {
      key: '4',
      label: (
        <div 
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 4px', color: '#fff' }}
          onClick={() => { if (onDownload) onDownload(); }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Download size={16} style={{ opacity: 0.7 }} />
            <span style={{ fontSize: 14, fontWeight: 500 }}>Tải xuống</span>
          </div>
          <div style={{ fontSize: 12, color: '#94A3B8', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 2, letterSpacing: '0.05em' }}>
            ⇧D
          </div>
        </div>
      ),
    },
    {
      key: '5',
      label: (
        <div 
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 4px', color: '#fff' }}
          onClick={() => { if (onReloadPage) onReloadPage(); }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <RotateCw size={16} style={{ opacity: 0.7 }} />
            <span style={{ fontSize: 14, fontWeight: 500 }}>Tải lại</span>
          </div>
          <div style={{ fontSize: 12, color: '#94A3B8', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 2, letterSpacing: '0.05em' }}>
            CtrlR
          </div>
        </div>
      ),
    },
    { type: 'divider', style: { borderColor: 'rgba(255,255,255,0.06)', margin: '8px 0' } },
    {
      key: '6',
      label: (
        <div 
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 4px', color: '#ef4444' }}
          onClick={() => { if (onDeletePage) onDeletePage(); }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Trash2 size={16} />
            <span style={{ fontSize: 14, fontWeight: 500 }}>Xoá</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <Delete size={14} style={{ opacity: 0.7 }} />
          </div>
        </div>
      ),
    }
  ];

  return (
    <>
      <div className="canvas-toolbar">
        <div className="canvas-toolbar-left" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Dropdown
            menu={{ items: menuItems, className: 'canvas-project-menu' }}
            trigger={['click']}
            placement="bottomLeft"
          >
            <button
              className="canvas-header-btn-icon"
              title="Menu dự án"
            >
              <MenuOutlined style={{ fontSize: 16 }} />
            </button>
          </Dropdown>

          <div
            className="canvas-project-title-wrapper"
            onClick={handleOpenRename}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              cursor: 'pointer',
              padding: '4px 10px',
              borderRadius: 8,
              transition: 'all 0.2s ease',
              marginLeft: 2,
              border: '1px solid transparent'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
              e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
              e.currentTarget.style.borderColor = 'transparent';
            }}
            title="Nhấp để đổi tên và thiết lập ứng dụng (Rename app)"
          >
            <span style={{ fontSize: 15, fontWeight: 600, color: '#fff', letterSpacing: '0.01em', fontFamily: 'var(--font-sans)' }}>
              {displayTitle}
            </span>
            <EditOutlined style={{ fontSize: 13, color: '#94A3B8', opacity: 0.8 }} />
          </div>
        </div>

        <div className="canvas-toolbar-center" style={{ display: 'flex', justifyContent: 'center', flex: 1 }}>
          {selectedId && (
            <div style={{
              background: '#0F172A',
              border: '1px solid #1E293B',
              borderRadius: 9999,
              display: 'flex',
              alignItems: 'center',
              padding: '6px 20px',
              gap: 20,
              color: '#F8FAFC',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)'
            }}>
              <Dropdown 
                menu={{ 
                  items: generateMenuItems,
                  style: {
                    background: 'rgba(23, 23, 23, 0.85)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: 16,
                    padding: '8px',
                    backdropFilter: 'blur(24px) saturate(150%)',
                    boxShadow: '0 12px 40px rgba(0, 0, 0, 0.5)'
                  }
                }} 
                trigger={['click']}
                placement="bottomLeft"
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', fontWeight: 500, fontSize: 13, transition: 'color 0.2s' }} onMouseEnter={e => e.currentTarget.style.color = '#38bdf8'} onMouseLeave={e => e.currentTarget.style.color = '#F8FAFC'}>
                  <Sparkles size={16} /> Generate <ChevronDown size={14} style={{ opacity: 0.5, marginTop: 2 }} />
                </div>
              </Dropdown>
              <Dropdown 
                menu={{ 
                  items: modifyMenuItems,
                  style: {
                    background: 'rgba(23, 23, 23, 0.85)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: 16,
                    padding: '8px',
                    backdropFilter: 'blur(24px) saturate(150%)',
                    boxShadow: '0 12px 40px rgba(0, 0, 0, 0.5)'
                  }
                }} 
                trigger={['click']}
                placement="bottomLeft"
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', fontWeight: 500, fontSize: 13, transition: 'color 0.2s' }} onMouseEnter={e => e.currentTarget.style.color = '#38bdf8'} onMouseLeave={e => e.currentTarget.style.color = '#F8FAFC'}>
                  <Pen size={16} /> Modify <ChevronDown size={14} style={{ opacity: 0.5, marginTop: 2 }} />
                </div>
              </Dropdown>
              <Dropdown 
                menu={{ 
                  items: previewMenuItems,
                  style: {
                    background: 'rgba(23, 23, 23, 0.85)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: 16,
                    padding: '8px',
                    backdropFilter: 'blur(24px) saturate(150%)',
                    boxShadow: '0 12px 40px rgba(0, 0, 0, 0.5)'
                  }
                }} 
                trigger={['click']}
                placement="bottomLeft"
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', fontWeight: 500, fontSize: 13, transition: 'color 0.2s' }} onMouseEnter={e => e.currentTarget.style.color = '#38bdf8'} onMouseLeave={e => e.currentTarget.style.color = '#F8FAFC'}>
                  <Eye size={16} /> Preview <ChevronDown size={14} style={{ opacity: 0.5, marginTop: 2 }} />
                </div>
              </Dropdown>
              <div style={{ width: 1, height: 16, background: '#334155' }} />
              <Dropdown 
                menu={{ 
                  items: moreMenuItems,
                  style: {
                    background: 'rgba(23, 23, 23, 0.85)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: 16,
                    padding: '8px',
                    backdropFilter: 'blur(24px) saturate(150%)',
                    boxShadow: '0 12px 40px rgba(0, 0, 0, 0.5)'
                  }
                }} 
                trigger={['click']}
                placement="bottomLeft"
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', fontWeight: 500, fontSize: 13, transition: 'color 0.2s' }} onMouseEnter={e => e.currentTarget.style.color = '#38bdf8'} onMouseLeave={e => e.currentTarget.style.color = '#F8FAFC'}>
                  <MoreVertical size={16} style={{ opacity: 0.5 }} /> More
                </div>
              </Dropdown>
            </div>
          )}
        </div>

        <div className="canvas-toolbar-right" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button
            className="canvas-header-btn-pill"
            title="Chia sẻ dự án (Share)"
            onClick={() => {
              setActiveDrawerTab('share');
              setIsChatSettingsOpen(true);
            }}
          >
            <span>Share</span>
          </button>

          <button
            className="canvas-header-btn-pill"
            title="Phát hành / Xuất dự án (Publish)"
            onClick={() => {
              setActiveDrawerTab('publish');
              setIsChatSettingsOpen(true);
            }}
          >
            <span>Publish</span>
          </button>

          <button
            className="canvas-header-btn-icon"
            title="Gửi lỗi / Báo cáo sự cố (Bug Report)"
            onClick={() => setIsBugReportOpen(true)}
          >
            <BugOutlined style={{ fontSize: 16 }} />
          </button>

          <button
            className="canvas-header-btn-icon"
            title="Chat settings"
            onClick={() => {
              setActiveDrawerTab('chat');
              setIsChatSettingsOpen(true);
            }}
          >
            <SettingOutlined style={{ fontSize: 16 }} />
          </button>

          <div className="canvas-avatar-wrapper ml-1">
            <div 
              className="canvas-avatar cursor-pointer" 
              ref={avatarRef}
              onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
              style={{ width: 38, height: 38, borderRadius: '50%', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.15)', marginLeft: 4 }}
              title={user?.name || 'User Profile'}
            >
              {user?.name ? (
                <div className="avatar-initials">
                  {user.name.charAt(0).toUpperCase()}
                </div>
              ) : (
                <img src={user?.avatarUrl || "https://i.pravatar.cc/150?img=33"} alt="User Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              )}
            </div>

            {isUserMenuOpen && (
              <UserPopover
                isOpen={isUserMenuOpen}
                onClose={() => setIsUserMenuOpen(false)}
                onLogout={handleLogout}
                user={user}
                menuRef={menuRef}
                style={{ top: 56, right: 0 }}
              />
            )}
          </div>
        </div>
      </div>

      <CanvasToolbarModals
        isRenameModalOpen={isRenameModalOpen} setIsRenameModalOpen={setIsRenameModalOpen}
        isChatSettingsOpen={isChatSettingsOpen} setIsChatSettingsOpen={setIsChatSettingsOpen}
        isBugReportOpen={isBugReportOpen} setIsBugReportOpen={setIsBugReportOpen}
        isCustomInstOpen={isCustomInstOpen} setIsCustomInstOpen={setIsCustomInstOpen}
        activeDrawerTab={activeDrawerTab} setActiveDrawerTab={setActiveDrawerTab}
        nameVal={nameVal} setNameVal={setNameVal}
        descVal={descVal} setDescVal={setDescVal}
        promptVal={promptVal} setPromptVal={setPromptVal}
        handleSaveRename={handleSaveRename} onPublish={onPublish}
        selectedModel={selectedModel} setSelectedModel={handleModelChange}
        models={models}
        micSource={micSource} setMicSource={setMicSource}
        shareAccess={shareAccess} setShareAccess={handleShareAccessChange}
        defaultFullscreen={defaultFullscreen} setDefaultFullscreen={handleDefaultFullscreenChange}
        includeChatHistory={includeChatHistory} setIncludeChatHistory={handleIncludeChatHistoryChange}
        bugReportText={bugReportText} setBugReportText={setBugReportText}
        user={user} handleShare={handleShare}
      />

      <Modal
        title={null}
        open={isQrModalOpen}
        onCancel={() => setIsQrModalOpen(false)}
        footer={null}
        width={380}
        centered
        styles={{
          mask: { backdropFilter: 'blur(8px)', background: 'rgba(0, 0, 0, 0.45)' },
          content: { background: '#222327', border: '1px solid rgba(255,255,255,0.08)', padding: '24px 24px 32px 24px', borderRadius: 12 },
        }}
        closeIcon={<span style={{ fontSize: 20, color: '#A1A1AA', fontWeight: 300 }}>×</span>}
      >
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <h2 style={{ color: '#fff', fontSize: 17, fontWeight: 500, margin: '0 0 24px 0', textAlign: 'center' }}>
            Quét mã QR
          </h2>
          <div style={{ background: '#fff', padding: 16, borderRadius: 12, marginBottom: 20 }}>
            <img 
              src={`https://api.qrserver.com/v1/create-qr-code/?size=256x256&data=${encodeURIComponent(window.location.origin + '/live/' + siteId)}&margin=0`} 
              alt="QR Code" 
              style={{ width: 220, height: 220, display: 'block' }} 
            />
          </div>
          <div style={{ color: '#A1A1AA', textAlign: 'center', fontSize: 13.5, lineHeight: 1.6, fontWeight: 400 }}>
            Quét mã này bằng thiết bị di động để<br/>xem bản xem trước.
          </div>
        </div>
      </Modal>
    </>
  );
};

export default CanvasToolbar;

