import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  ChevronRight,
  ChevronDown,
  Eye,
  EyeOff,
  Lock,
  Unlock,
  ArrowUp,
  ArrowDown,
  Trash2,
  LayoutGrid,
  Box,
  Type,
  Image as ImageIcon,
  Columns,
  MousePointerClick,
  Layers,
} from 'lucide-react';
import { Tooltip, Modal, message } from 'antd';

interface CustomLayersTreeProps {
  editor: any | null;
}

interface LayerNodeData {
  id: string;
  name: string;
  type: string;
  component: any;
  children: LayerNodeData[];
  isHidden: boolean;
  isLocked: boolean;
  isSelected: boolean;
}

export const CustomLayersTree: React.FC<CustomLayersTreeProps> = ({ editor }) => {
  const [treeData, setTreeData] = useState<LayerNodeData[]>([]);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const dragNodeRef = useRef<LayerNodeData | null>(null);
  const [dragOverNodeId, setDragOverNodeId] = useState<string | null>(null);

  const getNodeIcon = (type: string, name: string) => {
    const lowerType = (type || '').toLowerCase();
    const lowerName = (name || '').toLowerCase();

    if (lowerType === 'header' || lowerType === 'footer' || lowerType === 'section' || lowerName.includes('section')) {
      return <LayoutGrid size={14} color="#06B6D4" />;
    }
    if (lowerType === 'text' || lowerType === 'heading' || lowerType === 'paragraph' || lowerName.includes('text')) {
      return <Type size={14} color="#A855F7" />;
    }
    if (lowerType === 'image' || lowerType === 'video' || lowerName.includes('image')) {
      return <ImageIcon size={14} color="#10B981" />;
    }
    if (lowerType === 'row' || lowerType === 'column' || lowerType === 'grid' || lowerName.includes('column')) {
      return <Columns size={14} color="#3B82F6" />;
    }
    if (lowerType === 'button' || lowerType === 'link' || lowerName.includes('button')) {
      return <MousePointerClick size={14} color="#F59E0B" />;
    }
    if (lowerType === 'wrapper' || lowerName.includes('body')) {
      return <Layers size={14} color="#E2E8F0" />;
    }
    return <Box size={14} color="#94A3B8" />;
  };

  const buildTreeData = useCallback((component: any, depth = 0): LayerNodeData | null => {
    if (!component) return null;

    const type = component.get('type') || component.get('tagName') || 'box';
    const id = component.getId();
    let name = component.get('custom-name') || component.get('name') || component.getName?.();
    if (!name || typeof name !== 'string' || name.trim() === '' || name.trim() === ':' || name.trim() === '-') {
      name = type || 'Block';
    }
    if (name.toLowerCase() === 'wrapper') {
      name = 'Page Body (Wrapper)';
    } else {
      name = name.charAt(0).toUpperCase() + name.slice(1);
    }

    const style = component.getStyle?.() || component.get('style') || {};
    const isHidden = style.display === 'none';
    const isLocked = Boolean(component.get('locked'));
    const isSelected = editor?.getSelected() === component || selectedId === id;

    const rawChildren = component.components?.() || [];
    const children: LayerNodeData[] = [];

    rawChildren.forEach((child: any) => {
      const childData = buildTreeData(child, depth + 1);
      if (childData) {
        children.push(childData);
      }
    });

    return {
      id,
      name,
      type,
      component,
      children,
      isHidden,
      isLocked,
      isSelected,
    };
  }, [editor, selectedId]);

  const refreshTree = useCallback(() => {
    if (!editor) return;
    try {
      const wrapper = editor.getWrapper();
      if (wrapper) {
        const rootNode = buildTreeData(wrapper);
        if (rootNode) {
          setTreeData([rootNode]);
          setExpandedIds((prev) => {
            const next = new Set(prev);
            next.add(rootNode.id);
            return next;
          });
        }
      }
      const selected = editor.getSelected();
      if (selected) {
        setSelectedId(selected.getId());
      } else {
        setSelectedId(null);
      }
    } catch (e) {
      console.error('Error refreshing CustomLayersTree:', e);
    }
  }, [editor, buildTreeData]);

  useEffect(() => {
    if (!editor) return;

    refreshTree();

    const handleUpdate = () => refreshTree();
    const handleSelect = () => {
      const selected = editor.getSelected();
      if (selected) {
        setSelectedId(selected.getId());
        let parent = selected.parent?.();
        if (parent) {
          setExpandedIds((prev) => {
            const next = new Set(prev);
            while (parent) {
              next.add(parent.getId());
              parent = parent.parent?.();
            }
            return next;
          });
        }
      } else {
        setSelectedId(null);
      }
      refreshTree();
    };

    editor.on('component:add', handleUpdate);
    editor.on('component:remove', handleUpdate);
    editor.on('component:update', handleUpdate);
    editor.on('component:drag:end', handleUpdate);
    editor.on('sorter:drag:end', handleUpdate);
    editor.on('change:changesCount', handleUpdate);
    editor.on('component:update:components', handleUpdate);
    editor.on('component:reorder', handleUpdate);
    editor.on('component:selected', handleSelect);
    editor.on('component:deselected', handleSelect);
    editor.on('change:canvasOffset', handleUpdate);

    return () => {
      editor.off('component:add', handleUpdate);
      editor.off('component:remove', handleUpdate);
      editor.off('component:update', handleUpdate);
      editor.off('component:drag:end', handleUpdate);
      editor.off('sorter:drag:end', handleUpdate);
      editor.off('change:changesCount', handleUpdate);
      editor.off('component:update:components', handleUpdate);
      editor.off('component:reorder', handleUpdate);
      editor.off('component:selected', handleSelect);
      editor.off('component:deselected', handleSelect);
      editor.off('change:canvasOffset', handleUpdate);
    };
  }, [editor, refreshTree]);

  const toggleExpand = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleSelectNode = (component: any) => {
    if (!editor || !component) return;
    editor.select(component);
  };

  const handleToggleVisibility = (e: React.MouseEvent, node: LayerNodeData) => {
    e.stopPropagation();
    const comp = node.component;
    if (!comp) return;

    const currentStyle = comp.getStyle() || {};
    if (node.isHidden) {
      const updatedStyle = { ...currentStyle };
      delete updatedStyle.display;
      comp.setStyle(updatedStyle);
    } else {
      comp.setStyle({ ...currentStyle, display: 'none' });
    }
    refreshTree();
  };

  const handleToggleLock = (e: React.MouseEvent, node: LayerNodeData) => {
    e.stopPropagation();
    const comp = node.component;
    if (!comp) return;

    const newLocked = !node.isLocked;
    comp.set({
      locked: newLocked,
      selectable: !newLocked,
      hoverable: !newLocked,
      draggable: !newLocked,
    });
    refreshTree();
  };

  const handleMove = (e: React.MouseEvent, node: LayerNodeData, direction: 'up' | 'down') => {
    e.stopPropagation();
    const comp = node.component;
    if (!comp || !editor) return;

    const parent = comp.parent?.();
    if (!parent) return;

    const collection = parent.components();
    const index = collection.indexOf(comp);
    if (index < 0) return;

    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= collection.length) return;

    const removed = collection.remove(comp);
    const added = collection.add(removed, { at: targetIndex });

    const targetComp = Array.isArray(added) ? added[0] : added || comp;
    if (targetComp && editor) {
      editor.select(targetComp);
      editor.trigger('component:update', targetComp);
      editor.trigger('change:changesCount');
      editor.refresh?.();
    }
    refreshTree();
  };

  const handleDelete = (e: React.MouseEvent, node: LayerNodeData) => {
    e.stopPropagation();
    const comp = node.component;
    if (!comp) return;

    Modal.confirm({
      title: 'Xóa phần tử',
      content: `Bạn có chắc chắn muốn xóa "${node.name}" và tất cả phần tử con bên trong?`,
      okText: 'Xóa phần tử',
      okType: 'danger',
      cancelText: 'Hủy',
      centered: true,
      styles: {
        mask: { backdropFilter: 'blur(6px)', background: 'rgba(0, 0, 0, 0.75)' },
        header: { display: 'none' },
        content: {
          background: '#0F172A',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          borderRadius: 14,
          padding: '24px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.6)',
        },
      },
      onOk: () => {
        comp.remove();
        refreshTree();
        message.success('Đã xóa phần tử');
      },
    });
  };

  const handleTreeDrop = (e: React.DragEvent, targetNode: LayerNodeData) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOverNodeId(null);
    const draggedNode = dragNodeRef.current;
    dragNodeRef.current = null;

    if (!draggedNode || !targetNode || draggedNode.id === targetNode.id || !editor) return;

    const draggedComp = draggedNode.component;
    const targetComp = targetNode.component;
    if (!draggedComp || !targetComp) return;

    try {
      const draggedParent = draggedComp.parent?.();
      if (!draggedParent) return;

      const targetType = (targetNode.type || '').toLowerCase();
      const isLeaf = ['image', 'video', 'text'].includes(targetType);

      draggedParent.components().remove(draggedComp);

      if (!isLeaf && targetType !== targetNode.name.toLowerCase()) {
        const added = targetComp.append(draggedComp);
        const addedComp = Array.isArray(added) ? added[0] : added || draggedComp;
        editor.select(addedComp);
      } else {
        const targetParent = targetComp.parent?.();
        if (targetParent) {
          const targetCollection = targetParent.components();
          const targetIndex = targetCollection.indexOf(targetComp);
          const added = targetCollection.add(draggedComp, { at: targetIndex >= 0 ? targetIndex : undefined });
          const addedComp = Array.isArray(added) ? added[0] : added || draggedComp;
          editor.select(addedComp);
        } else {
          targetComp.append(draggedComp);
          editor.select(draggedComp);
        }
      }

      editor.trigger('component:update', targetComp);
      editor.trigger('change:changesCount');
      editor.refresh?.();
      refreshTree();
    } catch (err) {
      console.error('Error dropping inside Layers Tree:', err);
      refreshTree();
    }
  };

  const renderNode = (node: LayerNodeData, depth = 0) => {
    const isExpanded = expandedIds.has(node.id);
    const hasChildren = node.children && node.children.length > 0;
    const isRootWrapper = node.type === 'wrapper';

    return (
      <div key={node.id} style={{ display: 'flex', flexDirection: 'column' }}>
        <div
          onClick={() => handleSelectNode(node.component)}
          draggable={!isRootWrapper}
          onDragStart={(e) => {
            if (isRootWrapper) return;
            e.stopPropagation();
            dragNodeRef.current = node;
            e.dataTransfer.effectAllowed = 'move';
          }}
          onDragOver={(e) => {
            e.preventDefault();
            e.stopPropagation();
            if (dragNodeRef.current && dragNodeRef.current.id !== node.id) {
              setDragOverNodeId(node.id);
            }
          }}
          onDragLeave={(e) => {
            e.stopPropagation();
            if (dragOverNodeId === node.id) setDragOverNodeId(null);
          }}
          onDrop={(e) => handleTreeDrop(e, node)}
          style={{
            display: 'flex',
            alignItems: 'center',
            padding: '6px 8px',
            paddingLeft: 6, // Constant padding; indentation is handled cleanly by parent wrapper marginLeft
            background: dragOverNodeId === node.id
              ? 'rgba(16, 185, 129, 0.2)'
              : node.isSelected
              ? 'rgba(6, 182, 212, 0.15)'
              : 'transparent',
            borderLeft: dragOverNodeId === node.id
              ? '3px solid #10B981'
              : node.isSelected
              ? '3px solid #06B6D4'
              : '3px solid transparent',
            borderRadius: depth === 0 ? 6 : 4,
            cursor: isRootWrapper ? 'pointer' : 'grab',
            transition: 'all 0.15s',
            userSelect: 'none',
            position: 'relative',
            minWidth: 'fit-content',
            width: '100%',
          }}
          onMouseEnter={(e) => {
            if (!node.isSelected && dragOverNodeId !== node.id) e.currentTarget.style.background = 'rgba(255, 255, 255, 0.04)';
          }}
          onMouseLeave={(e) => {
            if (!node.isSelected && dragOverNodeId !== node.id) e.currentTarget.style.background = 'transparent';
          }}
        >
          {/* Chevron Toggle */}
          <div
            onClick={(e) => (hasChildren ? toggleExpand(e, node.id) : undefined)}
            style={{
              width: 18,
              height: 18,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: hasChildren ? '#94A3B8' : 'transparent',
              cursor: hasChildren ? 'pointer' : 'default',
              marginRight: 4,
              flexShrink: 0,
            }}
          >
            {hasChildren && (
              isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />
            )}
          </div>

          {/* Component Icon */}
          <div style={{ marginRight: 8, display: 'flex', alignItems: 'center', flexShrink: 0 }}>
            {getNodeIcon(node.type, node.name)}
          </div>

          {/* Component Name */}
          <div
            style={{
              flex: 1,
              minWidth: 70, // Ensures the component name NEVER shrinks or disappears on deep nesting
              fontSize: 12.5,
              fontWeight: node.isSelected ? 600 : 500,
              color: node.isHidden
                ? '#475569'
                : node.isSelected
                  ? '#FFFFFF'
                  : '#CBD5E1',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              textDecoration: node.isHidden ? 'line-through' : 'none',
              marginRight: 8,
            }}
            title={node.name}
          >
            {node.name}
          </div>

          {/* Quick Actions Bar (Visible on Hover / Selected) */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 3,
              marginLeft: 'auto',
              flexShrink: 0,
              opacity: node.isSelected || node.isHidden || node.isLocked ? 1 : 0.65,
            }}
            onMouseEnter={(e) => (e.currentTarget.style.opacity = '1')}
            onMouseLeave={(e) => {
              if (!node.isSelected && !node.isHidden && !node.isLocked) {
                e.currentTarget.style.opacity = '0.65';
              }
            }}
          >
            {!isRootWrapper && (
              <>
                {/* Visibility Toggle */}
                <Tooltip title={node.isHidden ? 'Hiện thẻ' : 'Ẩn thẻ'}>
                  <button
                    type="button"
                    onClick={(e) => handleToggleVisibility(e, node)}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: node.isHidden ? '#EF4444' : '#94A3B8',
                      cursor: 'pointer',
                      padding: 2,
                      display: 'flex',
                      alignItems: 'center',
                    }}
                  >
                    {node.isHidden ? <EyeOff size={13} /> : <Eye size={13} />}
                  </button>
                </Tooltip>

                {/* Lock Toggle */}
                <Tooltip title={node.isLocked ? 'Mở khóa' : 'Khóa thẻ'}>
                  <button
                    type="button"
                    onClick={(e) => handleToggleLock(e, node)}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: node.isLocked ? '#F59E0B' : '#94A3B8',
                      cursor: 'pointer',
                      padding: 2,
                      display: 'flex',
                      alignItems: 'center',
                    }}
                  >
                    {node.isLocked ? <Lock size={13} /> : <Unlock size={13} />}
                  </button>
                </Tooltip>

                {/* Move Up */}
                <Tooltip title="Lên trên">
                  <button
                    type="button"
                    onClick={(e) => handleMove(e, node, 'up')}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: '#94A3B8',
                      cursor: 'pointer',
                      padding: 2,
                      display: 'flex',
                      alignItems: 'center',
                    }}
                  >
                    <ArrowUp size={13} />
                  </button>
                </Tooltip>

                {/* Move Down */}
                <Tooltip title="Xuống dưới">
                  <button
                    type="button"
                    onClick={(e) => handleMove(e, node, 'down')}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: '#94A3B8',
                      cursor: 'pointer',
                      padding: 2,
                      display: 'flex',
                      alignItems: 'center',
                    }}
                  >
                    <ArrowDown size={13} />
                  </button>
                </Tooltip>

                {/* Delete Component */}
                <Tooltip title="Xóa thẻ">
                  <button
                    type="button"
                    onClick={(e) => handleDelete(e, node)}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: '#F87171',
                      cursor: 'pointer',
                      padding: 2,
                      display: 'flex',
                      alignItems: 'center',
                    }}
                  >
                    <Trash2 size={13} />
                  </button>
                </Tooltip>
              </>
            )}
          </div>
        </div>

        {/* Render Children if Expanded */}
        {hasChildren && isExpanded && (
          <div
            style={{
              position: 'relative',
              display: 'flex',
              flexDirection: 'column',
              borderLeft: '1px solid rgba(255, 255, 255, 0.12)',
              marginLeft: 14, // Indent 14px per hierarchy level (no quadratic double counting)
              paddingLeft: 2,
            }}
          >
            {node.children.map((child) => renderNode(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  if (!editor) {
    return (
      <div style={{ padding: 24, textAlign: 'center', color: '#64748B', fontSize: 13 }}>
        Đang khởi tạo GrapesJS Layers Tree...
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflowX: 'auto', overflowY: 'auto', paddingRight: 4 }}>
      <div
        style={{
          fontSize: 11,
          fontWeight: 700,
          color: '#64748B',
          textTransform: 'uppercase',
          letterSpacing: 0.5,
          marginBottom: 10,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <span>DOM Layers Hierarchy</span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {treeData.map((node) => renderNode(node, 0))}
      </div>
    </div>
  );
};
