import { useState, useEffect, useCallback, createContext, useContext } from 'react';
import { Trophy, Star, Shield, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSound } from '@/context/SoundContext';

interface Achievement {
    id: string;
    title: string;
    description: string;
    icon: any;
    rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

interface AchievementContextType {
    unlockedAchievements: Achievement[];
    unlockAchievement: (achievement: Achievement) => void;
}

const AchievementContext = createContext<AchievementContextType | undefined>(undefined);

export function AchievementProvider({ children }: { children: React.ReactNode }) {
    const [queue, setQueue] = useState<Achievement[]>([]);
    const [current, setCurrent] = useState<Achievement | null>(null);
    const [unlockedAchievements, setUnlockedAchievements] = useState<Achievement[]>([]);
    const { playNotify } = useSound();

    useEffect(() => {
        const saved = localStorage.getItem('unlocked_achievements');
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                if (Array.isArray(parsed)) {
                    setUnlockedAchievements(parsed);
                }
            } catch (e) {
                console.error("Failed to parse achievements:", e);
            }
        }
    }, []);

    useEffect(() => {
        if (queue.length > 0 && !current) {
            const next = queue[0];
            setCurrent(next);
            playNotify();
            setQueue(prev => prev.slice(1));

            // Track unique unlocked achievements
            setUnlockedAchievements(prev => {
                if (prev.find(a => a.id === next.id)) return prev;
                const updated = [...prev, next];
                localStorage.setItem('unlocked_achievements', JSON.stringify(updated));
                return updated;
            });

            setTimeout(() => {
                setCurrent(null);
            }, 6000);
        }
    }, [queue, current, playNotify]);

    const unlockAchievement = useCallback((achievement: Achievement) => {
        setQueue(prev => [...prev, achievement]);
    }, []);

    return (
        <AchievementContext.Provider value={{ unlockAchievement, unlockedAchievements }}>
            {children}
            {current && (
                <div className="fixed top-8 left-1/2 -translate-x-1/2 z-[10000] animate-in slide-in-from-top-12 duration-500">
                    <div className={cn(
                        "relative group flex items-center gap-4 p-1 pr-8 bg-black/80 backdrop-blur-2xl border border-white/10 rounded-full shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden min-w-[320px]",
                        current.rarity === 'legendary' ? "border-amber-500/50" :
                            current.rarity === 'epic' ? "border-purple-500/50" : "border-primary/50"
                    )}>
                        {/* Animated Border Gradient */}
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-shimmer pointer-events-none" />

                        {/* Icon Hexagon */}
                        <div className={cn(
                            "w-12 h-12 flex items-center justify-center relative",
                            current.rarity === 'legendary' ? "text-amber-500" :
                                current.rarity === 'epic' ? "text-purple-500" : "text-primary"
                        )} style={{ clipPath: 'polygon(50% 0%, 95% 25%, 95% 75%, 50% 100%, 5% 75%, 5% 25%)' }}>
                            <div className="absolute inset-0 bg-current opacity-20" />
                            <current.icon className="w-6 h-6 relative z-10" />
                        </div>

                        {/* Text */}
                        <div className="flex-1 py-1">
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40">Achievement Unlocked</span>
                            <h3 className="text-sm font-black text-white uppercase tracking-wider leading-none mb-1">{current.title}</h3>
                            <p className="text-[10px] text-muted-foreground font-medium">{current.description}</p>
                        </div>

                        {/* Rarity Tag */}
                        <div className={cn(
                            "absolute right-4 top-1/2 -translate-y-1/2 px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest",
                            current.rarity === 'legendary' ? "bg-amber-500/10 text-amber-500" :
                                current.rarity === 'epic' ? "bg-purple-500/10 text-purple-500" : "bg-primary/10 text-primary"
                        )}>
                            {current.rarity}
                        </div>
                    </div>
                </div>
            )}
        </AchievementContext.Provider>
    );
}

export const useAchievements = () => {
    const context = useContext(AchievementContext);
    if (!context) throw new Error("useAchievements must be used within AchievementProvider");
    return context;
};
