import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, Shield, Trophy, Settings, LogIn } from 'lucide-react';
import type { Profile } from '@/hooks/useAuth';
import type { Rank } from '@/hooks/useLevelSystem';

interface UserMenuProps {
  user: any;
  profile: Profile | null;
  rank: Rank;
  isAdmin: boolean;
  onSignOut: () => void;
  onSettingsClick: () => void;
}

import { getIdentityDecorations } from '@/lib/identity';

export function UserMenu({ user, profile, rank: initialRank, isAdmin, onSignOut, onSettingsClick }: UserMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const { customRank, stats } = getIdentityDecorations(profile?.username);

  const rank = customRank
    ? { ...initialRank, name: customRank.name, icon: customRank.icon as any, color: customRank.color }
    : initialRank;

  const displayLevel = stats ? stats.level : (profile?.level || 1);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!user) {
    return (
      <button
        onClick={() => navigate('/auth')}
        className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground font-medium text-sm transition-all duration-300 hover:brightness-110 hover:shadow-md hover:shadow-primary/20"
      >
        <LogIn className="w-4 h-4" />
        <span className="hidden sm:inline">Sign In</span>
      </button>
    );
  }

  return (
    <div ref={menuRef} className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-secondary/60 border border-border/30 hover:bg-secondary/80 hover:border-primary/20 transition-all duration-300"
      >
        {profile?.avatar_url ? (
          <img src={profile.avatar_url} alt={profile.username} className="w-7 h-7 rounded-full object-cover ring-2 ring-border/30" />
        ) : (
          <div
            className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold"
            style={{ backgroundColor: `${rank.color}15`, color: rank.color }}
          >
            {profile?.username?.charAt(0).toUpperCase() || rank.icon}
          </div>
        )}
        <span className="text-sm font-medium text-foreground hidden sm:inline">
          {profile?.username || 'User'}
        </span>
        <svg
          className={`w-4 h-4 text-muted-foreground/60 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-60 py-2 rounded-2xl bg-card/95 backdrop-blur-xl border border-border/30 shadow-2xl shadow-background/50 animate-fade-in-up z-50">
          {/* Profile Header */}
          <div className="px-4 py-4 border-b border-border/20">
            <div className="flex items-center gap-3">
              {profile?.avatar_url ? (
                <img src={profile.avatar_url} alt={profile.username} className="w-11 h-11 rounded-xl object-cover" />
              ) : (
                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center text-lg font-bold"
                  style={{ backgroundColor: `${rank.color}15`, color: rank.color }}
                >
                  {profile?.username?.charAt(0).toUpperCase() || rank.icon}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-foreground truncate">{profile?.username}</div>
                <div className="text-xs text-muted-foreground" style={{ color: rank.color }}>
                  {rank.name} • Lv.{displayLevel}
                </div>
              </div>
            </div>
          </div>

          {/* Menu Items */}
          <div className="py-2">
            <MenuItem icon={Trophy} onClick={onSettingsClick}>
              View Profile
            </MenuItem>

            <MenuItem icon={Settings} onClick={onSettingsClick}>
              Settings
            </MenuItem>

            {isAdmin && (
              <MenuItem icon={Shield} onClick={() => navigate('/admin')}>
                Admin Panel
              </MenuItem>
            )}
          </div>

          <div className="border-t border-border/20 pt-2">
            <MenuItem icon={LogOut} onClick={onSignOut} variant="danger">
              Sign Out
            </MenuItem>
          </div>
        </div>
      )}
    </div>
  );
}

function MenuItem({
  icon: Icon,
  children,
  onClick,
  variant = 'default'
}: {
  icon: any;
  children: React.ReactNode;
  onClick: () => void;
  variant?: 'default' | 'danger';
}) {
  return (
    <button
      onClick={onClick}
      className={`
        w-full flex items-center gap-3 px-4 py-3 text-sm text-left
        transition-all duration-200
        ${variant === 'danger'
          ? 'text-destructive hover:bg-destructive/10'
          : 'text-foreground/80 hover:text-foreground hover:bg-secondary/50'
        }
      `}
    >
      <Icon className="w-4 h-4" />
      {children}
    </button>
  );
}
