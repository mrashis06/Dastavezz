'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/providers/AuthProvider';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/layout/Navbar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  User as UserIcon,
  Mail,
  Lock,
  Clock,
  ShieldCheck,
  UserCheck,
  Loader2,
  Sparkles,
  Link as LinkIcon,
  CheckCircle,
  AlertCircle,
  Upload,
  ImageIcon,
} from 'lucide-react';
import { toast } from '@/utils/toast';
import { updatePassword, sendEmailVerification } from 'firebase/auth';
import { auth } from '@/services/firebase';

// ─────────────────────────────────────────────────────────────────────────────

import BrandLoader from '@/components/brand/BrandLoader';

export default function SettingsPage() {
  const {
    user,
    profile,
    loading,
    updateProfileFields,
    uploadProfileAvatar,
    linkGoogleAccount,
    linkEmailAccount,
    unlinkProvider,
  } = useAuth();
  const router = useRouter();

  // ── Profile state ─────────────────────────────────────────────────────────
  const [fullName, setFullName] = useState('');
  const [profileLoading, setProfileLoading] = useState(false);

  // ── Avatar upload state ───────────────────────────────────────────────────
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ── Account linking state ─────────────────────────────────────────────────
  const [emailToLink, setEmailToLink] = useState('');
  const [passwordToLink, setPasswordToLink] = useState('');
  const [showEmailLinkForm, setShowEmailLinkForm] = useState(false);
  const [linkingLoading, setLinkingLoading] = useState(false);

  // ── Security state ────────────────────────────────────────────────────────
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);

  const [minLoadingComplete, setMinLoadingComplete] = useState(false);

  // Ensure Dastavezz loading animation displays smoothly for at least 2 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setMinLoadingComplete(true);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  // Redirect if not authenticated
  useEffect(() => {
    if (!loading && !user) router.push('/');
  }, [user, loading, router]);

  // Populate form from profile
  useEffect(() => {
    if (profile) {
      setFullName(profile.fullName || '');
    }
  }, [profile]);

  if (loading || !user || !minLoadingComplete) {
    return <BrandLoader message="Loading settings..." />;
  }

  const providerList = user.providerData.map((p) => p.providerId);
  const hasGoogle = providerList.includes('google.com');
  const hasEmail = providerList.includes('password');

  // Current avatar: show upload preview first, then Firestore value, then Google photo
  const currentAvatar = avatarPreview ?? profile?.avatar ?? user.photoURL ?? null;
  const isImageUrl = currentAvatar && currentAvatar.startsWith('http');

  const getInitials = (name: string) =>
    (name || 'U')
      .split(' ')
      .filter(Boolean)
      .map((n) => n[0])
      .join('')
      .substring(0, 2)
      .toUpperCase();

  // ── Handlers ──────────────────────────────────────────────────────────────

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) {
      toast.error('Full name cannot be empty.');
      return;
    }
    setProfileLoading(true);
    try {
      await updateProfileFields({ fullName });
      toast.success('Profile updated successfully!');
    } catch (err: any) {
      toast.error(err.message || 'Failed to update profile.');
    } finally {
      setProfileLoading(false);
    }
  };

  const handleAvatarFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Show local preview immediately
    const objectUrl = URL.createObjectURL(file);
    setAvatarPreview(objectUrl);
    setUploadProgress(0);

    try {
      await uploadProfileAvatar(file, (pct) => setUploadProgress(pct));
      toast.success('Profile photo updated!');
    } catch (err: any) {
      toast.error(err.message || 'Upload failed. Please try again.');
      setAvatarPreview(null); // revert preview on failure
    } finally {
      setUploadProgress(null);
      // Reset input so same file can be re-selected
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleLinkGoogle = async () => {
    setLinkingLoading(true);
    try {
      await linkGoogleAccount();
      toast.success('Google account linked successfully!');
    } catch (err: any) {
      toast.error(err.message || 'Failed to link Google.');
    } finally {
      setLinkingLoading(false);
    }
  };

  const handleLinkEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailToLink || !passwordToLink) {
      toast.error('Please enter email and password.');
      return;
    }
    setLinkingLoading(true);
    try {
      await linkEmailAccount(emailToLink, passwordToLink);
      setShowEmailLinkForm(false);
      setEmailToLink('');
      setPasswordToLink('');
      toast.success('Email provider linked successfully!');
    } catch (err: any) {
      toast.error(err.message || 'Failed to link email.');
    } finally {
      setLinkingLoading(false);
    }
  };

  const handleUnlink = async (providerId: string) => {
    if (user.providerData.length <= 1) {
      toast.error('Cannot disconnect your only sign-in method.');
      return;
    }
    if (!window.confirm('Disconnect this sign-in method?')) return;
    setLinkingLoading(true);
    try {
      await unlinkProvider(providerId);
      toast.success('Sign-in method disconnected.');
    } catch (err: any) {
      toast.error(err.message || 'Unlink failed.');
    } finally {
      setLinkingLoading(false);
    }
  };

  const handleSendVerificationEmail = async () => {
    try {
      await sendEmailVerification(user);
      toast.success('Verification email sent! Check your inbox.');
    } catch (err: any) {
      toast.error(err.message || 'Failed to send verification email.');
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      toast.error('Password must be at least 6 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match.');
      return;
    }
    setPasswordLoading(true);
    try {
      await updatePassword(user, newPassword);
      setNewPassword('');
      setConfirmPassword('');
      toast.success('Password updated successfully!');
    } catch (err: any) {
      if (err.code === 'auth/requires-recent-login') {
        toast.error('Please sign out and sign back in before changing your password.');
      } else {
        toast.error(err.message || 'Password update failed.');
      }
    } finally {
      setPasswordLoading(false);
    }
  };

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col min-h-screen bg-slate-50 dark:bg-[#0a0a0c] text-slate-900 dark:text-slate-100 font-sans select-none">
      <Navbar
        title="Settings"
        onTitleChange={() => {}}
        onReset={() => {}}
        isSaving={false}
        view="dashboard"
        onBackToDashboard={() => router.push('/dashboard')}
      />

      <main className="flex-1 w-full max-w-[900px] mx-auto px-6 py-10 space-y-8 pb-20">

        {/* ── Profile Summary Header ───────────────────────────────────────── */}
        <div className="flex items-center space-x-5 p-6 rounded-3xl bg-white dark:bg-[#111114] border border-slate-200/80 dark:border-white/[0.07] shadow-sm">
          {/* Avatar display */}
          <div className="relative shrink-0">
            <div
              className="h-16 w-16 rounded-2xl flex items-center justify-center text-white text-lg font-bold shadow-md shadow-violet-500/10 overflow-hidden"
              style={{ background: 'linear-gradient(135deg, #7c3aed 0%, #6366f1 100%)' }}
            >
              {isImageUrl ? (
                <img src={currentAvatar!} alt="Avatar" className="h-full w-full object-cover" />
              ) : (
                <span>{getInitials(fullName || profile?.fullName || '')}</span>
              )}
            </div>
            {/* Upload progress ring overlay */}
            {uploadProgress !== null && (
              <div className="absolute inset-0 rounded-2xl bg-black/50 flex items-center justify-center">
                <span className="text-white text-[10px] font-bold">{uploadProgress}%</span>
              </div>
            )}
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white leading-tight">
              {profile?.fullName || 'No name set'}
            </h2>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 font-medium flex items-center">
              <ShieldCheck className="h-3.5 w-3.5 mr-1 text-violet-500" />
              UID: {user.uid}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

          {/* ── LEFT COLUMN ─────────────────────────────────────────────────── */}
          <div className="md:col-span-2 space-y-8">

            {/* 1. Personal Information */}
            <div className="p-6 rounded-3xl bg-white dark:bg-[#111114] border border-slate-200/85 dark:border-white/[0.07] shadow-sm space-y-5">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center mb-1">
                  <UserIcon className="h-4 w-4 mr-1.5 text-slate-400" />
                  Personal Information
                </h3>
                <p className="text-[11px] text-slate-400 dark:text-slate-500">Update your display name.</p>
              </div>

              <form onSubmit={handleUpdateProfile} className="space-y-4">
                <div className="flex flex-col space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                    Full Name
                  </label>
                  <Input
                    id="settings-fullname"
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    disabled={profileLoading}
                    className="h-10 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl focus-visible:ring-violet-500/20"
                    required
                  />
                </div>

                <div className="pt-2 flex justify-end">
                  <Button
                    type="submit"
                    disabled={profileLoading}
                    className="h-9 px-5 text-xs font-semibold bg-violet-650 hover:bg-violet-600 text-white cursor-pointer rounded-xl transition"
                  >
                    {profileLoading && <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />}
                    Save Changes
                  </Button>
                </div>
              </form>
            </div>

            {/* 2. Profile Photo */}
            <div className="p-6 rounded-3xl bg-white dark:bg-[#111114] border border-slate-200/85 dark:border-white/[0.07] shadow-sm space-y-5">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center mb-1">
                  <ImageIcon className="h-4 w-4 mr-1.5 text-slate-400" />
                  Profile Photo
                </h3>
                <p className="text-[11px] text-slate-400 dark:text-slate-500">
                  Upload a JPEG, PNG, WebP, or GIF. Max 5 MB.
                </p>
              </div>

              <div className="flex items-center space-x-4">
                {/* Preview */}
                <div
                  className="h-14 w-14 rounded-2xl flex items-center justify-center text-white text-base font-bold shrink-0 overflow-hidden shadow-sm"
                  style={{ background: 'linear-gradient(135deg, #7c3aed 0%, #6366f1 100%)' }}
                >
                  {isImageUrl ? (
                    <img src={currentAvatar!} alt="Preview" className="h-full w-full object-cover" />
                  ) : (
                    <span>{getInitials(fullName || profile?.fullName || '')}</span>
                  )}
                </div>

                <div className="flex flex-col space-y-2">
                  {/* Hidden file input */}
                  <input
                    ref={fileInputRef}
                    id="avatar-upload"
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/gif"
                    className="sr-only"
                    onChange={handleAvatarFileChange}
                    disabled={uploadProgress !== null}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    disabled={uploadProgress !== null}
                    onClick={() => fileInputRef.current?.click()}
                    className="h-9 px-4 text-xs font-semibold border-slate-200 dark:border-white/[0.08] rounded-xl cursor-pointer flex items-center space-x-1.5"
                  >
                    {uploadProgress !== null ? (
                      <>
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        <span>Uploading {uploadProgress}%</span>
                      </>
                    ) : (
                      <>
                        <Upload className="h-3.5 w-3.5" />
                        <span>Choose Image</span>
                      </>
                    )}
                  </Button>

                  {/* Progress bar */}
                  {uploadProgress !== null && (
                    <div className="w-48 h-1.5 bg-slate-200 dark:bg-white/[0.08] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-violet-500 transition-all duration-300"
                        style={{ width: `${uploadProgress}%` }}
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* 3. Password Change */}
            <div className="p-6 rounded-3xl bg-white dark:bg-[#111114] border border-slate-200/85 dark:border-white/[0.07] shadow-sm space-y-5">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center mb-1">
                  <Lock className="h-4 w-4 mr-1.5 text-slate-400" />
                  Change Password
                </h3>
                <p className="text-[11px] text-slate-400 dark:text-slate-500">Update your account password.</p>
              </div>

              {hasEmail ? (
                <form onSubmit={handleChangePassword} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col space-y-1.5">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                        New Password
                      </label>
                      <Input
                        id="settings-newpass"
                        type="password"
                        placeholder="••••••••"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        disabled={passwordLoading}
                        className="h-10 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl focus-visible:ring-violet-500/20"
                        required
                      />
                    </div>
                    <div className="flex flex-col space-y-1.5">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                        Confirm
                      </label>
                      <Input
                        id="settings-confirmpass"
                        type="password"
                        placeholder="••••••••"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        disabled={passwordLoading}
                        className="h-10 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl focus-visible:ring-violet-500/20"
                        required
                      />
                    </div>
                  </div>
                  <div className="pt-2 flex justify-end">
                    <Button
                      type="submit"
                      disabled={passwordLoading}
                      className="h-9 px-5 text-xs font-semibold bg-violet-650 hover:bg-violet-600 text-white cursor-pointer rounded-xl transition"
                    >
                      {passwordLoading && <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />}
                      Change Password
                    </Button>
                  </div>
                </form>
              ) : (
                <div className="flex items-center space-x-2 text-xs text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/30 p-3.5 rounded-xl font-medium">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>Link an email provider first to set a password.</span>
                </div>
              )}
            </div>

          </div>

          {/* ── RIGHT COLUMN ────────────────────────────────────────────────── */}
          <div className="space-y-8">

            {/* 4. Login Connections */}
            <div className="p-6 rounded-3xl bg-white dark:bg-[#111114] border border-slate-200/85 dark:border-white/[0.07] shadow-sm space-y-5">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center mb-1">
                  <LinkIcon className="h-4 w-4 mr-1.5 text-slate-400" />
                  Login Connections
                </h3>
                <p className="text-[11px] text-slate-400 dark:text-slate-500">Manage your sign-in methods.</p>
              </div>

              <div className="space-y-4">

                {/* Google */}
                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850">
                  <div className="flex items-center space-x-2.5">
                    <svg className="h-3.5 w-3.5" viewBox="0 0 24 24">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05" />
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335" />
                    </svg>
                    <div>
                      <p className="text-xs font-bold">Google</p>
                      <p className="text-[10px] text-slate-400">{hasGoogle ? 'Connected' : 'Not connected'}</p>
                    </div>
                  </div>
                  {hasGoogle ? (
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => handleUnlink('google.com')}
                      disabled={linkingLoading}
                      className="h-8 px-2 text-[10px] font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-950/25 rounded-lg cursor-pointer"
                    >
                      Disconnect
                    </Button>
                  ) : (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleLinkGoogle}
                      disabled={linkingLoading}
                      className="h-8 px-3 text-[10px] font-bold border-slate-200 dark:border-slate-850 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/[0.03] rounded-lg cursor-pointer"
                    >
                      Connect
                    </Button>
                  )}
                </div>

                {/* Email */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850">
                    <div className="flex items-center space-x-2.5">
                      <Mail className="h-3.5 w-3.5 text-violet-500" />
                      <div>
                        <p className="text-xs font-bold">Email</p>
                        <p className="text-[10px] text-slate-400">
                          {hasEmail ? user.email ?? 'Connected' : 'Not connected'}
                        </p>
                      </div>
                    </div>
                    {hasEmail ? (
                      <Button
                        type="button"
                        variant="ghost"
                        onClick={() => handleUnlink('password')}
                        disabled={linkingLoading}
                        className="h-8 px-2 text-[10px] font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-950/25 rounded-lg cursor-pointer"
                      >
                        Disconnect
                      </Button>
                    ) : (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setShowEmailLinkForm(!showEmailLinkForm)}
                        disabled={linkingLoading}
                        className="h-8 px-3 text-[10px] font-bold border-slate-200 dark:border-slate-850 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/[0.03] rounded-lg cursor-pointer"
                      >
                        {showEmailLinkForm ? 'Cancel' : 'Connect'}
                      </Button>
                    )}
                  </div>

                  {!hasEmail && showEmailLinkForm && (
                    <form
                      onSubmit={handleLinkEmail}
                      className="p-3 border border-dashed border-slate-200 dark:border-white/[0.08] rounded-xl space-y-2"
                    >
                      <Input
                        type="email"
                        placeholder="email@example.com"
                        value={emailToLink}
                        onChange={(e) => setEmailToLink(e.target.value)}
                        disabled={linkingLoading}
                        className="h-9 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-lg text-slate-900 dark:text-white"
                        required
                      />
                      <Input
                        type="password"
                        placeholder="Create password"
                        value={passwordToLink}
                        onChange={(e) => setPasswordToLink(e.target.value)}
                        disabled={linkingLoading}
                        className="h-9 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-lg text-slate-900 dark:text-white"
                        required
                      />
                      <Button
                        type="submit"
                        disabled={linkingLoading}
                        className="w-full h-8 text-[10px] font-bold bg-violet-650 hover:bg-violet-600 text-white rounded-lg"
                      >
                        {linkingLoading ? 'Linking...' : 'Link Credentials'}
                      </Button>
                    </form>
                  )}
                </div>

              </div>
            </div>

            {/* 5. Verification Details */}
            <div className="p-6 rounded-3xl bg-white dark:bg-[#111114] border border-slate-200/85 dark:border-white/[0.07] shadow-sm space-y-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center mb-1">
                  <UserCheck className="h-4 w-4 mr-1.5 text-slate-400" />
                  Verification Details
                </h3>
                <p className="text-[11px] text-slate-400 dark:text-slate-500">Security status of your account.</p>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between py-1.5">
                  <span className="text-slate-500">Email Verified:</span>
                  {user.emailVerified ? (
                    <span className="text-emerald-500 font-semibold flex items-center">
                      <CheckCircle className="h-3.5 w-3.5 mr-1" />Yes
                    </span>
                  ) : (
                    <div className="flex items-center space-x-1.5">
                      <span className="text-amber-500 font-semibold flex items-center">
                        <AlertCircle className="h-3.5 w-3.5 mr-1" />No
                      </span>
                      {hasEmail && (
                        <button
                          onClick={handleSendVerificationEmail}
                          className="text-[10px] font-bold text-violet-500 hover:underline cursor-pointer"
                        >
                          Verify now
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* 6. Metadata */}
            <div className="p-6 rounded-3xl bg-white dark:bg-[#111114] border border-slate-200/85 dark:border-white/[0.07] shadow-sm space-y-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center mb-1">
                  <Clock className="h-4 w-4 mr-1.5 text-slate-400" />
                  Account Metadata
                </h3>
                <p className="text-[11px] text-slate-400 dark:text-slate-500">Account timeline information.</p>
              </div>

              <div className="space-y-2.5 text-xs text-slate-500">
                <div className="flex justify-between">
                  <span>Created:</span>
                  <span className="font-semibold text-slate-700 dark:text-slate-300">
                    {user.metadata.creationTime
                      ? new Date(user.metadata.creationTime).toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })
                      : 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Last Login:</span>
                  <span className="font-semibold text-slate-700 dark:text-slate-300">
                    {user.metadata.lastSignInTime
                      ? new Date(user.metadata.lastSignInTime).toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })
                      : 'N/A'}
                  </span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}
