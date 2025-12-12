import { useEffect, useRef, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useUser } from "@clerk/clerk-react";
import { authManager, initializeCustomer } from "@/services/api";
import { logger } from "@/services/logger";

/**
 * Custom hook to handle user authentication initialization
 * - Initializes customer on first load
 * - Checks if user has their own shop
 * - Handles redirects based on auth state
 *
 * @returns {Object} Auth state with isInitializing and hasOwnShop flags
 */
export const useAuthInitialization = () => {
  const { user, isLoaded } = useUser();
  const navigate = useNavigate();
  const location = useLocation();

  const hasInitializedRef = useRef(false);
  const isInitializingRef = useRef(false);
  const [hasOwnShop, setHasOwnShop] = useState<boolean | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);

  // Initialize auth only once when user is loaded
  useEffect(() => {
    if (
      !isLoaded ||
      !user ||
      hasInitializedRef.current ||
      isInitializingRef.current
    ) {
      return;
    }

    const initializeAuth = async () => {
      isInitializingRef.current = true;
      setIsInitializing(true);

      authManager.setClerkUserId(user.id);

      const existingToken = authManager.getCustomerAuthToken();
      const shopId = localStorage.getItem("shopId");

      // Determine if this is likely a sign-up attempt based on current path or state
      // We check for 'action=signup' which is set by the Clerk SignUp component's afterSignUpUrl
      const isSignUpAttempt = location.search.includes("action=signup");

      try {
        const data = await initializeCustomer(
          user.id,
          user.primaryEmailAddress?.emailAddress || "",
          user.fullName || "",
          isSignUpAttempt // Pass true only if we are in the Sign Up flow
        );

        if (data.hasOwnShop) {
          setHasOwnShop(true);

          const apiShopId = data.customer?._shops?.id;
          if (apiShopId && apiShopId !== shopId) {
            localStorage.setItem("shopId", apiShopId);
          }
        } else {
          setHasOwnShop(false);
          localStorage.removeItem("shopId");
        }

        hasInitializedRef.current = true;
      } catch (error: any) {
        logger.error("[Auth] Init failed", error);
        authManager.clearToken();
        localStorage.removeItem("shopId");
        setHasOwnShop(null);

        // Strict handling for User Not Found
        if (error.message === "USER_NOT_FOUND") {
          // Stop infinite loop!
          // Redirect to auth page with a query param or state to show "Sign Up" mode
          // We use window.location to force a full clean state if needed, or navigate
          navigate("/auth?mode=signup", { replace: true });
          return;
        }
      } finally {
        isInitializingRef.current = false;
        setIsInitializing(false);
      }
    };

    initializeAuth();
  }, [user?.id, isLoaded, user]);

  // Handle redirects based on auth state
  useEffect(() => {
    if (isInitializing || !hasInitializedRef.current) return;

    const path = location.pathname;
    const publicPaths = ["/", "/auth", "/estimate-preview", "/invoice-preview"];
    const isPublicPath = publicPaths.includes(path);

    // Paths that users with shops should always be able to access
    const allowedWithShopPaths = [
      "/company-info", // ✅ FIXED: Allow viewing company info
      "/settings",
      "/profile",
      "/manage-items",
    ];

    // User has shop - redirect from public pages to home
    if (hasOwnShop && (path === "/" || path === "/auth")) {
      navigate("/home", { replace: true });
    }
    // ✅ REMOVED: No longer redirect users with shops away from company-info
    // Users with shops can now view/edit their company info

    // User has no shop - redirect to company-info (except public paths)
    else if (
      hasOwnShop === false &&
      !isPublicPath &&
      path !== "/company-info"
    ) {
      navigate("/company-info", { replace: true });
    }
  }, [isInitializing, hasOwnShop, location.pathname, navigate]);

  return { isInitializing, hasOwnShop };
};
