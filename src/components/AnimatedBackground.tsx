import { useEffect, useRef, memo } from 'react';
import { usePerformanceMode } from '@/hooks/usePerformanceMode';
import { useAura } from '@/context/AuraContext';

export const AnimatedBackground = memo(() => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { performanceMode, ultraMode } = usePerformanceMode();
  const { currentAura } = useAura();
  const mouseRef = useRef({ x: 0, y: 0, active: false });

  if (ultraMode) return null;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let time = 0;
    const particles: Particle[] = [];
    const particleCount = performanceMode ? 100 : (currentAura.type === 'nebula' ? 500 : 350);

    class Particle {
      x: number;
      y: number;
      vx: number;
      vy: number;
      size: number;
      baseSize: number;
      color: string;
      alpha: number;

      constructor(w: number, h: number) {
        this.x = Math.random() * w;
        this.y = Math.random() * h;

        // Speed variants
        const speedMult = currentAura.type === 'solar' ? 0.6 : (currentAura.type === 'void' ? 0.05 : 0.2);
        this.vx = (Math.random() - 0.5) * speedMult;
        this.vy = (Math.random() - 0.5) * speedMult;

        this.baseSize = Math.random() * (currentAura.type === 'nebula' ? 2.5 : 1.5) + 0.5;
        this.size = this.baseSize;
        this.alpha = 0.1 + Math.random() * 0.3;

        const pColors = currentAura.particles;
        this.color = pColors[Math.floor(Math.random() * pColors.length)];
      }

      update(w: number, h: number, mouse: { x: number, y: number, active: boolean }) {
        this.x += this.vx;
        this.y += this.vy;

        // Infinite screen wrap for smoother feel
        if (this.x < 0) this.x = w;
        if (this.x > w) this.x = 0;
        if (this.y < 0) this.y = h;
        if (this.y > h) this.y = 0;

        if (mouse.active) {
          const dx = mouse.x - this.x;
          const dy = mouse.y - this.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const horizon = 120; // Smaller radius for cursor effect

          if (dist < horizon) {
            const force = (horizon - dist) / 5000;
            // Avoid "snappiness" by adding to velocity rather than position directly
            this.vx -= dx * force * 0.05;
            this.vy -= dy * force * 0.05;
            this.size = this.baseSize * (1 + (horizon - dist) / 100);
            this.alpha = Math.min(0.8, (horizon - dist) / horizon);
          } else {
            // Return to base stats slowly
            this.size += (this.baseSize - this.size) * 0.02;
          }
        }
      }

      draw(c: CanvasRenderingContext2D) {
        c.fillStyle = `hsla(${this.color} / ${this.alpha})`;
        c.beginPath();
        c.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        c.fill();

        // Glow for nebula/solar
        if (currentAura.type === 'nebula' || currentAura.type === 'solar') {
          c.shadowBlur = this.size * 2;
          c.shadowColor = `hsla(${this.color} / ${this.alpha})`;
          c.fill();
          c.shadowBlur = 0;
        }
      }
    }

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      particles.length = 0;
      for (let i = 0; i < particleCount; i++) {
        particles.push(new Particle(canvas.width, canvas.height));
      }
    };

    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current.x = e.clientX;
      mouseRef.current.y = e.clientY;
      mouseRef.current.active = true;
    };

    const handleMouseLeave = () => {
      mouseRef.current.active = false;
    };

    window.addEventListener('resize', resize);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseleave', handleMouseLeave);
    resize();

    const render = () => {
      if (performanceMode) {
        ctx.fillStyle = '#0a0b14';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        return;
      }

      time += 0.0015; // Even slower time

      // Deep space background
      ctx.fillStyle = '#06070d';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Layered flares with very slow movement
      const drawFlare = (x: number, y: number, radius: number, color: string) => {
        const flare = ctx.createRadialGradient(x, y, 0, x, y, radius);
        flare.addColorStop(0, color);
        flare.addColorStop(1, 'transparent');
        ctx.fillStyle = flare;
        ctx.globalCompositeOperation = 'screen';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.globalCompositeOperation = 'source-over';
      };

      const x1 = canvas.width * (0.5 + Math.sin(time * 0.3) * 0.4);
      const y1 = canvas.height * (0.5 + Math.cos(time * 0.5) * 0.4);
      drawFlare(x1, y1, canvas.width * 1.2, `hsla(${currentAura.primary} / 0.15)`);

      const x2 = canvas.width * (0.2 + Math.cos(time * 0.2) * 0.3);
      const y2 = canvas.height * (0.8 + Math.sin(time * 0.4) * 0.3);
      drawFlare(x2, y2, canvas.width * 0.8, `hsla(${currentAura.accent} / 0.1)`);

      // Particles
      particles.forEach(p => {
        p.update(canvas.width, canvas.height, mouseRef.current);
        p.draw(ctx);
      });

      // Fluid web lines (only for certain auras)
      if (currentAura.type !== 'void' && currentAura.type !== 'solar') {
        ctx.lineWidth = 0.5;
        const maxDist = currentAura.type === 'nebula' ? 200 : 150;
        for (let i = 0; i < particles.length; i++) {
          for (let j = i + 1; j < particles.length; j++) {
            const dx = particles[i].x - particles[j].x;
            const dy = particles[i].y - particles[j].y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < maxDist) {
              ctx.strokeStyle = `hsla(${particles[i].color} / ${0.05 * (1 - dist / maxDist)})`;
              ctx.beginPath();
              ctx.moveTo(particles[i].x, particles[i].y);
              ctx.lineTo(particles[j].x, particles[j].y);
              ctx.stroke();
            }
          }
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseleave', handleMouseLeave);
      cancelAnimationFrame(animationFrameId);
    };
  }, [performanceMode, currentAura]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 z-0 pointer-events-none opacity-60 transition-opacity duration-1000"
    />
  );
});

AnimatedBackground.displayName = 'AnimatedBackground';
