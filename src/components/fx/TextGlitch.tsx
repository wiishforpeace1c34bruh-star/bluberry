
import React from 'react';
import { cn } from '@/lib/utils';

/**
 * TextGlitch Component (Liquid Crystal Variant)
 * 
 * Re-imagined for the Sapphire Prism theme. 
 * Features highly fluid, continuous spectral shifts and breathing refraction.
 */
export const TextGlitch = ({ text, className }: { text: string; className?: string }) => {
    return (
        <div className={cn("relative inline-block group", className)}>
            {/* Main Text with continuous breathing glow */}
            <span className="relative z-10 transition-all duration-1000 group-hover:text-white animate-pulse-slow">
                {text}
            </span>

            {/* Fluid Refraction Layers - Continuous Animation */}
            <span className="absolute top-0 left-0 -z-10 w-full h-full text-blue-400/30 blur-[2px] animate-[prism-shift-1_4s_infinite_ease-in-out]" aria-hidden="true" style={{ mixBlendMode: 'screen' }}>
                {text}
            </span>
            <span className="absolute top-0 left-0 -z-10 w-full h-full text-cyan-500/30 blur-[4px] animate-[prism-shift-2_6s_infinite_ease-in-out]" aria-hidden="true" style={{ mixBlendMode: 'screen' }}>
                {text}
            </span>

            {/* Prism Sheen / Reflection - Continuous */}
            <div className="absolute inset-0 -z-20 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full animate-[shimmer_3s_infinite_linear] pointer-events-none" />

            {/* Spectral Haze */}
            <div className="absolute inset-[-20%] -z-30 bg-blue-500/5 blur-[40px] rounded-full animate-pulse-slow" />
        </div>
    );
};
