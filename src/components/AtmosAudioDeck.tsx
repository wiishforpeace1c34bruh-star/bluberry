import React from 'react';
import { useAtmos } from '@/context/AtmosContext';
import { Play, Pause, SkipForward, Music, Volume2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export function AtmosAudioDeck() {
    const { currentTrack, isPlaying, volume, togglePlay, setVolume, nextTrack } = useAtmos();

    return (
        <div className="fixed bottom-6 left-6 z-50 animate-fade-in">
            <div className="group relative flex items-center gap-4 p-3 rounded-2xl bg-black/40 backdrop-blur-3xl border border-white/10 hover:border-primary/30 transition-all duration-500 overflow-hidden">
                {/* Progress Glow */}
                <div className="absolute inset-x-0 bottom-0 h-0.5 bg-gradient-to-r from-transparent via-primary to-transparent opacity-20" />

                {/* Album Art / Icon */}
                <div className={cn(
                    "w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20 transition-all duration-700",
                    isPlaying && "animate-pulse shadow-[0_0_20px_-5px_rgba(var(--primary),0.5)]"
                )}>
                    <Music className={cn("w-6 h-6 text-primary", isPlaying && "animate-bounce")} />
                </div>

                {/* Info */}
                <div className="flex flex-col min-w-[120px]">
                    <span className="text-[10px] font-black text-primary uppercase tracking-widest">{currentTrack.mood}</span>
                    <span className="text-xs font-bold text-white/90 truncate max-w-[150px]">{currentTrack.name}</span>
                </div>

                {/* Controls */}
                <div className="flex items-center gap-2 pr-2">
                    <button
                        onClick={togglePlay}
                        className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-white transition-colors"
                    >
                        {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
                    </button>
                    <button
                        onClick={nextTrack}
                        className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-white transition-colors"
                    >
                        <SkipForward className="w-4 h-4" />
                    </button>

                    {/* Subtle Volume Indicator */}
                    <div className="flex flex-col items-center gap-1 ml-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Volume2 className="w-3 h-3 text-white/40" />
                        <input
                            type="range"
                            min="0"
                            max="1"
                            step="0.01"
                            value={volume}
                            onChange={(e) => setVolume(parseFloat(e.target.value))}
                            className="w-16 h-1 bg-white/10 rounded-full appearance-none cursor-pointer accent-primary"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
