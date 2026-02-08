import { useAchievements } from '@/context/AchievementContext';
import { Trophy, Star, Target, Zap, Shield, Crown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { CrystalizedBadge } from './CrystalizedBadge';

export function AchievementShowroom() {
    const { unlockedAchievements } = useAchievements();

    const getIconName = (a: any) => {
        if (typeof a.icon === 'string') return a.icon;
        // Fallback if icon is a component but we need a name for our helper
        return 'trophy';
    };

    const getIcon = (iconName: string) => {
        switch (iconName) {
            case 'trophy': return <Trophy className="w-5 h-5 text-yellow-400" />;
            case 'star': return <Star className="w-5 h-5 text-blue-400" />;
            case 'target': return <Target className="w-5 h-5 text-red-400" />;
            case 'zap': return <Zap className="w-5 h-5 text-sapphire" />;
            case 'shield': return <Shield className="w-5 h-5 text-emerald-400" />;
            case 'crown': return <Crown className="w-5 h-5 text-purple-400" />;
            default: return <Trophy className="w-5 h-5 text-yellow-400" />;
        }
    };

    const unlocked = unlockedAchievements;
    const locked: any[] = [];

    return (
        <div className="space-y-8 p-6 bg-black/40 backdrop-blur-3xl rounded-[2.5rem] border border-white/5 shadow-2xl overflow-hidden relative">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 blur-[100px] -z-10 animate-pulse" />

            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-black text-white tracking-tighter">Achievement Showroom</h2>
                    <p className="text-xs font-bold text-white/40 uppercase tracking-widest mt-1">
                        Displaying {unlocked.length} earned honors
                    </p>
                </div>
                <div className="px-5 py-2 rounded-2xl bg-white/5 border border-white/10 text-xs font-black text-primary uppercase tracking-widest">
                    Rank: Elite Operative
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {unlocked.map((a) => (
                    <div
                        key={a.id}
                        className="group relative p-5 rounded-3xl bg-white/5 border border-white/10 hover:border-primary/50 transition-all duration-500 hover:scale-[1.02]"
                    >
                        <div className="flex items-start gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20 shadow-[0_0_20px_rgba(var(--primary),0.1)] group-hover:shadow-[0_0_30px_rgba(var(--primary),0.3)] transition-all">
                                {typeof a.icon === 'function' ? <a.icon className="w-5 h-5 text-primary" /> : getIcon(a.icon)}
                            </div>
                            <div className="flex-1">
                                <h4 className="text-sm font-black text-white group-hover:text-primary transition-colors">{a.title}</h4>
                                <p className="text-[10px] text-white/40 font-bold mt-1 leading-relaxed">{a.description}</p>
                                <div className="flex items-center gap-2 mt-3">
                                    <span className="text-[10px] font-black text-primary uppercase">Unlocked</span>
                                    <span className="text-[10px] text-white/20">{new Date().toLocaleDateString()}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

        </div>
    );
}
