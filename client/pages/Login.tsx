import { useEffect, useState } from "react";
import {
  Loader2,
  ArrowRight,
  Shield,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const { isAuthenticated, isLoading, loginDemo, error } = useAuth();
  const navigate = useNavigate();
  const [isRedirecting, setIsRedirecting] = useState(false);

  // Redirect to dashboard if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate("/dashboard");
    }
  }, [isAuthenticated, navigate]);

  const handleLogin = async () => {
    try {
      setIsRedirecting(true);
      console.log("🔐 Initiating demo login...");
      await loginDemo();
      // Navigation will happen automatically via useEffect when isAuthenticated becomes true
    } catch (err) {
      setIsRedirecting(false);
      console.error("Login error:", err);
    }
  };

  // Show loading state while Auth0 is initializing
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8 text-center">
          <div className="flex justify-center">
            <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center">
              <Loader2 className="h-6 w-6 text-white animate-spin" />
            </div>
          </div>
          <p className="text-gray-600">Initializing authentication...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Logo and Header */}
        <div className="text-center">
          <div className="flex justify-center">
            <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">D</span>
            </div>
          </div>
          <h2 className="mt-6 text-3xl font-bold text-gray-900">Welcome to DomainHost</h2>
          <p className="mt-2 text-sm text-gray-500">
            Secure access to your customer panel
          </p>
        </div>

        {/* Login Card */}
        <Card className="border-gray-200 shadow-lg">
          <CardHeader className="space-y-1 pb-4">
            <CardTitle className="text-xl font-semibold text-center">
              Sign in to continue
            </CardTitle>
            <CardDescription className="text-center text-sm">
              We use enterprise-grade security to protect your account
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Auth0 Login */}
            <div className="space-y-4">
              <Button
                onClick={handleLogin}
                disabled={isRedirecting}
                className="w-full bg-primary hover:bg-primary/90 text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2"
              >
                {isRedirecting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Redirecting to login...</span>
                  </>
                ) : (
                  <>
                    <Shield className="h-4 w-4" />
                    <span>Sign in (Demo)</span>
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </>
                )}
              </Button>

              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-600">
                    Authentication error: {error.message}
                  </p>
                </div>
              )}
            </div>

            {/* Security Notice */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <Shield className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-blue-800">
                  <p className="font-medium mb-1">Demo Authentication</p>
                  <p className="text-blue-700">
                    This uses a simulated Auth0 authentication flow for demonstration purposes.
                    All requests are mocked locally.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Demo Notice */}
        <div className="text-center">
          <p className="text-xs text-gray-500">
            This is a demo application. Authentication is mocked for demonstration purposes.
          </p>
        </div>
      </div>
    </div>
  );
}
