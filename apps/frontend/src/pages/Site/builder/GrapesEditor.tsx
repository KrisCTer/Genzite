import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
// @ts-ignore
import grapesjs from 'grapesjs';
import 'grapesjs/dist/css/grapes.min.css';
// @ts-ignore
import webpagePlugin from 'grapesjs-preset-webpage';
import { Spin } from 'antd';


interface GrapesEditorProps {
  htmlContent: string;
  cssContent?: string;
  readOnly?: boolean;
  onSave?: (html: string, css: string) => void;
}

const GrapesEditor: React.FC<GrapesEditorProps> = ({ htmlContent, cssContent = '', readOnly = false, onSave }) => {
  const editorRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (!containerRef.current) return;

    // Initialize GrapesJS Editor
    const editor = grapesjs.init({
      container: containerRef.current,
      fromElement: false,
      height: '100%',
      width: '100%',
      plugins: [webpagePlugin],
      pluginsOpts: {
        [webpagePlugin as any]: {}
      },
      // Remove Tailwind from here to control load order manually
      canvas: {
        scripts: [],
      },
      // @ts-ignore
      allowScripts: 1,
      storageManager: { type: 'none' }, // We'll handle saving manually
      panels: { defaults: [] }, // We hide default panels and build our own
      selectorManager: { appendTo: '#gjs-selectors' },
      styleManager: { appendTo: '#gjs-styles' },
      traitManager: { appendTo: '#gjs-traits' },
      layerManager: { appendTo: '#gjs-layers' },
      blockManager: { appendTo: '#gjs-blocks' },
      deviceManager: {
        devices: [
          { name: 'Desktop', width: '' },
          { name: 'Tablet', width: '768px', widthMedia: '992px' },
          { name: 'Mobile portrait', width: '320px', widthMedia: '480px' },
        ]
      }
    });

    editorRef.current = editor;

    // Once editor is ready, load the HTML/CSS content
    editor.on('load', () => {
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
      const styleEl = iframeDoc.createElement('style');
      styleEl.innerHTML = `
        :root { --color-bg-app: #0B0F19; --color-text-primary: #FFFFFF; --color-text-secondary: #94A3B8; --color-text-muted: #475569; --color-accent: #06B6D4; --color-accent-hover: #0891b2; --color-accent-muted: rgba(6, 182, 212, 0.2); --color-accent-glow: rgba(6, 182, 212, 0.4); --gradient-accent: linear-gradient(135deg, #06B6D4 0%, #10B981 100%); --color-border: #1E293B; --color-border-subtle: rgba(30, 41, 59, 0.5); --gz-dark-1: #0B0F19; --gz-dark-2: #0f172a; --gz-dark-3: #111827; --gz-dark-4: #1E293B; --radius-sm: 8px; --radius-md: 12px; --radius-lg: 16px; --radius-full: 9999px; }
        body { margin: 0; padding: 0; background: var(--color-bg-app); color: var(--color-text-primary); font-family: 'Inter', system-ui, sans-serif; overflow-x: hidden; }
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

      // 7. Load ONLY the body content into GrapesJS components
      editor.setComponents(doc.body.innerHTML);
      
      if (cssContent) {
        editor.setStyle(cssContent);
      }

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

      // Mount panels manually to our custom sidebars
      const layersEl = document.getElementById('gjs-layers');
      if (layersEl) {
        layersEl.innerHTML = '';
        layersEl.appendChild(editor.LayerManager.render());
      }
      
      const stylesEl = document.getElementById('gjs-styles');
      if (stylesEl) {
        stylesEl.innerHTML = '';
        stylesEl.appendChild(editor.StyleManager.render());
      }

      const traitsEl = document.getElementById('gjs-traits');
      if (traitsEl) {
        traitsEl.innerHTML = '';
        traitsEl.appendChild(editor.TraitManager.render());
      }
      // Auto-expand layers and set custom names
      setTimeout(() => {
        const rootLayer = editor.Layers.getRoot();
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
            comp.set('custom-name', name);
          });
        }
      }, 500);

      // Measure content height and emit for Full Height mode
      const emitHeight = () => {
        try {
          const body = editor.Canvas.getBody();
          if (body) {
            window.dispatchEvent(new CustomEvent('grapes:content:height', { detail: body.scrollHeight + 100 }));
          }
        } catch (e) {}
      };
      
      setTimeout(emitHeight, 1000);
      editor.on('component:update', emitHeight);
      editor.on('styleManager:update', emitHeight);
    });

    // Handle selection for Global Theme toggle
    editor.on('component:selected', () => {
      window.dispatchEvent(new CustomEvent('grapes:selected', { detail: true }));
    });
    
    editor.on('component:deselected', () => {
      // Small timeout to check if another component was selected immediately
      setTimeout(() => {
        if (!editor.getSelected()) {
          window.dispatchEvent(new CustomEvent('grapes:selected', { detail: false }));
        }
      }, 50);
    });

    // Handle Auto-save
    editor.on('update', () => {
      if (onSave) {
        onSave(editor.getHtml(), editor.getCss() || '');
      }
    });

    return () => {
      editor.destroy();
    };
  }, [htmlContent, cssContent, onSave]);

  return (
    <>
      <style>
        {`
          /* Hide all built-in GrapesJS panels (top bar, right sidebar, devices, commands) */
          .gjs-pn-panels, .gjs-pn-panel, .gjs-pn-devices-c, .gjs-pn-devices, .gjs-pn-commands, .gjs-pn-views, .gjs-pn-buttons { display: none !important; }
          /* Fix Canvas background to fill the Rnd container perfectly */
          .gjs-cv-canvas { background: #fff !important; height: 100% !important; top: 0 !important; width: 100% !important; left: 0 !important; }
          .gjs-frame { margin: 0 !important; display: block; border-radius: 0 !important; border: none !important; width: 100% !important; height: 100% !important; box-shadow: none !important; }
          .gjs-frame-wrapper { display: block !important; padding: 0 !important; overflow: hidden !important; width: 100% !important; height: 100% !important; }
          .gjs-editor { background: transparent !important; }

          /* Custom Sidebar styling for Portals */
          .custom-sidebar { background: #0f172a; color: #fff; display: flex; flex-direction: column; }
          .sidebar-header { padding: 16px; font-weight: 600; font-size: 13px; border-bottom: 1px solid #1E293B; background: #0B0F19; text-transform: uppercase; letter-spacing: 1px; color: #94A3B8; position: sticky; top: 0; z-index: 10; }
          
          /* Force GrapesJS UI in sidebars to match dark theme */
          .gjs-sm-sector { margin-bottom: 20px !important; border: 1px solid #1E293B; border-radius: 8px; overflow: hidden; background: #0B0F19; }
          .gjs-sm-sector .gjs-sm-title { background-color: #0f172a !important; border-bottom: 1px solid #1E293B !important; color: #E2E8F0 !important; padding: 12px 16px !important; }
          .gjs-sm-property { background-color: transparent !important; border-bottom: 1px solid #1E293B !important; }
          
          /* Layers Panel Fixes */
          .gjs-layer-title { color: #E2E8F0 !important; }
          .gjs-layer-item { border-bottom: 1px solid #1E293B !important; }
          .gjs-layer-active { background-color: rgba(6, 182, 212, 0.1) !important; color: #06B6D4 !important; }
          .gjs-layer-active .gjs-layer-title { color: #06B6D4 !important; }
          .gjs-layer-no-chld > .gjs-layer-title-inn > .gjs-layer-move { display: none !important; } /* Hide move icon for leaf nodes */
          
          /* Properties Panel Fixes */
          .gjs-trt-trait { background-color: #111827 !important; border-bottom: 1px solid #1E293B !important; padding: 12px 16px !important; }
          .gjs-sm-properties { padding: 12px !important; }
          .gjs-field { background-color: #1E293B !important; border: 1px solid #334155 !important; border-radius: 4px !important; color: #fff !important; }
          .gjs-field-colorp { background-color: transparent !important; border: none !important; padding: 0 !important; }
          .gjs-field-colorp-c { width: 24px !important; height: 24px !important; border: 1px solid #334155 !important; border-radius: 4px !important; margin-right: 8px !important; }
          .gjs-radio-item-active { background: #06B6D4 !important; color: #fff !important; border-color: #06B6D4 !important; }
          .gjs-sm-label { color: #94A3B8 !important; padding-bottom: 4px !important; }
        `}
      </style>
      
      {!htmlContent && (
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', zIndex: 10 }}>
          <Spin size="large" tip="Loading Visual Editor..." />
        </div>
      )}
      
      <div ref={containerRef} style={{ position: 'relative', width: '100%', height: '100%' }} />

      {/* Portals to inject UI into PageBuilder's global layout */}
      {mounted && document.getElementById('portal-right-sidebar') && createPortal(
        <div className="custom-sidebar" style={{ width: '100%', height: '100%' }}>
          <div className="sidebar-header">Properties</div>
          <div id="gjs-selectors" />
          <div id="gjs-traits" />
          <div id="gjs-styles" />
        </div>,
        document.getElementById('portal-right-sidebar')!
      )}

    </>
  );
};

export default GrapesEditor;
