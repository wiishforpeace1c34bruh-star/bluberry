import React, { useState, useEffect } from 'react';
import { User, Sparkles } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';

export function RecentUserWidget() {
    const [recentUser, setRecentUser] = useState<string | null>(null);

    useEffect(() => {
        const fetchRecentUser = async () => {
            const { data, error } = await supabase
                .from('profiles')
                .select('username')
                .order('created_at', { ascending: false })
                .limit(1)
                .single();

            if (!error && data) {
                setRecentUser(data.username);
            }
        };

        fetchRecentUser();
    }, []);

    if (!recentUser) return null;

    return (
        <div className="p-6 rounded-[2.5rem] bg-card/20 backdrop-blur-2xl border border-white/5 flex items-center gap-4 transition-all animate-in slide-in-from-right duration-1000">
            <div className="w-12 h-12 rounded-2xl bg-sapphire/20 flex items-center justify-center border border-sapphire/30">
                <User className="w-6 h-6 text-sapphire" />
            </div>
            <div className="text-left">
                <div className="text-[9px] font-bold text-muted-foreground uppercase tracking-[0.2em] mb-1">Newest Recruit</div>
                <div className="text-xl font-black text-white flex items-center gap-2">
                    {recentUser}
                    <Sparkles className="w-3 h-3 text-amber-500 animate-pulse" />
                </div>
            </div>
        </div>
    );
}
