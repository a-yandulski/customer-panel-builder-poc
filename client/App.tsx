import "./global.css";

import { createRoot } from "react-dom/client";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ToastProvider } from "@/components/ui/toast";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
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

const queryClient = new QueryClient();

const App = () => (
  <Auth0Provider>
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <TooltipProvider>
          <Sonner />
          <BrowserRouter>
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
          </BrowserRouter>
        </TooltipProvider>
      </ToastProvider>
    </QueryClientProvider>
  </Auth0Provider>
);

// Initialize MSW before rendering the app
setupMSW().then(() => {
  const container = document.getElementById("root")!;
  let root = (container as any)._reactRoot;

  if (!root) {
    root = createRoot(container);
    (container as any)._reactRoot = root;
  }

  root.render(<App />);
});
