import React, { useState, useRef, useEffect, useCallback } from 'react';
import { message, Modal, Spin, Form, Input } from 'antd';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { fetchWidgetsApi, deletePageApi, duplicateSiteApi, updateSiteApi, updatePageApi } from '../../../api/sites';
import { uploadMediaFileApi } from '../../../api/media';

export interface CanvasStroke {
  id: string;
  points: { x: number; y: number }[];
  color: string;
  width: number;
}
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import ReactMarkdown from 'react-markdown';
import {
  ZoomInOutlined,
  ZoomOutOutlined,
  FullscreenOutlined,
  ArrowUpOutlined,
  BorderOutlined,
  EditOutlined,
  DragOutlined,
  PictureOutlined,
  BgColorsOutlined,
  StarOutlined,
  SearchOutlined,
  HomeOutlined,
  UserOutlined,
  ToolOutlined,
  AppstoreOutlined,
  TagOutlined,
  BookOutlined,
  UndoOutlined,
  RedoOutlined,
  CopyOutlined,
  CloseOutlined
} from '@ant-design/icons';
import { Sparkles, X, Trash2 } from 'lucide-react';
import CanvasPageFrame from './CanvasPageFrame';
import AIPromptBar from './AIPromptBar';
import CanvasToolbar from './CanvasToolbar';
import { useAiLogStore } from '../../../store/aiLogs';
import { ThemeEditorPanel, THEMES, generateDesignMd } from './workspace-components/ThemeEditorPanel';
import { ExportPanel } from './workspace-components/ExportPanel';
import { LeftSidebar } from './workspace-components/LeftSidebar';
import { useAuthStore } from '../../../store/auth';
import WidgetRenderer from './WidgetRenderer';
import { renderToStaticMarkup } from 'react-dom/server';
import { DraggableBoard } from './components/DraggableBoard';
import { MediaLibraryModal } from './components/MediaLibraryModal';
const MIN_ZOOM = 0.1;
const MAX_ZOOM = 2;
const ZOOM_STEP = 0.1;
const PAGE_SPACING = 1640;


interface CanvasWorkspaceProps {
  pages: any[];
  siteId: string;
  site?: any;
  onAIGenerated?: (jobId: string, subdomain?: string, platform?: 'app' | 'web') => void;
  onViewDetails?: () => void;
  onViewCode?: () => void;
  onDownload?: () => void;
  onReloadPage?: () => void;
  onDeletePage?: () => void;
  onDuplicateProject?: () => void;
}

