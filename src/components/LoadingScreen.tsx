import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Sparkles } from 'lucide-react';

export function LoadingScreen() {
    const [isVisible, setIsVisible] = useState(true);
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        // Start progress animation immediately
        // Using a requestAnimationFrame to ensure the 0% render happens first
        requestAnimationFrame(() => {
            setProgress(100);
        });

        // Fade out after completion
        const timer = setTimeout(() => {
            setIsVisible(false);
        }, 2800); // Slightly longer than transition to ensure full bar is seen

        return () => clearTimeout(timer);
    }, []);

    if (!isVisible) return null;

    return (
        <div
            className={cn(
                "fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-background transition-opacity duration-700 ease-out",
                progress === 100 ? "delay-[2200ms] opacity-0 pointer-events-none" : "opacity-100"
            )}
        >
            <div className="relative flex flex-col items-center">
                {/* Logo Pulse */}
                <div className="relative w-20 h-20 mb-8 animate-float-slow">
                    <div className="absolute inset-0 bg-sapphire/20 blur-xl rounded-full animate-pulse" />
                    <div className="relative flex items-center justify-center w-full h-full bg-gradient-to-br from-sapphire to-sapphire-dark rounded-xl shadow-lg border border-sapphire-light/20 rotate-3">
                        <span className="text-4xl font-logo text-white drop-shadow-md select-none">S</span>
                    </div>
                    <Sparkles className="absolute -top-3 -right-3 w-5 h-5 text-amber-300 animate-bounce-gentle" />
                </div>

                {/* Loading Text */}
                <div className="h-6 mb-4 overflow-hidden">
                    <div className="text-sm font-medium tracking-[0.2em] text-muted-foreground/70 uppercase animate-pulse">
                        Initializing System
                    </div>
                </div>

                {/* Smooth Progress Bar */}
                <div className="w-64 h-1 bg-secondary/50 rounded-full overflow-hidden backdrop-blur-sm relative">
                    <div
                        className="absolute top-0 left-0 h-full bg-gradient-to-r from-sapphire via-sapphire-light to-sapphire bg-[length:200%_100%] animate-shimmer"
                        style={{
                            width: `${progress}%`,
                            transition: 'width 2.5s cubic-bezier(0.22, 1, 0.36, 1)'
                        }}
                    />
                </div>
            </div>
        </div>
    );
}
