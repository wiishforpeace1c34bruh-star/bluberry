import { useState, useEffect, useRef, memo } from 'react';
import { Send, AlertTriangle, ArrowDown, User } from 'lucide-react';
import { Virtuoso, VirtuosoHandle } from 'react-virtuoso';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';

interface DirectMessage {
    id: string;
    sender_id: string;
    thread_id: string;
    content: string;
    created_at: string;
}

interface DMChatProps {
    threadId: string;
}

export function DMChat({ threadId }: DMChatProps) {
    const { user } = useAuth();
    const [messages, setMessages] = useState<DirectMessage[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const [error, setError] = useState('');
    const [showScrollButton, setShowScrollButton] = useState(false);
    const virtuosoRef = useRef<VirtuosoHandle>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (threadId) {
            fetchMessages();
            subscribeToMessages();
        }
    }, [threadId]);

    const fetchMessages = async () => {
        setLoading(true);
        const { data, error } = await (supabase
            .from('direct_messages' as any)
            .select('*')
            .eq('thread_id', threadId)
            .order('created_at', { ascending: true }) as any);

        if (!error && data) {
            setMessages(data as DirectMessage[]);
        }
        setLoading(false);
    };

    const subscribeToMessages = () => {
        const channel = supabase
            .channel(`dm-${threadId}`)
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'direct_messages',
                    filter: `thread_id=eq.${threadId}`
                },
                (payload) => {
                    const newMsg = payload.new as DirectMessage;
                    setMessages((prev) => {
                        if (prev.some(m => m.id === newMsg.id)) return prev;
                        return [...prev, newMsg];
                    });
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    };

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user || !newMessage.trim() || sending) return;

        setSending(true);
        setError('');

        const { error: sendError } = await (supabase
            .from('direct_messages' as any)
            .insert({
                thread_id: threadId,
                sender_id: user.id,
                content: newMessage.trim(),
            }) as any);

        if (sendError) {
            setError('Failed to send message');
        } else {
            setNewMessage('');
            inputRef.current?.focus();
        }

        setSending(false);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-16 h-full">
                <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full bg-background/40">
            {/* Header */}
            <div className="px-6 py-4 border-b border-border/20 flex items-center justify-between bg-card/50 backdrop-blur-md">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-secondary flex items-center justify-center border border-border/30">
                        <User className="w-5 h-5 text-muted-foreground" />
                    </div>
                    <div>
                        <div className="font-bold text-foreground">Private Chat</div>
                        <div className="text-[10px] text-green-500 font-medium uppercase tracking-wider flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                            Secure Connection
                        </div>
                    </div>
                </div>
            </div>

            {/* Messages */}
            <div className="flex-1 relative">
                {messages.length === 0 ? (
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-muted-foreground pointer-events-none p-10 text-center">
                        <div className="w-16 h-16 rounded-3xl bg-secondary/50 flex items-center justify-center mb-4">
                            <Send className="w-8 h-8 opacity-20" />
                        </div>
                        <p className="text-sm font-medium">This is the beginning of your private message history.</p>
                        <p className="text-xs opacity-60 mt-1">Say something awesome!</p>
                    </div>
                ) : (
                    <Virtuoso
                        ref={virtuosoRef}
                        data={messages}
                        initialTopMostItemIndex={messages.length - 1}
                        followOutput={'auto'}
                        atBottomStateChange={(atBottom) => setShowScrollButton(!atBottom)}
                        itemContent={(index, msg) => {
                            const isOwn = msg.sender_id === user?.id;
                            return (
                                <div className={cn("px-6 py-2 flex", isOwn ? "justify-end" : "justify-start")}>
                                    <div className={cn(
                                        "max-w-[80%] px-4 py-2.5 rounded-2xl text-sm shadow-sm",
                                        isOwn
                                            ? "bg-primary text-primary-foreground rounded-tr-none"
                                            : "bg-secondary/80 text-foreground rounded-tl-none border border-border/20"
                                    )}>
                                        {msg.content}
                                        <div className={cn("text-[9px] mt-1 opacity-50 text-right", isOwn ? "text-primary-foreground" : "text-muted-foreground")}>
                                            {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </div>
                                    </div>
                                </div>
                            );
                        }}
                        className="h-full scrollbar-thin scrollbar-thumb-primary/10 scrollbar-track-transparent"
                    />
                )}

                {showScrollButton && (
                    <button
                        onClick={() => virtuosoRef.current?.scrollToIndex({ index: messages.length - 1, behavior: 'smooth' })}
                        className="absolute bottom-6 right-6 p-3 rounded-2xl bg-primary text-primary-foreground shadow-2xl hover:translate-y-[-4px] transition-all animate-fade-in z-50"
                    >
                        <ArrowDown className="w-5 h-5" />
                    </button>
                )}
            </div>

            {/* Input */}
            <div className="p-6 bg-secondary/10 border-t border-border/20">
                {error && (
                    <div className="flex items-center gap-2 text-destructive text-xs mb-3 animate-shake font-medium bg-destructive/5 p-2 rounded-lg border border-destructive/20">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        {error}
                    </div>
                )}

                <form onSubmit={handleSend} className="flex items-center gap-3">
                    <input
                        ref={inputRef}
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Write a message..."
                        disabled={sending}
                        className="flex-1 h-12 bg-background/80 border-border/20 rounded-[1.25rem] px-5 text-sm focus:ring-2 focus:ring-primary/20 transition-all shadow-inner"
                    />
                    <button
                        type="submit"
                        disabled={!newMessage.trim() || sending}
                        className="w-12 h-12 flex items-center justify-center rounded-[1.25rem] bg-primary text-primary-foreground disabled:opacity-50 transition-all duration-500 hover:scale-105 active:scale-95 shadow-lg shadow-primary/30"
                    >
                        {sending ? (
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                            <Send className="w-5 h-5" />
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
}
