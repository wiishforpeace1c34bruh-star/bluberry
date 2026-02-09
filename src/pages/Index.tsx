import React, { useState, useMemo, useCallback, useRef, useEffect, Component, ReactNode } from 'react';
import { useZones, COVER_URL, HTML_URL } from '@/hooks/useZones';
import { Zone, PopularityData } from '@/types/zone';
import { Header } from '@/components/Header';
import { SiteOnboarding } from '@/components/SiteOnboarding';
import { Footer } from '@/components/Footer';
import { SettingsPopup } from '@/components/SettingsPopup';
import { DMCAContent, ContactContent, PrivacyContent } from '@/components/PolicyContent';
import { TabType } from '@/components/TabNavigation';
import { PatchNotesView } from '@/components/PatchNotesView';
import { DownloadsView } from '@/components/DownloadsView';
import { CommunityView } from '@/components/community/CommunityView';
import { LoadingScreen } from '@/components/LoadingScreen';
import { PageTransition } from '@/components/PageTransition';
import { ToastContainer, Toast } from '@/components/NotificationToast';
import { getIdentityDecorations } from '@/lib/identity';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { RANKS } from '@/hooks/useLevelSystem';
import { useFavorites } from '@/hooks/useFavorites';
import { LazyZoneGrid } from '@/components/LazyZoneGrid';
import { ZoneViewer } from '@/components/ZoneViewer';
import { Popup } from '@/components/Popup';
import { PaginationControls } from '@/components/PaginationControls';
import { StatsBar } from '@/components/StatsBar';
import { FeaturedCarousel } from '@/components/FeaturedCarousel';
import { NewsWidget } from '@/components/NewsWidget';
import { LevelProgressWidget } from '@/components/LevelProgressWidget';
import { ActivityPulseWidget } from '@/components/ActivityPulseWidget';
import { cn } from '@/lib/utils';
import { SquadPresence } from '@/components/SquadPresence'; // Added import for SquadPresence
import { AchievementShowroom } from "@/components/AchievementShowroom";
import { useAura } from "@/context/AuraContext";
import { Trophy } from 'lucide-react';
import { CommunityVaultWidget } from '@/components/CommunityVaultWidget';
import { useNavigation } from '@/context/NavigationContext';

// --- Error Boundary ---
class ErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean, error: Error | null }> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error: Error) { return { hasError: true, error }; }
  render() {
    if (this.state.hasError) {
      return (
        <div className="p-10 text-center text-red-500 bg-black/90 border border-red-500 rounded-xl m-10 z-[100] relative">
          <h2 className="text-2xl font-bold mb-4">CRASH DETECTED</h2>
          <pre className="text-left bg-black p-4 rounded text-xs overflow-auto max-w-2xl mx-auto">
            {this.state.error?.toString()}
          </pre>
        </div>
      );
    }
    return this.props.children;
  }
}

// Per-widget safety wrapper
const SafeWidget = ({ children }: { children: ReactNode }) => (
  <ErrorBoundary>
    <div className="h-full">
      {children}
    </div>
  </ErrorBoundary>
);

const XP_PER_GAME = 25;
const XP_PER_MINUTE = 5;