const CanvasWorkspace: React.FC<CanvasWorkspaceProps> = ({
  pages: rawPages,
  siteId,
  site,
  onAIGenerated,
  onViewDetails,
  onViewCode,
  onDownload,
  onReloadPage,
  onDeletePage,
  onDuplicateProject,
}) => {
  // Normalize pages to always be an array (guards against wrapped API responses)
  const pages: any[] = Array.isArray(rawPages) ? rawPages : (rawPages as any)?.data ?? (rawPages as any)?.pages ?? [];
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);
  const [pageToDelete, setPageToDelete] = useState<any>(null);
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const isGenerating = useAiLogStore((state) => state.isGenerating);
  const isOwner = !!(
    (user?.id && site?.ownerId && site.ownerId === user.id) ||
    (user?.id && (!site?.ownerId || siteId?.startsWith('gen-') || siteId?.startsWith('new-') || isGenerating)) ||
    (!site?.ownerId && (siteId?.startsWith('gen-') || siteId?.startsWith('new-') || isGenerating))
  );

  const CANVAS_IMAGES_KEY = `genzite-canvas-images-${siteId}`;
  const [floatingImages, setFloatingImages] = useState<{ id: string; url: string; name: string; previewUrl?: string; uploading?: boolean }[]>(() => {
    try {
      const saved = localStorage.getItem(CANVAS_IMAGES_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as { id: string; url: string; name: string }[];
        return parsed.map(p => ({ ...p, uploading: false }));
      }
      return [];
    } catch {
      return [];
    }
  });
  const [floatingNotes, setFloatingNotes] = useState<{ id: string; title: string; content: string }[]>([]);

  const DRAWINGS_KEY = `genzite-canvas-drawings-${siteId}`;
  const [drawings, setDrawings] = useState<CanvasStroke[]>(() => {
    try {
      const saved = localStorage.getItem(`genzite-canvas-drawings-${siteId}`);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch { /* ignore */ }
    if (site?.settings?.canvasDrawings && Array.isArray(site.settings.canvasDrawings)) {
      return site.settings.canvasDrawings;
    }
    return [];
  });

  const [drawColor, setDrawColor] = useState<string>('#6366F1'); // Indigo default
  const [drawWidth, setDrawWidth] = useState<number>(4);
  const [isEraserMode, setIsEraserMode] = useState<boolean>(false);
  const [currentStroke, setCurrentStroke] = useState<CanvasStroke | null>(null);
  const [frameSelectBox, setFrameSelectBox] = useState<{ startX: number; startY: number; currentX: number; currentY: number } | null>(null);
  const [starredPageIds, setStarredPageIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(`genzite-canvas-starred-pages-${siteId}`);
      if (saved) return JSON.parse(saved);
    } catch { /* ignore */ }
    if (site?.settings?.starredPageIds && Array.isArray(site.settings.starredPageIds)) {
      return site.settings.starredPageIds;
    }
    return [];
  });

  useEffect(() => {
    if (siteId && starredPageIds) {
      try {
        localStorage.setItem(`genzite-canvas-starred-pages-${siteId}`, JSON.stringify(starredPageIds));
      } catch { /* ignore */ }
    }
  }, [starredPageIds, siteId]);

  useEffect(() => {
    if (site?.settings?.canvasDrawings && Array.isArray(site.settings.canvasDrawings)) {
      setDrawings(prev => prev.length === 0 ? site.settings.canvasDrawings : prev);
    }
  }, [site?.settings?.canvasDrawings]);

  const saveDrawingsToBackend = useCallback(async (newDrawings: CanvasStroke[]) => {
    try {
      localStorage.setItem(DRAWINGS_KEY, JSON.stringify(newDrawings));
      if (siteId && !siteId.startsWith('gen-')) {
        await updateSiteApi(siteId, {
          settings: {
            ...(typeof site?.settings === 'object' && site?.settings ? site.settings : {}),
            canvasDrawings: newDrawings
          }
        });
      }
    } catch (err) {
      console.error('Failed to save drawings to backend', err);
    }
  }, [siteId, site?.settings, DRAWINGS_KEY]);

  const submitSiteGeneration = useAiLogStore(state => state.submitSiteGeneration);
  const [isApplyingTheme, setIsApplyingTheme] = useState(false);

  const handleApplyThemeToSelection = () => {
    if (!selectedId) {
      message.warning('Please select a page first');
      return;
    }

    const themeOverrides = {
      themeId: detailThemeId,
      mode: themeMode,
      radius: themeRadius,
      colors: themeColorOverrides,
      fonts: themeFonts,
      designPrompt: activePage?.settings?.designPrompt || site?.settings?.designPrompt || site?.settings?.systemPrompt || ((site?.settings as any)?.prompt) || site?.description
    };

    setIsApplyingTheme(true);
    message.info('Applying design system to selected page...');

    submitSiteGeneration(
      `[TARGET_PAGE:${selectedId}] Update the current page UI to perfectly match the provided Design System and color palette.`,
      'gemini-2.5-flash',
      siteId || `gen-${Date.now()}`,
      JSON.stringify(themeOverrides),
      (jobId, _subdomain) => {
        setIsApplyingTheme(false);
        message.success('Design applied successfully! Loading...');
        if (onAIGenerated) {
          onAIGenerated(jobId);
        }
      },
      (error) => {
        setIsApplyingTheme(false);
        message.error(error || 'Failed to apply design');
      }
    );
  };

  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasCenterRef = useRef<HTMLDivElement>(null);
  const workspaceRootRef = useRef<HTMLDivElement>(null);
  const pendingUploadRef = useRef<{ id: string; previewUrl: string } | null>(null);

  const [zoom, setZoom] = useState(0.4);
  const [pan, setPan] = useState({ x: 100, y: 100 });
  const [isPanning, setIsPanning] = useState(false);
  const [activeTool, setActiveTool] = useState<'select' | 'frame' | 'draw' | 'pan' | 'image' | 'palette' | 'star' | 'tag'>('pan');

  useEffect(() => {
    const handleHistoryState = (e: any) => {
      if (e.detail?.pageId && pages.some(p => p.id === e.detail.pageId)) {
        setCanUndo(e.detail.canUndo);
        setCanRedo(e.detail.canRedo);
      }
    };
    window.addEventListener('genzite:history:state', handleHistoryState);
    return () => window.removeEventListener('genzite:history:state', handleHistoryState);
  }, [pages]);

  const [pageDimensions, setPageDimensions] = useState<Record<string, { width: number; height: number }>>({});
  useEffect(() => {
    const handlePageDimensions = (e: any) => {
      if (e.detail?.pageId && e.detail.width && e.detail.height) {
        setPageDimensions(prev => ({
          ...prev,
          [e.detail.pageId]: { width: e.detail.width, height: e.detail.height }
        }));
      }
    };
    window.addEventListener('genzite:page:dimensions', handlePageDimensions);
    return () => window.removeEventListener('genzite:page:dimensions', handlePageDimensions);
  }, []);

  const panStart = useRef<{ mx: number; my: number; px: number; py: number } | null>(null);
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isStylesOpen, setIsStylesOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [detailThemeId, setDetailThemeId] = useState<string | null>(null);
  const [detailThemeTab, setDetailThemeTab] = useState<'Theme' | 'DESIGN.md'>('Theme');
  const [isClearDrawingsModalOpen, setIsClearDrawingsModalOpen] = useState(false);

  useEffect(() => {
    if (activeTool !== 'palette') {
      setIsStylesOpen(false);
    }
    if (activeTool !== 'tag') {
      setPageToEdit(null);
    }
  }, [activeTool]);
  const [themeColorOverrides, setThemeColorOverrides] = useState<Record<string, string>>({});
  const [themeFonts, setThemeFonts] = useState<Record<string, string>>({});
  const [expandedFontRole, setExpandedFontRole] = useState<string | null>(null);
  const [fontSearch, setFontSearch] = useState('');
  const [themeScheme, setThemeScheme] = useState('Fidelity');
  const [themeMode, setThemeMode] = useState<'light' | 'dark'>('light');
  const [themeRadius, setThemeRadius] = useState<number>(4);
  const [isThemeSchemeOpen, setIsThemeSchemeOpen] = useState(false);
  const [isCodeModalOpen, setIsCodeModalOpen] = useState(false);
  const [canvasDevice, setCanvasDevice] = useState<'mobile' | 'tablet' | 'desktop' | 'full'>('full');
  const isSidebarExpandedRef = useRef(true);

  // Keep a ref in sync so panToCenterDevice can read it without being re-created
  useEffect(() => {
    isSidebarExpandedRef.current = isSidebarExpanded;
  }, [isSidebarExpanded]);

  const panToCenterDevice = useCallback((device: 'mobile' | 'tablet' | 'desktop' | 'full') => {
    setCanvasDevice(device);
    const targetZoom = device === 'mobile' ? 0.85 : device === 'tablet' ? 0.75 : device === 'desktop' ? 0.55 : 0.45;
    setZoom(targetZoom);

    // Measure the actual visible canvas area via DOM ref (accounts for sidebar, toolbar, AIPromptBar automatically)
    const rect = canvasCenterRef.current?.getBoundingClientRect();
    const viewW = rect ? rect.width : Math.max(400, window.innerWidth - (isSidebarExpandedRef.current ? 280 : 0));
    const viewH = rect ? rect.height : Math.max(400, window.innerHeight - 144);

    const w = device === 'mobile' ? 390 : device === 'tablet' ? 768 : 1440;
    const h = device === 'mobile' ? 844 : device === 'tablet' ? 1024 : 900;

    // canvas-center uses transform: translate(panX, panY) scale(zoom), transformOrigin: '0 0'
    // screenX_in_canvas = panX + pos.x * zoom
    // To center the device frame horizontally: panX + PAGE_SPACING*zoom + (w*zoom)/2 = viewW/2
    const initialX = PAGE_SPACING;
    const panX = (viewW - w * targetZoom) / 2 - initialX * targetZoom;

    // To center the device frame vertically with a small top gap (48px)
    const initialY = 160;
    const topGap = 48;
    const panY = topGap + Math.max(0, (viewH - h * targetZoom - topGap) / 2) - initialY * targetZoom;

    setPan({ x: panX, y: panY });
  }, []); // stable — reads canvasCenterRef and sidebar via ref, no stale closure

  // Auto-center on initial load once the canvas DOM is ready
  useEffect(() => {
    const initialDevice = site?.settings?.platform === 'app' ? 'mobile' : 'full';
    const timer = setTimeout(() => panToCenterDevice(initialDevice), 50);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // run only once on mount

  useEffect(() => {
    if (site?.settings?.platform === 'app') {
      setCanvasDevice('mobile');
    } else if (site?.settings?.platform === 'web') {
      setCanvasDevice('full');
    }
  }, [site?.settings?.platform]);

  const activeTargetPageId = useAiLogStore(state => state.activeTargetPageId);
  const activePrompt = useAiLogStore(state => state.activePrompt);
  const aiSteps = useAiLogStore(state => state.steps);

  useEffect(() => {
    if (isGenerating) {
      setIsSidebarExpanded(true);
    }
  }, [isGenerating]);

  const queryClient = useQueryClient();

  // Persist completed floating images to localStorage
  useEffect(() => {
    const completed = floatingImages.filter(img => !img.uploading && !!img.url && !img.url.startsWith('blob:'));
    try {
      localStorage.setItem(CANVAS_IMAGES_KEY, JSON.stringify(completed));
    } catch { /* ignore storage quota */ }
  }, [floatingImages, CANVAS_IMAGES_KEY]);

  const uploadMutation = useMutation({
    mutationFn: (file: File) => uploadMediaFileApi(file),
    onSuccess: (mediaFile) => {
      const pending = pendingUploadRef.current;
      if (pending) {
        // Swap local blob preview for the real server URL
        setFloatingImages(prev => prev.map(img =>
          img.id === pending.id
            ? { ...img, url: mediaFile.url, name: mediaFile.filename, uploading: false }
            : img
        ));
        URL.revokeObjectURL(pending.previewUrl);
        pendingUploadRef.current = null;
      }
      queryClient.invalidateQueries({ queryKey: ['site-media'] });
      message.success('Image added to canvas!');
    },
    onError: () => {
      // Remove the pending board on error
      const pending = pendingUploadRef.current;
      if (pending) {
        setFloatingImages(prev => prev.filter(img => img.id !== pending.id));
        URL.revokeObjectURL(pending.previewUrl);
        pendingUploadRef.current = null;
      }
      message.error('Failed to upload image!');
    }
  });

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Show instantly with local blob preview before upload finishes
      const localPreviewUrl = URL.createObjectURL(file);
      const tempId = `img-${Date.now()}`;
      pendingUploadRef.current = { id: tempId, previewUrl: localPreviewUrl };

      setFloatingImages(prev => [
        ...prev,
        { id: tempId, url: localPreviewUrl, name: file.name, uploading: true }
      ]);

      uploadMutation.mutate(file);
    }
    if (e.target) {
      e.target.value = '';
    }
  };

  const topZCounter = useRef(10);
  const requestTopZ = useCallback(() => {
    topZCounter.current += 1;
    return topZCounter.current;
  }, []);

  const deletePageMutation = useMutation({
    mutationFn: (id: string) => deletePageApi(id),
    onSuccess: () => {
      message.success('Page deleted successfully!');
      queryClient.invalidateQueries({ queryKey: ['site-pages', siteId] });
      setSelectedId(null);
    },
    onError: () => {
      message.error('Failed to delete page!');
    }
  });

  const [pageToEdit, setPageToEdit] = useState<any>(null);
  const updatePageMutation = useMutation({
    mutationFn: ({ id, data }: { id: string, data: { title: string; slug: string } }) => updatePageApi(id, data),
    onSuccess: () => {
      message.success('Page updated successfully!');
      queryClient.invalidateQueries({ queryKey: ['site-pages', siteId] });
      setPageToEdit(null);
    },
    onError: () => {
      message.error('Failed to update page!');
    }
  });

  const { data: allPagesWidgets, isFetching: isFetchingWidgets } = useQuery({
    queryKey: ['site-all-widgets', siteId, pages],
    queryFn: async () => {
      if (!pages || pages.length === 0) return [];
      const results = await Promise.all(
        pages.map((page: any) => fetchWidgetsApi(page.id).catch(() => []))
      );
      return results.flat();
    },
    enabled: !!pages && pages.length > 0 && !!siteId,
  });

  const getTargetActivePage = useCallback(() => {
    if (!pages || pages.length === 0) return undefined;
    if (selectedId) {
      const idList = selectedId.split(',').map((id: string) => id.trim()).filter(Boolean);
      for (const id of idList) {
        const directPage = pages.find((p: any) => p.id === id || id.includes(p.id));
        if (directPage) return directPage;
        if (allPagesWidgets && Array.isArray(allPagesWidgets)) {
          const widget = allPagesWidgets.find((w: any) => w._id === id || id.includes(w._id));
          if (widget && widget.pageId) {
            const widgetPage = pages.find((p: any) => p.id === widget.pageId);
            if (widgetPage) return widgetPage;
          }
        }
      }
    }
    return pages[0];
  }, [pages, selectedId, allPagesWidgets]);

  const handleDeletePage = () => {
    const activePage = getTargetActivePage();
    if (!activePage) return;
    setPageToDelete(activePage);
  };

  const handleDuplicateProject = async () => {
    if (!siteId) {
      message.error('Project not saved yet');
      return;
    }
    const hideLoading = message.loading({ content: 'Duplicating project...', key: 'duplicate-project', duration: 0 });
    try {
      await duplicateSiteApi(siteId);
      hideLoading();
      message.success({ content: 'Project duplicated successfully!', key: 'duplicate-project' });
      queryClient.invalidateQueries({ queryKey: ['sites'] });
      navigate('/project');
    } catch (error: any) {
      hideLoading();
      message.error({
        content: error?.response?.data?.message || 'Failed to duplicate project',
        key: 'duplicate-project'
      });
    }
  };

  const handleReloadPage = () => {
    queryClient.invalidateQueries({ queryKey: ['site-all-widgets', siteId] });

    // Create a visual feedback effect on the active page
    const activePage = getTargetActivePage();
    if (activePage) {
      const pageEl = document.getElementById(`page-card-${activePage.id}`);
      if (pageEl) {
        pageEl.style.transition = 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
        pageEl.style.transform = 'scale(0.98)';
        pageEl.style.opacity = '0.7';
        pageEl.style.filter = 'brightness(1.1)';

        setTimeout(() => {
          pageEl.style.transform = 'scale(1)';
          pageEl.style.opacity = '1';
          pageEl.style.filter = 'brightness(1)';

          setTimeout(() => {
            pageEl.style.transition = '';
            pageEl.style.transform = '';
            pageEl.style.filter = '';
          }, 300);
        }, 200);
      }
    }
  };

  const handleDownload = async (options?: { selectedPageIds?: string[]; rootFolderName?: string; zipFileName?: string }) => {
    if (!pages || pages.length === 0) return;

    const hideMessage = message.loading('Đang chuẩn bị dữ liệu tải về...', 0);
    try {
      const zip = new JSZip();

      const rootFolderStr = (options?.rootFolderName || site?.name || site?.subdomain || 'Project').trim() || 'Project';
      const rootFolder = zip.folder(rootFolderStr);
      if (!rootFolder) {
        throw new Error('Failed to create root folder inside zip');
      }

      const targetPageIds = options?.selectedPageIds && options.selectedPageIds.length > 0
        ? options.selectedPageIds
        : pages.map((p: any) => p.id);

      const selectedPages = pages.filter((p: any) => targetPageIds.includes(p.id));
      if (selectedPages.length === 0) {
        hideMessage();
        message.warning('Vui lòng chọn ít nhất 1 trang để tải về!');
        return;
      }

      const activeThemeObj = detailThemeId === 'custom'
        ? { id: 'custom', name: 'Tùy chỉnh', font: 'Aa', colors: ['#1976D2', '#E65100'], buttonBg: '#1976D2', buttonColor: '#FFFFFF' }
        : (detailThemeId ? THEMES.find(t => t.id === detailThemeId) : THEMES[0]) || THEMES[0];

      for (const page of selectedPages) {
        const pageFolderName = (page.title || page.slug || 'page').trim().replace(/[^a-zA-Z0-9_\-\u00C0-\u024F\u1E00-\u1EFF]/g, '_') || `page_${page.id.slice(0, 4)}`;
        const pageFolder = rootFolder.folder(pageFolderName);
        if (!pageFolder) continue;

        const htmlString = getPageCode(page);
        const fileName = `${page.slug || 'index'}.html`;
        pageFolder.file(fileName, htmlString);

        const rawPrompt = page?.settings?.designPrompt || site?.settings?.systemPrompt || ((site?.settings as any)?.prompt) || site?.description || '';
        const designPrompt = rawPrompt.trim().startsWith('---')
          ? rawPrompt
          : generateDesignMd(activeThemeObj, themeColorOverrides, themeFonts, themeMode, themeRadius, rawPrompt);
        pageFolder.file('DESIGN.md', designPrompt);
      }

      const zipBlob = await zip.generateAsync({ type: 'blob' });
      const finalZipName = `${options?.zipFileName || rootFolderStr}.zip`;
      saveAs(zipBlob, finalZipName);
      hideMessage();
      setIsExportOpen(false);
    } catch (err) {
      console.error(err);
      hideMessage();
      message.error('Tải về thất bại!');
    }
  };

  const handleCopyCode = () => {
    const htmlString = getActivePageCode();
    navigator.clipboard.writeText(htmlString);
    setIsExportOpen(false);
  };

  const handleSummarizeProject = async (_description: string) => {
    const activePage = getTargetActivePage();
    if (!activePage) return;

    setIsExportOpen(false);
    const hideMessage = message.loading('AI Studio đang tạo tóm tắt...', 0);
    try {
      setTimeout(() => {
        const projectName = site?.name || 'ELARA';
        const projectDesc = site?.settings?.designPrompt || 'Luxury Minimalist Lifestyle';

        const summaryText = `Project Brief: ${projectName} — ${projectDesc}

## Brand Vision
**${projectName}** is a lifestyle brand dedicated to "Precision in Simplicity." The brand elevates everyday experiences through curated design and mindful production, emphasizing high-quality materials, architectural structure, and a "less is more" philosophy.

## Target Audience
- **Discerning Minimalists**: Individuals who value quality over quantity and seek timeless pieces.
- **Design Enthusiasts**: Users appreciative of architectural forms, clean lines, and neutral palettes.
- **Luxury Shoppers**: Customers looking for an exclusive, calm, and premium digital shopping experience.

## Design Principles
- **Minimalist Luxury**: Use of ample whitespace, a monochromatic palette (Black, White, Stone), and high-contrast typography.
- **Typographic Hierarchy**: Bold use of serif typefaces (Playfair Display) for headlines to convey heritage and elegance, paired with clean sans-serifs for utility.
- **Materiality**: Visuals should focus on texture, craftsmanship, and "obsidian structure."
- **Invisible Interface**: UI elements should be functional but unobtrusive, allowing product imagery to take center stage.

## Key Features & User Journey
- **Immersive Homepage**: A high-impact entry point featuring "The Core Collection" and a scroll-triggered discovery flow.
- **Curated Collections**: Structured galleries for "Limited Series" and "Essentials."
- **The Journal**: A space for brand storytelling, philosophy, and "Precision in Simplicity" content.
- **Seamless Navigation**: A clean, center-aligned header with a slide-out drawer for deep exploration.
- **Exclusive Shopping Bag**: A refined checkout preview that maintains the luxury aesthetic.

## Visual Identity (Current Assets)
- **Primary Color**: #1a1a1a (Deep Obsidian)
- **Surface Color**: #fbf9f9 (Off-white / Stone)
- **Typography**: Playfair Display (Headline), Sans-serif (Body)
- **Logo**: Geometric "A" within a circle

## Success Metrics
- **Brand Cohesion**: Consistency across all touchpoints (Mobile, Desktop, Marketing).
- **Engagement**: High interaction rates with "The Journal" and Collection deep-dives.
- **Conversion**: A frictionless, premium path to purchase.`;

        hideMessage();

        setFloatingNotes(prev => [...prev, { id: `note-${Date.now()}`, title: 'Project Brief', content: summaryText }]);

        // Dispatch custom event if a widget listener exists
        window.dispatchEvent(new CustomEvent('genzite:widget:create', {
          detail: { type: 'text', content: summaryText }
        }));
      }, 2000);
    } catch (err) {
      hideMessage();
      message.error('Lỗi khi tạo tóm tắt');
    }
  };

  const getPageCode = useCallback((targetPage: any) => {
    if (!targetPage || !allPagesWidgets) return '';

    const pageWidgets = allPagesWidgets.filter((w: any) => w._id?.includes(targetPage.id) || w.pageId === targetPage.id);
    const grapesWidget = pageWidgets.find((w: any) => w.type === 'GRAPESJS');

    let htmlContent = '';
    let cssContent = '';

    if (grapesWidget) {
      htmlContent = grapesWidget.contentConfig?.html || '';
      cssContent = grapesWidget.contentConfig?.css || '';
    } else {
      htmlContent = pageWidgets.map((w: any) => {
        if (w.contentConfig?.html) return w.contentConfig.html; // Fallback to legacy HTML
        return renderToStaticMarkup(<WidgetRenderer type={w.type} config={w.contentConfig} isActive={false} />);
      }).join('\n');
    }

    return `<!DOCTYPE html>
<html class="light" lang="en"><head>
<meta charset="utf-8"/>
<meta content="width=device-width, initial-scale=1.0" name="viewport"/>
<title>${targetPage.title} | ${site?.name || 'Project'}</title>
<script src="https://cdn.tailwindcss.com?plugins=forms,container-queries"></script>
<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600&family=Inter:wght@400;500;600&display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet"/>
<script id="tailwind-config">
  tailwind.config = {
    darkMode: "class",
    theme: {
      extend: {}
    }
  }
</script>
<style>
${cssContent}
</style>
</head>
<body>
${htmlContent}
</body>
</html>`;
  }, [allPagesWidgets, site]);

  const getActivePageCode = useCallback(() => {
    const activePage = getTargetActivePage();
    return getPageCode(activePage);
  }, [getTargetActivePage, getPageCode]);

  const extractRealProjectColors = () => {
    const colorCounts: Record<string, number> = {};
    const addColor = (col?: string) => {
      if (!col || typeof col !== 'string') return;
      const matches = col.match(/#[0-9a-fA-F]{3,8}|rgb\([^)]+\)|hsl\([^)]+\)/g);
      if (matches) {
        matches.forEach(c => {
          let clean = c.toUpperCase();
          if (clean === '#FFF' || clean === '#FFFFFF' || clean === '#000' || clean === '#000000' || clean === '#00000000' || clean === 'TRANSPARENT') return;
          if (clean.length === 4 && clean.startsWith('#')) {
            clean = `#${clean[1]}${clean[1]}${clean[2]}${clean[2]}${clean[3]}${clean[3]}`;
          }
          colorCounts[clean] = (colorCounts[clean] || 0) + 1;
        });
      }
    };

    if (site?.settings) {
      JSON.stringify(site.settings, (_key, value) => {
        if (typeof value === 'string') addColor(value);
        return value;
      });
    }

    if (allPagesWidgets && Array.isArray(allPagesWidgets)) {
      allPagesWidgets.forEach(w => {
        if (w.contentConfig) {
          JSON.stringify(w.contentConfig, (_key, value) => {
            if (typeof value === 'string') addColor(value);
            return value;
          });
        }
      });
    }

    const sortedColors = Object.entries(colorCounts)
      .sort((a, b) => b[1] - a[1])
      .map(entry => entry[0]);

    const primary = sortedColors[0] || (site?.settings?.primaryColor as string) || '#0F172A';
    const secondary = sortedColors[1] || (site?.settings?.secondaryColor as string) || '#334155';
    const tertiary = sortedColors[2] || '#2563EB';
    const neutral = sortedColors[3] || '#F8FAFC';

    const generateShades = (baseHex: string) => {
      if (!baseHex.startsWith('#') || baseHex.length < 7) {
        return [baseHex, baseHex, baseHex, baseHex, baseHex, baseHex, baseHex, baseHex, baseHex, baseHex];
      }
      const r = parseInt(baseHex.slice(1, 3), 16);
      const g = parseInt(baseHex.slice(3, 5), 16);
      const b = parseInt(baseHex.slice(5, 7), 16);
      const shades: string[] = [];
      for (let i = 0; i < 10; i++) {
        const factor = (i - 4) * 0.15;
        let nr = r, ng = g, nb = b;
        if (factor < 0) {
          const darkFactor = 1 + factor;
          nr = Math.round(r * darkFactor);
          ng = Math.round(g * darkFactor);
          nb = Math.round(b * darkFactor);
        } else {
          nr = Math.round(r + (255 - r) * factor);
          ng = Math.round(g + (255 - g) * factor);
          nb = Math.round(b + (255 - b) * factor);
        }
        nr = Math.min(255, Math.max(0, nr));
        ng = Math.min(255, Math.max(0, ng));
        nb = Math.min(255, Math.max(0, nb));
        const hex = `#${nr.toString(16).padStart(2, '0')}${ng.toString(16).padStart(2, '0')}${nb.toString(16).padStart(2, '0')}`.toUpperCase();
        shades.push(hex);
      }
      return shades;
    };

    return {
      primary,
      secondary,
      tertiary,
      neutral,
      primaryShades: generateShades(primary),
      secondaryShades: generateShades(secondary),
      tertiaryShades: generateShades(tertiary),
      neutralShades: generateShades(neutral),
      allExtracted: sortedColors
    };
  };

  const projectColors = extractRealProjectColors();

  const getToolBtnStyle = (toolName: string): React.CSSProperties => ({
    width: 32,
    height: 32,
    borderRadius: '50%',
    border: 'none',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    fontSize: 15,
    position: 'relative',
    background: 'transparent',
    color: activeTool === toolName ? '#0F172A' : '#CBD5E1',
    transition: 'color 0.2s',
    zIndex: 1
  });

  const zoomIn = () => setZoom(z => Math.min(MAX_ZOOM, parseFloat((z + ZOOM_STEP).toFixed(2))));
  const zoomOut = () => setZoom(z => Math.max(MIN_ZOOM, parseFloat((z - ZOOM_STEP).toFixed(2))));
  const resetZoom = () => panToCenterDevice(canvasDevice);

  useEffect(() => {
    const el = canvasCenterRef.current;
    if (!el) return;
    const handleNativeWheel = (e: WheelEvent) => {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
        const delta = e.deltaY > 0 ? -ZOOM_STEP : ZOOM_STEP;
        setZoom(z => Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, parseFloat((z + delta).toFixed(2)))));
      }
    };
    el.addEventListener('wheel', handleNativeWheel, { passive: false });
    return () => el.removeEventListener('wheel', handleNativeWheel);
  }, []);
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (document.activeElement?.tagName === 'INPUT' || document.activeElement?.tagName === 'TEXTAREA') return;
      switch (e.key.toLowerCase()) {
        case 'v':
          setActiveTool('select');
          setIsStylesOpen(false);
          setIsDetailsOpen(false);
          break;
        case 'f':
          setActiveTool('frame');
          setIsStylesOpen(false);
          setIsDetailsOpen(false);
          break;
        case 'a':
        case 'p':
          setActiveTool('draw');
          setIsStylesOpen(false);
          setIsDetailsOpen(false);
          break;
        case 'h':
          setActiveTool('pan');
          setIsStylesOpen(false);
          setIsDetailsOpen(false);
          break;
        case 'i':
          setActiveTool('image');
          setIsStylesOpen(false);
          setIsDetailsOpen(false);
          fileInputRef.current?.click();
          break;
        case 'c':
          setActiveTool('palette');
          setIsStylesOpen(prev => !prev);
          setIsDetailsOpen(false);
          setPan({ x: 100, y: 100 });
          break;
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.button === 0 && activeTool === 'frame') {
      const rootRect = workspaceRootRef.current?.getBoundingClientRect();
      if (rootRect) {
        const vx = (e.clientX - rootRect.left - pan.x) / zoom;
        const vy = (e.clientY - rootRect.top - pan.y) / zoom;
        setFrameSelectBox({ startX: vx, startY: vy, currentX: vx, currentY: vy });
      }
      return;
    }

    if ((e.target as HTMLElement).classList.contains('canvas-center') ||
      (e.target as HTMLElement).classList.contains('canvas-viewport')) {
      if (e.button === 0 && activeTool !== 'pan') {
        setSelectedId(null);
      }
    }

    if (e.button === 1 || e.altKey || e.button === 2 || (activeTool === 'pan' && e.button === 0)) {
      e.preventDefault();
      setIsPanning(true);
      panStart.current = { mx: e.clientX, my: e.clientY, px: pan.x, py: pan.y };
    }
  }, [pan.x, pan.y, zoom, activeTool]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (frameSelectBox && workspaceRootRef.current) {
      const rootRect = workspaceRootRef.current.getBoundingClientRect();
      const vx = (e.clientX - rootRect.left - pan.x) / zoom;
      const vy = (e.clientY - rootRect.top - pan.y) / zoom;
      setFrameSelectBox(prev => prev ? { ...prev, currentX: vx, currentY: vy } : null);
    }
    if (isPanning && panStart.current) {
      setPan({
        x: panStart.current.px + (e.clientX - panStart.current.mx),
        y: panStart.current.py + (e.clientY - panStart.current.my),
      });
    }
    if (workspaceRootRef.current) {
      const rect = workspaceRootRef.current.getBoundingClientRect();
      workspaceRootRef.current.style.setProperty('--mouse-x', `${e.clientX - rect.left}px`);
      workspaceRootRef.current.style.setProperty('--mouse-y', `${e.clientY - rect.top}px`);
    }
  }, [isPanning, frameSelectBox, pan.x, pan.y, zoom]);

  const handleMouseUp = useCallback((e: React.MouseEvent) => {
    if (frameSelectBox) {
      const rootRect = workspaceRootRef.current?.getBoundingClientRect();
      if (rootRect && pages && pages.length > 0) {
        const vxMin = Math.min(frameSelectBox.startX, frameSelectBox.currentX);
        const vxMax = Math.max(frameSelectBox.startX, frameSelectBox.currentX);
        const vyMin = Math.min(frameSelectBox.startY, frameSelectBox.currentY);
        const vyMax = Math.max(frameSelectBox.startY, frameSelectBox.currentY);

        const screenLeft = rootRect.left + pan.x + vxMin * zoom;
        const screenTop = rootRect.top + pan.y + vyMin * zoom;
        const screenRight = rootRect.left + pan.x + vxMax * zoom;
        const screenBottom = rootRect.top + pan.y + vyMax * zoom;

        if (Math.abs(vxMax - vxMin) > 5 || Math.abs(vyMax - vyMin) > 5) {
          const matchedPageIds: string[] = [];
          pages.forEach((p: any) => {
            const pageEl = document.getElementById(`page-card-${p.id}`);
            if (pageEl) {
              const rect = pageEl.getBoundingClientRect();
              const intersects = !(
                screenLeft > rect.right ||
                screenRight < rect.left ||
                screenTop > rect.bottom ||
                screenBottom < rect.top
              );
              if (intersects) {
                matchedPageIds.push(p.id);
              }
            }
          });

          if (matchedPageIds.length > 0) {
            const newSelection = e.shiftKey && selectedId
              ? Array.from(new Set([...selectedId.split(','), ...matchedPageIds])).join(',')
              : matchedPageIds.join(',');
            setSelectedId(newSelection);
          } else if (!e.shiftKey) {
            setSelectedId(null);
          }
        }
      }
      setFrameSelectBox(null);
    }

    setIsPanning(false);
    panStart.current = null;
  }, [frameSelectBox, pan.x, pan.y, zoom, pages, selectedId]);

  const handlePreview = () => {
    const activePage = getTargetActivePage();
    if (activePage) {
      window.open(`/preview/${siteId}?pageId=${activePage.id}`, '_blank');
    }
  };

  const handlePublish = () => {
    // Publish logic is handled inside CanvasToolbarModals via API
    // We no longer need to open the local /live/ route
  };

  // Only expose an active page when the user has actually clicked/selected one
  const activePage = selectedId ? getTargetActivePage() : undefined;

  return (
    <div
      className="canvas-workspace-root"
      ref={workspaceRootRef}
      onMouseMove={handleMouseMove}
      style={{ display: 'block', width: '100%', height: '100%', position: 'relative' }}
    >
      <input
        type="file"
        ref={fileInputRef}
        style={{ display: 'none' }}
        accept="image/*"
        onChange={handleImageUpload}
      />

      <CanvasToolbar
        zoom={zoom}
        onZoomIn={zoomIn}
        onZoomOut={zoomOut}
        onResetZoom={resetZoom}
        onPreview={handlePreview}
        onPublish={handlePublish}
        siteTitle={site?.name || pages?.[0]?.title || 'My App'}
        siteId={siteId}
        site={site}
        activePageId={activePage?.id}
        canvasDevice={canvasDevice}
        onDeviceChange={panToCenterDevice}
        onViewDetails={onViewDetails || (() => { setIsDetailsOpen(true); setIsStylesOpen(false); })}
        onViewStyles={(tab) => { setIsStylesOpen(true); if (tab) setDetailThemeTab(tab); setIsDetailsOpen(false); setActiveTool('palette'); }}
        onViewCode={onViewCode || (() => setIsCodeModalOpen(true))}
        onExport={() => setIsExportOpen(!isExportOpen)}
        onDownload={onDownload || handleDownload}
        onReloadPage={onReloadPage || handleReloadPage}
        onDeletePage={onDeletePage || handleDeletePage}
        onDuplicateProject={onDuplicateProject || handleDuplicateProject}
        onSelectTool={(toolId) => setActiveTool(toolId as any)}
      />

      <div className="canvas-body" style={{ display: 'flex', position: 'absolute', inset: 0, overflow: 'hidden' }}>
        {isOwner && (
          <LeftSidebar
            isSidebarExpanded={isSidebarExpanded}
            setIsSidebarExpanded={setIsSidebarExpanded}
          />
        )}

        <div
          className="canvas-center"
          ref={canvasCenterRef}
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onContextMenu={(e) => { e.preventDefault(); handleMouseDown(e); }}
          style={{
            width: '100%',
            height: '100%',
            cursor: isPanning ? 'grabbing' :
              activeTool === 'pan' ? 'grab' :
                (activeTool === 'frame' || activeTool === 'draw') ? 'crosshair' : 'default',
            background: 'transparent'
          }}
        >
          <div
            className="canvas-viewport"
            style={{
              transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
              transformOrigin: '0 0',
              position: 'absolute',
              pointerEvents: (activeTool === 'pan' || isPanning) ? 'none' : 'auto',
              width: 10000, height: 10000
            }}
          >
            <DraggableBoard
              initialX={0}
              initialY={100}
              zoom={zoom}
              activeTool={activeTool}
              requestTopZ={requestTopZ}
              style={{
                width: 1360,
                display: 'flex',
                flexDirection: 'column',
                fontFamily: site?.settings?.fontFamily || 'Inter, system-ui, sans-serif'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#1E293B', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #334155' }}>
                  <BgColorsOutlined style={{ fontSize: 16, color: '#fff' }} />
                </div>
                <span style={{ fontSize: 22, fontWeight: 600, color: '#fff', letterSpacing: '-0.01em' }}>
                  {site?.name || 'Design System'}
                </span>
                <span style={{ fontSize: 12, background: 'rgba(99, 102, 241, 0.2)', color: '#818CF8', padding: '4px 10px', borderRadius: 999, fontWeight: 600, border: '1px solid rgba(99, 102, 241, 0.3)', marginLeft: 8 }}>
                  Design System
                </span>
              </div>

              <div
                style={{
                  background: '#F8FAFC',
                  border: `3px solid ${projectColors.primary}`,
                  borderRadius: 24,
                  padding: 24,
                  boxShadow: `0 30px 100px ${projectColors.primary}40, 0 10px 40px rgba(0, 0, 0, 0.5)`,
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr 1fr 1fr',
                  gap: 16
                }}
              >
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <div style={{ background: '#fff', borderRadius: 16, padding: 16, boxShadow: '0 4px 15px rgba(0,0,0,0.04)', border: '1px solid #E2E8F0' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                      <span style={{ fontSize: 13, fontWeight: 700, color: '#0F172A' }}>Primary</span>
                      <span style={{ fontSize: 12, fontWeight: 600, color: '#64748B', fontFamily: 'monospace' }}>{projectColors.primary}</span>
                    </div>
                    <div style={{ display: 'flex', height: 48, borderRadius: 10, overflow: 'hidden', border: '1px solid rgba(0,0,0,0.08)' }}>
                      {projectColors.primaryShades.map((col, idx) => (
                        <div
                          key={idx}
                          style={{ flex: 1, background: col, cursor: 'pointer' }}
                          title={`Click to copy ${col}`}
                          onClick={() => {
                            navigator.clipboard.writeText(col);
                            message.success(`Copied ${col} to clipboard!`);
                          }}
                        />
                      ))}
                    </div>
                  </div>

                  <div style={{ background: '#fff', borderRadius: 16, padding: 16, boxShadow: '0 4px 15px rgba(0,0,0,0.04)', border: '1px solid #E2E8F0' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                      <span style={{ fontSize: 13, fontWeight: 700, color: '#0F172A' }}>Secondary</span>
                      <span style={{ fontSize: 12, fontWeight: 600, color: '#64748B', fontFamily: 'monospace' }}>{projectColors.secondary}</span>
                    </div>
                    <div style={{ display: 'flex', height: 48, borderRadius: 10, overflow: 'hidden', border: '1px solid rgba(0,0,0,0.08)' }}>
                      {projectColors.secondaryShades.map((col, idx) => (
                        <div
                          key={idx}
                          style={{ flex: 1, background: col, cursor: 'pointer' }}
                          title={`Click to copy ${col}`}
                          onClick={() => {
                            navigator.clipboard.writeText(col);
                            message.success(`Copied ${col} to clipboard!`);
                          }}
                        />
                      ))}
                    </div>
                  </div>

                  <div style={{ background: '#fff', borderRadius: 16, padding: 16, boxShadow: '0 4px 15px rgba(0,0,0,0.04)', border: '1px solid #E2E8F0' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                      <span style={{ fontSize: 13, fontWeight: 700, color: '#0F172A' }}>Tertiary</span>
                      <span style={{ fontSize: 12, fontWeight: 600, color: '#64748B', fontFamily: 'monospace' }}>{projectColors.tertiary}</span>
                    </div>
                    <div style={{ display: 'flex', height: 48, borderRadius: 10, overflow: 'hidden', border: '1px solid rgba(0,0,0,0.08)' }}>
                      {projectColors.tertiaryShades.map((col, idx) => (
                        <div
                          key={idx}
                          style={{ flex: 1, background: col, cursor: 'pointer' }}
                          title={`Click to copy ${col}`}
                          onClick={() => {
                            navigator.clipboard.writeText(col);
                            message.success(`Copied ${col} to clipboard!`);
                          }}
                        />
                      ))}
                    </div>
                  </div>

                  <div style={{ background: '#fff', borderRadius: 16, padding: 16, boxShadow: '0 4px 15px rgba(0,0,0,0.04)', border: '1px solid #E2E8F0' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                      <span style={{ fontSize: 13, fontWeight: 700, color: '#0F172A' }}>Neutral</span>
                      <span style={{ fontSize: 12, fontWeight: 600, color: '#64748B', fontFamily: 'monospace' }}>{projectColors.neutral}</span>
                    </div>
                    <div style={{ display: 'flex', height: 48, borderRadius: 10, overflow: 'hidden', border: '1px solid rgba(0,0,0,0.08)' }}>
                      {projectColors.neutralShades.map((col, idx) => (
                        <div
                          key={idx}
                          style={{ flex: 1, background: col, cursor: 'pointer' }}
                          title={`Click to copy ${col}`}
                          onClick={() => {
                            navigator.clipboard.writeText(col);
                            message.success(`Copied ${col} to clipboard!`);
                          }}
                        />
                      ))}
                    </div>
                  </div>

                  {projectColors.allExtracted.length > 0 && (
                    <div style={{ background: '#0F172A', borderRadius: 16, padding: 16, boxShadow: '0 4px 15px rgba(0,0,0,0.1)', border: '1px solid #334155' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                        <span style={{ fontSize: 12, fontWeight: 700, color: '#60A5FA', textTransform: 'uppercase', letterSpacing: 0.5 }}>Live Project Palette</span>
                        <span style={{ fontSize: 11, background: '#1E293B', color: '#94A3B8', padding: '2px 8px', borderRadius: 999 }}>{projectColors.allExtracted.length} colors</span>
                      </div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, maxHeight: 80, overflowY: 'auto' }}>
                        {projectColors.allExtracted.map((col, idx) => (
                          <div
                            key={idx}
                            style={{ width: 24, height: 24, borderRadius: 6, background: col, border: '1px solid rgba(255,255,255,0.2)', cursor: 'pointer', flexShrink: 0 }}
                            title={`Click to copy ${col}`}
                            onClick={() => {
                              navigator.clipboard.writeText(col);
                              message.success(`Copied ${col} to clipboard!`);
                            }}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <div style={{ background: '#fff', borderRadius: 16, padding: '24px 20px', boxShadow: '0 4px 15px rgba(0,0,0,0.04)', border: '1px solid #E2E8F0', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: 13, fontWeight: 600, color: '#64748B' }}>Headline</span>
                      <span style={{ fontSize: 12, fontWeight: 500, color: '#94A3B8', textTransform: 'capitalize' }}>{site?.settings?.fontFamily?.split(',')[0] || 'Inter'}</span>
                    </div>
                    <div style={{ fontSize: 72, fontWeight: 700, color: '#0F172A', letterSpacing: '-0.03em', lineHeight: 1, margin: '16px 0', fontFamily: site?.settings?.fontFamily || 'Inter, system-ui, sans-serif' }}>
                      Aa
                    </div>
                    <div style={{ fontSize: 12, color: '#94A3B8' }}>48px • Bold • 1.2 line height</div>
                  </div>

                  <div style={{ background: '#fff', borderRadius: 16, padding: '24px 20px', boxShadow: '0 4px 15px rgba(0,0,0,0.04)', border: '1px solid #E2E8F0', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: 13, fontWeight: 600, color: '#64748B' }}>Body</span>
                      <span style={{ fontSize: 12, fontWeight: 500, color: '#94A3B8', textTransform: 'capitalize' }}>{site?.settings?.fontFamily?.split(',')[0] || 'Inter'}</span>
                    </div>
                    <div style={{ fontSize: 56, fontWeight: 500, color: '#334155', letterSpacing: '-0.02em', lineHeight: 1, margin: '16px 0', fontFamily: site?.settings?.fontFamily || 'Inter, system-ui, sans-serif' }}>
                      Aa
                    </div>
                    <div style={{ fontSize: 12, color: '#94A3B8' }}>16px • Medium • 1.5 line height</div>
                  </div>

                  <div style={{ background: '#fff', borderRadius: 16, padding: '24px 20px', boxShadow: '0 4px 15px rgba(0,0,0,0.04)', border: '1px solid #E2E8F0', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: 13, fontWeight: 600, color: '#64748B' }}>Label</span>
                      <span style={{ fontSize: 12, fontWeight: 500, color: '#94A3B8', textTransform: 'capitalize' }}>{site?.settings?.fontFamily?.split(',')[0] || 'Inter'}</span>
                    </div>
                    <div style={{ fontSize: 44, fontWeight: 400, color: '#64748B', letterSpacing: '-0.01em', lineHeight: 1, margin: '16px 0', fontFamily: site?.settings?.fontFamily || 'Inter, system-ui, sans-serif' }}>
                      Aa
                    </div>
                    <div style={{ fontSize: 12, color: '#94A3B8' }}>14px • Regular • 1.4 line height</div>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <div style={{ background: '#fff', borderRadius: 16, padding: 20, boxShadow: '0 4px 15px rgba(0,0,0,0.04)', border: '1px solid #E2E8F0', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                    <button style={{ background: projectColors.primary, color: '#fff', border: 'none', padding: '12px', borderRadius: 8, fontWeight: 600, fontSize: 13, cursor: 'pointer', fontFamily: site?.settings?.fontFamily || 'inherit' }}>
                      Primary
                    </button>
                    <button style={{ background: projectColors.secondary, color: '#fff', border: 'none', padding: '12px', borderRadius: 8, fontWeight: 600, fontSize: 13, cursor: 'pointer', fontFamily: site?.settings?.fontFamily || 'inherit' }}>
                      Secondary
                    </button>
                    <button style={{ background: projectColors.tertiary, color: '#fff', border: 'none', padding: '12px', borderRadius: 8, fontWeight: 600, fontSize: 13, cursor: 'pointer', fontFamily: site?.settings?.fontFamily || 'inherit' }}>
                      Tertiary
                    </button>
                    <button style={{ background: '#fff', color: projectColors.primary, border: `1px solid ${projectColors.primary}`, padding: '12px', borderRadius: 8, fontWeight: 600, fontSize: 13, cursor: 'pointer', fontFamily: site?.settings?.fontFamily || 'inherit' }}>
                      Outlined
                    </button>
                  </div>

                  <div style={{ background: '#fff', borderRadius: 16, padding: '28px 24px', boxShadow: '0 4px 15px rgba(0,0,0,0.04)', border: '1px solid #E2E8F0', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 16, flex: 1 }}>
                    <div style={{ width: '100%', height: 8, background: '#F1F5F9', borderRadius: 999, overflow: 'hidden' }}>
                      <div style={{ width: '75%', height: '100%', background: projectColors.primary, borderRadius: 999 }} />
                    </div>
                    <div style={{ width: '100%', height: 8, background: '#F1F5F9', borderRadius: 999, overflow: 'hidden' }}>
                      <div style={{ width: '45%', height: '100%', background: projectColors.secondary, borderRadius: 999 }} />
                    </div>
                    <div style={{ width: '100%', height: 8, background: '#F1F5F9', borderRadius: 999, overflow: 'hidden' }}>
                      <div style={{ width: '90%', height: '100%', background: projectColors.tertiary, borderRadius: 999 }} />
                    </div>
                  </div>

                  <div style={{ background: '#fff', borderRadius: 16, padding: 20, boxShadow: '0 4px 15px rgba(0,0,0,0.04)', border: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ width: 44, height: 44, borderRadius: 10, background: '#1E3A8A', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#60A5FA' }}>
                      <EditOutlined style={{ fontSize: 18 }} />
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#1E293B', color: '#fff', padding: '10px 18px', borderRadius: 10, fontWeight: 600, fontSize: 13 }}>
                      <EditOutlined style={{ color: '#60A5FA' }} />
                      <span>Label</span>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <div style={{ background: '#fff', borderRadius: 16, padding: 20, boxShadow: '0 4px 15px rgba(0,0,0,0.04)', border: '1px solid #E2E8F0' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: '#F1F5F9', border: '1px solid #E2E8F0', borderRadius: 10, padding: '10px 14px', color: '#64748B', fontSize: 14 }}>
                      <SearchOutlined />
                      <span>Search</span>
                    </div>
                  </div>

                  <div style={{ background: '#fff', borderRadius: 16, padding: '28px 20px', boxShadow: '0 4px 15px rgba(0,0,0,0.04)', border: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 24, background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: 999, padding: '10px 24px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
                      <div style={{ width: 36, height: 36, borderRadius: 10, background: '#0F172A', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <HomeOutlined style={{ fontSize: 16 }} />
                      </div>
                      <SearchOutlined style={{ fontSize: 18, color: '#64748B', cursor: 'pointer' }} />
                      <UserOutlined style={{ fontSize: 18, color: '#64748B', cursor: 'pointer' }} />
                    </div>
                  </div>

                  <div style={{ background: '#fff', borderRadius: 16, padding: 20, boxShadow: '0 4px 15px rgba(0,0,0,0.04)', border: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ width: 42, height: 42, borderRadius: 8, background: '#000', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>
                      <ToolOutlined />
                    </div>
                    <div style={{ width: 42, height: 42, borderRadius: 8, background: '#3B82F6', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>
                      <AppstoreOutlined />
                    </div>
                    <div style={{ width: 42, height: 42, borderRadius: 8, background: '#0F172A', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>
                      <TagOutlined />
                    </div>
                    <div style={{ width: 42, height: 42, borderRadius: 8, background: '#DC2626', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>
                      <BookOutlined />
                    </div>
                  </div>
                </div>
              </div>
            </DraggableBoard>

            {(pages || []).map((page: any, index: number) => {
              const isSelectedPage = selectedId?.includes(page.id) || (!selectedId && index === 0);
              const isCreatePagePrompt = activePrompt && /(?:Create|Add page|Add|Generate|Tạo|Thêm|Thêm trang|Tạo trang|Làm trang|Xây dựng trang)\s+|(?:page|trang|screen)\s+(?:mới|new|giới thiệu|about|contact|liên hệ|sản phẩm|products|pricing|bảng giá|faq|blog|login|register|đăng nhập|đăng ký|giỏ hàng|cart|checkout)/i.test(activePrompt);
              const isPageRegenerating = isGenerating && (
                activeTargetPageId === page.id ||
                (!activeTargetPageId && isSelectedPage && !isCreatePagePrompt && (selectedId !== null || pages.length <= 1))
              );
              const currentStepObj = aiSteps.length > 0 ? aiSteps[aiSteps.length - 1] : null;

              return (
                <DraggableBoard
                  key={page.id}
                  initialX={(index + 1) * PAGE_SPACING}
                  initialY={160}
                  zoom={zoom}
                  activeTool={activeTool}
                  requestTopZ={requestTopZ}
                >
                  <div id={`page-card-${page.id}`} style={{ position: 'relative', width: '100%', height: '100%' }}>
                    {isFetchingWidgets && isSelectedPage && !isPageRegenerating && (
                      <div style={{ position: 'absolute', inset: -8, background: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(6px)', zIndex: 9999, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none', borderRadius: 12 }}>
                        <Spin size="large" />
                        <div style={{ marginTop: 16, color: '#38bdf8', fontWeight: 600, fontSize: 16, textShadow: '0 2px 10px rgba(0,0,0,0.8)' }}>Reloading data...</div>
                      </div>
                    )}

                    {isPageRegenerating && (
                      <div style={{
                        position: 'absolute',
                        inset: -8,
                        borderRadius: 24,
                        zIndex: 9999,
                        overflow: 'hidden',
                        pointerEvents: 'none',
                        boxShadow: '0 0 60px rgba(56, 189, 248, 0.45), inset 0 0 35px rgba(56, 189, 248, 0.25)',
                        border: '2px solid rgba(56, 189, 248, 0.65)',
                        background: 'rgba(15, 23, 42, 0.6)',
                        backdropFilter: 'blur(10px)',
                        WebkitBackdropFilter: 'blur(10px)',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        {/* Animated AI Scanning Laser Wave */}
                        <motion.div
                          animate={{
                            top: ['-20%', '120%'],
                          }}
                          transition={{
                            duration: 2,
                            repeat: Infinity,
                            ease: 'easeInOut'
                          }}
                          style={{
                            position: 'absolute',
                            left: 0,
                            right: 0,
                            height: 80,
                            background: 'linear-gradient(180deg, rgba(56, 189, 248, 0) 0%, rgba(56, 189, 248, 0.5) 50%, rgba(56, 189, 248, 0) 100%)',
                            boxShadow: '0 0 40px 10px rgba(56, 189, 248, 0.7)',
                            borderBottom: '2px solid #38bdf8',
                            zIndex: 1
                          }}
                        />

                        {/* Cybernetic Grid Overlay */}
                        <div style={{
                          position: 'absolute',
                          inset: 0,
                          backgroundImage: 'radial-gradient(rgba(56, 189, 248, 0.25) 1px, transparent 1px)',
                          backgroundSize: '24px 24px',
                          opacity: 0.7,
                          zIndex: 2
                        }} />

                        {/* Center Glowing Luxury AI Progress Card */}
                        <motion.div
                          initial={{ scale: 0.85, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          style={{
                            position: 'relative',
                            zIndex: 10,
                            background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.95), rgba(15, 23, 42, 0.98))',
                            border: '1px solid rgba(56, 189, 248, 0.5)',
                            borderRadius: 22,
                            padding: '28px 36px',
                            boxShadow: '0 25px 60px rgba(0, 0, 0, 0.85), 0 0 35px rgba(56, 189, 248, 0.3)',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: 18,
                            maxWidth: 360,
                            width: '85%',
                            textAlign: 'center'
                          }}
                        >
                          {/* Rotating glowing AI ring + Sparkles Icon */}
                          <div style={{ position: 'relative', width: 68, height: 68, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <motion.div
                              animate={{ rotate: 360 }}
                              transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
                              style={{
                                position: 'absolute',
                                inset: 0,
                                borderRadius: '50%',
                                border: '2px dashed #38bdf8',
                                opacity: 0.8
                              }}
                            />
                            <motion.div
                              animate={{ scale: [1, 1.12, 1] }}
                              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                              style={{
                                width: 48,
                                height: 48,
                                borderRadius: '50%',
                                background: 'linear-gradient(135deg, #38bdf8, #3b82f6)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                boxShadow: '0 0 25px rgba(56, 189, 248, 0.9)'
                              }}
                            >
                              <Sparkles className="w-6 h-6 text-white animate-pulse" />
                            </motion.div>
                          </div>

                          <div>
                            <div style={{ color: '#38bdf8', fontWeight: 700, fontSize: 13, letterSpacing: '1.2px', textTransform: 'uppercase', marginBottom: 6 }}>
                              ✨ AI REGENERATING PAGE
                            </div>
                            <div style={{ color: '#F8FAFC', fontWeight: 600, fontSize: 16, lineHeight: '1.4' }}>
                              {currentStepObj ? currentStepObj.step : 'AI is reconstructing page layout...'}
                            </div>
                          </div>

                          {/* Progress Bar */}
                          <div style={{ width: '100%', background: 'rgba(255, 255, 255, 0.12)', borderRadius: 10, height: 6, overflow: 'hidden', position: 'relative' }}>
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${currentStepObj ? currentStepObj.percent : 20}%` }}
                              transition={{ duration: 0.5 }}
                              style={{
                                height: '100%',
                                background: 'linear-gradient(90deg, #38bdf8, #34d399)',
                                borderRadius: 10,
                                boxShadow: '0 0 14px rgba(56, 189, 248, 0.85)'
                              }}
                            />
                          </div>
                        </motion.div>
                      </div>
                    )}

                    <CanvasPageFrame
                      pageId={page.id}
                      pageTitle={page.title || 'Home'}
                      siteName={site?.name || 'My Site'}
                      globalSelectedId={selectedId}
                      onSelectWidget={setSelectedId}
                      activeTool={activeTool}
                      canvasDevice={canvasDevice}
                      isStarred={starredPageIds.includes(page.id)}
                      onToggleStar={() => {
                        setStarredPageIds(prev =>
                          prev.includes(page.id) ? prev.filter(id => id !== page.id) : [...prev, page.id]
                        );
                      }}
                      onEditPageSettings={() => setPageToEdit(page)}
                    />
                  </div>
                </DraggableBoard>
              );
            })}

            {/* ── Floating Notes (e.g. Project Summaries) ── */}
            {floatingNotes.map((note, idx) => (
              <DraggableBoard
                key={note.id}
                initialX={(pages?.length + 1 + floatingImages.length + idx) * PAGE_SPACING}
                initialY={160}
                zoom={zoom}
                activeTool={activeTool}
                requestTopZ={requestTopZ}
                style={{ width: 480 }}
              >
                {/* Title bar */}
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14,
                  fontFamily: site?.settings?.fontFamily || 'Inter, system-ui, sans-serif'
                }}>
                  <div style={{ width: 28, height: 28, borderRadius: '50%', background: '#1E293B', border: '1px solid #334155', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <BookOutlined style={{ fontSize: 14, color: '#fff' }} />
                  </div>
                  <span style={{ fontSize: 14, fontWeight: 600, color: '#fff', letterSpacing: '-0.01em', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 340 }}>
                    {note.title}
                  </span>
                  <button
                    type="button"
                    data-nodrag
                    onClick={() => setFloatingNotes(prev => prev.filter(n => n.id !== note.id))}
                    style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)', color: '#94A3B8', width: 26, height: 26, borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 }}
                    title="Remove from canvas"
                  >
                    <CloseOutlined style={{ fontSize: 11 }} />
                  </button>
                </div>

                {/* Note content */}
                <div
                  className="custom-scrollbar markdown-content"
                  style={{
                    background: '#1A1C1E',
                    borderRadius: 20,
                    border: '1px solid rgba(255,255,255,0.1)',
                    boxShadow: '0 24px 60px rgba(0,0,0,0.6)',
                    padding: 24,
                    maxHeight: '60vh',
                    overflowY: 'auto'
                  }}
                >
                  <ReactMarkdown>
                    {note.content}
                  </ReactMarkdown>
                </div>
              </DraggableBoard>
            ))}

            {/* ── Floating Image Boards (uploaded via Image/Media tool) ── */}
            {floatingImages.map((img, idx) => (
              <DraggableBoard
                key={img.id}
                initialX={(pages?.length + 1 + idx) * PAGE_SPACING}
                initialY={160}
                zoom={zoom}
                activeTool={activeTool}
                requestTopZ={requestTopZ}
                style={{ width: 480 }}
              >
                {/* Title bar */}
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14,
                  fontFamily: site?.settings?.fontFamily || 'Inter, system-ui, sans-serif'
                }}>
                  <div style={{ width: 28, height: 28, borderRadius: '50%', background: '#1E293B', border: '1px solid #334155', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <PictureOutlined style={{ fontSize: 14, color: '#fff' }} />
                  </div>
                  <span style={{ fontSize: 14, fontWeight: 600, color: '#fff', letterSpacing: '-0.01em', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 340 }} title={img.name}>
                    {img.name}
                  </span>
                  <button
                    type="button"
                    data-nodrag
                    onClick={() => setFloatingImages(prev => prev.filter(i => i.id !== img.id))}
                    style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)', color: '#94A3B8', width: 26, height: 26, borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 }}
                    title="Remove from canvas"
                  >
                    <CloseOutlined style={{ fontSize: 11 }} />
                  </button>
                </div>

                {/* Image card */}
                <div style={{ background: '#0F172A', borderRadius: 20, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 24px 60px rgba(0,0,0,0.6)' }}>
                  {/* Image area with optional uploading overlay */}
                  <div style={{ position: 'relative' }}>
                    <img
                      src={img.url}
                      alt={img.name}
                      style={{ width: '100%', display: 'block', maxHeight: 500, objectFit: 'contain', background: '#0F172A' }}
                    />
                    {img.uploading && (
                      <div style={{
                        position: 'absolute', inset: 0,
                        background: 'rgba(15,23,42,0.55)',
                        backdropFilter: 'blur(4px)',
                        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 10
                      }}>
                        <Spin size="large" />
                        <span style={{ color: '#38bdf8', fontSize: 13, fontWeight: 600, letterSpacing: '0.02em' }}>Uploading…</span>
                      </div>
                    )}
                  </div>
                  <div style={{ padding: '14px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                    <span style={{ fontSize: 12, color: 'rgba(148,163,184,0.7)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 300 }}>
                      {img.uploading ? 'Uploading to cloud…' : img.name}
                    </span>
                    <button
                      type="button"
                      data-nodrag
                      disabled={img.uploading}
                      onClick={() => { navigator.clipboard.writeText(img.url); message.success('URL copied!'); }}
                      style={{ background: img.uploading ? 'rgba(56,189,248,0.04)' : 'rgba(56,189,248,0.1)', border: `1px solid ${img.uploading ? 'rgba(56,189,248,0.1)' : 'rgba(56,189,248,0.25)'}`, color: img.uploading ? 'rgba(56,189,248,0.35)' : '#38bdf8', fontSize: 11, fontWeight: 600, padding: '5px 12px', borderRadius: 6, cursor: img.uploading ? 'not-allowed' : 'pointer', whiteSpace: 'nowrap', flexShrink: 0 }}
                    >
                      Copy URL
                    </button>
                  </div>
                </div>
              </DraggableBoard>
            ))}

            {/* ── Marquee / Frame Tool Selection Rectangle ── */}
            {frameSelectBox && (
              <div
                style={{
                  position: 'absolute',
                  left: Math.min(frameSelectBox.startX, frameSelectBox.currentX),
                  top: Math.min(frameSelectBox.startY, frameSelectBox.currentY),
                  width: Math.abs(frameSelectBox.currentX - frameSelectBox.startX),
                  height: Math.abs(frameSelectBox.currentY - frameSelectBox.startY),
                  border: '2px dashed #38bdf8',
                  background: 'rgba(56, 189, 248, 0.18)',
                  boxShadow: '0 0 24px rgba(56, 189, 248, 0.4)',
                  borderRadius: 8,
                  pointerEvents: 'none',
                  zIndex: 9999999
                }}
              />
            )}

            {/* ── Global Drawing Layer (Draw/Pencil Tool P overlay) ── */}
            <svg
              className="canvas-drawing-layer"
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: 10000,
                height: 10000,
                pointerEvents: activeTool === 'draw' ? 'auto' : 'none',
                zIndex: activeTool === 'draw' ? 99999 : 999,
                cursor: isEraserMode ? 'not-allowed' : 'crosshair'
              }}
              onMouseDown={(e) => {
                if (activeTool !== 'draw' || e.button !== 0) return;
                e.stopPropagation();
                const rect = e.currentTarget.getBoundingClientRect();
                const x = (e.clientX - rect.left) / zoom;
                const y = (e.clientY - rect.top) / zoom;
                setCurrentStroke({
                  id: `stroke-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
                  points: [{ x, y }],
                  color: drawColor,
                  width: drawWidth
                });
              }}
              onMouseMove={(e) => {
                if (activeTool !== 'draw' || !currentStroke) return;
                const rect = e.currentTarget.getBoundingClientRect();
                const x = (e.clientX - rect.left) / zoom;
                const y = (e.clientY - rect.top) / zoom;
                setCurrentStroke(prev => prev ? {
                  ...prev,
                  points: [...prev.points, { x, y }]
                } : null);
              }}
              onMouseUp={() => {
                if (!currentStroke) return;
                if (!isEraserMode && currentStroke.points.length >= 1) {
                  const nextDrawings = [...drawings, currentStroke];
                  setDrawings(nextDrawings);
                  saveDrawingsToBackend(nextDrawings);
                }
                setCurrentStroke(null);
              }}
              onMouseLeave={() => {
                if (currentStroke) {
                  if (!isEraserMode && currentStroke.points.length >= 1) {
                    const nextDrawings = [...drawings, currentStroke];
                    setDrawings(nextDrawings);
                    saveDrawingsToBackend(nextDrawings);
                  }
                  setCurrentStroke(null);
                }
              }}
            >
              {drawings.map((stroke) => {
                const pathD = stroke.points.reduce((acc, pt, i) => {
                  return i === 0 ? `M ${pt.x} ${pt.y}` : `${acc} L ${pt.x} ${pt.y}`;
                }, '');
                return (
                  <path
                    key={stroke.id}
                    d={pathD}
                    stroke={stroke.color}
                    strokeWidth={stroke.width}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    fill="none"
                    style={{ cursor: isEraserMode ? 'pointer' : 'default', pointerEvents: (activeTool === 'draw' && isEraserMode) ? 'auto' : 'none' }}
                    onPointerDown={(e) => {
                      if (activeTool === 'draw' && isEraserMode) {
                        e.stopPropagation();
                        const next = drawings.filter(d => d.id !== stroke.id);
                        setDrawings(next);
                        saveDrawingsToBackend(next);
                        message.info('Erased stroke');
                      }
                    }}
                    onPointerEnter={(e) => {
                      if (activeTool === 'draw' && isEraserMode && e.buttons === 1) {
                        e.stopPropagation();
                        const next = drawings.filter(d => d.id !== stroke.id);
                        setDrawings(next);
                        saveDrawingsToBackend(next);
                      }
                    }}
                  />
                );
              })}
              {currentStroke && !isEraserMode && (
                <path
                  d={currentStroke.points.reduce((acc, pt, i) => i === 0 ? `M ${pt.x} ${pt.y}` : `${acc} L ${pt.x} ${pt.y}`, '')}
                  stroke={currentStroke.color}
                  strokeWidth={currentStroke.width}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  fill="none"
                />
              )}
            </svg>
          </div>
        </div>

        <div id="portal-right-sidebar" style={{ display: 'none' }} />

        <div
          className="canvas-right-dock-wrapper"
          style={{
            position: 'absolute',
            right: 20,
            top: '50%',
            transform: 'translateY(-50%)',
            zIndex: 50,
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'flex-start',
            gap: 12
          }}
        >
          {/* ── Floating Draw Toolbar (when Draw active) ── */}
          {activeTool === 'draw' && (
            <motion.div
              initial={{ opacity: 0, x: 15, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 15, scale: 0.95 }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
              style={{
                position: 'relative',
                zIndex: 60,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                padding: '12px 10px',
                gap: 10,
                background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.94), rgba(15, 23, 42, 0.98))',
                borderRadius: 22,
                border: '1px solid rgba(255, 255, 255, 0.16)',
                boxShadow: '0 16px 48px rgba(0,0,0,0.7), 0 0 24px rgba(99, 102, 241, 0.3)',
                backdropFilter: 'blur(24px)',
                WebkitBackdropFilter: 'blur(24px)',
                width: 86
              }}
            >
              {/* Color Palette (2 columns) */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, justifyItems: 'center', width: '100%' }}>
                {['#6366F1', '#EF4444', '#10B981', '#F59E0B', '#38BDF8', '#FFFFFF'].map((col) => (
                  <button
                    key={col}
                    type="button"
                    onClick={() => {
                      setDrawColor(col);
                      setIsEraserMode(false);
                    }}
                    title={`Color: ${col}`}
                    style={{
                      width: 24, height: 24, borderRadius: '50%', border: drawColor === col && !isEraserMode ? '2px solid #fff' : '1px solid rgba(255,255,255,0.2)',
                      background: col, cursor: 'pointer',
                      transform: drawColor === col && !isEraserMode ? 'scale(1.15)' : 'scale(1)',
                      boxShadow: drawColor === col && !isEraserMode ? `0 0 12px ${col}` : 'none',
                      transition: 'all 0.15s'
                    }}
                  />
                ))}
              </div>

              <div style={{ width: '80%', height: 1, background: 'rgba(255, 255, 255, 0.12)' }} />

              {/* Stroke Widths (2 columns) */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, width: '100%' }}>
                {[
                  { width: 2, title: 'Fine (2px)' },
                  { width: 4, title: 'Medium (4px)' },
                  { width: 8, title: 'Thick (8px)' },
                  { width: 14, title: 'Marker (14px)' }
                ].map((w) => (
                  <button
                    key={w.width}
                    type="button"
                    onClick={() => {
                      setDrawWidth(w.width);
                      setIsEraserMode(false);
                    }}
                    title={w.title}
                    style={{
                      height: 26, borderRadius: 6, border: 'none', cursor: 'pointer',
                      background: drawWidth === w.width && !isEraserMode ? 'rgba(255,255,255,0.18)' : 'rgba(255,255,255,0.04)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      transition: 'all 0.15s'
                    }}
                  >
                    <div style={{ width: 20, height: Math.min(w.width, 10), borderRadius: 999, background: drawWidth === w.width && !isEraserMode ? drawColor : '#94A3B8' }} />
                  </button>
                ))}
              </div>

              <div style={{ width: '80%', height: 1, background: 'rgba(255, 255, 255, 0.12)' }} />

              {/* Undo / Clear Actions (side by side) */}
              <div style={{ display: 'flex', gap: 6, width: '100%' }}>
                <button
                  type="button"
                  disabled={drawings.length === 0}
                  onClick={() => {
                    if (drawings.length === 0) return;
                    const next = drawings.slice(0, -1);
                    setDrawings(next);
                    saveDrawingsToBackend(next);
                  }}
                  title="Undo last stroke"
                  style={{
                    flex: 1, height: 32, borderRadius: 10, border: '1px solid rgba(255,255,255,0.12)', cursor: drawings.length === 0 ? 'not-allowed' : 'pointer',
                    background: 'rgba(255,255,255,0.05)', color: drawings.length === 0 ? '#475569' : '#E2E8F0',
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                  }}
                >
                  <UndoOutlined style={{ fontSize: 14 }} />
                </button>
                <button
                  type="button"
                  disabled={drawings.length === 0}
                  onClick={() => setIsClearDrawingsModalOpen(true)}
                  title="Clear all drawings"
                  style={{
                    flex: 1, height: 32, borderRadius: 10, border: '1px solid rgba(239, 68, 68, 0.3)', cursor: drawings.length === 0 ? 'not-allowed' : 'pointer',
                    background: drawings.length === 0 ? 'rgba(239, 68, 68, 0.05)' : 'rgba(239, 68, 68, 0.15)',
                    color: drawings.length === 0 ? '#64748B' : '#EF4444',
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                  }}
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </motion.div>
          )}

          {/* ── Main Right Tool Dock Pill ── */}
          {isOwner && (
            <div
              className="canvas-tools-right-pill"
              style={{
                position: 'relative',
                zIndex: 50,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                padding: '8px 5px',
                gap: 8,
                background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.105), rgba(255, 255, 255, 0.035)), rgba(17, 24, 39, 0.6)',
                borderRadius: 30,
                border: '1px solid rgba(255, 255, 255, 0.12)',
                boxShadow: '0 12px 40px rgba(0,0,0,0.6)',
                backdropFilter: 'blur(24px)',
                WebkitBackdropFilter: 'blur(24px)'
              }}
            >
              {[
                { id: 'select', title: 'Select / Pointer (V)', icon: <ArrowUpOutlined style={{ transform: 'rotate(-45deg)' }} /> },
                { id: 'frame', title: 'Frame / Marquee Tool (F)', icon: <BorderOutlined /> },
                { id: 'draw', title: 'Draw / Pencil Tool (P)', icon: <EditOutlined /> },
                { id: 'pan', title: 'Hand / Pan Tool (H)', icon: <DragOutlined /> },
                { id: 'image', title: 'Image / Media Tool (I)', icon: <PictureOutlined /> },
                { id: 'divider', title: '', icon: null },
                { id: 'palette', title: 'Color Palette / Styles (C)', icon: <BgColorsOutlined /> },
                { id: 'star', title: 'Favorites / Assets (S)', icon: <StarOutlined /> },
                { id: 'tag', title: 'Page Tags (T)', icon: <TagOutlined /> }
              ].map(tool => {
                if (tool.id === 'divider') {
                  return <div key="divider" style={{ width: 18, height: 1, background: 'rgba(255, 255, 255, 0.12)', margin: '2px 0' }} />;
                }
                return (
                  <button
                    key={tool.id}
                    type="button"
                    className="canvas-right-tool-btn"
                    onClick={() => {
                      if (tool.id === 'image') fileInputRef.current?.click();
                      if (tool.id === 'palette') {
                        setIsStylesOpen(!isStylesOpen);
                        setIsDetailsOpen(false);
                        setPageToEdit(null);
                      } else {
                        setIsStylesOpen(false);
                        setIsDetailsOpen(false);
                        setPageToEdit(null);
                      }
                      if (tool.id === 'star') {
                        if (selectedId) {
                          const ids = selectedId.split(',').filter(Boolean);
                          if (ids.length > 0) {
                            const allStarred = ids.every(id => starredPageIds.includes(id));
                            if (allStarred) {
                              setStarredPageIds(prev => prev.filter(id => !ids.includes(id)));
                            } else {
                              setStarredPageIds(prev => Array.from(new Set([...prev, ...ids])));
                            }
                          }
                        }
                      }
                      setActiveTool(tool.id as any);
                    }}
                    style={getToolBtnStyle(tool.id)}
                    title={tool.title}
                  >
                    {activeTool === tool.id && (
                      <motion.div
                        layoutId="activeToolBg"
                        initial={false}
                        transition={{ type: "spring", stiffness: 400, damping: 25 }}
                        style={{ position: 'absolute', inset: 0, background: '#F8FAFC', borderRadius: '50%', zIndex: -1, boxShadow: '0 4px 12px rgba(255, 255, 255, 0.25)' }}
                      />
                    )}
                    {tool.icon && React.cloneElement(tool.icon as React.ReactElement<any>, { style: { ...(tool.icon as React.ReactElement<any>).props.style, position: 'relative', zIndex: 2 } })}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {isOwner && (
          <div className="canvas-prompt-wrapper">
            <AIPromptBar
              compact
              initialPlatform={site?.settings?.platform || 'app'}
              onGenerated={(jobId, subdomain, platform) => {
                onAIGenerated?.(jobId, subdomain, platform);
              }}
              siteId={siteId}
              customInstructions={activePage?.settings?.designPrompt || site?.settings?.designPrompt || site?.settings?.systemPrompt || ((site?.settings as any)?.prompt) || site?.settings?.prompt || site?.description}
              chatModel={site?.settings?.chatModel}
              selectedPages={pages?.filter((p: any) => selectedId?.includes(p.id))}
              selectedPage={(() => {
                const matched = pages?.filter((p: any) => selectedId?.includes(p.id)) || [];
                if (matched.length === 0) return undefined;
                return {
                  id: matched.map((p: any) => p.id).join(','),
                  title: matched.map((p: any) => p.title || 'Page').join(', ')
                };
              })()}
              onRemovePage={(idToRemove) => {
                if (!selectedId) return;
                const nextIds = selectedId.split(',').filter(id => id !== idToRemove);
                setSelectedId(nextIds.length > 0 ? nextIds.join(',') : null);
              }}
              onClearSelection={() => setSelectedId(null)}
              onSelectTheme={(id) => {
                setDetailThemeId(id);
              }}
              themeOverrides={{
                themeId: detailThemeId,
                mode: themeMode,
                radius: themeRadius,
                colors: themeColorOverrides,
                fonts: themeFonts,
                scheme: themeScheme,
                designPrompt: activePage?.settings?.designPrompt || site?.settings?.designPrompt || site?.settings?.systemPrompt || ((site?.settings as any)?.prompt) || site?.description
              }}
            />
          </div>
        )}

        {(() => {
          if (!isDetailsOpen) return null;

          const activePage = getTargetActivePage();
          let pageHeight = 1000;
          let extractedAssets: string[] = [];

          if (activePage && allPagesWidgets) {
            const pageWidgets = allPagesWidgets.filter((w: any) => w._id?.includes(activePage.id) || w.pageId === activePage.id);
            let maxH = 0;

            const extractUrls = (obj: any): string[] => {
              let urls: string[] = [];
              if (!obj) return urls;

              if (typeof obj === 'string') {
                const urlRegex = /(https?:\/\/[^\s"'()[\]{}<>]+)/g;
                const matches = obj.match(urlRegex);
                if (matches) {
                  matches.forEach(m => {
                    if (m.match(/\.(jpeg|jpg|gif|png|svg|webp)/i) || m.includes('unsplash.com') || m.includes('images.') || m.includes('image/upload')) {
                      urls.push(m);
                    }
                  });
                }
              } else if (typeof obj === 'object' && !Array.isArray(obj)) {
                for (const key in obj) {
                  urls = urls.concat(extractUrls(obj[key]));
                }
              } else if (Array.isArray(obj)) {
                obj.forEach(item => {
                  urls = urls.concat(extractUrls(item));
                });
              }
              return urls;
            };

            pageWidgets.forEach((w: any) => {
              const h = w.contentConfig?.geometry?.height || 200;
              const y = w.contentConfig?.geometry?.y || 0;
              if (y + h > maxH) maxH = y + h;

              extractedAssets = extractedAssets.concat(extractUrls(w.contentConfig));
            });
            if (maxH > 0) pageHeight = Math.max(maxH, 900);
          }

          extractedAssets = [...new Set(extractedAssets)].filter(url => typeof url === 'string' && url.startsWith('http'));
          const deviceWidth = activePage && pageDimensions[activePage.id]?.width
            ? pageDimensions[activePage.id].width
            : (canvasDevice === 'mobile' ? 390 : canvasDevice === 'tablet' ? 768 : 1440);
          if (activePage && pageDimensions[activePage.id]?.height) {
            pageHeight = pageDimensions[activePage.id].height;
          } else {
            pageHeight = canvasDevice === 'mobile' ? 844 : canvasDevice === 'tablet' ? 1024 : Math.max(pageHeight, 900);
          }

          return (
            <div style={{
              position: 'absolute',
              top: 80,
              right: 70,
              bottom: 90,
              width: 320,
              background: 'rgba(17, 24, 39, 0.85)',
              backdropFilter: 'blur(24px)',
              WebkitBackdropFilter: 'blur(24px)',
              borderRadius: 16,
              border: '1px solid rgba(255, 255, 255, 0.08)',
              boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
              display: 'flex',
              flexDirection: 'column',
              zIndex: 100,
              color: '#F8FAFC',
              overflow: 'hidden'
            }}>
              <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 14, fontWeight: 600 }}>{site?.name ? `${site.name} - ` : ''}{activePage?.title || 'Home'}</span>
                <button
                  onClick={() => setIsDetailsOpen(false)}
                  style={{ background: 'transparent', border: 'none', color: '#94A3B8', cursor: 'pointer', padding: 4, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  onMouseEnter={e => e.currentTarget.style.color = '#fff'}
                  onMouseLeave={e => e.currentTarget.style.color = '#94A3B8'}
                >
                  <X size={16} />
                </button>
              </div>
              <div style={{ padding: 20, overflowY: 'auto', flex: 1 }} className="custom-scrollbar">
                <div style={{ marginBottom: 24 }}>
                  <div style={{ fontSize: 11, color: '#94A3B8', fontWeight: 600, marginBottom: 12, textTransform: 'uppercase', letterSpacing: 0.5 }}>Properties</div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12, fontSize: 13, alignItems: 'center' }}>
                    <span style={{ color: '#94A3B8' }}>URL Slug</span>
                    <span style={{ background: 'rgba(255, 255, 255, 0.05)', padding: '4px 10px', borderRadius: 6, display: 'flex', alignItems: 'center', gap: 6, fontWeight: 500, border: '1px solid rgba(255,255,255,0.05)' }}>
                      {activePage?.slug || '/'}
                    </span>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16, fontSize: 13, alignItems: 'center' }}>
                    <span style={{ color: '#94A3B8' }}>Device Size</span>
                    <span style={{ fontWeight: 500 }}>{deviceWidth} x {pageHeight}</span>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16, fontSize: 13, alignItems: 'center' }}>
                    <span style={{ color: '#94A3B8' }}>DESIGN.md</span>
                    <span style={{ background: 'rgba(255, 255, 255, 0.05)', padding: '4px 10px', borderRadius: 12, display: 'flex', alignItems: 'center', gap: 6, fontWeight: 500 }}>
                      <div style={{ width: 12, height: 12, borderRadius: '50%', background: themeColorOverrides['primary'] || site?.settings?.primaryColor || '#06B6D4' }} />
                      {site?.name || 'My Project'}
                    </span>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12, fontSize: 13, alignItems: 'center' }}>
                    <span style={{ color: '#94A3B8' }}>Source</span>
                    <span style={{ color: '#38bdf8', cursor: 'pointer', fontWeight: 500 }} onClick={() => setIsCodeModalOpen(true)}>{'</>'} View Code</span>
                  </div>
                </div>

                <div style={{ marginBottom: 24 }}>
                  <div style={{ fontSize: 11, color: '#94A3B8', fontWeight: 600, marginBottom: 12, textTransform: 'uppercase', letterSpacing: 0.5 }}>Design Prompt & System</div>
                  <pre style={{ fontSize: 11, lineHeight: 1.5, color: '#CBD5E1', background: 'rgba(0,0,0,0.2)', padding: 12, borderRadius: 8, border: '1px solid rgba(255,255,255,0.05)', whiteSpace: 'pre-wrap', wordWrap: 'break-word', fontFamily: '"Inter", sans-serif', maxHeight: 300, overflowY: 'auto', margin: 0 }}>
                    {(() => {
                      const activeThemeObj = detailThemeId === 'custom'
                        ? { id: 'custom', name: 'Tùy chỉnh', font: 'Aa', colors: ['#1976D2', '#E65100'], buttonBg: '#1976D2', buttonColor: '#FFFFFF' }
                        : (detailThemeId ? THEMES.find(t => t.id === detailThemeId) : THEMES[0]) || THEMES[0];
                      const rawPrompt = activePage?.settings?.designPrompt || site?.settings?.systemPrompt || ((site?.settings as any)?.prompt) || site?.description || '';
                      return rawPrompt.trim().startsWith('---')
                        ? rawPrompt
                        : generateDesignMd(activeThemeObj, themeColorOverrides, themeFonts, themeMode, themeRadius, rawPrompt);
                    })()}
                  </pre>
                </div>

                <div style={{ marginBottom: 24 }}>
                  <div style={{ fontSize: 11, color: '#94A3B8', fontWeight: 600, marginBottom: 12, textTransform: 'uppercase', letterSpacing: 0.5 }}>Assets ({extractedAssets.length})</div>
                  {extractedAssets.length > 0 ? (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
                      {extractedAssets.map((asset, i) => (
                        <div key={i} style={{ width: '100%', aspectRatio: '1', borderRadius: 6, overflow: 'hidden', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.05)' }}>
                          <img src={asset} alt="Asset" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div style={{ fontSize: 12, color: '#64748B', fontStyle: 'italic', padding: 16, textAlign: 'center', border: '1px dashed rgba(255,255,255,0.1)', borderRadius: 8 }}>
                      No assets extracted yet.
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })()}
        {isStylesOpen && (
          <ThemeEditorPanel
            detailThemeId={detailThemeId}
            setDetailThemeId={setDetailThemeId}
            detailThemeTab={detailThemeTab}
            setDetailThemeTab={setDetailThemeTab}
            themeColorOverrides={themeColorOverrides}
            setThemeColorOverrides={setThemeColorOverrides}
            themeFonts={themeFonts}
            setThemeFonts={setThemeFonts}
            expandedFontRole={expandedFontRole}
            setExpandedFontRole={setExpandedFontRole}
            fontSearch={fontSearch}
            setFontSearch={setFontSearch}
            themeScheme={themeScheme}
            setThemeScheme={setThemeScheme}
            themeMode={themeMode}
            setThemeMode={setThemeMode}
            themeRadius={themeRadius}
            setThemeRadius={setThemeRadius}
            isThemeSchemeOpen={isThemeSchemeOpen}
            setIsThemeSchemeOpen={setIsThemeSchemeOpen}
            handleApplyThemeToSelection={handleApplyThemeToSelection}
            isApplyingTheme={isApplyingTheme}
            selectedId={selectedId}
            setIsStylesOpen={setIsStylesOpen}
          />
        )}

        {isExportOpen && (
          <ExportPanel
            onClose={() => setIsExportOpen(false)}
            onDownloadZip={handleDownload}
            onCopyCode={handleCopyCode}
            onSummarizeProject={handleSummarizeProject}
            pages={pages || []}
            defaultProjectName={site?.name || site?.subdomain || 'Project'}
          />
        )}

        <div
          className="canvas-zoom-floating"
          style={{
            position: 'absolute',
            bottom: 24,
            right: 20,
            zIndex: 50,
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.08), rgba(255, 255, 255, 0.02)), rgba(17, 24, 39, 0.6)',
            padding: '6px 14px',
            borderRadius: 24,
            border: '1px solid rgba(255, 255, 255, 0.1)',
            boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.08), 0 8px 32px rgba(0,0,0,0.5)',
            backdropFilter: 'blur(24px) saturate(140%)',
            WebkitBackdropFilter: 'blur(24px) saturate(140%)'
          }}
        >
          <button
            className="canvas-tool-btn"
            style={{ color: '#fff', opacity: canUndo ? 1 : 0.35, pointerEvents: canUndo ? 'auto' : 'none' }}
            onClick={() => window.dispatchEvent(new CustomEvent('genzite:undo', { detail: { pageId: pages[0]?.id } }))}
            title="Undo Canvas Action"
          >
            <UndoOutlined />
          </button>
          <button
            className="canvas-tool-btn"
            style={{ color: '#fff', opacity: canRedo ? 1 : 0.35, pointerEvents: canRedo ? 'auto' : 'none' }}
            onClick={() => window.dispatchEvent(new CustomEvent('genzite:redo', { detail: { pageId: pages[0]?.id } }))}
            title="Redo Canvas Action"
          >
            <RedoOutlined />
          </button>
          <div className="canvas-divider" style={{ background: 'rgba(255, 255, 255, 0.15)', height: 16, width: 1, margin: '0 4px' }} />
          <button className="canvas-tool-btn" onClick={zoomOut} title="Zoom Out"><ZoomOutOutlined /></button>
          <span className="canvas-zoom-display" style={{ color: '#fff', fontSize: 13, minWidth: 48, textAlign: 'center', fontWeight: 600 }}>{Math.round(zoom * 100)}%</span>
          <button className="canvas-tool-btn" onClick={zoomIn} title="Zoom In"><ZoomInOutlined /></button>
          <div className="canvas-divider" style={{ background: 'rgba(255, 255, 255, 0.15)', height: 16, width: 1, margin: '0 4px' }} />
          <button className="canvas-tool-btn" onClick={resetZoom} title="Fit to Screen"><FullscreenOutlined /></button>
        </div>
      </div>

      {/* Code Viewer Modal */}
      <Modal
        open={isCodeModalOpen}
        onCancel={() => setIsCodeModalOpen(false)}
        footer={null}
        closable={false}
        width={1000}
        centered
        styles={{
          content: {
            background: 'rgba(17, 24, 39, 0.85)',
            backdropFilter: 'blur(24px)',
            WebkitBackdropFilter: 'blur(24px)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: 16,
            padding: 0,
            boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
            overflow: 'hidden'
          },
          mask: {
            backdropFilter: 'blur(4px)',
            background: 'rgba(0, 0, 0, 0.7)',
          }
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}>
          <div style={{ display: 'flex', gap: 8 }}>
            <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#ed6a5e' }} />
            <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#f4bf4f' }} />
            <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#61c554' }} />
          </div>
          <div style={{ color: '#ccc', fontSize: 13, fontFamily: 'var(--font-sans)', fontWeight: 500 }}>{site?.name || 'Project'} - Code View</div>
          <div style={{ display: 'flex', gap: 12 }}>
            <button
              onClick={() => { navigator.clipboard.writeText(getActivePageCode()); message.success('Code copied to clipboard!'); }}
              style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.2)', color: '#ccc', padding: '4px 12px', borderRadius: 4, cursor: 'pointer', fontSize: 12, display: 'flex', alignItems: 'center', gap: 6 }}
            >
              <CopyOutlined /> Copy Code
            </button>
            <button
              onClick={() => setIsCodeModalOpen(false)}
              style={{ background: 'transparent', border: 'none', color: '#ccc', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
            >
              <CloseOutlined />
            </button>
          </div>
        </div>

        <div style={{ padding: 20, maxHeight: '70vh', overflow: 'auto', fontFamily: 'monospace', fontSize: 13, color: '#F8FAFC', lineHeight: 1.6 }} className="custom-scrollbar">
          {getActivePageCode().split('\n').map((line, i) => {
            const highlighted = line
              .replace(/</g, '&lt;')
              .replace(/>/g, '&gt;')
              .replace(/(&lt;\/?)([a-zA-Z0-9\-]+)(.*?)(&gt;)/g, (_match, p1, tag, attrs, p4) => {
                const coloredAttrs = attrs.replace(/([a-zA-Z0-9\-]+)=(&quot;.*?&quot;|'.*?'|".*?")/g,
                  '<span style="color: #9cdcfe;">$1</span>=<span style="color: #ce9178;">$2</span>'
                );
                return `${p1}<span style="color: #569cd6;">${tag}</span>${coloredAttrs}${p4}`;
              });

            return (
              <div key={i} style={{ display: 'flex' }}>
                <span style={{ color: '#858585', minWidth: 40, userSelect: 'none', textAlign: 'right', paddingRight: 16 }}>{i + 1}</span>
                <span style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-all' }} dangerouslySetInnerHTML={{ __html: highlighted || ' ' }} />
              </div>
            );
          })}
        </div>
      </Modal>

      {/* Delete Page Modal - Synchronized with aiLogs UI */}
      <Modal
        open={!!pageToDelete}
        onCancel={() => setPageToDelete(null)}
        footer={null}
        closable={false}
        width={440}
        centered
        styles={{
          content: {
            background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.08), rgba(255, 255, 255, 0.02)), rgba(19, 21, 29, 0.96)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: 20,
            padding: '24px',
            boxShadow: '0 24px 60px rgba(0, 0, 0, 0.75), 0 0 40px rgba(239, 68, 68, 0.12)',
            backdropFilter: 'blur(24px) saturate(140%)',
          },
          mask: {
            backdropFilter: 'blur(6px)',
            background: 'rgba(0, 0, 0, 0.65)',
          }
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 18 }}>
          <div style={{
            width: 44,
            height: 44,
            borderRadius: 12,
            background: 'rgba(239, 68, 68, 0.15)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#EF4444',
            flexShrink: 0
          }}>
            <Trash2 size={22} />
          </div>
          <div>
            <h3 style={{ fontSize: 17, fontWeight: 600, color: '#fff', margin: 0, fontFamily: 'var(--font-sans)' }}>Delete Page</h3>
            <p style={{ fontSize: 12.5, color: '#94A3B8', margin: '4px 0 0 0', fontFamily: 'var(--font-sans)' }}>Confirm removing this page from the project</p>
          </div>
        </div>

        <div style={{
          background: 'rgba(255, 255, 255, 0.025)',
          borderRadius: 12,
          border: '1px solid rgba(255, 255, 255, 0.07)',
          padding: '16px',
          marginBottom: 24,
          display: 'flex',
          flexDirection: 'column',
          gap: 12
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 13, borderBottom: '1px solid rgba(255, 255, 255, 0.06)', paddingBottom: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#CBD5E1' }}>
              <span style={{ color: '#06B6D4' }}>✦</span>
              <span>Page Name:</span>
            </div>
            <span style={{ color: '#fff', fontWeight: 600 }}>{pageToDelete?.title || 'Current Page'}</span>
          </div>

          <div style={{ fontSize: 13, color: '#CBD5E1', lineHeight: 1.6 }}>
            Are you sure you want to delete this page? All components and content within this page will be permanently removed.
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
          <button
            type="button"
            onClick={() => setPageToDelete(null)}
            style={{
              padding: '9px 18px',
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: 8,
              color: '#CBD5E1',
              fontSize: 13,
              fontWeight: 500,
              cursor: 'pointer',
              transition: 'all 0.2s',
              fontFamily: 'var(--font-sans)'
            }}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => {
              if (pageToDelete) {
                deletePageMutation.mutate(pageToDelete.id);
                setPageToDelete(null);
              }
            }}
            style={{
              padding: '9px 20px',
              background: '#EF4444',
              border: '1px solid rgba(239, 68, 68, 0.8)',
              borderRadius: 8,
              color: '#fff',
              fontSize: 13,
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              boxShadow: '0 4px 12px rgba(239, 68, 68, 0.3)',
              transition: 'all 0.2s',
              fontFamily: 'var(--font-sans)'
            }}
          >
            Delete Page
          </button>
        </div>
      </Modal>

      {/* Clear All Drawings Modal - Synchronized with aiLogs UI */}
      <Modal
        open={isClearDrawingsModalOpen}
        onCancel={() => setIsClearDrawingsModalOpen(false)}
        footer={null}
        closable={false}
        width={460}
        centered
        styles={{
          content: {
            background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.08), rgba(255, 255, 255, 0.02)), rgba(19, 21, 29, 0.96)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: 20,
            padding: '24px',
            boxShadow: '0 24px 60px rgba(0, 0, 0, 0.75), 0 0 40px rgba(239, 68, 68, 0.12)',
            backdropFilter: 'blur(24px) saturate(140%)',
          },
          mask: {
            backdropFilter: 'blur(6px)',
            background: 'rgba(0, 0, 0, 0.65)',
          }
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 18 }}>
          <div style={{
            width: 44,
            height: 44,
            borderRadius: 12,
            background: 'rgba(239, 68, 68, 0.15)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#EF4444',
            flexShrink: 0
          }}>
            <Trash2 size={22} />
          </div>
          <div>
            <h3 style={{ fontSize: 17, fontWeight: 600, color: '#fff', margin: 0, fontFamily: 'var(--font-sans)' }}>Clear All Drawings?</h3>
            <p style={{ fontSize: 12.5, color: '#94A3B8', margin: '4px 0 0 0', fontFamily: 'var(--font-sans)' }}>Confirm permanent deletion of all canvas notes</p>
          </div>
        </div>

        <div style={{
          background: 'rgba(255, 255, 255, 0.025)',
          borderRadius: 12,
          border: '1px solid rgba(255, 255, 255, 0.07)',
          padding: '16px',
          marginBottom: 24,
          display: 'flex',
          flexDirection: 'column',
          gap: 12
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 13, borderBottom: '1px solid rgba(255, 255, 255, 0.06)', paddingBottom: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#CBD5E1' }}>
              <span style={{ color: '#06B6D4' }}>✦</span>
              <span>Project Drawings:</span>
            </div>
            <span style={{ color: '#fff', fontWeight: 600 }}>{drawings.length} strokes</span>
          </div>

          <div style={{ fontSize: 13, color: '#CBD5E1', lineHeight: 1.6 }}>
            Are you sure you want to delete these drawings? This will remove all pencil/draw notes on this project canvas.
          </div>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            fontSize: 12,
            color: '#F87171',
            background: 'rgba(239, 68, 68, 0.08)',
            border: '1px solid rgba(239, 68, 68, 0.2)',
            padding: '8px 12px',
            borderRadius: 8
          }}>
            <span style={{ fontSize: 14 }}>⚠️</span>
            <span>This action cannot be undone.</span>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
          <button
            type="button"
            onClick={() => setIsClearDrawingsModalOpen(false)}
            style={{
              padding: '9px 18px',
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: 8,
              color: '#CBD5E1',
              fontSize: 13,
              fontWeight: 500,
              cursor: 'pointer',
              transition: 'all 0.2s',
              fontFamily: 'var(--font-sans)'
            }}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => {
              setDrawings([]);
              saveDrawingsToBackend([]);
              message.success('Cleared all drawings');
              setIsClearDrawingsModalOpen(false);
            }}
            style={{
              padding: '9px 20px',
              background: '#EF4444',
              border: '1px solid rgba(239, 68, 68, 0.8)',
              borderRadius: 8,
              color: '#fff',
              fontSize: 13,
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              boxShadow: '0 4px 12px rgba(239, 68, 68, 0.3)',
              transition: 'all 0.2s',
              fontFamily: 'var(--font-sans)'
            }}
          >
            Clear All
          </button>
        </div>
      </Modal>

      <MediaLibraryModal globalListener={true} />

      {pageToEdit && (
        <div style={{
          position: 'absolute',
          top: '50%',
          transform: 'translateY(-50%)',
          right: 70,
          width: 320,
          background: 'rgba(17, 24, 39, 0.85)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          borderRadius: 16,
          border: '1px solid rgba(255, 255, 255, 0.08)',
          boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
          display: 'flex',
          flexDirection: 'column',
          zIndex: 100,
          color: '#F8FAFC',
          overflow: 'hidden'
        }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 14, fontWeight: 600 }}>Page Settings</span>
            <button
              onClick={() => setPageToEdit(null)}
              style={{ background: 'transparent', border: 'none', color: '#94A3B8', cursor: 'pointer', padding: 4, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              onMouseEnter={e => e.currentTarget.style.color = '#fff'}
              onMouseLeave={e => e.currentTarget.style.color = '#94A3B8'}
            >
              <X size={16} />
            </button>
          </div>
          <div style={{ padding: 20, overflowY: 'auto' }} className="custom-scrollbar">
            <Form
              layout="vertical"
              initialValues={{ title: pageToEdit.title, slug: pageToEdit.slug }}
              onFinish={(values) => {
                const isDuplicate = pages.some((p: any) => p.id !== pageToEdit.id && p.title?.toLowerCase() === values.title?.toLowerCase());
                if (isDuplicate) {
                  message.error('Tag name already exists on another page!');
                  return;
                }
                updatePageMutation.mutate({ id: pageToEdit.id, data: values });
              }}
            >
              <div style={{ marginBottom: 16 }}>
                <span style={{ color: '#94A3B8', display: 'block', marginBottom: 8, fontSize: 14 }}>Select or Enter Tag</span>
                <Form.Item noStyle shouldUpdate={(prev, current) => prev.title !== current.title}>
                  {({ getFieldValue, setFieldsValue }) => {
                    const currentTitle = getFieldValue('title') || '';
                    const ALL_TAGS = Array.from(new Set([
                      'Home', 'About', 'Products', 'Services', 'Contact', 'Blog',
                      ...pages.map((p: any) => p.title).filter(Boolean)
                    ]));
                    const isCustom = !ALL_TAGS.includes(currentTitle);

                    return (
                      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                        {ALL_TAGS.map(tag => {
                          const isSelected = currentTitle === tag;
                          const isUsed = pages.some((p: any) => p.id !== pageToEdit.id && p.title?.toLowerCase() === tag.toLowerCase());
                          return (
                            <div
                              key={tag}
                              onClick={() => {
                                if (!isUsed) {
                                  setFieldsValue({ title: tag, slug: tag === 'Home' ? '/' : '/' + tag.toLowerCase() });
                                }
                              }}
                              style={{
                                padding: '6px 16px',
                                borderRadius: 999,
                                cursor: isUsed ? 'not-allowed' : 'pointer',
                                background: isSelected ? 'rgba(99, 102, 241, 0.2)' : 'rgba(255, 255, 255, 0.05)',
                                border: `1px solid ${isSelected ? 'rgba(99, 102, 241, 0.5)' : 'rgba(255,255,255,0.1)'}`,
                                color: isSelected ? '#818CF8' : isUsed ? '#475569' : '#CBD5E1',
                                fontWeight: isSelected ? 600 : 400,
                                opacity: isUsed ? 0.5 : 1,
                                transition: 'all 0.2s'
                              }}
                            >
                              {tag} {isUsed && <span style={{ fontSize: 10 }}>(Used)</span>}
                            </div>
                          );
                        })}
                        <div
                          onClick={() => {
                            if (!isCustom) {
                              setFieldsValue({ title: 'Custom Page' });
                            }
                          }}
                          style={{
                            padding: '6px 16px',
                            borderRadius: 999,
                            cursor: 'pointer',
                            background: isCustom ? 'rgba(99, 102, 241, 0.2)' : 'rgba(255, 255, 255, 0.05)',
                            border: `1px solid ${isCustom ? 'rgba(99, 102, 241, 0.5)' : 'rgba(255,255,255,0.1)'}`,
                            color: isCustom ? '#818CF8' : '#CBD5E1',
                            fontWeight: isCustom ? 600 : 400,
                            transition: 'all 0.2s'
                          }}
                        >
                          Custom...
                        </div>
                      </div>
                    );
                  }}
                </Form.Item>
              </div>

              <Form.Item noStyle shouldUpdate={(prev, current) => prev.title !== current.title}>
                {({ getFieldValue }) => {
                  const currentTitle = getFieldValue('title') || '';
                  const ALL_TAGS = Array.from(new Set([
                    'Home', 'About', 'Products', 'Services', 'Contact', 'Blog',
                    ...pages.map((p: any) => p.title).filter(Boolean)
                  ]));
                  const isCustom = !ALL_TAGS.includes(currentTitle);

                  return (
                    <div style={{ display: isCustom ? 'block' : 'none' }}>
                      <Form.Item
                        name="title"
                        label={<span style={{ color: '#94A3B8' }}>Custom Tag Name</span>}
                        rules={[
                          { required: isCustom, message: 'Please input custom tag name!' },
                          {
                            validator: async (_, value) => {
                              if (!value) return;
                              const isDuplicate = pages.some((p: any) => p.id !== pageToEdit.id && p.title?.toLowerCase() === value.toLowerCase());
                              if (isDuplicate) {
                                return Promise.reject(new Error('This tag is already used on another page!'));
                              }
                            }
                          }
                        ]}
                      >
                        <Input
                          style={{
                            background: 'rgba(255, 255, 255, 0.05)',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            color: '#fff',
                            borderRadius: 8
                          }}
                          placeholder="e.g. Landing Page"
                        />
                      </Form.Item>
                    </div>
                  );
                }}
              </Form.Item>

              <Form.Item
                name="slug"
                label={<span style={{ color: '#94A3B8' }}>URL Slug</span>}
                rules={[{ required: true, message: 'Please input URL slug!' }]}
                extra={<span style={{ color: '#64748B', fontSize: 12 }}>This will be used for navigation, e.g. /about</span>}
              >
                <Input
                  style={{
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    color: '#fff',
                    borderRadius: 8
                  }}
                  placeholder="e.g. /about"
                />
              </Form.Item>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 24 }}>
                <button
                  type="button"
                  onClick={() => setPageToEdit(null)}
                  style={{
                    padding: '8px 16px',
                    background: 'transparent',
                    border: '1px solid #3F3F46',
                    color: '#fff',
                    borderRadius: 8,
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updatePageMutation.isPending}
                  style={{
                    padding: '8px 16px',
                    background: '#06B6D4',
                    border: 'none',
                    color: '#fff',
                    borderRadius: 8,
                    cursor: 'pointer',
                    fontWeight: 600
                  }}
                >
                  {updatePageMutation.isPending ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </Form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CanvasWorkspace;
