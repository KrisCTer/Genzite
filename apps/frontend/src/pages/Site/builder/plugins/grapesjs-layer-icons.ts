import type { Editor } from 'grapesjs';

// GrapesJS escapes model.set('icon') via Underscore <%- %>, so SVG won't render.
// We inject icons directly into DOM after render.
const NAME_TO_ICON: Record<string, { svg: string; color: string }> = {
  'Body':      { svg: 'M12 2a10 10 0 1 1 0 20 10 10 0 0 1 0-20 M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20 M2 12h20', color: '#38BDF8' },
  'Header':    { svg: 'M3 9h18M3 3h18v6H3z M3 15h18v6H3z', color: '#F97316' },
  'Footer':    { svg: 'M3 15h18v6H3zM3 3h18v12H3z', color: '#94A3B8' },
  'Navigation':{ svg: 'M4 6h16M4 12h16M4 18h16', color: '#F97316' },
  'Section':   { svg: 'M3 3h18v18H3zM3 9h18M9 21V9', color: '#A78BFA' },
  'Block':     { svg: 'M3 3h18v18H3z', color: '#475569' },
  'Text':      { svg: 'M4 7V4h16v3M9 20h6M12 4v16', color: '#FCD34D' },
  'Paragraph': { svg: 'M4 7V4h16v3M9 20h6M12 4v16', color: '#FCD34D' },
  'Span':      { svg: 'M4 7V4h16v3M9 20h6M12 4v16', color: '#FCD34D' },
  'Heading 1': { svg: 'M6 12h12M6 20V4M18 20V4', color: '#FBBF24' },
  'Heading 2': { svg: 'M6 12h12M6 20V4M18 20V4', color: '#FBBF24' },
  'Heading 3': { svg: 'M6 12h12M6 20V4M18 20V4', color: '#FBBF24' },
  'Heading 4': { svg: 'M6 12h12M6 20V4M18 20V4', color: '#FBBF24' },
  'Image':     { svg: 'M3 3h18v18H3zM3 15l5-5 4 4 3-3 4 4M15 9a2 2 0 1 1-4 0 2 2 0 0 1 4 0', color: '#38BDF8' },
  'Video':     { svg: 'M23 7l-7 5 7 5V7zM1 5h15v14H1z', color: '#F472B6' },
  'Link':       { svg: 'M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71', color: '#A3E635' },
  'Button':     { svg: 'M5 8h14v8H5z', color: '#60A5FA' },
  'Form':       { svg: 'M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01', color: '#34D399' },
  'Input':      { svg: 'M2 8h20v8H2zM6 12h.01', color: '#34D399' },
  'List':       { svg: 'M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01', color: '#94A3B8' },
  'List Item':  { svg: 'M8 6h13M3 6h.01', color: '#94A3B8' },
  'Table':      { svg: 'M3 3h18v18H3zM3 9h18M3 15h18M12 3v18', color: '#94A3B8' },
  'Row':        { svg: 'M3 9h18M3 3h18v18H3z', color: '#94A3B8' },
  'Cell':       { svg: 'M3 3h8v8H3zM13 3h8v8h-8zM3 13h8v8H3zM13 13h8v8h-8z', color: '#64748B' },
  'Header Cell':{ svg: 'M3 3h8v8H3z', color: '#64748B' },
};

// Fallback icon for any unrecognized element name
const FALLBACK_ICON = { svg: 'M3 3h18v18H3z', color: '#475569' };

const buildIconSVG = (paths: string, color: string) =>
  `<svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink:0">${
    paths.split('M').filter(Boolean).map(d => `<path d="M${d.trim()}"/>`).join('')
  }</svg>`;

export const getFriendlyName = (comp: any): string => {
  if (comp.is('textnode')) return 'Text';
  if (comp.is('text')) {
    const tag = comp.get('tagName')?.toLowerCase();
    if (['h1','h2','h3','h4','h5','h6'].includes(tag)) return 'Heading ' + tag.replace('h', '');
    if (tag === 'p') return 'Paragraph';
    if (tag === 'span') return 'Span';
    return 'Text';
  }
  if (comp.is('image')) return 'Image';
  if (comp.is('video')) return 'Video';
  if (comp.is('link')) return 'Link';
  if (comp.is('button')) return 'Button';
  if (comp.is('form')) return 'Form';
  if (comp.is('input')) return 'Input';
  
  const tag = comp.get('tagName')?.toLowerCase();
  if (tag === 'header') return 'Header';
  if (tag === 'footer') return 'Footer';
  if (tag === 'nav') return 'Navigation';
  if (tag === 'section') return 'Section';
  if (tag === 'ul' || tag === 'ol') return 'List';
  if (tag === 'li') return 'List Item';
  if (tag === 'table') return 'Table';
  if (tag === 'tr') return 'Row';
  if (tag === 'td') return 'Cell';
  if (tag === 'th') return 'Header Cell';
  
  // Custom heuristics based on classes or typical GrapesJS defaults
  if (comp.is('wrapper') || tag === 'body') return 'Body';
  const classes = comp.getClasses() || [];
  if (classes.some((c: string) => c.includes('container') || c.includes('row') || c.includes('col'))) return 'Section';
  
  return comp.getName() || 'Block';
};

