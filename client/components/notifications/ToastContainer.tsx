import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useToast, type Toast } from "@/contexts/NotificationContext";
import { Button } from "@/components/ui/button";
import {
  CheckCircle,
  AlertCircle,
  AlertTriangle,
  Info,
  X,
  ExternalLink,
} from "lucide-react";

interface ToastProps {
  toast: Toast;
  onDismiss: (id: string) => void;
}

function ToastComponent({ toast, onDismiss }: ToastProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  // Animation entrance
  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 10);
    return () => clearTimeout(timer);
  }, []);

  const handleDismiss = () => {
    setIsExiting(true);
    setTimeout(() => onDismiss(toast.id), 300);
  };

  const getIcon = () => {
    switch (toast.type) {
      case "success":
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case "error":
        return <AlertCircle className="h-5 w-5 text-red-600" />;
      case "warning":
        return <AlertTriangle className="h-5 w-5 text-yellow-600" />;
      case "info":
      default:
        return <Info className="h-5 w-5 text-blue-600" />;
    }
  };

  const getColorClasses = () => {
    switch (toast.type) {
      case "success":
        return "bg-green-50 border-green-200 text-green-900";
      case "error":
        return "bg-red-50 border-red-200 text-red-900";
      case "warning":
        return "bg-yellow-50 border-yellow-200 text-yellow-900";
      case "info":
      default:
        return "bg-blue-50 border-blue-200 text-blue-900";
    }
  };

  return (
    <div
      className={`
        max-w-sm w-full bg-white border rounded-lg shadow-lg p-4 transition-all duration-300 ease-in-out
        ${getColorClasses()}
        ${isVisible && !isExiting ? "translate-x-0 opacity-100" : "translate-x-full opacity-0"}
        ${isExiting ? "scale-95" : "scale-100"}
      `}
      role="alert"
      aria-live="assertive"
      aria-atomic="true"
    >
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0 mt-0.5">{getIcon()}</div>
        <div className="flex-1 min-w-0">
          {toast.title && (
            <h4 className="text-sm font-semibold mb-1">{toast.title}</h4>
          )}
          <p className="text-sm text-gray-700">{toast.message}</p>
          {toast.action && (
            <div className="mt-3">
              <Button
                size="sm"
                variant="outline"
                onClick={toast.action.onClick}
                className="h-8 px-3 text-xs border-current hover:bg-current hover:bg-opacity-10"
              >
                {toast.action.label}
                <ExternalLink className="ml-1 h-3 w-3" />
              </Button>
            </div>
          )}
        </div>
        <div className="flex-shrink-0">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDismiss}
            className="h-6 w-6 p-0 hover:bg-current hover:bg-opacity-10"
            aria-label="Dismiss notification"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function ToastContainer() {
  const { toasts, dismissToast } = useToast();
  const [container, setContainer] = useState<HTMLElement | null>(null);

  useEffect(() => {
    // Create or get the toast container
    let toastContainer = document.getElementById("toast-container");

    if (!toastContainer) {
      toastContainer = document.createElement("div");
      toastContainer.id = "toast-container";
      toastContainer.className = `
        fixed top-4 right-4 z-[9999] flex flex-col space-y-3 pointer-events-none
        max-h-screen overflow-hidden
      `;
      toastContainer.setAttribute("aria-live", "polite");
      toastContainer.setAttribute("aria-label", "Notifications");
      document.body.appendChild(toastContainer);
    }

    setContainer(toastContainer);

    return () => {
      // Don't remove the container on unmount as other components might be using it
    };
  }, []);

  if (!container || toasts.length === 0) {
    return null;
  }

  return createPortal(
    <>
      {toasts.map((toast) => (
        <div key={toast.id} className="pointer-events-auto">
          <ToastComponent toast={toast} onDismiss={dismissToast} />
        </div>
      ))}
    </>,
    container,
  );
}

// Alternative hook-based toast component for direct use
export function useToastNotification() {
  const { showToast } = useToast();

  return {
    success: (
      message: string,
      options?: Partial<Omit<Toast, "id" | "type" | "message">>,
    ) => showToast({ ...options, message, type: "success" }),

    error: (
      message: string,
      options?: Partial<Omit<Toast, "id" | "type" | "message">>,
    ) => showToast({ ...options, message, type: "error" }),

    warning: (
      message: string,
      options?: Partial<Omit<Toast, "id" | "type" | "message">>,
    ) => showToast({ ...options, message, type: "warning" }),

    info: (
      message: string,
      options?: Partial<Omit<Toast, "id" | "type" | "message">>,
    ) => showToast({ ...options, message, type: "info" }),

    custom: (toast: Omit<Toast, "id">) => showToast(toast),
  };
}

