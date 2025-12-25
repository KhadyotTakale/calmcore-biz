import { QueryClient } from "@tanstack/react-query";

export const createOptimizedQueryClient = () => {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // Cache data for 10 minutes (was 5 minutes)
        staleTime: 10 * 60 * 1000,
        // Keep unused data for 30 minutes (was 10 minutes)
        gcTime: 30 * 60 * 1000,
        // Only retry once on failure
        retry: 1,
        // Don't refetch on window focus (saves bandwidth)
        refetchOnWindowFocus: false,
        // Don't refetch on reconnect (use cached data)
        refetchOnReconnect: false,
        // Enable network-based cache optimization
        networkMode: 'online',
      },
      mutations: {
        // Retry mutations once
        retry: 1,
      },
    },
  });
};

export const queryKeys = {
  bookings: (page?: number, limit?: number) =>
    ["bookings", page, limit].filter(Boolean),
  booking: (id: string) => ["booking", id],
  items: () => ["items"],
  item: (id: string) => ["item", id],
  customers: () => ["customers"],
  customer: (id: string) => ["customer", id],
  reports: (type: string, dateRange?: [Date, Date]) => [
    "reports",
    type,
    dateRange,
  ],
  daybook: (date: Date) => ["daybook", date.toISOString()],
  shopInfo: () => ["shopInfo"],
  invoices: (page?: number, limit?: number) =>
    ["invoices", page, limit].filter(Boolean),
} as const;
