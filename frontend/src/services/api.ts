// api.ts - Centralized API service layer with authentication
// Base configuration
// Load environment variables (Vite style)
const BASE_URL = import.meta.env.VITE_XANO_BASE_URL!;
const ITEMS_BOOKINGS_URL = import.meta.env.VITE_XANO_ITEMS_BOOKINGS_URL!;

const BASE_HEADERS = {
  "X-Elegant-Domain": import.meta.env.VITE_ELEGANT_DOMAIN!,
  "X-Elegant-Auth": import.meta.env.VITE_ELEGANT_AUTH!,
  "Content-Type": "application/json",
} as const;

// ============================================================================
// AUTHENTICATION MANAGER
// ============================================================================

class AuthManager {
  private token: string | null = null;
  private tokenExpiry: number = 0;
  private initPromise: Promise<void> | null = null;

  async getToken(): Promise<string> {
    if (this.token && Date.now() < this.tokenExpiry) {
      return this.token;
    }
    await this.refreshToken();
    return this.token!;
  }

  private async refreshToken(): Promise<void> {
    try {
      const response = await fetch(`${BASE_URL}/auth/me`, {
        headers: BASE_HEADERS,
      });

      if (!response.ok) {
        throw new Error(
          `Auth failed: ${response.status} ${response.statusText}`
        );
      }

      const data = await response.json();
      this.token = data.authToken || data.token || data.auth_token;

      if (!this.token) {
        console.error("[Auth] Response:", data);
        throw new Error("No token in auth response");
      }

      // Token valid for 1 hour
      this.tokenExpiry = Date.now() + 60 * 60 * 1000;
    } catch (error) {
      console.error("[Auth] Failed to get token:", error);
      throw error;
    }
  }

  async initialize(): Promise<void> {
    if (this.initPromise) {
      return this.initPromise;
    }

    this.initPromise = this.refreshToken().then(() => {});

    return this.initPromise;
  }

  clearToken(): void {
    this.token = null;
    this.tokenExpiry = 0;
    this.initPromise = null;
  }
}

const authManager = new AuthManager();

// ============================================================================
// TYPES
// ============================================================================

export interface Item {
  id: number;
  slug: string;
  shops_id: string;
  item_type: string;
  Is_disabled: boolean;
  created_at: number;
  title: string;
  description: string;
  SEO_Tags: string;
  tags: string;
  price: number;
  unit: string;
  currency: string;
  sku: string;
  item_info: any;
  rank: number;
  _item_images_of_items?: {
    items: Array<{
      id: number;
      display_image: string;
      seq: number;
    }>;
  };
}

export interface BookingItem {
  id: number;
  created_at: number;
  bookings_id: number;
  items_id: number;
  _items?: Item;
}

export interface Customer {
  id: string;
  created_at: number;
  elegant_user_id: string;
  Full_name: string;
  email: string;
  cust_info?: any;
  customer_number: number;
}

export interface Booking {
  id: number;
  created_at: number;
  customers_id: string | null;
  booking_slug: string;
  shops_id: string;
  customer_invite_id: number | null;
  _booking_items_of_bookings?: {
    items: BookingItem[];
    itemsReceived: number;
    curPage: number;
    nextPage: number | null;
    prevPage: number | null;
  };
  _customers?: Customer;
}

export interface PaginatedResponse<T> {
  items: T[];
  itemsReceived: number;
  curPage: number;
  nextPage: number | null;
  prevPage: number | null;
  offset: number;
  perPage: number;
  itemsTotal?: number;
  pageTotal?: number;
}

export interface CreateBookingResponse {
  id: number;
  created_at: number;
  customers_id: string | null;
  booking_slug: string;
  shops_id: string;
  customer_invite_id: number | null;
}

export interface AddBookingItemResponse {
  id: number;
  created_at: number;
  bookings_id: number;
  items_id: number;
}

export interface Shop {
  id: string;
  created_at: number;
  name: string;
  description: string;
  logo: string;
  custom_domain: string;
  Is_visible: boolean;
  slug: string;
  allow_affiliate: boolean;
  testmode: boolean;
}

export interface CreateShopRequest {
  name: string;
  description: string;
  logo: string;
  custom_domain: string;
  Is_visible: number; // 0 or 1
  slug: string;
}

