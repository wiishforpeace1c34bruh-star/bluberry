import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Download, FileArchive, Calendar, HardDrive } from 'lucide-react';

interface GameFile {
  id: string;
  name: string;
  description: string | null;
  file_url: string;
  file_size: number | null;
  created_at: string;
}

export function DownloadsView() {
  const [files, setFiles] = useState<GameFile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFiles = async () => {
      const { data } = await supabase
        .from('game_files')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (data) setFiles(data as GameFile[]);
      setLoading(false);
    };

    fetchFiles();
  }, []);

  const formatFileSize = (bytes: number | null) => {
    if (!bytes) return 'Unknown size';
    const units = ['B', 'KB', 'MB', 'GB'];
    let size = bytes;
    let unitIndex = 0;
    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }
    return `${size.toFixed(1)} ${units[unitIndex]}`;
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="w-5 h-5 border-2 border-muted-foreground/30 border-t-muted-foreground rounded-full animate-spin" />
      </div>
    );
  }

  if (files.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <FileArchive className="w-12 h-12 text-muted-foreground/30 mb-4" />
        <h3 className="text-lg font-medium text-foreground mb-1">No Downloads Available</h3>
        <p className="text-sm text-muted-foreground">Check back later for game files</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-foreground mb-6">Available Downloads</h2>
      
      <div className="grid gap-4 sm:grid-cols-2">
        {files.map((file, index) => (
          <div 
            key={file.id} 
            className="card-modern p-4 rounded-xl animate-fade-in-up group"
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-secondary/50 flex items-center justify-center flex-shrink-0 group-hover:bg-secondary transition-colors">
                <FileArchive className="w-6 h-6 text-muted-foreground" />
              </div>
              
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-foreground mb-1 truncate">{file.name}</h3>
                
                {file.description && (
                  <p className="text-sm text-muted-foreground mb-2 line-clamp-2">{file.description}</p>
                )}
                
                <div className="flex items-center gap-3 text-xs text-muted-foreground/70">
                  <div className="flex items-center gap-1">
                    <HardDrive className="w-3 h-3" />
                    {formatFileSize(file.file_size)}
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {formatDate(file.created_at)}
                  </div>
                </div>
              </div>
            </div>

            <a
              href={file.file_url}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 flex items-center justify-center gap-2 w-full py-2.5 rounded-lg bg-foreground text-background font-medium text-sm transition-all duration-200 hover:opacity-90 active:scale-[0.98]"
            >
              <Download className="w-4 h-4" />
              Download
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}
