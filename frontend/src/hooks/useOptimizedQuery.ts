import { QueryClient } from "@tanstack/react-query";

export const createOptimizedQueryClient = () => {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 5 * 60 * 1000,
        gcTime: 10 * 60 * 1000,
        retry: 1,
        refetchOnWindowFocus: false,
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
} as const;
