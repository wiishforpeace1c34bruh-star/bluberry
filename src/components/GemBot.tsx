import { useState, useEffect, useRef, useCallback } from 'react';
import { Bot, X, Maximize2, Minimize2, Send, Search, Navigation2, Sparkles } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Zone } from '@/types/zone';
import { cn } from '@/lib/utils';

// --- Types ---
interface ChatMessage {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    intent?: string;
    created_at: string;
}

interface GemBotProps {
    zones: Zone[];
    onNavigate: (tab: string) => void;
    onOpenGame: (zone: Zone) => void;
}

export function GemBot({ zones, onNavigate, onOpenGame }: GemBotProps) {
    const { user } = useAuth();
    const [isOpen, setIsOpen] = useState(false);
    const [isMinimized, setIsMinimized] = useState(false);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [position, setPosition] = useState({ x: 20, y: 20 }); // Bottom-right offset
    const [isDragging, setIsDragging] = useState(false);

    const chatEndRef = useRef<HTMLDivElement>(null);

    // Initial Load
    useEffect(() => {
        if (!user) return;

        const fetchHistory = async () => {
            const { data } = await (supabase as any)
                .from('gem_chat_history')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: true })
                .limit(50);

            if (data) setMessages(data as ChatMessage[]);
        };

        fetchHistory();
    }, [user]);

    // Scroll to bottom
    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isOpen]);

    const handleSend = async () => {
        if (!input.trim() || !user || isTyping) return;

        const userMsg = input.trim();
        setInput('');

        const newUserMsg: ChatMessage = {
            id: crypto.randomUUID(),
            role: 'user',
            content: userMsg,
            created_at: new Date().toISOString()
        };

        setMessages(prev => [...prev, newUserMsg]);
        setIsTyping(true);

        // Store in Supabase
        await (supabase as any).from('gem_chat_history').insert({
            user_id: user.id,
            role: 'user',
            content: userMsg
        });

        // Simulate AI Response & Logic
        setTimeout(async () => {
            let response = "I'm Gem, your Sapphire assistant. How can I help you Navigate the grid?";
            let intent = 'general';

            const lowerMsg = userMsg.toLowerCase();

            if (lowerMsg.includes('play') || lowerMsg.includes('game') || lowerMsg.includes('find')) {
                intent = 'search';
                const query = lowerMsg.replace(/play|game|find|me/g, '').trim();
                const found = zones.filter(z => z.name.toLowerCase().includes(query))[0];
                if (found) {
                    response = `I've found ${found.name} in the database. Initiating direct link.`;
                    onOpenGame(found);
                } else {
                    response = "I couldn't locate that specific title, but I've updated your games feed with related data.";
                }
            } else if (lowerMsg.includes('community') || lowerMsg.includes('chat') || lowerMsg.includes('social')) {
                intent = 'navigate';
                response = "Switching your terminal to the Community Mesh.";
                onNavigate('community');
            } else if (lowerMsg.includes('home') || lowerMsg.includes('dashboard') || lowerMsg.includes('games')) {
                intent = 'navigate';
                response = "Returning to Core Game Database.";
                onNavigate('games');
            }

            const botMsg: ChatMessage = {
                id: crypto.randomUUID(),
                role: 'assistant',
                content: response,
                intent,
                created_at: new Date().toISOString()
            };

            setMessages(prev => [...prev, botMsg]);
            setIsTyping(false);

            // Store in Supabase
            await (supabase as any).from('gem_chat_history').insert({
                user_id: user.id,
                role: 'assistant',
                content: response,
                intent
            });
        }, 1200);
    };

    if (!user) return null;

    return (
        <div
            className={cn(
                "fixed bottom-8 right-8 z-[9000] transition-all duration-500 ease-out",
                isOpen ? "w-80 h-[500px]" : "w-16 h-16"
            )}
        >
            {/* Hexagonal Core Widget */}
            {!isOpen && (
                <button
                    onClick={() => setIsOpen(true)}
                    className="w-16 h-16 bg-primary/20 backdrop-blur-xl border border-primary/30 shadow-[0_0_30px_rgba(59,130,246,0.3)] animate-glitch-pulse group relative"
                    style={{
                        clipPath: 'polygon(50% 0%, 95% 25%, 95% 75%, 50% 100%, 5% 75%, 5% 25%)'
                    }}
                >
                    <div className="absolute inset-0 flex items-center justify-center">
                        <Bot className="w-8 h-8 text-primary group-hover:scale-110 transition-transform" />
                    </div>
                    {/* Ring Decoration */}
                    <div className="absolute inset-0 border border-white/10 animate-spin-slow opacity-50" />
                </button>
            )}

            {/* Expanded UI */}
            {isOpen && (
                <div className="w-full h-full flex flex-col bg-card/80 backdrop-blur-[40px] border border-white/10 rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
                    {/* Header */}
                    <div className="p-6 border-b border-white/5 bg-white/5 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center border border-primary/20">
                                <Bot className="w-5 h-5 text-primary" />
                            </div>
                            <div>
                                <h3 className="text-sm font-black text-white uppercase tracking-widest leading-none">GEM AI</h3>
                                <span className="text-[9px] text-emerald-500 font-black animate-pulse uppercase">Active Link</span>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <button onClick={() => setIsMinimized(!isMinimized)} className="p-2 hover:bg-white/5 rounded-lg text-muted-foreground transition-colors">
                                <Maximize2 className="w-3.5 h-3.5" />
                            </button>
                            <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-red-500/20 hover:text-red-500 rounded-lg text-muted-foreground transition-colors">
                                <X className="w-3.5 h-3.5" />
                            </button>
                        </div>
                    </div>

                    {/* Messages Container */}
                    <div className="flex-1 overflow-y-auto p-6 space-y-4 scrollbar-hide">
                        {messages.length === 0 && (
                            <div className="h-full flex flex-col items-center justify-center opacity-30 text-center px-4">
                                <Sparkles className="w-8 h-8 mb-3" />
                                <p className="text-xs font-bold uppercase tracking-widest">Awaiting Command Input</p>
                            </div>
                        )}
                        {messages.map((m) => (
                            <div key={m.id} className={cn(
                                "flex flex-col max-w-[85%] animate-in slide-in-from-bottom-2 duration-300",
                                m.role === 'user' ? "ml-auto items-end" : "items-start"
                            )}>
                                <div className={cn(
                                    "px-4 py-3 rounded-2xl text-xs font-medium leading-relaxed",
                                    m.role === 'user'
                                        ? "bg-primary text-white shadow-lg"
                                        : "bg-white/5 text-muted-foreground border border-white/5"
                                )}>
                                    {m.content}
                                </div>
                                <span className="text-[8px] text-muted-foreground/40 mt-1 uppercase font-black">
                                    {new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                            </div>
                        ))}
                        {isTyping && (
                            <div className="flex gap-1 items-center p-2 text-primary">
                                <div className="w-1 h-1 rounded-full bg-current animate-bounce" />
                                <div className="w-1 h-1 rounded-full bg-current animate-bounce [animation-delay:0.2s]" />
                                <div className="w-1 h-1 rounded-full bg-current animate-bounce [animation-delay:0.4s]" />
                            </div>
                        )}
                        <div ref={chatEndRef} />
                    </div>

                    {/* Input Area */}
                    <div className="p-4 bg-white/5 border-t border-white/5">
                        <div className="relative flex items-center">
                            <input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                                placeholder="Input command..."
                                className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 pl-4 pr-12 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-primary/50 transition-all placeholder:text-white/20"
                            />
                            <button
                                onClick={handleSend}
                                className="absolute right-2 p-2 bg-primary text-white rounded-xl shadow-lg hover:scale-105 active:scale-95 transition-all"
                            >
                                <Send className="w-3.5 h-3.5" />
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
