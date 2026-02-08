import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { FileText, Calendar, Sparkles, Bug, Zap, CheckCircle2 } from 'lucide-react';

interface PatchNote {
  id: string;
  title: string;
  content: string;
  version: string | null;
  created_at: string;
}

// Parse categories from content
const parseCategories = (content: string) => {
  const categories = [];
  if (content.toLowerCase().includes('bug') || content.toLowerCase().includes('fix')) {
    categories.push({ name: 'Bug Fixes', icon: Bug, color: 'text-red-400' });
  }
  if (content.toLowerCase().includes('feature') || content.toLowerCase().includes('new')) {
    categories.push({ name: 'Features', icon: Sparkles, color: 'text-purple-400' });
  }
  if (content.toLowerCase().includes('improve') || content.toLowerCase().includes('enhance')) {
    categories.push({ name: 'Improvements', icon: Zap, color: 'text-yellow-400' });
  }
  if (categories.length === 0) {
    categories.push({ name: 'Updates', icon: CheckCircle2, color: 'text-blue-400' });
  }
  return categories;
};

export function PatchNotesView() {
  const [notes, setNotes] = useState<PatchNote[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    const fetchNotes = async () => {
      const { data } = await supabase
        .from('patch_notes')
        .select('*')
        .order('created_at', { ascending: false });

      if (data) setNotes(data as PatchNote[]);
      setLoading(false);
    };

    fetchNotes();
  }, []);

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const isRecent = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const daysSince = (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24);
    return daysSince < 7;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="w-5 h-5 border-2 border-muted-foreground/30 border-t-muted-foreground rounded-full animate-spin" />
      </div>
    );
  }

  if (notes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <FileText className="w-12 h-12 text-muted-foreground/30 mb-4" />
        <h3 className="text-lg font-medium text-foreground mb-1">No Updates Yet</h3>
        <p className="text-sm text-muted-foreground">Check back later for patch notes</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-8 animate-fade-in-down">
        <div>
          <h2 className="text-2xl font-bold text-foreground mb-1">
            Latest Updates
          </h2>
          <p className="text-sm text-muted-foreground">
            Stay up to date with new features and improvements
          </p>
        </div>
        <div className="px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-semibold">
          {notes.length} {notes.length === 1 ? 'Update' : 'Updates'}
        </div>
      </div>

      {/* Timeline */}
      <div className="relative">
        {/* Timeline line */}
        <div className="absolute left-[19px] top-8 bottom-8 w-0.5 bg-gradient-to-b from-primary/50 via-primary/20 to-transparent" />

        {notes.map((note, index) => {
          const categories = parseCategories(note.content);
          const isExpanded = expandedId === note.id;
          const recent = isRecent(note.created_at);

          return (
            <div
              key={note.id}
              className="relative pl-14 pb-10 animate-fade-in-up"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {/* Timeline node */}
              <div className="absolute left-0 top-2 w-10 h-10 rounded-full bg-card border-2 border-primary flex items-center justify-center shadow-lg shadow-primary/20 animate-glow-pulse">
                <FileText className="w-5 h-5 text-primary" />
              </div>

              {/* Content card */}
              <div className="card-modern rounded-xl overflow-hidden hover-lift">
                <button
                  onClick={() => setExpandedId(isExpanded ? null : note.id)}
                  className="w-full p-5 text-left transition-colors"
                >
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2 flex-wrap">
                        <h3 className="font-bold text-lg text-foreground">
                          {note.title}
                        </h3>
                        {note.version && (
                          <div className="px-3 py-1 rounded-full bg-gradient-to-r from-primary/20 to-accent/20 border border-primary/30 text-primary text-xs font-bold shadow-sm shadow-primary/10 animate-shimmer">
                            v{note.version}
                          </div>
                        )}
                        {recent && (
                          <div className="px-2 py-0.5 rounded-full bg-green-500/20 border border-green-500/30 text-green-400 text-xs font-semibold flex items-center gap-1 animate-bounce-gentle">
                            <Sparkles className="w-3 h-3" />
                            New
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-4 text-xs text-muted-foreground flex-wrap">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5" />
                          {formatDate(note.created_at)}
                        </div>

                        {/* Category tags */}
                        <div className="flex items-center gap-2">
                          {categories.map((cat, i) => {
                            const Icon = cat.icon;
                            return (
                              <div key={i} className={`flex items-center gap-1 ${cat.color}`}>
                                <Icon className="w-3.5 h-3.5" />
                                <span className="font-medium">{cat.name}</span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>

                    <div className={`transform transition-transform duration-300 flex-shrink-0 ${isExpanded ? 'rotate-180' : ''}`}>
                      <svg className="w-5 h-5 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                </button>

                {/* Expanded content with smooth height transition */}
                <div
                  className={`
                    transition-all duration-500 ease-in-out overflow-hidden
                    ${isExpanded ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'}
                  `}
                >
                  <div className="px-5 pb-5 pt-0">
                    <div className="border-t border-border/30 pt-4">
                      <p className="text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed">
                        {note.content}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
