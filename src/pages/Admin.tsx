import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { AnimatedBackground } from '@/components/AnimatedBackground';
import { Input } from '@/components/ui/input';
import { UserManagement } from '@/components/admin/UserManagement';
import {
  ArrowLeft, Plus, Trash2, FileText, Download, Upload,
  AlertCircle, CheckCircle, Loader2, Users, Settings, Zap, Megaphone, Sparkles
} from 'lucide-react';
import { Switch } from '@/components/ui/switch';

interface PatchNote {
  id: string;
  title: string;
  content: string;
  version: string | null;
  created_at: string;
}

interface GameFile {
  id: string;
  name: string;
  description: string | null;
  file_url: string;
  file_size: number | null;
  created_at: string;
}

export default function Admin() {
  const { user, isAdmin, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [tab, setTab] = useState<'notes' | 'files' | 'users' | 'system'>('notes');
  const [patchNotes, setPatchNotes] = useState<PatchNote[]>([]);
  const [gameFiles, setGameFiles] = useState<GameFile[]>([]);
  const [loading, setLoading] = useState(true);

  // Form states
  const [noteTitle, setNoteTitle] = useState('');
  const [noteContent, setNoteContent] = useState('');
  const [noteVersion, setNoteVersion] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [fileName, setFileName] = useState('');
  const [fileDescription, setFileDescription] = useState('');

  // System states
  const [broadcastMessage, setBroadcastMessage] = useState('');
  const [targetUsername, setTargetUsername] = useState('');
  const [newXp, setNewXp] = useState('');
  const [newLevel, setNewLevel] = useState('');
  const [fxToggles, setFxToggles] = useState({
    starfield: true,
    prism: true,
    caustics: true,
    diamondDust: true
  });

  useEffect(() => {
    if (!authLoading && (!user || !isAdmin)) {
      navigate('/');
    }
  }, [user, isAdmin, authLoading, navigate]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);

    const [notesRes, filesRes] = await Promise.all([
      supabase.from('patch_notes').select('*').order('created_at', { ascending: false }),
      supabase.from('game_files').select('*').order('created_at', { ascending: false }),
    ]);

    if (notesRes.data) setPatchNotes(notesRes.data as PatchNote[]);
    if (filesRes.data) setGameFiles(filesRes.data as GameFile[]);

    setLoading(false);
  };

  const handleCreateNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteTitle.trim() || !noteContent.trim()) {
      setError('Title and content are required');
      return;
    }

    setSaving(true);
    setError('');

    const { error } = await supabase.from('patch_notes').insert({
      title: noteTitle.trim(),
      content: noteContent.trim(),
      version: noteVersion.trim() || null,
      created_by: user?.id,
    });

    if (error) {
      setError(error.message);
    } else {
      setSuccess('Patch note created!');
      setNoteTitle('');
      setNoteContent('');
      setNoteVersion('');
      fetchData();
      setTimeout(() => setSuccess(''), 3000);
    }

    setSaving(false);
  };

  const handleDeleteNote = async (id: string) => {
    if (!confirm('Delete this patch note?')) return;

    const { error } = await supabase.from('patch_notes').delete().eq('id', id);
    if (!error) {
      fetchData();
    }
  };

  const handleFileUpload = async (file: File) => {
    if (!fileName.trim()) {
      setError('File name is required');
      return;
    }

    setUploading(true);
    setUploadProgress(0);
    setError('');

    try {
      const fileExt = file.name.split('.').pop();
      const filePath = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('game-files')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from('game-files')
        .getPublicUrl(filePath);

      const { error: dbError } = await supabase.from('game_files').insert({
        name: fileName.trim(),
        description: fileDescription.trim() || null,
        file_url: urlData.publicUrl,
        file_size: file.size,
        uploaded_by: user?.id,
      });

      if (dbError) throw dbError;

      setSuccess('File uploaded!');
      setFileName('');
      setFileDescription('');
      fetchData();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.message);
    }

    setUploading(false);
    setUploadProgress(0);
  };

  const handleDeleteFile = async (id: string, fileUrl: string) => {
    if (!confirm('Delete this file?')) return;

    // Extract file path from URL
    const urlParts = fileUrl.split('/');
    const filePath = urlParts[urlParts.length - 1];

    await supabase.storage.from('game-files').remove([filePath]);
    const { error } = await supabase.from('game_files').delete().eq('id', id);

    if (!error) {
      fetchData();
    }
  };

  const formatFileSize = (bytes: number | null) => {
    if (!bytes) return 'Unknown';
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

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-6 h-6 border-2 border-foreground/30 border-t-foreground rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen relative">
      <AnimatedBackground />

      <div className="relative z-10 max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => navigate('/')}
            className="p-2 rounded-lg hover:bg-secondary/50 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </button>
          <div>
            <h1 className="font-logo text-2xl text-foreground">Admin Panel</h1>
            <p className="text-sm text-muted-foreground">Manage patch notes, files, and users</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <button onClick={() => setTab('notes')} className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${tab === 'notes' ? 'bg-foreground text-background' : 'bg-secondary/50 text-foreground hover:bg-secondary'}`}>
            <FileText className="w-4 h-4 inline-block mr-2" />
            Patch Notes
          </button>
          <button onClick={() => setTab('files')} className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${tab === 'files' ? 'bg-foreground text-background' : 'bg-secondary/50 text-foreground hover:bg-secondary'}`}>
            <Download className="w-4 h-4 inline-block mr-2" />
            Game Files
          </button>
          <button onClick={() => setTab('users')} className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${tab === 'users' ? 'bg-foreground text-background' : 'bg-secondary/50 text-foreground hover:bg-secondary'}`}>
            <Users className="w-4 h-4 inline-block mr-2" />
            Users
          </button>
          <button onClick={() => setTab('system')} className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${tab === 'system' ? 'bg-foreground text-background' : 'bg-secondary/50 text-foreground hover:bg-secondary'}`}>
            <Settings className="w-4 h-4 inline-block mr-2" />
            System
          </button>
        </div>

        {/* Messages */}
        {error && (
          <div className="flex items-center gap-2 p-3 mb-4 rounded-lg bg-destructive/10 border border-destructive/20">
            <AlertCircle className="w-4 h-4 text-destructive" />
            <p className="text-sm text-destructive">{error}</p>
          </div>
        )}

        {success && (
          <div className="flex items-center gap-2 p-3 mb-4 rounded-lg bg-green-500/10 border border-green-500/20">
            <CheckCircle className="w-4 h-4 text-green-500" />
            <p className="text-sm text-green-500">{success}</p>
          </div>
        )}

        {/* Patch Notes Tab */}
        {tab === 'notes' && (
          <div className="space-y-6">
            <div className="card-modern p-6 rounded-xl">
              <h2 className="text-lg font-semibold text-foreground mb-4">Create Patch Note</h2>
              <form onSubmit={handleCreateNote} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-foreground mb-1 block">Title</label>
                    <Input value={noteTitle} onChange={(e) => setNoteTitle(e.target.value)} placeholder="v1.0.0 Release" className="bg-secondary/50 border-border/50" />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground mb-1 block">Version (optional)</label>
                    <Input value={noteVersion} onChange={(e) => setNoteVersion(e.target.value)} placeholder="1.0.0" className="bg-secondary/50 border-border/50" />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground mb-1 block">Content</label>
                  <textarea value={noteContent} onChange={(e) => setNoteContent(e.target.value)} placeholder="Write your patch notes here..." rows={5} className="w-full px-3 py-2 rounded-md bg-secondary/50 border border-border/50 text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-foreground/30 resize-none" />
                </div>
                <button type="submit" disabled={saving} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-foreground text-background font-medium transition-opacity hover:opacity-90 disabled:opacity-50">
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                  Create Note
                </button>
              </form>
            </div>

            <div className="space-y-3">
              {patchNotes.map((note) => (
                <div key={note.id} className="card-modern p-4 rounded-xl">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-foreground">{note.title}</h3>
                        {note.version && <span className="px-2 py-0.5 rounded-full bg-secondary text-xs text-muted-foreground">v{note.version}</span>}
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-2">{note.content}</p>
                      <p className="text-xs text-muted-foreground/60 mt-2">{formatDate(note.created_at)}</p>
                    </div>
                    <button onClick={() => handleDeleteNote(note.id)} className="p-2 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Files Tab */}
        {tab === 'files' && (
          <div className="space-y-6">
            <div className="card-modern p-6 rounded-xl">
              <h2 className="text-lg font-semibold text-foreground mb-4">Upload Game File</h2>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-foreground mb-1 block">Name</label>
                    <Input value={fileName} onChange={(e) => setFileName(e.target.value)} placeholder="Game Pack v1" className="bg-secondary/50 border-border/50" />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground mb-1 block">Description (optional)</label>
                    <Input value={fileDescription} onChange={(e) => setFileDescription(e.target.value)} placeholder="Contains 50+ games" className="bg-secondary/50 border-border/50" />
                  </div>
                </div>
                <input ref={fileInputRef} type="file" accept=".zip,.html,.js,.json" onChange={(e) => { const file = e.target.files?.[0]; if (file) handleFileUpload(file); }} className="hidden" />
                <button onClick={() => fileInputRef.current?.click()} disabled={uploading || !fileName.trim()} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-foreground text-background font-medium transition-opacity hover:opacity-90 disabled:opacity-50">
                  {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                  {uploading ? 'Uploading...' : 'Select & Upload File'}
                </button>
              </div>
            </div>

            <div className="space-y-3">
              {gameFiles.map((file) => (
                <div key={file.id} className="card-modern p-4 rounded-xl">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-foreground">{file.name}</h3>
                      {file.description && <p className="text-sm text-muted-foreground">{file.description}</p>}
                      <div className="flex items-center gap-3 text-xs text-muted-foreground/60 mt-1">
                        <span>{formatFileSize(file.file_size)}</span>
                        <span>•</span>
                        <span>{formatDate(file.created_at)}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <a href={file.file_url} target="_blank" rel="noopener noreferrer" className="p-2 rounded-lg text-foreground hover:bg-secondary transition-colors">
                        <Download className="w-4 h-4" />
                      </a>
                      <button onClick={() => handleDeleteFile(file.id, file.file_url)} className="p-2 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Users Tab */}
        {tab === 'users' && (
          <div className="card-modern p-6 rounded-xl">
            <div className="mb-6">
              <h2 className="text-xl font-bold mb-1">User Management</h2>
              <p className="text-sm text-muted-foreground">Assign roles and permissions</p>
            </div>
            <UserManagement />
          </div>
        )}

        {/* System Tab */}
        {tab === 'system' && (
          <div className="space-y-6">
            <div className="card-modern p-6 rounded-xl">
              <div className="flex items-center gap-2 mb-4">
                <Zap className="w-5 h-5 text-blue-400" />
                <h2 className="text-lg font-semibold text-foreground">Stat Overrider</h2>
              </div>
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-1 block uppercase">Target Username</label>
                    <Input value={targetUsername} onChange={(e) => setTargetUsername(e.target.value)} placeholder="bleed" className="bg-secondary/50 border-border/50" />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-1 block uppercase">Set XP</label>
                    <Input value={newXp} onChange={(e) => setNewXp(e.target.value)} placeholder="999999" className="bg-secondary/50 border-border/50" />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-1 block uppercase">Set Level</label>
                    <Input value={newLevel} onChange={(e) => setNewLevel(e.target.value)} placeholder="100" className="bg-secondary/50 border-border/50" />
                  </div>
                </div>
                <button
                  onClick={async () => {
                    setSaving(true);
                    const { data: profile } = await supabase.from('profiles').select('id').eq('username', targetUsername).single();
                    if (!profile) setError('User not found');
                    else {
                      const { error } = await supabase.from('profiles').update({ xp: parseInt(newXp) || 0, level: parseInt(newLevel) || 0 }).eq('id', profile.id);
                      if (error) setError(error.message);
                      else setSuccess('Stats updated successfully');
                    }
                    setSaving(false);
                  }}
                  className="px-6 py-2 rounded-lg bg-blue-600 text-white font-bold hover:bg-blue-500 transition-colors disabled:opacity-50"
                  disabled={saving || !targetUsername}
                >
                  Apply Override
                </button>
              </div>
            </div>

            <div className="card-modern p-6 rounded-xl">
              <div className="flex items-center gap-2 mb-4">
                <Megaphone className="w-5 h-5 text-red-400" />
                <h2 className="text-lg font-semibold text-foreground">Global Broadcast</h2>
              </div>
              <div className="space-y-3">
                <textarea value={broadcastMessage} onChange={(e) => setBroadcastMessage(e.target.value)} placeholder="Enter message for all users..." className="w-full h-24 p-4 rounded-xl bg-secondary/30 border border-white/5 text-foreground focus:border-red-500/50 outline-none transition-colors" />
                <button onClick={() => { setSuccess('Broadcast queued (Prototype)'); setBroadcastMessage(''); }} className="px-6 py-2 rounded-lg bg-red-600 text-white font-bold hover:bg-red-500 transition-colors">Broadcast to All</button>
              </div>
            </div>

            <div className="card-modern p-6 rounded-xl">
              <div className="flex items-center gap-2 mb-6">
                <Sparkles className="w-5 h-5 text-primary" />
                <h2 className="text-lg font-semibold text-foreground">Visual FX Sync</h2>
              </div>
              <div className="grid grid-cols-2 gap-6">
                {Object.entries(fxToggles).map(([key, val]) => (
                  <div key={key} className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/5">
                    <span className="text-sm font-bold uppercase tracking-widest text-blue-100">{key}</span>
                    <Switch checked={val} onCheckedChange={(checked) => setFxToggles(prev => ({ ...prev, [key]: checked }))} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
