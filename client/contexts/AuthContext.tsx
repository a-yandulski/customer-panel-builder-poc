import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { useAuth0, Auth0Provider as Auth0ProviderBase, Auth0ProviderOptions } from "@auth0/auth0-react";
import { User } from "@auth0/auth0-spa-js";

interface AuthContextType {
  user: User | undefined;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: Error | undefined;
  loginWithRedirect: () => Promise<void>;
  logout: (options?: { returnTo?: string }) => void;
  getAccessTokenSilently: () => Promise<string>;
  getIdTokenClaims: () => Promise<any>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Auth0 configuration
const auth0Config: Auth0ProviderOptions = {
  domain: process.env.VITE_AUTH0_DOMAIN || "dev-customer-panel.auth0.com",
  clientId: process.env.VITE_AUTH0_CLIENT_ID || "your_client_id_here",
  authorizationParams: {
    redirect_uri: window.location.origin,
    audience: process.env.VITE_AUTH0_AUDIENCE || "https://api.customerpanel.example.com",
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

  useEffect(() => {
    if (!auth0.isLoading) {
      setIsInitialized(true);
    }
  }, [auth0.isLoading]);

  const contextValue: AuthContextType = {
    user: auth0.user,
    isAuthenticated: auth0.isAuthenticated,
    isLoading: auth0.isLoading || !isInitialized,
    error: auth0.error,
    loginWithRedirect: auth0.loginWithRedirect,
    logout: auth0.logout,
    getAccessTokenSilently: auth0.getAccessTokenSilently,
    getIdTokenClaims: auth0.getIdTokenClaims,
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
