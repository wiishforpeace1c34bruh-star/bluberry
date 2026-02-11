
import React, { useEffect } from 'react';

// Global click spark effect
export const GlobalClickSpark = () => {
    useEffect(() => {
        const handleClick = (e: MouseEvent) => {
            const spark = document.createElement('div');
            spark.className = 'fixed pointer-events-none w-4 h-4 bg-white rounded-full z-[99999] animate-spark-ping';
            spark.style.left = `${e.clientX}px`;
            spark.style.top = `${e.clientY}px`;
            spark.style.transform = 'translate(-50%, -50%)';
            document.body.appendChild(spark);

            setTimeout(() => {
                document.body.removeChild(spark);
            }, 600); // Matches animation duration
        };

        window.addEventListener('click', handleClick);
        return () => window.removeEventListener('click', handleClick);
    }, []);

    return null;
};