// Progress toast component for long-running operations
interface ProgressToastProps {
  id: string;
  title: string;
  progress: number; // 0-100
  isIndeterminate?: boolean;
  onCancel?: () => void;
}

export function ProgressToast({
  id,
  title,
  progress,
  isIndeterminate,
  onCancel,
}: ProgressToastProps) {
  const { dismissToast } = useToast();

  const handleDismiss = () => {
    dismissToast(id);
    onCancel?.();
  };

  return (
    <div
      className="max-w-sm w-full bg-white border border-blue-200 rounded-lg shadow-lg p-4"
      role="alert"
      aria-live="polite"
      aria-atomic="true"
    >
      <div className="flex items-start justify-between mb-3">
        <h4 className="text-sm font-semibold text-blue-900">{title}</h4>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleDismiss}
          className="h-5 w-5 p-0 hover:bg-blue-100"
          aria-label="Cancel operation"
        >
          <X className="h-3 w-3" />
        </Button>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs text-blue-700">
          <span>Progress</span>
          {!isIndeterminate && <span>{Math.round(progress)}%</span>}
        </div>

        <div className="w-full bg-blue-100 rounded-full h-2">
          {isIndeterminate ? (
            <div className="h-2 bg-blue-600 rounded-full animate-pulse" />
          ) : (
            <div
              className="h-2 bg-blue-600 rounded-full transition-all duration-300"
              style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
            />
          )}
        </div>

        {onCancel && (
          <Button
            size="sm"
            variant="outline"
            onClick={onCancel}
            className="w-full h-7 text-xs border-blue-200 text-blue-700 hover:bg-blue-50"
          >
            Cancel
          </Button>
        )}
      </div>
    </div>
  );
}

// Bulk action toast for multiple operations
interface BulkActionToastProps {
  title: string;
  completed: number;
  total: number;
  errors: number;
  onViewErrors?: () => void;
  onDismiss?: () => void;
}

export function BulkActionToast({
  title,
  completed,
  total,
  errors,
  onViewErrors,
  onDismiss,
}: BulkActionToastProps) {
  const progress = (completed / total) * 100;
  const isComplete = completed === total;

  return (
    <div
      className={`
        max-w-sm w-full bg-white border rounded-lg shadow-lg p-4
        ${errors > 0 ? "border-yellow-200" : isComplete ? "border-green-200" : "border-blue-200"}
      `}
      role="alert"
      aria-live="polite"
      aria-atomic="true"
    >
      <div className="flex items-start justify-between mb-3">
        <h4 className="text-sm font-semibold">{title}</h4>
        {onDismiss && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onDismiss}
            className="h-5 w-5 p-0 hover:bg-gray-100"
            aria-label="Dismiss"
          >
            <X className="h-3 w-3" />
          </Button>
        )}
      </div>

      <div className="space-y-3">
        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs">
            <span>
              Progress: {completed} of {total}
            </span>
            <span>{Math.round(progress)}%</span>
          </div>

          <div className="w-full bg-gray-100 rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all duration-300 ${
                errors > 0
                  ? "bg-yellow-500"
                  : isComplete
                    ? "bg-green-500"
                    : "bg-blue-500"
              }`}
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {errors > 0 && (
          <div className="flex items-center justify-between">
            <span className="text-xs text-yellow-700">
              {errors} {errors === 1 ? "error" : "errors"}
            </span>
            {onViewErrors && (
              <Button
                size="sm"
                variant="outline"
                onClick={onViewErrors}
                className="h-6 px-2 text-xs border-yellow-200 text-yellow-700 hover:bg-yellow-50"
              >
                View Errors
              </Button>
            )}
          </div>
        )}

        {isComplete && errors === 0 && (
          <div className="flex items-center space-x-2 text-green-700">
            <CheckCircle className="h-4 w-4" />
            <span className="text-xs">
              All operations completed successfully
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
