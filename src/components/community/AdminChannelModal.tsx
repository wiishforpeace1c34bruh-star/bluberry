import { useState, useEffect } from 'react';
import { X, Save, Hash, Type, Info, Palette } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Input } from '@/components/ui/input';

interface AdminChannelModalProps {
    isOpen: boolean;
    onClose: () => void;
    channelToEdit?: any;
    onSuccess: () => void;
}

const ICON_OPTIONS = ['Hash', 'MessageCircle', 'Bell', 'LifeBuoy', 'Coffee'];

export function AdminChannelModal({ isOpen, onClose, channelToEdit, onSuccess }: AdminChannelModalProps) {
    const [name, setName] = useState('');
    const [slug, setSlug] = useState('');
    const [description, setDescription] = useState('');
    const [icon, setIcon] = useState('Hash');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (channelToEdit) {
            setName(channelToEdit.name);
            setSlug(channelToEdit.slug);
            setDescription(channelToEdit.description || '');
            setIcon(channelToEdit.icon || 'Hash');
        } else {
            setName('');
            setSlug('');
            setDescription('');
            setIcon('Hash');
        }
    }, [channelToEdit, isOpen]);

    const handleSave = async () => {
        if (!name.trim() || !slug.trim()) {
            setError('Name and slug are required');
            return;
        }

        setLoading(true);
        setError('');

        const channelData = {
            name: name.trim(),
            slug: slug.trim().toLowerCase().replace(/\s+/g, '-'),
            description: description.trim(),
            icon: icon
        };

        let res;
        if (channelToEdit) {
            res = await (supabase as any)
                .from('chat_channels')
                .update(channelData)
                .eq('id', channelToEdit.id);
        } else {
            res = await (supabase as any)
                .from('chat_channels')
                .insert([channelData]);
        }

        if (res.error) {
            setError(res.error.message);
        } else {
            onSuccess();
            onClose();
        }
        setLoading(false);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-background/80 backdrop-blur-md animate-fade-in">
            <div className="w-full max-w-md bg-card border border-border/20 rounded-[2.5rem] shadow-2xl overflow-hidden animate-fade-in-up">
                <div className="p-6 border-b border-border/10 flex items-center justify-between bg-secondary/10">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-primary/20 flex items-center justify-center">
                            <Hash className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-foreground">{channelToEdit ? 'Edit Channel' : 'Create Channel'}</h2>
                            <p className="text-xs text-muted-foreground italic">Organize your community conversations</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 rounded-xl hover:bg-secondary/50 transition-colors">
                        <X className="w-5 h-5 text-muted-foreground" />
                    </button>
                </div>

                <div className="p-6 space-y-5">
                    {error && (
                        <div className="p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs font-medium animate-shake">
                            {error}
                        </div>
                    )}

                    <div className="space-y-2">
                        <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest ml-1">Channel Name</label>
                        <Input
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="e.g. Lounge"
                            className="bg-secondary/20 h-12"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest ml-1">URL Slug</label>
                        <Input
                            value={slug}
                            onChange={(e) => setSlug(e.target.value)}
                            placeholder="e.g. lounge"
                            className="bg-secondary/20 h-12"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest ml-1">Icon</label>
                        <div className="flex flex-wrap gap-2">
                            {ICON_OPTIONS.map((opt) => (
                                <button
                                    key={opt}
                                    onClick={() => setIcon(opt)}
                                    className={`p-3 rounded-xl border transition-all ${icon === opt ? 'bg-primary/20 border-primary text-primary shadow-glow-sm' : 'bg-secondary/20 border-border/10 text-muted-foreground hover:bg-secondary/40'}`}
                                >
                                    <Hash className="w-4 h-4" />
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest ml-1">Description</label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="What's this channel for?"
                            className="w-full bg-secondary/20 border border-border/10 rounded-2xl p-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all min-h-[100px] resize-none"
                        />
                    </div>
                </div>

                <div className="p-6 bg-secondary/10 border-t border-border/10 flex gap-3">
                    <button onClick={onClose} className="flex-1 btn-secondary rounded-2xl py-3 font-bold">Cancel</button>
                    <button
                        onClick={handleSave}
                        disabled={loading}
                        className="flex-[2] btn-primary rounded-2xl py-3 font-bold shadow-lg shadow-primary/20 flex items-center justify-center gap-2"
                    >
                        {loading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save className="w-4 h-4" />}
                        {channelToEdit ? 'Save Changes' : 'Create Channel'}
                    </button>
                </div>
            </div>
        </div>
    );
}
