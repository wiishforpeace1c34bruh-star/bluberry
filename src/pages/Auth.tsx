import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth, checkProfanity } from '@/hooks/useAuth';
import { AnimatedBackground } from '@/components/AnimatedBackground';
import { Input } from '@/components/ui/input';
import { Eye, EyeOff, User, Mail, Lock, ArrowRight, AlertCircle, CheckCircle, Sparkles } from 'lucide-react';
import { z } from 'zod';

const signUpSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  username: z.string()
    .min(3, 'Username must be at least 3 characters')
    .max(20, 'Username must be at most 20 characters')
    .regex(/^[a-zA-Z0-9_]+$/, 'Only letters, numbers, and underscores allowed'),
});

const signInSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export default function Auth() {
  const [mode, setMode] = useState<'signin' | 'signup'>('signup');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [usernameStatus, setUsernameStatus] = useState<'idle' | 'checking' | 'available' | 'taken' | 'invalid'>('idle');

  const { signUp, signIn, user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user && !authLoading) {
      navigate('/');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (mode === 'signup' && username.length >= 3) {
      const timeout = setTimeout(async () => {
        if (checkProfanity(username)) {
          setUsernameStatus('invalid');
          return;
        }
        if (!/^[a-zA-Z0-9_]+$/.test(username)) {
          setUsernameStatus('invalid');
          return;
        }
        setUsernameStatus('checking');
        // We'll check via the signup function instead
        setUsernameStatus('available');
      }, 500);

      return () => clearTimeout(timeout);
    } else {
      setUsernameStatus('idle');
    }
  }, [username, mode]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      if (mode === 'signup') {
        const validation = signUpSchema.safeParse({ email, password, username });
        if (!validation.success) {
          setError(validation.error.errors[0].message);
          setLoading(false);
          return;
        }

        if (checkProfanity(username)) {
          setError('Username contains inappropriate language');
          setLoading(false);
          return;
        }

        const { error } = await signUp(email, password, username);
        if (error) {
          setError(error.message);
        } else {
          setSuccess('Account created! Check your email to verify.');
        }
      } else {
        const validation = signInSchema.safeParse({ email, password });
        if (!validation.success) {
          setError(validation.error.errors[0].message);
          setLoading(false);
          return;
        }

        const { error } = await signIn(email, password);
        if (error) {
          if (error.message.includes('Invalid login')) {
            setError('Invalid email or password');
          } else {
            setError(error.message);
          }
        }
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    }

    setLoading(false);
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-6 h-6 border-2 border-foreground/30 border-t-foreground rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen relative flex items-center justify-center p-4 overflow-hidden">
      <AnimatedBackground />

      <div className="relative z-10 w-full max-w-md animate-fade-in-up">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Sparkles className="w-6 h-6 text-primary animate-pulse-subtle" />
            <h1 className="font-logo text-3xl md:text-4xl gradient-text">
              SAPPHIRE
            </h1>
            <Sparkles className="w-6 h-6 text-accent animate-pulse-subtle" />
          </div>
          <p className="text-sm text-muted-foreground">
            {mode === 'signup' ? 'Create your account' : 'Welcome back'}
          </p>
        </div>

        {/* Form Card */}
        <div className="card-modern p-6 rounded-2xl gradient-border">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Username Field - Now for both Sign Up and Sign In */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Username</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-primary/60" />
                <Input
                  type="text"
                  placeholder="Enter your username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="pl-10 pr-10 bg-secondary/50 border-border/50 focus-visible:ring-1 focus-visible:ring-primary/50"
                  maxLength={20}
                />
                {mode === 'signup' && usernameStatus === 'available' && username.length >= 3 && (
                  <CheckCircle className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-green-500" />
                )}
                {mode === 'signup' && usernameStatus === 'invalid' && (
                  <AlertCircle className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-destructive" />
                )}
              </div>
              {mode === 'signup' && usernameStatus === 'invalid' && (
                <p className="text-xs text-destructive">Invalid username</p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-primary/60" />
                <Input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 bg-secondary/50 border-border/50 focus-visible:ring-1 focus-visible:ring-primary/50"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-primary/60" />
                <Input
                  type={showPassword ? 'text' : 'password'}
                  placeholder={mode === 'signup' ? 'Create a password' : 'Enter your password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 pr-10 bg-secondary/50 border-border/50 focus-visible:ring-1 focus-visible:ring-primary/50"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/20">
                <AlertCircle className="w-4 h-4 text-destructive flex-shrink-0" />
                <p className="text-sm text-destructive">{error}</p>
              </div>
            )}

            {success && (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-green-500/10 border border-green-500/20">
                <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                <p className="text-sm text-green-500">{success}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-primary to-accent text-primary-foreground font-semibold transition-all duration-300 hover:opacity-90 hover:shadow-lg hover:shadow-primary/30 disabled:opacity-50"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
              ) : (
                <>
                  {mode === 'signup' ? 'Create Account' : 'Sign In'}
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => {
                setMode(mode === 'signup' ? 'signin' : 'signup');
                setError('');
                setSuccess('');
              }}
              className="text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              {mode === 'signup' ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
            </button>
          </div>
        </div>

        {/* Skip for now */}
        <div className="mt-6 text-center">
          <button
            onClick={() => navigate('/')}
            className="text-sm text-muted-foreground hover:text-primary transition-colors"
          >
            Browse as guest →
          </button>
        </div>
      </div>
    </div>
  );
}
