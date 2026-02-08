import { forwardRef } from 'react';
import type { Zone } from '@/types/zone';
import { ZoneCard } from './ZoneCard';
import { ChevronDown } from 'lucide-react';
import { useState } from 'react';

interface ZoneGridProps {
  zones: Zone[];
  title: string;
  onZoneClick: (zone: Zone) => void;
  defaultOpen?: boolean;
}

export const ZoneGrid = forwardRef<HTMLDivElement, ZoneGridProps>(function ZoneGrid(
  { zones, title, onZoneClick, defaultOpen = true },
  ref
) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div ref={ref} className="mb-10">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 mb-6 group"
      >
        <h2 className="text-xs font-semibold text-foreground/80 uppercase tracking-widest">
          {title}
        </h2>
        <span className="text-xs text-muted-foreground/60">
          ({zones.length})
        </span>
        <ChevronDown 
          className={`w-4 h-4 text-muted-foreground/60 transition-transform duration-300 ${
            isOpen ? 'rotate-0' : '-rotate-90'
          }`} 
        />
      </button>
      
      {isOpen && (
        <>
          {zones.length === 0 ? (
            <div className="text-center py-16 bg-secondary/20 rounded-2xl border border-border/20">
              <p className="text-sm text-muted-foreground">No games found</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {zones.map((zone, index) => (
                <ZoneCard 
                  key={zone.id} 
                  zone={zone} 
                  onClick={onZoneClick}
                  index={index}
                />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
});
