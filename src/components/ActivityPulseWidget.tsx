import React, { useEffect, useState } from 'react';
import { Activity, Flame, Users, Trophy, Play } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ActivityItem {
    id: string;
    type: 'game' | 'level' | 'badge' | 'user';
    message: string;
    time: string;
    icon: React.ReactNode;
    color: string;
}

const INITIAL_ACTIVITIES: ActivityItem[] = [
    {
        id: '1',
        type: 'game',
        message: "Slope is trending right now!",
        time: "Just now",
        icon: <Flame className="w-3 h-3" />,
        color: "text-orange-400"
    },
    {
        id: '2',
        type: 'user',
        message: "1,245 gamers online tonight",
        time: "2m ago",
        icon: <Users className="w-3 h-3" />,
        color: "text-blue-400"
    },
    {
        id: '3',
        type: 'level',
        message: "New Legend rank achieved by 'Ghost'",
        time: "5m ago",
        icon: <Trophy className="w-3 h-3" />,
        color: "text-yellow-400"
    },
    {
        id: '4',
        type: 'game',
        message: "New game 'Vex 8' added to library",
        time: "15m ago",
        icon: <Play className="w-3 h-3 fill-current" />,
        color: "text-green-400"
    }
];

export function ActivityPulseWidget() {
    const [activities, setActivities] = useState(INITIAL_ACTIVITIES);

    // Simulate real-time updates
    useEffect(() => {
        const interval = setInterval(() => {
            const randomActivity = INITIAL_ACTIVITIES[Math.floor(Math.random() * INITIAL_ACTIVITIES.length)];
            const newItem = {
                ...randomActivity,
                id: Math.random().toString(36).substr(2, 9),
                time: "Just now"
            };
            setActivities(prev => [newItem, ...prev.slice(0, 3)]);
        }, 8000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="w-full h-full flex flex-col gap-4 animate-fade-in-up">
            <div className="flex items-center justify-between px-2">
                <div className="flex items-center gap-2">
                    <div className="relative">
                        <Activity className="w-5 h-5 text-green-500" />
                        <span className="absolute -top-1 -right-1 w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.8)]" />
                    </div>
                    <h3 className="font-bold text-white uppercase tracking-wider text-sm">Activity Pulse</h3>
                </div>
            </div>

            <div className="flex-1 flex flex-col gap-2">
                {activities.map((activity, index) => (
                    <div
                        key={activity.id}
                        className={cn(
                            "flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10 transition-all duration-500",
                            index === 0 ? "scale-105 border-green-500/30 bg-green-500/5" : "opacity-70 grayscale-[0.5]"
                        )}
                        style={{
                            animation: index === 0 ? 'slide-in-right 0.5s cubic-bezier(0.16, 1, 0.3, 1)' : 'none'
                        }}
                    >
                        <div className={cn("p-2 rounded-lg bg-white/5", activity.color)}>
                            {activity.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-xs font-bold text-white truncate">{activity.message}</p>
                            <p className="text-[10px] text-muted-foreground uppercase font-mono">{activity.time}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
