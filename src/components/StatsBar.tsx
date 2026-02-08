import { useEffect, useState } from 'react';
import { Users, Gamepad2, Server, Wifi } from 'lucide-react';

interface StatsBarProps {
    totalGames: number;
}

export function StatsBar({ totalGames }: StatsBarProps) {
    const [activeUsers, setActiveUsers] = useState(1240);

    // Fake live user count update
    useEffect(() => {
        const interval = setInterval(() => {
            setActiveUsers(prev => {
                const change = Math.floor(Math.random() * 5) - 2;
                return prev + change;
            });
        }, 3000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="w-full max-w-6xl mx-auto mb-8 animate-fade-in-down">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {/* Active Users */}
                <div className="group relative overflow-hidden rounded-xl bg-card/40 backdrop-blur-md border border-white/5 p-4 flex items-center gap-4 hover:bg-card/60 transition-colors">
                    <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                        <Users className="w-5 h-5" />
                    </div>
                    <div>
                        <div className="text-2xl font-mono font-bold text-white tracking-tight flex items-center gap-2">
                            {activeUsers.toLocaleString()}
                            <span className="flex h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                        </div>
                        <div className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Online Users</div>
                    </div>
                </div>

                {/* Total Games */}
                <div className="group relative overflow-hidden rounded-xl bg-card/40 backdrop-blur-md border border-white/5 p-4 flex items-center gap-4 hover:bg-card/60 transition-colors">
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="w-10 h-10 rounded-full bg-purple-500/10 flex items-center justify-center text-purple-400 group-hover:scale-110 transition-transform">
                        <Gamepad2 className="w-5 h-5" />
                    </div>
                    <div>
                        <div className="text-2xl font-mono font-bold text-white tracking-tight">
                            {totalGames}
                        </div>
                        <div className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Total Games</div>
                    </div>
                </div>

                {/* Server Status */}
                <div className="group relative overflow-hidden rounded-xl bg-card/40 backdrop-blur-md border border-white/5 p-4 flex items-center gap-4 hover:bg-card/60 transition-colors">
                    <div className="absolute inset-0 bg-gradient-to-r from-green-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center text-green-400 group-hover:scale-110 transition-transform">
                        <Server className="w-5 h-5" />
                    </div>
                    <div>
                        <div className="text-lg font-bold text-white tracking-tight">Online</div>
                        <div className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">System Status</div>
                    </div>
                </div>

                {/* Ping / Latency (Fake) */}
                <div className="group relative overflow-hidden rounded-xl bg-card/40 backdrop-blur-md border border-white/5 p-4 flex items-center gap-4 hover:bg-card/60 transition-colors">
                    <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="w-10 h-10 rounded-full bg-yellow-500/10 flex items-center justify-center text-yellow-400 group-hover:scale-110 transition-transform">
                        <Wifi className="w-5 h-5" />
                    </div>
                    <div>
                        <div className="text-2xl font-mono font-bold text-white tracking-tight">
                            12<span className="text-sm font-normal text-muted-foreground ml-1">ms</span>
                        </div>
                        <div className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Latency</div>
                    </div>
                </div>
            </div>
        </div>
    );
}
