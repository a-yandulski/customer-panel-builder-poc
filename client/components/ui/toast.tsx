import {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
} from "react";
import { X, CheckCircle, AlertTriangle, AlertCircle, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "./button";

type ToastType = "success" | "error" | "warning" | "info";

interface Toast {
  id: string;
  type: ToastType;
  title?: string;
  message: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface ToastContextType {
  toasts: Toast[];
  addToast: (toast: Omit<Toast, "id">) => void;
  removeToast: (id: string) => void;
  success: (
    message: string,
    options?: Partial<Omit<Toast, "id" | "type" | "message">>,
  ) => void;
  error: (
    message: string,
    options?: Partial<Omit<Toast, "id" | "type" | "message">>,
  ) => void;
  warning: (
    message: string,
    options?: Partial<Omit<Toast, "id" | "type" | "message">>,
  ) => void;
  info: (
    message: string,
    options?: Partial<Omit<Toast, "id" | "type" | "message">>,
  ) => void;
}

const ToastContext = createContext<ToastContextType | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((toast: Omit<Toast, "id">) => {
    const id = Math.random().toString(36).substr(2, 9);
    const newToast = { ...toast, id };

    setToasts((prev) => [...prev, newToast]);

    // Auto remove after duration
    if (toast.duration !== 0) {
      setTimeout(() => {
        removeToast(id);
      }, toast.duration || 5000);
    }
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const success = useCallback(
    (
      message: string,
      options?: Partial<Omit<Toast, "id" | "type" | "message">>,
    ) => {
      addToast({ type: "success", message, ...options });
    },
    [addToast],
  );

  const error = useCallback(
    (
      message: string,
      options?: Partial<Omit<Toast, "id" | "type" | "message">>,
    ) => {
      addToast({ type: "error", message, duration: 0, ...options });
    },
    [addToast],
  );

  const warning = useCallback(
    (
      message: string,
      options?: Partial<Omit<Toast, "id" | "type" | "message">>,
    ) => {
      addToast({ type: "warning", message, ...options });
    },
    [addToast],
  );

  const info = useCallback(
    (
      message: string,
      options?: Partial<Omit<Toast, "id" | "type" | "message">>,
    ) => {
      addToast({ type: "info", message, ...options });
    },
    [addToast],
  );

  return (
    <ToastContext.Provider
      value={{ toasts, addToast, removeToast, success, error, warning, info }}
    >
      {children}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}

function ToastContainer({
  toasts,
  onRemove,
}: {
  toasts: Toast[];
  onRemove: (id: string) => void;
}) {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm w-full">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onRemove={onRemove} />
      ))}
    </div>
  );
}

function ToastItem({
  toast,
  onRemove,
}: {
  toast: Toast;
  onRemove: (id: string) => void;
}) {
  const getIcon = () => {
    switch (toast.type) {
      case "success":
        return <CheckCircle className="h-5 w-5 text-success" />;
      case "error":
        return <AlertCircle className="h-5 w-5 text-error" />;
      case "warning":
        return <AlertTriangle className="h-5 w-5 text-warning" />;
      case "info":
        return <Info className="h-5 w-5 text-info" />;
    }
  };

  const getStyles = () => {
    switch (toast.type) {
      case "success":
        return "bg-success/10 border-success/20 text-success-foreground";
      case "error":
        return "bg-error/10 border-error/20 text-error-foreground";
      case "warning":
        return "bg-warning/10 border-warning/20 text-warning-foreground";
      case "info":
        return "bg-info/10 border-info/20 text-info-foreground";
    }
  };

  return (
    <div
      className={cn(
        "rounded-lg border p-4 shadow-lg toast-slide-in",
        "bg-white border-gray-200",
        getStyles(),
      )}
    >
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0">{getIcon()}</div>
        <div className="flex-1 min-w-0">
          {toast.title && (
            <h4 className="text-sm font-semibold text-gray-900 mb-1">
              {toast.title}
            </h4>
          )}
          <p className="text-sm text-gray-700">{toast.message}</p>
          {toast.action && (
            <div className="mt-3">
              <Button
                variant="outline"
                size="sm"
                onClick={toast.action.onClick}
                className="text-xs"
              >
                {toast.action.label}
              </Button>
            </div>
          )}
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onRemove(toast.id)}
          className="h-6 w-6 p-0 hover:bg-gray-100"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

// Pre-built toast helpers
export const toast = {
  success: (
    message: string,
    options?: {
      title?: string;
      action?: { label: string; onClick: () => void };
    },
  ) => {
    // This will be replaced by the actual toast context when used
    console.log("Success:", message, options);
  },
  error: (
    message: string,
    options?: {
      title?: string;
      action?: { label: string; onClick: () => void };
    },
  ) => {
    console.log("Error:", message, options);
  },
  warning: (
    message: string,
    options?: {
      title?: string;
      action?: { label: string; onClick: () => void };
    },
  ) => {
    console.log("Warning:", message, options);
  },
  info: (
    message: string,
    options?: {
      title?: string;
      action?: { label: string; onClick: () => void };
    },
  ) => {
    console.log("Info:", message, options);
  },
};
