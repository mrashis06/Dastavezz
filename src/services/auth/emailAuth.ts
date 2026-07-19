import { signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile, UserCredential } from 'firebase/auth';
import { auth } from '@/services/firebase';
import { createUserProfile } from '@/services/auth/profileService';

/**
 * Signs in an existing user with email and password.
 */
export async function signInWithEmail(email: string, password: string): Promise<UserCredential> {
  return signInWithEmailAndPassword(auth, email, password);
}

/**
 * Creates a new Firebase Auth user and writes their Firestore profile document.
 */
export async function signUpWithEmail(
  email: string,
  password: string,
  profileData: { fullName: string }
): Promise<UserCredential> {
  const result = await createUserWithEmailAndPassword(auth, email, password);
  
  if (result.user) {
    await updateProfile(result.user, { displayName: profileData.fullName });
    await createUserProfile(result.user.uid, {
      fullName: profileData.fullName,
      email,
      provider: 'email',
      emailVerified: false,
      avatar: null,
    });
  }
  
  return result;
}
