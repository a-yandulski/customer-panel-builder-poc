import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { useNavigate } from "react-router-dom";

interface User {
  sub: string;
  name: string;
  given_name: string;
  family_name: string;
  nickname: string;
  email: string;
  email_verified: boolean;
  picture: string;
  updated_at: string;
}

interface AuthContextType {
  user: User | undefined;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: Error | undefined;
  loginWithRedirect: () => Promise<void>;
  loginDemo: () => Promise<void>;
  logout: (options?: any) => Promise<void>;
  getAccessTokenSilently: () => Promise<string>;
  getIdTokenClaims: () => Promise<any>;
}

// Default context value to prevent undefined errors
const defaultAuthContext: AuthContextType = {
  user: undefined,
  isAuthenticated: false,
  isLoading: true,
  error: undefined,
  loginWithRedirect: async () => {
    throw new Error("AuthProvider not initialized");
  },
  loginDemo: async () => {
    throw new Error("AuthProvider not initialized");
  },
  logout: async () => {
    throw new Error("AuthProvider not initialized");
  },
  getAccessTokenSilently: async () => {
    throw new Error("AuthProvider not initialized");
  },
  getIdTokenClaims: async () => {
    throw new Error("AuthProvider not initialized");
  },
};

const AuthContext = createContext<AuthContextType>(defaultAuthContext);

interface AuthProviderProps {
  children: ReactNode;
}

export function Auth0Provider({ children }: AuthProviderProps) {
  return <AuthProvider>{children}</AuthProvider>;
}

function AuthProvider({ children }: AuthProviderProps) {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | undefined>(undefined);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | undefined>(undefined);

  // Check for existing authentication on load
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const storedAuth = localStorage.getItem('mock_auth_state');
        if (storedAuth) {
          const authData = JSON.parse(storedAuth);
          if (authData.isAuthenticated && authData.user) {
            setUser(authData.user);
            setIsAuthenticated(true);
            console.log("🔐 Restored auth state from localStorage");
          }
        }
      } catch (err) {
        console.error("🔐 Failed to restore auth state:", err);
        localStorage.removeItem('mock_auth_state');
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  // Log auth state changes
  useEffect(() => {
    console.log("🔐 Auth State:", {
      isAuthenticated,
      isLoading,
      user: user?.email,
      error: error?.message
    });
  }, [isAuthenticated, isLoading, user, error]);

  const loginWithRedirect = async () => {
    console.log("🔐 Mock Auth0 login initiated...");
    setIsLoading(true);
    setError(undefined);

    try {
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      const mockUser: User = {
        sub: "auth0|123456789",
        name: "John Doe (Demo)",
        given_name: "John",
        family_name: "Doe",
        nickname: "john.doe",
        email: "john.doe@demo.com",
        email_verified: true,
        picture: "https://gravatar.com/avatar/example",
        updated_at: new Date().toISOString(),
      };

      setUser(mockUser);
      setIsAuthenticated(true);
      
      // Store auth state
      localStorage.setItem('mock_auth_state', JSON.stringify({
        isAuthenticated: true,
        user: mockUser
      }));

      console.log("🔐 Mock Auth0 login successful");
      
      // Redirect to the stored path or default to dashboard
      const redirectPath = localStorage.getItem('auth_redirect_path') || '/dashboard';
      localStorage.removeItem('auth_redirect_path');
      navigate(redirectPath);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Login failed');
      setError(error);
      console.error("🔐 Mock Auth0 login failed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const loginDemo = loginWithRedirect; // Same as loginWithRedirect

  const logout = async (options?: any) => {
    console.log("🔐 Mock Auth0 logout initiated...");
    setIsAuthenticated(false);
    setUser(undefined);
    setError(undefined);
    localStorage.removeItem('mock_auth_state');
    
    const returnUrl = options?.logoutParams?.returnTo || "/login";
    console.log("🔐 Mock Auth0 logout complete, redirecting to:", returnUrl);
    navigate(returnUrl.replace(window.location.origin, ''));
  };

  const getAccessTokenSilently = async (): Promise<string> => {
    if (!isAuthenticated) {
      throw new Error("User is not authenticated");
    }
    return `mock_access_token_${Date.now()}`;
  };

  const getIdTokenClaims = async (): Promise<any> => {
    if (!isAuthenticated || !user) {
      throw new Error("User is not authenticated");
    }
    
    return {
      __raw: `mock_id_token_${Date.now()}`,
      name: user.name,
      given_name: user.given_name,
      family_name: user.family_name,
      nickname: user.nickname,
      email: user.email,
      email_verified: user.email_verified,
      picture: user.picture,
      updated_at: user.updated_at,
      sub: user.sub,
      aud: "demo_client_id",
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 3600,
    };
  };

  const contextValue: AuthContextType = {
    user,
    isAuthenticated,
    isLoading,
    error,
    loginWithRedirect,
    loginDemo,
    logout,
    getAccessTokenSilently,
    getIdTokenClaims,
  };

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  return context;
}

export function useAuthRedirect() {
  const { isAuthenticated, isLoading, loginWithRedirect } = useAuth();
  const [hasRedirected, setHasRedirected] = useState(false);

  useEffect(() => {
    if (!isLoading && !isAuthenticated && !hasRedirected) {
      setHasRedirected(true);
      loginWithRedirect();
    }
  }, [isLoading, isAuthenticated, loginWithRedirect, hasRedirected]);

  return { isRedirecting: !isAuthenticated && !isLoading };
}
