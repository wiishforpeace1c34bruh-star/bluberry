import { useState, useEffect } from 'react';
import { Sparkles, Gamepad2, Users, ArrowRight, Shield, Zap, ChevronRight, X } from 'lucide-react';
import { cn } from '@/lib/utils';

// --- Types ---
interface TutorialStep {
    id: string;
    title: string;
    description: string;
    target: string;
    icon: any;
    tab?: string;
}

// --- Steps Configuration ---
const STEPS: TutorialStep[] = [
    {
        id: 'welcome',
        title: 'Welcome to Sapphire',
        description: 'Explore a new generation of gaming and social experiences. Let us show you around.',
        target: 'body',
        icon: Sparkles
    },
    {
        id: 'games',
        title: 'Infinite Game Library',
        description: 'Discover thousands of titles across all genres, ready for instant play.',
        target: '[data-tab="games"]',
        icon: Gamepad2,
        tab: 'games'
    },
    {
        id: 'community',
        title: 'Live Community',
        description: 'Chat with other players in real-time and join the conversation.',
        target: '[data-tab="community"]',
        icon: Users,
        tab: 'community'
    },
    {
        id: 'profile',
        title: 'Your Identity',
        description: 'Customize your profile, track your progress, and earn unique awards.',
        target: '.user-profile-trigger',
        icon: Shield,
        tab: 'community'
    },
    {
        id: 'complete',
        title: 'All Set',
        description: 'The system is ready. Enjoy your stay in the Sapphire world!',
        target: 'body',
        icon: Zap
    }
];

