import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { useAuth0, Auth0Provider as Auth0ProviderBase, Auth0ProviderOptions } from "@auth0/auth0-react";
import { User } from "@auth0/auth0-spa-js";

interface AuthContextType {
  user: User | undefined;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: Error | undefined;
  loginWithRedirect: () => Promise<void>;
  logout: (options?: any) => Promise<void>;
  getAccessTokenSilently: () => Promise<string>;
  getIdTokenClaims: () => Promise<any>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Auth0 configuration
const auth0Config: Auth0ProviderOptions = {
  domain: import.meta.env.VITE_AUTH0_DOMAIN || "dev-customer-panel.auth0.com",
  clientId: import.meta.env.VITE_AUTH0_CLIENT_ID || "your_client_id_here",
  authorizationParams: {
    redirect_uri: window.location.origin,
    audience: import.meta.env.VITE_AUTH0_AUDIENCE || "https://api.customerpanel.example.com",
    scope: "openid profile email profile:read profile:write domains:read domains:write invoices:read tickets:read tickets:write notifications:read"
  },
  cacheLocation: "localstorage" as const,
  useRefreshTokens: true,
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
  const [isInitialized, setIsInitialized] = useState(false);
  const [fakeUser, setFakeUser] = useState<any>(null);
  const [fakeAuthLoading, setFakeAuthLoading] = useState(true);

  // Check for fake authentication on mount
  useEffect(() => {
    const checkFakeAuth = () => {
      const storedUser = localStorage.getItem('fake_auth_user');
      const storedToken = localStorage.getItem('fake_auth_token');

      if (storedUser && storedToken) {
        try {
          setFakeUser(JSON.parse(storedUser));
        } catch (error) {
          localStorage.removeItem('fake_auth_user');
          localStorage.removeItem('fake_auth_token');
        }
      }
      setFakeAuthLoading(false);
    };

    checkFakeAuth();
  }, []);

  useEffect(() => {
    if (!auth0.isLoading && !fakeAuthLoading) {
      setIsInitialized(true);
    }
  }, [auth0.isLoading, fakeAuthLoading]);

  const fakeLogout = () => {
    localStorage.removeItem('fake_auth_user');
    localStorage.removeItem('fake_auth_token');
    setFakeUser(null);
    window.location.href = '/login';
  };

  const fakeGetAccessToken = async () => {
    const token = localStorage.getItem('fake_auth_token');
    if (!token) throw new Error('No fake token available');
    return token;
  };

  const fakeGetIdTokenClaims = async () => {
    return fakeUser;
  };

  // Use fake auth if fake user exists, otherwise use Auth0
  const isUsingFakeAuth = !!fakeUser;

  const contextValue: AuthContextType = {
    user: isUsingFakeAuth ? fakeUser : auth0.user,
    isAuthenticated: isUsingFakeAuth ? !!fakeUser : auth0.isAuthenticated,
    isLoading: (auth0.isLoading || fakeAuthLoading) && !isInitialized,
    error: auth0.error,
    loginWithRedirect: auth0.loginWithRedirect,
    logout: isUsingFakeAuth ? fakeLogout : auth0.logout,
    getAccessTokenSilently: isUsingFakeAuth ? fakeGetAccessToken : auth0.getAccessTokenSilently,
    getIdTokenClaims: isUsingFakeAuth ? fakeGetIdTokenClaims : auth0.getIdTokenClaims,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
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
