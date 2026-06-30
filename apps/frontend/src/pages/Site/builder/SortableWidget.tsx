import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Button, Space, Popconfirm } from 'antd';
import { DeleteOutlined, DragOutlined } from '@ant-design/icons';
import WidgetRenderer from './WidgetRenderer';

interface SortableWidgetProps {
  id: string;
  widget: any;
  isActive: boolean;
  onSelect: () => void;
  onDelete: () => void;
}

const SortableWidget: React.FC<SortableWidgetProps> = ({ id, widget, isActive, onSelect, onDelete }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
    position: 'relative',
    zIndex: isDragging ? 100 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} onClick={onSelect}>
      <WidgetRenderer type={widget.type} config={widget.contentConfig} isActive={isActive} />
      
      {/* Floating Action Menu for Active Widget */}
      {isActive && !isDragging && (
        <div style={{ position: 'absolute', top: 8, right: 8, zIndex: 20 }}>
          <Space.Compact>
            <Button
              type="primary"
              icon={<DragOutlined />}
              style={{ cursor: 'grab' }}
              {...attributes}
              {...listeners}
            />
            <Popconfirm title="Delete this widget?" onConfirm={(e) => {
              e?.stopPropagation();
              onDelete();
            }}>
              <Button type="primary" danger icon={<DeleteOutlined />} onClick={e => e.stopPropagation()} />
            </Popconfirm>
          </Space.Compact>
        </div>
      )}
    </div>
  );
};

export default SortableWidget;