export interface UpdateShopRequest {
  name?: string;
  description?: string;
  logo?: string;
  custom_domain?: string;
  Is_visible?: number; // 0 or 1
  slug?: string;
}

// ============================================================================
// ERROR HANDLING
// ============================================================================

export class ApiError extends Error {
  constructor(
    public status: number,
    public statusText: string,
    message: string
  ) {
    super(message);
    this.name = "ApiError";
  }
}

// ============================================================================
// CORE FETCH WRAPPER
// ============================================================================

async function apiFetch<T>(
  endpoint: string,
  options: RequestInit = {},
  useItemsBookingsUrl: boolean = false
): Promise<T> {
  const baseUrl = useItemsBookingsUrl ? ITEMS_BOOKINGS_URL : BASE_URL;
  const token = await authManager.getToken();
  const fullUrl = `${baseUrl}${endpoint}`;

  try {
    const response = await fetch(fullUrl, {
      ...options,
      headers: {
        ...BASE_HEADERS,
        Authorization: `Bearer ${token}`,
        ...options.headers,
      },
    });

    const responseText = await response.text();

    // Check if response is HTML (error page)
    if (
      responseText.trim().startsWith("<!DOCTYPE") ||
      responseText.trim().startsWith("<html")
    ) {
      console.error(
        "[API] Received HTML instead of JSON:",
        responseText.substring(0, 200)
      );
      throw new Error(
        `API endpoint ${endpoint} returned HTML instead of JSON. ` +
          `Check if: 1) Backend is running, 2) Endpoint path is correct, 3) CORS is configured`
      );
    }

    if (!response.ok) {
      let errorMessage = `${response.statusText}`;
      try {
        const errorData = JSON.parse(responseText);
        errorMessage = errorData.message || errorData.error || errorMessage;
      } catch {
        // Use default error message
      }

      // If unauthorized, try refreshing token once
      if (response.status === 401) {
        console.warn("[API] 401 Unauthorized - Token may be expired");
        authManager.clearToken();
        await authManager.initialize();
      }

      throw new ApiError(response.status, response.statusText, errorMessage);
    }

    // Parse JSON
    try {
      return JSON.parse(responseText);
    } catch (parseError) {
      console.error("[API] JSON parse error:", parseError);
      console.error("[API] Response text:", responseText);
      throw new Error(`Invalid JSON response from ${endpoint}`);
    }
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }

    // Network error
    if (error instanceof TypeError && error.message.includes("fetch")) {
      throw new Error(
        `Cannot connect to API at ${baseUrl}. ` +
          `Please check: 1) Backend is running, 2) URL is correct, 3) CORS is enabled`
      );
    }

    throw error;
  }
}

// ============================================================================
// ITEMS API - Uses ITEMS_BOOKINGS_URL
// ============================================================================

export async function getAllItems(): Promise<PaginatedResponse<Item>> {
  return apiFetch<PaginatedResponse<Item>>(
    "/items_all?item_type=Product", // Capital P to match your data
    {},
    true
  );
}

export async function searchItems(
  search: string,
  page = 1,
  perPage = 25
): Promise<PaginatedResponse<Item>> {
  return apiFetch<PaginatedResponse<Item>>(
    `/items_all?item_type=Product&external=${JSON.stringify({ search, page })}`,
    {},
    true
  );
}

export async function getItems(
  page = 1,
  perPage = 25
): Promise<PaginatedResponse<Item>> {
  return apiFetch<PaginatedResponse<Item>>(
    `/items_all?item_type=Product&external=${JSON.stringify({ page })}`,
    {},
    true
  );
}
// ============================================================================
// CUSTOMERS API - Uses BASE_URL
// ============================================================================

export async function getCustomer(): Promise<Customer> {
  return apiFetch<Customer>("/customer", {}, false);
}

export async function createCustomer(
  data: CreateCustomerRequest
): Promise<Customer> {
  return apiFetch<Customer>(
    "/customer",
    {
      method: "POST",
      body: JSON.stringify(data),
    },
    false
  );
}

export async function getCustomerById(customerId: string): Promise<Customer> {
  return apiFetch<Customer>(`/customer/${customerId}`, {}, false);
}

export async function updateCustomer(
  customerId: string,
  data: Partial<CreateCustomerRequest>
): Promise<Customer> {
  return apiFetch<Customer>(
    `/customer/${customerId}`,
    {
      method: "PUT",
      body: JSON.stringify(data),
    },
    false
  );
}

