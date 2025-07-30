import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import {
  useAuth0,
  Auth0Provider as Auth0ProviderBase,
  Auth0ProviderOptions,
} from "@auth0/auth0-react";
import { User } from "@auth0/auth0-spa-js";
import { getFullUrl } from "@/lib/config";

interface AuthContextType {
  user: User | undefined;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: Error | undefined;
  loginWithRedirect: () => Promise<void>;
  loginDemo: () => Promise<void>; // Add demo login method
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

// Auth0 configuration
const getRedirectUri = () => {
  return getFullUrl();
};

const auth0Config: Auth0ProviderOptions = {
  domain: import.meta.env.VITE_AUTH0_DOMAIN || "dev-customer-panel.auth0.com",
  clientId: import.meta.env.VITE_AUTH0_CLIENT_ID || "demo_client_id",
  authorizationParams: {
    redirect_uri: getFullUrl(),
    audience:
      import.meta.env.VITE_AUTH0_AUDIENCE ||
      "https://api.customerpanel.example.com",
    scope:
      "openid profile email profile:read profile:write domains:read domains:write invoices:read tickets:read tickets:write notifications:read",
  },
  cacheLocation: "localstorage" as const,
  useRefreshTokens: true,
  // Skip Auth0's initialization in demo mode to avoid real Auth0 calls
  skipRedirectCallback: false,
};

interface AuthProviderProps {
  children: ReactNode;
}

export function Auth0Provider({ children }: AuthProviderProps) {
  return (
    <Auth0ProviderBase {...auth0Config}>
      <AuthProvider>{children}</AuthProvider>
    </Auth0ProviderBase>
  );
}

function AuthProvider({ children }: AuthProviderProps) {
  const auth0 = useAuth0();
  const [demoUser, setDemoUser] = useState<User | null>(null);
  const [isDemoMode, setIsDemoMode] = useState(false);

  // Demo login function
  const loginDemo = async () => {
    console.log("🔐 Demo login initiated...");
    
    const mockUser: User = {
      sub: "demo|123456789",
      name: "John Doe",
      given_name: "John",
      family_name: "Doe",
      email: "john.doe@example.com",
      email_verified: true,
      picture: "https://ui-avatars.com/api/?name=John+Doe&background=035BFF&color=fff",
      updated_at: new Date().toISOString(),
    };

    // Simulate async login
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setDemoUser(mockUser);
    setIsDemoMode(true);
    console.log("🔐 Demo login successful:", mockUser.email);
  };

  const demoLogout = async () => {
    setDemoUser(null);
    setIsDemoMode(false);
    console.log("🔐 Demo logout successful");
  };

  const isUsingDemo = isDemoMode && demoUser;
  const currentUser = isUsingDemo ? demoUser : auth0.user;
  const currentIsAuthenticated = isUsingDemo ? !!demoUser : auth0.isAuthenticated;
  const currentIsLoading = isUsingDemo ? false : auth0.isLoading;

  console.log("🔐 Auth State:", {
    isDemoMode,
    demoUser: demoUser?.email,
    isAuthenticated: currentIsAuthenticated,
    isLoading: currentIsLoading,
    user: currentUser?.email,
    error: auth0.error
  });

  const contextValue: AuthContextType = {
    user: currentUser,
    isAuthenticated: currentIsAuthenticated,
    isLoading: currentIsLoading,
    error: auth0.error,
    loginWithRedirect: auth0.loginWithRedirect,
    loginDemo,
    logout: isUsingDemo ? demoLogout : auth0.logout,
    getAccessTokenSilently: async () => {
      if (isUsingDemo) {
        return "demo_access_token_" + Date.now();
      }
      return auth0.getAccessTokenSilently();
    },
    getIdTokenClaims: async () => {
      if (isUsingDemo) {
        return demoUser;
      }
      return auth0.getIdTokenClaims();
    },
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
