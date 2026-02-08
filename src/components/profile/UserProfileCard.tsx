import { useState, useEffect } from 'react';
import { UserPlus, Check, X, MessageCircle, Award, Clock, Gamepad2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth, Profile } from '@/hooks/useAuth';
import { Badge } from '../badges/Badge';

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

  const formatPlayTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    if (hours > 0) return `${hours}h ${mins}m`;
    return `${mins}m`;
  };

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
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

  return (
    <div className="overflow-hidden rounded-2xl bg-card border border-border/30">
      {/* Banner */}
      <div className="relative h-24 bg-gradient-to-br from-primary/20 to-primary/5">
        {profile.banner_url && (
          <img
            src={profile.banner_url}
            alt="Banner"
            className="w-full h-full object-cover"
          />
        )}
      </div>

      {/* Profile Content */}
      <div className="p-5">
        {/* Avatar & Name Row */}
        <div className="flex items-end gap-4 -mt-14">
          <div className="relative">
            <div className="w-20 h-20 rounded-2xl overflow-hidden border-4 border-card bg-secondary shadow-lg">
              {profile.avatar_url ? (
                <img
                  src={profile.avatar_url}
                  alt={profile.username}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-2xl font-bold text-muted-foreground bg-secondary">
                  {profile.username.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            {equippedBadge && (
              <div className="absolute -bottom-1 -right-1">
                <Badge
                  iconSvg={equippedBadge.icon_svg}
                  gradientFrom={equippedBadge.gradient_from}
                  gradientTo={equippedBadge.gradient_to}
                  size="sm"
                />
              </div>
            )}
          </div>

          <div className="flex-1 pb-1">
            <h2
              className="text-lg font-bold"
              style={profile.show_gradient && profile.gradient_from && profile.gradient_to ? {
                background: `linear-gradient(135deg, hsl(${profile.gradient_from}) 0%, hsl(${profile.gradient_to}) 100%)`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              } : undefined}
            >
              {profile.username}
            </h2>
            {profile.custom_title && (
              <div
                className="text-[10px] font-bold uppercase tracking-wider mb-0.5 inline-block px-1.5 py-0.5 rounded bg-secondary/50"
                style={{ color: profile.title_color || undefined }}
              >
                {profile.custom_title}
              </div>
            )}
            <p className="text-xs text-muted-foreground">Level {profile.level}</p>
          </div>
        </div>

        {/* Bio */}
        {profile.bio && (
          <p className="mt-4 text-sm text-muted-foreground leading-relaxed">
            {profile.bio}
          </p>
        )}

        {/* Stats */}
        <div className="mt-4 grid grid-cols-3 gap-3">
          <div className="flex items-center gap-2 p-2.5 rounded-xl bg-secondary/40">
            <Gamepad2 className="w-4 h-4 text-primary" />
            <div>
              <p className="text-sm font-semibold text-foreground">{profile.games_played}</p>
              <p className="text-[10px] text-muted-foreground">Games</p>
            </div>
          </div>
          <div className="flex items-center gap-2 p-2.5 rounded-xl bg-secondary/40">
            <Clock className="w-4 h-4 text-primary" />
            <div>
              <p className="text-sm font-semibold text-foreground">{formatPlayTime(profile.total_play_time)}</p>
              <p className="text-[10px] text-muted-foreground">Played</p>
            </div>
          </div>
          <div className="flex items-center gap-2 p-2.5 rounded-xl bg-secondary/40">
            <Award className="w-4 h-4 text-primary" />
            <div>
              <p className="text-sm font-semibold text-foreground">{profile.xp}</p>
              <p className="text-[10px] text-muted-foreground">XP</p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        {!isOwnProfile && user && (
          <div className="mt-4 flex gap-2">
            {friendshipStatus === 'none' && (
              <button
                onClick={sendFriendRequest}
                disabled={actionLoading}
                className="flex-1 btn-primary flex items-center justify-center gap-2"
              >
                <UserPlus className="w-4 h-4" />
                Add Friend
              </button>
            )}

            {friendshipStatus === 'pending_sent' && (
              <button
                onClick={cancelRequest}
                disabled={actionLoading}
                className="flex-1 btn-secondary flex items-center justify-center gap-2 text-muted-foreground"
              >
                <X className="w-4 h-4" />
                Cancel Request
              </button>
            )}

            {friendshipStatus === 'pending_received' && (
              <>
                <button
                  onClick={acceptRequest}
                  disabled={actionLoading}
                  className="flex-1 btn-primary flex items-center justify-center gap-2"
                >
                  <Check className="w-4 h-4" />
                  Accept
                </button>
                <button
                  onClick={cancelRequest}
                  disabled={actionLoading}
                  className="btn-secondary px-4"
                >
                  <X className="w-4 h-4" />
                </button>
              </>
            )}

            {friendshipStatus === 'friends' && (
              <div className="flex-1 text-center py-2.5 px-4 rounded-xl bg-primary/10 text-primary text-sm font-medium">
                ✓ Friends
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}