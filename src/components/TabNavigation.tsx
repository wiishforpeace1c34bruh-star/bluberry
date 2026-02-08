import { Gamepad2, FileText, Download, Users, Sparkles } from 'lucide-react';
import { useRef, useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

export type TabType = 'games' | 'notes' | 'files' | 'community';

interface TabNavigationProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}

export function TabNavigation({ activeTab, onTabChange }: TabNavigationProps) {
  const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0 });
  const tabRefs = useRef<{ [key: string]: HTMLButtonElement | null }>({});
  const containerRef = useRef<HTMLDivElement>(null);

  const tabs = [
    { id: 'games' as TabType, label: 'System', icon: Gamepad2, description: 'Core Experiences' },
    { id: 'community' as TabType, label: 'Community', icon: Users, description: 'Connect with players' },
    { id: 'notes' as TabType, label: 'Logs', icon: FileText, description: 'Change History' },
    { id: 'files' as TabType, label: 'Assets', icon: Download, description: 'Storage' },
  ];

  useEffect(() => {
    const activeTabElement = tabRefs.current[activeTab];
    const containerElement = containerRef.current;

    if (activeTabElement && containerElement) {
      const containerRect = containerElement.getBoundingClientRect();
      const tabRect = activeTabElement.getBoundingClientRect();

      setIndicatorStyle({
        left: tabRect.left - containerRect.left,
        width: tabRect.width,
      });
    }
  }, [activeTab]);

  return (
    <div
      ref={containerRef}
      className="relative flex items-center gap-2 p-2 rounded-[2rem] bg-black/40 border border-white/10 backdrop-blur-2xl shadow-[0_8px_32px_0_rgba(0,0,0,0.37)]"
    >
      {/* Animated sliding indicator */}
      <div
        className="absolute h-[calc(100%-1rem)] bg-gradient-to-r from-sapphire to-blue-400 rounded-2xl transition-all duration-500 cubic-bezier(0.34, 1.56, 0.64, 1) shadow-[0_0_20px_-5px_rgba(96,165,250,0.5)]"
        style={{
          left: `${indicatorStyle.left + 8}px`,
          width: `${indicatorStyle.width - 16}px`,
          top: '0.5rem'
        }}
      />

      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;

        return (
          <button
            key={tab.id}
            ref={(el) => (tabRefs.current[tab.id] = el)}
            onClick={() => onTabChange(tab.id)}
            className={cn(
              "group relative flex items-center gap-3 px-6 py-3 rounded-2xl transition-all duration-500 outline-none",
              isActive ? "text-white" : "text-muted-foreground hover:text-white"
            )}
            data-tab={tab.id}
          >
            <div className="relative">
              <Icon className={cn(
                "w-5 h-5 transition-all duration-500",
                isActive ? "scale-110 drop-shadow-[0_0_8px_rgba(255,255,250,0.8)]" : "group-hover:scale-110"
              )} />
              {isActive && (
                <Sparkles className="absolute -top-2 -right-2 w-3 h-3 text-white animate-pulse" />
              )}
            </div>

            <div className="flex flex-col items-start translate-y-[2px]">
              <span className="text-sm font-black uppercase tracking-widest">{tab.label}</span>
              <span className={cn(
                "text-[8px] font-bold uppercase tracking-[0.2em] transition-all duration-500",
                isActive ? "text-white/70" : "text-muted-foreground/40 group-hover:text-muted-foreground/60"
              )}>
                {tab.description}
              </span>
            </div>

            {/* Hover glow effect */}
            {!isActive && (
              <div className="absolute inset-x-4 bottom-1 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            )}
          </button>
        );
      })}
    </div>
  );
}
