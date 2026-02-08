import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Profile } from '@/hooks/useAuth';
import { Users, Gamepad2, Circle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipTrigger } from './ui/tooltip';

export function SquadPresence() {
    const [activeProfiles, setActiveProfiles] = useState<Profile[]>([]);

    useEffect(() => {
        // Initial fetch of active users (last seen in last 5 mins)
        const fetchActive = async () => {
            const fiveMinsAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
            const { data } = await supabase
                .from('profiles')
                .select('*')
                .gt('last_presence_at', fiveMinsAgo)
                .order('last_presence_at', { ascending: false })
                .limit(10);

            if (data) setActiveProfiles(data as Profile[]);
        };

        fetchActive();

        // Subscribe to presence updates
        const channel = supabase
            .channel('online-squad')
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'profiles' },
                () => fetchActive() // Re-fetch for simplicity/consistency
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    return (
        <div className="flex flex-col gap-4 p-4 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-xl">
            <div className="flex items-center justify-between px-2">
                <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-primary" />
                    <h3 className="text-[10px] font-black uppercase tracking-widest text-white/50">Online Squad</h3>
                </div>
                <span className="text-[10px] font-black text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                    {activeProfiles.length}
                </span>
            </div>

            <div className="flex flex-col gap-2">
                {activeProfiles.map((p) => (
                    <Tooltip key={p.id}>
                        <TooltipTrigger asChild>
                            <div className="group flex items-center gap-3 p-2 rounded-2xl hover:bg-white/5 transition-all cursor-pointer">
                                <div className="relative">
                                    <div className="w-10 h-10 rounded-xl bg-secondary overflow-hidden border border-white/10 group-hover:border-primary/30 transition-colors">
                                        {p.avatar_url ? (
                                            <img src={p.avatar_url} alt={p.username} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-sm font-black text-white/20">
                                                {p.username.charAt(0).toUpperCase()}
                                            </div>
                                        )}
                                    </div>
                                    <div className={cn(
                                        "absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full border-2 border-[#0a0b14]",
                                        p.status_type === 'online' ? "bg-green-500" :
                                            p.status_type === 'gaming' ? "bg-primary animate-pulse" :
                                                p.status_type === 'idle' ? "bg-yellow-500" : "bg-muted-foreground"
                                    )} />
                                </div>
                                <div className="flex flex-col min-w-0">
                                    <span className="text-xs font-bold text-white/90 truncate">{p.username}</span>
                                    <span className="text-[10px] text-white/40 truncate">
                                        {p.status_type === 'gaming' ? 'Playing a Game' : (p.status_message || p.status_type)}
                                    </span>
                                </div>
                            </div>
                        </TooltipTrigger>
                        <TooltipContent side="right" className="bg-black/90 border-white/10 backdrop-blur-xl">
                            <div className="flex flex-col gap-1 p-1">
                                <p className="text-xs font-black text-primary uppercase tracking-tighter">Level {p.level} Operative</p>
                                <p className="text-[10px] text-white/60 font-medium">Last active: {new Date(p.last_presence_at || '').toLocaleTimeString()}</p>
                            </div>
                        </TooltipContent>
                    </Tooltip>
                ))}
                {activeProfiles.length === 0 && (
                    <div className="py-4 text-center">
                        <span className="text-[10px] font-bold text-white/20 uppercase">No operatives detected</span>
                    </div>
                )}
            </div>
        </div>
    );
}
