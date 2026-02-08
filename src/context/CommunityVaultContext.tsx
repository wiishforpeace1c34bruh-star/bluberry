import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface CommunityVault {
    totalXp: number;
    currentTier: number;
    nextTierXp: number;
    lastMilestoneReached: string;
}

interface CommunityVaultContextType {
    vault: CommunityVault;
    isMilestoneReached: boolean;
    dismissMilestone: () => void;
}

const CommunityVaultContext = createContext<CommunityVaultContextType | undefined>(undefined);

const TIERS = [
    { xp: 0, name: 'Genesis' },
    { xp: 10000, name: 'Vanguard' },
    { xp: 50000, name: 'Elite' },
    { xp: 250000, name: 'Prime' },
    { xp: 1000000, name: 'Singularity' },
];

export function CommunityVaultProvider({ children }: { children: ReactNode }) {
    const [vault, setVault] = useState<CommunityVault>({
        totalXp: 0,
        currentTier: 0,
        nextTierXp: TIERS[1].xp,
        lastMilestoneReached: '',
    });
    const [isMilestoneReached, setIsMilestoneReached] = useState(false);

    useEffect(() => {
        const fetchGlobalStats = async () => {
            // In a real app, we'd have a 'global_stats' table or aggregate profiles
            const { data: profiles } = await supabase
                .from('profiles')
                .select('xp');

            const total = profiles?.reduce((sum, p) => sum + (p.xp || 0), 0) || 0;

            const tierIndex = TIERS.findIndex((t, i) => {
                const nextTier = TIERS[i + 1];
                return total >= t.xp && (!nextTier || total < nextTier.xp);
            });

            setVault({
                totalXp: total,
                currentTier: tierIndex,
                nextTierXp: TIERS[tierIndex + 1]?.xp || TIERS[tierIndex].xp,
                lastMilestoneReached: TIERS[tierIndex].name,
            });
        };

        fetchGlobalStats();

        // Optional: Real-time subscription to profile XP changes
        const channel = supabase
            .channel('global-xp')
            .on(
                'postgres_changes',
                { event: 'UPDATE', schema: 'public', table: 'profiles' },
                () => fetchGlobalStats()
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    const dismissMilestone = () => setIsMilestoneReached(false);

    return (
        <CommunityVaultContext.Provider value={{ vault, isMilestoneReached, dismissMilestone }}>
            {children}
        </CommunityVaultContext.Provider>
    );
}

export const useCommunityVault = () => {
    const context = useContext(CommunityVaultContext);
    if (!context) throw new Error('useCommunityVault must be used within CommunityVaultProvider');
    return context;
};
