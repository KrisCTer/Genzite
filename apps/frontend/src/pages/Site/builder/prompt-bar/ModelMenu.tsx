import { forwardRef } from 'react';
import { Sparkles, Wand2, Brain, Check } from 'lucide-react';

interface ModelMenuProps {
  model?: string;
  onSelectModel: (model: string) => void;
}

const ModelMenu = forwardRef<HTMLDivElement, ModelMenuProps>(({ model, onSelectModel }, ref) => {
  return (
    <div className="ai-model-menu" ref={ref}>
      <button
        className={`ai-model-item ${(!model || model === 'gemini-2.5-flash') ? 'selected' : ''}`}
        onClick={() => onSelectModel('gemini-2.5-flash')}
      >
        <div className="ai-model-item-icon">
          <Sparkles size={16} />
        </div>
        <div className="ai-model-item-content">
          <div className="ai-model-item-title">2.5 Flash</div>
          <div className="ai-model-item-desc">Fast speed, optimized for basic page generation and design tasks.</div>
        </div>
        {(!model || model === 'gemini-2.5-flash') && <Check size={16} className="ai-model-item-check" />}
      </button>

      <button
        className={`ai-model-item ${model === 'gemini-2.0-pro' ? 'selected' : ''}`}
        onClick={() => onSelectModel('gemini-2.0-pro')}
      >
        <div className="ai-model-item-icon">
          <Sparkles size={16} />
        </div>
        <div className="ai-model-item-content">
          <div className="ai-model-item-title">2.0 Pro</div>
          <div className="ai-model-item-desc">Highest quality, powerful reasoning for complex designs.</div>
        </div>
        {model === 'gemini-2.0-pro' && <Check size={16} className="ai-model-item-check" />}
      </button>

      <button
        className={`ai-model-item ${model === 'llama-3.3-70b-versatile' ? 'selected' : ''}`}
        onClick={() => onSelectModel('llama-3.3-70b-versatile')}
      >
        <div className="ai-model-item-icon">
          <Wand2 size={16} />
        </div>
        <div className="ai-model-item-content">
          <div className="ai-model-item-title">Llama 3.3</div>
          <div className="ai-model-item-desc">Free open-source model, suitable for testing and content creation.</div>
        </div>
        {model === 'llama-3.3-70b-versatile' && <Check size={16} className="ai-model-item-check" />}
      </button>

      <button
        className={`ai-model-item ${model === 'deepseek-chat' ? 'selected' : ''}`}
        onClick={() => onSelectModel('deepseek-chat')}
      >
        <div className="ai-model-item-icon">
          <Brain size={16} />
        </div>
        <div className="ai-model-item-content">
          <div className="ai-model-item-title">DeepSeek</div>
          <div className="ai-model-item-desc">Smart alternative model with impressive performance and natural responses.</div>
        </div>
        {model === 'deepseek-chat' && <Check size={16} className="ai-model-item-check" />}
      </button>
    </div>
  );
});

ModelMenu.displayName = 'ModelMenu';

export default ModelMenu;
