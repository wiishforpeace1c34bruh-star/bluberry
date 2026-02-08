import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Moon, Palette, ArrowLeft, Trophy, User, Zap, ZapOff, Settings } from 'lucide-react';
import { RANKS, Rank } from '@/hooks/useLevelSystem';
import type { Profile } from '@/hooks/useAuth';
import { ProfileCustomization } from './profile/ProfileCustomization';
import { usePerformanceMode } from '@/hooks/usePerformanceMode';

interface SettingsPopupProps {
  onToggleDarkMode: () => void;
  profile: Profile | null;
  currentRank: Rank;
}

type SettingsView = 'main' | 'tabCloak' | 'profile' | 'customize' | 'system';

export function SettingsPopup({
  onToggleDarkMode,
  profile,
  currentRank,
}: SettingsPopupProps) {
  const [view, setView] = useState<SettingsView>('main');
  const [tabTitle, setTabTitle] = useState('');
  const [tabIcon, setTabIcon] = useState('');
  const { performanceMode, togglePerformanceMode } = usePerformanceMode();

  const handleTitleChange = (value: string) => {
    setTabTitle(value);
    document.title = value.trim() || 'Sapphire';
  };

  const handleIconChange = (value: string) => {
    setTabIcon(value);
    const link = document.querySelector("link[rel~='icon']") as HTMLLinkElement;
    if (link) {
      link.href = value.trim() || '/favicon.ico';
    }
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  const calculateLevelProgress = () => {
    if (!profile) return 0;
    const currentLevelXp = Math.pow(profile.level - 1, 2) * 100;
    const nextLevelXp = Math.pow(profile.level, 2) * 100;
    return ((profile.xp - currentLevelXp) / (nextLevelXp - currentLevelXp)) * 100;
  };

  if (view === 'tabCloak') {
    const presets = [
      { name: 'Google Drive', icon: 'https://ssl.gstatic.com/images/branding/product/1x/drive_2020q4_32dp.png', title: 'My Drive - Google Drive' },
      { name: 'Google Classroom', icon: 'https://ssl.gstatic.com/classroom/favicon.png', title: 'Home' },
      { name: 'Gmail', icon: 'https://ssl.gstatic.com/ui/v1/icons/mail/rfr/gmail.ico', title: 'Inbox (1) - Gmail' },
    ];

    const applyPreset = (preset: typeof presets[0]) => {
      handleTitleChange(preset.title);
      handleIconChange(preset.icon);
    };

    return (
      <div className="space-y-6">
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-foreground">Cloak Presets</h3>
          <div className="grid grid-cols-3 gap-3">
            {presets.map((preset) => (
              <button
                key={preset.name}
                onClick={() => applyPreset(preset)}
                className="flex flex-col items-center gap-2 p-3 rounded-xl bg-secondary/30 hover:bg-secondary/60 transition-colors border border-transparent hover:border-primary/20"
              >
                <img src={preset.icon} alt={preset.name} className="w-8 h-8" />
                <span className="text-xs font-medium text-center">{preset.name}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-4 pt-4 border-t border-border/30">
          <h3 className="text-lg font-bold text-foreground">Custom Cloak</h3>
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1.5 block uppercase tracking-wider">Tab Title</label>
            <Input
              type="text"
              placeholder="Enter custom title..."
              value={tabTitle}
              onChange={(e) => handleTitleChange(e.target.value)}
              className="bg-secondary/50 border-border/50 focus-visible:ring-1 focus-visible:ring-primary/30"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1.5 block uppercase tracking-wider">Tab Icon URL</label>
            <Input
              type="text"
              placeholder="Enter icon URL..."
              value={tabIcon}
              onChange={(e) => handleIconChange(e.target.value)}
              className="bg-secondary/50 border-border/50 focus-visible:ring-1 focus-visible:ring-primary/30"
            />
          </div>
        </div>

        <div className="pt-4 border-t border-border/30">
          <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/20">
            <h4 className="font-bold text-destructive mb-1 flex items-center gap-2">
              <ZapOff className="w-4 h-4" />
              Panic Mode
            </h4>
            <p className="text-xs text-muted-foreground mb-3">
              Press <kbd className="px-1.5 py-0.5 rounded bg-background border border-border text-xs font-mono ml-1">`</kbd> (Tilde) to instantly redirect to Google Classroom.
            </p>
          </div>
        </div>

        <SettingButton onClick={() => setView('main')} icon={ArrowLeft}>
          Back to Settings
        </SettingButton>
      </div>
    );
  }

  if (view === 'system') {
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-foreground">System & UI</h3>

        <div className="space-y-3">
          <SettingButton onClick={onToggleDarkMode} icon={Moon}>
            <div className="flex flex-col items-start text-left">
              <span className="font-bold">Toggle Theme</span>
              <span className="text-xs text-muted-foreground font-normal">Switch between dark and light mode</span>
            </div>
          </SettingButton>

          <SettingButton
            onClick={togglePerformanceMode}
            icon={performanceMode ? ZapOff : Zap}
          >
            <div className="flex flex-col items-start text-left">
              <span className="font-bold">
                {performanceMode ? 'Disable Performance Mode' : 'Enable Performance Mode'}
              </span>
              <span className="text-xs text-muted-foreground font-normal">
                {performanceMode
                  ? 'Visual effects are currently reduced'
                  : 'Reduce particles and animations for speed'}
              </span>
            </div>
          </SettingButton>

          <div className="p-4 rounded-xl bg-secondary/20 border border-white/5 space-y-3">
            <h4 className="text-xs font-black text-muted-foreground uppercase tracking-widest">Global Volume</h4>
            <input
              type="range"
              className="w-full accent-primary"
              min="0"
              max="100"
              defaultValue="80"
            />
          </div>

          <div className="p-4 rounded-xl bg-secondary/20 border border-white/5 space-y-3">
            <h4 className="text-xs font-black text-muted-foreground uppercase tracking-widest">Animation Scale</h4>
            <div className="flex gap-2">
              {[0.5, 1, 1.5].map(scale => (
                <button key={scale} className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-primary/20 text-xs font-bold transition-all border border-white/5">
                  {scale}x
                </button>
              ))}
            </div>
          </div>
        </div>

        <SettingButton onClick={() => setView('main')} icon={ArrowLeft}>
          Back to Settings
        </SettingButton>
      </div>
    );
  }
  if (view === 'profile') {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-foreground">Profile Overview</h3>
          <div className="px-2 py-1 rounded bg-primary/10 border border-primary/20 text-[10px] font-black text-primary uppercase tracking-widest">
            Level {profile?.level || 1}
          </div>
        </div>

        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-secondary/20 border border-white/5">
            <div className="flex justify-between items-end mb-2">
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Rank Progress</span>
              <span className="text-xs font-black text-foreground">{currentRank.name}</span>
            </div>
            <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
              <div
                className="h-full bg-primary transition-all duration-1000"
                style={{ width: `${calculateLevelProgress()}%` }}
              />
            </div>
            <div className="flex justify-between mt-2">
              <span className="text-[10px] font-bold text-muted-foreground">{profile?.xp || 0} XP</span>
              <span className="text-[10px] font-bold text-muted-foreground">{Math.pow(profile?.level || 1, 2) * 100} XP for Level {(profile?.level || 1) + 1}</span>
            </div>
          </div>
        </div>

        <SettingButton onClick={() => setView('main')} icon={ArrowLeft}>
          Back to Settings
        </SettingButton>
      </div>
    );
  }

  if (view === 'customize') {
    return (
      <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
        <div className="flex items-center justify-between sticky top-0 bg-background/80 backdrop-blur-md z-10 py-2 mb-2">
          <h3 className="text-lg font-bold text-foreground">Customize Identity</h3>
          <button
            onClick={() => setView('main')}
            className="p-2 rounded-lg hover:bg-white/5 text-muted-foreground transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
        </div>

        <ProfileCustomization />

        <div className="pt-4 mt-6 border-t border-border/30">
          <SettingButton onClick={() => setView('main')} icon={ArrowLeft}>
            Back to Settings
          </SettingButton>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Profile Section */}
      <SettingButton onClick={() => setView('profile')} icon={Trophy}>
        <div className="flex flex-col items-start text-left">
          <span className="font-bold">View Profile & Ranks</span>
          <span className="text-xs text-muted-foreground font-normal">Check your progress and stats</span>
        </div>
      </SettingButton>

      {profile && (
        <SettingButton onClick={() => setView('customize')} icon={User}>
          <div className="flex flex-col items-start text-left">
            <span className="font-bold">Customize Profile</span>
            <span className="text-xs text-muted-foreground font-normal">Change banner, title & badges</span>
          </div>
        </SettingButton>
      )}

      <div className="h-px bg-border/40 my-2" />

      {/* Utilities Section */}
      <SettingButton onClick={() => setView('system')} icon={Settings}>
        <div className="flex flex-col items-start text-left">
          <span className="font-bold">System & UI</span>
          <span className="text-xs text-muted-foreground font-normal">Theme, Performance & Audio settings</span>
        </div>
      </SettingButton>

      <SettingButton onClick={() => setView('tabCloak')} icon={Palette}>
        <div className="flex flex-col items-start text-left">
          <span className="font-bold">Tab Cloak</span>
          <span className="text-xs text-muted-foreground font-normal">Disguise this tab as another site</span>
        </div>
      </SettingButton>

    </div>
  );
}

function SettingButton({
  onClick,
  icon: Icon,
  children,
  variant = 'default'
}: {
  onClick: () => void;
  icon: any;
  children: React.ReactNode;
  variant?: 'default' | 'danger';
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl card-modern transition-all duration-200 hover:bg-secondary/50 font-medium ${variant === 'danger'
        ? 'text-destructive hover:bg-destructive/10'
        : 'text-foreground'
        }`}
    >
      <Icon className="w-5 h-5" />
      {children}
    </button>
  );
}
