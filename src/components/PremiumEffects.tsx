import { useEffect, useRef, useState } from 'react';

export function CursorGlow() {
    const glowRef = useRef<HTMLDivElement>(null);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const glow = glowRef.current;
        if (!glow) return;

        const handleMouseMove = (e: MouseEvent) => {
            if (!isVisible) setIsVisible(true);

            // Center the 250px glow on cursor
            const x = e.clientX - 125;
            const y = e.clientY - 125;

            glow.style.transform = `translate3d(${x}px, ${y}px, 0)`;
        };

        const handleMouseLeave = () => setIsVisible(false);
        const handleMouseEnter = () => setIsVisible(true);

        window.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseleave', handleMouseLeave);
        document.addEventListener('mouseenter', handleMouseEnter);

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseleave', handleMouseLeave);
            document.removeEventListener('mouseenter', handleMouseEnter);
        };
    }, [isVisible]);

    return (
        <div
            ref={glowRef}
            className="cursor-glow"
            style={{
                opacity: isVisible ? 1 : 0,
                transition: 'opacity 0.5s ease-out, transform 0.1s ease-out'
            }}
        />
    );
}
