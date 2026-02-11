import { useState, useEffect } from 'react';
import { Profile } from '@/hooks/useAuth';
import { X, Send, UserPlus, Shield, Info, ExternalLink, MessageCircle, MessageSquare, Check, UserCheck, Eye, Crown, Sparkles, Youtube, Twitch, Twitter, Github, Trophy, Zap, Star, Moon, Minus, Gamepad2, WifiOff } from 'lucide-react';
import { cn } from '@/lib/utils';
import { RANKS } from '@/hooks/useLevelSystem';
import { getIdentityDecorations } from '@/lib/identity';
import { CrystalizedBadge } from "@/components/CrystalizedBadge";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from '@/integrations/supabase/client';

interface PublicProfileCardProps {
    profile: Profile & { social_links?: any };
    isAdmin?: boolean;
    onClose: () => void;
    onStartDM?: (userId: string) => void;
    onAddFriend?: (userId: string) => void;
    onViewProfile?: (userId: string) => void;
}

const DiscordIcon = ({ className }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
        <path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.419-2.1569 2.419zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.419-2.1568 2.419z" />
    </svg>
);

export function PublicProfileCard({
    profile,
    isAdmin,
    onClose,
    onStartDM,
    onAddFriend,
    onViewProfile
}: PublicProfileCardProps) {
    const { user } = useAuth();
    const { isOwner, title, specialBadges, customRank, stats } = getIdentityDecorations(profile.username);

    // Determine Rank
    const rank = customRank
        ? { name: customRank.name, icon: customRank.icon, color: customRank.color, minLevel: 0 }
        : (RANKS.find(r => profile.level >= r.minLevel) || RANKS[0]);

    // Owner Red/White Theme or User Custom Gradient
    const showGradient = (profile.show_gradient && profile.gradient_from && profile.gradient_to) || isOwner;

    const themeColor = isOwner ? '#ef4444' : (profile.gradient_from ? `hsl(${profile.gradient_from})` : undefined);
    const userGradient = isOwner
        ? 'linear-gradient(135deg, #ef4444 0%, #ffffff 100%)'
        : (profile.gradient_from && profile.gradient_to
            ? `linear-gradient(135deg, hsl(${profile.gradient_from}) 0%, hsl(${profile.gradient_to}) 100%)`
            : undefined);

    // Friend request state
    const [friendStatus, setFriendStatus] = useState<'none' | 'pending_sent' | 'pending_received' | 'friends'>('none');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (user && user.id !== profile.user_id) {
            checkFriendStatus();
        }
    }, [user, profile.user_id]);

    const checkFriendStatus = async () => {
        const { data } = await supabase
            .from('friendships')
            .select('status, user_id, friend_id')
            .or(`and(user_id.eq.${user?.id},friend_id.eq.${profile.user_id}),and(user_id.eq.${profile.user_id},friend_id.eq.${user?.id})`)
            .maybeSingle();

        if (data) {
            if (data.status === 'accepted') {
                setFriendStatus('friends');
            } else if (data.status === 'pending') {
                if (data.user_id === user?.id) {
                    setFriendStatus('pending_sent');
                } else {
                    setFriendStatus('pending_received');
                }
            }
        }
    };

    const handleFriendAction = async () => {
        if (!user || loading) return;
        setLoading(true);

        try {
            if (friendStatus === 'none') {
                if (onAddFriend) {
                    onAddFriend(profile.user_id);
                    setFriendStatus('pending_sent');
                } else {
                    const { error } = await supabase
                        .from('friendships')
                        .insert({
                            user_id: user.id,
                            friend_id: profile.user_id,
                            status: 'pending'
                        });
                    if (!error) setFriendStatus('pending_sent');
                }
            } else if (friendStatus === 'pending_received') {
                const { error } = await supabase
                    .from('friendships')
                    .update({ status: 'accepted' })
                    .eq('user_id', profile.user_id)
                    .eq('friend_id', user.id);

                if (!error) setFriendStatus('friends');
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const getSocialIcon = (platform: string) => {
        const p = platform.toLowerCase();
        if (p.includes('youtube')) return <Youtube className="w-4 h-4" />;
        if (p.includes('twitch')) return <Twitch className="w-4 h-4" />;
        if (p.includes('twitter') || p.includes('x.com')) return <Twitter className="w-4 h-4" />;
        if (p.includes('github')) return <Github className="w-4 h-4" />;
        if (p.includes('discord')) return <DiscordIcon className="w-4 h-4" />;
        return <ExternalLink className="w-4 h-4" />;
    };

    const getStatusConfig = (status: string | undefined, isOwner: boolean) => {
        if (isOwner) return { color: 'bg-red-500', shadow: 'shadow-red-500/50', icon: <Crown className="w-3 h-3 text-white" /> };

        switch (status) {
            case 'online': return { color: 'bg-emerald-500', shadow: 'shadow-emerald-500/50', icon: <Zap className="w-3 h-3 text-emerald-950 fill-current" /> };
            case 'idle': return { color: 'bg-amber-500', shadow: 'shadow-amber-500/50', icon: <Moon className="w-3 h-3 text-amber-950 fill-current" /> };
            case 'dnd': return { color: 'bg-rose-500', shadow: 'shadow-rose-500/50', icon: <Minus className="w-3 h-3 text-white" /> };
            case 'gaming': return { color: 'bg-violet-500', shadow: 'shadow-violet-500/50', icon: <Gamepad2 className="w-3 h-3 text-white" /> };
            default: return { color: 'bg-slate-500', shadow: 'shadow-slate-500/50', icon: <WifiOff className="w-3 h-3 text-slate-300" /> };
        }
    };

    const statusConfig = getStatusConfig(profile.status_type, isOwner);

    return (
        <div className="p-4 animate-fade-in-up flex items-center justify-center min-h-[50vh]">
            <div
                className={cn(
                    "relative w-[36rem] rounded-[2.5rem] overflow-hidden bg-[#0a0a0f]/95 backdrop-blur-3xl shadow-2xl transition-all duration-500",
                    "border border-white/5 group",
                    isOwner && "shadow-[0_0_80px_-20px_rgba(239,68,68,0.4)] border-red-500/20"
                )}
                style={!isOwner && themeColor ? {
                    boxShadow: `0 0 60px -20px ${themeColor}30`,
                    borderColor: `${themeColor}20`
                } : undefined}
            >
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 rounded-full bg-black/60 text-white/70 hover:text-white hover:bg-black/80 transition-all z-50 backdrop-blur-md border border-white/10"
                >
                    <X className="w-5 h-5" />
                </button>

                <div className="relative h-48 bg-black overflow-hidden group-hover:h-[12.5rem] transition-all duration-700 ease-[cubic-bezier(0.23,1,0.32,1)]">
                    {profile.banner_url ? (
                        <img
                            src={profile.banner_url}
                            alt="Banner"
                            className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-1000"
                        />
                    ) : (
                        <div className="w-full h-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-[#0a0a0f] to-black"
                            style={userGradient ? { background: userGradient, opacity: isOwner ? 0.8 : 0.4 } : undefined} />
                    )}

                    <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0f] via-[#0a0a0f]/60 to-transparent" />

                    {isOwner && (
                        <div className="absolute top-6 left-6 flex items-center gap-2 px-4 py-1.5 rounded-full bg-red-600/20 border border-red-500/30 backdrop-blur-md shadow-[0_0_20px_rgba(239,68,68,0.3)]">
                            <Crown className="w-4 h-4 text-red-500 animate-[pulse_3s_ease-in-out_infinite]" />
                            <span className="text-[11px] font-black text-red-100 uppercase tracking-widest">System Owner</span>
                        </div>
                    )}
                </div>

                <div className="relative px-8 pb-8 -mt-20">
                    <div className="flex justify-between items-end mb-6">
                        <div className="relative group/avatar">
                            <div className={cn(
                                "w-32 h-32 rounded-[2rem] p-1 bg-[#0a0a0f] shadow-2xl relative z-10",
                                isOwner && "bg-gradient-to-br from-red-600 via-white to-red-600 p-[3px]"
                            )}
                                style={!isOwner && userGradient ? { background: userGradient, padding: '3px' } : undefined}
                            >
                                <div className="w-full h-full rounded-[1.8rem] overflow-hidden bg-[#151520] relative">
                                    {profile.avatar_url ? (
                                        <img src={profile.avatar_url} alt={profile.username} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-5xl font-black text-white/20">
                                            {profile.username.charAt(0).toUpperCase()}
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className={cn(
                                "absolute bottom-2 -right-1 w-8 h-8 rounded-full border-[4px] border-[#0a0a0f] z-20 flex items-center justify-center",
                                statusConfig.color,
                                statusConfig.shadow,
                                "shadow-lg"
                            )}>
                                {isOwner && <div className="absolute inset-0 rounded-full animate-ping bg-red-500 opacity-75" />}
                                {statusConfig.icon}
                            </div>
                        </div>

                        <div className="mb-2 flex gap-2">
                            <div className={cn(
                                "flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#151520]/80 border border-white/5 backdrop-blur-md shadow-lg",
                                isOwner && "border-red-500/30 bg-red-500/10 shadow-[0_0_15px_rgba(239,68,68,0.2)]"
                            )}>
                                <span className={cn("text-sm", isOwner ? "text-red-400" : "")} style={!isOwner ? { color: rank.color } : undefined}>{rank.icon}</span>
                                <span className={cn("text-xs font-black uppercase tracking-wider text-muted-foreground", isOwner && "text-red-200")}>{rank.name}</span>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <div className="flex items-center gap-3">
                                <h2 className={cn(
                                    "text-4xl font-black tracking-tight",
                                    isOwner ? "text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-white to-red-500 animate-text-shimmer" : "text-white"
                                )}>
                                    {profile.username}
                                </h2>
                                {isOwner && <Crown className="w-6 h-6 text-red-500 fill-red-500/20" />}
                            </div>

                            {profile.custom_title && (
                                <div className="mt-2 inline-flex items-center px-2 py-0.5 rounded-md bg-white/5 border border-white/5 text-[10px] font-bold uppercase tracking-widest text-white/60">
                                    {profile.custom_title}
                                </div>
                            )}
                        </div>

                        {profile.status_message && (
                            <div className="relative p-4 rounded-2xl bg-[#151520]/50 border border-white/5 overflow-hidden group/status">
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover/status:translate-x-full transition-transform duration-1000" />
                                <p className="text-sm font-medium text-white/90 italic">"{profile.status_message}"</p>
                            </div>
                        )}

                        <p className="text-sm leading-relaxed text-slate-400 font-medium max-w-lg">
                            {profile.bio || "No biography set."}
                        </p>

                        {profile.social_links && Object.keys(profile.social_links).length > 0 && (
                            <div className="flex flex-wrap gap-2 pt-2">
                                {Object.entries(profile.social_links).map(([platform, handle]: [string, any]) => (
                                    handle && (
                                        <div key={platform} className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#151520] border border-white/5 text-xs font-bold text-slate-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer group/link">
                                            <span className="group-hover/link:scale-110 transition-transform text-white">{getSocialIcon(platform)}</span>
                                            <span>{handle}</span>
                                        </div>
                                    )
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="grid grid-cols-3 gap-4 mt-8">
                        <div className="p-4 rounded-2xl bg-[#151520]/50 border border-white/5 flex flex-col items-center justify-center gap-1 hover:bg-[#151520] transition-colors">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Level</span>
                            <span className={cn("text-xl font-black", isOwner ? "text-red-500" : "text-white")}>
                                {stats ? stats.level : profile.level}
                            </span>
                        </div>
                        <div className="p-4 rounded-2xl bg-[#151520]/50 border border-white/5 flex flex-col items-center justify-center gap-1 hover:bg-[#151520] transition-colors">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">XP</span>
                            <span className={cn("text-xl font-black", isOwner ? "text-red-500" : "text-white")}>
                                {stats ? stats.xp : new Intl.NumberFormat('en-US', { notation: "compact" }).format(profile.xp)}
                            </span>
                        </div>
                        <div className="p-4 rounded-2xl bg-[#151520]/50 border border-white/5 flex flex-col items-center justify-center gap-1 hover:bg-[#151520] transition-colors">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Games</span>
                            <span className={cn("text-xl font-black", isOwner ? "text-red-500" : "text-white")}>
                                {stats ? stats.games : profile.games_played}
                            </span>
                        </div>
                    </div>

                    <div className="mt-8 flex gap-3">
                        <button
                            className="flex-[2] py-3.5 rounded-2xl bg-white text-black font-bold text-sm shadow-[0_0_20px_-5px_rgba(255,255,255,0.3)] hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                            onClick={() => onStartDM?.(profile.user_id)}
                        >
                            <MessageCircle className="w-5 h-5 fill-black" />
                            Send Message
                        </button>

                        {user?.id !== profile.user_id && (
                            <button
                                className={cn(
                                    "flex-1 py-3.5 rounded-2xl font-bold text-sm border flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98] transition-all",
                                    friendStatus === 'friends' ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" :
                                        friendStatus === 'pending_received' ? "bg-amber-500/10 text-amber-500 border-amber-500/20 animate-pulse" :
                                            "bg-[#151520] text-slate-300 border-white/10 hover:bg-white/5"
                                )}
                                onClick={handleFriendAction}
                                disabled={loading || friendStatus === 'friends' || friendStatus === 'pending_sent'}
                            >
                                {loading ? <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" /> :
                                    friendStatus === 'friends' ? <UserCheck className="w-5 h-5" /> :
                                        friendStatus === 'pending_sent' ? <Check className="w-5 h-5" /> :
                                            friendStatus === 'pending_received' ? <span>Accept</span> :
                                                <UserPlus className="w-5 h-5" />}
                            </button>
                        )}

                        <button
                            className="p-3.5 rounded-2xl bg-[#151520] text-slate-300 border border-white/10 hover:bg-white/5 hover:text-white transition-all hover:scale-[1.02] active:scale-[0.98]"
                            onClick={() => onViewProfile?.(profile.user_id)}
                            title="View Full Profile"
                        >
                            <Eye className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
