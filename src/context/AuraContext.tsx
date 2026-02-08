import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type AuraType = 'sapphire' | 'solar' | 'nebula' | 'forest' | 'void';

interface Aura {
    name: string;
    type: AuraType;
    primary: string; // HSL values: "H S L"
    accent: string;
    background: string;
    particles: string[];
}

const AURAS: Record<AuraType, Aura> = {
    sapphire: {
        name: 'Sapphire Prime',
        type: 'sapphire',
        primary: '220 100% 60%',
        accent: '210 100% 70%',
        background: '230 35% 7%',
        particles: ['220 100% 80%', '200 100% 70%'],
    },
    solar: {
        name: 'Solar Flare',
        type: 'solar',
        primary: '40 100% 55%',
        accent: '30 100% 65%',
        background: '25 40% 6%',
        particles: ['40 100% 70%', '20 100% 60%'],
    },
    nebula: {
        name: 'Nebula Drift',
        type: 'nebula',
        primary: '280 80% 65%',
        accent: '320 100% 65%',
        background: '285 45% 6%',
        particles: ['280 100% 80%', '320 100% 70%'],
    },
    forest: {
        name: 'Emerald Grove',
        type: 'forest',
        primary: '150 80% 50%',
        accent: '160 100% 60%',
        background: '165 40% 6%',
        particles: ['150 100% 80%', '160 100% 70%'],
    },
    void: {
        name: 'The Void',
        type: 'void',
        primary: '0 0% 100%',
        accent: '0 0% 70%',
        background: '0 0% 4%',
        particles: ['0 0% 90%', '0 0% 60%'],
    }
};

interface AuraContextType {
    currentAura: Aura;
    setAura: (type: AuraType) => void;
}

const AuraContext = createContext<AuraContextType | undefined>(undefined);

export function AuraProvider({ children }: { children: ReactNode }) {
    const [auraType, setAuraType] = useState<AuraType>(() => {
        return (localStorage.getItem('sapphire_aura') as AuraType) || 'sapphire';
    });

    const currentAura = AURAS[auraType];

    useEffect(() => {
        localStorage.setItem('sapphire_aura', auraType);

        // Inject CSS variables
        const root = document.documentElement;
        root.style.setProperty('--primary', currentAura.primary);
        root.style.setProperty('--accent', currentAura.accent);
        root.style.setProperty('--background', currentAura.background);
        root.style.setProperty('--sapphire-glow', currentAura.primary);

        // Smooth transition
        root.classList.add('aura-transitioning');
        const timer = setTimeout(() => root.classList.remove('aura-transitioning'), 1000);
        return () => clearTimeout(timer);
    }, [auraType, currentAura]);

    return (
        <AuraContext.Provider value={{ currentAura, setAura: setAuraType }}>
            {children}
        </AuraContext.Provider>
    );
}

export const useAura = () => {
    const context = useContext(AuraContext);
    if (!context) throw new Error('useAura must be used within an AuraProvider');
    return context;
};
