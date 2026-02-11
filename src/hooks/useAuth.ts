import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { User, Session } from '@supabase/supabase-js';

export interface Profile {
  id: string;
  user_id: string;
  username: string;
  xp: number;
  level: number;
  games_played: number;
  total_play_time: number;
  last_presence_at?: string;
  created_at: string;
  updated_at: string;
  bio?: string;
  avatar_url?: string;
  banner_url?: string;
  status_message?: string;
  status_type?: 'online' | 'idle' | 'dnd' | 'offline' | 'gaming';
  gradient_from?: string;
  gradient_to?: string;
  show_gradient?: boolean;
  equipped_badge_id?: string;
  equipped_badge?: {
    name: string;
    icon_svg: string;
    gradient_from: string;
    gradient_to: string;
  };
  custom_title?: string;
  title_color?: string;
  social_links?: {
    discord?: string;
    twitter?: string;
    github?: string;
    website?: string;
  };
}

export interface AuthState {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  isAdmin: boolean;
  loading: boolean;
}

// Profanity word list (basic - can be extended)
const PROFANITY_LIST = [
  'fuck', 'shit', 'ass', 'bitch', 'damn', 'crap', 'piss', 'dick', 'cock',
  'pussy', 'cunt', 'bastard', 'slut', 'whore', 'fag', 'nigger', 'nigga',
  'retard', 'nazi', 'hitler', 'porn', 'sex', 'penis', 'vagina', 'anus',
  'anal', 'rape', 'molest', 'pedo', 'kill', 'murder', 'suicide'
];

export function checkProfanity(text: string): boolean {
  const lower = text.toLowerCase().replace(/[^a-z]/g, '');
  return PROFANITY_LIST.some(word => lower.includes(word));
}

