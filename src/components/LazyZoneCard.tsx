import { useState, memo, useCallback } from 'react';
import { Play, Heart } from 'lucide-react';
import type { Zone } from '@/types/zone';
import { COVER_URL } from '@/hooks/useZones';
import { useLazyLoad } from '@/hooks/useLazyLoad';
import { usePerformanceMode } from '@/hooks/usePerformanceMode';

interface LazyZoneCardProps {
  zone: Zone;
  onClick: (zone: Zone) => void;
  index?: number;
  isFavorite?: boolean;
  onToggleFavorite?: (gameId: number) => void;
}

export const LazyZoneCard = memo(function LazyZoneCard({
  zone,
  onClick,
  index = 0,
  isFavorite = false,
  onToggleFavorite,
}: LazyZoneCardProps) {
  const { performanceMode } = usePerformanceMode();
  const { ref, shouldRender } = useLazyLoad<HTMLDivElement>({
    rootMargin: '100px 0px',
  });
  
  const [imageLoaded, setImageLoaded] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  
  const coverUrl = zone.cover.replace('{COVER_URL}', COVER_URL);
  
  const handleFavoriteClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleFavorite?.(zone.id);
  }, [zone.id, onToggleFavorite]);

  // Calculate stagger delay (max 300ms) - only on first render
  const animationDelay = performanceMode ? 0 : Math.min(index * 25, 300);

  return (
    <div
      ref={ref}
      className={`
        group relative overflow-hidden rounded-2xl bg-card/90 
        border border-border/20 cursor-pointer
        transition-opacity duration-300 ease-out
        ${shouldRender ? 'opacity-100' : 'opacity-0'}
      `}
      style={{ 
        animationDelay: shouldRender ? `${animationDelay}ms` : '0ms',
      }}
      onClick={() => onClick(zone)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Image Container - fixed aspect ratio prevents layout shift */}
      <div className="aspect-[16/10] relative overflow-hidden rounded-t-2xl bg-secondary/30">
        {/* Skeleton - always present, fades out when image loads */}
        <div 
          className={`
            absolute inset-0 bg-secondary/50 
            transition-opacity duration-300
            ${imageLoaded ? 'opacity-0' : 'opacity-100'}
            ${!performanceMode && !imageLoaded ? 'animate-pulse-subtle' : ''}
          `} 
        />
        
        {/* Image - load when shouldRender is true */}
        {shouldRender && (
          <img
            src={coverUrl}
            alt={zone.name}
            className={`
              absolute inset-0 w-full h-full object-cover
              transition-all duration-300 ease-out
              ${imageLoaded ? 'opacity-100' : 'opacity-0'}
              ${!performanceMode && isHovered ? 'scale-105 brightness-110' : 'scale-100 brightness-100'}
            `}
            onLoad={() => setImageLoaded(true)}
            loading="lazy"
            decoding="async"
          />
        )}
        
        {/* Gradient overlay */}
        <div 
          className={`
            absolute inset-0 
            bg-gradient-to-t from-card via-card/30 to-transparent
            transition-opacity duration-300
            ${isHovered ? 'opacity-90' : 'opacity-60'}
          `}
        />
        
        {/* Favorite button */}
        <button
          onClick={handleFavoriteClick}
          className={`
            absolute top-3 right-3 z-10
            w-8 h-8 rounded-full
            flex items-center justify-center
            backdrop-blur-sm
            transition-all duration-200
            ${isFavorite 
              ? 'bg-rose-500/90 text-white' 
              : 'bg-black/40 text-white/70 hover:bg-black/60 hover:text-white'
            }
            ${isHovered || isFavorite ? 'opacity-100 scale-100' : 'opacity-0 scale-90'}
          `}
        >
          <Heart 
            className="w-4 h-4 transition-transform duration-200" 
            fill={isFavorite ? 'currentColor' : 'none'} 
          />
        </button>
        
        {/* Play button - centered on hover */}
        <div 
          className={`
            absolute inset-0 flex items-center justify-center
            transition-all duration-300
            ${isHovered ? 'opacity-100' : 'opacity-0'}
          `}
        >
          <div 
            className={`
              w-14 h-14 rounded-full
              bg-gradient-to-br from-primary to-primary/80
              backdrop-blur-sm
              flex items-center justify-center
              shadow-2xl shadow-primary/40
              transition-transform duration-300
              ${isHovered ? 'scale-100' : 'scale-75'}
            `}
          >
            <Play className="w-6 h-6 text-primary-foreground ml-0.5" fill="currentColor" />
          </div>
        </div>
        
        {/* Featured badge */}
        {zone.featured && (
          <div className="absolute top-3 left-3 px-2.5 py-1 rounded-lg bg-gradient-to-r from-primary to-primary/80 backdrop-blur-sm text-primary-foreground text-[10px] font-semibold uppercase tracking-wide shadow-lg shadow-primary/20">
            Featured
          </div>
        )}
      </div>
      
      {/* Title & Tags - fixed height prevents layout shift */}
      <div className="p-3 h-[52px]">
        <h3 
          className={`
            text-sm font-semibold text-foreground truncate
            transition-colors duration-200
            ${isHovered ? 'text-primary' : ''}
          `}
        >
          {zone.name}
        </h3>
        
        {/* Tags */}
        {zone.special && zone.special.length > 0 && (
          <p className="text-[11px] text-muted-foreground mt-0.5 truncate">
            {zone.special.slice(0, 2).join(' • ')}
          </p>
        )}
      </div>
      
      {/* Border glow on hover */}
      {!performanceMode && (
        <div 
          className={`
            absolute inset-0 rounded-2xl pointer-events-none
            transition-all duration-300
            ${isHovered 
              ? 'shadow-lg shadow-primary/10 ring-1 ring-primary/20' 
              : 'ring-0 shadow-none'
            }
          `}
        />
      )}
    </div>
  );
});
