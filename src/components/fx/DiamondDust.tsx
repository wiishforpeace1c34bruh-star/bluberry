
import React, { useRef, useEffect } from 'react';

/**
 * DiamondDust Component
 * 
 * Creates a slow-moving, high-depth bokeh particle system.
 * Particles shimmer and vary in opacity to create a "Diamond Dust" effect.
 */
export const DiamondDust = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let width = window.innerWidth;
        let height = window.innerHeight;
        canvas.width = width;
        canvas.height = height;

        interface Particle {
            x: number;
            y: number;
            z: number;
            size: number;
            opacity: number;
            speedX: number;
            speedY: number;
            shimmer: number;
        }

        const particles: Particle[] = [];
        const numParticles = 150;

        for (let i = 0; i < numParticles; i++) {
            particles.push({
                x: Math.random() * width,
                y: Math.random() * height,
                z: Math.random() * 1000,
                size: 2 + Math.random() * 5,
                opacity: Math.random(),
                speedX: (Math.random() - 0.5) * 0.2,
                speedY: (Math.random() - 0.5) * 0.1,
                shimmer: Math.random() * 0.02
            });
        }

        let animationId: number;
        const render = () => {
            ctx.clearRect(0, 0, width, height);

            particles.forEach(p => {
                p.x += p.speedX;
                p.y += p.speedY;
                p.opacity += p.shimmer;

                if (p.opacity > 0.8 || p.opacity < 0.1) p.shimmer = -p.shimmer;

                // Wrap around
                if (p.x > width) p.x = 0;
                if (p.x < 0) p.x = width;
                if (p.y > height) p.y = 0;
                if (p.y < 0) p.y = height;

                // Draw Bokeh circle
                const alpha = p.opacity * (1 - p.z / 1000);
                const blur = p.z / 200; // Deep particles are blurrier

                ctx.beginPath();
                const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * blur);
                grad.addColorStop(0, `rgba(180, 220, 255, ${alpha})`);
                grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
                ctx.fillStyle = grad;
                ctx.arc(p.x, p.y, p.size * blur, 0, Math.PI * 2);
                ctx.fill();
            });

            animationId = requestAnimationFrame(render);
        };

        render();

        const handleResize = () => {
            width = window.innerWidth;
            height = window.innerHeight;
            canvas.width = width;
            canvas.height = height;
        };
        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
            cancelAnimationFrame(animationId);
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            className="fixed inset-0 z-[5] pointer-events-none opacity-60"
        />
    );
};
