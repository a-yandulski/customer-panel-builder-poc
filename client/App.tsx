import "./global.css";

import { createRoot } from "react-dom/client";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ToastProvider } from "@/components/ui/toast";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useNavigate } from "react-router-dom";
import { Auth0Provider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import DashboardErrorBoundary from "@/components/dashboard/DashboardErrorBoundary";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Services from "./pages/Services";
import Billing from "./pages/Billing";
import Support from "./pages/Support";
import Account from "./pages/Account";
import NotFound from "./pages/NotFound";
import { setupMSW } from "./mocks/setup";
import { getBasePath } from "@/lib/config";

const queryClient = new QueryClient();

const AppRoutes = () => {
  const navigate = useNavigate();
  
  return (
    <Routes>
      <Route path="/" element={<Index />} />
      <Route path="/login" element={<Login />} />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardErrorBoundary>
              <Dashboard />
            </DashboardErrorBoundary>
          </ProtectedRoute>
        }
      />
      <Route
        path="/services"
        element={
          <ProtectedRoute>
            <Services />
          </ProtectedRoute>
        }
      />
      <Route
        path="/billing"
        element={
          <ProtectedRoute requiredScopes={["invoices:read"]}>
            <Billing />
          </ProtectedRoute>
        }
      />
      <Route
        path="/support"
        element={
          <ProtectedRoute
            requiredScopes={["tickets:read", "tickets:write"]}
          >
            <Support />
          </ProtectedRoute>
        }
      />
      <Route
        path="/account"
        element={
          <ProtectedRoute
            requiredScopes={["profile:read", "profile:write"]}
          >
            <Account />
          </ProtectedRoute>
        }
      />
      {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App = () => (
  <Auth0Provider>
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <TooltipProvider>
          <Sonner />
          <BrowserRouter basename={getBasePath()}>
            <AppRoutes />
          </BrowserRouter>
        </TooltipProvider>
      </ToastProvider>
    </QueryClientProvider>
  </Auth0Provider>
);

// Initialize MSW and render the app
const initializeApp = async () => {
  // Always try to setup MSW for demo purposes
  try {
    await setupMSW();
  } catch (error) {
    console.warn("MSW initialization failed, continuing without mocking:", error);
  }

  // Render the app regardless of MSW status
  const container = document.getElementById("root")!;
  let root = (container as any)._reactRoot;

  if (!root) {
    root = createRoot(container);
    (container as any)._reactRoot = root;
  }

  root.render(<App />);
};

// Start the app
initializeApp();
