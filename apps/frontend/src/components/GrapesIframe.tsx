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
      (function() {
        function sendNavigate(href) {
          if (!href || href === '#' || href.startsWith('javascript:') || href.startsWith('mailto:') || href.startsWith('tel:')) return;
          window.parent.postMessage({ type: 'GRAPES_NAVIGATE', href: href }, '*');
        }
        // Hijack window.location
        try {
          var locationProxy = new Proxy(window.location, {
            set: function(t, p, v) { if (p === 'href') { sendNavigate(v); return true; } t[p] = v; return true; },
            get: function(t, p) {
              if (p === 'assign') return function(u) { sendNavigate(u); };
              if (p === 'replace') return function(u) { sendNavigate(u); };
              var v = t[p]; return typeof v === 'function' ? v.bind(t) : v;
            }
          });
          Object.defineProperty(window, 'location', { get: function() { return locationProxy; }, configurable: true });
        } catch(e) {
          try { window.location.assign = function(u) { sendNavigate(u); }; window.location.replace = function(u) { sendNavigate(u); }; } catch(_) {}
        }
        // Capture-phase click interceptor
        document.addEventListener('click', function(e) {
          var el = e.target;
          while (el && el !== document.body) {
            var tag = el.tagName ? el.tagName.toLowerCase() : '';
            var actionType = el.getAttribute ? el.getAttribute('data-gz-action-type') : null;
            var gzHref = el.getAttribute ? el.getAttribute('data-gz-href') : null;
            var href = el.getAttribute ? el.getAttribute('href') : null;
            var onclick = el.getAttribute ? el.getAttribute('onclick') : null;
            if (actionType === 'page' || actionType === 'url') { e.preventDefault(); e.stopImmediatePropagation(); sendNavigate(gzHref || href || ''); return; }
            if (tag === 'a' && href && href !== '#' && !href.startsWith('javascript:')) { e.preventDefault(); e.stopImmediatePropagation(); sendNavigate(href); return; }
            if (gzHref) { e.preventDefault(); e.stopImmediatePropagation(); sendNavigate(gzHref); return; }
            if (onclick && (onclick.includes('location.href') || onclick.includes('location.assign') || onclick.includes('location.replace'))) {
              e.preventDefault(); e.stopImmediatePropagation();
              var m = onclick.match(/location\\.(?:href|assign|replace)\\s*[=(]\\s*['"]([^'"]+)['"]/);
              if (m && m[1]) sendNavigate(m[1]); return;
            }
            el = el.parentElement;
          }
        }, true);
        document.addEventListener('submit', function(e) { e.preventDefault(); });
      })();
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
      // ── Genzite Navigation Interceptor ─────────────────────────────────
      // Intercept ALL navigation attempts inside the iframe so they are
      // routed through postMessage to the parent React app (LiveViewer).
      // This covers:
      //   1. <a href="..."> clicks
      //   2. <button onclick="window.location.href='...'"> clicks
      //   3. Direct window.location.href = '...' assignments from any script
      //   4. window.location.assign() / window.location.replace() calls

      (function() {
        function sendNavigate(href) {
          if (!href || href === '#' || href.startsWith('javascript:') || href.startsWith('mailto:') || href.startsWith('tel:')) return;
          window.parent.postMessage({ type: 'GRAPES_NAVIGATE', href: href }, '*');
        }

        // 1. Hijack window.location.href setter and assign/replace ASAP
        try {
          var realLocation = window.location;
          var locationProxy = new Proxy(realLocation, {
            set: function(target, prop, value) {
              if (prop === 'href') {
                sendNavigate(value);
                return true; // prevent actual navigation
              }
              target[prop] = value;
              return true;
            },
            get: function(target, prop) {
              if (prop === 'assign') {
                return function(url) { sendNavigate(url); };
              }
              if (prop === 'replace') {
                return function(url) { sendNavigate(url); };
              }
              var val = target[prop];
              return typeof val === 'function' ? val.bind(target) : val;
            }
          });
          Object.defineProperty(window, 'location', {
            get: function() { return locationProxy; },
            configurable: true
          });
        } catch(e) {
          // Proxy fallback: patch individual methods
          try {
            var _assign = window.location.assign.bind(window.location);
            var _replace = window.location.replace.bind(window.location);
            window.location.assign = function(url) { sendNavigate(url); };
            window.location.replace = function(url) { sendNavigate(url); };
          } catch(_) {}
        }

        // 2. Click interceptor — catches <a> and any element with data-gz-href or onclick nav
        document.addEventListener('click', function(e) {
          // Walk up from click target to find any navigable ancestor
          var el = e.target;
          while (el && el !== document.body) {
            var tag = el.tagName ? el.tagName.toLowerCase() : '';
            var actionType = el.getAttribute ? el.getAttribute('data-gz-action-type') : null;
            var gzHref = el.getAttribute ? el.getAttribute('data-gz-href') : null;
            var href = el.getAttribute ? el.getAttribute('href') : null;
            var onclick = el.getAttribute ? el.getAttribute('onclick') : null;

            // Case A: element has explicit Genzite action type
            if (actionType === 'page' || actionType === 'url') {
              e.preventDefault();
              e.stopImmediatePropagation();
              var target = gzHref || href || '';
              if (target) sendNavigate(target);
              return;
            }

            // Case B: anchor tag
            if (tag === 'a' && href && href !== '#' && !href.startsWith('javascript:')) {
              e.preventDefault();
              e.stopImmediatePropagation();
              sendNavigate(href);
              return;
            }

            // Case C: any element with data-gz-href
            if (gzHref) {
              e.preventDefault();
              e.stopImmediatePropagation();
              sendNavigate(gzHref);
              return;
            }

            // Case D: any element with onclick containing location.href navigation
            if (onclick && (onclick.includes('location.href') || onclick.includes('location.assign') || onclick.includes('location.replace'))) {
              e.preventDefault();
              e.stopImmediatePropagation();
              // Extract URL from common patterns: location.href='...', location.href="..."
              var match = onclick.match(/location\.(?:href|assign|replace)\s*[=(]\s*['"]([^'"]+)['"]/);
              if (match && match[1]) sendNavigate(match[1]);
              return;
            }

            el = el.parentElement;
          }
        }, true); // capture phase — runs BEFORE onclick handlers

        // 3. Prevent form submissions from navigating
        document.addEventListener('submit', function(e) { e.preventDefault(); });
      })();
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
