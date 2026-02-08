import { Shield, Hammer, Wrench } from 'lucide-react';

export const OWNER_USERNAME = 'sudo';

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
        specialBadges: isOwner ? [
            { icon: Shield, label: 'Core Security', color: 'text-blue-400', animate: true },
            { icon: Hammer, label: 'Lead Developer', color: 'text-white' },
            { icon: Wrench, label: 'System Admin', color: 'text-blue-300' }
        ] : []
    };
};
