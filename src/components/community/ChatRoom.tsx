import { useState, useEffect, useRef, useCallback, memo } from 'react';
import { Send, AlertTriangle, Trash2, ArrowDown, ExternalLink, Shield, Zap, Star, Trophy, Sparkles } from 'lucide-react';
import { Virtuoso, VirtuosoHandle } from 'react-virtuoso';
import { supabase } from '@/integrations/supabase/client';
import { useAuth, checkProfanity } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { useDM } from '@/context/DMContext';
import { HolographicProfileHover } from '../profile/HolographicProfileHover';
import { PublicProfileCard } from '../profile/PublicProfileCard';
import { CrystalizedBadge } from '../CrystalizedBadge';
import { cn } from '@/lib/utils';
import { getIdentityDecorations } from '@/lib/identity';

interface ChatMessage {
  id: string;
  user_id: string;
  content: string;
  channel_id: string;
  is_flagged: boolean;
  is_deleted: boolean;
  created_at: string;
  profile?: {
    username: string;
    gradient_from?: string;
    gradient_to?: string;
    show_gradient?: boolean;
    avatar_url?: string;
    level?: number;
    equipped_badge_id?: string;
    equipped_badge?: {
      icon_svg?: string;
      gradient_from?: string;
      gradient_to?: string;
    };
  };
  user_roles?: { role: string }[];
}

const SPAM_LIMIT = 5;
const SPAM_WINDOW_MS = 10000;

// Memoized message item component for performance
const MessageItem = memo(({ msg, currentUserId, isAdmin, onDelete, onProfileClick }: {
  msg: ChatMessage;
  currentUserId?: string;
  isAdmin: boolean;
  onDelete: (id: string) => void;
  onProfileClick: (profile: any) => void;
}) => {
  const profile = Array.isArray(msg.profile) ? msg.profile[0] : msg.profile;
  const { isOwner, title, specialBadges } = getIdentityDecorations(profile?.username);

  const getRoleColor = (roles?: { role: string }[]) => {
    if (isOwner) return 'owner-gradient-text';
    if (!roles || roles.length === 0) return null;
    const role = roles[0]?.role;
    if (role === 'admin') return 'from-primary to-accent';
    if (role === 'moderator') return 'from-emerald-400 to-teal-500';
    if (role === 'officer') return 'from-amber-400 to-orange-500';
    return null;
  };

  const canDelete = (userId: string) => {
    if (!currentUserId) return false;
    if (userId === currentUserId) return true;
    if (isAdmin) return true;
    return false;
  };

  const formatTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  const roleGradient = getRoleColor(msg.user_roles);
  const showGradient = (profile?.show_gradient && profile?.gradient_from && profile?.gradient_to) || isOwner;

  return (
    <div className={cn(
      "group flex items-start gap-4 animate-fade-in hover:bg-white/5 p-2 rounded-2xl transition-all duration-300 mb-1",
      isOwner && "bg-blue-400/5 border border-blue-400/10"
    )}>
      {/* Avatar */}
      <HolographicProfileHover profile={profile}>
        <div
          className="relative flex-shrink-0 cursor-pointer hover:scale-105 active:scale-95 transition-transform duration-300"
          onClick={() => onProfileClick(profile)}
        >
          {profile?.avatar_url ? (
            <img
              src={profile.avatar_url}
              alt={profile.username}
              className={cn(
                "w-10 h-10 rounded-2xl object-cover ring-2 transition-all duration-500",
                isOwner ? "ring-blue-400 shadow-[0_0_15px_-5px_rgba(96,165,250,0.8)]" : "ring-border/20 group-hover:ring-primary/40"
              )}
              loading="lazy"
            />
          ) : (
            <div className={cn(
              "w-10 h-10 rounded-2xl flex items-center justify-center text-sm font-bold shadow-lg",
              isOwner ? "bg-gradient-to-br from-red-500 via-white to-red-500 text-red-900" :
                roleGradient ? `bg-gradient-to-br ${roleGradient} text-primary-foreground` : 'bg-secondary/50 text-muted-foreground'
            )}>
              {profile?.username?.charAt(0).toUpperCase() || '?'}
            </div>
          )}
          {/* Presence Indicator - Simulated for now */}
          <div className={cn(
            "absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-background shadow-sm",
            isOwner ? "bg-blue-400 animate-pulse" : "bg-green-500"
          )} />
        </div>
      </HolographicProfileHover>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5 flex-wrap">
          <HolographicProfileHover profile={profile}>
            <span
              onClick={() => onProfileClick(profile)}
              className={cn(
                "font-bold text-sm tracking-tight cursor-pointer hover:underline decoration-primary/30 underline-offset-2 transition-all",
                isOwner ? "owner-gradient-text" : showGradient ? 'gradient-text' : roleGradient ? 'text-primary' : 'text-foreground/90'
              )}
              style={!isOwner && showGradient && profile ? {
                background: `linear-gradient(135deg, hsl(${profile.gradient_from}) 0%, hsl(${profile.gradient_to}) 100%)`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              } : undefined}
            >
              <span className={cn(
                "transition-all duration-300 hover:scale-105 cursor-pointer flex items-center gap-1.5",
                getPrestigeStyles(msg.profile?.level)
              )}>
                {msg.profile?.username || 'Unknown'}
                {isOwner ? <span className="text-lg leading-none filter drop-shadow-[0_0_8px_rgba(239,68,68,0.5)]" title="REPENT">🩸</span> : getPrestigeIcon(msg.profile?.level)}
              </span>
            </span>
          </HolographicProfileHover>

          {/* Sudo Badges & Title */}
          {isOwner && (
            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-blue-400/10 border border-blue-400/20 scale-90 origin-left">
              {specialBadges.map((badge, idx) => (
                <badge.icon key={idx} className={cn("w-3 h-3", badge.color, badge.animate && "animate-pulse")} />
              ))}
              <span className="text-[9px] font-black text-blue-400 uppercase tracking-widest">{title}</span>
            </div>
          )}

          <span className="text-[10px] font-medium text-muted-foreground/60 uppercase tracking-widest">
            {formatTime(msg.created_at)}
          </span>

          {canDelete(msg.user_id) && !msg.is_deleted && (
            <button
              onClick={() => onDelete(msg.id)}
              className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-muted-foreground/40 hover:text-destructive hover:bg-destructive/10 transition-all ml-auto"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className={cn(
          "text-sm leading-relaxed max-w-4xl",
          isOwner ? "text-white font-medium" : msg.is_flagged ? 'text-muted-foreground italic' : 'text-foreground/80'
        )}>
          {msg.is_deleted
            ? <span className="text-muted-foreground/40 italic text-xs bg-secondary/30 px-2 py-0.5 rounded-md">[Message purged by system]</span>
            : msg.is_flagged
              ? '[Message flagged for community review]'
              : msg.content
          }
        </div>
      </div>
    </div>
  );
});

