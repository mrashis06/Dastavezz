import { toast } from '@/utils/toast';

/**
 * Centralized authentication notification helper for Dastavezz.
 * Displays polished, SaaS-grade toast notifications for authentication events.
 * Strictly NO emojis allowed — uses professional Lucide React icons.
 */

export function showGoogleAuthToast(isNewUser: boolean) {
  if (isNewUser) {
    toast.success('Welcome to Dastavezz', {
      description: 'Your account has been created successfully.',
    });
  } else {
    toast.success('Welcome Back', {
      description: 'Signed in successfully.',
    });
  }
}

export function showEmailSignUpToast() {
  toast.success('Account Created', {
    description: 'Your account has been created successfully.',
  });
}

export function showEmailLoginToast() {
  toast.success('Welcome Back', {
    description: 'Signed in successfully.',
  });
}

export function showSignOutToast() {
  toast.info('Signed Out', {
    description: 'See you again soon.',
  });
}
