
import React, { useRef, useState } from 'react';
import { cn } from '@/lib/utils';

interface MagneticButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    children: React.ReactNode;
    strength?: number; // How far it pulls (pixels)
}

export const MagneticButton = ({ children, className, strength = 50, ...props }: MagneticButtonProps) => {
    const btnRef = useRef<HTMLButtonElement>(null);
    const [position, setPosition] = useState({ x: 0, y: 0 });

    const handleMouseMove = (e: React.MouseEvent) => {
        const btn = btnRef.current;
        if (!btn) return;

        const rect = btn.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;

        const deltaX = e.clientX - centerX;
        const deltaY = e.clientY - centerY;

        const dist = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
        const maxDist = Math.max(rect.width, rect.height) * 2;

        if (dist < maxDist) {
            // Apply magnetic pull
            const pull = 0.4; // Force
            setPosition({ x: deltaX * pull, y: deltaY * pull });
        } else {
            setPosition({ x: 0, y: 0 });
        }
    };

    const handleMouseLeave = () => {
        setPosition({ x: 0, y: 0 });
    };

    return (
        <button
            ref={btnRef}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            style={{
                transform: `translate(${position.x}px, ${position.y}px)`,
                transition: position.x === 0 && position.y === 0 ? 'transform 0.5s cubic-bezier(0.25, 1, 0.5, 1)' : 'transform 0.1s ease-out'
            }}
            className={cn("relative will-change-transform", className)}
            {...props}
        >
            {children}
        </button>
    );
};
