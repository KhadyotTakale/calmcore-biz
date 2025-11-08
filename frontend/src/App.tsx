import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import {
  ClerkProvider,
  SignedIn,
  SignedOut,
  RedirectToSignIn,
} from "@clerk/clerk-react";
import { BottomNav } from "@/components/BottomNav";
import { DesktopNav } from "@/components/DesktopNav";
import Home from "./pages/Home";
import Transactions from "./pages/Transactions";
import Invoices from "./pages/Invoices";
import Reports from "./pages/Reports";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";
import GenerateEstimate from "./pages/GenerateEstimate";
import GenerateInvoice from "./pages/GenerateInvoice";
import EstimatesList from "./pages/EstimatesList";
import ViewEstimate from "./pages/ViewEstimate";
import EstimatePreview from "./pages/EstimatePreview";
import Daybook from "./pages/Daybook";
import InvoicePreview from "./pages/InvoicePreview";
import CompanyInfo from "./pages/CompanyInfo";
import LandingPage from "./pages/LandingPage";
import Auth from "./pages/Auth";

const queryClient = new QueryClient();

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

if (!PUBLISHABLE_KEY) {
  throw new Error("Missing Publishable Key");
}

// Protected Route Wrapper
const ProtectedRoute = ({ children }) => {
  return (
    <>
      <SignedIn>{children}</SignedIn>
      <SignedOut>
        <RedirectToSignIn />
      </SignedOut>
    </>
  );
};

// Create a Layout component that conditionally shows navigation
const Layout = ({ children }) => {
  const location = useLocation();

  // Pages where navigation should be hidden
  const hideNavRoutes = ["/estimate-preview", "/invoice-preview", "/auth", "/"];
  const shouldHideNav = hideNavRoutes.includes(location.pathname);

  return (
    <>
      {!shouldHideNav && <DesktopNav />}
      {/* Desktop: Add left margin for sidebar. Mobile: Add top padding for hamburger header */}
      <div className={!shouldHideNav ? "pt-16 pb-6" : ""}>{children}</div>
      {!shouldHideNav && <BottomNav />}
    </>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <ClerkProvider
          publishableKey={PUBLISHABLE_KEY}
          afterSignInUrl="/home"
          afterSignUpUrl="/home"
        >
          <Layout>
            <Routes>
              {/* Public Routes - No authentication required */}
              <Route path="/" element={<LandingPage />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/estimate-preview" element={<EstimatePreview />} />
              <Route path="/invoice-preview" element={<InvoicePreview />} />

              {/* Protected Routes - Authentication required */}
              <Route
                path="/home"
                element={
                  <ProtectedRoute>
                    <Home />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/transactions"
                element={
                  <ProtectedRoute>
                    <Transactions />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/invoices"
                element={
                  <ProtectedRoute>
                    <Invoices />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/reports"
                element={
                  <ProtectedRoute>
                    <Reports />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/settings"
                element={
                  <ProtectedRoute>
                    <Settings />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/daybook"
                element={
                  <ProtectedRoute>
                    <Daybook />
                  </ProtectedRoute>
                }
              />

              {/* Protected Estimates Routes */}
              <Route
                path="/estimates"
                element={
                  <ProtectedRoute>
                    <EstimatesList />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/estimates/new"
                element={
                  <ProtectedRoute>
                    <GenerateEstimate />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/generate-estimate"
                element={
                  <ProtectedRoute>
                    <GenerateEstimate />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/estimate/:bookingId"
                element={
                  <ProtectedRoute>
                    <ViewEstimate />
                  </ProtectedRoute>
                }
              />

              {/* Protected Invoices Routes */}
              <Route
                path="/invoices/new"
                element={
                  <ProtectedRoute>
                    <GenerateInvoice />
                  </ProtectedRoute>
                }
              />

              {/* Protected Company Info */}
              <Route
                path="/company-info"
                element={
                  <ProtectedRoute>
                    <CompanyInfo />
                  </ProtectedRoute>
                }
              />

              {/* 404 Catch-All - MUST BE LAST */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Layout>
        </ClerkProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
