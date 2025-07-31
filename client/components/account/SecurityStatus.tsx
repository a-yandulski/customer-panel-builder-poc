import { useSecurity } from "@/hooks/useProfile";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Shield,
  CheckCircle,
  AlertTriangle,
  Clock,
  Monitor,
  Key,
  Activity,
} from "lucide-react";

interface SecurityMetricProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  description: string;
  status: "good" | "warning" | "danger";
}

function SecurityMetric({
  icon,
  label,
  value,
  description,
  status,
}: SecurityMetricProps) {
  const statusColors = {
    good: "text-green-600",
    warning: "text-yellow-600",
    danger: "text-red-600",
  };

  const bgColors = {
    good: "bg-green-50 border-green-200",
    warning: "bg-yellow-50 border-yellow-200",
    danger: "bg-red-50 border-red-200",
  };

  return (
    <div className={`p-4 rounded-lg border ${bgColors[status]}`}>
      <div className="flex items-center space-x-3 mb-2">
        <div className="p-2 bg-white rounded-full">{icon}</div>
        <div className="flex-1">
          <h4 className="font-medium text-gray-900">{label}</h4>
          <p className={`text-lg font-semibold ${statusColors[status]}`}>
            {value}
          </p>
        </div>
      </div>
      <p className="text-sm text-gray-600">{description}</p>
    </div>
  );
}

interface SecurityRecommendationProps {
  title: string;
  description: string;
  action: string;
  priority: "high" | "medium" | "low";
  onAction?: () => void;
}