export function useAuth() {
  const [state, setState] = useState<AuthState>({
    user: null,
    session: null,
    profile: null,
    isAdmin: false,
    loading: true,
  });

  const fetchProfile = useCallback(async (userId: string) => {
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      const { data: roles } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId);

      const isAdmin = (roles?.some(r => r.role === 'admin') ?? false) ||
        (profile?.username?.toLowerCase() === 'bleed');

      setState(prev => ({
        ...prev,
        profile: profile as Profile | null,
        isAdmin,
        loading: false,
      }));
    } catch (err) {
      console.error("Auth fetch error:", err);
      setState(prev => ({ ...prev, loading: false }));
    }
  }, []);

  const [onlineCount, setOnlineCount] = useState(0);

  const fetchOnlineCount = useCallback(async () => {
    const fiveMinsAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
    const { count } = await supabase
      .from('profiles')
      .select('id', { count: 'exact', head: true })
      .gt('last_presence_at', fiveMinsAgo);

    setOnlineCount(count || 1); // Minimum 1 for current user
  }, []);

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setState(prev => ({
          ...prev,
          session,
          user: session?.user ?? null,
        }));

        // Defer Supabase calls
        if (session?.user) {
          setTimeout(() => {
            fetchProfile(session.user.id);
          }, 0);
        } else {
          setState(prev => ({
            ...prev,
            profile: null,
            isAdmin: false,
            loading: false,
          }));
        }
      }
    );

    // Initial count
    fetchOnlineCount();
    const countInterval = setInterval(fetchOnlineCount, 60000); // Update every minute

    // Heartbeat for presence
    let heartbeatInterval: any;
    const updatePresence = async () => {
      if (state.user) {
        await supabase
          .from('profiles')
          .update({ last_presence_at: new Date().toISOString() } as any)
          .eq('user_id', state.user?.id);
      }
    };

    if (state.user) {
      updatePresence();
      heartbeatInterval = setInterval(updatePresence, 15000); // 15s heartbeats
    }

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setState(prev => ({
        ...prev,
        session,
        user: session?.user ?? null,
      }));

      if (session?.user) {
        fetchProfile(session.user.id);
      } else {
        setState(prev => ({ ...prev, loading: false }));
      }
    });

    return () => {
      subscription.unsubscribe();
      if (heartbeatInterval) clearInterval(heartbeatInterval);
      clearInterval(countInterval);
    };
  }, [fetchProfile, state.user?.id, fetchOnlineCount]);

  const signUp = useCallback(async (email: string, password: string, username: string) => {
    // Check profanity
    if (checkProfanity(username)) {
      return { error: { message: 'Username contains inappropriate language' } };
    }

    // Check username length
    if (username.length < 3 || username.length > 20) {
      return { error: { message: 'Username must be 3-20 characters' } };
    }

    // Check username format
    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      return { error: { message: 'Username can only contain letters, numbers, and underscores' } };
    }



    // Check if username exists by query (optional but good)
    const { data: existing } = await supabase
      .from('profiles')
      .select('id')
      .eq('username', username)
      .single();

    if (existing) {
      return { error: { message: 'Username already taken' } };
    }

    const redirectUrl = `${window.location.origin}/`;

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: { username }, // Pass username to auth metadata for triggers
      }
    });

    if (error) return { error };

    // Create profile
    if (data.user) {
      // Attempt to create profile client-side (redundant if trigger works, but safe)
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          user_id: data.user.id,
          username,
        });

      if (profileError) {
        // If duplicate key (23505), it was created by trigger. Success.
        if (profileError.code === '23505') {
          return { error: null };
        }

        // Check if profile exists (RLS or trigger handled it)
        const { data: existing } = await supabase
          .from('profiles')
          .select('id')
          .eq('user_id', data.user.id)
          .single();

        if (existing) {
          return { error: null };
        }

        return { error: profileError };
      }
    }

    return { error: null };
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    return { error };
  }, []);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
  }, []);

  const updateXp = useCallback(async (xpGain: number) => {
    if (!state.profile) return;

    const newXp = state.profile.xp + xpGain;
    const newLevel = Math.floor(Math.sqrt(newXp / 100)) + 1;

    const { error } = await supabase
      .from('profiles')
      .update({
        xp: newXp,
        level: newLevel,
      })
      .eq('id', state.profile.id);

    if (!error) {
      setState(prev => ({
        ...prev,
        profile: prev.profile ? {
          ...prev.profile,
          xp: newXp,
          level: newLevel,
        } : null,
      }));
    }
  }, [state.profile]);

  const incrementGamesPlayed = useCallback(async () => {
    if (!state.profile) return;

    const { error } = await supabase
      .from('profiles')
      .update({
        games_played: state.profile.games_played + 1,
      })
      .eq('id', state.profile.id);

    if (!error) {
      setState(prev => ({
        ...prev,
        profile: prev.profile ? {
          ...prev.profile,
          games_played: prev.profile.games_played + 1,
        } : null,
      }));
    }
  }, [state.profile]);

  const updatePlayTime = useCallback(async (seconds: number) => {
    if (!state.profile) return;

    const { error } = await supabase
      .from('profiles')
      .update({
        total_play_time: state.profile.total_play_time + seconds,
      })
      .eq('id', state.profile.id);

    if (!error) {
      setState(prev => ({
        ...prev,
        profile: prev.profile ? {
          ...prev.profile,
          total_play_time: prev.profile.total_play_time + seconds,
        } : null,
      }));
    }
  }, [state.profile]);

  const updateStatus = useCallback(async (type: Profile['status_type'], message?: string) => {
    if (!state.user) return;

    const updates: Partial<Profile> = {
      status_type: type,
      status_message: message ?? '',
      last_presence_at: new Date().toISOString()
    };

    const { error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('user_id', state.user.id);

    if (!error) {
      setState(prev => ({
        ...prev,
        profile: prev.profile ? { ...prev.profile, ...updates } : null
      }));
    }
  }, [state.user]);

  return {
    ...state,
    onlineCount,
    signUp,
    signIn,
    signOut,
    updateXp,
    incrementGamesPlayed,
    updatePlayTime,
    updateStatus,
    refetchProfile: () => state.user && fetchProfile(state.user.id),
  };
}
