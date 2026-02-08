import React, { useState } from 'react';
import {
    Users,
    Hash,
    ChevronRight,
    MessageSquare,
    Search
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface Channel {
    id: string;
    name: string;
    description: string;
}

interface CommunitySidebarProps {
    activeChannel: string | null;
    onChannelSelect: (id: string) => void;
    activeDM: string | null;
    onDMSelect: (id: string) => void;
}

const HARDCODED_CHANNELS: Channel[] = [
    { id: 'global', name: 'Global Lounge', description: 'The main community hub' },
];

export function CommunitySidebar({
    activeChannel,
    onChannelSelect,
    activeDM,
    onDMSelect
}: CommunitySidebarProps) {
    const [searchQuery, setSearchQuery] = useState('');

    const filteredChannels = HARDCODED_CHANNELS.filter(c =>
        c.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="w-80 h-full flex flex-col bg-card/20 backdrop-blur-3xl border-r border-white/5 animate-slide-in-left">
            {/* Header */}
            <div className="p-8 space-y-8">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20">
                        <MessageSquare className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                        <h2 className="text-xl font-black text-white tracking-widest uppercase italic">Lounge</h2>
                        <div className="flex items-center gap-1.5 opacity-40">
                            <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-tighter">Live Chat</span>
                            <div className="w-1 h-1 rounded-full bg-emerald-400 animate-pulse" />
                        </div>
                    </div>
                </div>

                <div className="relative group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                    <input
                        type="text"
                        placeholder="Search channels..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-xs font-medium focus:ring-1 focus:ring-primary/50 transition-all placeholder:text-white/20"
                    />
                </div>
            </div>

            {/* Channels List */}
            <div className="flex-1 overflow-y-auto px-6 space-y-8 scrollbar-hide">
                <div>
                    <span className="px-4 text-[10px] font-black text-muted-foreground/30 uppercase tracking-[0.4em] block mb-6">Channels</span>
                    <div className="space-y-2">
                        {filteredChannels.map((channel) => (
                            <button
                                key={channel.id}
                                onClick={() => onChannelSelect(channel.id)}
                                className={cn(
                                    "w-full flex items-center justify-between p-4 rounded-2xl group transition-all duration-300",
                                    activeChannel === channel.id
                                        ? "bg-primary text-white shadow-[0_15px_30px_-5px_rgba(59,130,246,0.3)]"
                                        : "bg-white/5 border border-white/5 text-muted-foreground hover:bg-white/10 hover:text-white"
                                )}
                            >
                                <div className="flex items-center gap-3">
                                    <Hash className={cn("w-4 h-4", activeChannel === channel.id ? "text-white" : "text-primary")} />
                                    <span className="text-sm font-bold tracking-wide">{channel.name}</span>
                                </div>
                                <ChevronRight className={cn(
                                    "w-4 h-4 transition-transform group-hover:translate-x-1",
                                    activeChannel === channel.id ? "opacity-100" : "opacity-0"
                                )} />
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Footer Status */}
            <div className="p-8 border-t border-white/5">
                <div className="flex items-center gap-4 p-5 rounded-3xl bg-black/20 border border-white/5">
                    <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center">
                        <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_15px_#10b981]" />
                    </div>
                    <div>
                        <div className="text-[10px] font-black text-white/40 uppercase tracking-widest">Connection</div>
                        <div className="text-[9px] text-emerald-500 font-black uppercase tracking-tighter">Verified</div>
                    </div>
                </div>
            </div>
        </div>
    );
}
