import { create } from 'zustand';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

interface ToastState {
  message: string;
  type: ToastType;
  isVisible: boolean;
  showToast: (message: string, type?: ToastType, duration?: number) => void;
  hideToast: () => void;
}

const useToastStore = create<ToastState>((set) => ({
  message: '',
  type: 'info',
  isVisible: false,
  showToast: (message, type = 'info', duration = 3000) => {
    set({ message, type, isVisible: true });
    
    // Auto-hide after duration
    setTimeout(() => {
      set({ isVisible: false });
    }, duration);
  },
  hideToast: () => set({ isVisible: false }),
}));

export default useToastStore;
