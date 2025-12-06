import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import {
  ClerkProvider,
  SignedIn,
  SignedOut,
  RedirectToSignIn,
} from "@clerk/clerk-react";
import {
  lazy,
  Suspense,
  createContext,
  useContext,
  memo,
  useMemo,
} from "react";
import { BottomNav } from "@/components/BottomNav";
import { DesktopNav } from "@/components/DesktopNav";

// Custom Hooks
import {
  useAuthInitialization,
  useNavVisibility,
  createOptimizedQueryClient,
} from "@/hooks";

// ============================================================================
// LAZY LOADED PAGES - Loads only when needed
// ============================================================================

// Critical pages - Load immediately
import LandingPage from "./pages/LandingPage";
import Auth from "./pages/Auth";

// Heavy pages - Load on demand (lazy)
const Home = lazy(() => import("./pages/Home"));
const Transactions = lazy(() => import("./pages/Transactions"));
const Invoices = lazy(() => import("./pages/Invoices"));
const Reports = lazy(() => import("./pages/Reports"));
const Settings = lazy(() => import("./pages/Settings"));
const Daybook = lazy(() => import("./pages/Daybook"));
const GenerateEstimate = lazy(() => import("./pages/GenerateEstimate"));
const GenerateInvoice = lazy(() => import("./pages/GenerateInvoice"));
const EstimatesList = lazy(() => import("./pages/EstimatesList"));
const ViewEstimate = lazy(() => import("./pages/ViewEstimate"));
const EstimatePreview = lazy(() => import("./pages/EstimatePreview"));
const InvoicePreview = lazy(() => import("./pages/InvoicePreview"));
const CompanyInfo = lazy(() => import("./pages/CompanyInfo"));
const Profile = lazy(() => import("./pages/Profile"));
const ManageItems = lazy(() => import("./pages/ManageItems"));
const NotFound = lazy(() => import("./pages/NotFound"));

// ============================================================================
// LOADING COMPONENTS
// ============================================================================

const FullPageLoader = memo(() => (
  <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-blue-50">
    <div className="text-center">
      <div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-600 border-t-transparent mx-auto mb-4" />
      <p className="text-gray-600 font-medium">Loading...</p>
    </div>
  </div>
));

FullPageLoader.displayName = "FullPageLoader";

const InitializingLoader = memo(() => (
  <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-blue-50">
    <div className="text-center">
      <div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-600 border-t-transparent mx-auto mb-4" />
      <p className="text-gray-600 font-medium">Initializing...</p>
    </div>
  </div>
));

InitializingLoader.displayName = "InitializingLoader";

// ============================================================================
// QUERY CLIENT - Optimized configuration
// ============================================================================

const queryClient = createOptimizedQueryClient();

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

if (!PUBLISHABLE_KEY) {
  throw new Error("Missing Publishable Key");
}

// ============================================================================
// AUTH CONTEXT - Lightweight state management
// ============================================================================

interface AuthState {
  isInitializing: boolean;
  hasOwnShop: boolean | null;
}

const AuthContext = createContext<AuthState>({
  isInitializing: true,
  hasOwnShop: null,
});

export const useAuthState = () => useContext(AuthContext);

// ============================================================================
// AUTH STATE MANAGER - Memoized Component
// ============================================================================

const AuthStateManager = memo(({ children }: { children: React.ReactNode }) => {
  const authState = useAuthInitialization();

  const contextValue = useMemo(
    () => ({
      isInitializing: authState.isInitializing,
      hasOwnShop: authState.hasOwnShop,
    }),
    [authState.isInitializing, authState.hasOwnShop]
  );

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
});

AuthStateManager.displayName = "AuthStateManager";

// ============================================================================
// PROTECTED ROUTE - Memoized Component
// ============================================================================

const ProtectedRoute = memo(({ children }: { children: React.ReactNode }) => {
  const { isInitializing } = useAuthState();

  return (
    <>
      <SignedIn>{isInitializing ? <InitializingLoader /> : children}</SignedIn>
      <SignedOut>
        <RedirectToSignIn />
      </SignedOut>
    </>
  );
});

ProtectedRoute.displayName = "ProtectedRoute";

// ============================================================================
// LAYOUT - Memoized with optimized nav visibility check
// ============================================================================

const Layout = memo(({ children }: { children: React.ReactNode }) => {
  const shouldHideNav = useNavVisibility();

  return (
    <AuthStateManager>
      {!shouldHideNav && <DesktopNav />}
      <div className={!shouldHideNav ? "pt-16 pb-6" : ""}>{children}</div>
      {!shouldHideNav && <BottomNav />}
    </AuthStateManager>
  );
});

Layout.displayName = "Layout";

// ============================================================================
// ROUTER COMPONENT - Separated for better code splitting
// ============================================================================

const AppRoutes = memo(() => {
  return (
    <Suspense fallback={<FullPageLoader />}>
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
          path="/estimates"
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

        {/* Protected Company & Settings */}
        <Route
          path="/company-info"
          element={
            <ProtectedRoute>
              <CompanyInfo />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/manage-items"
          element={
            <ProtectedRoute>
              <ManageItems />
            </ProtectedRoute>
          }
        />

        {/* 404 Catch-All */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
});

AppRoutes.displayName = "AppRoutes";

// ============================================================================
// MAIN APP COMPONENT
// ============================================================================

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <ClerkProvider publishableKey={PUBLISHABLE_KEY}>
          <Layout>
            <AppRoutes />
          </Layout>
        </ClerkProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
