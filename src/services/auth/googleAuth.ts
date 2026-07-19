import { GoogleAuthProvider, signInWithPopup, linkWithPopup, getAdditionalUserInfo } from 'firebase/auth';
import { auth } from '@/services/firebase';

/**
 * Opens a Google Sign-In popup and determines if the user is a new or returning user.
 */
export async function signInWithGoogle(): Promise<{ isNewUser: boolean }> {
  const provider = new GoogleAuthProvider();
  const result = await signInWithPopup(auth, provider);
  
  const additionalInfo = getAdditionalUserInfo(result);
  let isNewUser = additionalInfo?.isNewUser ?? false;

  // Fallback metadata check if isNewUser is undefined
  if (additionalInfo?.isNewUser === undefined && result.user.metadata) {
    const { creationTime, lastSignInTime } = result.user.metadata;
    if (creationTime && lastSignInTime) {
      isNewUser = Math.abs(new Date(creationTime).getTime() - new Date(lastSignInTime).getTime()) < 5000;
    }
  }

  return { isNewUser };
}

/**
 * Links Google as an additional sign-in provider to the currently signed-in user.
 */
export async function linkGoogleToCurrentUser() {
  if (!auth.currentUser) throw new Error('No user currently signed in');
  const provider = new GoogleAuthProvider();
  return linkWithPopup(auth.currentUser, provider);
}
