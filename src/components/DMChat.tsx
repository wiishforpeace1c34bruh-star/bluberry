import React, { useState, useRef, useEffect } from 'react';
import { useDM } from '@/context/DMContext';
import { useAuth } from '@/hooks/useAuth';
import { Send, X, ArrowLeft, MessageSquare, Shield } from 'lucide-react';
import { cn } from '@/lib/utils';

export function DMChat() {
    const { activeThread, messages, sendMessage, setActiveThread } = useDM();
    const { user } = useAuth();
    const [content, setContent] = useState('');
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    if (!activeThread) return null;

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!content.trim()) return;
        await sendMessage(content);
        setContent('');
    };

    return (
        <div className="fixed inset-y-0 right-0 w-full md:w-[400px] z-[60] animate-in slide-in-from-right duration-500 bg-black/60 backdrop-blur-3xl border-l border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.5)]">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-white/5 bg-white/5">
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setActiveThread(null)}
                        className="p-2 -ml-2 rounded-xl hover:bg-white/5 text-white/40 hover:text-white transition-all"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center overflow-hidden">
                            {activeThread.other_participant?.avatar_url ? (
                                <img src={activeThread.other_participant.avatar_url} className="w-full h-full object-cover" />
                            ) : (
                                <span className="font-black text-primary text-lg">
                                    {activeThread.other_participant?.username?.charAt(0).toUpperCase() || '?'}
                                </span>
                            )}
                        </div>
                        <div className="flex flex-col">
                            <span className="text-sm font-black text-white">{activeThread.other_participant?.username || 'Unknown Operator'}</span>
                            <span className="text-[10px] font-bold text-primary flex items-center gap-1 uppercase tracking-widest">
                                <Shield className="w-3 h-3" /> Encrypted Session
                            </span>
                        </div>
                    </div>
                </div>
                <button
                    onClick={() => setActiveThread(null)}
                    className="p-2 rounded-xl hover:bg-white/5 text-white/40 transition-all"
                >
                    <X className="w-5 h-5" />
                </button>
            </div>

            {/* Messages */}
            <div
                ref={scrollRef}
                className="flex-1 h-[calc(100vh-140px)] overflow-y-auto p-4 space-y-4 scroll-smooth custom-scrollbar"
            >
                {messages.map((m) => {
                    const isOwn = m.sender_id === user?.id;
                    return (
                        <div
                            key={m.id}
                            className={cn(
                                "flex flex-col max-w-[85%]",
                                isOwn ? "ml-auto items-end" : "items-start"
                            )}
                        >
                            <div className={cn(
                                "px-4 py-2.5 rounded-2xl text-sm font-medium leading-relaxed shadow-sm",
                                isOwn ? "bg-primary text-white" : "bg-white/10 text-white/90"
                            )}>
                                {m.content}
                            </div>
                            <span className="text-[8px] font-bold text-white/20 uppercase tracking-widest mt-1">
                                {new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                        </div>
                    );
                })}
                {messages.length === 0 && (
                    <div className="h-full flex flex-col items-center justify-center text-center p-8 opacity-20">
                        <MessageSquare className="w-12 h-12 mb-4" />
                        <p className="text-xs font-black uppercase tracking-widest">No messages yet. Send a transmission.</p>
                    </div>
                )}
            </div>

            {/* Input */}
            <form onSubmit={handleSend} className="p-4 bg-black/40 border-t border-white/5">
                <div className="relative group">
                    <input
                        type="text"
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        placeholder="Encrypt message..."
                        className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 pl-4 pr-14 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-primary/50 transition-all"
                    />
                    <button
                        type="submit"
                        disabled={!content.trim()}
                        className="absolute right-2 top-2 p-2 rounded-xl bg-primary text-white hover:scale-105 active:scale-95 disabled:opacity-50 disabled:scale-100 transition-all"
                    >
                        <Send className="w-4 h-4" />
                    </button>
                </div>
            </form>
        </div>
    );
}
