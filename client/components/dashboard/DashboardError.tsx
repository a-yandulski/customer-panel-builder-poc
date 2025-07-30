import { AlertTriangle, RefreshCw, Wifi, WifiOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface ErrorStateProps {
  title: string;
  message: string;
  onRetry?: () => void;
  retryLabel?: string;
  type?: "network" | "server" | "permission" | "generic";
}

export function ErrorState({
  title,
  message,
  onRetry,
  retryLabel = "Try Again",
  type = "generic",
}: ErrorStateProps) {
  const getIcon = () => {
    switch (type) {
      case "network":
        return <WifiOff className="h-8 w-8 text-red-500" />;
      case "server":
        return <AlertTriangle className="h-8 w-8 text-orange-500" />;
      case "permission":
        return <AlertTriangle className="h-8 w-8 text-yellow-500" />;
      default:
        return <AlertTriangle className="h-8 w-8 text-red-500" />;
    }
  };

  const getBackgroundColor = () => {
    switch (type) {
      case "network":
        return "bg-red-50 border-red-200";
      case "server":
        return "bg-orange-50 border-orange-200";
      case "permission":
        return "bg-yellow-50 border-yellow-200";
      default:
        return "bg-red-50 border-red-200";
    }
  };

  return (
    <div className={`p-6 rounded-lg border ${getBackgroundColor()}`}>
      <div className="text-center space-y-4">
        <div className="flex justify-center">{getIcon()}</div>
        <div>
          <h3 className="font-semibold text-gray-900 mb-1">{title}</h3>
          <p className="text-sm text-gray-600">{message}</p>
        </div>
        {onRetry && (
          <Button onClick={onRetry} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            {retryLabel}
          </Button>
        )}
      </div>
    </div>
  );
}

export function ServiceCardError({ onRetry }: { onRetry: () => void }) {
  return (
    <Card className="shadow-md border-red-200">
      <CardContent className="pt-6">
        <ErrorState
          title="Failed to Load"
          message="Unable to fetch service data"
          onRetry={onRetry}
          type="server"
        />
      </CardContent>
    </Card>
  );
}

export function RenewalTableError({ onRetry }: { onRetry: () => void }) {
  return (
    <ErrorState
      title="Renewals Unavailable"
      message="We couldn't load your upcoming renewals. Please try again."
      onRetry={onRetry}
      type="server"
    />
  );
}

export function ActivityError({ onRetry }: { onRetry: () => void }) {
  return (
    <ErrorState
      title="Activity Feed Error"
      message="Recent activities couldn't be loaded."
      onRetry={onRetry}
      type="network"
    />
  );
}

export function EmptyState({
  title,
  message,
  action,
}: {
  title: string;
  message: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="text-center py-12 px-4">
      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <Wifi className="h-8 w-8 text-gray-400" />
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600 mb-6 max-w-sm mx-auto">{message}</p>
      {action && action}
    </div>
  );
}

export function NetworkError({ onRetry }: { onRetry: () => void }) {
  return (
    <Card className="shadow-md border-red-200">
      <CardHeader>
        <CardTitle className="text-red-700 flex items-center">
          <WifiOff className="h-5 w-5 mr-2" />
          Connection Error
        </CardTitle>
        <CardDescription>
          Unable to connect to our servers. Please check your internet
          connection.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button onClick={onRetry} variant="outline" className="w-full">
          <RefreshCw className="h-4 w-4 mr-2" />
          Retry Connection
        </Button>
      </CardContent>
    </Card>
  );
}

export function MaintenanceMode() {
  return (
    <Card className="shadow-md border-yellow-200 bg-yellow-50">
      <CardHeader>
        <CardTitle className="text-yellow-700 flex items-center">
          <AlertTriangle className="h-5 w-5 mr-2" />
          Maintenance Mode
        </CardTitle>
        <CardDescription>
          We're currently performing scheduled maintenance. Some features may be
          temporarily unavailable.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-yellow-600">
          Expected completion: In approximately 30 minutes
        </p>
      </CardContent>
    </Card>
  );
}
