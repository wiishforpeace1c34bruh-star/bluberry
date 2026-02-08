import React from 'react';
import { Newspaper, Zap, Award, Info } from 'lucide-react';
import { cn } from '@/lib/utils';

interface NewsItem {
    id: number;
    title: string;
    description: string;
    date: string;
    icon: React.ReactNode;
    color: string;
}

const NEWS_ITEMS: NewsItem[] = [
    {
        id: 1,
        title: "Site Overhaul v2.0",
        description: "New 'Triple A' experience with high-performance pagination and modern widgets.",
        date: "Feb 8, 2026",
        icon: <Zap className="w-4 h-4" />,
        color: "text-blue-400"
    },
    {
        id: 2,
        title: "Premium Player Cards",
        description: "Custom titles and badges now available for all users. Check your settings!",
        date: "Feb 7, 2026",
        icon: <Award className="w-4 h-4" />,
        color: "text-purple-400"
    },
    {
        id: 3,
        title: "Database Migration",
        description: "Backend systems updated for better stability and faster loading times.",
        date: "Feb 6, 2026",
        icon: <Info className="w-4 h-4" />,
        color: "text-green-400"
    }
];

export function NewsWidget() {
    return (
        <div className="w-full h-full flex flex-col gap-4 animate-fade-in-up">
            <div className="flex items-center gap-2 px-2">
                <Newspaper className="w-5 h-5 text-primary" />
                <h3 className="font-bold text-white uppercase tracking-wider text-sm">Site News</h3>
            </div>
            <div className="flex flex-col gap-3">
                {NEWS_ITEMS.map((item) => (
                    <div
                        key={item.id}
                        className="group relative overflow-hidden rounded-xl bg-white/5 border border-white/10 p-3 hover:bg-white/10 transition-all duration-300 hover:translate-x-1"
                    >
                        <div className="flex items-start gap-3">
                            <div className={cn("mt-1 p-1.5 rounded-lg bg-white/5", item.color)}>
                                {item.icon}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between mb-0.5">
                                    <h4 className="font-bold text-sm text-white truncate">{item.title}</h4>
                                    <span className="text-[10px] text-muted-foreground uppercase font-mono">{item.date}</span>
                                </div>
                                <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                                    {item.description}
                                </p>
                            </div>
                        </div>
                        {/* Hover Gradient */}
                        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                    </div>
                ))}
            </div>
        </div>
    );
}
