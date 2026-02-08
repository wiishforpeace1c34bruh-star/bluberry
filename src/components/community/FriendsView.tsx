import { useState, useEffect } from 'react';
import { UserPlus, Check, X, UserMinus, Search, User } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { UserProfileCard } from '../profile/UserProfileCard';

interface Friendship {
  id: string;
  user_id: string;
  friend_id: string;
  status: string;
  created_at: string;
  friend_profile?: { username: string };
  user_profile?: { username: string };
}

interface UserProfile {
  id: string;
  user_id: string;
  username: string;
  avatar_url?: string;
}

export function FriendsView() {
  const { user } = useAuth();
  const [friends, setFriends] = useState<Friendship[]>([]);
  const [pendingReceived, setPendingReceived] = useState<Friendship[]>([]);
  const [pendingSent, setPendingSent] = useState<Friendship[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<UserProfile[]>([]);
  const [searching, setSearching] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchFriendships();
    }
  }, [user]);

  const fetchFriendships = async () => {
    if (!user) return;

    // Get friendships where user is either user_id or friend_id
    const { data } = await supabase
      .from('friendships')
      .select(`
        *,
        friend_profile:profiles!friendships_friend_id_fkey(username),
        user_profile:profiles!friendships_user_id_fkey(username)
      `)
      .or(`user_id.eq.${user.id},friend_id.eq.${user.id}`);

    if (data) {
      const friendsList = data.filter(f => f.status === 'accepted');
      const received = data.filter(f => f.status === 'pending' && f.friend_id === user.id);
      const sent = data.filter(f => f.status === 'pending' && f.user_id === user.id);
      
      setFriends(friendsList as unknown as Friendship[]);
      setPendingReceived(received as unknown as Friendship[]);
      setPendingSent(sent as unknown as Friendship[]);
    }
    setLoading(false);
  };

  const searchUsers = async () => {
    if (!searchQuery.trim() || !user) return;

    setSearching(true);
    const { data } = await supabase
      .from('profiles')
      .select('id, user_id, username, avatar_url')
      .ilike('username', `%${searchQuery}%`)
      .neq('user_id', user.id)
      .limit(10);

    if (data) {
      setSearchResults(data);
    }
    setSearching(false);
  };

  const sendRequest = async (friendUserId: string) => {
    if (!user) return;

    const { error } = await supabase
      .from('friendships')
      .insert({
        user_id: user.id,
        friend_id: friendUserId,
        status: 'pending',
      });

    if (!error) {
      setSearchResults(prev => prev.filter(u => u.user_id !== friendUserId));
      fetchFriendships();
    }
  };

  const acceptRequest = async (friendshipId: string) => {
    await supabase
      .from('friendships')
      .update({ status: 'accepted' })
      .eq('id', friendshipId);
    
    fetchFriendships();
  };

  const declineRequest = async (friendshipId: string) => {
    await supabase
      .from('friendships')
      .delete()
      .eq('id', friendshipId);
    
    fetchFriendships();
  };

  const removeFriend = async (friendshipId: string) => {
    if (!confirm('Remove this friend?')) return;
    
    await supabase
      .from('friendships')
      .delete()
      .eq('id', friendshipId);
    
    fetchFriendships();
  };

  const getFriendName = (friendship: Friendship) => {
    if (!user) return 'Unknown';
    
    if (friendship.user_id === user.id) {
      const profile = Array.isArray(friendship.friend_profile) 
        ? friendship.friend_profile[0] 
        : friendship.friend_profile;
      return profile?.username || 'Unknown';
    } else {
      const profile = Array.isArray(friendship.user_profile) 
        ? friendship.user_profile[0] 
        : friendship.user_profile;
      return profile?.username || 'Unknown';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">  
      {/* Selected User Profile */}
      {selectedUserId && (
        <div className="animate-fade-in">
          <button 
            onClick={() => setSelectedUserId(null)}
            className="text-sm text-muted-foreground hover:text-foreground mb-3 flex items-center gap-1"
          >
            ← Back to friends
          </button>
          <UserProfileCard userId={selectedUserId} onClose={() => setSelectedUserId(null)} />
        </div>
      )}
      
      {!selectedUserId && (
        <>
      {/* Search */}
      <div className="card-modern p-5 rounded-2xl">
        <h3 className="font-medium text-foreground mb-3">Find Friends</h3>
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && searchUsers()}
              placeholder="Search by username..."
              className="w-full pl-10 input-modern"
            />
          </div>
          <button onClick={searchUsers} disabled={searching} className="btn-primary">
            Search
          </button>
        </div>

        {searchResults.length > 0 && (
          <div className="mt-3 space-y-2">
            {searchResults.map((profile) => (
              <div 
                key={profile.id} 
                className="flex items-center justify-between p-3 rounded-xl bg-secondary/30 hover:bg-secondary/50 transition-colors cursor-pointer"
                onClick={() => setSelectedUserId(profile.user_id)}
              >
                <div className="flex items-center gap-3">
                  {profile.avatar_url ? (
                    <img src={profile.avatar_url} alt={profile.username} className="w-9 h-9 rounded-full object-cover" />
                  ) : (
                    <div className="w-9 h-9 rounded-full bg-secondary flex items-center justify-center text-muted-foreground">
                      <User className="w-4 h-4" />
                    </div>
                  )}
                  <span className="text-sm font-medium text-foreground">{profile.username}</span>
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); sendRequest(profile.user_id); }}
                  className="p-2 rounded-xl bg-primary/20 text-primary hover:bg-primary/30 transition-colors"
                >
                  <UserPlus className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Pending Requests */}
      {pendingReceived.length > 0 && (
        <div className="card-modern p-5 rounded-2xl">
          <h3 className="font-medium text-foreground mb-4">Friend Requests</h3>
          <div className="space-y-2">
            {pendingReceived.map((req) => {
              const profile = Array.isArray(req.user_profile) ? req.user_profile[0] : req.user_profile;
              return (
                <div key={req.id} className="flex items-center justify-between p-3 rounded-xl bg-secondary/30">
                  <span className="text-sm font-medium text-foreground">{profile?.username || 'Unknown'}</span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => acceptRequest(req.id)}
                      className="p-2 rounded-xl bg-emerald-500/20 text-emerald-500 hover:bg-emerald-500/30 transition-colors"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => declineRequest(req.id)}
                      className="p-2 rounded-xl bg-destructive/20 text-destructive hover:bg-destructive/30 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Sent Requests */}
      {pendingSent.length > 0 && (
        <div className="card-modern p-5 rounded-2xl">
          <h3 className="font-medium text-foreground mb-4">Pending Sent</h3>
          <div className="space-y-2">
            {pendingSent.map((req) => {
              const profile = Array.isArray(req.friend_profile) ? req.friend_profile[0] : req.friend_profile;
              return (
                <div key={req.id} className="flex items-center justify-between p-3 rounded-xl bg-secondary/30">
                  <span className="text-sm font-medium text-muted-foreground">{profile?.username || 'Unknown'}</span>
                  <span className="text-xs text-muted-foreground px-2 py-1 rounded-lg bg-secondary">Pending</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Friends List */}
      <div className="card-modern p-5 rounded-2xl">
        <h3 className="font-medium text-foreground mb-4">Friends ({friends.length})</h3>
        
        {friends.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-4">
            No friends yet. Search for users to add!
          </p>
        )}

        <div className="space-y-2">
          {friends.map((friendship) => (
            <div 
              key={friendship.id} 
              className="flex items-center justify-between p-3 rounded-xl bg-secondary/30 hover:bg-secondary/50 transition-colors cursor-pointer"
              onClick={() => {
                const friendUserId = friendship.user_id === user?.id ? friendship.friend_id : friendship.user_id;
                setSelectedUserId(friendUserId);
              }}
            >
              <span className="text-sm font-medium text-foreground">{getFriendName(friendship)}</span>
              <button
                onClick={(e) => { e.stopPropagation(); removeFriend(friendship.id); }}
                className="p-2 rounded-xl text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
              >
                <UserMinus className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>
        </>
      )}
    </div>
  );
}