import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Input } from '@/components/ui/input';
import { Search, Shield, User, Check, X, Loader2 } from 'lucide-react';
import { Profile } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';
import { getIdentityDecorations } from '@/lib/identity';

interface UserRole {
    user_id: string;
    role: 'admin' | 'user';
}

export function UserManagement() {
    const [users, setUsers] = useState<Profile[]>([]);
    const [userRoles, setUserRoles] = useState<UserRole[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [processingId, setProcessingId] = useState<string | null>(null);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        const [profilesRes, rolesRes] = await Promise.all([
            supabase.from('profiles').select('*').order('created_at', { ascending: false }),
            supabase.from('user_roles').select('*')
        ]);

        if (profilesRes.data) setUsers(profilesRes.data);
        if (rolesRes.data) setUserRoles(rolesRes.data as UserRole[]);
        setLoading(false);
    };

    const isAdmin = (userId: string) => {
        return userRoles.some(r => r.user_id === userId && r.role === 'admin');
    };

    const toggleAdmin = async (userId: string, currentStatus: boolean) => {
        if (processingId) return;
        setProcessingId(userId);

        try {
            if (currentStatus) {
                // Remove Admin
                await supabase.from('user_roles').delete().match({ user_id: userId, role: 'admin' });
                setUserRoles(prev => prev.filter(r => !(r.user_id === userId && r.role === 'admin')));
            } else {
                // Add Admin
                await supabase.from('user_roles').insert({ user_id: userId, role: 'admin' });
                setUserRoles(prev => [...prev, { user_id: userId, role: 'admin' }]);
            }
        } catch (err) {
            console.error('Error toggling role:', err);
        } finally {
            setProcessingId(null);
        }
    };

    const filteredUsers = users.filter(u =>
        u.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.id.includes(searchQuery)
    );

    return (
        <div className="space-y-6 animate-fade-in-up">
            {/* Search Bar */}
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                    placeholder="Search users by username or ID..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 h-12 bg-secondary/50 border-border/50 text-lg"
                />
            </div>

            {/* Users List */}
            <div className="grid gap-3">
                {loading ? (
                    <div className="flex justify-center py-12">
                        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
                    </div>
                ) : filteredUsers.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                        No users found.
                    </div>
                ) : (
                    filteredUsers.map(user => {
                        const { isOwner, specialBadges } = getIdentityDecorations(user.username);
                        const admin = isAdmin(user.user_id);

                        return (
                            <div key={user.id} className="group flex items-center justify-between p-4 rounded-xl bg-card border border-border/50 hover:border-primary/20 transition-all hover:shadow-lg">
                                <div className="flex items-center gap-4">
                                    <div className={cn(
                                        "w-12 h-12 rounded-full overflow-hidden bg-secondary flex items-center justify-center text-lg font-bold border-2",
                                        isOwner ? "border-red-500 text-red-500" : admin ? "border-blue-500 text-blue-500" : "border-transparent text-muted-foreground"
                                    )}>
                                        {user.avatar_url ? (
                                            <img src={user.avatar_url} className="w-full h-full object-cover" />
                                        ) : (
                                            user.username.charAt(0).toUpperCase()
                                        )}
                                    </div>

                                    <div>
                                        <div className="flex items-center gap-2">
                                            <h3 className={cn("font-bold", isOwner ? "text-red-500" : admin ? "text-blue-400" : "text-foreground")}>
                                                {user.username}
                                            </h3>
                                            {isOwner && <span className="px-1.5 py-0.5 rounded-md bg-red-500/10 text-red-500 text-[10px] font-black uppercase">Owner</span>}
                                            {admin && !isOwner && <span className="px-1.5 py-0.5 rounded-md bg-blue-500/10 text-blue-400 text-[10px] font-black uppercase">Admin</span>}
                                        </div>
                                        <p className="text-xs text-muted-foreground font-mono">{user.user_id}</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3">
                                    {isOwner ? (
                                        <div className="px-4 py-2 rounded-lg bg-red-500/10 text-red-500 text-xs font-bold flex items-center gap-2 cursor-not-allowed opacity-50">
                                            <Shield className="w-4 h-4" />
                                            Cannot Modify
                                        </div>
                                    ) : (
                                        <button
                                            onClick={() => toggleAdmin(user.user_id, admin)}
                                            disabled={processingId === user.user_id}
                                            className={cn(
                                                "px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 transition-all",
                                                admin
                                                    ? "bg-red-500/10 text-red-500 hover:bg-red-500/20"
                                                    : "bg-blue-500/10 text-blue-500 hover:bg-blue-500/20"
                                            )}
                                        >
                                            {processingId === user.user_id ? (
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                            ) : admin ? (
                                                <><X className="w-4 h-4" /> Remove Admin</>
                                            ) : (
                                                <><Shield className="w-4 h-4" /> Make Admin</>
                                            )}
                                        </button>
                                    )}
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
}
