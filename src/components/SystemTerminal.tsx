import { useState, useEffect } from 'react';
import { Terminal, Cpu, Database, Command, X, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSound } from '@/context/SoundContext';

export function SystemTerminal() {
    const [isOpen, setIsOpen] = useState(false);
    const [history, setHistory] = useState<string[]>(['SAPP_OS v4.0.2 - READY', 'LINK ESTABLISHED - SECURE']);
    const [input, setInput] = useState('');
    const { playClick, playGlitch } = useSound();

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.ctrlKey && (e.key === '`' || e.key === '~')) {
                setIsOpen(prev => !prev);
                playGlitch();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [playGlitch]);

    const handleCommand = (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim()) return;

        const cmd = input.trim().toLowerCase();
        setHistory(prev => [...prev, `> ${input}`, `EXEC: ${cmd}`]);
        setInput('');
        playClick();

        if (cmd === 'clear') setHistory([]);
        if (cmd === 'help') setHistory(prev => [...prev, 'Available: CLEAR, HELP, THEME [VAL], PING, STATUS']);
        if (cmd.startsWith('theme')) {
            const theme = cmd.split(' ')[1];
            if (theme === 'matrix') document.body.classList.add('matrix-theme');
            else document.body.classList.remove('matrix-theme');
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[10000] bg-black/90 backdrop-blur-xl p-8 font-mono animate-in fade-in duration-300">
            <div className="max-w-4xl mx-auto h-full flex flex-col gap-4">
                <div className="flex items-center justify-between border-b border-primary/20 pb-4">
                    <div className="flex items-center gap-3">
                        <Terminal className="text-primary w-5 h-5" />
                        <span className="text-white text-sm font-black tracking-widest italic">ROOT://SYSTEM_OVERRIDE</span>
                    </div>
                    <button onClick={() => setIsOpen(false)} className="text-muted-foreground hover:text-white">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto space-y-1 text-xs text-primary/80 scrollbar-hide">
                    {history.map((line, i) => (
                        <div key={i} className="flex gap-4">
                            <span className="opacity-30">[{i.toString().padStart(3, '0')}]</span>
                            <span>{line}</span>
                        </div>
                    ))}
                </div>

                <form onSubmit={handleCommand} className="flex items-center gap-4 bg-white/5 p-4 rounded-2xl border border-white/10">
                    <Command className="w-4 h-4 text-primary" />
                    <input
                        autoFocus
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Awaiting directive..."
                        className="flex-1 bg-transparent border-none outline-none text-sm text-white font-mono placeholder:text-white/10 uppercase"
                    />
                    <ChevronRight className="w-4 h-4 text-primary animate-pulse" />
                </form>

                <div className="grid grid-cols-3 gap-8 pt-4 border-t border-white/5 opacity-40">
                    <div className="flex items-center gap-3">
                        <Cpu className="w-4 h-4" />
                        <span className="text-[10px] font-black tracking-widest">CPU: 42% OPTIMIZED</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <Database className="w-4 h-4" />
                        <span className="text-[10px] font-black tracking-widest">MEM://GRID_READY</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
