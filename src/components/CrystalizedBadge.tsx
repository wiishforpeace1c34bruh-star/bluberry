import React, { useRef, useState } from 'react';
import { cn } from '@/lib/utils';

interface CrystalizedBadgeProps {
    name: string;
    icon: string;
    gradient: { from: string; to: string };
    size?: 'sm' | 'md' | 'lg';
    className?: string;
}

export function CrystalizedBadge({ name, icon, gradient, size = 'md', className }: CrystalizedBadgeProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const [rotate, setRotate] = useState({ x: 0, y: 0 });

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!containerRef.current) return;
        const rect = containerRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        const rotateX = (centerY - y) / 5;
        const rotateY = (x - centerX) / 5;
        setRotate({ x: rotateX, y: rotateY });
    };

    const handleMouseLeave = () => {
        setRotate({ x: 0, y: 0 });
    };

    const sizeClasses = {
        sm: 'w-8 h-8 p-1',
        md: 'w-12 h-12 p-1.5',
        lg: 'w-20 h-20 p-3'
    };

    return (
        <div
            ref={containerRef}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            className={cn(
                "perspective-500",
                className
            )}
        >
            <div
                className={cn(
                    "relative rounded-xl transition-all duration-200 ease-out border border-white/20 bg-white/5 backdrop-blur-xl group overflow-hidden shadow-lg",
                    sizeClasses[size]
                )}
                style={{
                    transform: `rotateX(${rotate.x}deg) rotateY(${rotate.y}deg)`,
                    transformStyle: 'preserve-3d'
                }}
            >
                {/* Glow Layer */}
                <div
                    className="absolute inset-0 opacity-40 group-hover:opacity-100 transition-opacity duration-500"
                    style={{
                        background: `linear-gradient(135deg, ${gradient.from}, ${gradient.to})`,
                        filter: 'blur(10px)',
                        transform: 'translateZ(-10px)'
                    }}
                />

                {/* Shine Layer */}
                <div className="absolute inset-0 bg-gradient-to-tr from-white/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                {/* Content */}
                <div
                    className="relative z-10 w-full h-full flex items-center justify-center"
                    style={{ transform: 'translateZ(20px)' }}
                >
                    <div
                        className="w-full h-full text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]"
                        dangerouslySetInnerHTML={{ __html: icon }}
                    />
                </div>

                {/* Crystal Bevel */}
                <div className="absolute inset-0 border border-white/30 rounded-xl" />
            </div>
        </div>
    );
}
