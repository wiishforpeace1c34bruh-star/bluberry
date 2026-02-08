import { useState, useEffect } from 'react';
import { Palette, Lock, Eye, EyeOff, Camera, ImagePlus, X, Crown, Info } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Input } from '@/components/ui/input';
import { Badge } from '../badges/Badge';
import { cn } from '@/lib/utils';

interface BadgeData {
  id: string;
  name: string;
  description: string;
  icon_svg: string;
  gradient_from: string;
  gradient_to: string;
  category: string;
  is_role_badge: boolean;
}

interface UserBadge {
  id: string;
  badge_id: string;
  equipped: boolean;
  badge: BadgeData;
}

const PRESET_GRADIENTS = [
  { name: 'Sapphire', from: '217 91% 60%', to: '263 90% 51%' },
  { name: 'Emerald', from: '142 71% 45%', to: '160 84% 39%' },
  { name: 'Gold', from: '45 93% 47%', to: '38 92% 50%' },
  { name: 'Rose', from: '340 82% 52%', to: '291 64% 42%' },
  { name: 'Ocean', from: '199 89% 48%', to: '217 91% 60%' },
  { name: 'Sunset', from: '16 100% 66%', to: '45 93% 47%' },
];

const TITLE_COLORS = [
  { name: 'Default', value: '' },
  { name: 'Red', value: '#ef4444' },
  { name: 'Orange', value: '#f97316' },
  { name: 'Yellow', value: '#eab308' },
  { name: 'Green', value: '#22c55e' },
  { name: 'Blue', value: '#3b82f6' },
  { name: 'Purple', value: '#a855f7' },
  { name: 'Pink', value: '#ec4899' },
];

import { getIdentityDecorations } from '@/lib/identity';

