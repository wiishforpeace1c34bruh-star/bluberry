import { memo, useMemo } from 'react';
import type { Zone } from '@/types/zone';
import { LazyZoneCard } from './LazyZoneCard';
import { ChevronDown, Heart } from 'lucide-react';
import { useState } from 'react';
import { usePerformanceMode } from '@/hooks/usePerformanceMode';

interface LazyZoneGridProps {
  zones: Zone[];
  title: string;
  onZoneClick: (zone: Zone) => void;
  defaultOpen?: boolean;
  favorites?: number[];
  onToggleFavorite?: (gameId: number) => void;
  showFavoritesOnly?: boolean;
}

export const LazyZoneGrid = memo(function LazyZoneGrid({
  zones,
  title,
  onZoneClick,
  defaultOpen = true,
  favorites = [],
  onToggleFavorite,
  showFavoritesOnly = false,
}: LazyZoneGridProps) {
  const { performanceMode } = usePerformanceMode();
  const [isOpen, setIsOpen] = useState(defaultOpen);

  const displayZones = useMemo(() => {
    if (showFavoritesOnly) {
      return zones.filter((zone) => favorites.includes(zone.id));
    }
    return zones;
  }, [zones, favorites, showFavoritesOnly]);

  const isFavoritesSection = title.toLowerCase().includes('favorite');

  return (
    <div className="mb-10">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 mb-6 group transition-opacity duration-200 hover:opacity-80"
      >
        {isFavoritesSection && (
          <Heart className="w-4 h-4 text-rose-400" fill="currentColor" />
        )}
        <h2 className="text-xs font-semibold text-foreground/80 uppercase tracking-widest">
          {title}
        </h2>
        <span className="text-xs text-muted-foreground/60">
          ({displayZones.length})
        </span>
        <ChevronDown 
          className={`
            w-4 h-4 text-muted-foreground/60 
            transition-transform duration-200
            ${isOpen ? 'rotate-0' : '-rotate-90'}
          `} 
        />
      </button>
      
      {isOpen && (
        <>
          {displayZones.length === 0 ? (
            <div className="text-center py-16 bg-secondary/20 rounded-2xl border border-border/20">
              <p className="text-sm text-muted-foreground">
                {showFavoritesOnly ? 'No favorites yet. Click the heart on any game to add it!' : 'No games found'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {displayZones.map((zone, index) => (
                <LazyZoneCard
                  key={zone.id}
                  zone={zone}
                  onClick={onZoneClick}
                  index={index}
                  isFavorite={favorites.includes(zone.id)}
                  onToggleFavorite={onToggleFavorite}
                />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
});

