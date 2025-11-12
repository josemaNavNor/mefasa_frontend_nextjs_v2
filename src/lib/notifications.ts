import { toast } from "sonner";

type ToastType = "success" | "error" | "warning" | "info";

interface ToastOptions {
  readonly duration?: number;
  readonly position?: "top-left" | "top-center" | "top-right" | "bottom-left" | "bottom-center" | "bottom-right";
  readonly dismissible?: boolean;
  readonly action?: {
    readonly label: string;
    readonly onClick: () => void;
  };
}

class NotificationService {
  private readonly defaultDuration = 4000;

  success(message: string, options?: ToastOptions): void {
    this.showToast("success", message, options);
  }

  error(message: string, options?: ToastOptions): void {
    this.showToast("error", message, options);
  }

  warning(message: string, options?: ToastOptions): void {
    this.showToast("warning", message, options);
  }

  info(message: string, options?: ToastOptions): void {
    this.showToast("info", message, options);
  }

  promise<T>(
    promise: Promise<T>,
    messages: {
      readonly loading: string;
      readonly success: string | ((data: T) => string);
      readonly error: string | ((error: unknown) => string);
    }
  ): void {
    toast.promise(promise, messages);
  }

  private showToast(type: ToastType, message: string, options?: ToastOptions): void {
    const toastOptions = {
      duration: options?.duration ?? this.defaultDuration,
      position: options?.position ?? "top-right",
      dismissible: options?.dismissible ?? true,
      action: options?.action,
    };

    switch (type) {
      case "success":
        toast.success(message, toastOptions);
        break;
      case "error":
        toast.error(message, toastOptions);
        break;
      case "warning":
        toast.warning(message, toastOptions);
        break;
      case "info":
        toast.info(message, toastOptions);
        break;
    }
  }

  dismiss(toastId?: string | number): void {
    if (toastId) {
      toast.dismiss(toastId);
    } else {
      toast.dismiss();
    }
  }
}

export const notifications = new NotificationService();

// Legacy compatibility with Notiflix for existing code
export const legacyNotifications = {
  success: (message: string) => notifications.success(message),
  failure: (message: string) => notifications.error(message),
  warning: (message: string) => notifications.warning(message),
  info: (message: string) => notifications.info(message),
};