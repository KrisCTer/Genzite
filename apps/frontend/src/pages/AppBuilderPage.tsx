import React, { useState } from 'react';
import { Card, Button, EmptyState, useToast, cn } from '@genzite/shared-ui';
import { Layout, PanelTop, Image, CreditCard, PanelBottom, Trash2 } from 'lucide-react';

interface Widget {
  id: string;
  type: 'Header' | 'Hero' | 'Card' | 'Footer';
  content: string;
  color: string;
}

export const AppBuilderPage: React.FC = () => {
  const { toast } = useToast();

  const [canvasWidgets, setCanvasWidgets] = useState<Widget[]>([
    { id: 'w1', type: 'Header', content: 'Genzite Portal', color: 'from-teal-600 to-teal-700 text-white' },
    { id: 'w2', type: 'Hero', content: 'Create Next-Gen Visual Interfaces Instantly', color: 'from-stone-800 to-stone-900 text-white' }
  ]);
  const [canvasBg, setCanvasBg] = useState<'light' | 'dark' | 'grid'>('grid');

  const addWidget = (type: 'Header' | 'Hero' | 'Card' | 'Footer') => {
    const defaultContents = {
      Header: 'New Navigation Bar',
      Hero: 'Discover Our Brand Value',
      Card: 'Feature Highlight Card',
      Footer: '© 2026 Genzite. All rights reserved.'
    };
    const colors = {
      Header: 'from-teal-600 to-teal-700 text-white',
      Hero: 'from-stone-800 to-stone-900 text-white',
      Card: 'from-amber-600 to-amber-700 text-white',
      Footer: 'from-stone-700 to-stone-800 text-stone-200'
    };
    const newWidget: Widget = {
      id: Date.now().toString(),
      type,
      content: defaultContents[type],
      color: colors[type]
    };
    setCanvasWidgets([...canvasWidgets, newWidget]);
    toast({
      title: 'Widget Added',
      description: `Successfully added ${type} widget to the canvas.`,
      variant: 'success'
    });
  };

  const removeWidget = (id: string) => {
    const widgetToDelete = canvasWidgets.find(w => w.id === id);
    setCanvasWidgets(canvasWidgets.filter(w => w.id !== id));
    if (widgetToDelete) {
      toast({
        title: 'Widget Removed',
        description: `Removed ${widgetToDelete.type} widget from the canvas.`,
        variant: 'info'
      });
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
      {/* Left Controls & Sidebar widgets */}
      <div className="space-y-6">
        <Card>
          <Card.Header>
            <h3 className="text-xs font-semibold text-[var(--gz-text)] uppercase tracking-wider">Canvas Background</h3>
          </Card.Header>
          <Card.Body>
            <div className="grid grid-cols-3 gap-2">
              <Button
                variant={canvasBg === 'light' ? 'primary' : 'secondary'}
                size="sm"
                onClick={() => setCanvasBg('light')}
              >
                Light
              </Button>
              <Button
                variant={canvasBg === 'dark' ? 'primary' : 'secondary'}
                size="sm"
                onClick={() => setCanvasBg('dark')}
              >
                Dark
              </Button>
              <Button
                variant={canvasBg === 'grid' ? 'primary' : 'secondary'}
                size="sm"
                onClick={() => setCanvasBg('grid')}
              >
                Grid
              </Button>
            </div>
          </Card.Body>
        </Card>

        <Card>
          <Card.Header>
            <h3 className="text-xs font-semibold text-[var(--gz-text)] uppercase tracking-wider">Widgets Toolbox</h3>
          </Card.Header>
          <Card.Body className="space-y-3">
            {[
              { type: 'Header', desc: 'Standard Header bar with links', icon: PanelTop },
              { type: 'Hero', desc: 'Hero section with text banner', icon: Image },
              { type: 'Card', desc: 'Feature highlight showcase card', icon: CreditCard },
              { type: 'Footer', desc: 'Copyright note footer segment', icon: PanelBottom }
            ].map(w => {
              const Icon = w.icon;
              return (
                <button
                  key={w.type}
                  onClick={() => addWidget(w.type as any)}
                  className="w-full flex items-center gap-3 p-3 bg-[var(--gz-surface-raised)] border border-[var(--gz-border)] hover:border-[var(--gz-primary-500)] hover:bg-[var(--gz-surface-sunken)] rounded-[var(--gz-radius-lg)] transition-all duration-200 text-left group cursor-pointer"
                >
                  <div className="p-2 rounded-[var(--gz-radius-md)] bg-[var(--gz-surface-sunken)] text-[var(--gz-text-muted)] group-hover:text-[var(--gz-primary-600)] group-hover:bg-[var(--gz-primary-50)] transition-colors">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-[var(--gz-text)] leading-none mb-1">{w.type}</h4>
                    <span className="text-[10px] text-[var(--gz-text-secondary)]">{w.desc}</span>
                  </div>
                </button>
              );
            })}
          </Card.Body>
        </Card>
      </div>

      {/* Right Canvas Area */}
      <div className="lg:col-span-3">
        <div
          className={cn(
            'w-full min-h-[500px] rounded-[var(--gz-radius-xl)] p-6 transition-all duration-300 relative border',
            canvasBg === 'light' && 'bg-[var(--gz-surface-sunken)] border-[var(--gz-border)] text-[var(--gz-text)]',
            canvasBg === 'dark' && 'bg-stone-900 border-stone-800 text-stone-100',
            canvasBg === 'grid' && 'bg-[var(--gz-surface)] bg-[linear-gradient(to_right,var(--gz-border)_1px,transparent_1px),linear-gradient(to_bottom,var(--gz-border)_1px,transparent_1px)] bg-[size:24px_24px] border-[var(--gz-border)] text-[var(--gz-text)]'
          )}
        >
          {canvasWidgets.length === 0 ? (
            <div className="absolute inset-0 flex items-center justify-center p-4">
              <EmptyState
                icon={<Layout className="w-12 h-12 text-[var(--gz-text-muted)]" />}
                title="Your visual layout is empty."
                description="Select visual modules from the toolbox on the left to stack elements."
              />
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[var(--gz-border)]">
                <span className="text-xs font-semibold uppercase tracking-wider text-[var(--gz-text-secondary)]">Live Workspace Preview</span>
                <span className="text-[10px] px-2 py-0.5 rounded-[var(--gz-radius-full)] bg-[var(--gz-primary-50)] text-[var(--gz-primary-700)] border border-[var(--gz-primary-100)] font-mono">{canvasWidgets.length} elements</span>
              </div>
              {canvasWidgets.map((widget, idx) => (
                <div
                  key={widget.id}
                  className={`group relative p-6 rounded-[var(--gz-radius-lg)] bg-gradient-to-r ${widget.color} shadow-[var(--gz-shadow-xs)] flex items-center justify-between transition-all duration-300 hover:scale-[1.01]`}
                >
                  <div className="text-left">
                    <span className="text-[10px] font-bold tracking-widest opacity-60 uppercase block mb-1">
                      [{idx + 1}] {widget.type}
                    </span>
                    <span className="text-sm font-semibold">{widget.content}</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeWidget(widget.id)}
                    className="opacity-0 group-hover:opacity-100 p-1.5 bg-black/10 hover:bg-black/20 text-current hover:scale-105"
                    leftIcon={<Trash2 className="w-4 h-4" />}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
