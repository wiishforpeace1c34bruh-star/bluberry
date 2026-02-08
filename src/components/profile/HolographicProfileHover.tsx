import { HoverCard, HoverCardContent, HoverCardTrigger } from "@radix-ui/react-hover-card";
import { Shield, Target, Trophy, Zap, Crown, Activity } from 'lucide-react';
import { cn } from "@/lib/utils";
import { RANKS } from "@/hooks/useLevelSystem";

interface ProfileHoverProps {
    profile: any;
    children: React.ReactNode;
}

export function HolographicProfileHover({ profile, children }: ProfileHoverProps) {
    if (!profile) return <>{children}</>;

    const level = profile.level || 1;
    let currentRank = RANKS[0];
    for (const r of RANKS) {
        if (level >= r.minLevel) currentRank = r;
    }

    return (
        <HoverCard openDelay={300} closeDelay={200}>
            <HoverCardTrigger asChild>
                {children}
            </HoverCardTrigger>
            <HoverCardContent
                side="top"
                align="start"
                sideOffset={10}
                className="z-[9999] w-72 animate-in zoom-in-95 fade-in duration-300"
            >
                <div className="relative overflow-hidden bg-black/80 backdrop-blur-2xl border border-primary/30 rounded-2xl shadow-[0_0_40px_rgba(59,130,246,0.2)] p-5">
                    {/* Scan-line Effect */}
                    <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%]" />

                    {/* Glow Accents */}
                    <div className="absolute -top-24 -left-24 w-48 h-48 bg-primary/10 rounded-full blur-[80px]" />
                    <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-accent/10 rounded-full blur-[80px]" />

                    {/* Content */}
                    <div className="relative flex flex-col gap-4">
                        {/* Header: Avatar + Identity */}
                        <div className="flex items-center gap-4">
                            <div className="relative group">
                                {profile.avatar_url ? (
                                    <img
                                        src={profile.avatar_url}
                                        className="w-14 h-14 rounded-xl object-cover border border-white/10 ring-2 ring-primary/20"
                                        alt={profile.username}
                                    />
                                ) : (
                                    <div className="w-14 h-14 rounded-xl bg-primary/20 border border-primary/20 flex items-center justify-center font-black text-primary text-xl">
                                        {profile.username?.charAt(0).toUpperCase()}
                                    </div>
                                )}
                                <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-black animate-pulse" />
                            </div>

                            <div className="flex-1">
                                <h4 className="text-sm font-black text-white uppercase tracking-wider mb-0.5">
                                    {profile.username}
                                </h4>
                                {/* Level & Rank */}
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex flex-col">
                                        <span className="text-[10px] uppercase tracking-widest text-primary/60 font-black">Level {level}</span>
                                        <span className="text-sm font-black text-white italic tracking-wider">{currentRank.name}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {level >= 100 && (
                                            <div className="p-2 rounded-xl bg-primary/20 border border-primary/50 shadow-[0_0_15px_rgba(59,130,246,0.5)] animate-glow-pulse" title="Sapphire Elite">
                                                <Crown className="w-5 h-5 text-primary" />
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Bio/Status */}
                        {profile.bio && (
                            <p className="text-[11px] text-muted-foreground leading-relaxed italic border-l-2 border-primary/20 pl-3">
                                "{profile.bio}"
                            </p>
                        )}

                        {/* Stats Matrix */}
                        <div className="grid grid-cols-2 gap-2">
                            <div className="bg-white/5 border border-white/5 rounded-xl p-2.5 flex flex-col gap-1 hover:bg-white/10 transition-colors group">
                                <span className="text-[8px] text-muted-foreground font-black uppercase tracking-tighter flex items-center gap-1">
                                    <Activity className="w-2.5 h-2.5 text-primary group-hover:animate-pulse" /> LEVEL
                                </span>
                                <span className="text-lg font-black text-white leading-none tracking-tight">{level}</span>
                                <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden mt-1">
                                    <div className="h-full bg-primary" style={{ width: `${(level % 10) * 10}%` }} />
                                </div>
                            </div>
                            <div className="bg-white/5 border border-white/5 rounded-xl p-2.5 flex flex-col gap-1 hover:bg-white/10 transition-colors group">
                                <span className="text-[8px] text-muted-foreground font-black uppercase tracking-tighter flex items-center gap-1">
                                    <Zap className="w-2.5 h-2.5 text-accent group-hover:scale-125 transition-transform" /> XP
                                </span>
                                <span className="text-lg font-black text-white leading-none tracking-tight">{(profile.xp || 0).toLocaleString()}</span>
                            </div>
                        </div>

                        {/* Stats Summary */}
                        <div className="flex items-center justify-between pt-2 border-t border-white/5">
                            <span className="text-[9px] font-black text-muted-foreground/40 uppercase tracking-[0.2em]">Identity Verified</span>
                            <div className="flex -space-x-1.5">
                                {[1, 2, 3].map((i) => (
                                    <div key={i} className="w-5 h-5 rounded-full bg-card border border-white/10 flex items-center justify-center">
                                        <Trophy className="w-2.5 h-2.5 text-white/20" />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </HoverCardContent>
        </HoverCard>
    );
}
