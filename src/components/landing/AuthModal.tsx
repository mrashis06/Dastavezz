'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/providers/AuthProvider';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Sparkles, Mail, Lock, Loader2, ArrowRight, Eye, EyeOff } from 'lucide-react';
import { toast } from '@/utils/toast';
import { showEmailLoginToast, showGoogleAuthToast } from '@/utils/authToasts';
import { useRouter } from 'next/navigation';

import DastavezzIcon from '@/components/brand/DastavezzIcon';

interface AuthModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export default function AuthModal({ isOpen, onOpenChange, onSuccess }: AuthModalProps) {
  const { signInWithGoogle, signInWithEmail } = useAuth();
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // Reset form on close
  useEffect(() => {
    if (!isOpen) {
      setEmail('');
      setPassword('');
      setShowPassword(false);
      setLoading(false);
    }
  }, [isOpen]);

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Please enter your email and password.');
      return;
    }
    setLoading(true);
    try {
      await signInWithEmail(email, password);
      showEmailLoginToast();
      onOpenChange(false);
      onSuccess?.();
    } catch (err: any) {
      console.error(err);
      const code = err?.code ?? '';
      if (code === 'auth/user-not-found' || code === 'auth/wrong-password' || code === 'auth/invalid-credential') {
        toast.error('Invalid email or password.');
      } else {
        toast.error(err.message || 'Sign-in failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      const { isNewUser } = await signInWithGoogle();
      showGoogleAuthToast(isNewUser);
      onOpenChange(false);
      onSuccess?.();
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || 'Google sign-in failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px] p-6 rounded-3xl bg-white dark:bg-[#111114] border border-slate-200 dark:border-white/[0.08] shadow-2xl transition-all select-none">
        <DialogHeader className="flex flex-col items-center text-center space-y-3 pb-2">
          <DastavezzIcon size={44} />
          <DialogTitle className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
            Welcome to Dastavezz
          </DialogTitle>
          <DialogDescription className="text-xs text-slate-500 dark:text-slate-400">
            Sign in to access your secure document workspace.
          </DialogDescription>
        </DialogHeader>

        {/* Email + Password */}
        <form onSubmit={handleEmailLogin} className="space-y-4 pt-1">
          <div className="flex flex-col space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center">
              <Mail className="h-3 w-3 mr-1" />
              Email Address
            </label>
            <Input
              id="login-email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              className="h-10 px-3 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl focus-visible:ring-violet-500/20 text-slate-900 dark:text-white"
              required
            />
          </div>

          <div className="flex flex-col space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center">
              <Lock className="h-3 w-3 mr-1" />
              Password
            </label>
            <div className="relative">
              <Input
                id="login-password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                className="h-10 pl-3 pr-10 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl focus-visible:ring-violet-500/20 text-slate-900 dark:text-white w-full"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                disabled={loading}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300 cursor-pointer p-0.5 rounded focus:outline-none"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <Button
            id="login-submit"
            type="submit"
            disabled={loading}
            className="w-full h-10 mt-2 text-xs font-semibold bg-violet-650 hover:bg-violet-600 text-white cursor-pointer transition rounded-xl"
          >
            {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" /> : 'Sign In'}
          </Button>
        </form>

        {/* Divider */}
        <div className="relative flex py-3 items-center">
          <div className="flex-grow border-t border-slate-200 dark:border-white/[0.06]" />
          <span className="flex-shrink mx-3 text-[10px] text-slate-400 font-bold uppercase tracking-widest">
            Or continue with
          </span>
          <div className="flex-grow border-t border-slate-200 dark:border-white/[0.06]" />
        </div>

        {/* Google */}
        <Button
          id="login-google"
          type="button"
          onClick={handleGoogleLogin}
          disabled={loading}
          variant="outline"
          className="w-full h-10 text-xs font-semibold border-slate-200 dark:border-white/[0.08] bg-slate-50 dark:bg-white/[0.02] hover:bg-slate-100 dark:hover:bg-white/[0.05] text-slate-700 dark:text-slate-300 cursor-pointer flex items-center justify-center space-x-2 rounded-xl"
        >
          <svg className="h-3.5 w-3.5" viewBox="0 0 24 24">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05" />
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335" />
          </svg>
          <span>Sign in with Google</span>
        </Button>

        {/* Create account link */}
        <div className="text-center pt-4 border-t border-slate-200/50 dark:border-white/[0.06] mt-2 flex items-center justify-center space-x-1">
          <span className="text-[11px] text-slate-400">Need a new account?</span>
          <button
            type="button"
            onClick={() => { onOpenChange(false); router.push('/signup'); }}
            className="text-[11px] text-violet-500 font-semibold hover:underline cursor-pointer flex items-center"
          >
            <span>Create Account</span>
            <ArrowRight className="h-3 w-3 ml-0.5" />
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
