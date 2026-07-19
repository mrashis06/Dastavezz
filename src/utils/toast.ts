import { ToastData, ToastType } from '@/components/ui/Toast';

type ToastListener = (toast: ToastData) => void;
type DismissListener = (id: string) => void;

const listeners: Set<ToastListener> = new Set();
const dismissListeners: Set<DismissListener> = new Set();

let toastCounter = 0;

export function subscribeToast(listener: ToastListener) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function subscribeDismiss(listener: DismissListener) {
  dismissListeners.add(listener);
  return () => {
    dismissListeners.delete(listener);
  };
}

export interface ToastOptions {
  description?: string;
  duration?: number;
}

function createToast(type: ToastType, title: string, options?: ToastOptions | string): string {
  const id = `toast-${Date.now()}-${++toastCounter}`;
  const description = typeof options === 'string' ? options : options?.description;
  const duration = typeof options === 'object' ? options?.duration : undefined;

  const data: ToastData = {
    id,
    type,
    title,
    description,
    duration,
  };

  listeners.forEach((fn) => fn(data));
  return id;
}

export const toast = (title: string, options?: ToastOptions | string) =>
  createToast('info', title, options);

toast.success = (title: string, options?: ToastOptions | string) =>
  createToast('success', title, options);

toast.error = (title: string, options?: ToastOptions | string) =>
  createToast('error', title, options);

toast.warning = (title: string, options?: ToastOptions | string) =>
  createToast('warning', title, options);

toast.info = (title: string, options?: ToastOptions | string) =>
  createToast('info', title, options);

toast.loading = (title: string, options?: ToastOptions | string) =>
  createToast('loading', title, options);

toast.dismiss = (id: string) => {
  dismissListeners.forEach((fn) => fn(id));
};
