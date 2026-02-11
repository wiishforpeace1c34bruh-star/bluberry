import { useState, useEffect } from 'react';
import { UserPlus, Check, X, MessageCircle, Award, Clock, Gamepad2, Shield } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth, Profile } from '@/hooks/useAuth';
import { useDM } from '@/context/DMContext';
import { useNavigate } from 'react-router-dom';
import { RANKS } from '@/hooks/useLevelSystem';
import { getIdentityDecorations } from '@/lib/identity';
import { CrystalizedBadge } from "@/components/CrystalizedBadge";
import { cn } from '@/lib/utils'; // Make sure cn is imported

interface UserProfileCardProps {
  userId: string;
  onClose?: () => void;
}

interface BadgeData {
  id: string;
  name: string;
  icon_svg: string;
  gradient_from: string;
  gradient_to: string;
}

type FriendshipStatus = 'none' | 'pending_sent' | 'pending_received' | 'friends';

export function UserProfileCard({ userId, onClose }: UserProfileCardProps) {
  const { user } = useAuth();
  const { startThread, setActiveThread } = useDM(); // DM hook
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [equippedBadge, setEquippedBadge] = useState<BadgeData | null>(null);
  const [friendshipStatus, setFriendshipStatus] = useState<FriendshipStatus>('none');
  const [friendshipId, setFriendshipId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, [userId]);

  const fetchProfile = async () => {
    // Get profile
    const { data: profileData } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (profileData) {
      setProfile(profileData as Profile);

      // Get equipped badge if exists
      if (profileData.equipped_badge_id) {
        const { data: badge } = await supabase
          .from('badges')
          .select('id, name, icon_svg, gradient_from, gradient_to')
          .eq('id', profileData.equipped_badge_id)
          .single();

        if (badge) {
          setEquippedBadge(badge as BadgeData);
        }
      }
    }

    // Check friendship status
    if (user && user.id !== userId) {
      const { data: friendships } = await supabase
        .from('friendships')
        .select('*')
        .or(`and(user_id.eq.${user.id},friend_id.eq.${userId}),and(user_id.eq.${userId},friend_id.eq.${user.id})`);

      if (friendships && friendships.length > 0) {
        const friendship = friendships[0];
        setFriendshipId(friendship.id);

        if (friendship.status === 'accepted') {
          setFriendshipStatus('friends');
        } else if (friendship.user_id === user.id) {
          setFriendshipStatus('pending_sent');
        } else {
          setFriendshipStatus('pending_received');
        }
      }
    }

    setLoading(false);
  };

  const sendFriendRequest = async () => {
    if (!user) return;
    setActionLoading(true);

    const { error } = await supabase
      .from('friendships')
      .insert({
        user_id: user.id,
        friend_id: userId,
        status: 'pending'
      });

    if (!error) {
      setFriendshipStatus('pending_sent');
    }
    setActionLoading(false);
  };

  const acceptRequest = async () => {
    if (!friendshipId) return;
    setActionLoading(true);

    await supabase
      .from('friendships')
      .update({ status: 'accepted' })
      .eq('id', friendshipId);

    setFriendshipStatus('friends');
    setActionLoading(false);
  };

  const cancelRequest = async () => {
    if (!friendshipId) return;
    setActionLoading(true);

    await supabase
      .from('friendships')
      .delete()
      .eq('id', friendshipId);

    setFriendshipStatus('none');
    setFriendshipId(null);
    setActionLoading(false);
  };

  const handleMessage = async () => {
    if (!profile) return;
    try {
      const threadId = await startThread(userId);
      setActiveThread({
        id: threadId,
        created_at: new Date().toISOString(),
        last_message_at: new Date().toISOString(),
        other_participant: {
          username: profile.username,
          avatar_url: profile.avatar_url
        }
      });
      // Assuming DM chat opens, we don't need to navigate.
    } catch (e) {
      console.error("Failed to message", e);
    }
  }

  const formatPlayTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    if (hours > 0) return `${hours}h ${mins}m`;
    return `${mins}m`;
  };

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="p-8 text-center text-muted-foreground">
        User not found
      </div>
    );
  }

  const isOwnProfile = user?.id === userId;

  // Identity Decorations
  const { isOwner, title, specialBadges, customRank, stats } = getIdentityDecorations(profile.username);

  const rank = customRank
    ? { name: customRank.name, icon: customRank.icon, color: customRank.color, minLevel: 0 }
    : (RANKS.find(r => profile.level >= r.minLevel) || RANKS[0]);

  const showGradient = (profile.show_gradient && profile.gradient_from && profile.gradient_to) || isOwner;


  const userGradient = profile.gradient_from && profile.gradient_to
    ? `linear-gradient(135deg, hsl(${profile.gradient_from}) 0%, hsl(${profile.gradient_to}) 100%)`
    : undefined;

  const themeColor = profile.gradient_from ? `hsl(${profile.gradient_from})` : undefined;

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-[2.5rem] bg-card/95 border transition-all duration-500",
        "backdrop-blur-3xl shadow-2xl",
        isOwner ? "border-blue-400/30 shadow-[0_0_50px_-10px_rgba(96,165,250,0.3)]" : "border-white/10"
      )}
      style={themeColor ? {
        boxShadow: `0 0 40px -10px ${themeColor}40`,
        borderColor: `${themeColor}30`
      } : undefined}
    >
      {/* Animated Glow Background */}
      {showGradient && themeColor && (
        <div className="absolute inset-0 opacity-10 pointer-events-none z-0">
          <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-white/10 animate-pulse"
            style={{ background: `linear-gradient(135deg, ${themeColor}00 0%, ${themeColor}10 100%)` }} />
        </div>
      )}

      {/* Banner */}
      <div className="relative h-48 bg-gradient-to-br from-primary/20 to-primary/5 overflow-hidden">
        {profile.banner_url ? (
          <img
            src={profile.banner_url}
            alt="Banner"
            className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-primary/20 to-accent/20"
            style={userGradient ? { background: userGradient, opacity: 0.3 } : undefined} />
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-card/90" />

        {equippedBadge && (
          <div className="absolute top-6 left-1/2 -translate-x-1/2 drop-shadow-[0_0_15px_rgba(255,255,255,0.3)] transform scale-125">
            <CrystalizedBadge
              name={equippedBadge.name}
              icon={equippedBadge.icon_svg}
              gradient={{ from: equippedBadge.gradient_from, to: equippedBadge.gradient_to }}
              size="lg"
            />
          </div>
        )}

        {isOwner && (
          <div className="absolute top-6 left-6 px-4 py-2 rounded-full bg-blue-500/20 backdrop-blur-md border border-blue-400/30 flex items-center gap-2 shadow-[0_0_15px_rgba(59,130,246,0.2)]">
            <Shield className="w-4 h-4 text-blue-400 animate-pulse" />
            <span className="text-xs font-black text-white uppercase tracking-widest">System Owner</span>
          </div>
        )}
      </div>

      {/* Profile Content */}
      <div className="p-8 relative">
        {/* Avatar & Name Row */}
        <div className="flex justify-between items-end -mt-20 mb-6 relative z-10">
          <div
            className={cn(
              "relative w-32 h-32 rounded-[2.5rem] p-2 bg-card",
              "before:absolute before:inset-0 before:rounded-[2.5rem] before:p-[2px] before:bg-gradient-to-br before:from-white/20 before:to-transparent before:-z-10",
              isOwner && "ring-4 ring-blue-500/20"
            )}
            style={userGradient ? {
              background: `linear-gradient(to bottom right, ${themeColor}40, var(--card))`,
            } : undefined}
          >
            <div className="w-full h-full rounded-[2rem] overflow-hidden bg-secondary shadow-lg relative group-hover:scale-[1.02] transition-transform duration-500">
              {profile.avatar_url ? (
                <img
                  src={profile.avatar_url}
                  alt={profile.username}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-4xl font-bold text-muted-foreground bg-secondary"
                  style={userGradient ? { background: userGradient, color: 'white' } : undefined}>
                  {profile.username.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            <div className={cn(
              "absolute bottom-2 right-2 w-6 h-6 rounded-full border-[4px] border-card shadow-sm z-20",
              isOwner ? "bg-blue-400 animate-pulse shadow-blue-400/50" : "bg-green-500 shadow-green-500/50"
            )} />
          </div>

          <div className="mb-4 mr-2">
            <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-secondary/50 border border-white/5 backdrop-blur-sm shadow-sm">
              <span className="text-sm" style={{ color: rank.color }}>{rank.icon}</span>
              <span className="text-xs font-black uppercase tracking-wider text-muted-foreground">{rank.name}</span>
            </div>
          </div>
        </div>

        <div className="relative z-10 pl-2">
          <div className="flex items-center gap-3 flex-wrap mb-2">
            <h2
              className={cn("text-4xl font-black tracking-tight", isOwner ? "owner-gradient-text" : showGradient ? "gradient-text" : "text-foreground")}
              style={!isOwner && showGradient ? {
                background: userGradient,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                filter: `drop-shadow(0 0 25px ${themeColor}40)`
              } : undefined}
            >
              {profile.username}
            </h2>

            {isOwner && (
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-400/10 border border-blue-400/20 origin-left">
                {specialBadges.map((badge, idx) => (
                  <badge.icon key={idx} className={cn("w-4 h-4", badge.color, badge.animate && "animate-pulse")} />
                ))}
              </div>
            )}

            <div className="px-3 py-1 rounded-xl bg-primary/10 text-xs font-black text-primary uppercase border border-primary/20 tracking-widest shadow-sm">
              Level {profile.level}
            </div>
          </div>

          {profile.custom_title && (
            <div
              className="text-xs font-black uppercase tracking-[0.15em] mb-4 inline-block px-3 py-1.5 rounded-lg bg-secondary/30 border border-white/5"
              style={{ color: profile.title_color || undefined, borderColor: profile.title_color ? `${profile.title_color}20` : undefined }}
            >
              {profile.custom_title}
            </div>
          )}

          {/* Bio */}
          {profile.bio && (
            <div className="p-6 rounded-3xl bg-secondary/20 border border-white/5 backdrop-blur-sm max-w-2xl mb-8">
              <p className="text-base text-muted-foreground leading-relaxed font-medium">
                "{profile.bio}"
              </p>
            </div>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="flex flex-col items-center justify-center p-6 rounded-3xl bg-secondary/20 border border-white/5 hover:bg-secondary/30 transition-colors group">
            <Gamepad2 className="w-6 h-6 text-primary mb-3 group-hover:scale-110 transition-transform" />
            <p className="text-2xl font-black text-foreground">{stats ? stats.games : profile.games_played}</p>
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Games Played</p>
          </div>
          <div className="flex flex-col items-center justify-center p-6 rounded-3xl bg-secondary/20 border border-white/5 hover:bg-secondary/30 transition-colors group">
            <Clock className="w-6 h-6 text-primary mb-3 group-hover:scale-110 transition-transform" />
            <p className="text-2xl font-black text-foreground text-nowrap">{stats && stats.time === 'MAX' ? 'MAX' : formatPlayTime(profile.total_play_time)}</p>
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Time Played</p>
          </div>
          <div className="flex flex-col items-center justify-center p-6 rounded-3xl bg-secondary/20 border border-white/5 hover:bg-secondary/30 transition-colors group">
            <Award className="w-6 h-6 text-primary mb-3 group-hover:scale-110 transition-transform" />
            <p className="text-2xl font-black text-foreground">{stats ? stats.xp : profile.xp}</p>
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Total XP</p>
          </div>
        </div>

        {/* Action Buttons */}
        {!isOwnProfile && user && (
          <div className="flex gap-4 p-4 rounded-3xl bg-secondary/10 border border-white/5 backdrop-blur-md">
            <button
              onClick={handleMessage}
              className="flex-[2] btn-primary py-4 rounded-2xl text-sm font-bold flex items-center justify-center gap-3 shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
            >
              <MessageCircle className="w-5 h-5" /> Send Message
            </button>

            {friendshipStatus === 'none' && (
              <button
                onClick={sendFriendRequest}
                disabled={actionLoading}
                className="flex-1 btn-secondary py-4 rounded-2xl text-sm font-bold flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98] transition-all"
              >
                <UserPlus className="w-5 h-5" />
                Add Friend
              </button>
            )}

            {friendshipStatus === 'pending_sent' && (
              <button
                onClick={cancelRequest}
                disabled={actionLoading}
                className="flex-1 btn-secondary py-4 rounded-2xl text-sm font-bold flex items-center justify-center gap-2 text-muted-foreground hover:bg-destructive/10 hover:text-destructive hover:scale-[1.02] active:scale-[0.98] transition-all"
              >
                <X className="w-5 h-5" />
                Cancel Request
              </button>
            )}

            {friendshipStatus === 'pending_received' && (
              <div className="flex flex-1 gap-2">
                <button
                  onClick={acceptRequest}
                  disabled={actionLoading}
                  className="flex-1 bg-green-500 hover:bg-green-600 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all"
                >
                  <Check className="w-5 h-5" />
                  Accept
                </button>
                <button
                  onClick={cancelRequest}
                  disabled={actionLoading}
                  className="px-6 btn-secondary rounded-2xl hover:bg-destructive/10 hover:text-destructive transition-all"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            )}

            {friendshipStatus === 'friends' && (
              <div className="flex-1 flex items-center justify-center gap-2 py-4 rounded-2xl bg-green-500/10 text-green-500 border border-green-500/20 font-bold text-sm">
                <Check className="w-5 h-5" /> Friends
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}