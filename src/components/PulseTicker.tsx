import React, { useState, useEffect, memo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { MessageSquare, Trophy, User, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PulseEvent {
    id: string;
    type: 'chat' | 'level' | 'join' | 'system';
    message: string;
    timestamp: number;
    icon: React.ReactNode;
}

export const PulseTicker = memo(() => {
    const [events, setEvents] = useState<PulseEvent[]>([]);

    useEffect(() => {
        // Initial system message
        const initialEvent: PulseEvent = {
            id: 'init',
            type: 'system',
            message: 'Sapphire Prime Systems Online. Pulse Ticker active.',
            timestamp: Date.now(),
            icon: <Zap className="w-3 h-3 text-primary animate-pulse" />
        };
        setEvents([initialEvent]);

        // Listen to real-time events
        const chatChannel = supabase
            .channel('pulse-events')
            .on(
                'postgres_changes',
                { event: 'INSERT', schema: 'public', table: 'chat_messages' },
                async (payload) => {
                    // Fetch user name for the event
                    const { data: profile } = await supabase
                        .from('profiles')
                        .select('username')
                        .eq('user_id', payload.new.user_id)
                        .single();

                    const newEvent: PulseEvent = {
                        id: payload.new.id,
                        type: 'chat',
                        message: `${profile?.username || 'Somebody'} just messaged in Global Lounge`,
                        timestamp: Date.now(),
                        icon: <MessageSquare className="w-3 h-3 text-sapphire" />
                    };
                    addEvent(newEvent);
                }
            )
            .on(
                'postgres_changes',
                { event: 'UPDATE', schema: 'public', table: 'profiles' },
                (payload) => {
                    // Check for level ups
                    if (payload.old.level < payload.new.level) {
                        const newEvent: PulseEvent = {
                            id: `lvl-${Date.now()}`,
                            type: 'level',
                            message: `${payload.new.username} ascended to Level ${payload.new.level}!`,
                            timestamp: Date.now(),
                            icon: <Trophy className="w-3 h-3 text-yellow-500" />
                        };
                        addEvent(newEvent);
                    }
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(chatChannel);
        };
    }, []);

    const addEvent = (event: PulseEvent) => {
        setEvents(prev => {
            const next = [event, ...prev].slice(0, 5);
            return next;
        });
    };

    if (events.length === 0) return null;

    return (
        <div className="fixed bottom-0 left-0 right-0 z-40 h-8 bg-black/60 backdrop-blur-xl border-t border-white/5 flex items-center overflow-hidden">
            <div className="flex items-center gap-8 px-6 animate-marquee whitespace-nowrap">
                {events.map((event) => (
                    <div key={event.id} className="flex items-center gap-2.5 transition-all duration-1000">
                        <div className="flex items-center justify-center w-5 h-5 rounded-full bg-white/5 border border-white/10">
                            {event.icon}
                        </div>
                        <span className="text-[10px] font-bold tracking-wider text-white/50 uppercase">
                            <span className="text-white/90 mr-1">{event.type}:</span>
                            {event.message}
                        </span>
                    </div>
                ))}
                {/* Fill to ensure smooth scroll if few events */}
                {events.length < 3 && events.map((event) => (
                    <div key={event.id + '-clone'} className="flex items-center gap-2.5 opacity-40">
                        <div className="flex items-center justify-center w-5 h-5 rounded-full bg-white/5 border border-white/10">
                            {event.icon}
                        </div>
                        <span className="text-[10px] font-bold tracking-wider text-white/50 uppercase">
                            <span className="text-white/90 mr-1">{event.type}:</span>
                            {event.message}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
});

PulseTicker.displayName = 'PulseTicker';