MessageItem.displayName = 'MessageItem';

interface ChatRoomProps {
  channelId: string;
}

const getPrestigeStyles = (level: number = 1) => {
  if (level >= 100) return "bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 bg-clip-text text-transparent animate-pulse font-black drop-shadow-[0_0_8px_rgba(168,85,247,0.5)]";
  if (level >= 75) return "text-orange-400 font-bold drop-shadow-[0_0_5px_rgba(251,146,60,0.8)] animate-pulse";
  if (level >= 50) return "text-indigo-400 font-bold drop-shadow-[0_0_5px_rgba(129,140,248,0.5)]";
  if (level >= 25) return "text-sapphire font-bold";
  return "text-white/90 font-bold";
};

const getPrestigeIcon = (level: number = 1) => {
  if (level >= 100) return <Sparkles className="w-3 h-3 text-purple-400" />;
  if (level >= 75) return <Trophy className="w-3 h-3 text-orange-400" />;
  if (level >= 50) return <Star className="w-3 h-3 text-indigo-400" />;
  if (level >= 25) return <Zap className="w-3 h-3 text-sapphire" />;
  return null;
};

export function ChatRoom({ channelId }: ChatRoomProps) {
  const { user, isAdmin, profile } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const [messageTimestamps, setMessageTimestamps] = useState<number[]>([]);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState<any | null>(null);
  const virtuosoRef = useRef<VirtuosoHandle>(null);
  const { setActiveThread, startThread } = useDM();
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);

  const handleStartDM = async (targetProfile: any) => {
    if (!targetProfile?.user_id) return;
    try {
      const threadId = await startThread(targetProfile.user_id);
      setActiveThread({
        id: threadId,
        created_at: new Date().toISOString(),
        last_message_at: new Date().toISOString(),
        other_participant: {
          username: targetProfile.username,
          avatar_url: targetProfile.avatar_url
        }
      });
      setSelectedProfile(null); // Close the profile card
    } catch (error) {
      console.error('Failed to start DM', error);
      setError('Failed to start conversation');
    }
  };

  const handleViewProfile = (userId: string) => {
    navigate(`/profile/${userId}`);
    setSelectedProfile(null);
  };

  // Initial fetch
  useEffect(() => {
    if (channelId) {
      fetchMessages();
    }
  }, [channelId]);

  // Realtime subscription optimization
  useEffect(() => {
    if (!channelId) return;

    const channel = supabase
      .channel(`chat-messages`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages'
        },
        async (payload) => {
          const newMsg = payload.new as ChatMessage;

          // Only add if not already in list (prevents duplicate with optimistic update)
          setMessages((prev) => {
            if (prev.some(m => m.id === newMsg.id)) return prev;

            // Just for the new message check, we'll wait for the profile to be fetched 
            // but we can also use a temporary profile if needed.
            return [...prev, newMsg];
          });

          // Fetch profile details for the new message in the background
          const [profileRes, rolesRes] = await Promise.all([
            supabase.from('profiles').select('user_id, username, gradient_from, gradient_to, show_gradient, avatar_url, bio, banner_url, status_message, social_links').eq('user_id', newMsg.user_id).single(),
            supabase.from('user_roles').select('role').eq('user_id', newMsg.user_id)
          ]);

          setMessages((prev) =>
            prev.map(m => m.id === newMsg.id ? {
              ...m,
              profile: profileRes.data || undefined,
              user_roles: rolesRes.data || []
            } : m)
          );
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'chat_messages'
        },
        (payload) => {
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === payload.new.id ? { ...msg, ...payload.new } : msg
            )
          );
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [channelId]);

  const fetchMessages = async () => {
    setLoading(true);
    const { data, error } = await ((supabase as any)
      .from('chat_messages')
      .select('*')
      .eq('is_deleted', false)
      .order('created_at', { ascending: true })
      .limit(100));

    if (!error && data) {
      const userIds = [...new Set(data.map(m => m.user_id))] as string[];

      const [profilesRes, rolesRes] = await Promise.all([
        supabase.from('profiles').select('user_id, username, gradient_from, gradient_to, show_gradient, avatar_url, bio, banner_url, status_message, social_links').in('user_id', userIds),
        supabase.from('user_roles').select('user_id, role').in('user_id', userIds)
      ]);

      const profilesMap = new Map(profilesRes.data?.map(p => [p.user_id, p]) || []);
      const rolesMap = new Map();

      rolesRes.data?.forEach(r => {
        if (!rolesMap.has(r.user_id)) rolesMap.set(r.user_id, []);
        rolesMap.get(r.user_id).push({ role: r.role });
      });

      const messagesWithProfiles = data.map(msg => ({
        ...msg,
        profile: profilesMap.get(msg.user_id),
        user_roles: rolesMap.get(msg.user_id) || []
      }));

      setMessages(messagesWithProfiles as unknown as ChatMessage[]);
    }
    setLoading(false);
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newMessage.trim() || sending) return;

    // Spam check
    const now = Date.now();
    const recentMessages = messageTimestamps.filter(ts => now - ts < SPAM_WINDOW_MS);
    if (recentMessages.length >= SPAM_LIMIT) {
      setError('Slow down! You\'re sending messages too fast.');
      return;
    }

    // Profanity check
    if (checkProfanity(newMessage)) {
      setError('Your message contains inappropriate language.');
      return;
    }

    setSending(true);
    setError('');

    const tempId = Math.random().toString(36).substr(2, 9);
    const optimisticMsg: ChatMessage = {
      id: tempId,
      user_id: user.id,
      content: newMessage.trim(),
      channel_id: 'global', // Assuming a global channel for now
      is_flagged: false,
      is_deleted: false,
      created_at: new Date().toISOString(),
      profile: {
        username: profile?.username || 'You',
        avatar_url: profile?.avatar_url,
        gradient_from: profile?.gradient_from,
        gradient_to: profile?.gradient_to,
        show_gradient: profile?.show_gradient
      },
      user_roles: [] // Optimistically empty, will be filled by real-time update
    };

    setMessages(prev => [...prev, optimisticMsg]);
    setNewMessage('');

    const { data: sentData, error: sendError } = await supabase
      .from('chat_messages')
      .insert({
        user_id: user.id,
        content: optimisticMsg.content,
        is_flagged: false,
        is_deleted: false
      })
      .select()
      .single();

    if (sendError) {
      setError('Failed to send message');
      setMessages(prev => prev.filter(m => m.id !== tempId));
    } else if (sentData) {
      // Replace optimistic message with real message to maintain DB ID and exact timestamp
      // The real-time listener will also pick this up, but this ensures immediate consistency
      setMessages(prev => prev.map(m => m.id === tempId ? { ...m, ...sentData } : m));
      setMessageTimestamps([...recentMessages, now]);
      inputRef.current?.focus();
    }

    setSending(false);
  };

  const handleDelete = async (messageId: string) => {
    const { error } = await supabase
      .from('chat_messages')
      .update({ is_deleted: true, deleted_by: user?.id })
      .eq('id', messageId);

    if (!error) {
      // Optimistic update for delete
      setMessages(prev => prev.map(m => m.id === messageId ? { ...m, is_deleted: true } : m));
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16 h-[450px]">
        <div className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="rounded-2xl overflow-hidden flex flex-col h-full relative">
      {/* Messages Area */}
      <div className="flex-1 relative bg-card/50">
        {messages.length === 0 ? (
          <div className="absolute inset-0 flex items-center justify-center text-muted-foreground pointer-events-none">
            No messages yet. Be the first to say something!
          </div>
        ) : (
          <Virtuoso
            ref={virtuosoRef}
            data={messages}
            totalCount={messages.length}
            initialTopMostItemIndex={messages.length - 1}
            followOutput={'auto'}
            atBottomStateChange={(atBottom) => setShowScrollButton(!atBottom)}
            itemContent={(index, msg) => (
              <div className="px-4 py-1">
                <MessageItem
                  msg={msg}
                  currentUserId={user?.id}
                  isAdmin={!!isAdmin}
                  onDelete={handleDelete}
                  onProfileClick={setSelectedProfile}
                />
              </div>
            )}
            className="h-full scrollbar-thin scrollbar-thumb-primary/20 scrollbar-track-transparent"
          />
        )}

        {/* Scroll to bottom button */}
        {showScrollButton && (
          <button
            onClick={() => virtuosoRef.current?.scrollToIndex({ index: messages.length - 1, behavior: 'smooth' })}
            className="absolute bottom-4 right-4 p-2 rounded-full bg-primary text-primary-foreground shadow-lg hover:translate-y-[-2px] transition-all animate-fade-in z-10"
          >
            <ArrowDown className="w-4 h-4" />
          </button>
        )}

        {/* Profile Card Popup */}
        {selectedProfile && (
          <div className="absolute inset-0 z-[100] flex items-center justify-center p-4 bg-background/60 backdrop-blur-sm animate-fade-in">
            <PublicProfileCard
              profile={selectedProfile}
              onClose={() => setSelectedProfile(null)}
              onStartDM={() => handleStartDM(selectedProfile)}
              onViewProfile={handleViewProfile}
            />
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="border-t border-border/20 p-4 bg-secondary/20 z-10">
        {error && (
          <div className="flex items-center gap-2 text-destructive text-xs mb-2 animate-fade-in-up">
            <AlertTriangle className="w-3 h-3" />
            {error}
          </div>
        )}

        <form onSubmit={handleSend} className="flex items-center gap-2">
          <input
            ref={inputRef}
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder={user ? "Type a message..." : "Please sign in to chat"}
            maxLength={500}
            disabled={!user || sending}
            className="flex-1 input-modern bg-card/80 text-sm h-10"
          />
          <button
            type="submit"
            disabled={!user || !newMessage.trim() || sending}
            className="p-2.5 rounded-xl bg-primary text-primary-foreground disabled:opacity-50 transition-all duration-300 hover:brightness-110 hover:shadow-md hover:shadow-primary/20"
          >
            {sending ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </button>
        </form>
      </div>
    </div>
  );
}