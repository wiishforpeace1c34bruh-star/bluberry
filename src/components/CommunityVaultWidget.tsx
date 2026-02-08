import React from 'react';
import { useCommunityVault } from '@/context/CommunityVaultContext';
import { TrendingUp, ShieldCheck, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';

export function CommunityVaultWidget() {
    const { vault } = useCommunityVault();
    const progress = (vault.totalXp / vault.nextTierXp) * 100;

    return (
        <div className="p-6 rounded-3xl bg-black/40 border border-white/5 backdrop-blur-xl flex flex-col h-full group hover:border-primary/20 transition-all duration-500">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center border border-primary/20 text-primary">
                        <ShieldCheck className="w-4 h-4" />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-[10px] font-black text-primary uppercase tracking-widest">Global Vault</span>
                        <span className="text-xs font-bold text-white/40 uppercase">Collective Goal</span>
                    </div>
                </div>
                <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10">
                    <TrendingUp className="w-3 h-3 text-green-400" />
                    <span className="text-[10px] font-black text-white/80 uppercase tracking-widest leading-none">Live Sync</span>
                </div>
            </div>

            <div className="flex-1 flex flex-col justify-center">
                <div className="flex items-end justify-between mb-2">
                    <div className="flex flex-col">
                        <span className="text-3xl font-black text-white">{vault.totalXp.toLocaleString()}</span>
                        <span className="text-[10px] font-bold text-white/20 uppercase tracking-widest">Total Community XP</span>
                    </div>
                    <div className="flex flex-col items-end">
                        <span className="text-sm font-black text-primary uppercase">{vault.lastMilestoneReached}</span>
                        <span className="text-[8px] font-black text-white/20 uppercase tracking-widest">Current Tier</span>
                    </div>
                </div>

                {/* Progress Bar */}
                <div className="h-5 w-full bg-white/5 rounded-xl border border-white/5 p-1 relative overflow-hidden">
                    <div
                        className="h-full bg-gradient-to-r from-primary/80 to-primary rounded-lg shadow-[0_0_15px_rgba(var(--primary-rgb),0.5)] transition-all duration-1000 ease-out"
                        style={{ width: `${Math.min(100, progress)}%` }}
                    >
                        <div className="absolute inset-0 bg-shimmer animate-shimmer" />
                    </div>
                </div>
            </div>

            <div className="mt-6 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                    <span className="text-[9px] font-bold text-white/30 uppercase tracking-widest">Leveling up...</span>
                </div>
                <div className="text-[9px] font-black text-primary/60 uppercase tracking-widest flex items-center gap-1 group-hover:text-primary transition-colors">
                    Next Tier: {vault.nextTierXp.toLocaleString()} <Zap className="w-2.5 h-2.5" />
                </div>
            </div>
        </div>
    );
}
