import { Loader2, AlertTriangle, RefreshCw } from "lucide-react";
import { useEffect, useState } from "react";

interface GameLoadingOverlayProps {
    isLoading: boolean;
    error?: string | null;
    gameName: string;
    coverUrl?: string;
    onRetry?: () => void;
}

export function GameLoadingOverlay({
    isLoading,
    error,
    gameName,
    coverUrl,
    onRetry
}: GameLoadingOverlayProps) {
    const [showLongLoadingMessage, setShowLongLoadingMessage] = useState(false);
    const [dots, setDots] = useState("");

    useEffect(() => {
        if (isLoading) {
            const timer = setTimeout(() => {
                setShowLongLoadingMessage(true);
            }, 5000); // Show "taking longer than expected" after 5s

            const interval = setInterval(() => {
                setDots(prev => prev.length >= 3 ? "" : prev + ".");
            }, 500);

            return () => {
                clearTimeout(timer);
                clearInterval(interval);
            };
        } else {
            setShowLongLoadingMessage(false);
        }
    }, [isLoading]);

    if (!isLoading && !error) return null;

    return (
        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-background/95 backdrop-blur-md animate-fade-in">
            {/* Background Image (Blurred) */}
            {coverUrl && (
                <div
                    className="absolute inset-0 opacity-20 bg-cover bg-center blur-xl pointer-events-none"
                    style={{ backgroundImage: `url(${coverUrl})` }}
                />
            )}

            <div className="relative z-10 flex flex-col items-center max-w-md p-8 text-center space-y-6">
                {error ? (
                    <>
                        <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mb-2">
                            <AlertTriangle className="w-8 h-8 text-destructive" />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-foreground mb-2">Failed to load game</h3>
                            <p className="text-muted-foreground text-sm">{error}</p>
                        </div>
                        {onRetry && (
                            <button
                                onClick={onRetry}
                                className="btn-primary flex items-center gap-2 group"
                            >
                                <RefreshCw className="w-4 h-4 group-hover:rotate-180 transition-transform duration-500" />
                                Try Again
                            </button>
                        )}
                    </>
                ) : (
                    <>
                        <div className="relative">
                            <div className="w-16 h-16 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
                            <div className="absolute inset-0 flex items-center justify-center">
                                <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                            </div>
                        </div>

                        <div className="space-y-1">
                            <h3 className="text-lg font-semibold text-foreground">
                                Loading {gameName}
                                <span className="inline-block w-4 text-left">{dots}</span>
                            </h3>

                            <div className={`transition-all duration-500 overflow-hidden ${showLongLoadingMessage ? 'max-h-20 opacity-100' : 'max-h-0 opacity-0'}`}>
                                <p className="text-sm text-yellow-500/90 font-medium pt-2 animate-pulse-subtle">
                                    This is taking a bit longer than usual...
                                </p>
                            </div>
                        </div>

                        <div className="flex gap-2 mt-8">
                            <div className="w-2 h-2 rounded-full bg-primary/40 animate-bounce delay-[0ms]" />
                            <div className="w-2 h-2 rounded-full bg-primary/40 animate-bounce delay-[150ms]" />
                            <div className="w-2 h-2 rounded-full bg-primary/40 animate-bounce delay-[300ms]" />
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
