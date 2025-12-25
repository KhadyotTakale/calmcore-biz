import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { queryKeys } from './useOptimizedQuery';
import { getBookings, getItems, getShopInfo } from '@/services/api';

/**
 * Prefetch common data to make navigation feel instant
 * This runs in the background after initial page load
 */
export const usePrefetchCommonData = () => {
    const queryClient = useQueryClient();

    useEffect(() => {
        // Wait 2 seconds after page load, then prefetch common data
        const timer = setTimeout(() => {
            // Prefetch bookings (for Transactions page)
            queryClient.prefetchQuery({
                queryKey: queryKeys.bookings(1, 10),
                queryFn: () => getBookings(1, 10),
                staleTime: 10 * 60 * 1000, // 10 minutes
            });

            // Prefetch items (for Manage Items page)
            queryClient.prefetchQuery({
                queryKey: queryKeys.items(),
                queryFn: () => getItems(),
                staleTime: 10 * 60 * 1000,
            });

            // Prefetch shop info (for Settings page)
            queryClient.prefetchQuery({
                queryKey: queryKeys.shopInfo(),
                queryFn: () => getShopInfo(),
                staleTime: 30 * 60 * 1000, // 30 minutes (rarely changes)
            });
        }, 2000); // Wait 2 seconds to not interfere with initial page load

        return () => clearTimeout(timer);
    }, [queryClient]);
};

/**
 * Prefetch a specific page's data on hover/focus
 * Use this on navigation links for instant page loads
 */
export const usePrefetchOnHover = (
    queryKey: readonly unknown[],
    queryFn: () => Promise<any>
) => {
    const queryClient = useQueryClient();

    const prefetch = () => {
        queryClient.prefetchQuery({
            queryKey,
            queryFn,
            staleTime: 10 * 60 * 1000,
        });
    };

    return { onMouseEnter: prefetch, onFocus: prefetch };
};
