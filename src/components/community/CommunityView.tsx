import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { MessageCircle, Ticket, Users, UserPlus } from 'lucide-react';
import { ChatRoom } from './ChatRoom';
import { TicketsView } from './TicketsView';
import { FriendsView } from './FriendsView';
import { CommunitySidebar } from './CommunitySidebar';
import { DMChat } from './DMChat';
import { useAuth } from '@/hooks/useAuth';

type CommunityTab = 'chat' | 'tickets' | 'friends';



export function CommunityView() {
  const [activeTab, setActiveTab] = useState<CommunityTab>('chat');
  const { user, profile } = useAuth();
  const [onlineCount, setOnlineCount] = useState(0);

  const [activeChannelId, setActiveChannelId] = useState<string | null>(null);
  const [activeDMId, setActiveDMId] = useState<string | null>(null);

  useEffect(() => {
    const fetchOnlineCount = async () => {
      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
      const { count, error } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .gt('last_seen_at', fiveMinutesAgo);

      if (!error && count !== null) {
        setOnlineCount(count);
      }
    };

    fetchOnlineCount();
    const interval = setInterval(fetchOnlineCount, 30000); // Poll every 30s as fallback

    // Real-time listener for last_seen_at updates
    const channel = supabase
      .channel('online-presence')
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'profiles'
      }, () => {
        fetchOnlineCount();
      })
      .subscribe();

    return () => {
      clearInterval(interval);
      supabase.removeChannel(channel);
    };
  }, []);

  const tabs = [
    { id: 'chat' as CommunityTab, label: 'Community', icon: MessageCircle },
    { id: 'tickets' as CommunityTab, label: 'Support', icon: Ticket },
    { id: 'friends' as CommunityTab, label: 'Friends', icon: Users },
  ];

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center animate-fade-in">
        <div className="w-20 h-20 rounded-3xl bg-primary/10 flex items-center justify-center mb-6 shadow-glow-sm">
          <UserPlus className="w-10 h-10 text-primary" />
        </div>
        <h2 className="text-2xl font-bold text-foreground mb-3">Join the Community</h2>
        <p className="text-muted-foreground max-w-md mb-8 px-4">
          Sign up to access channels, chat with players, and build your gaming network.
        </p>
        <a
          href="/auth"
          className="btn-primary px-8 py-3 rounded-2xl shadow-lg shadow-primary/20 flex items-center gap-2"
        >
          Get Started <UserPlus className="w-5 h-5" />
        </a>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col space-y-4">
      <div className="flex items-center justify-between">
        {/* Sub-tabs */}
        <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-secondary/30 w-fit border border-border/10">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm
                  transition-all duration-500
                  ${isActive
                    ? 'bg-primary/20 text-primary shadow-sm ring-1 ring-primary/20'
                    : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50'
                  }
                `}
              >
                <Icon className={`w-4 h-4 transition-transform duration-500 ${isActive ? 'scale-110' : ''}`} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {activeTab === 'chat' && (
          <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground bg-secondary/30 px-3 py-1.5 rounded-full border border-border/10">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.5)]" />
            {onlineCount.toLocaleString()} Online
          </div>
        )}
      </div>

      {/* Content */}
      <div className="animate-fade-in flex-1 bg-card/30 rounded-[2rem] border border-border/20 overflow-hidden shadow-2xl backdrop-blur-xl flex flex-col h-full">
        {activeTab === 'chat' && (
          <div className="flex flex-1 overflow-hidden">
            <CommunitySidebar
              activeChannel={activeChannelId}
              onChannelSelect={(id) => {
                setActiveChannelId(id);
                setActiveDMId(null);
              }}
              activeDM={activeDMId}
              onDMSelect={(id) => {
                setActiveDMId(id);
                setActiveChannelId(null);
              }}
            />
            <div className="flex-1 flex flex-col bg-background/20 relative overflow-hidden">
              {activeChannelId ? (
                <ChatRoom channelId={activeChannelId} />
              ) : activeDMId ? (
                <DMChat threadId={activeDMId} />
              ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground flex-col gap-4">
                  <div className="w-20 h-20 rounded-[2.5rem] bg-secondary/50 flex items-center justify-center border border-border/20">
                    <MessageCircle className="w-10 h-10 opacity-20" />
                  </div>
                  <p className="text-sm font-medium opacity-50">Select a channel or friend to start chatting</p>
                </div>
              )}
            </div>
          </div>
        )}
        {activeTab === 'tickets' && <div className="p-8"><TicketsView /></div>}
        {activeTab === 'friends' && <div className="p-8"><FriendsView /></div>}
      </div>
    </div>
  );
}