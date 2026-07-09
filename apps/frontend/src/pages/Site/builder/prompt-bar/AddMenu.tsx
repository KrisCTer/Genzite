import { forwardRef } from 'react';
import { FileImage, Globe, Sparkles } from 'lucide-react';

interface AddMenuProps {
  onClose: () => void;
}

const AddMenu = forwardRef<HTMLDivElement, AddMenuProps>(({ onClose }, ref) => {
  return (
    <div className="ai-add-menu" ref={ref}>
      <button className="ai-add-item" type="button" onClick={onClose}>
        <FileImage size={16} />
        <span>Upload file</span>
      </button>
      <button className="ai-add-item" type="button" onClick={onClose}>
        <Globe size={16} />
        <span>Website URL</span>
      </button>
      <button className="ai-add-item" type="button" onClick={onClose}>
        <Sparkles size={16} />
        <span>Improve prompt</span>
      </button>
    </div>
  );
});

AddMenu.displayName = 'AddMenu';

export default AddMenu;
