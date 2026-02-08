import React, { createContext, useContext, useCallback, useRef } from 'react';

interface SoundContextType {
    playHover: () => void;
    playClick: () => void;
    playNotify: () => void;
    playGlitch: () => void;
}

const SoundContext = createContext<SoundContextType | undefined>(undefined);

export function SoundProvider({ children }: { children: React.ReactNode }) {
    // We use small synthetic beeps to avoid external assets
    const playTone = useCallback((freq: number, type: OscillatorType, duration: number, volume: number = 0.1) => {
        try {
            const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();

            osc.type = type;
            osc.frequency.setValueAtTime(freq, ctx.currentTime);

            gain.gain.setValueAtTime(volume, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);

            osc.connect(gain);
            gain.connect(ctx.destination);

            osc.start();
            osc.stop(ctx.currentTime + duration);
        } catch (e) {
            // Silently fail if AudioContext is blocked
        }
    }, []);

    const playHover = useCallback(() => playTone(800, 'sine', 0.1, 0.05), [playTone]);
    const playClick = useCallback(() => playTone(400, 'sine', 0.1, 0.1), [playTone]);
    const playNotify = useCallback(() => {
        playTone(600, 'sine', 0.1, 0.1);
        setTimeout(() => playTone(800, 'sine', 0.2, 0.1), 100);
    }, [playTone]);

    const playGlitch = useCallback(() => {
        playTone(Math.random() * 1000 + 200, 'sawtooth', 0.05, 0.02);
    }, [playTone]);

    return (
        <SoundContext.Provider value={{ playHover, playClick, playNotify, playGlitch }}>
            {children}
        </SoundContext.Provider>
    );
}

export const useSound = () => {
    const context = useContext(SoundContext);
    if (!context) throw new Error("useSound must be used within SoundProvider");
    return context;
};
