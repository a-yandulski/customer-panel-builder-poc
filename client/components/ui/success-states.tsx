import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  Check,
  CheckCircle,
  Download,
  ExternalLink,
  Copy,
  X,
} from "lucide-react";

// Inline Success Message
export function InlineSuccess({
  message,
  onDismiss,
  autoHide = true,
  duration = 3000,
  className,
}: {
  message: string;
  onDismiss?: () => void;
  autoHide?: boolean;
  duration?: number;
  className?: string;
}) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (autoHide && duration > 0) {
      const timer = setTimeout(() => {
        setVisible(false);
        onDismiss?.();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [autoHide, duration, onDismiss]);

  if (!visible) return null;

  return (
    <div
      className={cn(
        "flex items-center justify-between p-3 bg-success/10 border border-success/20 rounded-lg transition-all duration-300",
        className,
      )}
    >
      <div className="flex items-center space-x-2">
        <CheckCircle className="h-4 w-4 text-success" />
        <span className="text-sm text-success font-medium">{message}</span>
      </div>
      {onDismiss && !autoHide && (
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

// Success Alert
export function SuccessAlert({
  title,
  message,
  actions,
  onDismiss,
  className,
}: {
  title?: string;
  message: string;
  actions?: Array<{
    label: string;
    onClick: () => void;
    variant?: "default" | "outline";
    icon?: React.ReactNode;
  }>;
  onDismiss?: () => void;
  className?: string;
}) {
  return (
    <Alert className={cn("border-success/20 bg-success/5", className)}>
      <CheckCircle className="h-4 w-4 text-success" />
      {title && <AlertTitle className="text-success">{title}</AlertTitle>}
      <AlertDescription className="mt-2">
        <p className="text-gray-700 mb-3">{message}</p>
        {actions && actions.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {actions.map((action, index) => (
              <Button
                key={index}
                variant={action.variant || "outline"}
                size="sm"
                onClick={action.onClick}
              >
                {action.icon && <span className="mr-2">{action.icon}</span>}
                {action.label}
              </Button>
            ))}
          </div>
        )}
      </AlertDescription>
      {onDismiss && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onDismiss}
          className="absolute top-2 right-2 h-6 w-6 p-0"
        >
          <X className="h-4 w-4" />
        </Button>
      )}
    </Alert>
  );
}

// Form Success
export function FormSubmissionSuccess({
  title,
  message,
  onContinue,
  onViewDetails,
}: {
  title: string;
  message: string;
  onContinue?: () => void;
  onViewDetails?: () => void;
}) {
  return (
    <div className="text-center py-8">
      <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-success/10">
        <CheckCircle className="h-8 w-8 text-success" />
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600 mb-6 max-w-md mx-auto">{message}</p>
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        {onContinue && <Button onClick={onContinue}>Continue</Button>}
        {onViewDetails && (
          <Button variant="outline" onClick={onViewDetails}>
            <ExternalLink className="mr-2 h-4 w-4" />
            View Details
          </Button>
        )}
      </div>
    </div>
  );
}

// Payment Success
export function PaymentSuccess({
  amount,
  transactionId,
  receiptUrl,
  onDownloadReceipt,
  onViewInvoice,
  onContinue,
}: {
  amount: string;
  transactionId: string;
  receiptUrl?: string;
  onDownloadReceipt?: () => void;
  onViewInvoice?: () => void;
  onContinue?: () => void;
}) {
  return (
    <div className="max-w-md mx-auto">
      <div className="text-center py-8 border-b">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-success/10">
          <CheckCircle className="h-8 w-8 text-success" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Payment Successful!
        </h2>
        <p className="text-gray-600">
          Your payment has been processed successfully.
        </p>
      </div>

      <div className="py-6 space-y-4">
        <div className="flex justify-between">
          <span className="text-gray-600">Amount Paid:</span>
          <span className="font-semibold text-gray-900">{amount}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Transaction ID:</span>
          <div className="flex items-center space-x-2">
            <span className="font-mono text-sm text-gray-900">
              {transactionId}
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigator.clipboard.writeText(transactionId)}
              className="h-6 w-6 p-0"
            >
              <Copy className="h-3 w-3" />
            </Button>
          </div>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Date:</span>
          <span className="text-gray-900">
            {new Date().toLocaleDateString()}
          </span>
        </div>
      </div>

      <div className="space-y-3">
        {onDownloadReceipt && (
          <Button
            variant="outline"
            className="w-full"
            onClick={onDownloadReceipt}
          >
            <Download className="mr-2 h-4 w-4" />
            Download Receipt
          </Button>
        )}
        {onViewInvoice && (
          <Button variant="outline" className="w-full" onClick={onViewInvoice}>
            <ExternalLink className="mr-2 h-4 w-4" />
            View Invoice
          </Button>
        )}
        {onContinue && (
          <Button className="w-full" onClick={onContinue}>
            Continue
          </Button>
        )}
      </div>
    </div>
  );
}

// Settings Saved Indicator
export function SettingsSaved({
  setting,
  visible,
  onHide,
}: {
  setting: string;
  visible: boolean;
  onHide?: () => void;
}) {
  useEffect(() => {
    if (visible) {
      const timer = setTimeout(() => {
        onHide?.();
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [visible, onHide]);

  if (!visible) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 animate-in slide-in-from-bottom-4">
      <div className="bg-success text-white px-4 py-3 rounded-lg shadow-lg flex items-center space-x-2">
        <Check className="h-4 w-4" />
        <span className="text-sm font-medium">
          {setting} saved successfully
        </span>
      </div>
    </div>
  );
}

// Ticket Created Success
export function TicketCreated({
  ticketNumber,
  onViewTicket,
  onCreateAnother,
}: {
  ticketNumber: string;
  onViewTicket?: () => void;
  onCreateAnother?: () => void;
}) {
  return (
    <SuccessAlert
      title="Support Ticket Created"
      message={`Your support ticket #${ticketNumber} has been created successfully. Our team will review it and respond within 24 hours.`}
      actions={[
        ...(onViewTicket
          ? [
              {
                label: "View Ticket",
                onClick: onViewTicket,
                icon: <ExternalLink className="h-4 w-4" />,
              },
            ]
          : []),
        ...(onCreateAnother
          ? [
              {
                label: "Create Another Ticket",
                onClick: onCreateAnother,
                variant: "outline" as const,
              },
            ]
          : []),
      ]}
    />
  );
}

// Copy Success Feedback
export function CopyFeedback({
  visible,
  text = "Copied to clipboard",
}: {
  visible: boolean;
  text?: string;
}) {
  if (!visible) return null;

  return (
    <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 animate-in slide-in-from-top-2">
      <Badge className="bg-success text-white shadow-lg">
        <Check className="mr-1 h-3 w-3" />
        {text}
      </Badge>
    </div>
  );
}
