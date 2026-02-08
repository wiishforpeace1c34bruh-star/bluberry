import React, { createContext, useContext, useState, ReactNode } from 'react';
import { TabType } from '@/components/TabNavigation';

type PopupType = 'settings' | 'dmca' | 'contact' | 'privacy' | null;

interface NavigationContextType {
    activeTab: TabType;
    setActiveTab: (tab: TabType) => void;
    activePopup: PopupType;
    setActivePopup: (popup: PopupType) => void;
}

const NavigationContext = createContext<NavigationContextType | undefined>(undefined);

export function NavigationProvider({ children }: { children: ReactNode }) {
    const [activeTab, setActiveTab] = useState<TabType>('games');
    const [activePopup, setActivePopup] = useState<PopupType>(null);

    return (
        <NavigationContext.Provider value={{ activeTab, setActiveTab, activePopup, setActivePopup }}>
            {children}
        </NavigationContext.Provider>
    );
}

export const useNavigation = () => {
    const context = useContext(NavigationContext);
    if (!context) throw new Error('useNavigation must be used within NavigationProvider');
    return context;
};
