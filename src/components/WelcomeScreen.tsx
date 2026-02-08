import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight, Users, Play, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

interface WelcomeScreenProps {
    onEnter: () => void;
}

export function WelcomeScreen({ onEnter }: WelcomeScreenProps) {
    const [isReady, setIsReady] = useState(false);
    const [isEntering, setIsEntering] = useState(false);
    const [stats, setStats] = useState({ online: 0, games: 0 });

    useEffect(() => {
        setIsReady(true); // Ensure it's ready immediately to avoid "empty blue" state
        const timer = setTimeout(() => { }, 1200);
        setStats({
            online: Math.floor(Math.random() * 50) + 1240,
            games: 842
        });
        return () => clearTimeout(timer);
    }, []);

    const handleEnter = () => {
        setIsEntering(true);
        // Slower transition (2s) for dissolve impact
        setTimeout(onEnter, 2000);
    };

    return (
        <div className={cn(
            "fixed inset-0 z-[10000] flex flex-col items-center justify-center overflow-hidden transition-all duration-[2000ms] cubic-bezier(0.16, 1, 0.3, 1) bg-[#0a0c1a]",
            isEntering ? "opacity-0 blur-[100px] scale-[1.5] pointer-events-none" : "opacity-100"
        )}>
            {/* Warp Drive Trails */}
            {isEntering && (
                <div className="absolute inset-0 z-[5] overflow-hidden">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300%] h-[300%] bg-[radial-gradient(ellipse_at_center,transparent_0%,white_0.1%,transparent_0.5%)] opacity-20 animate-[ping_1s_linear_infinite]" />
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300%] h-[1px] bg-white opacity-40 shadow-[0_0_20px_white] animate-[pulse_0.1s_linear_infinite]" />
                </div>
            )}

            {/* Cinematic Background Atmosphere */}
            <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-20%] left-[-10%] w-[80%] h-[80%] rounded-full bg-primary/20 blur-[150px] animate-pulse-slow" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[70%] h-[70%] rounded-full bg-blue-600/10 blur-[150px] animate-pulse-slow" style={{ animationDelay: '3s' }} />

                {/* Slow Drift Rays */}
                <div className="absolute inset-0 opacity-20 [mask-image:radial-gradient(ellipse_at_center,#000_30%,transparent_70%)]">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[200%] h-[200%] bg-[conic-gradient(from_0deg,transparent_0%,var(--primary)_5%,transparent_10%)] animate-[spin_40s_linear_infinite]" />
                </div>
            </div>

            {/* Floating Glass Widgets */}
            <div className={cn(
                "absolute inset-0 z-10 transition-all duration-1000 delay-700",
                isReady && !isEntering ? "opacity-100 scale-100" : "opacity-0 scale-95"
            )}>
                <div className="absolute top-[20%] left-[15%] animate-float">
                    <div className="glass-premium p-5 rounded-[2rem] flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 flex items-center justify-center border border-emerald-500/20">
                            <Users className="w-6 h-6 text-emerald-400" />
                        </div>
                        <div className="text-left">
                            <div className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em]">Active Now</div>
                            <div className="text-xl font-black text-white tracking-tighter">{stats.online.toLocaleString()}</div>
                        </div>
                    </div>
                </div>

                <div className="absolute bottom-[25%] right-[15%] animate-float-delayed">
                    <div className="glass-premium p-5 rounded-[2rem] flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-primary/20 flex items-center justify-center border border-primary/20">
                            <Play className="w-6 h-6 text-primary" />
                        </div>
                        <div className="text-left">
                            <div className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em]">Experiences</div>
                            <div className="text-xl font-black text-white tracking-tighter">{stats.games}</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Stage */}
            <div className={cn(
                "relative z-20 flex flex-col items-center justify-center p-8 max-w-4xl w-full text-center transition-all duration-1000",
                isEntering && "translate-y-[-50px]"
            )}>
                <div className={cn(
                    "transition-all duration-[1500ms] transform",
                    isReady ? "translate-y-0 opacity-100 scale-100 blur-0" : "translate-y-12 opacity-0 scale-95 blur-md"
                )}>
                    {/* The Logo: Deep Glass Impact */}
                    <div className="relative w-36 h-36 mb-16 group mx-auto">
                        <div className="absolute inset-[-30%] rounded-[4rem] bg-primary/30 blur-[60px] group-hover:bg-primary/50 transition-all duration-1000" />
                        <div className="relative w-full h-full rounded-[3rem] glass-premium p-1.5 transition-all duration-700 group-hover:scale-105">
                            <div className="w-full h-full rounded-[2.7rem] bg-[#0c0e1a] flex items-center justify-center relative overflow-hidden">
                                <span className="text-7xl font-logo text-white select-none relative z-10 transition-transform duration-700 group-hover:scale-110">S</span>
                                <div className="absolute inset-0 bg-gradient-to-t from-primary/30 to-transparent" />
                                <div className="absolute top-0 left-0 w-full h-full bg-[linear-gradient(45deg,transparent,rgba(255,255,255,0.1),transparent)] -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                            </div>
                        </div>
                    </div>

                    <h1 className="text-8xl md:text-[10rem] font-black tracking-tighter mb-8 select-none leading-none">
                        <span className="text-transparent bg-clip-text bg-gradient-to-b from-white via-white to-white/20">Sapphire</span>
                    </h1>

                    <p className="text-xl md:text-2xl text-white/40 font-light tracking-[0.1em] max-w-2xl leading-relaxed select-none mb-16 mx-auto">
                        DISCOVER THE <span className="text-white font-black">NEXT GENERATION</span> OF INTERACTIVE GAMING.
                    </p>

                    <div className={cn(
                        "transition-all duration-1000 delay-500",
                        isReady ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
                    )}>
                        <Button
                            onClick={handleEnter}
                            className="group relative px-24 py-12 text-xl font-black tracking-[0.4em] uppercase overflow-hidden rounded-[3rem] bg-white text-black hover:bg-white/95 transition-all duration-700 shadow-[0_40px_80px_-20px_rgba(255,255,255,0.4)] hover:scale-105 active:scale-95 border-b-4 border-black/10"
                        >
                            <span className="relative z-10 flex items-center gap-6">
                                Enter Realm
                                <ArrowRight className="w-6 h-6 transition-transform duration-700 group-hover:translate-x-4" />
                            </span>
                            {/* Liquid Wave Effect */}
                            <div className="absolute inset-0 bg-gradient-to-r from-primary/0 via-primary/20 to-primary/0 -translate-x-full group-hover:translate-x-full duration-[1500ms] transition-transform" />
                        </Button>
                    </div>
                </div>
            </div>

            {/* Footer Tag */}
            <div className={cn(
                "absolute bottom-12 flex items-center gap-4 px-8 py-3 rounded-full glass-premium border border-white/10 transition-all duration-1000 delay-1000",
                isReady ? "opacity-40 translate-y-0" : "opacity-0 translate-y-4"
            )}>
                <Sparkles className="w-4 h-4 text-primary" />
                <span className="text-[11px] font-bold text-white uppercase tracking-[0.6em]">Prime Protocol 4.2</span>
            </div>

            {/* Dissolve Mask Hook */}
            {isEntering && (
                <div className="absolute inset-0 z-[10001] bg-[#0a0c1a] animate-fade-in pointer-events-none opacity-0" />
            )}
        </div>
    );
}
