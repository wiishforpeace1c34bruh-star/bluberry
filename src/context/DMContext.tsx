import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export interface DMThread {
    id: string;
    created_at: string;
    last_message_at: string;
    other_participant?: {
        username: string;
        avatar_url?: string;
    };
}

export interface DirectMessage {
    id: string;
    thread_id: string;
    sender_id: string;
    content: string;
    created_at: string;
}

interface DMContextType {
    threads: DMThread[];
    activeThread: DMThread | null;
    messages: DirectMessage[];
    loading: boolean;
    setActiveThread: (thread: DMThread | null) => void;
    sendMessage: (content: string) => Promise<void>;
    startThread: (otherUserId: string) => Promise<string>;
}

const DMContext = createContext<DMContextType | undefined>(undefined);

export function DMProvider({ children }: { children: React.ReactNode }) {
    const { user } = useAuth();
    const [threads, setThreads] = useState<DMThread[]>([]);
    const [activeThread, setActiveThread] = useState<DMThread | null>(null);
    const [messages, setMessages] = useState<DirectMessage[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchThreads = useCallback(async () => {
        if (!user) return;
        setLoading(true);

        const { data: participants, error: pError } = await (supabase
            .from('dm_participants' as any))
            .select('thread_id')
            .eq('user_id', user.id);

        if (participants && participants.length > 0) {
            const threadIds = (participants as any[]).map(p => p.thread_id);

            const { data: threadsData } = await (supabase
                .from('dm_threads' as any))
                .select('*')
                .in('id', threadIds)
                .order('last_message_at', { ascending: false });

            if (threadsData) {
                // Hydrate with other participant info
                const hydratedThreads = await Promise.all((threadsData as any[]).map(async (t) => {
                    const { data: other } = await (supabase
                        .from('dm_participants' as any))
                        .select('user_id')
                        .eq('thread_id', t.id)
                        .neq('user_id', user.id)
                        .single();

                    if (other) {
                        const { data: profile } = await supabase
                            .from('profiles')
                            .select('username, avatar_url')
                            .eq('user_id', (other as any).user_id)
                            .single();

                        return { ...t, other_participant: profile };
                    }
                    return t;
                }));

                setThreads(hydratedThreads as DMThread[]);
            }
        }
        setLoading(false);
    }, [user]);

    useEffect(() => {
        fetchThreads();
    }, [fetchThreads]);

    useEffect(() => {
        if (!activeThread) {
            setMessages([]);
            return;
        }

        const fetchMessages = async () => {
            const { data } = await (supabase
                .from('direct_messages' as any))
                .select('*')
                .eq('thread_id', activeThread.id)
                .order('created_at', { ascending: true });

            if (data) setMessages(data as DirectMessage[]);
        };

        fetchMessages();

        const channel = supabase
            .channel(`thread-${activeThread.id}`)
            .on(
                'postgres_changes',
                { event: 'INSERT', schema: 'public', table: 'direct_messages', filter: `thread_id=eq.${activeThread.id}` },
                (payload) => {
                    setMessages(prev => [...prev, payload.new as DirectMessage]);
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [activeThread]);

    const sendMessage = async (content: string) => {
        if (!user || !activeThread) return;

        const { error } = await (supabase
            .from('direct_messages' as any))
            .insert({
                thread_id: activeThread.id,
                sender_id: user.id,
                content: content.trim()
            } as any);

        if (!error) {
            // Update last_message_at
            await (supabase
                .from('dm_threads' as any))
                .update({ last_message_at: new Date().toISOString() } as any)
                .eq('id', activeThread.id);
        }
    };

    const startThread = async (otherUserId: string) => {
        if (!user) throw new Error('Not authenticated');

        // Check if thread already exists
        const { data: existing } = await supabase.rpc('get_existing_thread', {
            user1: user.id,
            user2: otherUserId
        });

        if (existing && (existing as any).length > 0) {
            return (existing as any)[0].thread_id;
        }

        // Create new thread
        const { data: thread, error: tError } = await (supabase
            .from('dm_threads' as any))
            .insert({} as any)
            .select()
            .single();

        if (tError) throw tError;

        // Add participants
        await (supabase.from('dm_participants' as any)).insert([
            { thread_id: (thread as any).id, user_id: user.id },
            { thread_id: (thread as any).id, user_id: otherUserId }
        ] as any);

        await fetchThreads();
        return (thread as any).id;
    };

    return (
        <DMContext.Provider value={{ threads, activeThread, messages, loading, setActiveThread, sendMessage, startThread }}>
            {children}
        </DMContext.Provider>
    );
}

export const useDM = () => {
    const context = useContext(DMContext);
    if (!context) throw new Error('useDM must be used within a DMProvider');
    return context;
};
