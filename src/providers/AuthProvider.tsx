'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  onAuthStateChanged,
  signOut,
  User,
  EmailAuthProvider,
  linkWithCredential,
  unlink,
} from 'firebase/auth';
import { doc, setDoc, updateDoc, serverTimestamp, onSnapshot } from 'firebase/firestore';
import { auth, db } from '@/services/firebase';
import { signInWithGoogle, linkGoogleToCurrentUser } from '@/services/auth/googleAuth';
import { signInWithEmail, signUpWithEmail } from '@/services/auth/emailAuth';
import { updateUserProfile, uploadAvatar } from '@/services/auth/profileService';
import { showSignOutToast } from '@/utils/authToasts';
import { UserProfile } from '@/types';

// ─── Context Shape ────────────────────────────────────────────────────────────

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;

  // Sign-in / Sign-up
  signInWithGoogle: () => Promise<{ isNewUser: boolean }>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signUpWithEmailAndProfile: (
    email: string,
    password: string,
    profileData: { fullName: string }
  ) => Promise<void>;
  signOutUser: () => Promise<void>;

  // Account linking
  linkGoogleAccount: () => Promise<void>;
  linkEmailAccount: (email: string, password: string) => Promise<void>;
  unlinkProvider: (providerId: string) => Promise<void>;

  // Profile management
  updateProfileFields: (data: Partial<UserProfile>) => Promise<void>;
  uploadProfileAvatar: (file: File, onProgress?: (pct: number) => void) => Promise<string>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ─── Provider ────────────────────────────────────────────────────────────────

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Real-time auth state + Firestore profile listener
  useEffect(() => {
    let unsubscribeProfile: (() => void) | null = null;

    const unsubscribeAuth = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);

      if (unsubscribeProfile) {
        unsubscribeProfile();
        unsubscribeProfile = null;
      }

      if (currentUser) {
        const profileRef = doc(db, 'users', currentUser.uid);

        unsubscribeProfile = onSnapshot(profileRef, async (snap) => {
          if (snap.exists()) {
            const data = snap.data() as UserProfile;
            setProfile(data);

            // Auto-sync avatar with Gmail/Google provider photoURL if it changes
            const providerPhoto = currentUser.providerData?.find((p) => p.photoURL && p.photoURL.startsWith('http'))?.photoURL || currentUser.photoURL || null;
            if (providerPhoto && data.avatar !== providerPhoto) {
              try {
                await updateDoc(profileRef, {
                  avatar: providerPhoto,
                  updatedAt: serverTimestamp()
                });
              } catch (err) {
                console.error('Error syncing provider photo to profile:', err);
              }
            }
          } else {
            // First-time Google sign-in — create default profile
            const defaultProfile: UserProfile = {
              fullName: currentUser.displayName || 'User',
              email: currentUser.email || null,
              provider: 'google',
              emailVerified: currentUser.emailVerified,
              avatar: currentUser.photoURL || null,
              createdAt: serverTimestamp(),
              updatedAt: serverTimestamp(),
            };
            try {
              await setDoc(profileRef, defaultProfile);
              setProfile(defaultProfile);
            } catch (err) {
              console.error('Error creating default profile:', err);
            }
          }
        });
      } else {
        setProfile(null);
      }

      setLoading(false);
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeProfile) unsubscribeProfile();
    };
  }, []);

  // ─── Auth Actions ───────────────────────────────────────────────────────────

  const handleSignInWithGoogle = async (): Promise<{ isNewUser: boolean }> => {
    return await signInWithGoogle();
  };

  const handleSignInWithEmail = async (email: string, password: string) => {
    await signInWithEmail(email, password);
  };

  const handleSignUpWithEmailAndProfile = async (
    email: string,
    password: string,
    profileData: { fullName: string }
  ) => {
    await signUpWithEmail(email, password, profileData);
  };

  const handleSignOut = async () => {
    await signOut(auth);
    showSignOutToast();
  };

  // ─── Account Linking ────────────────────────────────────────────────────────

  const handleLinkGoogle = async () => {
    const result = await linkGoogleToCurrentUser();
    if (!auth.currentUser) return;
    await updateUserProfile(auth.currentUser.uid, {
      email: profile?.email || result.user.email || null,
      emailVerified: result.user.emailVerified,
      avatar: profile?.avatar || result.user.photoURL || null,
    });
  };

  const handleLinkEmail = async (email: string, password: string) => {
    if (!auth.currentUser) throw new Error('No user currently signed in');
    const credential = EmailAuthProvider.credential(email, password);
    const result = await linkWithCredential(auth.currentUser, credential);
    await updateUserProfile(auth.currentUser.uid, {
      email: result.user.email || null,
      emailVerified: result.user.emailVerified,
    });
  };

  const handleUnlinkProvider = async (providerId: string) => {
    if (!auth.currentUser) throw new Error('No user currently signed in');
    await unlink(auth.currentUser, providerId);
  };

  // ─── Profile Management ─────────────────────────────────────────────────────

  const handleUpdateProfileFields = async (data: Partial<UserProfile>) => {
    if (!auth.currentUser) throw new Error('No user currently signed in');
    await updateUserProfile(auth.currentUser.uid, data);
  };

  const handleUploadProfileAvatar = async (
    file: File,
    onProgress?: (pct: number) => void
  ): Promise<string> => {
    if (!auth.currentUser) throw new Error('No user currently signed in');
    return uploadAvatar(auth.currentUser.uid, file, onProgress);
  };

  // ─── Context Value ──────────────────────────────────────────────────────────

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        loading,
        signInWithGoogle: handleSignInWithGoogle,
        signInWithEmail: handleSignInWithEmail,
        signUpWithEmailAndProfile: handleSignUpWithEmailAndProfile,
        signOutUser: handleSignOut,
        linkGoogleAccount: handleLinkGoogle,
        linkEmailAccount: handleLinkEmail,
        unlinkProvider: handleUnlinkProvider,
        updateProfileFields: handleUpdateProfileFields,
        uploadProfileAvatar: handleUploadProfileAvatar,
      }}
    >
      {!loading && children}
    </AuthContext.Provider>
  );
}

// ─── Hook (also exported from src/hooks/useAuth.ts) ─────────────────────────

export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}
