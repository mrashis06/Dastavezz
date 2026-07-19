import { doc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { db, storage } from '@/services/firebase';
import { UserProfile } from '@/types';

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

/**
 * Creates a new user profile document in Firestore.
 * Called once on first sign-up. Does NOT overwrite an existing document.
 */
export async function createUserProfile(
  uid: string,
  data: Partial<Omit<UserProfile, 'createdAt' | 'updatedAt'>>
) {
  const profileRef = doc(db, 'users', uid);
  await setDoc(profileRef, {
    fullName: data.fullName ?? 'User',
    email: data.email ?? null,
    provider: data.provider ?? 'email',
    emailVerified: data.emailVerified ?? false,
    avatar: data.avatar ?? null,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}

/**
 * Updates selected fields on an existing user profile document.
 */
export async function updateUserProfile(uid: string, data: Partial<UserProfile>) {
  const profileRef = doc(db, 'users', uid);
  await updateDoc(profileRef, {
    ...data,
    updatedAt: serverTimestamp(),
  });
}

/**
 * Uploads an avatar image file to Firebase Storage and saves the download URL to Firestore.
 * Returns the public download URL.
 *
 * @param uid         Firebase Auth UID — used as the storage path key
 * @param file        File object from an <input type="file"> element
 * @param onProgress  Optional callback receiving upload progress (0–100)
 */
export async function uploadAvatar(
  uid: string,
  file: File,
  onProgress?: (percent: number) => void
): Promise<string> {
  if (!ALLOWED_TYPES.includes(file.type)) {
    throw new Error('Invalid file type. Please upload a JPEG, PNG, WebP, or GIF image.');
  }
  if (file.size > MAX_FILE_SIZE_BYTES) {
    throw new Error('File is too large. Maximum allowed size is 5 MB.');
  }

  const storageRef = ref(storage, `avatars/${uid}`);
  const uploadTask = uploadBytesResumable(storageRef, file);

  return new Promise((resolve, reject) => {
    uploadTask.on(
      'state_changed',
      (snapshot) => {
        const percent = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
        onProgress?.(percent);
      },
      (error) => reject(error),
      async () => {
        const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
        // Persist the download URL to the user's Firestore profile
        await updateUserProfile(uid, { avatar: downloadURL });
        resolve(downloadURL);
      }
    );
  });
}
