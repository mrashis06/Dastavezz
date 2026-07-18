'use client';

import React, { useState } from 'react';
import { useAuth } from '@/providers/AuthProvider';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Sparkles, Mail, Lock, Loader2 } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

interface AuthError {
  code?: string;
  message?: string;
}

export default function AuthModal({ isOpen, onOpenChange, onSuccess }: AuthModalProps) {
  const { signInWithGoogle, signInWithEmail, signUpWithEmail } = useAuth();
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please fill in all fields.');
      return;
    }
    setError(null);
    setLoading(true);
    try {
      if (mode === 'login') {
        await signInWithEmail(email, password);
      } else {
        await signUpWithEmail(email, password);
      }
      onOpenChange(false);
      if (onSuccess) onSuccess();
    } catch (err) {
      const authErr = err as AuthError;
      console.error(authErr);
      if (authErr.code === 'auth/user-not-found' || authErr.code === 'auth/wrong-password') {
        setError('Invalid email or password.');
      } else if (authErr.code === 'auth/email-already-in-use') {
        setError('This email is already in use.');
      } else if (authErr.code === 'auth/weak-password') {
        setError('Password should be at least 6 characters.');
      } else {
        setError(authErr.message || 'Authentication failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    setError(null);
    setLoading(true);
    try {
      await signInWithGoogle();
      onOpenChange(false);
      if (onSuccess) onSuccess();
    } catch (err) {
      const authErr = err as AuthError;
      console.error(authErr);
      setError(authErr.message || 'Google Sign-in failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[380px] p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl select-none">
        <DialogHeader className="flex flex-col items-center text-center space-y-2 pb-4">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-violet-600 to-indigo-600 text-white shadow-md">
            <Sparkles className="h-4.5 w-4.5" />
          </div>
          <DialogTitle className="text-lg font-bold tracking-tight text-slate-900 dark:text-white">
            {mode === 'login' ? 'Welcome back to Dastavezz' : 'Create your Dastavezz account'}
          </DialogTitle>
          <DialogDescription className="text-xs text-slate-500 dark:text-slate-400">
            {mode === 'login' ? 'Sign in to access your saved document workspace.' : 'Get started to create smart formatted documents.'}
          </DialogDescription>
        </DialogHeader>

        {error && (
          <div className="p-3 mb-2 rounded-lg bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800/30 text-xs text-red-600 dark:text-red-400">
            {error}
          </div>
        )}

        <form onSubmit={handleEmailAuth} className="space-y-4 pt-1">
          {/* Email field */}
          <div className="flex flex-col space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center">
              <Mail className="h-3 w-3 mr-1" />
              Email Address
            </label>
            <Input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              className="h-9 px-3 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-lg focus-visible:ring-violet-500/20"
              required
            />
          </div>

          {/* Password field */}
          <div className="flex flex-col space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center">
              <Lock className="h-3 w-3 mr-1" />
              Password
            </label>
            <Input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              className="h-9 px-3 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-lg focus-visible:ring-violet-500/20"
              required
            />
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full h-9 mt-2 text-xs font-semibold bg-violet-600 hover:bg-violet-500 text-white cursor-pointer transition"
          >
            {loading ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />
            ) : mode === 'login' ? (
              'Sign In'
            ) : (
              'Sign Up'
            )}
          </Button>
        </form>

        <div className="relative flex py-3 items-center">
          <div className="flex-grow border-t border-slate-200 dark:border-slate-800"></div>
          <span className="flex-shrink mx-3 text-[10px] text-slate-400 font-medium uppercase tracking-wider">Or continue with</span>
          <div className="flex-grow border-t border-slate-200 dark:border-slate-800"></div>
        </div>

        <Button
          type="button"
          onClick={handleGoogleAuth}
          disabled={loading}
          variant="outline"
          className="w-full h-9 text-xs font-semibold border-slate-200 dark:border-slate-850 bg-slate-50 dark:bg-slate-950 hover:bg-slate-100 dark:hover:bg-slate-900 text-slate-700 dark:text-slate-300 cursor-pointer flex items-center justify-center space-x-2"
        >
          {/* Google Icon */}
          <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="currentColor">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
          </svg>
          <span>Sign in with Google</span>
        </Button>

        <div className="text-center pt-4 border-t border-slate-200 dark:border-slate-800 mt-4">
          <button
            onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
            className="text-xs text-violet-500 hover:underline cursor-pointer"
            type="button"
          >
            {mode === 'login' ? "Don't have an account? Sign Up" : 'Already have an account? Sign In'}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
