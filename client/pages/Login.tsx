import { useEffect, useState } from "react";
import {
  Loader2,
  ArrowRight,
  Shield,
  Eye,
  EyeOff,
  ToggleLeft,
  ToggleRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  const { isAuthenticated, isLoading, loginWithRedirect, error } = useAuth();
  const navigate = useNavigate();
  const [isRedirecting, setIsRedirecting] = useState(false);

  // Fake login state
  const [useFakeLogin, setUseFakeLogin] = useState(true);
  const [email, setEmail] = useState("john.doe@example.com");
  const [password, setPassword] = useState("password123");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Redirect to dashboard if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate("/dashboard");
    }
  }, [isAuthenticated, navigate]);

  const handleAuth0Login = async () => {
    try {
      setIsRedirecting(true);
      await loginWithRedirect();
    } catch (err) {
      setIsRedirecting(false);
      console.error("Login error:", err);
    }
  };

  const handleFakeLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggingIn(true);

    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Simple fake authentication - just store user data in localStorage
    const fakeUser = {
      sub: "fake|123456789",
      name: email === "john.doe@example.com" ? "John Doe" : "Demo User",
      given_name: email === "john.doe@example.com" ? "John" : "Demo",
      family_name: email === "john.doe@example.com" ? "Doe" : "User",
      email: email,
      email_verified: true,
      picture: `https://ui-avatars.com/api/?name=${encodeURIComponent(email.split("@")[0])}&background=035BFF&color=fff`,
      updated_at: new Date().toISOString(),
    };

    // Store fake auth state
    localStorage.setItem("fake_auth_user", JSON.stringify(fakeUser));
    localStorage.setItem("fake_auth_token", "fake_jwt_token_" + Date.now());

    setIsLoggingIn(false);

    // Trigger a page reload to reinitialize auth state
    window.location.href = "/dashboard";
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
          <h2 className="mt-6 h2 text-gray-900">Welcome to DomainHost</h2>
          <p className="mt-2 body-sm text-gray-500">
            Secure access to your customer panel
          </p>
        </div>

        {/* Login Options Toggle */}
        <div className="flex items-center justify-center space-x-4 p-4 bg-gray-100 rounded-lg border">
          <span className="text-sm font-medium text-gray-700">Demo Login</span>
          <button
            onClick={() => setUseFakeLogin(!useFakeLogin)}
            className="flex items-center"
          >
            {useFakeLogin ? (
              <ToggleLeft className="h-6 w-6 text-primary" />
            ) : (
              <ToggleRight className="h-6 w-6 text-primary" />
            )}
          </button>
          <span className="text-sm font-medium text-gray-700">Auth0 Login</span>
        </div>

        {/* Login Card */}
        <Card className="border-gray-200 shadow-lg">
          <CardHeader className="space-y-1 pb-4">
            <CardTitle className="text-xl font-semibold text-center">
              {useFakeLogin ? "Demo Login" : "Sign in to continue"}
            </CardTitle>
            <CardDescription className="text-center body-sm">
              {useFakeLogin
                ? "Use demo credentials for testing (pre-filled)"
                : "We use enterprise-grade security to protect your account"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {useFakeLogin ? (
              /* Fake Login Form */
              <form onSubmit={handleFakeLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label
                    htmlFor="email"
                    className="text-sm font-semibold text-gray-700"
                  >
                    Email address
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="john.doe@example.com"
                    required
                    className="h-11"
                  />
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="password"
                    className="text-sm font-semibold text-gray-700"
                  >
                    Password
                  </Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter password"
                      required
                      className="h-11 pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-800">
                    <strong>Demo Credentials:</strong>
                  </p>
                  <p className="text-xs text-blue-600 mt-1">
                    Email: john.doe@example.com
                    <br />
                    Password: password123
                  </p>
                </div>

                <Button
                  type="submit"
                  className="w-full h-12 btn-primary text-base font-semibold"
                  disabled={isLoggingIn}
                >
                  {isLoggingIn ? (
                    <div className="flex items-center space-x-2">
                      <Loader2 className="h-5 w-5 animate-spin" />
                      <span>Signing in...</span>
                    </div>
                  ) : (
                    "Sign In with Demo"
                  )}
                </Button>
              </form>
            ) : (
              /* Auth0 Login */
              <>
                {/* Security Info */}
                <div className="flex items-center space-x-3 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <Shield className="h-5 w-5 text-blue-600 flex-shrink-0" />
                  <div className="text-sm text-blue-800">
                    <p className="font-medium">Secure Authentication</p>
                    <p className="text-blue-600">
                      Powered by Auth0 with enterprise security
                    </p>
                  </div>
                </div>

                {/* Error Display */}
                {error && (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm text-red-800">
                      <strong>Authentication Error:</strong> {error.message}
                    </p>
                    <p className="text-xs text-red-600 mt-1">
                      Please try again or contact support if the issue persists.
                    </p>
                  </div>
                )}

                {/* Login Button */}
                <Button
                  onClick={handleAuth0Login}
                  className="w-full h-12 btn-primary text-base font-semibold"
                  disabled={isRedirecting}
                >
                  {isRedirecting ? (
                    <div className="flex items-center space-x-2">
                      <Loader2 className="h-5 w-5 animate-spin" />
                      <span>Redirecting to login...</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <span>Continue with Auth0</span>
                      <ArrowRight className="h-4 w-4" />
                    </div>
                  )}
                </Button>

                {/* Features */}
                <div className="space-y-3">
                  <div className="text-center text-sm text-gray-500">
                    What you'll get access to:
                  </div>
                  <div className="grid grid-cols-1 gap-2 text-sm text-gray-600">
                    <div className="flex items-center space-x-2">
                      <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                      <span>Domain management and DNS controls</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                      <span>Billing and subscription management</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                      <span>24/7 priority support access</span>
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Need help?</span>
              </div>
            </div>

            {/* Help Links */}
            <div className="text-center space-y-2">
              <p className="body-sm text-gray-500">
                New customer?{" "}
                <a
                  href="/register"
                  className="text-primary hover:text-secondary font-semibold transition-colors"
                >
                  Create an account
                </a>
              </p>
              <p className="body-sm text-gray-500">
                <a
                  href="/support"
                  className="text-primary hover:text-secondary font-semibold transition-colors"
                >
                  Contact Support
                </a>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center">
          <p className="text-xs text-gray-500">
            By signing in, you agree to our{" "}
            <a href="/terms" className="text-primary hover:underline">
              Terms of Service
            </a>{" "}
            and{" "}
            <a href="/privacy" className="text-primary hover:underline">
              Privacy Policy
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
