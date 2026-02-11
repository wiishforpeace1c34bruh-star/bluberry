import { Search, ChevronDown, RefreshCw } from 'lucide-react';
import { TabNavigation, TabType } from './TabNavigation';
import { UserMenu } from './UserMenu';
import type { Profile } from '@/hooks/useAuth';
import type { Rank } from '@/hooks/useLevelSystem';
import { useState, useEffect } from 'react';

interface HeaderProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  sortBy: string;
  onSortChange: (sort: string) => void;
  filterTag: string;
  onFilterChange: (tag: string) => void;
  tags: string[];
  onRefresh: () => void;
  onSettingsClick: () => void;
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  user: any;
  profile: Profile | null;
  rank: Rank;
  isAdmin: boolean;
  onSignOut: () => void;
}

export function Header({
  searchQuery,
  onSearchChange,
  sortBy,
  onSortChange,
  filterTag,
  onFilterChange,
  tags,
  onRefresh,
  onSettingsClick,
  activeTab,
  onTabChange,
  user,
  profile,
  rank,
  isAdmin,
  onSignOut,
}: HeaderProps) {
  const [isAnimated, setIsAnimated] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsAnimated(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const renderSelect = (
    value: string,
    onChange: (value: string) => void,
    options: { value: string; label: string }[]
  ) => {
    return (
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="input-modern appearance-none pr-8 cursor-pointer text-xs py-2"
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-muted-foreground pointer-events-none" />
      </div>
    );
  };

  return (
    <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/20">
      <div className="max-w-[1400px] mx-auto px-4 py-4">
        {/* Logo Row */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex-1" />

          {/* Logo */}
          <div className="flex items-center justify-center">
            <h1
              className={`
                font-logo text-2xl md:text-3xl text-foreground
                transition-all duration-700 
                ${isAnimated ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}
              `}
            >
              <span className="text-primary">S</span>apphire
            </h1>
          </div>

          <div className="flex-1 flex justify-end">
            <UserMenu
              user={user}
              profile={profile}
              rank={rank}
              isAdmin={isAdmin}
              onSignOut={onSignOut}
              onSettingsClick={onSettingsClick}
            />
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center justify-center mb-4">
          <TabNavigation activeTab={activeTab} onTabChange={onTabChange} />
        </div>

        {/* Controls Row - only show for games tab */}
        {activeTab === 'games' && (
          <div className="flex flex-wrap items-center gap-3 animate-fade-in">
            {/* Search */}
            <div className="relative flex-1 min-w-[200px] max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search games..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="input-modern w-full pl-10"
              />
            </div>

            {/* Filters */}
            <div className="flex items-center gap-2">
              {renderSelect(
                filterTag,
                onFilterChange,
                [
                  { value: 'none', label: 'All Tags' },
                  ...tags.map(tag => ({ value: tag, label: tag }))
                ]
              )}

              {renderSelect(
                sortBy,
                onSortChange,
                [
                  { value: 'name', label: 'A-Z' },
                  { value: 'id', label: 'Recent' },
                  { value: 'popular', label: 'Popular' }
                ]
              )}
            </div>

            {/* Refresh */}
            <button
              onClick={onRefresh}
              className="p-2.5 rounded-xl bg-secondary/50 border border-border/30 text-muted-foreground hover:text-primary hover:border-primary/20 hover:bg-primary/5 transition-all duration-300"
              title="Refresh"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
