import { Shield, Hammer, Wrench, Crown, Sparkles } from 'lucide-react';

export const OWNER_USERNAME = 'bleed';

export interface BadgeConfig {
    icon: any;
    label: string;
    color: string;
    animate?: boolean;
}

export const getIdentityDecorations = (username: string | undefined) => {
    const isOwner = username?.toLowerCase() === OWNER_USERNAME;

    return {
        isOwner,
        title: isOwner ? 'System Owner' : null,
        customRank: isOwner ? { name: 'REPENT', icon: '🩸', color: '#ef4444' } : null,
        stats: isOwner ? { xp: 'MAX', level: 'MAX', games: 'MAX', time: 'MAX' } : null,
        specialBadges: isOwner ? [
            { icon: Crown, label: 'Owner', color: 'text-red-500', animate: true },
            { icon: Shield, label: 'Root Access', color: 'text-white/90' },
            { icon: Sparkles, label: 'Verified', color: 'text-red-400' }
        ] : []
    };
};
