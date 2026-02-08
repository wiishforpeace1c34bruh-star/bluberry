import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

type EventType = 'eclipse' | 'solar_flare' | 'void_surge' | 'none';

interface WorldEventContextType {
    activeEvent: EventType;
    eventTimeLeft: number;
}

const WorldEventContext = createContext<WorldEventContextType | undefined>(undefined);

export function WorldEventProvider({ children }: { children: React.ReactNode }) {
    const [activeEvent, setActiveEvent] = useState<EventType>('none');
    const [eventTimeLeft, setEventTimeLeft] = useState(0);

    useEffect(() => {
        const checkEvents = () => {
            const now = new Date();
            const mins = now.getMinutes();

            if (mins % 15 === 0 || mins % 15 === 1) {
                setActiveEvent(prev => {
                    if (prev !== 'eclipse') {
                        document.body.classList.add('event-eclipse');
                        return 'eclipse';
                    }
                    return prev;
                });
                setEventTimeLeft((2 - (mins % 15)) * 60 - now.getSeconds());
            } else {
                setActiveEvent(prev => {
                    if (prev !== 'none') {
                        document.body.classList.remove('event-eclipse');
                        return 'none';
                    }
                    return prev;
                });
                setEventTimeLeft(0);
            }
        };

        const interval = setInterval(checkEvents, 1000);
        checkEvents();

        return () => clearInterval(interval);
    }, []);

    return (
        <WorldEventContext.Provider value={{ activeEvent, eventTimeLeft }}>
            {children}
        </WorldEventContext.Provider>
    );
}

export const useWorldEvent = () => {
    const context = useContext(WorldEventContext);
    if (!context) throw new Error('useWorldEvent must be used within WorldEventProvider');
    return context;
};
