import { useEffect, useRef, useState, useCallback } from 'react';
import { Zone } from '@/types/zone';
import { COVER_URL, HTML_URL } from '@/hooks/useZones';
import { Maximize, ExternalLink, Download, X, RefreshCw, Heart } from 'lucide-react';
import { GameLoadingOverlay } from './GameLoadingOverlay';
import { cn } from '@/lib/utils';

interface ZoneViewerProps {
  zone: Zone | null;
  onClose: () => void;
  isAdmin?: boolean;
  onToggleFavorite?: (zoneId: number) => void;
  isFavorite?: boolean;
}

export function ZoneViewer({ zone, onClose, isAdmin, onToggleFavorite, isFavorite }: ZoneViewerProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const loadTimeoutRef = useRef<NodeJS.Timeout>();

  const loadGame = useCallback(async () => {
    if (!zone) return;

    setLoading(true);
    setError(null);

    const url = zone.url
      .replace("{COVER_URL}", COVER_URL)
      .replace("{HTML_URL}", HTML_URL);

    try {
      // Use direct fetch and srcdoc to force HTML rendering and bypass MIME issues
      const res = await fetch(url + "?t=" + Date.now());
      if (!res.ok) throw new Error("Failed to fetch game content");
      const html = await res.text();

      if (iframeRef.current) {
        // Inject a base tag to handle relative assets in the fetched HTML
        const baseTag = `<base href="${url.substring(0, url.lastIndexOf('/') + 1)}">`;
        const finalHtml = html.includes('<head>')
          ? html.replace('<head>', `<head>${baseTag}`)
          : `<head>${baseTag}</head>${html}`;

        iframeRef.current.srcdoc = finalHtml;
        setLoading(false);
      }
    } catch (err) {
      console.error("Game load error:", err);
      setError("Failed to load game. Please try again.");
      setLoading(false);
    }
  }, [zone]);

  useEffect(() => {
    if (!zone) return;

    if (zone.url.startsWith("http")) {
      window.open(zone.url, "_blank");
      onClose();
      return;
    }

    loadGame();
  }, [zone, onClose, loadGame]);

  const handleFullscreen = () => {
    if (iframeRef.current) {
      if (iframeRef.current.requestFullscreen) {
        iframeRef.current.requestFullscreen();
      }
    }
  };

  const handleOpenInNewTab = async () => {
    if (!zone) return;

    const url = zone.url
      .replace("{COVER_URL}", COVER_URL)
      .replace("{HTML_URL}", HTML_URL);

    try {
      const response = await fetch(url + "?t=" + Date.now());
      const html = await response.text();

      const newWindow = window.open("about:blank", "_blank");
      if (newWindow) {
        newWindow.document.open();
        newWindow.document.write(html);
        newWindow.document.close();
      }
    } catch (e) {
      alert("Failed to open in new tab");
    }
  };

  const handleDownload = async () => {
    if (!zone) return;

    try {
      const url = zone.url.replace("{HTML_URL}", HTML_URL);
      const response = await fetch(url + "?t=" + Date.now());
      const text = await response.text();

      const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = zone.name + ".html";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(blobUrl);
    } catch (e) {
      alert("Failed to download game");
    }
  };

  if (!zone) return null;

  const coverUrl = zone.cover.replace('{COVER_URL}', COVER_URL);

  return (
    <div className="fixed inset-0 bg-background/95 backdrop-blur-sm z-[1000] flex flex-col animate-fade-in">
      {/* Header */}
      <div className="glass-strong border-b border-border/40 px-4 py-3 flex items-center justify-between shadow-sm z-50">
        <div className="flex items-center gap-4">
          <button
            onClick={onClose}
            className="btn-ghost p-2 rounded-full hover:bg-muted/20 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div>
            <h2 className="text-sm font-bold text-foreground">{zone.name}</h2>
            {zone.author && (
              <a
                href={zone.authorLink || "#"}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-muted-foreground hover:text-primary transition-colors flex items-center gap-1"
              >
                by {zone.author} <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>
        </div>

        <div className="flex gap-2">
          <button onClick={loadGame} className="btn-ghost p-2 rounded-lg hover:bg-muted/20" title="Reload Game">
            <RefreshCw className="w-4 h-4" />
          </button>
          {onToggleFavorite && zone && (
            <button
              onClick={() => onToggleFavorite(zone.id)}
              className={cn("p-2 rounded-lg hover:bg-muted/20 transition-all", isFavorite ? "text-red-500 fill-current" : "text-muted-foreground")}
              title={isFavorite ? "Remove from Favorites" : "Add to Favorites"}
            >
              <Heart className={cn("w-4 h-4", isFavorite ? "fill-current" : "")} />
            </button>
          )}
          <div className="w-px h-6 bg-border/50 mx-1" />
          <button onClick={handleFullscreen} className="btn-ghost p-2 rounded-lg hover:bg-muted/20" title="Fullscreen">
            <Maximize className="w-4 h-4" />
          </button>
          <button onClick={handleOpenInNewTab} className="btn-ghost p-2 rounded-lg hover:bg-muted/20" title="Open in new tab">
            <ExternalLink className="w-4 h-4" />
          </button>
          <button onClick={handleDownload} className="btn-ghost p-2 rounded-lg hover:bg-muted/20" title="Download">
            <Download className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex items-center justify-center p-4 relative overflow-hidden">
        {/* Loading Overlay */}
        {(loading || error) && (
          <GameLoadingOverlay
            isLoading={loading}
            error={error}
            gameName={zone.name}
            coverUrl={coverUrl}
            onRetry={loadGame}
          />
        )}

        <iframe
          ref={iframeRef}
          className="w-full h-full max-w-6xl aspect-video border border-border/20 rounded-2xl bg-[#0c0e1a] shadow-2xl relative z-10"
          title={zone.name}
          allowFullScreen
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; gamepad"
          sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-modals"
        />
      </div>
    </div>
  );
}
