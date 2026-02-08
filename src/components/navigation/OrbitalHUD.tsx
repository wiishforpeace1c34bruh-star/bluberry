import React, { useState, useEffect } from 'react';
import { LayoutGrid, Users, Trophy, Settings, Terminal, Map, Shield, Zap, X, ChevronRight, Download } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSound } from '@/context/SoundContext';
import { useNavigation } from '@/context/NavigationContext';

export function OrbitalHUD() {
    const [isOpen, setIsOpen] = useState(false);
    const { playClick, playHover } = useSound();
    const { setActiveTab, setActivePopup } = useNavigation();

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && isOpen) {
                setIsOpen(false);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen]);

    const navItems = [
        { icon: LayoutGrid, label: 'Dashboard', detail: 'Central Matrix', action: () => setActiveTab('games') },
        { icon: Users, label: 'Community', detail: 'Social Hub', action: () => setActiveTab('community') },
        { icon: Terminal, label: 'Patch Notes', detail: 'Version Logs', action: () => setActiveTab('notes') },
        { icon: Download, label: 'Downloads', detail: 'Asset Vault', action: () => setActiveTab('files') },
        { icon: Settings, label: 'Settings', detail: 'System Protocols', action: () => setActivePopup('settings') },
        { icon: Shield, label: 'Privacy', detail: 'User Security', action: () => setActivePopup('privacy') },
    ];

    return (
        <>
            {/* Toggle Trigger (More obvious scanning bar) */}
            <div
                className={cn(
                    "fixed right-0 top-1/2 -translate-y-1/2 w-3 h-48 bg-primary/10 hover:bg-primary/30 cursor-pointer z-[100] transition-all rounded-l-2xl overflow-hidden border-l border-white/10 group",
                    isOpen ? "opacity-0 translate-x-10" : "opacity-100 translate-x-0"
                )}
                onMouseEnter={() => playHover()}
                onClick={() => {
                    setIsOpen(true);
                    playClick();
                }}
            >
                <div className="absolute inset-x-0 top-0 h-1/3 bg-primary/40 blur-md animate-scanning" />
                <div className="absolute inset-y-0 left-0 w-[1px] bg-primary group-hover:bg-primary group-hover:shadow-[0_0_10px_rgba(var(--primary-rgb),0.8)]" />
            </div>

            {/* Backdrop Blur */}
            <div
                className={cn(
                    "fixed inset-0 bg-black/40 backdrop-blur-md z-[100] transition-opacity duration-500",
                    isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
                )}
                onClick={() => setIsOpen(false)}
            />

            {/* HUD Panel */}
            <div className={cn(
                "fixed right-0 inset-y-0 w-80 z-[101] transition-transform duration-700 cubic-bezier(0.16, 1, 0.3, 1) translate-x-full",
                isOpen && "translate-x-0"
            )}>
                <div className="h-full w-full bg-[#0a0c1a]/80 backdrop-blur-3xl border-l border-white/10 shadow-[-20px_0_100px_rgba(0,0,0,0.9)] p-8 flex flex-col">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-12">
                        <div className="flex flex-col">
                            <span className="text-[10px] font-black text-primary uppercase tracking-[0.4em]">Orbital HUD</span>
                            <span className="text-xl font-logo text-white">SAPPHIRE</span>
                        </div>
                        <button
                            onClick={() => setIsOpen(false)}
                            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
                        >
                            <X className="w-5 h-5 text-white/40" />
                        </button>
                    </div>

                    {/* Navigation matrix */}
                    <div className="flex-1 space-y-2">
                        {navItems.map((item, i) => (
                            <div
                                key={item.label}
                                onMouseEnter={() => playHover()}
                                onClick={() => {
                                    item.action();
                                    setIsOpen(false);
                                    playClick();
                                }}
                                className="group relative flex items-center gap-4 p-4 rounded-xl hover:bg-primary/10 transition-all cursor-pointer border border-transparent hover:border-primary/20"
                                style={{ transitionDelay: `${i * 30}ms` }}
                            >
                                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20 text-primary group-hover:scale-110 group-hover:bg-primary group-hover:text-black transition-all">
                                    <item.icon className="w-5 h-5" />
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-sm font-black text-white/90 group-hover:text-primary transition-colors">{item.label}</span>
                                    <span className="text-[10px] font-bold text-white/20 uppercase tracking-widest">{item.detail}</span>
                                </div>
                                <ChevronRight className="w-4 h-4 ml-auto text-white/10 group-hover:text-primary group-hover:translate-x-1 transition-all" />
                            </div>
                        ))}
                    </div>

                    {/* System Status Footer */}
                    <div className="mt-auto pt-8 border-t border-white/5">
                        <div className="flex items-center justify-between p-4 rounded-2xl bg-primary/5 border border-primary/10">
                            <div className="flex items-center gap-3">
                                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                                <span className="text-[10px] font-black text-white/50 uppercase tracking-widest">Protocol Stable</span>
                            </div>
                            <Zap className="w-4 h-4 text-primary" />
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