export async function linkCustomerToBooking(
  bookingId: number,
  customerId: string
): Promise<Booking> {
  return apiFetch<Booking>(
    `/booking/${bookingId}/customer`,
    {
      method: "PUT",
      body: JSON.stringify({ customers_id: customerId }),
    },
    false
  );
}

// ============================================================================
// BOOKINGS API
// ============================================================================

// Get bookings list - Uses ITEMS_BOOKINGS_URL
export async function getBookings(
  page = 1,
  perPage = 25
): Promise<PaginatedResponse<Booking>> {
  return apiFetch<PaginatedResponse<Booking>>(
    `/bookings?page=${page}&perPage=${perPage}`,
    {},
    true
  );
}

// Get single booking - Uses BASE_URL
export async function getBooking(bookingId: number): Promise<Booking> {
  return apiFetch<Booking>(`/booking/${bookingId}`, {}, false);
}

// Create booking - Uses BASE_URL
export async function createBooking(): Promise<CreateBookingResponse> {
  return apiFetch<CreateBookingResponse>(
    "/booking",
    {
      method: "POST",
      body: JSON.stringify({}),
    },
    false
  );
}

// Add item to booking - Uses BASE_URL
export async function addBookingItem(
  bookingId: number,
  itemId: number
): Promise<AddBookingItemResponse> {
  return apiFetch<AddBookingItemResponse>(
    `/booking/${bookingId}/${itemId}`,
    {
      method: "POST",
      body: JSON.stringify({}),
    },
    false
  );
}

// Create customer invite - Uses BASE_URL
export async function createCustomerInvite(data: {
  booking_id: number;
  customer_email?: string;
}): Promise<any> {
  return apiFetch(
    "/booking_customer_invite",
    {
      method: "POST",
      body: JSON.stringify(data),
    },
    false
  );
}

// ============================================================================
// AUTH API (Public - no token needed)
// ============================================================================