export function SiteOnboarding({
    onComplete,
    onStepChange,
    username = 'Guest'
}: {
    onComplete: () => void;
    onStepChange?: (tab: string) => void;
    username?: string;
}) {
    const [currentStep, setCurrentStep] = useState(0);
    const [isVisible, setIsVisible] = useState(true);
    const [isTransitioning, setIsTransitioning] = useState(false);
    const [spotlightRect, setSpotlightRect] = useState<DOMRect | null>(null);

    const step = STEPS[currentStep];

    // Auto-update spotlight position
    useEffect(() => {
        const updateSpotlight = () => {
            const targetElement = document.querySelector(step.target);
            if (targetElement) {
                const rect = targetElement.getBoundingClientRect();
                setSpotlightRect(rect);

                // If the target is a tab, ensure it's visible or scroll to it
                if (step.id !== 'welcome' && step.id !== 'complete') {
                    targetElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
            } else {
                setSpotlightRect(null);
            }
        };

        // Delay to allow UI threads to finish rendering
        const timer = setTimeout(updateSpotlight, 300);
        window.addEventListener('resize', updateSpotlight);

        return () => {
            window.removeEventListener('resize', updateSpotlight);
            clearTimeout(timer);
        };
    }, [currentStep, step.target, step.id]);

    const handleNext = () => {
        setIsTransitioning(true);
        setTimeout(() => {
            if (currentStep < STEPS.length - 1) {
                const nextIdx = currentStep + 1;
                setCurrentStep(nextIdx);

                // Trigger tab switching
                if (STEPS[nextIdx].tab) {
                    onStepChange?.(STEPS[nextIdx].tab);
                }

                setIsTransitioning(false);
            } else {
                setIsVisible(false);
                onComplete();
            }
        }, 400);
    };

    const handleBack = () => {
        if (currentStep > 0) {
            const prevIdx = currentStep - 1;
            setCurrentStep(prevIdx);
            if (STEPS[prevIdx].tab) {
                onStepChange?.(STEPS[prevIdx].tab);
            }
        }
    };

    if (!isVisible) return null;

    return (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-6 bg-background/20 backdrop-blur-[2px] animate-fade-in overflow-hidden">
            {/* Modern Spotlight Overlay */}
            <div className="absolute inset-0 pointer-events-none transition-all duration-700 ease-in-out bg-background/60"
                style={{
                    maskImage: spotlightRect
                        ? `radial-gradient(circle at ${spotlightRect.left + spotlightRect.width / 2}px ${spotlightRect.top + spotlightRect.height / 2}px, transparent ${Math.max(spotlightRect.width, spotlightRect.height) / 1.4}px, black ${Math.max(spotlightRect.width, spotlightRect.height) / 1.1}px)`
                        : 'none',
                    WebkitMaskImage: spotlightRect
                        ? `radial-gradient(circle at ${spotlightRect.left + spotlightRect.width / 2}px ${spotlightRect.top + spotlightRect.height / 2}px, transparent ${Math.max(spotlightRect.width, spotlightRect.height) / 1.4}px, black ${Math.max(spotlightRect.width, spotlightRect.height) / 1.1}px)`
                        : 'none'
                }}
            />

            {/* Clean Focus Ring */}
            {spotlightRect && (
                <div
                    className="absolute pointer-events-none border-2 border-primary/20 rounded-2xl shadow-[0_0_30px_rgba(59,130,246,0.15)] transition-all duration-700 ease-in-out z-[10001]"
                    style={{
                        top: spotlightRect.top - 8,
                        left: spotlightRect.left - 8,
                        width: spotlightRect.width + 16,
                        height: spotlightRect.height + 16,
                    }}
                >
                    <div className="absolute inset-0 border border-white/5 rounded-2xl animate-pulse-subtle" />
                </div>
            )}

            <div className="relative max-w-lg w-full z-[10002] pointer-events-auto">
                {/* Protocol Card */}
                <div className={cn(
                    "relative bg-card/60 border border-white/10 rounded-[2.5rem] shadow-2xl backdrop-blur-3xl overflow-hidden transition-all duration-500",
                    isTransitioning ? 'opacity-0 scale-95 translate-y-4' : 'opacity-100 scale-100 translate-y-0'
                )}>
                    {/* Header Pulse */}
                    <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-primary to-transparent animate-scan" />

                    <div className="p-8 md:p-12">
                        <div className="flex items-center gap-6 mb-10">
                            <div className="w-16 h-16 rounded-3xl bg-primary/10 flex items-center justify-center border border-primary/20 shadow-[0_10px_30px_rgba(59,130,246,0.1)]">
                                <step.icon className="w-8 h-8 text-primary" />
                            </div>
                            <div>
                                <div className="text-[10px] font-black text-primary uppercase tracking-[0.4em] mb-1 opacity-60">
                                    Step {currentStep + 1}/{STEPS.length}
                                </div>
                                <h2 className="text-4xl font-black text-white tracking-tighter leading-none">
                                    {step.title}
                                </h2>
                            </div>
                        </div>

                        <p className="text-xl text-muted-foreground leading-relaxed mb-12 font-light">
                            {currentStep === 0 ? `Greetings, ${username}. ` : ''}{step.description}
                        </p>

                        <div className="flex items-center gap-4">
                            {currentStep > 0 && (
                                <button
                                    onClick={handleBack}
                                    className="px-8 py-5 rounded-2xl text-sm font-bold text-muted-foreground hover:text-white hover:bg-white/5 transition-all uppercase tracking-widest border border-transparent hover:border-white/10"
                                >
                                    Re-Trace
                                </button>
                            )}
                            <button
                                onClick={handleNext}
                                className="flex-1 px-8 py-5 rounded-2xl text-sm font-black bg-primary text-white shadow-[0_15px_30px_-5px_rgba(59,130,246,0.3)] group flex items-center justify-center gap-3 hover:translate-y-[-2px] active:translate-y-[0px] transition-all uppercase tracking-[0.15em]"
                            >
                                <span>{currentStep === STEPS.length - 1 ? 'Start Playing' : 'Continue'}</span>
                                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            </button>
                        </div>
                    </div>

                    {/* Modern Footer */}
                    <div className="px-10 py-5 bg-white/[0.03] flex items-center shadow-inner justify-between border-t border-white/5">
                        <div className="flex items-center gap-3">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                            <span className="text-[10px] font-bold text-muted-foreground/30 uppercase tracking-widest">Connection Stable</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-[10px] font-bold text-muted-foreground/30 uppercase tracking-widest">Sapphire v4.0</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
