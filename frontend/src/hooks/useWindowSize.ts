import { useState, useEffect } from "react";

interface WindowSize {
  width: number;
  height: number;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
}

/**
 * Custom hook to track window size and responsive breakpoints
 * Debounced to prevent excessive re-renders during window resize
 *
 * @returns {WindowSize} Current window dimensions and breakpoint flags
 *
 * @example
 * const { width, isMobile } = useWindowSize();
 * if (isMobile) {
 *   return <MobileView />;
 * }
 */
export function useWindowSize(): WindowSize {
  const [windowSize, setWindowSize] = useState<WindowSize>(() => ({
    width: typeof window !== "undefined" ? window.innerWidth : 0,
    height: typeof window !== "undefined" ? window.innerHeight : 0,
    isMobile: typeof window !== "undefined" ? window.innerWidth < 768 : false,
    isTablet:
      typeof window !== "undefined"
        ? window.innerWidth >= 768 && window.innerWidth < 1024
        : false,
    isDesktop:
      typeof window !== "undefined" ? window.innerWidth >= 1024 : false,
  }));

  useEffect(() => {
    if (typeof window === "undefined") return;

    let timeoutId: NodeJS.Timeout;

    const handleResize = () => {
      // Debounce resize events
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        const width = window.innerWidth;
        const height = window.innerHeight;

        setWindowSize({
          width,
          height,
          isMobile: width < 768,
          isTablet: width >= 768 && width < 1024,
          isDesktop: width >= 1024,
        });
      }, 150); // 150ms debounce
    };

    window.addEventListener("resize", handleResize);

    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return windowSize;
}

/**
 * Simpler hook that just returns if device is mobile
 * Use this for most cases where you only need mobile detection
 */
export function useIsMobile(): boolean {
  const { isMobile } = useWindowSize();
  return isMobile;
}
