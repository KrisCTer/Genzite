/**
 * GrapesIframe — Shared component for rendering a GRAPESJS widget's
 * HTML/CSS inside a sandboxed iframe.
 *
 * Used by:
 *  - LiveViewer  (public Live/Preview page)
 *  - CanvasPageFrame  (Project canvas inside the builder)
 *
 * Single source of truth: any change here applies to ALL viewers at once.
 */
import React, { useEffect } from 'react';

export interface GrapesIframeProps {
  /** Raw HTML to inject into <body> */
  html: string;
  /** Raw CSS to inject into <style> */
  css: string;
  /** iframe height in pixels or CSS value. Defaults to 100vh. */
  height?: number | string;
  /**
   * When provided, the iframe measures its actual content height after
   * load and calls this with the pixel value. Use this in canvas/preview
   * mode to size the frame to fit the content exactly.
   */
  onHeightChange?: (height: number) => void;
  /** Unique id used to match postMessage back to this widget */
  widgetId?: string;
  /** Additional iframe style overrides */
  style?: React.CSSProperties;
  /** title attribute for accessibility */
  title?: string;
}

/** Builds the full HTML document string injected into the iframe via srcDoc. */
export function buildGrapesDoc(html: string, css: string, widgetId?: string): string {
  // Safety net for legacy data: if html is already a full HTML document (stored
  // before the body-stripping fix), inject our intercept script and return as-is.
  const trimmed = html.trimStart().toLowerCase();
  if (trimmed.startsWith('<!doctype') || trimmed.startsWith('<html')) {
    // Inject our link-intercept script before </body>
    const interceptScript = `
    <script>
      document.addEventListener('click', function(e) {
        var el = e.target.closest('[data-gz-action-type="page"], [data-gz-action-type="url"], a');
        if (el) {
          var type = el.getAttribute('data-gz-action-type');
          if (type === 'page' || type === 'url' || el.tagName.toLowerCase() === 'a') {
            e.preventDefault();
            var href = el.getAttribute('data-gz-href') || el.getAttribute('href');
            if (href && href !== '#' && !href.startsWith('javascript:')) {
              window.parent.postMessage({ type: 'GRAPES_NAVIGATE', href: href }, '*');
            }
          }
        }
      });
      document.addEventListener('submit', function(e) { e.preventDefault(); });
    <\/script>`;
    return html.replace(/<\/body>/i, interceptScript + '\n</body>');
  }
  const heightScript = widgetId ? `
    <script>
      (function() {
        // Safe one-shot height reporter — fires after layout settles, never loops.
        function measure() {
          var h = Math.max(document.documentElement.scrollHeight, document.body.scrollHeight);
          // Clamp: min 200px, max 6000px to avoid runaway values.
          h = Math.max(200, Math.min(h, 6000));
          window.parent.postMessage(
            { type: 'GRAPES_CONTENT_HEIGHT', widgetId: '${widgetId}', height: h },
            '*'
          );
        }
        // Fire on load, then once more after fonts/images settle.
        window.addEventListener('load', function() {
          measure();
          setTimeout(measure, 600);
        });
      })();
    <\/script>` : '';

  return `<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800&family=DM+Sans:wght@400;500;700&family=JetBrains+Mono:wght@500&display=swap" rel="stylesheet">
    <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet">
    <script src="https://cdn.tailwindcss.com?plugins=forms,container-queries"><\/script>
    <script id="tailwind-config-default">
      // Default Genzite semantic token table — overridden by inline tailwind-config if present.
      if (typeof tailwind !== 'undefined' && !document.getElementById('tailwind-config')) {
        tailwind.config = {
          darkMode: 'class',
          theme: {
            extend: {
              colors: {
                "primary": "#00668a",
                "on-primary": "#ffffff",
                "primary-container": "#38bdf8",
                "on-primary-container": "#004965",
                "secondary": "#674bb5",
                "on-secondary": "#ffffff",
                "secondary-container": "#e8ddff",
                "on-secondary-container": "#21005e",
                "tertiary": "#a43073",
                "on-tertiary": "#ffffff",
                "tertiary-container": "#ffd8e7",
                "on-tertiary-container": "#3d0026",
                "surface": "#f7f9fb",
                "on-surface": "#191c1e",
                "on-surface-variant": "#3e484f",
                "surface-container": "#eceef0",
                "surface-container-low": "#f2f4f6",
                "surface-container-high": "#e6e8ea",
                "surface-container-lowest": "#ffffff",
                "outline": "#6e7980",
                "outline-variant": "#bdc8d1",
                "inverse-surface": "#2d3133",
                "inverse-primary": "#7bd0ff"
              },
              fontFamily: {
                "headline-lg": ["Plus Jakarta Sans"],
                "headline-xl": ["Plus Jakarta Sans"],
                "headline-lg-mobile": ["Plus Jakarta Sans"],
                "body-md": ["DM Sans"],
                "body-sm": ["DM Sans"],
                "label-caps": ["DM Sans"],
                "label-md": ["JetBrains Mono"]
              },
              fontSize: {
                "headline-xl": ["48px", { lineHeight: "1.2", letterSpacing: "-0.02em", fontWeight: "700" }],
                "headline-lg": ["32px", { lineHeight: "1.25", letterSpacing: "-0.01em", fontWeight: "600" }],
                "headline-lg-mobile": ["28px", { lineHeight: "1.25", fontWeight: "600" }],
                "body-md": ["16px", { lineHeight: "1.6", fontWeight: "400" }],
                "body-sm": ["14px", { lineHeight: "1.5", fontWeight: "400" }],
                "label-caps": ["12px", { lineHeight: "1", letterSpacing: "0.05em", fontWeight: "700" }],
                "label-md": ["14px", { lineHeight: "20px", fontWeight: "500" }]
              },
              spacing: {
                "xs": "4px",
                "sm": "12px",
                "md": "24px",
                "lg": "48px",
                "xl": "80px",
                "gutter": "24px",
                "margin-mobile": "20px",
                "margin-desktop": "64px"
              }
            }
          }
        };
      }
    <\/script>
    <style>
      html, body { margin: 0; padding: 0; box-sizing: border-box; overflow-x: hidden; }
      body { min-height: 100vh; }
      *, *::before, *::after { box-sizing: inherit; }
      /* Ensure sections don't collapse to 0 when content is not responsive */
      section, [class*='section'], [class*='hero'], [class*='banner'], [class*='features'], [class*='testimonial'] {
        min-height: unset;
      }
      img { max-width: 100%; height: auto; }
      .material-symbols-outlined { font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24; }
      ${css}
    </style>
  </head>
  <body>
    ${html}
    <script>
      // Prevent clicks from navigating the iframe natively to support SPA routing.
      document.addEventListener('click', function(e) {
        var el = e.target.closest('[data-gz-action-type="page"], [data-gz-action-type="url"], a');
        if (el) {
          var type = el.getAttribute('data-gz-action-type');
          if (type === 'page' || type === 'url' || el.tagName.toLowerCase() === 'a') {
            e.preventDefault();
            var href = el.getAttribute('data-gz-href') || el.getAttribute('href');
            if (href && href !== '#' && !href.startsWith('javascript:')) {
              window.parent.postMessage({ type: 'GRAPES_NAVIGATE', href: href }, '*');
            }
          }
        }
      });
      // Prevent form submissions from navigating natively.
      document.addEventListener('submit', function(e) {
        e.preventDefault();
      });
    <\/script>
    ${heightScript}
  </body>
</html>`;
}

const GrapesIframe: React.FC<GrapesIframeProps> = ({
  html,
  css,
  height = '100vh',
  onHeightChange,
  widgetId,
  style,
  title = 'GrapesJS Content',
}) => {
  const heightVal = typeof height === 'number' ? `${height}px` : height;

  // Listen for height reports from this specific iframe
  useEffect(() => {
    if (!onHeightChange || !widgetId) return;
    const handler = (e: MessageEvent) => {
      if (
        e.data?.type === 'GRAPES_CONTENT_HEIGHT' &&
        e.data.widgetId === widgetId &&
        typeof e.data.height === 'number'
      ) {
        onHeightChange(e.data.height);
      }
    };
    window.addEventListener('message', handler);
    return () => window.removeEventListener('message', handler);
  }, [onHeightChange, widgetId]);

  return (
    <iframe
      title={title}
      srcDoc={buildGrapesDoc(html, css, widgetId)}
      style={{
        width: '100%',
        height: heightVal,
        border: 'none',
        display: 'block',
        background: '#fff',
        ...style,
      }}
    />
  );
};

export default GrapesIframe;
