import { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  AlertTriangle,
  Wifi,
  Lock,
  CreditCard,
  RefreshCw,
  MessageCircle,
  X,
} from "lucide-react";

// Form Field Error
export function FormFieldError({
  error,
  className,
}: {
  error?: string;
  className?: string;
}) {
  if (!error) return null;

  return (
    <div className={cn("flex items-center space-x-2 mt-1", className)}>
      <AlertTriangle className="h-4 w-4 text-error flex-shrink-0" />
      <span className="text-sm text-error">{error}</span>
    </div>
  );
}

// Inline Error Message
export function InlineError({
  message,
  onDismiss,
  className,
}: {
  message: string;
  onDismiss?: () => void;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex items-center justify-between p-3 bg-error/10 border border-error/20 rounded-lg",
        className,
      )}
    >
      <div className="flex items-center space-x-2">
        <AlertTriangle className="h-4 w-4 text-error" />
        <span className="text-sm text-error font-medium">{message}</span>
      </div>
      {onDismiss && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onDismiss}
          className="h-6 w-6 p-0"
        >
          <X className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}

// API Error Component
export function ApiError({
  title = "Something went wrong",
  message,
  onRetry,
  onContactSupport,
  className,
}: {
  title?: string;
  message: string;
  onRetry?: () => void;
  onContactSupport?: () => void;
  className?: string;
}) {
  return (
    <Alert variant="destructive" className={cn("border-error/20", className)}>
      <AlertTriangle className="h-4 w-4" />
      <AlertTitle>{title}</AlertTitle>
      <AlertDescription className="mt-2">
        <p className="mb-3">{message}</p>
        <div className="flex space-x-2">
          {onRetry && (
            <Button variant="outline" size="sm" onClick={onRetry}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Try Again
            </Button>
          )}
          {onContactSupport && (
            <Button variant="outline" size="sm" onClick={onContactSupport}>
              <MessageCircle className="mr-2 h-4 w-4" />
              Contact Support
            </Button>
          )}
        </div>
      </AlertDescription>
    </Alert>
  );
}

// Network Error
export function NetworkError({ onRetry }: { onRetry: () => void }) {
  return (
    <Alert variant="destructive" className="border-error/20">
      <Wifi className="h-4 w-4" />
      <AlertTitle>Connection Problem</AlertTitle>
      <AlertDescription className="mt-2">
        <p className="mb-3">
          Unable to connect to our servers. Please check your internet
          connection and try again.
        </p>
        <Button variant="outline" size="sm" onClick={onRetry}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Refresh Page
        </Button>
      </AlertDescription>
    </Alert>
  );
}

// Permission Error
export function PermissionError({
  message = "You don't have permission to access this resource.",
  onContactSupport,
}: {
  message?: string;
  onContactSupport?: () => void;
}) {
  return (
    <Alert variant="destructive" className="border-error/20">
      <Lock className="h-4 w-4" />
      <AlertTitle>Access Denied</AlertTitle>
      <AlertDescription className="mt-2">
        <p className="mb-3">{message}</p>
        {onContactSupport && (
          <Button variant="outline" size="sm" onClick={onContactSupport}>
            <MessageCircle className="mr-2 h-4 w-4" />
            Contact Support
          </Button>
        )}
      </AlertDescription>
    </Alert>
  );
}

// Payment Error
export function PaymentError({
  errorCode,
  message,
  onRetry,
  onUpdatePayment,
}: {
  errorCode?: string;
  message: string;
  onRetry?: () => void;
  onUpdatePayment?: () => void;
}) {
  const getErrorTitle = (code?: string) => {
    switch (code) {
      case "card_declined":
        return "Card Declined";
      case "insufficient_funds":
        return "Insufficient Funds";
      case "expired_card":
        return "Card Expired";
      case "invalid_card":
        return "Invalid Card";
      default:
        return "Payment Failed";
    }
  };

  const getNextSteps = (code?: string) => {
    switch (code) {
      case "card_declined":
        return "Contact your bank or try a different payment method.";
      case "insufficient_funds":
        return "Ensure your account has sufficient funds or use a different card.";
      case "expired_card":
        return "Please update your payment method with a valid card.";
      case "invalid_card":
        return "Check your card details and try again.";
      default:
        return "Please try again or contact support if the problem persists.";
    }
  };

  return (
    <Alert variant="destructive" className="border-error/20">
      <CreditCard className="h-4 w-4" />
      <AlertTitle className="flex items-center justify-between">
        {getErrorTitle(errorCode)}
        {errorCode && (
          <Badge variant="outline" className="text-xs">
            Error: {errorCode}
          </Badge>
        )}
      </AlertTitle>
      <AlertDescription className="mt-2">
        <p className="mb-2">{message}</p>
        <p className="text-sm text-gray-600 mb-3">{getNextSteps(errorCode)}</p>
        <div className="flex space-x-2">
          {onRetry && (
            <Button variant="outline" size="sm" onClick={onRetry}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Try Again
            </Button>
          )}
          {onUpdatePayment && (
            <Button variant="outline" size="sm" onClick={onUpdatePayment}>
              <CreditCard className="mr-2 h-4 w-4" />
              Update Payment Method
            </Button>
          )}
        </div>
      </AlertDescription>
    </Alert>
  );
}

// Error Boundary Fallback
export function ErrorBoundaryFallback({
  error,
  resetError,
}: {
  error: Error;
  resetError: () => void;
}) {
  return (
    <div className="min-h-[400px] flex items-center justify-center p-6">
      <div className="text-center max-w-md">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-error/10">
          <AlertTriangle className="h-8 w-8 text-error" />
        </div>
        <h2 className="text-lg font-semibold text-gray-900 mb-2">
          Something went wrong
        </h2>
        <p className="text-gray-600 mb-4">
          An unexpected error occurred. This has been automatically reported to
          our team.
        </p>
        <details className="text-left bg-gray-50 p-3 rounded-lg mb-4">
          <summary className="cursor-pointer text-sm font-medium text-gray-700">
            Error Details
          </summary>
          <pre className="text-xs text-gray-600 mt-2 whitespace-pre-wrap">
            {error.message}
          </pre>
        </details>
        <div className="flex space-x-2 justify-center">
          <Button onClick={resetError}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Try Again
          </Button>
          <Button variant="outline" onClick={() => window.location.reload()}>
            Reload Page
          </Button>
        </div>
      </div>
    </div>
  );
}

// Validation Error Summary
export function ValidationErrorSummary({
  errors,
  onDismiss,
}: {
  errors: string[];
  onDismiss?: () => void;
}) {
  if (errors.length === 0) return null;

  return (
    <Alert variant="destructive" className="border-error/20">
      <AlertTriangle className="h-4 w-4" />
      <div className="flex items-center justify-between">
        <AlertTitle>Please fix the following errors:</AlertTitle>
        {onDismiss && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onDismiss}
            className="h-6 w-6 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
      <AlertDescription className="mt-2">
        <ul className="list-disc list-inside space-y-1">
          {errors.map((error, index) => (
            <li key={index} className="text-sm">
              {error}
            </li>
          ))}
        </ul>
      </AlertDescription>
    </Alert>
  );
}
