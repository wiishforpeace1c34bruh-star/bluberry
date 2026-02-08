import React from 'react';
import { useWorldEvent } from '@/context/WorldEventContext';
import { Moon, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

export function WorldEventOverlay() {
    const { activeEvent, eventTimeLeft } = useWorldEvent();

    if (activeEvent === 'none') return null;

    return (
        <div className="fixed top-20 right-8 z-[100] animate-in slide-in-from-right-12 duration-1000">
            <div className={cn(
                "flex items-center gap-4 p-4 rounded-2xl bg-black/60 backdrop-blur-3xl border border-white/10 shadow-[0_0_40px_rgba(0,0,0,0.5)] overflow-hidden transition-all duration-700",
                activeEvent === 'eclipse' && "border-purple-500/30 shadow-[0_0_30px_rgba(168,85,247,0.2)]"
            )}>
                {/* Animated Background Pulse */}
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 via-transparent to-transparent animate-shimmer" />

                <div className="relative flex items-center gap-4">
                    <div className={cn(
                        "w-12 h-12 rounded-xl flex items-center justify-center relative",
                        activeEvent === 'eclipse' ? "bg-purple-500/20 text-purple-400" : "bg-primary/20 text-primary"
                    )}>
                        <div className="absolute inset-0 animate-ping opacity-20 bg-current rounded-xl" />
                        <Moon className="w-6 h-6 animate-pulse" />
                    </div>

                    <div className="flex flex-col">
                        <div className="flex items-center gap-2">
                            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-purple-400 animate-pulse">Live Event</span>
                            <AlertCircle className="w-3 h-3 text-purple-400" />
                        </div>
                        <h3 className="text-sm font-black text-white uppercase tracking-wider">The Eclipse</h3>
                        <span className="text-[9px] font-bold text-white/40 uppercase tracking-widest mt-0.5">
                            Ends in {Math.floor(eventTimeLeft / 60)}:{(eventTimeLeft % 60).toString().padStart(2, '0')}
                        </span>
                    </div>
                </div>

                {/* Progress Bar */}
                <div className="absolute bottom-0 left-0 h-0.5 bg-purple-500/50" style={{ width: `${(eventTimeLeft / 120) * 100}%` }} />
            </div>
        </div>
    );
}
