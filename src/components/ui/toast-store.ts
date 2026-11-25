import { create } from 'zustand';

import { createId } from '@/lib/utils/id';

export type ToastVariant = 'info' | 'success' | 'error';

interface ToastItem {
  id: string;
  message: string;
  variant: ToastVariant;
}

interface ToastState {
  items: ToastItem[];
  push: (message: string, variant: ToastVariant) => void;
  dismiss: (id: string) => void;
}

const AUTO_DISMISS_MS = 5000;

export const useToastStore = create<ToastState>((set) => ({
  items: [],
  push: (message, variant) => {
    const id = createId();
    set((state) => ({ items: [...state.items, { id, message, variant }] }));
    window.setTimeout(() => {
      set((state) => ({ items: state.items.filter((item) => item.id !== id) }));
    }, AUTO_DISMISS_MS);
  },
  dismiss: (id) => {
    set((state) => ({ items: state.items.filter((item) => item.id !== id) }));
  },
}));

export function toast(message: string, variant: ToastVariant = 'info'): void {
  useToastStore.getState().push(message, variant);
}
