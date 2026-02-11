
import React, { useRef, useEffect } from 'react';

/**
 * SapphirePrism Component
 * 
 * Draws a collection of procedurally generated 3D crystalline shards
 * using Canvas 2D. Shards rotate and refract light based on mouse position.
 */
export const SapphirePrism = () => {
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

        // Mouse tracking for parallax and rotation influence
        const mouse = { x: 0, y: 0, targetX: 0, targetY: 0 };
        const handleMouseMove = (e: MouseEvent) => {
            mouse.targetX = (e.clientX - width / 2) / (width / 2);
            mouse.targetY = (e.clientY - height / 2) / (height / 2);
        };
        window.addEventListener('mousemove', handleMouseMove);

        // Core Prism Geometry
        interface Shard {
            points: [number, number, number][]; // 3D coordinates
            faces: number[][]; // Indices into points
            color: string;
            rotation: { x: number; y: number; z: number };
            pos: { x: number; y: number; z: number };
            velocity: { x: number; y: number; z: number };
            scale: number;
        }

        const shards: Shard[] = [];
        const numShards = 12;

        // Helper to create a crystal shard (distorted prism)
        const createShard = (x: number, y: number, z: number): Shard => {
            const size = 50 + Math.random() * 150;
            const h = size * 2;
            const w = size;

            return {
                points: [
                    [0, -h / 2, 0], // Top tip
                    [w / 2, 0, w / 2], [w / 2, 0, -w / 2], [-w / 2, 0, -w / 2], [-w / 2, 0, w / 2], // Middle belt
                    [0, h / 2, 0]  // Bottom tip
                ],
                faces: [
                    [0, 1, 2], [0, 2, 3], [0, 3, 4], [0, 4, 1], // Top pyramid
                    [5, 2, 1], [5, 3, 2], [5, 4, 3], [5, 1, 4]  // Bottom pyramid
                ],
                pos: { x, y, z },
                rotation: { x: Math.random() * Math.PI, y: Math.random() * Math.PI, z: Math.random() * Math.PI },
                velocity: { x: (Math.random() - 0.5) * 0.002, y: (Math.random() - 0.5) * 0.002, z: (Math.random() - 0.5) * 0.002 },
                scale: 0.5 + Math.random(),
                color: `hsla(${210 + Math.random() * 30}, 80%, 60%, ${0.1 + Math.random() * 0.2})`
            };
        };

        for (let i = 0; i < numShards; i++) {
            shards.push(createShard(
                (Math.random() - 0.5) * width * 0.8,
                (Math.random() - 0.5) * height * 0.8,
                Math.random() * 500 - 250
            ));
        }

        // Projection mapping
        const project = (x: number, y: number, z: number, rotation: { x: number; y: number; z: number }, pos: { x: number; y: number; z: number }) => {
            // Rotate points
            let nx = x, ny = y, nz = z;

            // X rotation
            const sX = Math.sin(rotation.x), cX = Math.cos(rotation.x);
            const ty1 = ny * cX - nz * sX;
            const tz1 = ny * sX + nz * cX;
            ny = ty1; nz = tz1;

            // Y rotation
            const sY = Math.sin(rotation.y), cY = Math.cos(rotation.y);
            const tx2 = nx * cY + nz * sY;
            const tz2 = -nx * sY + nz * cY;
            nx = tx2; nz = tz2;

            // Perspective projection
            const pScale = 800 / (800 + nz + pos.z);
            return {
                x: (nx + pos.x) * pScale + width / 2,
                y: (ny + pos.y) * pScale + height / 2,
                z: nz + pos.z
            };
        };

        let animationId: number;
        const render = () => {
            // Background Clear with depth gradient
            const grad = ctx.createRadialGradient(width / 2, height / 2, 0, width / 2, height / 2, width / 1.2);
            grad.addColorStop(0, '#0a1025');
            grad.addColorStop(1, '#02040a');
            ctx.fillStyle = grad;
            ctx.fillRect(0, 0, width, height);

            // Smooth mouse transition
            mouse.x += (mouse.targetX - mouse.x) * 0.05;
            mouse.y += (mouse.targetY - mouse.y) * 0.05;

            // Sort shards by depth for basic painter's algorithm
            shards.sort((a, b) => b.pos.z - a.pos.z);

            shards.forEach(shard => {
                // Update rotation based on mouse and time
                shard.rotation.x += shard.velocity.x + mouse.y * 0.01;
                shard.rotation.y += shard.velocity.y + mouse.x * 0.01;
                shard.rotation.z += shard.velocity.z;

                // Draw faces
                shard.faces.forEach(faceIndices => {
                    const projectedPoints = faceIndices.map(idx => {
                        const p = shard.points[idx];
                        return project(p[0], p[1], p[2], shard.rotation, shard.pos);
                    });

                    // Simple lighting based on face normal (simplified)
                    ctx.beginPath();
                    ctx.moveTo(projectedPoints[0].x, projectedPoints[0].y);
                    for (let i = 1; i < projectedPoints.length; i++) {
                        ctx.lineTo(projectedPoints[i].x, projectedPoints[i].y);
                    }
                    ctx.closePath();

                    // Dynamic Gradient for refraction effect
                    const faceGrad = ctx.createLinearGradient(
                        projectedPoints[0].x, projectedPoints[0].y,
                        projectedPoints[2].x, projectedPoints[2].y
                    );
                    faceGrad.addColorStop(0, shard.color);
                    faceGrad.addColorStop(0.5, 'rgba(255, 255, 255, 0.1)');
                    faceGrad.addColorStop(1, shard.color);

                    ctx.fillStyle = faceGrad;
                    ctx.fill();

                    // Glow edges
                    ctx.strokeStyle = 'rgba(100, 200, 255, 0.2)';
                    ctx.lineWidth = 1;
                    ctx.stroke();
                });
            });

            // Extra flair: Lens Flare / Sheen
            ctx.globalCompositeOperation = 'screen';
            const sheenGrad = ctx.createRadialGradient(
                width / 2 + mouse.x * 200, height / 2 + mouse.y * 200, 0,
                width / 2 + mouse.x * 200, height / 2 + mouse.y * 200, width / 2
            );
            sheenGrad.addColorStop(0, 'rgba(60, 130, 246, 0.1)');
            sheenGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
            ctx.fillStyle = sheenGrad;
            ctx.fillRect(0, 0, width, height);
            ctx.globalCompositeOperation = 'source-over';

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
            className="fixed inset-0 z-0 pointer-events-none"
            style={{ filter: 'contrast(1.2) brightness(1.1)' }}
        />
    );
};
