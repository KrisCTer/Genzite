export const triggerCanvasFeedback = (editor: any, sel?: any, color = '#38BDF8') => {
    try {
      if (!sel && editor) sel = editor.getSelected();
      if (!sel) return;
      const els: HTMLElement[] = [];
      const addEl = (m: any) => {
        if (!m) return;
        const el = m.getEl ? m.getEl() : (m.getView && m.getView().el);
        if (el && el.style) els.push(el);
      };
      if (Array.isArray(sel)) {
        sel.forEach(addEl);
      } else if (sel && sel.models && Array.isArray(sel.models)) {
        sel.models.forEach(addEl);
      } else {
        addEl(sel);
      }
      els.forEach(el => {
        const origTransition = el.style.transition;
        const origBoxShadow = el.style.boxShadow;
        const origOutline = el.style.outline;
        el.style.transition = 'all 0.25s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
        el.style.boxShadow = `0 0 0 3px ${color}, 0 0 24px ${color}`;
        el.style.outline = `2px solid ${color}`;
        el.style.transform = 'scale(1.018)';
        setTimeout(() => {
          if (el && el.style) {
            el.style.transform = 'scale(1)';
            el.style.boxShadow = origBoxShadow;
            el.style.outline = origOutline;
            setTimeout(() => {
              if (el && el.style) el.style.transition = origTransition;
            }, 250);
          }
        }, 380);
      });
    } catch (err) {
      console.warn('Canvas feedback error:', err);
    }
  };

  export const handleGrapesAction = (action: import('./CanvaContextMenu').CanvaActionType, editor: any, contextMenuState: any, floatingToolbarState: any) => {
    
    
    const selected = contextMenuState.model || floatingToolbarState.model || editor.getSelected();

    switch (action) {
      case 'copy': {
        if (selected) {
          editor.select(selected);
          editor.runCommand('core:copy');
          triggerCanvasFeedback(selected, '#38BDF8');
        }
        break;
      }
      case 'paste': {
        editor.runCommand('core:paste');
        setTimeout(() => triggerCanvasFeedback(editor.getSelected(), '#10B981'), 50);
        break;
      }
      case 'duplicate': {
        if (selected) {
          editor.select(selected);
          editor.runCommand('tlb-clone');
          setTimeout(() => triggerCanvasFeedback(editor.getSelected() || selected, '#38BDF8'), 50);
        }
        break;
      }
      case 'delete': {
        if (selected) {
          triggerCanvasFeedback(selected, '#EF4444');
          setTimeout(() => {
            editor.select(selected);
            editor.runCommand('tlb-delete');
          }, 150);
        }
        break;
      }
      case 'group': {
        const selectedAll = editor.getSelectedAll();
        if (selectedAll && selectedAll.length > 1) {
          const firstModel = selectedAll[0];
          const parent = firstModel.parent();
          if (parent) {
            // Check if absolute positioning is prevalent
            const isAbsolute = selectedAll.some((c: any) => c.getStyle().position === 'absolute' || (c.getEl() && window.getComputedStyle(c.getEl()).position === 'absolute'));

            const insertAt = firstModel.index();
            const group = parent.append(`<div class="__gz-group" data-gz-group="true"></div>`, { at: insertAt })[0];

            if (isAbsolute) {
              let minTop = Infinity, minLeft = Infinity, maxBottom = -Infinity, maxRight = -Infinity;
              const els = selectedAll.map((c: any) => c.getEl());

              els.forEach((el: any) => {
                if (el) {
                  const rect = el.getBoundingClientRect();
                  const parentRect = el.parentElement ? el.parentElement.getBoundingClientRect() : { top: 0, left: 0 };
                  const top = rect.top - parentRect.top;
                  const left = rect.left - parentRect.left;
                  minTop = Math.min(minTop, top);
                  minLeft = Math.min(minLeft, left);
                  maxBottom = Math.max(maxBottom, top + rect.height);
                  maxRight = Math.max(maxRight, left + rect.width);
                }
              });

              group.addStyle({
                position: 'absolute',
                top: `${minTop}px`,
                left: `${minLeft}px`,
                width: `${maxRight - minLeft}px`,
                height: `${maxBottom - minTop}px`,
                outline: '1px dashed #06B6D4'
              });

              selectedAll.forEach((c: any, i: number) => {
                const el = els[i];
                if (el) {
                  const rect = el.getBoundingClientRect();
                  const parentRect = el.parentElement ? el.parentElement.getBoundingClientRect() : { top: 0, left: 0 };
                  const oldTop = rect.top - parentRect.top;
                  const oldLeft = rect.left - parentRect.left;
                  c.addStyle({
                    position: 'absolute',
                    top: `${oldTop - minTop}px`,
                    left: `${oldLeft - minLeft}px`,
                    margin: '0'
                  });
                }
                c.set({ selectable: false, hoverable: false, draggable: false });
                group.append(c);
              });
            } else {
              group.addStyle({
                display: 'flex',
                'flex-wrap': 'wrap',
                gap: '10px',
                outline: '1px dashed #06B6D4',
                padding: '10px'
              });
              selectedAll.forEach((c: any) => {
                c.set({ selectable: false, hoverable: false, draggable: false });
                group.append(c);
              });
            }
            editor.select(group);
            triggerCanvasFeedback(group, '#8B5CF6');
          }
        } else {
          triggerCanvasFeedback(editor.getSelected(), '#F59E0B');
        }
        break;
      }
      case 'ungroup': {
        if (selected) {
          const parent = selected.parent();
          const children = selected.components().models;
          if (parent && children.length > 0) {
            const isAbsolute = selected.getStyle().position === 'absolute';
            const groupTop = parseFloat(selected.getStyle().top) || 0;
            const groupLeft = parseFloat(selected.getStyle().left) || 0;

            const childrenArr = [...children];
            childrenArr.forEach(c => {
              c.set({ selectable: true, hoverable: true, draggable: true });
              if (isAbsolute) {
                const childTop = parseFloat(c.getStyle().top) || 0;
                const childLeft = parseFloat(c.getStyle().left) || 0;
                c.addStyle({
                  top: `${groupTop + childTop}px`,
                  left: `${groupLeft + childLeft}px`
                });
              }
              parent.append(c);
            });
            selected.remove();
            setTimeout(() => triggerCanvasFeedback(editor.getSelected() || parent, '#8B5CF6'), 50);
          }
        }
        break;
      }
      case 'bringToFront': {
        if (selected) {
          const parent = selected.parent();
          if (parent) {
            const index = parent.components().length - 1;
            selected.move(parent, { at: index });
            const style = selected.getStyle() || {};
            const isAbsolute = style.position === 'absolute' || style.position === 'relative';
            if (isAbsolute) {
              let maxZ = 0;
              parent.components().forEach((c: any) => {
                if (c !== selected) {
                  const z = parseInt(c.getStyle()['z-index'] || '0', 10);
                  if (!isNaN(z) && z > maxZ) maxZ = z;
                }
              });
              selected.addStyle({ 'z-index': `${maxZ + 1}` });
            }
            editor.select(selected);
            editor.refresh();
            triggerCanvasFeedback(selected, '#38BDF8');
          }
        }
        break;
      }
      case 'sendToBack': {
        if (selected) {
          const parent = selected.parent();
          if (parent) {
            selected.move(parent, { at: 0 });
            const style = selected.getStyle() || {};
            const isAbsolute = style.position === 'absolute' || style.position === 'relative';
            if (isAbsolute) {
              selected.addStyle({ 'z-index': '0' });
              parent.components().forEach((c: any, idx: number) => {
                if (c !== selected) {
                  const z = parseInt(c.getStyle()['z-index'] || '0', 10);
                  if (isNaN(z) || z <= 0) c.addStyle({ 'z-index': `${idx + 1}` });
                }
              });
            }
            editor.select(selected);
            editor.refresh();
            triggerCanvasFeedback(selected, '#38BDF8');
          }
        }
        break;
      }
      case 'bringForward': {
        if (selected) {
          const parent = selected.parent();
          if (parent) {
            const index = selected.index();
            if (index < parent.components().length - 1) {
              selected.move(parent, { at: index + 1 });
            }
            const curZ = parseInt(selected.getStyle()['z-index'] || '0', 10) || 0;
            selected.addStyle({ 'z-index': `${curZ + 1}` });
            editor.select(selected);
            editor.refresh();
            triggerCanvasFeedback(selected, '#38BDF8');
          }
        }
        break;
      }
      case 'sendBackward': {
        if (selected) {
          const parent = selected.parent();
          if (parent) {
            const index = Math.max(0, selected.index() - 1);
            selected.move(parent, { at: index });
            const curZ = parseInt(selected.getStyle()['z-index'] || '1', 10) || 1;
            selected.addStyle({ 'z-index': `${Math.max(0, curZ - 1)}` });
            editor.select(selected);
            editor.refresh();
            triggerCanvasFeedback(selected, '#38BDF8');
          }
        }
        break;
      }
      case 'alignLeft':
      case 'alignCenter':
      case 'alignRight':
      case 'alignTop':
      case 'alignMiddle':
      case 'alignBottom': {
        if (selected) {
          const style = selected.getStyle() || {};
          const isAbsolute = style.position === 'absolute' || (selected.getEl() && window.getComputedStyle(selected.getEl()).position === 'absolute');

          if (isAbsolute) {
            const parentEl = selected.parent()?.getEl() || editor.Canvas.getBody();
            const el = selected.getEl();
            const parentWidth = parentEl ? parentEl.clientWidth : 1200;
            const parentHeight = parentEl ? parentEl.clientHeight : 800;
            const elWidth = el ? el.offsetWidth : 100;
            const elHeight = el ? el.offsetHeight : 100;

            if (action === 'alignLeft') {
              selected.addStyle({ left: '0px', right: 'auto' });
            } else if (action === 'alignCenter') {
              const centerLeft = Math.max(0, Math.round((parentWidth - elWidth) / 2));
              selected.addStyle({ left: `${centerLeft}px`, right: 'auto' });
            } else if (action === 'alignRight') {
              const rightLeft = Math.max(0, parentWidth - elWidth);
              selected.addStyle({ left: `${rightLeft}px`, right: 'auto' });
            } else if (action === 'alignTop') {
              selected.addStyle({ top: '0px', bottom: 'auto' });
            } else if (action === 'alignMiddle') {
              const middleTop = Math.max(0, Math.round((parentHeight - elHeight) / 2));
              selected.addStyle({ top: `${middleTop}px`, bottom: 'auto' });
            } else if (action === 'alignBottom') {
              const bottomTop = Math.max(0, parentHeight - elHeight);
              selected.addStyle({ top: `${bottomTop}px`, bottom: 'auto' });
            }
          } else {
            // Normal flow alignment
            if (action === 'alignLeft') {
              selected.addStyle({ 'text-align': 'left', 'margin-left': '0', 'margin-right': 'auto' });
            } else if (action === 'alignCenter') {
              selected.addStyle({ 'text-align': 'center', 'margin-left': 'auto', 'margin-right': 'auto' });
            } else if (action === 'alignRight') {
              selected.addStyle({ 'text-align': 'right', 'margin-left': 'auto', 'margin-right': '0' });
            } else if (action === 'alignTop') {
              selected.addStyle({ 'align-self': 'flex-start', 'margin-top': '0' });
            } else if (action === 'alignMiddle') {
              selected.addStyle({ 'align-self': 'center', 'margin-top': 'auto', 'margin-bottom': 'auto' });
            } else if (action === 'alignBottom') {
              selected.addStyle({ 'align-self': 'flex-end', 'margin-bottom': '0' });
            }
          }

          editor.select(selected);
          editor.refresh();
          triggerCanvasFeedback(selected, '#38BDF8');
        }
        break;
      }
      case 'lock':
      case 'unlock': {
        if (selected) {
          const isLocking = action === 'lock';
          selected.set('locked', isLocking);
          const attrs = selected.getAttributes();
          if (isLocking) {
            attrs['data-gz-locked'] = 'true';
          } else {
            delete attrs['data-gz-locked'];
          }
          selected.setAttributes(attrs);
          editor.refresh();
          triggerCanvasFeedback(selected, isLocking ? '#F59E0B' : '#10B981');
        }
        break;
      }
      case 'info': {
        if (selected) {
          triggerCanvasFeedback(selected, '#0EA5E9');
        }
        break;
      }
      default:
        break;
    }
  };
