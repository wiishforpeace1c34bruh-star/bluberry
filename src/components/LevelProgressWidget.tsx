import React from 'react';
import { Trophy, TrendingUp, Zap } from 'lucide-react';
import { Profile } from '@/hooks/useAuth';
import { RANKS } from '@/hooks/useLevelSystem';
import { cn } from '@/lib/utils';

interface LevelProgressWidgetProps {
    profile: Profile | null;
}

export function LevelProgressWidget({ profile }: LevelProgressWidgetProps) {
    if (!profile) {
        return (
            <div className="w-full h-full rounded-2xl bg-white/5 border border-white/10 p-6 flex flex-col items-center justify-center gap-4 animate-fade-in-up">
                <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center text-muted-foreground/40">
                    <Trophy className="w-6 h-6" />
                </div>
                <div className="text-center">
                    <p className="text-sm font-bold text-white mb-1">Guest Session</p>
                    <p className="text-xs text-muted-foreground">Sign in to track your XP and level up!</p>
                </div>
                <button className="px-4 py-2 rounded-lg bg-primary/20 text-primary text-xs font-bold border border-primary/30 hover:bg-primary/30 transition-colors">
                    Get Started
                </button>
            </div>
        );
    }

    const { level, xp } = profile;

    // Find current rank
    let currentRank = RANKS[0];
    for (const r of RANKS) {
        if (level >= r.minLevel) currentRank = r;
    }

    // Progress calculation
    const xpForCurrentLevel = Math.pow(level - 1, 2) * 100;
    const xpForNextLevel = Math.pow(level, 2) * 100;
    const levelRange = xpForNextLevel - xpForCurrentLevel;
    const currentProgress = xp - xpForCurrentLevel;
    const progressPercent = Math.min(Math.max((currentProgress / levelRange) * 100, 0), 100);
    const xpRemaining = xpForNextLevel - xp;

    return (
        <div className="w-full h-full flex flex-col gap-4 animate-fade-in-up">
            <div className="flex items-center justify-between px-2">
                <div className="flex items-center gap-2">
                    <Trophy className="w-5 h-5 text-yellow-500" />
                    <h3 className="font-bold text-white uppercase tracking-wider text-sm">Your Progress</h3>
                </div>
                <span className="text-[10px] font-mono text-muted-foreground">LVL {level}</span>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-2xl p-5 relative overflow-hidden group">
                {/* Background Glow */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />

                <div className="relative z-10">
                    <div className="flex items-end justify-between mb-4">
                        <div>
                            <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest mb-1">Current Rank</p>
                            <h4 className="text-2xl font-black italic tracking-tighter" style={{ color: currentRank.color }}>
                                {currentRank.name}
                            </h4>
                        </div>
                        <div className="text-right">
                            <div className="flex items-center gap-1 justify-end text-primary mb-1">
                                <Zap className="w-3 h-3 fill-current" />
                                <span className="text-xs font-bold font-mono">{xp.toLocaleString()} XP</span>
                            </div>
                            <p className="text-[10px] text-muted-foreground uppercase font-bold">Total Earned</p>
                        </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="space-y-2">
                        <div className="flex items-center justify-between text-[10px] uppercase font-bold tracking-wider">
                            <span className="text-muted-foreground">Level {level}</span>
                            <span className="text-white">{Math.round(progressPercent)}% to LVL {level + 1}</span>
                        </div>
                        <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden border border-white/5">
                            <div
                                className="h-full bg-gradient-to-r from-primary via-blue-400 to-primary animate-gradient shadow-[0_0_15px_rgba(59,130,246,0.5)] transition-all duration-1000 ease-out"
                                style={{ width: `${progressPercent}%` }}
                            />
                        </div>
                    </div>

                    <div className="mt-4 flex items-center gap-2 px-3 py-2 rounded-xl bg-white/5 border border-white/5">
                        <TrendingUp className="w-3 h-3 text-green-400" />
                        <p className="text-[10px] text-muted-foreground">
                            Earn <span className="text-white font-bold">{xpRemaining.toLocaleString()} XP</span> more to reach <span className="text-white font-bold">Level {level + 1}</span>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
