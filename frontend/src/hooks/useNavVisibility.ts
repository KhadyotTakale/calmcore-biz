import { useMemo } from "react";
import { useLocation } from "react-router-dom";

/**
 * Routes where navigation should be hidden
 */
const HIDE_NAV_ROUTES = [
  "/estimate-preview",
  "/invoice-preview",
  "/auth",
  "/",
  "/company-info",
];

/**
 * Custom hook to determine if navigation should be visible
 * Memoized for performance - only recalculates when pathname changes
 *
 * @returns {boolean} True if navigation should be hidden
 */
export const useNavVisibility = () => {
  const location = useLocation();

  const shouldHideNav = useMemo(
    () => HIDE_NAV_ROUTES.includes(location.pathname),
    [location.pathname]
  );

  return shouldHideNav;
};
