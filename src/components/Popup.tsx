import { X } from 'lucide-react';

interface PopupProps {
  isOpen: boolean;
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}

export function Popup({ isOpen, title, onClose, children }: PopupProps) {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-background/95 backdrop-blur-sm flex items-center justify-center z-[2000] p-4 animate-fade-in"
      onClick={onClose}
    >
      <div 
        className="bg-card/98 backdrop-blur-xl border border-border/20 rounded-3xl w-full max-w-lg max-h-[85vh] overflow-hidden flex flex-col animate-fade-in-scale shadow-2xl shadow-background/50"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-border/15 flex justify-between items-center">
          <h3 className="text-lg font-semibold text-foreground">{title}</h3>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-secondary/50 flex items-center justify-center transition-all duration-300 hover:bg-secondary hover:scale-105"
          >
            <X className="w-4 h-4 text-foreground" />
          </button>
        </div>
        
        {/* Content */}
        <div className="p-6 overflow-y-auto text-foreground scrollbar-thin">
          {children}
        </div>
      </div>
    </div>
  );
}