export const injectLayerIcons = () => {
  const layersEl = document.getElementById('gjs-layers');
  if (!layersEl) return;

  const processLayerEl = (layerEl: HTMLElement) => {
    if (layerEl.dataset.gzIcon) return; // already processed
    const nameEl = layerEl.querySelector('.gjs-layer-name') as HTMLElement;
    if (!nameEl) return;
    const titleInn = layerEl.querySelector('.gjs-layer-title-inn') as HTMLElement;
    if (!titleInn) return;

    const nameText = nameEl.textContent?.trim() || '';
    // Use matching icon or fallback for any unrecognized element
    const info = NAME_TO_ICON[nameText] || FALLBACK_ICON;

    // Remove ALL existing icons:
    // - our previous .gz-layer-icon span (re-processing)
    // - GrapesJS preset native SVG icons injected directly into .gjs-layer-title-inn
    titleInn.querySelectorAll('.gz-layer-icon').forEach((el) => el.remove());
    // Remove any native GrapesJS icon (direct svg children, <i> icon children)
    Array.from(titleInn.childNodes).forEach((node) => {
      const el = node as HTMLElement;
      if (el.tagName === 'SVG' || el.tagName === 'svg') el.remove();
      if (el.tagName === 'I' && el.classList?.contains('gjs-layer-icon')) el.remove();
    });

    const iconSpan = document.createElement('span');
    iconSpan.className = 'gz-layer-icon';
    iconSpan.style.cssText = 'display:flex;align-items:center;flex-shrink:0;margin-right:4px';
    iconSpan.innerHTML = buildIconSVG(info.svg, info.color);
    titleInn.insertBefore(iconSpan, nameEl);
    layerEl.dataset.gzIcon = '1';
  };

  // Process all current layers
  layersEl.querySelectorAll<HTMLElement>('.gjs-layer').forEach(processLayerEl);

  // Watch for future layer additions — only attach once
  if (!(layersEl as any)._gzObserver) {
    const obs = new MutationObserver(() => {
      layersEl.querySelectorAll<HTMLElement>('.gjs-layer:not([data-gz-icon])').forEach(processLayerEl);
    });
    obs.observe(layersEl, { childList: true, subtree: true });
    (layersEl as any)._gzObserver = obs;
  }
};

/**
 * GrapesJS Plugin to inject custom layer icons
 */
export default (editor: Editor) => {
  // Auto-expand layers and set custom names + icons
  editor.on('load', () => {
    setTimeout(() => {
      try {
        const rootLayer = editor.Layers?.getRoot?.();
        if (rootLayer) rootLayer.set('open', true);

        // Set friendly names via model.set() so layer names update
        const wrapper = editor.getWrapper();
        if (wrapper) {
          const patchComp = (comp: any) => {
            const friendlyName = getFriendlyName(comp);
            comp.set('name', friendlyName);
            comp.getName = () => friendlyName;
          };
          patchComp(wrapper); // Patch wrapper itself
          wrapper.onAll(patchComp); // Patch all children
        }

        // Re-mount layer panel with updated names
        setTimeout(() => {
          try {
            const layersEl = document.getElementById('gjs-layers');
            if (layersEl && editor.LayerManager) {
              // Clear observer ref so injectLayerIcons re-attaches a fresh one
              if ((layersEl as any)._gzObserver) {
                (layersEl as any)._gzObserver.disconnect();
                (layersEl as any)._gzObserver = null;
              }
              layersEl.innerHTML = '';
              const el = editor.LayerManager.render();
              if (el) layersEl.appendChild(el as Node);
            }
            // Inject icons into DOM directly (bypasses GrapesJS Underscore template escaping)
            injectLayerIcons();
          } catch (e) { }
        }, 100);
      } catch (e) {
        console.error('GrapesEditor: Layer setup error:', e);
      }
    }, 600);
  });

  // Re-apply icons on new components added dynamically
  editor.on('component:add', (comp: any) => {
    setTimeout(() => {
      try {
        const friendlyName = getFriendlyName(comp);
        comp.set('name', friendlyName);
        comp.getName = () => friendlyName;
        injectLayerIcons();
      } catch (e) { }
    }, 100);
  });
};