function SecurityRecommendation({
  title,
  description,
  action,
  priority,
  onAction,
}: SecurityRecommendationProps) {
  const priorityColors = {
    high: "border-red-200 bg-red-50",
    medium: "border-yellow-200 bg-yellow-50",
    low: "border-blue-200 bg-blue-50",
  };

  const priorityIcons = {
    high: <AlertTriangle className="h-5 w-5 text-red-600" />,
    medium: <Clock className="h-5 w-5 text-yellow-600" />,
    low: <CheckCircle className="h-5 w-5 text-blue-600" />,
  };

  return (
    <div className={`p-4 rounded-lg border ${priorityColors[priority]}`}>
      <div className="flex items-start space-x-3">
        {priorityIcons[priority]}
        <div className="flex-1">
          <h4 className="font-medium text-gray-900">{title}</h4>
          <p className="text-sm text-gray-600 mt-1">{description}</p>
          {onAction && (
            <button
              onClick={onAction}
              className="mt-2 text-sm font-medium text-primary hover:text-primary/80 underline"
            >
              {action}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default function SecurityStatus() {
  const { security, isLoading, error } = useSecurity();

  if (isLoading) {
    return (
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Shield className="mr-2 h-5 w-5 text-primary" />
            Security Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="p-4 bg-gray-100 rounded-lg">
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-6 bg-gray-200 rounded mb-1"></div>
                  <div className="h-3 bg-gray-200 rounded"></div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Shield className="mr-2 h-5 w-5 text-primary" />
            Security Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              <span className="font-medium text-red-900">
                Unable to load security status
              </span>
            </div>
            <p className="text-sm text-red-700 mt-1">{error}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!security) {
    return null;
  }

  const getPasswordStatus = (strength: string) => {
    switch (strength) {
      case "strong":
        return "good";
      case "medium":
        return "warning";
      default:
        return "danger";
    }
  };

  const recommendations = [];

  if (!security.twoFactorEnabled) {
    recommendations.push({
      title: "Enable Two-Factor Authentication",
      description: "Add an extra layer of security to your account with 2FA.",
      action: "Set up 2FA",
      priority: "high" as const,
    });
  }

  if (security.passwordStrength !== "strong") {
    recommendations.push({
      title: "Strengthen Your Password",
      description:
        "Your current password could be stronger. Consider updating it.",
      action: "Change password",
      priority: "medium" as const,
    });
  }

  if (security.loginSessions > 5) {
    recommendations.push({
      title: "Review Active Sessions",
      description:
        "You have many active login sessions. Review and remove any you don't recognize.",
      action: "Manage sessions",
      priority: "medium" as const,
    });
  }

  const lastPasswordChange = new Date(security.passwordLastChanged);
  const daysSincePasswordChange = Math.floor(
    (Date.now() - lastPasswordChange.getTime()) / (1000 * 60 * 60 * 24),
  );

  if (daysSincePasswordChange > 90) {
    recommendations.push({
      title: "Password is Getting Old",
      description: `Your password hasn't been changed in ${daysSincePasswordChange} days. Consider updating it regularly.`,
      action: "Update password",
      priority: "low" as const,
    });
  }

  return (
    <Card className="shadow-md">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center">
              <Shield className="mr-2 h-5 w-5 text-primary" />
              Security Status
            </CardTitle>
            <CardDescription className="body-sm">
              Your account security overview and recommendations
            </CardDescription>
          </div>
          <Badge
            className={`${
              security.securityScore >= 80
                ? "bg-green-100 text-green-800 border-green-200"
                : security.securityScore >= 60
                  ? "bg-yellow-100 text-yellow-800 border-yellow-200"
                  : "bg-red-100 text-red-800 border-red-200"
            }`}
          >
            <Shield className="mr-1 h-3 w-3" />
            {security.securityScore}% Secure
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Security Score Progress */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">
              Overall Security Score
            </span>
            <span className="text-sm text-gray-600">
              {security.securityScore}/100
            </span>
          </div>
          <Progress
            value={security.securityScore}
            className="h-3"
            aria-label={`Security score: ${security.securityScore} out of 100`}
          />
        </div>

        {/* Security Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <SecurityMetric
            icon={<Key className="h-5 w-5 text-gray-600" />}
            label="Password Strength"
            value={
              security.passwordStrength?.charAt(0).toUpperCase() +
              security.passwordStrength?.slice(1)
            }
            description={`Last changed: ${lastPasswordChange.toLocaleDateString()}`}
            status={getPasswordStatus(security.passwordStrength)}
          />

          <SecurityMetric
            icon={<Shield className="h-5 w-5 text-gray-600" />}
            label="Two-Factor Auth"
            value={security.twoFactorEnabled ? "Enabled" : "Disabled"}
            description={
              security.twoFactorEnabled
                ? "Extra layer of protection"
                : "Recommended for security"
            }
            status={security.twoFactorEnabled ? "good" : "danger"}
          />

          <SecurityMetric
            icon={<Monitor className="h-5 w-5 text-gray-600" />}
            label="Active Sessions"
            value={security.loginSessions}
            description={`Last login: ${security.lastLoginFrom || "Unknown"}`}
            status={security.loginSessions > 5 ? "warning" : "good"}
          />

          <SecurityMetric
            icon={<Activity className="h-5 w-5 text-gray-600" />}
            label="Suspicious Activity"
            value={security.suspiciousActivity ? "Detected" : "None"}
            description={
              security.suspiciousActivity
                ? "Review recent activity"
                : "No threats detected"
            }
            status={security.suspiciousActivity ? "danger" : "good"}
          />
        </div>

        {/* Security Recommendations */}
        {recommendations.length > 0 && (
          <div className="space-y-4">
            <h4 className="font-medium text-gray-900">
              Security Recommendations
            </h4>
            <div className="space-y-3">
              {recommendations.map((rec, index) => (
                <SecurityRecommendation
                  key={index}
                  title={rec.title}
                  description={rec.description}
                  action={rec.action}
                  priority={rec.priority}
                />
              ))}
            </div>
          </div>
        )}

        {/* Security Tips */}
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-start space-x-3">
            <CheckCircle className="h-5 w-5 text-blue-600 mt-0.5" />
            <div>
              <h4 className="font-medium text-blue-900">
                Security Best Practices
              </h4>
              <ul className="text-sm text-blue-700 mt-2 space-y-1" role="list">
                <li>• Use unique, strong passwords for all accounts</li>
                <li>• Enable two-factor authentication whenever possible</li>
                <li>• Regularly review your account activity</li>
                <li>• Keep your contact information up to date</li>
                <li>• Log out from public or shared computers</li>
              </ul>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
