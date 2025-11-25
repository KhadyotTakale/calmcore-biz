import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  BrowserRouter,
  Routes,
  Route,
  useLocation,
  useNavigate,
} from "react-router-dom";
import {
  ClerkProvider,
  SignedIn,
  SignedOut,
  RedirectToSignIn,
  useUser,
} from "@clerk/clerk-react";
import { useEffect, useRef, useState, createContext, useContext } from "react";
import { BottomNav } from "@/components/BottomNav";
import { DesktopNav } from "@/components/DesktopNav";
import { authManager, initializeCustomer } from "@/services/api";
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
import Profile from "./pages/Profile";

const queryClient = new QueryClient();

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

if (!PUBLISHABLE_KEY) {
  throw new Error("Missing Publishable Key");
}

// Create a context to share auth state across the app
const AuthContext = createContext<{
  isInitializing: boolean;
  hasOwnShop: boolean | null;
}>({
  isInitializing: true,
  hasOwnShop: null,
});

export const useAuthState = () => useContext(AuthContext);

// Auth State Manager - Handles token initialization and shop check
const AuthStateManager = ({ children }: { children: React.ReactNode }) => {
  const { user, isLoaded } = useUser();
  const navigate = useNavigate();
  const location = useLocation();

  // Use refs to track initialization state without causing re-renders
  const hasInitializedRef = useRef(false);
  const isInitializingRef = useRef(false);
  const [hasOwnShop, setHasOwnShop] = useState<boolean | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    // Only run once when user is loaded and not already initialized/initializing
    if (
      !isLoaded ||
      !user ||
      hasInitializedRef.current ||
      isInitializingRef.current
    ) {
      return;
    }

    const initializeAuth = async () => {
      // Mark as initializing immediately to prevent duplicate runs
      isInitializingRef.current = true;
      setIsInitializing(true);

      console.log("[App] 🚀 Starting auth initialization for user:", user.id);

      // Set clerk user ID (this also triggers token restoration from localStorage)
      authManager.setClerkUserId(user.id);

      // CRITICAL: Don't trust localStorage blindly - always verify with API
      const existingToken = authManager.getCustomerAuthToken();
      const shopId = localStorage.getItem("shopId");

      console.log("[App] 🔍 Checking auth state:", {
        hasToken: !!existingToken,
        hasShopId: !!shopId,
        tokenPreview: existingToken?.substring(0, 20) + "...",
      });

      // ALWAYS verify token with API - don't trust localStorage
      console.log("[App] 🔄 Verifying token and shop ownership with API");

      try {
        const data = await initializeCustomer(
          user.id,
          user.primaryEmailAddress?.emailAddress || "",
          user.fullName || ""
        );

        console.log("[App] ✅ Customer initialized");
        console.log("[App] Has own shop:", data.hasOwnShop);
        console.log(
          "[App] Auth token:",
          data.authToken === "" ? "EMPTY (no shop)" : "EXISTS (has shop)"
        );

        // CRITICAL: Use hasOwnShop flag to determine if user has their own shop
        if (data.hasOwnShop) {
          // User has their own shop with proper token
          console.log("[App] ✅ User has own shop with valid token");
          setHasOwnShop(true);

          // Verify shop ID matches
          const apiShopId = data.customer?._shops?.id;
          if (apiShopId && apiShopId !== shopId) {
            console.log("[App] 🔄 Updating shop ID:", apiShopId);
            localStorage.setItem("shopId", apiShopId);
          }

          // If user is on company-info page but has shop, redirect to home
          if (location.pathname === "/company-info") {
            console.log(
              "[App] User has shop but on /company-info, redirecting to /home"
            );
            navigate("/home", { replace: true });
          }
        } else {
          // User doesn't have their own shop - must create one first
          console.log("[App] ⚠️  User doesn't have own shop");
          console.log(
            "[App] Clearing stale shop ID and ensuring on /company-info"
          );
          setHasOwnShop(false);

          // Clear any stale shop ID
          localStorage.removeItem("shopId");

          // Redirect to company-info if not already there
          if (location.pathname !== "/company-info") {
            console.log("[App] Redirecting to /company-info");
            navigate("/company-info", { replace: true });
          }
        }

        hasInitializedRef.current = true;
        isInitializingRef.current = false;
        setIsInitializing(false);
      } catch (error) {
        console.error("[App] ❌ Failed to initialize customer:", error);

        // Clear any stale data on error
        authManager.clearToken();
        localStorage.removeItem("shopId");

        // Reset the refs so user can try again
        hasInitializedRef.current = false;
        isInitializingRef.current = false;
        setHasOwnShop(null);
        setIsInitializing(false);
      }
    };

    initializeAuth();
  }, [user?.id, isLoaded, location.pathname, navigate]);

  // Block access to protected pages if user doesn't have their own shop
  useEffect(() => {
    if (
      !isInitializing &&
      hasOwnShop === false &&
      location.pathname !== "/company-info"
    ) {
      console.log(
        "[App] 🚫 Blocking access to",
        location.pathname,
        "- user has no shop"
      );
      navigate("/company-info", { replace: true });
    }
  }, [isInitializing, hasOwnShop, location.pathname, navigate]);

  return (
    <AuthContext.Provider value={{ isInitializing, hasOwnShop }}>
      {children}
    </AuthContext.Provider>
  );
};

// Protected Route Wrapper - Shows loading while auth initializes
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isInitializing } = useAuthState();

  return (
    <>
      <SignedIn>
        {isInitializing ? (
          <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-blue-50">
            <div className="text-center">
              <div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-600 border-t-transparent mx-auto mb-4" />
              <p className="text-gray-600 font-medium">Initializing...</p>
            </div>
          </div>
        ) : (
          children
        )}
      </SignedIn>
      <SignedOut>
        <RedirectToSignIn />
      </SignedOut>
    </>
  );
};

// Create a Layout component that conditionally shows navigation
const Layout = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();

  // Pages where navigation should be hidden
  const hideNavRoutes = [
    "/estimate-preview",
    "/invoice-preview",
    "/auth",
    "/",
    "/company-info", // Hide nav on company-info page too
  ];
  const shouldHideNav = hideNavRoutes.includes(location.pathname);

  return (
    <>
      <AuthStateManager>
        {!shouldHideNav && <DesktopNav />}
        {/* Desktop: Add left margin for sidebar. Mobile: Add top padding for hamburger header */}
        <div className={!shouldHideNav ? "pt-16 pb-6" : ""}>{children}</div>
        {!shouldHideNav && <BottomNav />}
      </AuthStateManager>
    </>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <ClerkProvider publishableKey={PUBLISHABLE_KEY}>
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
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <Profile />
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
