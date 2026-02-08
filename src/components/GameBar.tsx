import { useState, memo } from 'react';
import { Zone } from '@/types/zone';
import { cn } from '@/lib/utils';
import { Gamepad2, Star, Plus } from 'lucide-react';
import { useSound } from '@/context/SoundContext';

export function GameBar({
    favorites,
    onOpenGame
}: {
    favorites: Zone[];
    onOpenGame: (zone: Zone) => void;
}) {
    const { playHover, playClick } = useSound();

    if (favorites.length === 0) return null;

    return (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[8000] animate-in slide-in-from-bottom-8 duration-500">
            <div className="bg-black/40 backdrop-blur-3xl border border-white/10 rounded-full p-2 flex items-center gap-2 shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
                <div className="px-4 py-2 border-r border-white/5 mr-1 flex items-center gap-2">
                    <Star className="w-4 h-4 text-primary fill-primary/20" />
                    <span className="text-[10px] font-black text-white uppercase tracking-widest">Dock</span>
                </div>

                <div className="flex items-center gap-2 px-2 max-w-[400px] overflow-x-auto scrollbar-hide">
                    {favorites.map((zone) => (
                        <button
                            key={zone.id}
                            onClick={() => {
                                playClick();
                                onOpenGame(zone);
                            }}
                            onMouseEnter={playHover}
                            className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-primary hover:scale-110 active:scale-95 transition-all duration-300 group overflow-hidden relative"
                            title={zone.name}
                        >
                            <img
                                src={zone.cover || `https://api.dicebear.com/7.x/shapes/svg?seed=${zone.id}`}
                                className="w-full h-full object-cover p-1 group-hover:scale-125 transition-transform"
                                alt={zone.name}
                            />
                            <div className="absolute inset-x-0 bottom-0 h-1 bg-white scale-x-0 group-hover:scale-x-100 transition-transform origin-center" />
                        </button>
                    ))}

                    <button className="w-12 h-12 rounded-2xl border border-dashed border-white/20 flex items-center justify-center hover:border-white/40 hover:bg-white/5 transition-all group">
                        <Plus className="w-4 h-4 text-muted-foreground group-hover:text-white" />
                    </button>
                </div>

                <div className="px-4 ml-2 opacity-20 hidden md:block">
                    <div className="w-px h-8 bg-white" />
                </div>
            </div>
        </div>
    );
}
