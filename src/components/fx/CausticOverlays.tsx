
import React, { useRef, useEffect } from 'react';

/**
 * CausticOverlays Component
 * 
 * Generates a light refraction pattern (caustics) using moving noise.
 * Simulates light passing through clear gemstones or water.
 */
export const CausticOverlays = () => {
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

        let time = 0;
        let animationId: number;

        const render = () => {
            time += 0.005;
            ctx.clearRect(0, 0, width, height);

            ctx.globalCompositeOperation = 'screen';
            ctx.filter = 'blur(40px)';

            // Draw large refractive blobs
            for (let i = 0; i < 4; i++) {
                const x = width / 2 + Math.cos(time + i * Math.PI / 2) * (width * 0.3);
                const y = height / 2 + Math.sin(time * 0.8 + i) * (height * 0.2);

                const grad = ctx.createRadialGradient(x, y, 0, x, y, width * 0.5);
                grad.addColorStop(0, 'rgba(59, 130, 246, 0.15)');
                grad.addColorStop(1, 'rgba(0, 0, 0, 0)');

                ctx.fillStyle = grad;
                ctx.beginPath();
                ctx.arc(x, y, width * 0.5, 0, Math.PI * 2);
                ctx.fill();
            }

            // High-frequency "shimmer" layer
            ctx.filter = 'blur(10px)';
            for (let i = 0; i < 8; i++) {
                const x = (Math.sin(time * 0.5 + i) * 0.5 + 0.5) * width;
                const y = (Math.cos(time * 0.3 + i * 2) * 0.5 + 0.5) * height;

                ctx.fillStyle = 'rgba(255, 255, 255, 0.03)';
                ctx.beginPath();
                ctx.arc(x, y, width * 0.1, 0, Math.PI * 2);
                ctx.fill();
            }

            ctx.globalCompositeOperation = 'source-over';
            ctx.filter = 'none';

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
            className="fixed inset-0 z-10 pointer-events-none opacity-40 mix-blend-screen"
        />
    );
};
