import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Loader2 } from "lucide-react";

interface ConfirmationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void | Promise<void>;
  loading?: boolean;
  destructive?: boolean;
  children?: React.ReactNode;
}

export default function ConfirmationDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  onConfirm,
  loading = false,
  destructive = false,
  children,
}: ConfirmationDialogProps) {
  const handleConfirm = async () => {
    try {
      await onConfirm();
      onOpenChange(false);
    } catch (error) {
      // Error handling is done in the parent component
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {destructive && <AlertTriangle className="h-5 w-5 text-red-600" />}
            {title}
          </DialogTitle>
          <DialogDescription className="text-left">
            {description}
          </DialogDescription>
        </DialogHeader>

        {children && (
          <div className="py-4">
            {children}
          </div>
        )}

        <DialogFooter className="sm:justify-end gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            {cancelLabel}
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={loading}
            variant={destructive ? "destructive" : "default"}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              confirmLabel
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Specific confirmation dialogs for common domain actions
interface AutoRenewConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  domainName: string;
  currentState: boolean;
  onConfirm: () => void | Promise<void>;
  loading?: boolean;
}

export function AutoRenewConfirmDialog({
  open,
  onOpenChange,
  domainName,
  currentState,
  onConfirm,
  loading = false,
}: AutoRenewConfirmDialogProps) {
  const action = currentState ? "disable" : "enable";
  const description = currentState
    ? `Are you sure you want to disable auto-renewal for ${domainName}? You'll need to manually renew this domain before it expires.`
    : `Are you sure you want to enable auto-renewal for ${domainName}? The domain will be automatically renewed before expiration.`;

  return (
    <ConfirmationDialog
      open={open}
      onOpenChange={onOpenChange}
      title={`${action === "enable" ? "Enable" : "Disable"} Auto-Renewal`}
      description={description}
      confirmLabel={`${action === "enable" ? "Enable" : "Disable"} Auto-Renewal`}
      onConfirm={onConfirm}
      loading={loading}
      destructive={action === "disable"}
    >
      <div className="bg-gray-50 p-4 rounded-lg">
        <h4 className="font-medium text-sm text-gray-700 mb-2">Domain Details:</h4>
        <div className="text-sm">
          <div className="flex justify-between mb-1">
            <span className="text-gray-600">Domain:</span>
            <span className="font-mono">{domainName}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Current Auto-Renewal:</span>
            <span className={currentState ? "text-green-600" : "text-red-600"}>
              {currentState ? "Enabled" : "Disabled"}
            </span>
          </div>
        </div>
      </div>
    </ConfirmationDialog>
  );
}

interface DomainLockConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  domainName: string;
  currentState: boolean;
  onConfirm: () => void | Promise<void>;
  loading?: boolean;
}

export function DomainLockConfirmDialog({
  open,
  onOpenChange,
  domainName,
  currentState,
  onConfirm,
  loading = false,
}: DomainLockConfirmDialogProps) {
  const action = currentState ? "unlock" : "lock";
  const description = currentState
    ? `Unlocking ${domainName} will allow the domain to be transferred to another registrar. This reduces security but may be necessary for domain transfers.`
    : `Locking ${domainName} will prevent unauthorized transfers and provide additional security for your domain.`;

  return (
    <ConfirmationDialog
      open={open}
      onOpenChange={onOpenChange}
      title={`${action === "lock" ? "Lock" : "Unlock"} Domain`}
      description={description}
      confirmLabel={`${action === "lock" ? "Lock" : "Unlock"} Domain`}
      onConfirm={onConfirm}
      loading={loading}
      destructive={action === "unlock"}
    >
      <div className="bg-gray-50 p-4 rounded-lg">
        <h4 className="font-medium text-sm text-gray-700 mb-2">Security Impact:</h4>
        <div className="text-sm space-y-1">
          <div className="flex items-start gap-2">
            <span className="text-gray-600 mt-0.5">•</span>
            <span>
              {action === "lock" 
                ? "Domain will be protected from unauthorized transfers"
                : "Domain will be vulnerable to unauthorized transfers"
              }
            </span>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-gray-600 mt-0.5">•</span>
            <span>
              {action === "lock"
                ? "Additional security layer for your domain"
                : "Required for legitimate domain transfers"
              }
            </span>
          </div>
        </div>
      </div>
    </ConfirmationDialog>
  );
}

interface DomainTransferConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  domainName: string;
  newRegistrar: string;
  authCode: string;
  onConfirm: () => void | Promise<void>;
  loading?: boolean;
}

export function DomainTransferConfirmDialog({
  open,
  onOpenChange,
  domainName,
  newRegistrar,
  authCode,
  onConfirm,
  loading = false,
}: DomainTransferConfirmDialogProps) {
  return (
    <ConfirmationDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Confirm Domain Transfer"
      description={`Are you sure you want to transfer ${domainName} to ${newRegistrar}? This action cannot be undone and may take several days to complete.`}
      confirmLabel="Initiate Transfer"
      onConfirm={onConfirm}
      loading={loading}
      destructive={true}
    >
      <div className="space-y-4">
        <div className="bg-red-50 p-4 rounded-lg border border-red-200">
          <h4 className="font-medium text-sm text-red-700 mb-2">⚠️ Important Notice:</h4>
          <ul className="text-sm text-red-600 space-y-1">
            <li>• Domain transfer typically takes 5-7 business days</li>
            <li>• Your website and email may be affected during transfer</li>
            <li>• You cannot cancel the transfer once initiated</li>
            <li>• Domain will be locked for 60 days after transfer</li>
          </ul>
        </div>
        
        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="font-medium text-sm text-gray-700 mb-2">Transfer Details:</h4>
          <div className="text-sm space-y-1">
            <div className="flex justify-between">
              <span className="text-gray-600">Domain:</span>
              <span className="font-mono">{domainName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">New Registrar:</span>
              <span>{newRegistrar}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Auth Code:</span>
              <span className="font-mono">{authCode}</span>
            </div>
          </div>
        </div>
      </div>
    </ConfirmationDialog>
  );
}