export async function getAuthMe(): Promise<any> {
  const response = await fetch(`${BASE_URL}/auth/me`, {
    headers: BASE_HEADERS,
  });

  if (!response.ok) {
    throw new Error(`Auth failed: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

// Update booking item with quantity, price, and special instructions
export async function updateBookingItem(
  bookingId: number,
  itemId: number,
  data: {
    booking_items_info?: any;
    quantity?: number;
    price?: string | number;
  }
): Promise<any> {
  return apiFetch(
    `/booking/${bookingId}/${itemId}`,
    {
      method: "PATCH",
      body: JSON.stringify(data),
    },
    false
  );
}

// Create lead
export async function createLead(leadPayload: any): Promise<any> {
  return apiFetch(
    "/lead",
    {
      method: "POST",
      body: JSON.stringify({ payload: leadPayload }),
    },
    false
  );
}

// Get booking items details (if needed separately)
export async function getBookingItems(bookingId: number): Promise<any> {
  return apiFetch(`/booking/${bookingId}/items`, {}, false);
}

// ============================================================================
// CACHE LAYER
// ============================================================================

class ItemsCache {
  private cache: Item[] | null = null;
  private cacheTime: number = 0;
  private readonly TTL = 24 * 60 * 60 * 1000; // 24 hours

  async getItems(): Promise<Item[]> {
    const now = Date.now();

    if (this.cache && now - this.cacheTime < this.TTL) {
      return this.cache;
    }

    const response = await getAllItems();
    this.cache = response.items;
    this.cacheTime = now;

    return this.cache;
  }

  invalidate(): void {
    this.cache = null;
    this.cacheTime = 0;
  }

  findById(id: number): Item | undefined {
    return this.cache?.find((item) => item.id === id);
  }

  search(query: string): Item[] {
    if (!this.cache) return [];

    const lowerQuery = query.toLowerCase();
    return this.cache.filter(
      (item) =>
        item.title.toLowerCase().includes(lowerQuery) ||
        item.description?.toLowerCase().includes(lowerQuery) ||
        item.tags?.toLowerCase().includes(lowerQuery)
    );
  }
}

export const itemsCache = new ItemsCache();

// ============================================================================
// STORAGE LAYER
// ============================================================================

export interface EstimateMetadata {
  estimateNumber: string;
  date: string;
  validUntil: string;
  notes: string;
  customerInfo: {
    name: string;
    email: string;
    phone: string;
    address: string;
  };
  items: Array<{
    id: number;
    description: string;
    quantity: number;
    rate: number;
    amount: number;
    imageUrl?: string | null;
  }>;
  discount: number;
  tax: number;
  totals: {
    subtotal: number;
    discountAmount: number;
    taxAmount: number;
    total: number;
  };
  bookingId?: number;
  savedAt: string;
}

export interface Customer {
  id: string;
  created_at: number;
  elegant_user_id: string;
  external_dashbord_token?: string;
  external_shopping_cart?: string;
  external_settings?: string;
  external_token?: string;
  customer_number: number;
  Full_name: string;
  cust_info?: any;
  is_online_now?: boolean;
  is_online_timestamp?: number;
  is_blocked_or_denied?: boolean;
  email: string;
  _shops?: {
    id: string;
    created_at: number;
    name: string;
    description: string;
    logo: string;
    custom_domain: string;
    Is_visible: boolean;
    slug: string;
    allow_affiliate: boolean;
    testmode: boolean;
  };
}

export interface CreateCustomerRequest {
  elegant_user_id: string;
  Full_name: string;
  email?: string;
  cust_info?: any;
}

export async function saveEstimateToStorage(
  estimateNumber: string,
  data: EstimateMetadata
): Promise<void> {
  try {
    const key = `estimate:${estimateNumber}`;
    await window.storage.set(key, JSON.stringify(data));
  } catch (error) {
    console.error("Failed to save estimate to storage:", error);
    throw error;
  }
}

export async function loadEstimateFromStorage(
  estimateNumber: string
): Promise<EstimateMetadata | null> {
  try {
    const key = `estimate:${estimateNumber}`;
    const result = await window.storage.get(key);
    return result ? JSON.parse(result.value) : null;
  } catch (error) {
    console.error("Failed to load estimate from storage:", error);
    return null;
  }
}

export async function listEstimatesFromStorage(): Promise<string[]> {
  try {
    const result = await window.storage.list("estimate:");
    return result?.keys || [];
  } catch (error) {
    console.error("Failed to list estimates:", error);
    return [];
  }
}

export async function deleteEstimateFromStorage(
  estimateNumber: string
): Promise<void> {
  try {
    const key = `estimate:${estimateNumber}`;
    await window.storage.delete(key);
  } catch (error) {
    console.error("Failed to delete estimate:", error);
    throw error;
  }
}

// ============================================================================
// HIGH-LEVEL OPERATIONS
// ============================================================================

export async function createCompleteEstimate(
  metadata: EstimateMetadata
): Promise<{ bookingId: number; estimateNumber: string }> {
  try {
    const booking = await createBooking();

    const itemPromises = metadata.items.map((item) =>
      addBookingItem(booking.id, item.id)
    );
    await Promise.all(itemPromises);

    metadata.bookingId = booking.id;
    await saveEstimateToStorage(metadata.estimateNumber, metadata);

    return {
      bookingId: booking.id,
      estimateNumber: metadata.estimateNumber,
    };
  } catch (error) {
    console.error("Failed to create complete estimate:", error);
    throw error;
  }
}

export async function loadCompleteEstimate(
  bookingId: number
): Promise<{ booking: Booking; metadata: EstimateMetadata | null }> {
  try {
    const booking = await getBooking(bookingId);

    const keys = await listEstimatesFromStorage();
    let metadata: EstimateMetadata | null = null;

    for (const key of keys) {
      const estimateNumber = key.replace("estimate:", "");
      const stored = await loadEstimateFromStorage(estimateNumber);
      if (stored?.bookingId === bookingId) {
        metadata = stored;
        break;
      }
    }

    return { booking, metadata };
  } catch (error) {
    console.error("Failed to load complete estimate:", error);
    throw error;
  }
}

export async function getBookingBySlug(
  bookingSlug: string
): Promise<Booking[]> {
  return apiFetch<Booking[]>(`/booking_by_slug/${bookingSlug}`, {}, false);
}

// shopinfo

// Get shop by ID - Uses ITEMS_BOOKINGS_URL
export async function getShop(shopId: string): Promise<Shop> {
  return apiFetch<Shop>(`/shops/${shopId}`, {}, true);
}

// Create new shop - Uses ITEMS_BOOKINGS_URL
export async function createShop(data: CreateShopRequest): Promise<Shop> {
  return apiFetch<Shop>(
    "/shops",
    {
      method: "POST",
      body: JSON.stringify(data),
    },
    true
  );
}

// Update shop - Uses ITEMS_BOOKINGS_URL
export async function updateShop(
  shopId: string,
  data: UpdateShopRequest
): Promise<Shop> {
  return apiFetch<Shop>(
    `/shops/${shopId}`,
    {
      method: "PATCH",
      body: JSON.stringify(data),
    },
    true
  );
}

// Delete shop - Uses ITEMS_BOOKINGS_URL
export async function deleteShop(shopId: string): Promise<void> {
  return apiFetch<void>(
    `/shops/${shopId}`,
    {
      method: "DELETE",
    },
    true
  );
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

export function generateEstimateNumber(): string {
  return `EST-${Date.now().toString().slice(-6)}`;
}

export function calculateEstimateTotals(
  items: Array<{ quantity: number; rate: number }>,
  discount: number,
  tax: number
) {
  const subtotal = items.reduce(
    (sum, item) => sum + item.quantity * item.rate,
    0
  );
  const discountAmount = (subtotal * discount) / 100;
  const taxableAmount = subtotal - discountAmount;
  const taxAmount = (taxableAmount * tax) / 100;
  const total = taxableAmount + taxAmount;

  return {
    subtotal,
    discountAmount,
    taxAmount,
    total,
  };
}

// ============================================================================
// FINANCIAL YEAR ESTIMATE NUMBER GENERATOR
// ============================================================================

export async function generateFinancialYearEstimateNumber(): Promise<string> {
  try {
    const now = new Date();
    const currentMonth = now.getMonth(); // 0-11 (0 = January)
    const currentYear = now.getFullYear();

    // Determine financial year
    const financialYear = currentMonth >= 3 ? currentYear : currentYear - 1;
    const financialYearEnd = financialYear + 1;
    const fyString = `${financialYear}-${financialYearEnd
      .toString()
      .slice(-2)}`;

    // **CHANGED: Financial year boundaries**
    const financialYearStart = new Date(financialYear, 3, 1).getTime(); // April 1st
    const financialYearEndDate = new Date(
      financialYearEnd,
      2,
      31,
      23,
      59,
      59
    ).getTime(); // March 31st

    // **CHANGED: Fetch ALL bookings using pagination**
    let allBookings = [];
    let currentPage = 1;
    let hasMorePages = true;

    while (hasMorePages) {
      const bookingsResponse = await getBookings(currentPage, 100); // 100 per page
      allBookings = allBookings.concat(bookingsResponse.items);

      hasMorePages = bookingsResponse.nextPage !== null;
      currentPage++;
    }

    // **CHANGED: Count only bookings created in current financial year**
    const bookingsInCurrentFY = allBookings.filter(
      (booking) =>
        booking.created_at >= financialYearStart &&
        booking.created_at <= financialYearEndDate
    );

    const nextNumber = bookingsInCurrentFY.length + 1;

    const estimateNumber = `EST-${nextNumber.toString().padStart(3, "0")}`;

    return estimateNumber;
  } catch (error) {
    console.error("[EstimateNumber] Failed to generate:", error);
    return `EST-${Date.now().toString().slice(-6)}`;
  }
}

// ============================================================================
// INITIALIZATION
// ============================================================================

// Initialize auth token on module load
authManager.initialize().catch((error) => {
  console.error("[Auth] Failed to initialize:", error);
});

// Export everything
export default {
  // Auth
  authManager,
  getAuthMe,

  // Items
  getAllItems,
  getItems,
  itemsCache,

  // Customers
  getCustomer,
  createCustomer,
  getCustomerById,
  updateCustomer,
  linkCustomerToBooking,

  // Bookings
  getBookings,
  getBooking,
  createBooking,
  addBookingItem,
  createCustomerInvite,
  getBookingBySlug,

  // Shops
  getShop,
  createShop,
  updateShop,
  deleteShop,

  // Storage
  saveEstimateToStorage,
  loadEstimateFromStorage,
  listEstimatesFromStorage,
  deleteEstimateFromStorage,

  // High-level
  createCompleteEstimate,
  loadCompleteEstimate,

  // Utils
  generateEstimateNumber,
  calculateEstimateTotals,
  generateFinancialYearEstimateNumber,

  updateBookingItem,
  createLead,
  getBookingItems,
};
