import { useState, useEffect, useRef } from 'react';
import { Zone } from '@/types/zone';
import { ChevronLeft, ChevronRight, Play, Star } from 'lucide-react';
import { cn } from '@/lib/utils';
import { COVER_URL } from '@/hooks/useZones';

interface FeaturedCarouselProps {
    zones: Zone[];
    onZoneClick: (zone: Zone) => void;
}

export function FeaturedCarousel({ zones, onZoneClick }: FeaturedCarouselProps) {
    const [activeIndex, setActiveIndex] = useState(0);
    const [isPaused, setIsPaused] = useState(false);
    const touchStartX = useRef<number | null>(null);

    // Auto-play
    useEffect(() => {
        if (isPaused) return;
        const interval = setInterval(() => {
            setActiveIndex((prev) => (prev + 1) % zones.length);
        }, 5000);
        return () => clearInterval(interval);
    }, [zones.length, isPaused]);

    const handlePrev = () => {
        setActiveIndex((prev) => (prev - 1 + zones.length) % zones.length);
    };

    const handleNext = () => {
        setActiveIndex((prev) => (prev + 1) % zones.length);
    };

    if (zones.length === 0) return null;

    return (
        <div
            className="relative w-full max-w-5xl mx-auto h-[400px] mb-12 perspective-1000 group"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
        >
            {/* Background Glow */}
            <div className="absolute inset-0 bg-primary/20 blur-[100px] rounded-full opacity-20 pointer-events-none" />

            <div className="relative w-full h-full flex items-center justify-center transform-style-3d">
                {zones.map((zone, index) => {
                    // Calculate relative position to active index
                    // Handle wrap-around for smooth infinite feel visually
                    let offset = index - activeIndex;
                    if (offset < -Math.floor(zones.length / 2)) offset += zones.length;
                    if (offset > Math.floor(zones.length / 2)) offset -= zones.length;

                    // Only render visible items for performance
                    if (Math.abs(offset) > 2) return null;

                    const isActive = offset === 0;
                    const isPrev = offset === -1;
                    const isNext = offset === 1;

                    return (
                        <div
                            key={zone.id}
                            className={cn(
                                "absolute transition-all duration-700 cubic-bezier(0.23, 1, 0.32, 1) cursor-pointer",
                                isActive ? "z-30 w-[600px] h-[350px] opacity-100 translate-x-0 scale-100" :
                                    isPrev ? "z-20 w-[600px] h-[350px] opacity-60 -translate-x-[150px] scale-85 hover:opacity-80 brightness-50 blur-[1px]" :
                                        isNext ? "z-20 w-[600px] h-[350px] opacity-60 translate-x-[150px] scale-85 hover:opacity-80 brightness-50 blur-[1px]" :
                                            "z-10 w-[600px] h-[350px] opacity-0 scale-75"
                            )}
                            style={{
                                transform: `translateX(${offset * 60}%) scale(${1 - Math.abs(offset) * 0.15}) translateZ(${isActive ? 0 : -100}px) rotateY(${offset * -15}deg)`,
                            }}
                            onClick={() => isActive ? onZoneClick(zone) : offset < 0 ? handlePrev() : handleNext()}
                        >
                            {/* Card Content */}
                            <div className={cn(
                                "w-full h-full rounded-2xl overflow-hidden relative shadow-2xl border border-white/10",
                                isActive ? "shadow-primary/30 ring-1 ring-primary/50" : ""
                            )}>
                                <img
                                    src={zone.cover.replace('{COVER_URL}', COVER_URL)}
                                    alt={zone.name}
                                    className="w-full h-full object-cover"
                                    loading="eager"
                                />

                                {/* Overlay Gradient */}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />

                                {/* Content (Active Only) */}
                                <div className={cn(
                                    "absolute bottom-0 left-0 p-8 w-full transition-all duration-500",
                                    isActive ? "opacity-100 translate-y-0 delay-100" : "opacity-0 translate-y-4"
                                )}>
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className="px-3 py-1 rounded-full bg-primary/20 text-primary border border-primary/30 text-xs font-bold uppercase tracking-wider backdrop-blur-md flex items-center gap-1.5">
                                            <Star className="w-3 h-3 fill-current" />
                                            Featured
                                        </span>
                                        {zone.special && (
                                            <span className="px-3 py-1 rounded-full bg-white/10 text-white border border-white/10 text-xs font-bold uppercase tracking-wider backdrop-blur-md">
                                                {zone.special[0]}
                                            </span>
                                        )}
                                    </div>

                                    <h2 className="text-4xl font-black text-white mb-2 drop-shadow-xl tracking-tight">
                                        {zone.name}
                                    </h2>

                                    <p className="text-white/70 line-clamp-2 max-w-lg mb-6 text-sm">
                                        Experience one of the top-rated games on Sapphire.
                                        {zone.author && ` Created by ${zone.author}.`}
                                    </p>

                                    <button
                                        className="px-8 py-3 rounded-full bg-white text-black font-bold flex items-center gap-2 hover:bg-primary hover:text-white transition-all duration-300 hover:scale-105 active:scale-95 shadow-lg shadow-white/10 hover:shadow-primary/40 group/btn"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onZoneClick(zone);
                                        }}
                                    >
                                        <Play className="w-5 h-5 fill-current" />
                                        Play Now
                                    </button>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Navigation Buttons */}
            <button
                onClick={handlePrev}
                className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-black/40 border border-white/10 text-white backdrop-blur-md flex items-center justify-center hover:bg-white/10 hover:scale-110 active:scale-95 transition-all z-40 opacity-0 group-hover:opacity-100"
            >
                <ChevronLeft className="w-6 h-6" />
            </button>
            <button
                onClick={handleNext}
                className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-black/40 border border-white/10 text-white backdrop-blur-md flex items-center justify-center hover:bg-white/10 hover:scale-110 active:scale-95 transition-all z-40 opacity-0 group-hover:opacity-100"
            >
                <ChevronRight className="w-6 h-6" />
            </button>

            {/* Dots */}
            <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 flex gap-2">
                {zones.map((_, i) => (
                    <button
                        key={i}
                        className={cn(
                            "w-2 h-2 rounded-full transition-all duration-300",
                            i === activeIndex ? "w-8 bg-primary shadow-glow" : "bg-white/20 hover:bg-white/40"
                        )}
                        onClick={() => setActiveIndex(i)}
                    />
                ))}
            </div>
        </div>
    );
}
