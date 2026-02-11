
import React, { useRef, useEffect } from 'react';

export const Starfield = () => {
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

        const stars: { x: number; y: number; z: number; size: number }[] = [];
        const numStars = 800; // Dense starfield
        const depth = 2000;

        for (let i = 0; i < numStars; i++) {
            stars.push({
                x: Math.random() * width - width / 2,
                y: Math.random() * height - height / 2,
                z: Math.random() * depth,
                size: Math.random() * 2
            });
        }

        let animationId: number;
        // Mouse interaction
        let mouseX = 0;
        let mouseY = 0;

        const handleMouseMove = (e: MouseEvent) => {
            mouseX = (e.clientX - width / 2) * 0.1;
            mouseY = (e.clientY - height / 2) * 0.1;
        };
        window.addEventListener('mousemove', handleMouseMove);

        const render = () => {
            ctx.fillStyle = '#000000';
            ctx.fillRect(0, 0, width, height);

            // Nebula pass
            /*
            const gradient = ctx.createRadialGradient(width / 2, height / 2, 0, width / 2, height / 2, width);
            gradient.addColorStop(0, '#0a0c1a'); // Dark Blue Center
            gradient.addColorStop(1, '#000000'); // Black Edge
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, width, height);
            */

            stars.forEach((star) => {
                // Move star towards viewer
                star.z -= 2; // Speed

                // Parallax offset
                const pX = star.x - mouseX * (depth / star.z);
                const pY = star.y - mouseY * (depth / star.z);

                if (star.z <= 0) {
                    star.z = depth;
                    star.x = Math.random() * width - width / 2;
                    star.y = Math.random() * height - height / 2;
                }

                const k = 128.0 / star.z;
                const px = (pX) * k + width / 2;
                const py = (pY) * k + height / 2;

                if (px >= 0 && px <= width && py >= 0 && py <= height) {
                    const size = (1 - star.z / depth) * 2.5;
                    const alpha = (1 - star.z / depth);

                    ctx.beginPath();
                    ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
                    ctx.arc(px, py, size, 0, Math.PI * 2);
                    ctx.fill();
                }
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
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('resize', handleResize);
            cancelAnimationFrame(animationId);
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            className="absolute inset-0 pointer-events-none z-0"
            style={{ background: 'transparent' }}
        />
    );
};
