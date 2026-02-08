import { Zone } from '@/types/zone';
import { cn } from '@/lib/utils';
import { Play, TrendingUp, Users, Heart, Share2 } from 'lucide-react';
import { useState } from 'react';
import { HolographicProfileHover } from './profile/HolographicProfileHover';

interface ZoneCardProps {
  zone: Zone;
  onClick: () => void;
  isFavorite?: boolean;
  onToggleFavorite?: (e: React.MouseEvent) => void;
}

export function ZoneCard({ zone, onClick, isFavorite, onToggleFavorite }: ZoneCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className="group relative h-[420px] rounded-[2.5rem] overflow-hidden transition-all duration-700 cursor-pointer animate-fade-in"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
    >
      {/* Main Surface - Glass Base */}
      <div className={cn(
        "absolute inset-0 bg-card/40 backdrop-blur-2xl border border-white/5 transition-all duration-700 group-hover:border-primary/40 group-hover:bg-card/60",
        isHovered ? "scale-95 translate-y-2 shadow-2xl" : "scale-100 translate-y-0"
      )} />

      {/* Card Content Container */}
      <div className="relative h-full flex flex-col p-4">
        {/* Thumbnail Layer */}
        <div className="relative w-full h-[65%] rounded-[2rem] overflow-hidden shadow-2xl">
          <img
            src={zone.cover || '/placeholder.svg'}
            alt={zone.name}
            className={cn(
              "w-full h-full object-cover transition-transform duration-[1500ms] ease-out",
              isHovered ? "scale-110 rotate-1" : "scale-100"
            )}
          />

          {/* Overlay Gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-60" />

          {/* Floating Info Badges */}
          <div className="absolute top-4 left-4 flex gap-2">
            {zone.featured && (
              <div className="glass-premium px-3 py-1.5 rounded-full flex items-center gap-2 border border-primary/40 shadow-glow-sm">
                <TrendingUp className="w-3.5 h-3.5 text-primary" />
                <span className="text-[10px] font-black text-white uppercase tracking-wider">Featured</span>
              </div>
            )}
          </div>

          <button
            onClick={onToggleFavorite}
            className={cn(
              "absolute top-4 right-4 p-3 rounded-2xl glass-premium border border-white/10 transition-all duration-500",
              isFavorite ? "bg-primary text-white scale-110 shadow-glow-sm" : "text-white/40 hover:text-white"
            )}
          >
            <Heart className={cn("w-5 h-5", isFavorite && "fill-white")} />
          </button>

          {/* Play Button - Centered Hover Effect */}
          <div className={cn(
            "absolute inset-0 flex items-center justify-center transition-all duration-700",
            isHovered ? "opacity-100 scale-100" : "opacity-0 scale-50"
          )}>
            <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center shadow-[0_0_30px_rgba(59,130,246,0.5)]">
              <Play className="w-8 h-8 text-white fill-white ml-1" />
            </div>
          </div>
        </div>

        {/* Info Area - Rising Text Logic */}
        <div className="flex-1 flex flex-col justify-end p-4 relative z-10">
          <div className={cn(
            "transition-all duration-700 ease-out transform",
            isHovered ? "-translate-y-8" : "translate-y-0"
          )}>
            {/* Tags */}
            <div className="flex flex-wrap gap-2 mb-3">
              {zone.special?.slice(0, 2).map((tag, i) => (
                <span key={i} className="text-[9px] font-black text-primary/60 uppercase tracking-widest bg-primary/5 px-2 py-0.5 rounded-md">
                  {tag}
                </span>
              ))}
            </div>

            {/* Title - Rising Effect */}
            <h3 className="text-2xl font-black text-white tracking-tight leading-tight mb-2 group-hover:text-primary transition-colors duration-500">
              {zone.name}
            </h3>

            {/* Description - Appears on Hover */}
            <p className={cn(
              "text-sm text-muted-foreground line-clamp-2 transition-all duration-700",
              isHovered ? "opacity-100 max-h-12 translate-y-0" : "opacity-0 max-h-0 translate-y-4"
            )}>
              {zone.description}
            </p>
          </div>

          {/* Stats Footer - Glass Pockets */}
          <div className="flex items-center justify-between mt-auto">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <Users className="w-3.5 h-3.5" />
                <span className="text-[10px] font-bold tracking-tighter">1.2k</span>
              </div>
            </div>

            <div className="flex items-center gap-1">
              {/* Identity mini-avatar if exists */}
              <div className="w-6 h-6 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center">
                <Share2 className="w-3 h-3 text-white/20" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Premium Glow Highlight */}
      <div className={cn(
        "absolute -inset-[2px] rounded-[2.6rem] bg-gradient-to-br from-primary/30 to-transparent opacity-0 transition-opacity duration-700 pointer-events-none",
        isHovered && "opacity-100"
      )} />
    </div>
  );
}
