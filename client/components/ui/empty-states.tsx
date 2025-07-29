import { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Globe,
  MessageCircle,
  FileText,
  Bell,
  Check,
  Plus,
  Search,
  CreditCard,
  Server,
  Shield,
} from "lucide-react";

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
    variant?: "default" | "outline";
  };
  secondaryAction?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  secondaryAction,
  className,
}: EmptyStateProps) {
  return (
    <div className={cn("text-center py-12 px-6", className)}>
      {icon && (
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
          {icon}
        </div>
      )}
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600 mb-6 max-w-md mx-auto">{description}</p>
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        {action && (
          <Button
            onClick={action.onClick}
            variant={action.variant || "default"}
            className="mobile-touch-target"
          >
            <Plus className="mr-2 h-4 w-4" />
            {action.label}
          </Button>
        )}
        {secondaryAction && (
          <Button
            onClick={secondaryAction.onClick}
            variant="outline"
            className="mobile-touch-target"
          >
            {secondaryAction.label}
          </Button>
        )}
      </div>
    </div>
  );
}

// Specific Empty States
export function EmptyDomains({
  onRegisterDomain,
}: {
  onRegisterDomain: () => void;
}) {
  return (
    <EmptyState
      icon={<Globe className="h-8 w-8 text-gray-400" />}
      title="No domains yet"
      description="Get started by registering your first domain. Choose from hundreds of domain extensions and secure your online presence today."
      action={{
        label: "Register Your First Domain",
        onClick: onRegisterDomain,
      }}
      secondaryAction={{
        label: "Browse Domain Extensions",
        onClick: () => console.log("Browse domains"),
      }}
    />
  );
}

export function EmptyTickets({
  onCreateTicket,
}: {
  onCreateTicket: () => void;
}) {
  return (
    <EmptyState
      icon={<MessageCircle className="h-8 w-8 text-gray-400" />}
      title="No support tickets yet"
      description="Need help with your services? Our support team is here to assist you. Create a ticket to get personalized assistance."
      action={{
        label: "Create Support Ticket",
        onClick: onCreateTicket,
      }}
      secondaryAction={{
        label: "Browse Help Center",
        onClick: () => console.log("Browse help"),
      }}
    />
  );
}

export function EmptyInvoices({
  onAdjustDateRange,
}: {
  onAdjustDateRange: () => void;
}) {
  return (
    <EmptyState
      icon={<FileText className="h-8 w-8 text-gray-400" />}
      title="No invoices to display"
      description="No invoices found for the selected date range. Try adjusting your filters or date range to view your billing history."
      action={{
        label: "Adjust Date Range",
        onClick: onAdjustDateRange,
        variant: "outline",
      }}
      secondaryAction={{
        label: "View All Time",
        onClick: () => console.log("View all"),
      }}
    />
  );
}

export function EmptyNotifications() {
  return (
    <EmptyState
      icon={
        <div className="relative">
          <Bell className="h-8 w-8 text-gray-400" />
          <div className="absolute -top-1 -right-1 h-5 w-5 bg-success rounded-full flex items-center justify-center">
            <Check className="h-3 w-3 text-white" />
          </div>
        </div>
      }
      title="All caught up!"
      description="You're up to date with all notifications. We'll let you know when there's something new to see."
      className="py-8"
    />
  );
}

export function EmptySearch({
  searchTerm,
  onClearSearch,
}: {
  searchTerm: string;
  onClearSearch: () => void;
}) {
  return (
    <EmptyState
      icon={<Search className="h-8 w-8 text-gray-400" />}
      title="No results found"
      description={`We couldn't find anything matching "${searchTerm}". Try adjusting your search terms or clearing the filters.`}
      action={{
        label: "Clear Search",
        onClick: onClearSearch,
        variant: "outline",
      }}
    />
  );
}

export function EmptyServices({ onAddService }: { onAddService: () => void }) {
  return (
    <EmptyState
      icon={<Server className="h-8 w-8 text-gray-400" />}
      title="No services found"
      description="You don't have any services yet. Start by adding a domain, hosting plan, or security service to get started."
      action={{
        label: "Add Your First Service",
        onClick: onAddService,
      }}
    />
  );
}

export function EmptyPaymentMethods({ onAddCard }: { onAddCard: () => void }) {
  return (
    <EmptyState
      icon={<CreditCard className="h-8 w-8 text-gray-400" />}
      title="No payment methods"
      description="Add a credit card or payment method to easily pay for your services and enable auto-renewal for your domains."
      action={{
        label: "Add Payment Method",
        onClick: onAddCard,
      }}
    />
  );
}

export function EmptyActivity() {
  return (
    <EmptyState
      icon={<Shield className="h-8 w-8 text-gray-400" />}
      title="No activity recorded"
      description="Your security activity log is empty. This shows login attempts, password changes, and other security-related events."
      className="py-8"
    />
  );
}

// Error Empty State
export function ErrorEmpty({
  title = "Something went wrong",
  description = "We encountered an error while loading this content. Please try again.",
  onRetry,
  onContactSupport,
}: {
  title?: string;
  description?: string;
  onRetry?: () => void;
  onContactSupport?: () => void;
}) {
  return (
    <EmptyState
      icon={
        <div className="text-error">
          <svg
            className="h-8 w-8"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
            />
          </svg>
        </div>
      }
      title={title}
      description={description}
      action={
        onRetry
          ? {
              label: "Try Again",
              onClick: onRetry,
            }
          : undefined
      }
      secondaryAction={
        onContactSupport
          ? {
              label: "Contact Support",
              onClick: onContactSupport,
            }
          : undefined
      }
    />
  );
}
