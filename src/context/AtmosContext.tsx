import React, { createContext, useContext, useState, useEffect, useRef } from 'react';

interface AudioTrack {
    id: string;
    name: string;
    url: string;
    mood: string;
}

const TRACKS: AudioTrack[] = [
    { id: 'synth', name: 'Synthwave Echoes', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3', mood: 'Retrowave' },
    { id: 'deep', name: 'Deep Sea Ambience', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3', mood: 'Calm' },
    { id: 'drift', name: 'Nebula Drift', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3', mood: 'Spacial' },
];

interface AtmosContextType {
    currentTrack: AudioTrack;
    isPlaying: boolean;
    volume: number;
    togglePlay: () => void;
    setVolume: (v: number) => void;
    nextTrack: () => void;
}

const AtmosContext = createContext<AtmosContextType | undefined>(undefined);

export function AtmosProvider({ children }: { children: React.ReactNode }) {
    const [trackIndex, setTrackIndex] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const [volume, setVolume] = useState(0.5);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    useEffect(() => {
        audioRef.current = new Audio(TRACKS[trackIndex].url);
        audioRef.current.loop = true;
        audioRef.current.volume = volume;

        if (isPlaying) {
            audioRef.current.play().catch(() => setIsPlaying(false));
        }

        return () => {
            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current = null;
            }
        };
    }, [trackIndex]);

    useEffect(() => {
        if (audioRef.current) {
            audioRef.current.volume = volume;
        }
    }, [volume]);

    const togglePlay = () => {
        if (!audioRef.current) return;
        if (isPlaying) {
            audioRef.current.pause();
        } else {
            audioRef.current.play().catch(console.error);
        }
        setIsPlaying(!isPlaying);
    };

    const nextTrack = () => {
        setTrackIndex((prev) => (prev + 1) % TRACKS.length);
    };

    return (
        <AtmosContext.Provider value={{ currentTrack: TRACKS[trackIndex], isPlaying, volume, togglePlay, setVolume, nextTrack }}>
            {children}
        </AtmosContext.Provider>
    );
}

export const useAtmos = () => {
    const context = useContext(AtmosContext);
    if (!context) throw new Error('useAtmos must be used within an AtmosProvider');
    return context;
};