export default function Index() {
  const { zones, popularityData, loading, error, tags, refetch } = useZones();
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [filterTag, setFilterTag] = useState('none');
  const [activeZone, setActiveZone] = useState<Zone | null>(null);
  const { activeTab, setActiveTab, activePopup: popup, setActivePopup: setPopup } = useNavigation();

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 24;
  const gridTopRef = useRef<HTMLDivElement>(null);
  const gameStartTime = useRef<number | null>(null);

  // Favorites & Toasts
  const { favorites, toggleFavorite, isFavorite, favoritesCount } = useFavorites();
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = (toast: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts((prev) => [...prev, { ...toast, id }]);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const { user, profile, isAdmin, signOut, incrementGamesPlayed, updateXp, updatePlayTime } = useAuth();
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    const checkOnboarding = () => {
      const onboardingComplete = localStorage.getItem('sapphire_onboarding_complete');
      const hasSeenWelcome = sessionStorage.getItem('hasSeenWelcome');

      if (!onboardingComplete && hasSeenWelcome === 'true') {
        setShowOnboarding(true);
      }
    };

    // Check immediately
    checkOnboarding();

    // Check periodically since welcome status changes in App.tsx
    const interval = setInterval(checkOnboarding, 500);
    return () => clearInterval(interval);
  }, []);

  const handleOnboardingComplete = () => {
    localStorage.setItem('sapphire_onboarding_complete', 'true');
    setShowOnboarding(false);
  };

  const handleTutorialStepChange = (tab?: string) => {
    if (tab && (tab === 'games' || tab === 'community' || tab === 'profile')) {
      setActiveTab(tab as any);
    }
  };

  const handleToggleFavorite = useCallback((zoneId: number) => {
    const wasFavorite = isFavorite(zoneId);
    toggleFavorite(zoneId);
    addToast({
      type: wasFavorite ? 'info' : 'success',
      message: wasFavorite ? 'Removed from favorites' : 'Added to favorites!',
      duration: 3000,
    });
  }, [toggleFavorite, isFavorite]);

  // Sorting logic
  const sortZones = (zonesArray: Zone[], sortType: string, popularity: PopularityData) => {
    const sorted = [...zonesArray];
    if (sortType === 'name') {
      sorted.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortType === 'id') {
      sorted.sort((a, b) => a.id - b.id);
    } else if (sortType === 'popular') {
      sorted.sort((a, b) => (popularity[b.id] || 0) - (popularity[a.id] || 0));
    }
    // Keep Special ID -1 at top if exists
    sorted.sort((a, b) => (a.id === -1 ? -1 : b.id === -1 ? 1 : 0));
    return sorted;
  };

  const filteredAndSortedZones = useMemo(() => {
    let filtered = zones;
    if (searchQuery) {
      filtered = filtered.filter(zone =>
        zone.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    if (filterTag !== 'none') {
      filtered = filtered.filter(zone => zone.special?.includes(filterTag));
    }
    return sortZones(filtered, sortBy, popularityData);
  }, [zones, searchQuery, filterTag, sortBy, popularityData]);

  const totalPages = Math.ceil(filteredAndSortedZones.length / itemsPerPage);

  const paginatedZones = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredAndSortedZones.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredAndSortedZones, currentPage]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    if (gridTopRef.current) {
      gridTopRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, filterTag, sortBy]);

  const handleZoneClick = useCallback(async (zone: Zone) => {
    // Cinematic launch: open in about:blank while keeping sapphire open
    const url = zone.url
      .replace("{COVER_URL}", COVER_URL)
      .replace("{HTML_URL}", HTML_URL);

    try {
      // Fetch content and inject into about:blank for "clean" window
      const response = await fetch(url + "?t=" + Date.now());
      const html = await response.text();

      const newWindow = window.open("about:blank", "_blank");
      if (newWindow) {
        const baseTag = `<base href="${url.substring(0, url.lastIndexOf('/') + 1)}">`;
        newWindow.document.open();
        newWindow.document.write(html.includes('<head>') ? html.replace('<head>', `<head>${baseTag}`) : `<head>${baseTag}</head>${html}`);
        newWindow.document.close();
        newWindow.document.title = zone.name + " | Sapphire";
      }
    } catch (e) {
      window.open(url, "_blank"); // Fallback to direct open
    }

    // Still track stats
    if (profile) {
      incrementGamesPlayed();
      updateXp(XP_PER_GAME);
    }
  }, [profile, incrementGamesPlayed, updateXp]);

  const handleZoneClose = useCallback(() => {
    if (gameStartTime.current && profile) {
      const playTimeSeconds = Math.floor((Date.now() - gameStartTime.current) / 1000);
      const playTimeMinutes = Math.floor(playTimeSeconds / 60);
      const bonusXp = playTimeMinutes * XP_PER_MINUTE;
      updatePlayTime(playTimeSeconds);
      if (bonusXp > 0) updateXp(bonusXp);
    }
    gameStartTime.current = null;
    setActiveZone(null);
  }, [profile, updatePlayTime, updateXp]);

  // Rank logic
  const currentRank = useMemo(() => {
    const level = profile?.level || 1;
    let rank = RANKS[0];
    for (const r of RANKS) {
      if (level >= r.minLevel) rank = r;
    }
    return rank;
  }, [profile?.level]);

  // Featured zones for carousel
  const featuredZones = useMemo(() => {
    return zones.filter(z => z.featured || (z.special && z.special.includes('featured'))).slice(0, 5);
  }, [zones]);

  const renderContent = () => {
    if (activeTab === 'notes') return <PatchNotesView />;
    if (activeTab === 'files') return <DownloadsView />;
    if (activeTab === 'community') return <CommunityView />;

    return (
      <>
        {/* Hero Widgets Section */}
        {searchQuery === '' && filterTag === 'none' && currentPage === 1 && (
          <div className="space-y-16 mb-20 animate-in fade-in slide-in-from-bottom-12 duration-1000">
            {/* Stats Bar */}
            <SafeWidget>
              <StatsBar totalGames={zones.length} />
            </SafeWidget>

            {/* Featured Carousel */}
            {featuredZones.length > 0 && (
              <SafeWidget>
                <FeaturedCarousel zones={featuredZones} onZoneClick={handleZoneClick} />
              </SafeWidget>
            )}

            {/* Mixed Widgets Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="md:col-span-3 space-y-8">
                <div className="animate-in fade-in slide-in-from-bottom-8 duration-700 delay-100">
                  <SafeWidget>
                    <LevelProgressWidget profile={profile} />
                  </SafeWidget>
                </div>
                <div className="animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200">
                  <SafeWidget>
                    <NewsWidget />
                  </SafeWidget>
                </div>
                <div className="animate-in fade-in slide-in-from-bottom-8 duration-700 delay-300">
                  <SafeWidget>
                    <CommunityVaultWidget />
                  </SafeWidget>
                </div>
                <div className="animate-in fade-in slide-in-from-bottom-8 duration-700 delay-300">
                  <SafeWidget>
                    <ActivityPulseWidget />
                  </SafeWidget>
                </div>
              </div>

              {/* Sidebar Area */}
              <div className="space-y-6">
                <SquadPresence />

                {/* Quick Stats Widget */}
                <div className="p-6 rounded-3xl bg-primary/5 border border-primary/10 backdrop-blur-xl">
                  <div className="flex items-center gap-2 mb-4">
                    <Trophy className="w-4 h-4 text-primary" />
                    <h3 className="text-[10px] font-black uppercase tracking-widest text-primary">Global Rank</h3>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-2xl font-black text-white">#1,245</span>
                    <span className="text-[10px] font-bold text-white/40 uppercase">Top 12% of players</span>
                  </div>
                  <div className="mt-8">
                    <SafeWidget>
                      <AchievementShowroom />
                    </SafeWidget>
                  </div>
                </div>
              </div>
            </div>

            {/* Favorites section */}
            {favoritesCount > 0 && (
              <LazyZoneGrid
                zones={zones}
                title="Your Favorites"
                onZoneClick={handleZoneClick}
                favorites={favorites}
                onToggleFavorite={handleToggleFavorite}
                showFavoritesOnly
              />
            )}
          </div>
        )}

        {/* Paginated All Games Grid */}
        <div ref={gridTopRef} className="scroll-mt-24">
          <LazyZoneGrid
            zones={paginatedZones}
            title={searchQuery ? `Search Results (${filteredAndSortedZones.length})` : "All Games"}
            onZoneClick={handleZoneClick}
            favorites={favorites}
            onToggleFavorite={handleToggleFavorite}
            defaultOpen={true}
          />
        </div>

        {/* Pagination Controls */}
        <div className="pb-10">
          <PaginationControls
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </div>
      </>
    );
  };

  return (
    <ErrorBoundary>
      <LoadingScreen />
      <ToastContainer toasts={toasts} onDismiss={removeToast} />
      {showOnboarding && (
        <SiteOnboarding
          onComplete={handleOnboardingComplete}
          onStepChange={handleTutorialStepChange}
          username={profile?.username || 'Gamer'}
        />
      )}

      <div className="min-h-screen relative flex flex-col">
        <Header
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          sortBy={sortBy}
          onSortChange={setSortBy}
          filterTag={filterTag}
          onFilterChange={setFilterTag}
          tags={tags}
          onRefresh={refetch}
          onSettingsClick={() => setPopup('settings')}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          user={user}
          profile={profile}
          rank={currentRank}
          isAdmin={isAdmin}
          onSignOut={signOut}
        />

        <main className={cn(
          "mx-auto px-4 py-6 pb-12 flex-grow w-full transition-all duration-500",
          activeTab === 'community' ? "max-w-[1400px] px-2 py-2 h-[calc(100vh-140px)]" : "max-w-6xl"
        )}>
          <PageTransition transitionKey={activeTab}>
            {renderContent()}
          </PageTransition>
        </main>

        <Footer
          onDMCA={() => setPopup('dmca')}
          onContact={() => setPopup('contact')}
          onPrivacy={() => setPopup('privacy')}
        />

        <Popup
          isOpen={popup !== null}
          title={popup?.toUpperCase() || ''}
          onClose={() => setPopup(null)}
        >
          {popup === 'settings' && (
            <SettingsPopup
              onToggleDarkMode={() => document.body.classList.toggle('dark')}
              profile={profile}
              currentRank={currentRank}
            />
          )}
          {popup === 'dmca' && <DMCAContent />}
          {popup === 'contact' && <ContactContent />}
          {popup === 'privacy' && <PrivacyContent />}
        </Popup>

        {activeZone && (
          <ZoneViewer
            zone={activeZone}
            onClose={handleZoneClose}
            isAdmin={isAdmin}
            onToggleFavorite={handleToggleFavorite}
            isFavorite={isFavorite(activeZone.id)}
          />
        )}
      </div>
    </ErrorBoundary>
  );
}
