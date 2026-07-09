/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/ban-ts-comment, @typescript-eslint/no-unused-vars, no-empty, react-hooks/exhaustive-deps */
import React, { useEffect, useRef } from 'react';
// @ts-ignore
import grapesjs from 'grapesjs';
import 'grapesjs/dist/css/grapes.min.css';
// @ts-ignore
import webpagePlugin from 'grapesjs-preset-webpage';
import { Spin } from 'antd';
import { CanvaContextMenu } from './CanvaContextMenu';
import { CanvaFloatingToolbar } from './CanvaFloatingToolbar';

export interface GrapesEditorRef {
  getHtml: () => string;
  getCss: () => string;
  setDragMode: (mode: 'absolute' | '') => void;
  getDragMode: () => 'absolute' | '';
}

import { CUSTOM_SECTORS } from './GrapesSectors';
import { registerGenziteBlocks } from './GrapesBlocks';
import { handleGrapesAction } from './GrapesActions';

interface GrapesEditorProps {
  htmlContent: string;
  cssContent?: string;
  readOnly?: boolean;
  onSave?: (html: string, css: string) => void;
  initialDragMode?: 'absolute' | '';
  canvasDevice?: 'mobile' | 'tablet' | 'desktop' | 'full';
}

const GrapesEditor = React.forwardRef<GrapesEditorRef, GrapesEditorProps>(({ htmlContent, cssContent = '', readOnly = false, onSave, initialDragMode = 'absolute', canvasDevice }, ref) => {
  const editorRef = useRef<any>(null);
  const isInitializedRef = useRef(false);
  const onSaveRef = useRef(onSave);
  
  useEffect(() => {
    onSaveRef.current = onSave;
  }, [onSave]);

  useEffect(() => {
    if (editorRef.current && canvasDevice) {
      const editor = editorRef.current;
      if (canvasDevice === 'mobile') editor.setDevice('Mobile');
      else if (canvasDevice === 'tablet') editor.setDevice('Tablet');
      else editor.setDevice('Desktop');
    }
  }, [canvasDevice]);

  const containerRef = useRef<HTMLDivElement>(null);
  const toolbarRef = useRef<HTMLDivElement>(null);
  const [contextMenuState, setContextMenuState] = React.useState<{
    open: boolean;
    x: number;
    y: number;
    model: any | null;
  }>({ open: false, x: 0, y: 0, model: null });
  const [floatingToolbarState, setFloatingToolbarState] = React.useState<{
    open: boolean;
    x: number;
    y: number;
    model: any | null;
    selectionTimestamp: number;
  }>({ open: false, x: 0, y: 0, model: null, selectionTimestamp: 0 });


  const handleAction = (action: import('./CanvaContextMenu').CanvaActionType) => {
    handleGrapesAction(action, editorRef.current, contextMenuState, floatingToolbarState);
  };



  React.useImperativeHandle(ref, () => ({
    getHtml: () => editorRef.current?.getHtml() || '',
    getCss: () => editorRef.current?.getCss() || '',
    setDragMode: (mode: 'absolute' | '') => {
      if (!editorRef.current) return;
      try {
        if (typeof editorRef.current.setDragMode === 'function') {
          editorRef.current.setDragMode(mode);
        } else if (editorRef.current.getModel) {
          editorRef.current.getModel().set('dragMode', mode);
        }
      } catch (e) {
        console.error('Error setting dragMode:', e);
      }
    },
    getDragMode: () => {
      if (!editorRef.current) return '';
      try {
        if (typeof editorRef.current.getDragMode === 'function') {
          return editorRef.current.getDragMode();
        } else if (editorRef.current.getModel) {
          return editorRef.current.getModel().get('dragMode') || '';
        }
      } catch (e) { }
      return '';
    }
  }));

  useEffect(() => {
    if (!containerRef.current || isInitializedRef.current) return;
    isInitializedRef.current = true;

    // Initialize GrapesJS Editor
    const editor = grapesjs.init({
      container: containerRef.current,
      fromElement: false,
      height: '100%',
      width: '100%',
      dragMode: initialDragMode as any, // Enable absolute positioning drag-and-drop
      plugins: [webpagePlugin],
      pluginsOpts: {
        [webpagePlugin as any]: {
          blocks: [] // Disable default preset blocks
        }
      },
      // Tailwind will be loaded via script tag here
      canvas: {
        scripts: ['https://cdn.tailwindcss.com?plugins=forms,container-queries'],
      },
      // @ts-ignore
      allowScripts: 1,
      storageManager: { type: 'none' }, // We'll handle saving manually
      panels: { defaults: [] }, // We hide default panels and build our own
      selectorManager: { appendTo: '#gjs-selectors' },
      styleManager: {
        appendTo: '#gjs-styles',
        sectors: CUSTOM_SECTORS
      },
      colorPicker: {
        appendTo: 'parent',
        palette: [
          ['#0F172A', '#1E293B', '#334155', '#475569', '#64748B', '#94A3B8', '#CBD5E1', '#F8FAFC'],
          ['#38BDF8', '#0284C7', '#0369A1', '#60A5FA', '#2563EB', '#1D4ED8', '#818CF8', '#4F46E5'],
          ['#34D399', '#059669', '#10B981', '#FBBF24', '#D97706', '#F87171', '#DC2626', '#E879F9'],
        ]
      },
      traitManager: { appendTo: '#gjs-traits' },
      layerManager: {
        appendTo: '#gjs-layers',
        sortable: true,   // explicitly enable layer drag-and-drop sorting
        hidable: true,    // enable visibility toggle
      },
      blockManager: { appendTo: '#gjs-blocks' },
      deviceManager: {
        devices: [
          { name: 'Desktop', width: '1440px' },
          { name: 'Tablet', width: '768px', widthMedia: '992px' },
          { name: 'Mobile', width: '390px', widthMedia: '480px' },
        ]
      },
      rte: {
        actions: [] // Completely disable default popup Rich Text Editor buttons (Bold/Italic/Underline/Link/etc.)
      }
    });

    editorRef.current = editor;

    // ── Register all Genzite Blocks immediately after init ────────────────
    // IMPORTANT: Blocks must be registered HERE (not in editor.on('load')) so that
    // GrapesJS has them available when it renders the block panel during init.

    registerGenziteBlocks(editor);
    editor.on('component:selected', (component: any) => {
      window.dispatchEvent(new CustomEvent('genzite:grapes:select', { detail: { component } }));
    });
    editor.on('component:deselected', () => {
      window.dispatchEvent(new CustomEvent('genzite:grapes:select', { detail: { component: null } }));
    });

    // Listen for style changes coming from EditRightPanel
    const styleHandler = (e: any) => {
      const selected = editor.getSelected();
      if (selected && e.detail) {
        selected.addStyle(e.detail);
      }
    };
    window.addEventListener('genzite:grapes:setstyle', styleHandler);

    const attrHandler = (e: any) => {
      const selected = editor.getSelected();
      if (selected && e.detail) {
        const attrs = { ...selected.getAttributes(), ...e.detail };
        selected.setAttributes(attrs);
      }
    };
    window.addEventListener('genzite:grapes:setattr', attrHandler);

    const contentHandler = (e: any) => {
      const selected = editor.getSelected();
      if (selected && e.detail?.content !== undefined) {
        selected.components(e.detail.content);
      }
    };
    window.addEventListener('genzite:grapes:setcontent', contentHandler);

    const undoHandler = () => {
      try {
        editor.UndoManager.undo();
      } catch (e) {
        try { editor.runCommand('core:undo'); } catch (err) { }
      }
    };
    window.addEventListener('genzite:grapes:undo', undoHandler);

    const redoHandler = () => {
      try {
        editor.UndoManager.redo();
      } catch (e) {
        try { editor.runCommand('core:redo'); } catch (err) { }
      }
    };
    window.addEventListener('genzite:grapes:redo', redoHandler);



    let isPanActive = false;
    const panToggleHandler = () => {
      isPanActive = !isPanActive;
      if (isPanActive) {
        editor.runCommand('core:canvas-move');
      } else {
        editor.stopCommand('core:canvas-move');
      }
      window.dispatchEvent(new CustomEvent('genzite:grapes:pan:update', { detail: { active: isPanActive } }));
    };
    window.addEventListener('genzite:grapes:pan:toggle', panToggleHandler);

    // Once editor is ready, load the HTML/CSS content
    editor.on('load', () => {
      // ── "Real Page" Infinite Canvas Setup ────────────────────────────
      const canvasModule = editor.Canvas as any;
      const frameWrapper = canvasModule.getWrapperEl();
      const frame = canvasModule.getFrameEl();

      // Make the main GrapesJS editor wrapper transparent so our outer radial gradient shows through
      const editorEl = editor.getEl();
      if (editorEl) {
        editorEl.style.backgroundColor = 'transparent';
      }
      const cvCanvas = editorEl?.querySelector('.gjs-cv-canvas');
      if (cvCanvas) {
        (cvCanvas as HTMLElement).style.backgroundColor = 'transparent';
      }

      if (frameWrapper && frame) {
        // Style the wrapper to look like a real page floating in the void
        frameWrapper.style.margin = '40px auto';
        frameWrapper.style.boxShadow = '0 25px 50px -12px rgba(0, 0, 0, 0.5)';
        frameWrapper.style.borderRadius = '16px';
        frameWrapper.style.overflow = 'hidden';
        frameWrapper.style.backgroundColor = 'transparent';
        
        // Force width to 100% so it fits our custom EditViewer container sizes
        frameWrapper.style.setProperty('width', '100%', 'important');
        frame.style.setProperty('width', '100%', 'important');

        // We will manage height and overflow dynamically based on canvasDevice prop
        const updateHeight = () => {
          if (!editor.Canvas) return;
          const frame = editor.Canvas.getFrameEl();
          const frameWrapper = (editor.Canvas as any).getWrapperEl();
          const body = editor.Canvas.getBody();
          if (!body || !frame || !frameWrapper) return;

          const isFullHeight = (window as any).__currentCanvasDevice === 'full';

          if (isFullHeight) {
            // Find the maximum bottom coordinate of all direct children
            let maxBottom = window.innerHeight - 80; // Minimum height
            Array.from(body.children).forEach((child: any) => {
              if (child.getBoundingClientRect) {
                const bottom = child.getBoundingClientRect().bottom + window.scrollY;
                if (bottom > maxBottom) maxBottom = bottom;
              }
            });
            const height = Math.max(maxBottom, body.scrollHeight, window.innerHeight - 80);
            frame.style.height = `${height}px`;
            frameWrapper.style.height = `${height}px`;
            if (containerRef.current) {
              containerRef.current.style.height = `${height}px`;
            }
            
            const doc = editor.Canvas.getDocument();
            if (doc?.documentElement) doc.documentElement.style.overflow = 'hidden';
            if (doc?.body) doc.body.style.overflow = 'hidden';
          } else {
            // Revert to 100% height and allow internal scrolling
            frame.style.height = '100%';
            frameWrapper.style.height = '100%';
            if (containerRef.current) {
              containerRef.current.style.height = '100%';
            }
            
            const doc = editor.Canvas.getDocument();
            if (doc?.documentElement) doc.documentElement.style.overflow = 'auto';
            if (doc?.body) doc.body.style.overflow = 'auto';
          }
        };

        // Attach updateHeight to window so it can be called when canvasDevice changes
        (window as any).__updateGrapesIframeHeight = updateHeight;

        // Hide the native scrollbars inside the iframe AND force dark background
        try {
          const doc = editor.Canvas.getDocument();
          if (doc) {
            if (doc.documentElement) {
              doc.documentElement.style.backgroundColor = '#0B0F19';
            }
            if (doc.body) {
              doc.body.style.minHeight = '100%';
              doc.body.style.backgroundColor = '#0B0F19';
              doc.body.style.color = '#ffffff';
              doc.body.style.margin = '0';
              doc.body.style.padding = '0';
            }
            if (doc.head) {
              const forceDarkStyle = doc.createElement('style');
              forceDarkStyle.id = 'gz-force-dark';
              forceDarkStyle.innerHTML = 'html,body{background-color:#0B0F19!important;color:#fff!important;margin:0!important;padding:0!important;}';
              doc.head.appendChild(forceDarkStyle);
            }
          }
        } catch (e) {
          console.error('GrapesEditor DOM Setup Error:', e);
        }

        // Setup observer to keep height in sync
        const observer = new MutationObserver(() => {
          if ((window as any).__currentCanvasDevice === 'full') {
            updateHeight();
          }
        });
        const body = editor.Canvas.getBody();
        if (body) {
          observer.observe(body, { childList: true, subtree: true, attributes: true });
        }

        // Initial height sync
        setTimeout(updateHeight, 100);


      }

      try {
        if (typeof editor.setDragMode === 'function') {
          editor.setDragMode(initialDragMode);
        } else if (editor.getModel) {
          editor.getModel().set('dragMode', initialDragMode);
        }
      } catch (e) { }

      // 1. Parse the full HTML document
      const parser = new DOMParser();
      const doc = parser.parseFromString(htmlContent || '<div></div>', 'text/html');

      // Fix placeholder images that fail to load
      doc.body.querySelectorAll('img').forEach(img => {
        if (img.src.includes('via.placeholder.com') || img.src.includes('placeholder')) {
          img.src = 'https://images.unsplash.com/photo-1618220179428-22790b46a0eb?q=80&w=2000&auto=format&fit=crop';
        }
      });

      // 2. Inject global Genzite theme styles directly into iframe head
      const iframeDoc = editor.Canvas.getDocument();
      if (iframeDoc && iframeDoc.head) {
        const styleEl = iframeDoc.createElement('style');
        styleEl.innerHTML = `
          :root { --color-bg-app: #0B0F19; --color-text-primary: #FFFFFF; --color-text-secondary: #94A3B8; --color-text-muted: #475569; --color-accent: #06B6D4; --color-accent-hover: #0891b2; --color-accent-muted: rgba(6, 182, 212, 0.2); --color-accent-glow: rgba(6, 182, 212, 0.4); --gradient-accent: linear-gradient(135deg, #06B6D4 0%, #10B981 100%); --color-border: #1E293B; --color-border-subtle: rgba(30, 41, 59, 0.5); --gz-dark-1: #0B0F19; --gz-dark-2: #0f172a; --gz-dark-3: #111827; --gz-dark-4: #1E293B; --radius-sm: 8px; --radius-md: 12px; --radius-lg: 16px; --radius-full: 9999px; }
          body { margin: 0; padding: 0; background: var(--color-bg-app) !important; color: var(--color-text-primary) !important; font-family: 'Inter', system-ui, sans-serif; overflow-x: hidden; }
          * { box-sizing: border-box; }
        `;
        iframeDoc.head.appendChild(styleEl);

        // 3. Extract and inject styles & links from head
        doc.head.querySelectorAll('style, link[rel="stylesheet"]').forEach(el => {
          iframeDoc.head.appendChild(el.cloneNode(true));
        });

        // 4. Safely evaluate the tailwind config FIRST
        const configScript = doc.head.querySelector('script#tailwind-config');
        if (configScript && configScript.innerHTML) {
          const scriptEl = iframeDoc.createElement('script');
          scriptEl.innerHTML = configScript.innerHTML;
          iframeDoc.head.appendChild(scriptEl);
        }

        // 5. Now inject the Tailwind CDN script so it picks up the config
        const tailwindCdn = iframeDoc.createElement('script');
        tailwindCdn.src = 'https://cdn.tailwindcss.com?plugins=forms,container-queries';
        iframeDoc.head.appendChild(tailwindCdn);

        // 6. Inject any other custom scripts
        const otherScripts = Array.from(doc.head.querySelectorAll('script:not(#tailwind-config):not([src*="tailwindcss.com"])'));
        otherScripts.forEach(oldScript => {
          const newScript = iframeDoc.createElement('script');
          Array.from(oldScript.attributes).forEach(attr => newScript.setAttribute(attr.name, attr.value));
          if (oldScript.innerHTML) {
            newScript.innerHTML = oldScript.innerHTML;
          }
          iframeDoc.head.appendChild(newScript);
        });
      }

      // 7. Load ONLY the body content into GrapesJS components
      editor.setComponents(doc.body.innerHTML);

      if (cssContent) {
        editor.setStyle(cssContent);
      }

      // Clear undo history so the user can't undo past the initial state
      setTimeout(() => {
        try {
          editor.UndoManager.clear();
        } catch (e) {
          console.error('Error clearing UndoManager:', e);
        }
      }, 100);

      if (readOnly) {
        // Disable selection and editing
        editor.Commands.stop('select-comp');
        const lockStyle = iframeDoc.createElement('style');
        // Allow scroll on body, but block interaction on all elements
        lockStyle.innerHTML = `body * { pointer-events: none !important; }`;
        iframeDoc.head.appendChild(lockStyle);

        // Hide GrapesJS UI elements inside the canvas if any
        const noUiStyle = document.createElement('style');
        noUiStyle.innerHTML = `.gjs-cv-canvas { pointer-events: auto !important; }`;
        document.head.appendChild(noUiStyle);
      }


      // ── Mount panels into sidebar containers ────────────────────────────
      // GrapesJS `appendTo` config only works if the DOM element exists at init time.
      // Since EditRightPanel renders after GrapesEditor in the JSX tree, #gjs-styles
      // and #gjs-traits may not exist yet. We re-mount here after a delay to be safe.
      // We only clear & re-render if the element is empty (no double-mount).
      const mountPanels = () => {
        try {
          const layersEl = document.getElementById('gjs-layers');
          if (layersEl && editor.LayerManager && layersEl.children.length === 0) {
            layersEl.appendChild(editor.LayerManager.render());
          }
          const stylesEl = document.getElementById('gjs-styles');
          if (stylesEl && editor.StyleManager && stylesEl.children.length === 0) {
            stylesEl.appendChild(editor.StyleManager.render());
          }
          const traitsEl = document.getElementById('gjs-traits');
          if (traitsEl && editor.TraitManager && traitsEl.children.length === 0) {
            traitsEl.appendChild(editor.TraitManager.render());
          }
          const blocksEl = document.getElementById('gjs-blocks');
          if (blocksEl && editor.BlockManager && blocksEl.children.length === 0) {
            blocksEl.appendChild(editor.BlockManager.render());
          }
        } catch (e) {
          console.error('GrapesEditor: Panel mount error:', e);
        }
      };
      // Retry at 150ms and 500ms to handle slow React renders
      setTimeout(mountPanels, 150);
      setTimeout(mountPanels, 500);

      // Auto-expand layers and set custom names
      setTimeout(() => {
        try {
          const rootLayer = editor.Layers?.getRoot?.();
          if (rootLayer) {
            rootLayer.set('open', true);
          }

          // Format layer names
          const wrapper = editor.getWrapper();
          if (wrapper) {
            wrapper.onAll((comp: any) => {
              const classes = comp.getClasses();
              const typeName = comp.get('type') === 'default' ? comp.get('tagName') : comp.get('type');
              let name = (typeName || 'div').toString();
              name = name.charAt(0).toUpperCase() + name.slice(1);
              if (classes && classes.length > 0) {
                name += ` .${classes[0]}`;
              } else if (comp.getId()) {
                name += ` #${comp.getId()}`;
              }
              comp.set('name', name);
              comp.set('custom-name', name);
            });
          }
        } catch (e) {
          console.error('GrapesEditor: Layer setup error:', e);
        }
      }, 500);
    });

    // Handle selection for Global Theme toggle
    editor.on('component:selected', () => {
      window.dispatchEvent(new CustomEvent('grapes:selected', { detail: true }));
    });

    // Inject horizontal toolbar CSS directly into document.head and iframe head (highest priority override)
    const injectToolbarCSS = () => {
      const cssContent = `
        /* Hide native drag handles, spacing handles, and empty toolbars */
        .gjs-highlighter-drag,
        .gjs-drag-handle,
        .gjs-spaces,
        .gjs-space-handler,
        .gjs-spacer,
        .gjs-padding-handler,
        .gjs-margin-handler {
          display: none !important;
          opacity: 0 !important;
          pointer-events: none !important;
        }



        /* ── Completely hide native GrapesJS component toolbar ──────────────────────
           We use our custom React CanvaFloatingToolbar for all actions.
           The native toolbar causes double-click deletions: its tlb-delete button
           briefly appears in the DOM when component:selected fires and the second
           click of a dblclick lands on it before updateToolbarPosition can clear it.
        ─────────────────────────────────────────────────────────────────────────── */
        #gjs .gjs-toolbar,
        .gjs-toolbar,
        div.gjs-toolbar,
        .gjs-toolbar-item,
        .gjs-toolbar * {
          display: none !important;
          visibility: hidden !important;
          opacity: 0 !important;
          pointer-events: none !important;
          width: 0 !important;
          height: 0 !important;
          overflow: hidden !important;
        }
      `;

      // Update or create in main document.head
      let existingStyle = document.getElementById('gz-toolbar-override');
      if (existingStyle) {
        existingStyle.innerHTML = cssContent;
      } else {
        const styleEl = document.createElement('style');
        styleEl.id = 'gz-toolbar-override';
        styleEl.innerHTML = cssContent;
        document.head.appendChild(styleEl);
      }

      // Also inject into canvas iframe head if available
      try {
        const iframeDoc = editor?.Canvas?.getDocument();
        if (iframeDoc && iframeDoc.head) {
          let iframeStyle = iframeDoc.getElementById('gz-toolbar-override');
          if (iframeStyle) {
            iframeStyle.innerHTML = cssContent;
          } else {
            const styleEl = iframeDoc.createElement('style');
            styleEl.id = 'gz-toolbar-override';
            styleEl.innerHTML = cssContent;
            iframeDoc.head.appendChild(styleEl);
          }
        }
      } catch (e) { }
    };

    injectToolbarCSS();

    // Smart Positioning & Auto-flip Y/X: prevent toolbar from being cut off at screen edges
    const clampToolbarPosition = () => {
      const toolbarEl = document.querySelector('.gjs-toolbar') as HTMLElement;
      const canvasEl = document.querySelector('.gjs-cv-canvas') as HTMLElement;
      if (toolbarEl && canvasEl) {
        const topVal = parseInt(toolbarEl.style.top || '0', 10);
        const leftVal = parseInt(toolbarEl.style.left || '0', 10);
        const canvasWidth = canvasEl.clientWidth || window.innerWidth;
        const toolbarWidth = toolbarEl.offsetWidth || 280;

        // Auto-flip Y: prevent overflow at top edge (< 12px)
        if (topVal < 12) {
          toolbarEl.style.setProperty('top', '12px', 'important');
          toolbarEl.classList.add('gjs-toolbar-flipped');
        } else {
          toolbarEl.classList.remove('gjs-toolbar-flipped');
        }

        // Auto-flip X: prevent overflow at left/right edges
        if (leftVal < 12) {
          toolbarEl.style.setProperty('left', '12px', 'important');
        } else if (leftVal + toolbarWidth > canvasWidth - 12) {
          toolbarEl.style.setProperty('left', `${Math.max(12, canvasWidth - toolbarWidth - 12)}px`, 'important');
        }
      }
    };

    // Re-apply with MutationObserver in case GrapesJS re-creates toolbar elements
    const toolbarObserver = new MutationObserver(() => {
      injectToolbarCSS();
      clampToolbarPosition();
    });
    toolbarObserver.observe(document.body, { childList: true, subtree: true });

    editor.on('component:deselected', () => {
      // Small timeout to check if another component was selected immediately
      setTimeout(() => {
        if (!editor.getSelected()) {
          window.dispatchEvent(new CustomEvent('grapes:selected', { detail: false }));
        }
      }, 50);
    });

    const FRIENDLY_NAMES: Record<string, string> = {
      wrapper: 'Page Body', text: 'Text', textnode: 'Text',
      image: 'Image', link: 'Link', video: 'Video',
    };
      const TAG_NAMES: Record<string, string> = {
      section: 'Section', header: 'Header', footer: 'Footer',
      nav: 'Navigation', form: 'Form', button: 'Button',
      ul: 'List', ol: 'List', li: 'List Item', table: 'Table',
      tr: 'Row', td: 'Cell', th: 'Header Cell',
      h1: 'Heading 1', h2: 'Heading 2', h3: 'Heading 3', h4: 'Heading 4',
      p: 'Paragraph', span: 'Span', a: 'Link', img: 'Image',
    };

    const getFriendlyName = (model: any): string => {
      const type = model.get('type') || '';
      const tagName = (model.get('tagName') || 'div').toLowerCase();
      return FRIENDLY_NAMES[type] || TAG_NAMES[tagName] || 'Block';
    };

    const getLucideIcon = (model: any): string => {
      const type = (model.get('type') || '').toLowerCase();
      const tagName = (model.get('tagName') || 'div').toLowerCase();
      const name = (model.getName() || '').toLowerCase();
      
      const ICONS = {
         image: '<svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round" style="color: #38BDF8; margin-right: 6px; display: inline-block; vertical-align: middle;"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>',
         text: '<svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round" style="color: #FCD34D; margin-right: 6px; display: inline-block; vertical-align: middle;"><path d="M4 7V4h16v3"/><path d="M9 20h6"/><path d="M12 4v16"/></svg>',
         link: '<svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round" style="color: #A3E635; margin-right: 6px; display: inline-block; vertical-align: middle;"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>',
         navbar: '<svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round" style="color: #F97316; margin-right: 6px; display: inline-block; vertical-align: middle;"><line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="18" y2="18"/></svg>',
         section: '<svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round" style="color: #A78BFA; margin-right: 6px; display: inline-block; vertical-align: middle;"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M3 9h18"/><path d="M9 21V9"/></svg>',
         button: '<svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round" style="color: #60A5FA; margin-right: 6px; display: inline-block; vertical-align: middle;"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><path d="M9 9h6v6H9z"/></svg>',
         div: '<svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round" style="color: #64748B; margin-right: 6px; display: inline-block; vertical-align: middle;"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/></svg>',
         wrapper: '<svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round" style="color: #38BDF8; margin-right: 6px; display: inline-block; vertical-align: middle;"><circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/></svg>'
      };

      if (name.includes('page body') || name.includes('wrapper') || name.includes('thân trang')) return ICONS.wrapper;
      if (type === 'image' || tagName === 'img') return ICONS.image;
      if (type === 'text' || ['p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'span'].includes(tagName)) return ICONS.text;
      if (type === 'link' || tagName === 'a') return ICONS.link;
      if (type === 'navbar' || tagName === 'nav' || tagName === 'header' || name.includes('nav')) return ICONS.navbar;
      if (type === 'button' || tagName === 'button') return ICONS.button;
      if (type === 'section' || name.includes('section')) return ICONS.section;
      
      return ICONS.div;
    };

    const patchComponentName = (model: any) => {
      model.getName = () => getFriendlyName(model);
      model.set('icon', getLucideIcon(model));
      const components = model.components();
      if (components) components.each(patchComponentName);
    };

    // Setup Custom Style Manager Sectors
    const setupCustomStyleManager = () => {
      const sm = editor.StyleManager;
      if (sm && sm.getSectors) {
        sm.getSectors().reset(CUSTOM_SECTORS);
        sm.getSectors().each((sector: any) => sector.set('open', true));
      }
    };



    const enableFreeResizing = (model: any) => {
      if (!model) return;
      const type = (model.get('type') || '').toLowerCase();
      const tagName = (model.get('tagName') || '').toLowerCase();

      const isText = ['text', 'textnode', 'default', 'paragraph', 'heading', 'link', 'button', 'span', 'p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'a', 'label', 'div', 'section', 'header', 'footer', 'nav'].includes(type) ||
        ['p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'span', 'a', 'label', 'button', 'div', 'section', 'header', 'footer', 'nav', 'img'].includes(tagName);

      if (isText || type === 'image') {
        const currentResizable = model.get('resizable') || {};
        const resizerConfig = typeof currentResizable === 'object' ? currentResizable : {};
        model.set('resizable', {
          tl: 1, tc: 1, tr: 1,
          cl: 1, cr: 1,
          bl: 1, bc: 1, br: 1,
          ...resizerConfig,
          keepRatio: false,
          ratioDefault: false,
        });
      }

      const components = model.components();
      if (components) components.each(enableFreeResizing);
    };

    let activeResizeDir = '';
    let initialResizeState: { width: number; height: number; fontSize: number; lineHeight: number } | null = null;

    const handlePointerDown = (e: PointerEvent) => {
      const target = e.target as HTMLElement;
      if (!target || typeof target.className !== 'string') return;
      if (target.className.includes('gjs-resizer-h')) {
        const dirMatch = target.className.match(/gjs-resizer-h-([a-z]{2})/);
        const dir = dirMatch ? dirMatch[1] : (target.getAttribute('data-handler') || '');
        if (['tl', 'tr', 'bl', 'br'].includes(dir)) {
          activeResizeDir = 'corner';
        } else {
          activeResizeDir = 'side';
        }

        const selected = editor.getSelected();
        if (selected) {
          const el = selected.getEl();
          if (el) {
            const computed = window.getComputedStyle(el) || (el.ownerDocument?.defaultView?.getComputedStyle(el));
            const currentFontSize = parseFloat(computed?.fontSize || '16');
            const currentLineHeight = parseFloat(computed?.lineHeight || '24');
            const currentWidth = el.offsetWidth || parseFloat(computed?.width || '100');
            const currentHeight = el.offsetHeight || parseFloat(computed?.height || '50');
            initialResizeState = {
              width: currentWidth,
              height: currentHeight,
              fontSize: currentFontSize,
              lineHeight: isNaN(currentLineHeight) ? currentFontSize * 1.5 : currentLineHeight
            };
          }
        }
      }
    };

    const handlePointerUp = () => {
      activeResizeDir = '';
      initialResizeState = null;
    };

    const handleResizeEvent = (model: any) => {
      if (!model || !initialResizeState || activeResizeDir !== 'corner') return;
      const el = model.getEl();
      if (!el) return;

      const type = (model.get('type') || '').toLowerCase();
      const tagName = (model.get('tagName') || '').toLowerCase();
      const isText = ['text', 'textnode', 'default', 'paragraph', 'heading', 'link', 'button', 'span', 'p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'a', 'label'].includes(type) ||
        ['p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'span', 'a', 'label', 'button'].includes(tagName);

      if (isText) {
        const newWidth = el.offsetWidth || parseFloat(model.getStyle().width || '0');
        if (initialResizeState.width > 0 && newWidth > 0) {
          const scaleRatio = newWidth / initialResizeState.width;
          if (Math.abs(scaleRatio - 1) > 0.01) {
            const newFontSize = Math.max(10, Math.round(initialResizeState.fontSize * scaleRatio));
            const newLineHeight = Math.max(12, Math.round(initialResizeState.lineHeight * scaleRatio));

            model.addStyle({
              'font-size': `${newFontSize}px`,
              'line-height': `${newLineHeight}px`,
            });
          }
        }
      }
    };

    window.addEventListener('pointerdown', handlePointerDown);
    window.addEventListener('pointerup', handlePointerUp);
    editor.on('component:resize', handleResizeEvent);
    editor.on('resizing', handleResizeEvent);

    editor.Commands.add('canva:menu', {
      run: (ed: any) => {
        const selected = ed.getSelected();
        if (!selected) return;
        const el = selected.getEl();
        const iframeEl = ed.Canvas.getFrameEl();
        const iframeRect = iframeEl?.getBoundingClientRect() || { left: 0, top: 0 };
        const rect = el?.getBoundingClientRect() || { left: 100, top: 100 };
        setContextMenuState({
          open: true,
          x: iframeRect.left + rect.left + Math.min(rect.width / 2, 100),
          y: iframeRect.top + Math.max(10, rect.top - 10),
          model: selected
        });
      }
    });

    editor.on('load', () => {
      // Setup floating toolbar positioning
      const updateToolbarPosition = () => {
        const selected = editor.getSelected();
        if (!selected) {
          setFloatingToolbarState(prev => ({ ...prev, open: false, model: null }));
          return;
        }

        // Hide default toolbar to avoid jumping and double toolbars
        try {
          selected.set('toolbar', []);
        } catch (e) { }

        const el = selected.getEl();
        const iframeEl = editor.Canvas.getFrameEl();
        if (!el || !iframeEl) return;

        const iframeRect = iframeEl.getBoundingClientRect();
        const rect = el.getBoundingClientRect();

        const top = iframeRect.top + rect.top;
        const left = iframeRect.left + rect.left;

        // Calculate safe position above the element
        const toolbarHeight = 52;
        const gap = 10;
        let y = top - toolbarHeight - gap;
        if (y < iframeRect.top) {
          // If not enough space above, put it below
          y = top + rect.height + gap;
        }

        if (toolbarRef.current) {
          toolbarRef.current.style.transform = `translate(${left}px, ${y}px)`;
        }

        setFloatingToolbarState(prev => {
          const modelChanged = prev.model !== selected;
          if (modelChanged || !prev.open) {
            return { open: true, x: left, y: y, model: selected, selectionTimestamp: Date.now() };
          }
          // Same model re-selected (e.g. clicking again) — update position but also reset timestamp
          // so the guard in CanvaFloatingToolbar kicks in and prevents double-click from hitting Delete
          return { ...prev, x: left, y: y, selectionTimestamp: Date.now() };
        });
      };

      editor.on('component:selected', updateToolbarPosition);
      editor.on('component:update', updateToolbarPosition);
      editor.on('component:deselected', () => {
        setFloatingToolbarState(prev => ({ ...prev, open: false, model: null }));
      });
      // Handle scrolling within canvas iframe
      const canvasScrollBody = editor.Canvas.getBody();
      if (canvasScrollBody) {
        canvasScrollBody.addEventListener('scroll', updateToolbarPosition, { passive: true });
      }
      window.addEventListener('resize', updateToolbarPosition);



      setupCustomStyleManager();
      patchComponentName(editor.DomComponents.getWrapper());
      enableFreeResizing(editor.DomComponents.getWrapper());
      // Give LayerManager time to render before injecting icons


      // ── Lock: intercept GrapesJS drag command to block drag of locked elements ──
      editor.on('run:core:component-drag', () => {
        const sel = editor.getSelected();
        if (sel && sel.get('locked')) {
          editor.stopCommand('core:component-drag');
        }
      });
      // Fallback for mousedown interception just in case
      const canvasBody = editor.Canvas.getBody();
      const lockMouseDownHandler = (e: MouseEvent) => {
        let el = e.target as HTMLElement | null;
        while (el) {
          if (el.getAttribute && el.getAttribute('data-gz-locked') === 'true') {
            e.stopPropagation();
            return;
          }
          el = el.parentElement;
        }
      };
      if (canvasBody) {
        canvasBody.addEventListener('mousedown', lockMouseDownHandler, { capture: true });
      }
      (editor as any)._lockMouseDownHandler = lockMouseDownHandler;

      const doc = editor.Canvas.getDocument();
      if (doc) {


        doc.addEventListener('contextmenu', (e: MouseEvent) => {
          e.preventDefault();
          const iframeEl = editor.Canvas.getFrameEl();
          const iframeRect = iframeEl?.getBoundingClientRect() || { left: 0, top: 0 };
          const clientX = iframeRect.left + e.clientX;
          const clientY = iframeRect.top + e.clientY;

          const targetEl = e.target as HTMLElement;
          const findComponentByEl = (model: any, el: HTMLElement): any => {
            if (!model || !el) return null;
            if (model.getEl() === el || model.getEl()?.contains(el)) {
              const children = model.components();
              if (children) {
                let foundChild: any = null;
                children.each((child: any) => {
                  if (!foundChild) {
                    const res = findComponentByEl(child, el);
                    if (res) foundChild = res;
                  }
                });
                if (foundChild) return foundChild;
              }
              return model;
            }
            return null;
          };
          const comp = findComponentByEl(editor.DomComponents.getWrapper(), targetEl) || editor.getSelected();
          if (comp) {
            editor.select(comp);
            setContextMenuState({ open: true, x: clientX, y: clientY, model: comp });
          } else if (editor.getSelected()) {
            setContextMenuState({ open: true, x: clientX, y: clientY, model: editor.getSelected() });
          }
        });
      }
    });

    editor.on('component:add', (model: any) => {
      enableFreeResizing(model);
      setTimeout(() => { patchComponentName(model); }, 30);
    });

    editor.on('component:selected', (model: any) => {
      enableFreeResizing(model);
      // Always clear native GrapesJS toolbar immediately.
      // We use our custom React floating toolbar for all actions.
      // Keeping native toolbar items causes double-click deletions because the second
      // click of a dblclick lands on the native tlb-delete button before it can be cleared.
      try { model.set('toolbar', []); } catch (_) { }
      setTimeout(clampToolbarPosition, 10);
    });

    editor.on('canvas:scroll component:update', () => {
      setTimeout(clampToolbarPosition, 10);
    });

    editor.on('update', () => {
      if (onSaveRef.current) {
        onSaveRef.current(editor.getHtml(), editor.getCss() || '');
      }
    });

    return () => {
      window.removeEventListener('genzite:grapes:setstyle', styleHandler);
      window.removeEventListener('genzite:grapes:setattr', attrHandler);
      window.removeEventListener('genzite:grapes:setcontent', contentHandler);
      window.removeEventListener('genzite:grapes:undo', undoHandler);
      window.removeEventListener('genzite:grapes:redo', redoHandler);

      window.removeEventListener('genzite:grapes:pan:toggle', panToggleHandler);
      window.removeEventListener('pointerdown', handlePointerDown);
      window.removeEventListener('pointerup', handlePointerUp);

      toolbarObserver?.disconnect();
      document.getElementById('gz-toolbar-override')?.remove();
      isInitializedRef.current = false;
      editor.destroy();
    };
  }, []);

  // Reload content when htmlContent/cssContent props change (e.g., after data is fetched from API)
  useEffect(() => {
    const editor = editorRef.current;
    if (!editor || !htmlContent) return;
    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(htmlContent, 'text/html');
      // Re-inject dark background on body
      const iframeDoc = editor.Canvas.getDocument();
      if (iframeDoc) {
        if (iframeDoc.body) {
          iframeDoc.body.style.backgroundColor = '#0B0F19';
          iframeDoc.body.style.color = '#ffffff';
        }
        if (iframeDoc.documentElement) {
          iframeDoc.documentElement.style.backgroundColor = '#0B0F19';
        }
        if (iframeDoc.head) {
          // Remove old force-dark if exists, re-add at end (highest specificity)
          const old = iframeDoc.getElementById('gz-force-dark');
          if (old) old.remove();
          const forceDarkStyle = iframeDoc.createElement('style');
          forceDarkStyle.id = 'gz-force-dark';
          forceDarkStyle.innerHTML = 'html,body{background-color:#0B0F19!important;color:#fff!important;margin:0!important;padding:0!important;}';
          iframeDoc.head.appendChild(forceDarkStyle);
        }
      }
      editor.setComponents(doc.body.innerHTML);
      if (cssContent) {
        editor.setStyle(cssContent);
      }
    } catch (e) {
      console.error('GrapesEditor: Failed to reload content:', e);
    }
  }, [htmlContent, cssContent]);

  return (
    <>
      <link rel="stylesheet" href="https://fonts.googleapis.com/icon?family=Material+Icons+Round" />
      <style>
        {`
          @import url('https://fonts.googleapis.com/icon?family=Material+Icons+Round');
          /* Hide all built-in GrapesJS panels (top bar, right sidebar, devices, commands) */
          .gjs-pn-panels, .gjs-pn-panel, .gjs-pn-devices-c, .gjs-pn-devices, .gjs-pn-commands, .gjs-pn-views, .gjs-pn-buttons { display: none !important; }
          /* Fix Canvas background to fill the Rnd container perfectly & Canva Artboard style */
          .gjs-cv-canvas { background: transparent !important; height: 100% !important; width: 100% !important; }
          .gjs-frame { margin: 0 !important; display: block; border-radius: 4px !important; border: none !important; width: 100% !important; height: 100% !important; box-shadow: 0 16px 40px -8px rgba(0,0,0,0.5) !important; }
          .gjs-frame-wrapper { display: block !important; padding: 0 !important; overflow: hidden !important; }
          .gjs-editor { background: transparent !important; }

          /* ========================================================
             CANVA-STYLE ON-PAGE DIRECT MANIPULATION & SELECTION SUITE
             ======================================================== */
          /* 1. Selection Box & Hover Highlighter (Canva Accent var(--color-accent) & Indigo #6366F1) */
          .gjs-highlighter { outline: 2px dashed rgba(6, 182, 212, 0.6) !important; outline-offset: -2px !important; }
          .gjs-selected { 
            outline: 2px solid var(--color-accent) !important; 
            outline-offset: -2px !important; 
            box-shadow: 0 0 0 4px rgba(6, 182, 212, 0.18) !important;
          }

          /* 2. Resize Handles (Canva White Pills/Circles with Accent Border) */
          .gjs-resizer-h {
            border: 2px solid var(--color-accent) !important;
            background-color: #ffffff !important;
            border-radius: 50% !important;
            width: 12px !important;
            height: 12px !important;
            box-shadow: 0 2px 6px rgba(0,0,0,0.25) !important;
            transition: transform 0.15s cubic-bezier(0.16, 1, 0.3, 1), background-color 0.15s ease !important;
            z-index: 50 !important;
          }
          .gjs-resizer-h:hover {
            transform: scale(1.35) !important;
            background-color: var(--color-accent) !important;
            border-color: #ffffff !important;
          }
          .gjs-resizer-h.gjs-resizer-hc { border-radius: 6px !important; } /* Edge pill handles */

          /* 3. Hide Native Drag Pill on Hover and Spacing Handlers */
          .gjs-highlighter-drag,
          .gjs-drag-handle,
          .gjs-spaces,
          .gjs-space-handler,
          .gjs-spacer,
          .gjs-padding-handler,
          .gjs-margin-handler {
            display: none !important;
            opacity: 0 !important;
            pointer-events: none !important;
          }

          /* 4. Smart Guides & Snapping Lines (Vibrant Accent Glow) */
          .gjs-bv-placeholder, .gjs-bv-placeholder-int, .gjs-highlighter-sel {
            background-color: var(--color-accent) !important;
            box-shadow: 0 0 10px var(--color-accent), 0 0 4px var(--color-accent) !important;
          }

          /* Custom Sidebar styling for Portals */
          .custom-sidebar { background: #0f172a; color: #fff; display: flex; flex-direction: column; }
          .sidebar-header { padding: 16px; font-weight: 600; font-size: 13px; border-bottom: 1px solid #1E293B; background: #0B0F19; text-transform: uppercase; letter-spacing: 1px; color: #94A3B8; position: sticky; top: 0; z-index: 10; }
          
          /* Blocks Panel Fixes: Force all internal wrappers to be transparent */
          #gjs-blocks .gjs-one-bg, #gjs-blocks .gjs-two-bg, #gjs-blocks .gjs-three-bg, #gjs-blocks .gjs-four-bg { background-color: transparent !important; background: transparent !important; }
          #gjs-blocks, #gjs-blocks > div, .gjs-blocks-cs, .gjs-block-categories, .gjs-block-category { background-color: transparent !important; background: transparent !important; border: none !important; box-shadow: none !important; margin: 0 !important; width: 100%; padding: 0 !important; }
          .gjs-block-category .gjs-title { 
            display: block !important; 
            background-color: transparent !important; 
            color: #94A3B8 !important; 
            font-weight: 600; 
            padding: 20px 4px 12px 4px !important; 
            border: none !important; 
            margin-bottom: 8px; 
            font-size: 11px !important; 
            text-transform: uppercase; 
            letter-spacing: 1px; 
            cursor: pointer;
            transition: color 0.2s;
            border-bottom: 1px solid rgba(255,255,255,0.05) !important;
          }
          .gjs-block-category .gjs-title { position: relative; }
          .gjs-block-category .gjs-title::after { content: '▼'; position: absolute; right: 10px; top: 50%; transform: translateY(-50%); font-size: 9px; transition: transform 0.2s; color: #64748B; }
          .gjs-block-category:not(.gjs-open) .gjs-title::after { transform: translateY(-50%) rotate(-90deg); }
          .gjs-block-category .gjs-title:hover { color: #fff !important; }
          .gjs-blocks-c { background-color: transparent !important; background: transparent !important; padding: 0 !important; flex-direction: column !important; gap: 12px; border: none !important; margin-bottom: 24px !important; display: none !important; }
          .gjs-block-category.gjs-open .gjs-blocks-c { display: flex !important; }
          .gjs-block { background: #0B0F19 !important; border: 1px solid rgba(255,255,255,0.03) !important; border-radius: 12px !important; color: #94A3B8 !important; padding: 12px 16px !important; transition: all 0.2s !important; box-shadow: none !important; width: 100% !important; margin: 0 !important; min-height: 72px; display: flex !important; flex-direction: row !important; align-items: center; justify-content: flex-start; cursor: grab; }
          .gjs-block:hover { background: #131B2C !important; border-color: rgba(255,255,255,0.1) !important; color: #fff !important; transform: translateY(-2px); box-shadow: 0 4px 12px rgba(0,0,0,0.2) !important; }
          .gjs-block::after { content: '+'; margin-left: auto; font-size: 20px; color: #64748B; font-weight: 300; padding-left: 12px; transition: color 0.2s; }
          .gjs-block:hover::after { color: #fff; }
          .gjs-block > svg { display: none !important; } /* Hide generic GrapesJS block icon */
          .gjs-block-label { width: 100%; display: flex; align-items: center; margin: 0 !important; font-size: 13px !important; }
          
          /* Custom Genzite Block Layout */
          .gz-block-item { display: flex; align-items: center; width: 100%; text-align: left; gap: 14px; }
          .gz-block-icon { width: 42px; height: 42px; background: rgba(255,255,255,0.03); border-radius: 10px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; transition: background 0.2s; }
          .gjs-block:hover .gz-block-icon { background: rgba(255,255,255,0.08); }
          .gz-block-icon svg { width: 22px; height: 22px; fill: currentColor; }
          .gz-block-info { display: flex; flex-direction: column; gap: 4px; overflow: hidden; }
          .gz-block-title { font-size: 13px; font-weight: 600; color: #F8FAFC; transition: color 0.2s; }
          .gz-block-desc { font-size: 11px; color: #64748B; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
          
          /* Force GrapesJS UI in sidebars to match dark theme */
          #gjs-styles .gjs-one-bg, #gjs-styles .gjs-two-bg, #gjs-styles .gjs-three-bg, #gjs-styles .gjs-four-bg,
          #gjs-traits .gjs-one-bg, #gjs-traits .gjs-two-bg, #gjs-traits .gjs-three-bg, #gjs-traits .gjs-four-bg {
            background: transparent !important; background-color: transparent !important;
          }
          .gjs-sm-sector { 
            margin-bottom: 0 !important; 
            border: none !important;
            border-bottom: 1px solid rgba(255,255,255,0.05) !important;
            border-radius: 0 !important; 
            background: transparent !important; 
          }
          .gjs-sm-sector .gjs-sm-title { 
            position: relative;
            background-color: transparent !important; 
            border: none !important; 
            color: #F8FAFC !important; 
            padding: 14px 12px !important; 
            font-weight: 500; 
            font-size: 12px !important;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            transition: background 0.2s;
            cursor: pointer;
          }
          .gjs-sm-sector .gjs-sm-title::after { 
            content: '▼'; 
            position: absolute; 
            right: 14px; 
            top: 50%; 
            transform: translateY(-50%); 
            font-size: 9px; 
            transition: transform 0.2s; 
            color: #64748B; 
          }
          .gjs-sm-sector:not(.gjs-sm-open) .gjs-sm-title::after { 
            transform: translateY(-50%) rotate(-90deg); 
          }
          .gjs-sm-sector .gjs-sm-title:hover {
            background-color: rgba(255,255,255,0.03) !important;
          }
          .gjs-sm-property { 
            background-color: transparent !important; 
            border-bottom: none !important; 
            padding: 6px 0 !important; 
          }
          .gjs-sm-properties { 
            padding: 8px 12px 16px 12px !important; 
            background: rgba(0,0,0,0.15) !important;
          }
          
          /* Layers Panel - Figma Style */
          /* 1. Kill all GrapesJS zebra-stripe backgrounds */
          #gjs-layers, #gjs-layers .gjs-one-bg, #gjs-layers .gjs-two-bg,
          #gjs-layers .gjs-three-bg, #gjs-layers .gjs-four-bg,
          #gjs-layers .gjs-layer, #gjs-layers .gjs-layers {
            background: transparent !important; background-color: transparent !important;
          }
          #gjs-layers { padding: 4px 8px; }
          .gjs-layer { border-bottom: none !important; margin-bottom: 1px !important; }
          /* 2. Layer row */
          .gjs-layer-title {
            color: #CBD5E1 !important; background: transparent !important;
            border: none !important; border-radius: 4px;
            transition: background 0.12s; padding: 4px 8px !important;
            display: flex; align-items: center; font-size: 12px !important;
            font-weight: 400; min-height: 30px; gap: 4px;
          }
          #gjs-layers .gjs-layer-title:hover { background: rgba(255,255,255,0.055) !important; }
          #gjs-layers .gjs-layer-active > .gjs-layer-title {
            background: rgba(14,165,233,0.14) !important; color: #38BDF8 !important;
          }
          #gjs-layers .gjs-layer-active > .gjs-layer-title .gjs-layer-name { color: #38BDF8 !important; font-weight: 500; }
          .gjs-layer-title-inn { display: flex; align-items: center; gap: 5px; flex: 1; overflow: hidden; }
          .gjs-layer-name { font-size: 12px !important; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
          /* 3. Caret — keep clickable */
          .gjs-layer-caret { opacity: 0.3; cursor: pointer !important; transition: opacity 0.15s; margin-right: 2px !important; flex-shrink: 0; }
          .gjs-layer-title:hover .gjs-layer-caret { opacity: 1; }
          /* 4. Drag handle (≡) — show on hover with grab cursor */
          .gjs-layer-move {
            opacity: 0; cursor: grab !important;
            transition: opacity 0.15s;
            flex-shrink: 0; padding: 0 3px;
            display: flex; align-items: center;
            color: #64748B; font-size: 12px;
          }
          .gjs-layer-title:hover .gjs-layer-move { opacity: 0.6; color: #94A3B8; }
          .gjs-layer-move:hover { opacity: 1 !important; color: #38BDF8 !important; }
          .gjs-layer-move:active { cursor: grabbing !important; }
          /* Drag-over drop-zone indicator */
          .gjs-layer.gjs-drag-active > .gjs-layer-title {
            outline: 2px dashed rgba(56,189,248,0.6) !important;
            border-radius: 4px;
          }
          /* 5. Count badge hidden */
          .gjs-layer-count { display: none !important; }
          /* 6. Visibility eye */
          .gjs-layer-vis { opacity: 0; transition: opacity 0.15s; margin-left: auto; cursor: pointer; padding: 3px; flex-shrink: 0; }
          .gjs-layer-title:hover .gjs-layer-vis { opacity: 0.55; }
          .gjs-layer-vis:hover { opacity: 1 !important; color: #fff !important; }
          /* 7. Tree line */
          .gjs-layer-children { border-left: 1px solid rgba(255,255,255,0.06); margin-left: 14px; padding-left: 0; }
          
          /* Properties / Traits Panel Fixes */
          .gjs-trt-traits { background: transparent !important; padding: 12px 12px 0 12px !important; }
          .gjs-trt-trait { background-color: rgba(0,0,0,0.2) !important; border: 1px solid rgba(255,255,255,0.03) !important; border-radius: 8px; margin-bottom: 8px; padding: 12px !important; }
          .gjs-trt-header { color: #E2E8F0 !important; font-weight: 500; margin-bottom: 8px !important; font-size: 13px !important; }
          
          /* Form Elements (Inputs, Selects, etc) */
          .gjs-field { 
            background-color: #0B0F19 !important; 
            border: 1px solid #1E293B !important; 
            border-radius: 6px !important; 
            color: #E2E8F0 !important; 
            box-shadow: inset 0 1px 2px rgba(0,0,0,0.1) !important; 
            transition: all 0.2s ease; 
          }
          .gjs-field:focus-within { 
            border-color: #38BDF8 !important; 
            box-shadow: 0 0 0 2px rgba(56,189,248,0.2) !important; 
          }
          .gjs-field input, .gjs-field select { 
            color: #E2E8F0 !important; 
            padding: 6px 8px !important; 
            font-size: 12px !important; 
            background: transparent !important;
          }
          .gjs-field-colorp { background-color: transparent !important; border: none !important; padding: 0 !important; box-shadow: none !important; }
          .gjs-field-colorp-c { width: 22px !important; height: 22px !important; border: 1px solid rgba(255,255,255,0.2) !important; border-radius: 50% !important; margin-right: 8px !important; }
          
          /* Radio Buttons (Alignment, Display type, etc) */
          .gjs-radio-item { 
            background: #0f172a !important; 
            border: 1px solid #1E293B !important; 
            color: #64748B !important; 
            transition: all 0.2s;
          }
          .gjs-radio-item:hover { color: #94A3B8 !important; }
          .gjs-radio-item-active { 
            background: #38BDF8 !important; 
            color: #0f172a !important; 
            border-color: #38BDF8 !important; 
          }
          .gjs-sm-label { 
            color: #94A3B8 !important; 
            font-size: 11px !important; 
            padding-bottom: 6px !important; 
            font-weight: 500; 
            text-transform: uppercase;
            letter-spacing: 0.3px;
          }
          

        `}
      </style>

      {!htmlContent && (
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', zIndex: 10 }}>
          <Spin size="large" tip="Loading Visual Editor..." />
        </div>
      )}

      <div ref={containerRef} style={{ position: 'relative', width: '100%', height: '100%' }} />

      <CanvaContextMenu
        open={contextMenuState.open}
        x={contextMenuState.x}
        y={contextMenuState.y}
        isLocked={contextMenuState.model?.get('locked') === true}
        onClose={() => setContextMenuState(prev => ({ ...prev, open: false }))}
        onAction={handleAction}
      />

      {floatingToolbarState.open && floatingToolbarState.model && (
        <div
          ref={toolbarRef}
          className="canvas-floating-toolbar"
          style={{
            position: 'fixed',
            left: 0,
            top: 0,
            transform: `translate(${floatingToolbarState.x}px, ${floatingToolbarState.y}px)`,
            zIndex: 1000,
            pointerEvents: 'auto',
          }}
        >
          <CanvaFloatingToolbar
            widgetId={floatingToolbarState.model.getId()}
            label={floatingToolbarState.model.getName() || floatingToolbarState.model.get('tagName')}
            isLocked={floatingToolbarState.model.get('locked') === true}
            selectionTimestamp={floatingToolbarState.selectionTimestamp}
            onAction={handleAction}
            onOpenMenu={(e) => {
              setContextMenuState({
                open: true,
                x: e.clientX,
                y: e.clientY,
                model: floatingToolbarState.model,
              });
            }}
            onPointerDownMove={() => {
              // Emulate dragging in GrapesJS by triggering Select & Drag
              try {
                editorRef.current.runCommand('core:component-drag');
              } catch (e) {
                console.error(e);
              }
            }}
          />
        </div>
      )}
    </>
  );
});

export default GrapesEditor;
