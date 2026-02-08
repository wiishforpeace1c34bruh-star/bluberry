import React, { useState, useEffect, useCallback } from 'react';

interface Shockwave {
    id: number;
    x: number;
    y: number;
}

export function ShockwaveSystem() {
    const [ripples, setRipples] = useState<Shockwave[]>([]);

    const addRipple = useCallback((e: MouseEvent) => {
        // Only trigger on certain elements or generally if needed
        const target = e.target as HTMLElement;
        const isInteractive = target.closest('button, a, [role="button"]');

        if (isInteractive) {
            const newRipple = {
                id: Date.now(),
                x: e.clientX,
                y: e.clientY,
            };
            setRipples(prev => [...prev, newRipple]);

            // Cleanup
            setTimeout(() => {
                setRipples(prev => prev.filter(r => r.id !== newRipple.id));
            }, 1000);
        }
    }, []);

    useEffect(() => {
        window.addEventListener('click', addRipple);
        return () => window.removeEventListener('click', addRipple);
    }, [addRipple]);

    return (
        <div className="fixed inset-0 pointer-events-none z-[5] overflow-hidden">
            {ripples.map(r => (
                <div
                    key={r.id}
                    className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full border border-primary/30 animate-shockwave"
                    style={{
                        left: r.x,
                        top: r.y,
                        width: '2px',
                        height: '2px',
                    }}
                />
            ))}
        </div>
    );
}
