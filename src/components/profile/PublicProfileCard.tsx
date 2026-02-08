import { Profile } from '@/hooks/useAuth';
import { Badge } from '../badges/Badge';
import { X, Send, UserPlus, Shield, Info, ExternalLink, MessageCircle, MessageSquare, Hammer, Wrench } from 'lucide-react';
import { cn } from '@/lib/utils';
import { RANKS } from '@/hooks/useLevelSystem';
import { getIdentityDecorations } from '@/lib/identity';
import { Badge as UIBadge } from "@/components/ui/badge"; // Renamed to avoid conflict with existing Badge import
import { CrystalizedBadge } from "@/components/CrystalizedBadge";
import { useAuth } from "@/hooks/useAuth";

interface PublicProfileCardProps {
    profile: Profile;
    isAdmin?: boolean;
    onClose: () => void;
    onStartDM?: (userId: string) => void;
    onAddFriend?: (userId: string) => void;
}

export function PublicProfileCard({
    profile,
    isAdmin,
    onClose,
    onStartDM,
    onAddFriend
}: PublicProfileCardProps) {
    const rank = RANKS.find(r => profile.level >= r.minLevel) || RANKS[0];
    const { isOwner, title, specialBadges } = getIdentityDecorations(profile.username);
    const showGradient = (profile.show_gradient && profile.gradient_from && profile.gradient_to) || isOwner;

    const userGradient = profile.gradient_from && profile.gradient_to
        ? `linear-gradient(135deg, hsl(${profile.gradient_from}) 0%, hsl(${profile.gradient_to}) 100%)`
        : undefined;

    return (
        <div className={cn(
            "w-84 rounded-[2.5rem] overflow-hidden bg-card border border-border/20 shadow-2xl animate-fade-in-up backdrop-blur-3xl",
            isOwner && "border-blue-400/30 shadow-[0_0_50px_-10px_rgba(96,165,250,0.3)]"
        )}>
            {/* Banner */}
            <div className="relative h-28 bg-gradient-to-br from-primary/40 to-accent/40">
                {profile.banner_url && (
                    <img src={profile.banner_url} alt="" className="w-full h-full object-cover" />
                )}
                {profile.equipped_badge && (
                    <div className="absolute -top-12 left-1/2 -translate-x-1/2">
                        <CrystalizedBadge
                            name={profile.equipped_badge.name}
                            icon={profile.equipped_badge.icon_svg}
                            gradient={{ from: profile.equipped_badge.gradient_from, to: profile.equipped_badge.gradient_to }}
                            size="lg"
                        />
                    </div>
                )}
                {isOwner && (
                    <div className="absolute top-3 left-3 px-3 py-1 rounded-full bg-blue-400/20 backdrop-blur-md border border-blue-400/30 flex items-center gap-2">
                        <Shield className="w-4 h-4 text-blue-400 animate-pulse" />
                        <span className="text-[10px] font-black text-white uppercase tracking-widest">System Owner</span>
                    </div>
                )}
                <button
                    onClick={onClose}
                    className="absolute top-3 right-3 p-2 rounded-full bg-black/40 hover:bg-black/60 text-white transition-all backdrop-blur-md"
                >
                    <X className="w-4 h-4" />
                </button>
            </div>

            {/* Profile Info */}
            <div className="relative px-6 pb-6 pt-12">
                <div className="absolute -top-12 left-6">
                    <div className={cn(
                        "relative w-24 h-24 rounded-[1.75rem] overflow-hidden border-4 border-card bg-secondary shadow-xl",
                        isOwner ? "ring-4 ring-blue-400/40 ring-offset-4 ring-offset-card" : "ring-2 ring-primary/40"
                    )}>
                        {profile.avatar_url ? (
                            <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" />
                        ) : (
                            <div className={cn(
                                "w-full h-full flex items-center justify-center text-4xl font-black",
                                isOwner ? "bg-gradient-to-br from-white to-blue-400 text-blue-900" : "bg-gradient-to-br from-secondary to-secondary/50 text-muted-foreground"
                            )}>
                                {profile.username.charAt(0).toUpperCase()}
                            </div>
                        )}
                        <div className={cn(
                            "absolute bottom-1.5 right-1.5 w-5 h-5 rounded-full border-2 border-background shadow-md",
                            isOwner ? "bg-blue-400 animate-pulse shadow-blue-400/50" : profile.status_type === 'online' ? "bg-green-500 shadow-green-500/50" :
                                profile.status_type === 'gaming' ? "bg-primary shadow-primary/50" : "bg-muted-foreground"
                        )} />
                    </div>
                </div>

                <div className="flex flex-col gap-1.5 pt-2">
                    <div className="flex items-center gap-2.5 flex-wrap">
                        <h3 className={cn(
                            "text-2xl font-black tracking-tight",
                            isOwner ? "owner-gradient-text" : showGradient ? "gradient-text" : "text-foreground"
                        )} style={!isOwner && showGradient ? {
                            background: userGradient,
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                        } : undefined}>
                            {profile.username}
                        </h3>

                        {isOwner && (
                            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-400/10 border border-blue-400/20 scale-90 origin-left">
                                {specialBadges.map((badge, idx) => (
                                    <badge.icon key={idx} className={cn("w-3.5 h-3.5", badge.color, badge.animate && "animate-pulse")} />
                                ))}
                            </div>
                        )}

                        <div className="px-3 py-1 rounded-full bg-primary/10 text-[10px] font-black text-primary uppercase border border-primary/20 tracking-widest shadow-sm">
                            LVL {profile.level}
                        </div>
                    </div>

                    {title && isOwner ? (
                        <div className="text-[10px] font-black uppercase tracking-[0.25em] px-3 py-1 rounded-full bg-blue-400/10 text-blue-400 border border-blue-400/20 w-fit">
                            {title}
                        </div>
                    ) : profile.custom_title && (
                        <div className="text-[10px] font-bold uppercase tracking-[0.2em] px-2 py-1 rounded bg-secondary/50 w-fit"
                            style={{ color: profile.title_color || 'inherit' }}>
                            {profile.custom_title}
                        </div>
                    )}

                    <div className="flex items-center gap-1.5 mt-2">
                        <span className="text-[10px] font-bold text-muted-foreground uppercase">Rank</span>
                        <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-secondary/40 border border-border/10">
                            <span className="text-xs" style={{ color: rank.color }}>{rank.icon}</span>
                            <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: rank.color }}>{rank.name}</span>
                        </div>
                    </div>
                </div>

                {/* Bio / Status */}
                <div className="mt-6 space-y-4">
                    {profile.status_message && (
                        <div className="p-3 rounded-2xl bg-primary/5 border border-primary/10 text-xs italic text-foreground/80 leading-relaxed font-medium">
                            "{profile.status_message}"
                        </div>
                    )}

                    <div className="text-xs text-muted-foreground leading-relaxed font-medium">
                        {profile.bio || "No biography available."}
                    </div>

                    {/* Stats Bar */}
                    <div className="grid grid-cols-2 gap-2">
                        <div className="p-3 rounded-2xl bg-secondary/30 border border-border/10 text-center">
                            <div className="text-[10px] font-bold text-muted-foreground uppercase opacity-60">Games</div>
                            <div className="text-sm font-black text-foreground">{profile.games_played || 0}</div>
                        </div>
                        <div className="p-3 rounded-2xl bg-secondary/30 border border-border/10 text-center">
                            <div className="text-[10px] font-bold text-muted-foreground uppercase opacity-60">XP</div>
                            <div className="text-sm font-black text-foreground">{profile.xp || 0}</div>
                        </div>
                    </div>
                </div>

                {/* Social Links */}
                {(profile.social_links?.discord || profile.social_links?.twitter) && (
                    <div className="mt-4 pt-4 border-t border-border/10">
                        <div className="text-[10px] font-bold text-muted-foreground uppercase mb-2">Connected Accounts</div>
                        <div className="flex flex-wrap gap-2">
                            {profile.social_links.discord && (
                                <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
                                    <MessageSquare className="w-3.5 h-3.5" />
                                    <span className="text-[10px] font-bold">{profile.social_links.discord}</span>
                                </div>
                            )}
                            {profile.social_links.twitter && (
                                <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400">
                                    <Shield className="w-3.5 h-3.5" />
                                    <span className="text-[10px] font-bold">{profile.social_links.twitter}</span>
                                </div>
                            )}
                        </div>
                    </div>
                )}
                <div className="mt-6 flex gap-2">
                    <button className="flex-1 btn-primary py-2.5 rounded-2xl text-xs font-bold gap-2 shadow-lg shadow-primary/20"
                        onClick={() => onStartDM?.(profile.user_id)}>
                        <MessageCircle className="w-4 h-4" /> Message
                    </button>
                    <button className="btn-secondary px-3 py-2.5 rounded-2xl shadow-sm"
                        onClick={() => onAddFriend?.(profile.user_id)}>
                        <UserPlus className="w-4 h-4" />
                    </button>
                    <button className="btn-secondary px-3 py-2.5 rounded-2xl shadow-sm">
                        <Info className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </div>
    );
}