export function ProfileCustomization() {
  const { user, profile, refetchProfile } = useAuth();
  const { isOwner, title, specialBadges } = getIdentityDecorations(profile?.username);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  // Profile fields
  const [bio, setBio] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [bannerUrl, setBannerUrl] = useState('');
  const [gradientFrom, setGradientFrom] = useState('217 91% 60%');
  const [gradientTo, setGradientTo] = useState('263 90% 51%');
  const [showGradient, setShowGradient] = useState(false);
  const [customTitle, setCustomTitle] = useState('');
  const [titleColor, setTitleColor] = useState('');
  const [statusMessage, setStatusMessage] = useState('');
  const [statusType, setStatusType] = useState<'online' | 'idle' | 'dnd' | 'offline' | 'gaming'>('online');
  const [socialLinks, setSocialLinks] = useState<any>({});

  // Password change
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Badges
  const [userBadges, setUserBadges] = useState<UserBadge[]>([]);
  const [equippedBadgeId, setEquippedBadgeId] = useState<string | null>(null);
  const [hoveredBadge, setHoveredBadge] = useState<string | null>(null);

  // Upload states
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [uploadingBanner, setUploadingBanner] = useState(false);

  useEffect(() => {
    if (profile) {
      setBio(profile.bio || '');
      setAvatarUrl(profile.avatar_url || '');
      setBannerUrl(profile.banner_url || '');
      setGradientFrom(profile.gradient_from || '217 91% 60%');
      setGradientTo(profile.gradient_to || '263 90% 51%');
      setShowGradient(profile.show_gradient || false);
      setCustomTitle(profile.custom_title || '');
      setTitleColor(profile.title_color || '');
      setEquippedBadgeId(profile.equipped_badge_id || null);
      setStatusMessage(profile.status_message || '');
      setStatusType(profile.status_type || 'online');
      setSocialLinks(profile.social_links || {});
    }
    fetchUserBadges();
  }, [profile]);

  const fetchUserBadges = async () => {
    if (!user) return;

    // Check if table exists first by simple query or just try-catch
    try {
      const { data, error } = await supabase
        .from('user_badges')
        .select(`
          *,
          badge:badges(*)
        `)
        .eq('user_id', user.id);

      if (error) {
        // Table might not exist, silently fail for now
        console.warn("Could not fetch badges, tables might be missing", error);
        return;
      }

      if (data) {
        setUserBadges(data as unknown as UserBadge[]);
      }
    } catch (e) {
      console.warn("Badge fetch failed", e);
    }
    setLoading(false);
  };

  const uploadFile = async (file: File, type: 'avatar' | 'banner') => {
    if (!user) return null;

    const fileExt = file.name.split('.').pop();
    const fileName = `${type}-${Date.now()}.${fileExt}`;
    const filePath = `${user.id}/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('profile-assets')
      .upload(filePath, file, { upsert: true });

    if (uploadError) {
      console.error('Upload error:', uploadError);
      return null;
    }

    const { data } = supabase.storage
      .from('profile-assets')
      .getPublicUrl(filePath);

    return data.publicUrl;
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setError('Avatar must be under 5MB');
      return;
    }

    setUploadingAvatar(true);
    const url = await uploadFile(file, 'avatar');
    if (url) {
      setAvatarUrl(url);
    } else {
      setError('Failed to upload avatar');
    }
    setUploadingAvatar(false);
  };

  const handleBannerUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setError('Banner must be under 5MB');
      return;
    }

    setUploadingBanner(true);
    const url = await uploadFile(file, 'banner');
    if (url) {
      setBannerUrl(url);
    } else {
      setError('Failed to upload banner');
    }
    setUploadingBanner(false);
  };

  const handleSaveProfile = async () => {
    if (!profile) return;

    setSaving(true);
    setError('');
    setSuccess('');

    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        bio,
        avatar_url: avatarUrl || null,
        banner_url: bannerUrl || null,
        gradient_from: gradientFrom,
        gradient_to: gradientTo,
        show_gradient: showGradient,
        custom_title: customTitle || null,
        title_color: titleColor || null,
        equipped_badge_id: equippedBadgeId,
        status_message: statusMessage,
        status_type: statusType,
        social_links: socialLinks,
      })
      .eq('id', profile.id);

    if (updateError) {
      setError(updateError.message);
    } else {
      setSuccess('Profile updated!');
      refetchProfile?.();
      setTimeout(() => setSuccess(''), 3000);
    }

    setSaving(false);
  };

  const handleChangePassword = async () => {
    if (!newPassword.trim() || newPassword.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    setSaving(true);
    setError('');

    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (error) {
      setError(error.message);
    } else {
      setSuccess('Password changed!');
      setNewPassword('');
      setCurrentPassword('');
      setTimeout(() => setSuccess(''), 3000);
    }

    setSaving(false);
  };

  const applyPreset = (preset: typeof PRESET_GRADIENTS[0]) => {
    setGradientFrom(preset.from);
    setGradientTo(preset.to);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Profile Preview Card */}
      <div className="relative rounded-2xl overflow-hidden bg-card border border-border/30">
        {/* Banner */}
        <div className="relative h-32 bg-gradient-to-br from-primary/30 to-primary/10">
          {bannerUrl && (
            <img
              src={bannerUrl}
              alt="Banner"
              className="w-full h-full object-cover"
            />
          )}
          <label className="absolute bottom-2 right-2 p-2 rounded-lg bg-background/80 backdrop-blur-sm cursor-pointer hover:bg-background transition-colors group">
            <input
              type="file"
              accept="image/*"
              onChange={handleBannerUpload}
              className="hidden"
            />
            {uploadingBanner ? (
              <div className="w-4 h-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
            ) : (
              <div className="flex items-center gap-2">
                <ImagePlus className="w-4 h-4 text-muted-foreground group-hover:text-foreground" />
                <span className="text-xs font-medium hidden group-hover:block transition-all">Change Banner</span>
              </div>
            )}
          </label>
          {bannerUrl && (
            <button
              onClick={() => setBannerUrl('')}
              className="absolute top-2 right-2 p-1.5 rounded-lg bg-background/80 backdrop-blur-sm text-muted-foreground hover:text-destructive transition-colors"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>

        {/* Avatar */}
        <div className="relative -mt-10 ml-4">
          <div className="relative w-20 h-20 rounded-2xl overflow-hidden border-4 border-card bg-secondary shadow-lg">
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt="Avatar"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-2xl font-bold text-muted-foreground">
                {profile?.username?.charAt(0).toUpperCase() || '?'}
              </div>
            )}
            <label className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 hover:opacity-100 cursor-pointer transition-opacity backdrop-blur-[2px]">
              <input
                type="file"
                accept="image/*"
                onChange={handleAvatarUpload}
                className="hidden"
              />
              {uploadingAvatar ? (
                <div className="w-5 h-5 border-2 border-white/50 border-t-white rounded-full animate-spin" />
              ) : (
                <Camera className="w-6 h-6 text-white" />
              )}
            </label>
          </div>
        </div>

        {/* Preview Info */}
        <div className="p-4 pt-2">
          <div className="flex items-center gap-2 mb-1">
            <h3
              className={cn(
                "font-bold text-xl",
                isOwner ? "owner-gradient-text" : ""
              )}
              style={!isOwner && showGradient ? {
                background: `linear-gradient(135deg, hsl(${gradientFrom}) 0%, hsl(${gradientTo}) 100%)`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              } : undefined}
            >
              {profile?.username || 'Username'}
            </h3>
            {isOwner && (
              <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-blue-400/10 border border-blue-400/20 scale-75 origin-left">
                {specialBadges.map((badge, idx) => (
                  <badge.icon key={idx} className={cn("w-3.5 h-3.5", badge.color, badge.animate && "animate-pulse")} />
                ))}
              </div>
            )}
            {equippedBadgeId && userBadges.length > 0 && (
              <div className="transform scale-75 origin-left">
                {userBadges.find(ub => ub.badge_id === equippedBadgeId)?.badge && (
                  <Badge
                    iconSvg={userBadges.find(ub => ub.badge_id === equippedBadgeId)!.badge.icon_svg}
                    gradientFrom={userBadges.find(ub => ub.badge_id === equippedBadgeId)!.badge.gradient_from}
                    gradientTo={userBadges.find(ub => ub.badge_id === equippedBadgeId)!.badge.gradient_to}
                    size="sm"
                  />
                )}
              </div>
            )}
          </div>

          {customTitle && (
            <div
              className="text-xs font-bold uppercase tracking-wider mb-2 inline-block px-2 py-0.5 rounded bg-secondary/50"
              style={{ color: titleColor || undefined }}
            >
              {customTitle}
            </div>
          )}

          <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
            {bio || 'No bio yet...'}
          </p>
        </div>
      </div>

      {/* Title Customization */}
      <div className="space-y-4 pt-4 border-t border-border/30">
        <div className="flex items-center gap-2">
          <Crown className="w-5 h-5 text-primary" />
          <h3 className="font-semibold text-foreground">Custom Title</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground">Title Text</label>
            <Input
              value={customTitle}
              onChange={(e) => setCustomTitle(e.target.value)}
              placeholder="e.g. The Slayer"
              maxLength={20}
              className="bg-secondary/50"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground">Title Color</label>
            <div className="flex flex-wrap gap-2">
              {TITLE_COLORS.map((color) => (
                <button
                  key={color.name}
                  onClick={() => setTitleColor(color.value)}
                  className={`w-8 h-8 rounded-full border-2 transition-all ${titleColor === color.value ? 'border-primary ring-2 ring-primary/20 scale-110' : 'border-transparent hover:scale-105'
                    }`}
                  style={{ background: color.value || 'hsl(var(--foreground))' }}
                  title={color.name}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Username Gradient */}
      <div className="space-y-4 pt-4 border-t border-border/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Palette className="w-5 h-5 text-primary" />
            <h3 className="font-semibold text-foreground">Username Style</h3>
          </div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={showGradient}
              onChange={(e) => setShowGradient(e.target.checked)}
              className="w-4 h-4 rounded border-border bg-secondary"
            />
            <span className="text-sm text-muted-foreground">Enable gradient</span>
          </label>
        </div>

        {showGradient && (
          <div className="space-y-3 animate-fade-in">
            <div className="grid grid-cols-3 gap-2">
              {PRESET_GRADIENTS.map((preset) => (
                <button
                  key={preset.name}
                  onClick={() => applyPreset(preset)}
                  className={`p-2 rounded-lg border transition-all text-sm relative overflow-hidden group ${gradientFrom === preset.from ? 'border-primary ring-1 ring-primary/50' : 'border-border/50'
                    }`}
                >
                  <div
                    className="absolute inset-0 opacity-20 group-hover:opacity-30 transition-opacity"
                    style={{
                      background: `linear-gradient(135deg, hsl(${preset.from}) 0%, hsl(${preset.to}) 100%)`,
                    }}
                  />
                  <span className="relative z-10 font-medium" style={{ color: `hsl(${preset.from})` }}>{preset.name}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Identity & Status */}
      <div className="space-y-4 pt-4 border-t border-border/30">
        <div className="flex items-center gap-2">
          <Info className="w-5 h-5 text-primary" />
          <h3 className="font-semibold text-foreground">Identity & Status</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground">Status Message</label>
            <Input
              value={statusMessage}
              onChange={(e) => setStatusMessage(e.target.value)}
              placeholder="What's on your mind?"
              maxLength={100}
              className="bg-secondary/50"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground">Status Type</label>
            <select
              value={statusType}
              onChange={(e) => setStatusType(e.target.value as any)}
              className="w-full h-10 px-3 rounded-md bg-secondary/50 border border-border/20 text-sm focus:outline-none focus:ring-1 focus:ring-primary/30 transition-all font-medium"
            >
              <option value="online">Online</option>
              <option value="gaming">Gaming</option>
              <option value="idle">Idle</option>
              <option value="dnd">Do Not Disturb</option>
              <option value="offline">Invisible</option>
            </select>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Social Links</label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[10px] text-muted-foreground font-bold uppercase tracking-wider">Discord</span>
              <Input
                value={socialLinks?.discord || ''}
                onChange={(e) => setSocialLinks({ ...socialLinks, discord: e.target.value })}
                placeholder="user#0000"
                className="bg-secondary/50 pl-20"
              />
            </div>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[10px] text-muted-foreground font-bold uppercase tracking-wider">Twitter</span>
              <Input
                value={socialLinks?.twitter || ''}
                onChange={(e) => setSocialLinks({ ...socialLinks, twitter: e.target.value })}
                placeholder="@username"
                className="bg-secondary/50 pl-20"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Bio */}
      <div className="space-y-2 pt-4 border-t border-border/30">
        <label className="text-sm font-medium text-foreground">Bio</label>
        <textarea
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          placeholder="Tell us about yourself..."
          maxLength={200}
          rows={3}
          className="w-full input-modern resize-none bg-secondary/50"
        />
        <p className="text-xs text-muted-foreground text-right">{bio.length}/200</p>
      </div>

      {/* Equipped Badge */}
      {userBadges.length > 0 && (
        <div className="space-y-3 pt-4 border-t border-border/30">
          <div className="flex items-center gap-2">
            <Crown className="w-5 h-5 text-yellow-500" />
            <h3 className="font-semibold text-foreground">Equipped Badge</h3>
          </div>

          <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
            <button
              onClick={() => setEquippedBadgeId(null)}
              className={`aspect-square rounded-xl border transition-all flex flex-col items-center justify-center gap-1 ${!equippedBadgeId ? 'border-primary bg-primary/10 ring-2 ring-primary/20' : 'border-border/50 hover:bg-secondary/50'
                }`}
            >
              <span className="text-xs text-muted-foreground font-medium">None</span>
            </button>
            {userBadges.map((ub) => (
              <div key={ub.id} className="relative group">
                <button
                  onClick={() => setEquippedBadgeId(ub.badge_id)}
                  className={`w-full aspect-square rounded-xl border transition-all flex flex-col items-center justify-center gap-2 px-1 ${equippedBadgeId === ub.badge_id ? 'border-primary bg-primary/10 ring-2 ring-primary/20' : 'border-border/50 hover:bg-secondary/50'
                    }`}
                  onMouseEnter={() => setHoveredBadge(ub.id)}
                  onMouseLeave={() => setHoveredBadge(null)}
                >
                  <Badge
                    iconSvg={ub.badge.icon_svg}
                    gradientFrom={ub.badge.gradient_from}
                    gradientTo={ub.badge.gradient_to}
                    size="md"
                  />
                  <span className="text-[9px] text-muted-foreground truncate w-full text-center leading-tight">
                    {ub.badge.name}
                  </span>
                </button>

                {/* Tooltip */}
                {hoveredBadge === ub.id && (
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2 rounded-lg bg-popover border border-border shadow-xl z-50 animate-fade-in pointer-events-none">
                    <div className="font-bold text-xs text-foreground mb-0.5">{ub.badge.name}</div>
                    <div className="text-[10px] text-muted-foreground">{ub.badge.description}</div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <button onClick={handleSaveProfile} disabled={saving || uploadingAvatar || uploadingBanner} className="btn-primary w-full shadow-lg shadow-primary/20">
        {saving ? (
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            <span>Saving Changes...</span>
          </div>
        ) : 'Save Profile Changes'}
      </button>

      {/* Password Change */}
      <div className="pt-4 border-t border-border/30 space-y-4">
        <div className="flex items-center gap-2">
          <Lock className="w-5 h-5 text-primary" />
          <h3 className="font-semibold text-foreground">Security</h3>
        </div>

        <div className="relative">
          <Input
            type={showPassword ? 'text' : 'password'}
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="New password (min 8 chars)"
            className="bg-secondary/50 border-border/30 pr-10 rounded-xl"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>

        <button onClick={handleChangePassword} disabled={saving || !newPassword.trim()} className="btn-secondary w-full">
          Update Password
        </button>
      </div>

      {/* Messages */}
      {error && <p className="text-sm text-destructive text-center bg-destructive/10 p-2 rounded-lg">{error}</p>}
      {success && <p className="text-sm text-emerald-500 text-center bg-emerald-500/10 p-2 rounded-lg">{success}</p>}
    </div>
  );
}