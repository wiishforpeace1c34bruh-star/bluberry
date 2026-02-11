import { useState, useEffect, Component, ReactNode } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { WelcomeScreen } from "@/components/WelcomeScreen";
import { AnimatedBackground } from "@/components/AnimatedBackground";
import { usePerformanceModeState, PerformanceContext } from "@/hooks/usePerformanceMode";
import { SoundProvider } from "@/context/SoundContext";
import { AchievementProvider } from "@/context/AchievementContext";
import { AuraProvider } from "@/context/AuraContext";
import { AtmosProvider } from "@/context/AtmosContext";
import { DMProvider } from "@/context/DMContext";
import { CursorGlow } from "@/components/PremiumEffects";
import { AtmosAudioDeck } from "@/components/AtmosAudioDeck";
import { PulseTicker } from "@/components/PulseTicker";
import { DMChat } from "@/components/DMChat";
import { CommunityVaultProvider } from "@/context/CommunityVaultContext";
import { ShockwaveSystem } from "@/components/ShockwaveSystem";
import { OrbitalHUD } from "@/components/navigation/OrbitalHUD";
import { NavigationProvider } from "@/context/NavigationContext";
import { GlobalClickSpark } from "@/components/fx/GlobalClickSpark";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Admin from "./pages/Admin";
import NotFound from "./pages/NotFound";
import Profile from "./pages/Profile";

const queryClient = new QueryClient();

class ErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean, error: Error | null }> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error("SHELL CRASH DETECTED:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="fixed inset-0 z-[99999] flex flex-col items-center justify-center bg-[#0a0c1a] p-10 text-center">
          <div className="w-20 h-20 mb-8 rounded-3xl bg-red-500/20 flex items-center justify-center border border-red-500/30">
            <span className="text-4xl text-red-500">⚠️</span>
          </div>
          <h1 className="text-4xl font-black text-white mb-4 uppercase tracking-tighter">System Kernel Panic</h1>
          <p className="text-white/40 max-w-md font-medium text-sm leading-relaxed mb-8">
            The Sapphire core encountered a critical exception. Our neural links are attempting to stabilize the matrix.
          </p>
          <div className="p-4 rounded-2xl bg-black/40 border border-white/5 font-mono text-[10px] text-red-400/80 mb-8 max-w-lg w-full overflow-auto text-left">
            <code>{this.state.error?.message}</code>
          </div>
          <button
            onClick={() => window.location.reload()}
            className="px-8 py-3 rounded-full bg-white text-black font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all"
          >
            Reboot Core
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

const App = () => {
  const [showWelcome, setShowWelcome] = useState(true);
  const performanceModeState = usePerformanceModeState();

  useEffect(() => {
    const hasSeenWelcome = sessionStorage.getItem('hasSeenWelcome');
    if (hasSeenWelcome) {
      setShowWelcome(false);
    }

    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'Enter' && showWelcome) {
        handleEnterSite();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [showWelcome]);

  const handleEnterSite = () => {
    try {
      sessionStorage.setItem('hasSeenWelcome', 'true');
      setShowWelcome(false);
    } catch (e) {
      console.warn("Storage access failed:", e);
      setShowWelcome(false);
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === '`' || e.key === '~') {
        window.location.href = 'https://classroom.google.com';
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <PerformanceContext.Provider value={performanceModeState}>
          <AuraProvider>
            <AtmosProvider>
              <DMProvider>
                <SoundProvider>
                  <AchievementProvider>
                    <CommunityVaultProvider>
                      <NavigationProvider>
                        <TooltipProvider>
                          <CursorGlow />
                          <AtmosAudioDeck />
                          <PulseTicker />
                          <DMChat />
                          <AnimatedBackground />
                          {showWelcome && <WelcomeScreen onEnter={handleEnterSite} />}
                          <Toaster />
                          <Sonner />
                          <ShockwaveSystem />
                          <GlobalClickSpark />
                          <OrbitalHUD />
                          <BrowserRouter>
                            <Routes>
                              <Route path="/" element={<Index />} />
                              <Route path="/auth" element={<Auth />} />
                              <Route path="/admin" element={<Admin />} />
                              <Route path="/profile/:userId" element={<Profile />} />
                              <Route path="*" element={<NotFound />} />
                            </Routes>
                          </BrowserRouter>
                        </TooltipProvider>
                      </NavigationProvider>
                    </CommunityVaultProvider>
                  </AchievementProvider>
                </SoundProvider>
              </DMProvider>
            </AtmosProvider>
          </AuraProvider>
        </PerformanceContext.Provider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
};

export default App;
