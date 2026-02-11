
import { useState, useEffect } from 'react';
import { ArrowRight, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { SapphirePrism } from './fx/SapphirePrism';
import { DiamondDust } from './fx/DiamondDust';
import { CausticOverlays } from './fx/CausticOverlays';
import { TextGlitch } from './fx/TextGlitch';

interface WelcomeScreenProps {
    onEnter: () => void;
}

export function WelcomeScreen({ onEnter }: WelcomeScreenProps) {
    const [isReady, setIsReady] = useState(false);
    const [isEntering, setIsEntering] = useState(false);

    useEffect(() => {
        const initialDelay = setTimeout(() => setIsReady(true), 100);
        return () => clearTimeout(initialDelay);
    }, []);

    const handleEnter = () => {
        setIsEntering(true);
        setTimeout(onEnter, 2500);
    };

    return (
        <div className={cn(
            "fixed inset-0 z-[10000] flex flex-col items-center justify-center overflow-hidden transition-all duration-[2500ms] cubic-bezier(0.16, 1, 0.3, 1) bg-[#02040a]",
            isEntering ? "opacity-0 scale-[1.2] blur-[50px] pointer-events-none" : "opacity-100"
        )}>

            {/* Graphics Layers (Preserved) */}
            <SapphirePrism />
            <DiamondDust />
            <CausticOverlays />

            {/* Deep Ambient Shadows */}
            <div className="absolute inset-0 pointer-events-none z-0 bg-[radial-gradient(circle_at_center,transparent_0%,#02040a_140%)] opacity-80" />

            {/* Main Stage */}
            <div className={cn(
                "relative z-30 flex flex-col items-center justify-center p-8 w-full transition-all duration-1000",
                isEntering && "translate-y-[-20px]"
            )}>

                <div className={cn(
                    "transition-all duration-[2000ms] transform",
                    isReady ? "translate-y-0 opacity-100 scale-100" : "translate-y-20 opacity-0 scale-90 blur-xl"
                )}>
                    <div className="relative mb-16 group mx-auto">
                        {/* Continuous Breathing Brilliance Layer */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[250%] h-[250%] bg-blue-500/10 blur-[180px] animate-pulse-slow pointer-events-none" />

                        <div className="relative z-10">
                            <h1 className="text-[9rem] md:text-[14rem] font-black tracking-tighter mb-4 select-none leading-[0.8] flex flex-col items-center">
                                <span className="sr-only">Sapphire</span>

                                {/* Fluid Refractive Title */}
                                <TextGlitch
                                    text="SAPPHIRE"
                                    className="text-white drop-shadow-[0_0_80px_rgba(59,130,246,0.5)] tracking-[-0.05em]"
                                />
                            </h1>

                            <div className={cn(
                                "flex items-center justify-center gap-6 transition-all duration-1000 delay-700",
                                isReady ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
                            )}>
                                <div className="h-[1px] w-12 bg-gradient-to-r from-transparent to-blue-500/50" />
                                <p className="text-sm md:text-base text-blue-300/40 font-bold tracking-[0.8em] uppercase whitespace-nowrap animate-pulse">
                                    Digital Clarity &middot; Infinite Quality
                                </p>
                                <div className="h-[1px] w-12 bg-gradient-to-l from-transparent to-blue-500/50" />
                            </div>
                        </div>
                    </div>

                    {/* New Focus Button Animation (Non-Magnetic) */}
                    <div className={cn(
                        "transition-all duration-1000 delay-1000",
                        isReady ? "translate-y-0 opacity-100 scale-100" : "translate-y-12 opacity-0 scale-95"
                    )}>
                        <button
                            onClick={handleEnter}
                            className="group relative px-28 py-10 overflow-hidden rounded-full transition-all duration-700"
                        >
                            {/* Inner Glass Layer */}
                            <div className="absolute inset-0 bg-white/5 border border-white/10 backdrop-blur-xl group-hover:bg-blue-500/10 group-hover:border-blue-400/40 transition-all duration-700 rounded-full" />

                            {/* Energy Focus Rings */}
                            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700">
                                <div className="absolute inset-0 border border-blue-400/20 rounded-full scale-100 group-hover:scale-110 transition-transform duration-1000" />
                                <div className="absolute inset-0 border border-white/10 rounded-full scale-100 group-hover:scale-125 transition-transform duration-1000 delay-100" />
                            </div>

                            {/* Button Text */}
                            <span className="relative z-10 flex items-center gap-6 text-2xl font-black tracking-[0.6em] uppercase text-white transition-all duration-500 group-hover:tracking-[0.8em] group-hover:text-blue-200">
                                Enter
                                <ArrowRight className="w-6 h-6 transition-transform duration-500 group-hover:translate-x-4" />
                            </span>

                            {/* Hover Sheen Sweep */}
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-[shimmer_2s_infinite_linear] pointer-events-none" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Decorative Corner Elements */}
            <div className={cn(
                "absolute top-12 left-12 flex items-center gap-4 transition-all duration-1000 delay-[1500ms]",
                isReady ? "opacity-30 translate-y-0" : "opacity-0 -translate-y-4"
            )}>
                <div className="h-[40px] w-[1px] bg-gradient-to-b from-blue-500 to-transparent" />
                <div className="flex flex-col">
                    <span className="text-[10px] font-mono text-blue-300">SYSTEM.VER: 4.0.2</span>
                    <span className="text-[10px] font-mono text-blue-200/50 uppercase tracking-widest">Initialization.Complete</span>
                </div>
            </div>

            {/* Bottom Status Branding */}
            <div className={cn(
                "absolute bottom-12 right-12 flex items-center gap-6 px-10 py-3 rounded-full glass-premium border border-white/5 transition-all duration-1000 delay-[1400ms]",
                isReady ? "opacity-30 translate-y-0 hover:opacity-100" : "opacity-0 translate-y-4"
            )}>
                <Sparkles className="w-4 h-4 text-blue-400 animate-pulse" />
                <span className="text-[11px] font-black text-white uppercase tracking-[0.8em]">Sapphire /// Protocol</span>
            </div>
        </div>
    );
}
