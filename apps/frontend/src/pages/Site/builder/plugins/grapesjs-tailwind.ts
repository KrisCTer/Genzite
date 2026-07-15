import type { Editor } from 'grapesjs';

/**
 * Inject the same head resources that buildGrapesDoc() (GrapesIframe.tsx) uses,
 * so the GrapesJS editor canvas renders pixel-perfectly identical to Preview.
 *
 * Root cause of mismatch: the previous version relied on canvas.styles[] (async CDN)
 * and had no tailwind-config-default token table, causing missing colors/fonts/spacing.
 */
export const injectTailwindAndStyles = (editor: Editor, htmlContent: string, cssContent?: string) => {
  // 1. Parse the full HTML document
  const parser = new DOMParser();

  // Remove animation classes that might keep elements hidden in the builder without JS
  const cleanedHtml = (htmlContent || '<div></div>')
    .replace(/opacity-0/g, 'opacity-100')
    .replace(/\binvisible\b/g, 'visible');

  const doc = parser.parseFromString(cleanedHtml, 'text/html');

  // Fix placeholder images that fail to load
  doc.body.querySelectorAll('img').forEach(img => {
    if (img.src.includes('via.placeholder.com') || img.src.includes('placeholder')) {
      img.src = 'https://images.unsplash.com/photo-1618220179428-22790b46a0eb?q=80&w=2000&auto=format&fit=crop';
    }
  });

  // 2. Get the canvas iframe document and window
  const iframeDoc = editor.Canvas.getDocument();
  const frameEl = editor.Canvas.getFrameEl() as HTMLIFrameElement;

  if (iframeDoc?.head) {
    // ── 3. Full CSS reset — identical to buildGrapesDoc() ────────────────────
    const resetEl = iframeDoc.createElement('style');
    resetEl.id = 'gz-reset';
    resetEl.innerHTML = [
      'html, body { margin: 0; padding: 0; box-sizing: border-box; overflow-x: hidden; }',
      'body { min-height: 100vh; }',
      '*, *::before, *::after { box-sizing: inherit; }',
      'section, [class*="section"], [class*="hero"], [class*="banner"], [class*="features"], [class*="testimonial"] { min-height: unset; }',
      'img { max-width: 100%; height: auto; }',
      '.material-symbols-outlined { font-variation-settings: "FILL" 0, "wght" 400, "GRAD" 0, "opsz" 24; }',
    ].join('\n');
    // Remove old reset if any then add fresh one
    iframeDoc.getElementById('gz-reset')?.remove();
    iframeDoc.head.appendChild(resetEl);

    // ── 4. Google Fonts — same as buildGrapesDoc() ───────────────────────────
    // Only add if not already present
    const addLink = (href: string, id: string) => {
      if (iframeDoc.getElementById(id)) return;
      const link = iframeDoc.createElement('link');
      link.id = id;
      link.rel = 'stylesheet';
      link.href = href;
      iframeDoc.head.appendChild(link);
    };
    addLink(
      'https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800&family=DM+Sans:wght@400;500;700&family=JetBrains+Mono:wght@500&display=swap',
      'gz-font-primary'
    );
    addLink(
      'https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap',
      'gz-font-material'
    );

    // ── 5. Tailwind config-default — IDENTICAL to buildGrapesDoc() ───────────
    // This is the missing piece: without this, editor canvas has no custom tokens.
    if (!iframeDoc.getElementById('gz-tw-config-default')) {
      const cfgDefault = iframeDoc.createElement('script');
      cfgDefault.id = 'gz-tw-config-default';
      cfgDefault.innerHTML = `
        // Default Genzite semantic token table — overridden by inline tailwind-config if present.
        (function() {
          function applyConfig() {
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
              if (tailwind.refresh) tailwind.refresh();
            }
          }
          // Try now (tailwind CDN already in canvas.scripts[])
          applyConfig();
          // Also retry once page scripts run
          window.addEventListener('load', applyConfig);
        })();
      `;
      // Insert BEFORE other scripts so config is available when CDN runs
      iframeDoc.head.insertBefore(cfgDefault, iframeDoc.head.firstChild);
    }

    // ── 6. Inject page-specific tailwind config (from the page <head>) ───────
    const pageTwConfig = doc.head.querySelector('script#tailwind-config');
    if (pageTwConfig?.innerHTML && !iframeDoc.getElementById('gz-tw-page-config')) {
      const cfgEl = iframeDoc.createElement('script');
      cfgEl.id = 'gz-tw-page-config';
      cfgEl.innerHTML = pageTwConfig.innerHTML;
      iframeDoc.head.insertBefore(cfgEl, iframeDoc.head.firstChild);
    }

    // ── 7. Inject <style> and <link rel="stylesheet"> from page <head> ───────
    doc.head.querySelectorAll('style:not(#gz-reset), link[rel="stylesheet"]').forEach(el => {
      iframeDoc.head.appendChild(el.cloneNode(true));
    });

    // ── 8. Inject non-CDN scripts from page <head> ───────────────────────────
    Array.from(doc.head.querySelectorAll('script:not(#tailwind-config):not([src*="tailwindcss.com"])')).forEach(oldScript => {
      const s = iframeDoc.createElement('script');
      Array.from(oldScript.attributes).forEach(a => s.setAttribute(a.name, a.value));
      if (oldScript.innerHTML) s.innerHTML = oldScript.innerHTML;
      iframeDoc.head.appendChild(s);
    });

    // ── 9. Inject page CSS if provided ───────────────────────────────────────
    if (cssContent) {
      const pageCssEl = iframeDoc.createElement('style');
      pageCssEl.id = 'gz-page-css';
      pageCssEl.innerHTML = cssContent;
      iframeDoc.head.appendChild(pageCssEl);
    }
  }

  // 10. Load body content into GrapesJS component model
  editor.setComponents(doc.body.innerHTML);

  if (cssContent) editor.setStyle(cssContent);

  // 11. Poll for Tailwind availability, apply config, then call refresh()
  //     Uses shorter intervals (50ms → 4s max) so editor renders correctly faster.
  let twRetry = 0;
  const MAX_RETRIES = 80; // 4 seconds max at 50ms intervals
  const pollAndRefresh = () => {
    try {
      const iframeWin = frameEl?.contentWindow as any;
      if (iframeWin?.tailwind) {
        // Apply config first (in case gz-tw-config-default ran before tailwind was ready)
        const iframeDocNow = editor.Canvas.getDocument();
        if (iframeDocNow && !iframeDocNow.getElementById('tailwind-config')) {
          iframeWin.tailwind.config = {
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
                  "surface": "#f7f9fb",
                  "on-surface": "#191c1e",
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
                  "body-md": ["DM Sans"],
                  "body-sm": ["DM Sans"],
                  "label-caps": ["DM Sans"],
                  "label-md": ["JetBrains Mono"]
                },
                fontSize: {
                  "headline-xl": ["48px", { lineHeight: "1.2", letterSpacing: "-0.02em", fontWeight: "700" }],
                  "headline-lg": ["32px", { lineHeight: "1.25", letterSpacing: "-0.01em", fontWeight: "600" }],
                  "body-md": ["16px", { lineHeight: "1.6", fontWeight: "400" }],
                  "body-sm": ["14px", { lineHeight: "1.5", fontWeight: "400" }],
                },
                spacing: {
                  "xs": "4px", "sm": "12px", "md": "24px",
                  "lg": "48px", "xl": "80px", "gutter": "24px",
                  "margin-mobile": "20px", "margin-desktop": "64px"
                }
              }
            }
          };
        }
        if (iframeWin.tailwind.refresh) {
          iframeWin.tailwind.refresh();
          // Second refresh after GrapesJS finishes rendering components
          setTimeout(() => {
            try { (frameEl?.contentWindow as any)?.tailwind?.refresh(); } catch (_) {}
          }, 300);
          // Third refresh after fonts load
          setTimeout(() => {
            try { (frameEl?.contentWindow as any)?.tailwind?.refresh(); } catch (_) {}
          }, 800);
        }
      } else if (twRetry++ < MAX_RETRIES) {
        setTimeout(pollAndRefresh, 50);
      }
    } catch (e) {
      if (twRetry++ < MAX_RETRIES) setTimeout(pollAndRefresh, 50);
    }
  };
  // Start polling sooner (50ms instead of 200ms)
  setTimeout(pollAndRefresh, 50);
};
