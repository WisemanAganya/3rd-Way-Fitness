/**
 * Toast notification system
 */

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface Toast {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
}

class NotificationManager {
  private listeners: Set<(toasts: Toast[]) => void> = new Set();
  private toasts: Toast[] = [];
  private timeouts: Map<string, NodeJS.Timeout> = new Map();

  subscribe(listener: (toasts: Toast[]) => void) {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify() {
    this.listeners.forEach(listener => listener([...this.toasts]));
  }

  show(message: string, type: ToastType = 'info', duration: number = 3000) {
    const id = Math.random().toString(36).substr(2, 9);
    const toast: Toast = { id, message, type, duration };
    
    this.toasts.push(toast);
    this.notify();

    if (duration > 0) {
      const timeout = setTimeout(() => {
        this.dismiss(id);
      }, duration);
      this.timeouts.set(id, timeout);
    }

    return id;
  }

  success(message: string, duration?: number) {
    return this.show(message, 'success', duration);
  }

  error(message: string, duration?: number) {
    return this.show(message, 'error', duration ?? 5000);
  }

  info(message: string, duration?: number) {
    return this.show(message, 'info', duration);
  }

  warning(message: string, duration?: number) {
    return this.show(message, 'warning', duration ?? 4000);
  }

  dismiss(id: string) {
    this.toasts = this.toasts.filter(t => t.id !== id);
    
    const timeout = this.timeouts.get(id);
    if (timeout) {
      clearTimeout(timeout);
      this.timeouts.delete(id);
    }
    
    this.notify();
  }

  clear() {
    this.toasts = [];
    this.timeouts.forEach(timeout => clearTimeout(timeout));
    this.timeouts.clear();
    this.notify();
  }

  getToasts() {
    return [...this.toasts];
  }
}

export const notificationManager = new NotificationManager();
