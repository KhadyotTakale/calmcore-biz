/**
 * Custom Hooks Index
 * Barrel export for all custom hooks - import from single location
 *
 * @example
 * import { useAuthInitialization, useDebounce, usePDFGenerator } from '@/hooks';
 */

// Existing hooks
export { usePDFGenerator } from "./usePDFGenerator";
export { useDebounce } from "./useDebounce";

// New performance & utility hooks
export { useAuthInitialization } from "./useAuthInitialization";
export { useNavVisibility } from "./useNavVisibility";
export { createOptimizedQueryClient, queryKeys } from "./useOptimizedQuery";
export { useLocalStorage, useShopId } from "./useLocalStorage";
export { useWindowSize, useIsMobile } from "./useWindowSize";
