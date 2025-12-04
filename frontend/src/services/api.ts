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

// 🔍 DEBUG: Verify environment variables are loaded correctly
console.log("=== API CONFIGURATION DEBUG ===");
console.log("BASE_URL:", BASE_URL);
console.log("ITEMS_BOOKINGS_URL:", ITEMS_BOOKINGS_URL);
console.log("VITE_ELEGANT_DOMAIN:", import.meta.env.VITE_ELEGANT_DOMAIN);
console.log("VITE_ELEGANT_AUTH exists:", !!import.meta.env.VITE_ELEGANT_AUTH);
console.log("BASE_HEADERS:", JSON.stringify(BASE_HEADERS, null, 2));
console.log("================================");

// ============================================================================
// AUTHENTICATION MANAGER
// ============================================================================

class AuthManager {
  private customerAuthToken: string | null = null;
  private clerkUserId: string | null = null;

  constructor() {
    this.restoreFromStorage();
  }

  private restoreFromStorage(): void {
    try {
      const storedToken = localStorage.getItem("elegant_customer_token");
      const storedUserId = localStorage.getItem("elegant_clerk_userid");

      if (storedToken) {
        this.customerAuthToken = storedToken;
        console.log("[AuthManager] ✅ Token restored from localStorage");
      }

      if (storedUserId) {
        this.clerkUserId = storedUserId;
        console.log("[AuthManager] ✅ Clerk user ID restored:", storedUserId);
      }
    } catch (error) {
      console.error(
        "[AuthManager] ❌ Failed to restore from localStorage:",
        error
      );
    }
  }

  setClerkUserId(userId: string): void {
    this.clerkUserId = userId;
    localStorage.setItem("elegant_clerk_userid", userId);
    console.log("[AuthManager] 💾 Clerk user ID saved:", userId);
  }

  getClerkUserId(): string | null {
    return this.clerkUserId;
  }

  setCustomerAuthToken(token: string): void {
    this.customerAuthToken = token;
    localStorage.setItem("elegant_customer_token", token);
    console.log("[AuthManager] 💾 Customer auth token saved");
    console.log("[AuthManager] Token preview:", token.substring(0, 50) + "...");
  }

  getCustomerAuthToken(): string | null {
    return this.customerAuthToken;
  }

  clearToken(): void {
    this.customerAuthToken = null;
    this.clerkUserId = null;
    localStorage.removeItem("elegant_customer_token");
    localStorage.removeItem("elegant_clerk_userid");
    localStorage.removeItem("shopId");
    console.log("[AuthManager] 🗑️ All tokens cleared");
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
  authToken?: string; // ADD THIS - it's returned in the response
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
  _customer_roles_of_customers_of_shops?: {
    // ADD THIS
    id: string;
    created_at: number;
    customers_id: string;
    shops_id: string;
    role: string | null;
    block_deny_access: boolean;
    block_deny_reason: string | null;
    status: string;
    referral: string;
    is_onboarded: boolean;
    cust_role_info: any;
    is_manager: boolean;
    is_owner: boolean; // THIS IS THE KEY FIELD
  };
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

export interface UpdateShopRequest {
  name?: string;
  description?: string;
  logo?: string;
  custom_domain?: string;
  Is_visible?: number; // 0 or 1
  slug?: string;
}

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

export interface CreateCustomerRequest {
  elegant_user_id: string;
  Full_name: string;
  email?: string;
  cust_info?: any;
}

export interface CustomerResponse {
  customer: Customer;
  authToken: string;
}

export interface Lead {
  id: number;
  created_at: number;
  shops_id: string;
  lead_payload: {
    email: string;
    config: Array<{ key: string; val: string; datatype: string }>;
    addresses: Array<{
      line1: string;
      region: string;
      country: string;
      country_code: string;
    }>;
    last_name: string;
    first_name: string;
    phone_numbers: Array<{ type: string; number: string }>;
  };
  status: string;
  customers_id: string | null;
  geo_location: any;
  headers: any;
  _shops?: Shop;
  _leads_assignment_of_shops_of_leads?: any[];
}

export interface ShopSettings {
  logo_url: string;
  company_name: string;
  address: string;
  email: string;
  phone: string;
  declaration: string;
  bank_details: {
    beneficiary_name: string;
    account_number: string;
    bank_name: string;
    branch: string;
    ifsc_code: string;
  };
  signature: string;
}

export interface ShopInfoPayload {
  seo_script_text: string;
  contact_info: Record<string, any>;
  shops_settings: ShopSettings;
}

export interface CreateItemRequest {
  item_type: string;
  Is_disabled: boolean;
  title: string;
  description: string;
  SEO_Tags: string;
  tags: string;
  price: number;
  unit: string;
  currency: string;
  sku: string;
  rank: number;
  min_quantity: number;
  item_attributes?: Record<string, any>;
}

export interface ItemResponse {
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
  min_quantity: number;
  item_attributes: any;
  customers_id: string;
  modified_by_id: string;
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

// post shop

export interface CreateShopRequest {
  name: string;
  description: string;
  logo: string;
  custom_domain: string;
  Is_visible: number; // 0 or 1
  slug: string; // Can be empty string
}

// ============================================================================
// CORE FETCH WRAPPER
// ============================================================================
async function apiFetch<T>(
  endpoint: string,
  options: RequestInit = {},
  useItemsBookingsUrl: boolean = false,
  useCustomerAuth: boolean = false,
  skipAutoLogout: boolean = false
): Promise<T> {
  const baseUrl = useItemsBookingsUrl ? ITEMS_BOOKINGS_URL : BASE_URL;
  const fullUrl = `${baseUrl}${endpoint}`;

  let headers = { ...BASE_HEADERS };

  const clerkUserId = authManager.getClerkUserId();
  if (clerkUserId) {
    headers = { ...headers, "x-elegant-userid": clerkUserId } as any;
  }

  if (useCustomerAuth) {
    const customerToken = authManager.getCustomerAuthToken();
    if (customerToken) {
      headers = { ...headers, Authorization: `Bearer ${customerToken}` } as any;
      console.log("[API] Using customer auth token for:", endpoint);
    } else {
      console.warn("[API] ⚠️ No customer token available for:", endpoint);
    }
  }

  try {
    console.log("[API] 📤 Request:", {
      url: fullUrl,
      method: options.method || "GET",
      hasAuth: !!headers.Authorization,
      hasUserId: !!headers["x-elegant-userid"],
      body: options.body ? JSON.parse(options.body as string) : null, // ADD THIS
    });

    const response = await fetch(fullUrl, {
      ...options,
      headers: {
        ...headers,
        ...options.headers,
      },
    });

    console.log(
      "[API] 📥 Response status:",
      response.status,
      response.statusText
    ); // ADD THIS

    const responseText = await response.text();

    console.log("[API] 📥 Response text length:", responseText.length); // ADD THIS
    console.log(
      "[API] 📥 Response text preview:",
      responseText.substring(0, 500)
    ); // ADD THIS

    if (
      responseText.trim().startsWith("<!DOCTYPE") ||
      responseText.trim().startsWith("<html")
    ) {
      console.error(
        "[API] ❌ Received HTML instead of JSON:",
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
        errorMessage = responseText || errorMessage;
      }

      console.error("[API] ❌ Error response:", {
        status: response.status,
        endpoint,
        message: errorMessage,
      });

      if (response.status === 401 && !skipAutoLogout) {
        console.warn(
          "[API] 🔒 401 Unauthorized - Token expired, logging out..."
        );

        await customerSignout();
        window.location.href = "/auth";

        throw new ApiError(
          response.status,
          response.statusText,
          "Session expired. Please login again."
        );
      }

      throw new ApiError(response.status, response.statusText, errorMessage);
    }

    // Handle empty response
    if (!responseText || responseText.trim() === "") {
      console.warn("[API] ⚠️ Empty response from:", endpoint);
      return null as T; // ADD THIS
    }

    try {
      const jsonData = JSON.parse(responseText);
      console.log("[API] ✅ Success:", endpoint);
      console.log("[API] 📦 Parsed JSON:", jsonData); // ADD THIS
      return jsonData;
    } catch (parseError) {
      console.error("[API] ❌ JSON parse error:", parseError);
      console.error("[API] Response text:", responseText);
      throw new Error(`Invalid JSON response from ${endpoint}`);
    }
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }

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
// CUSTOMER INITIALIZATION
// ============================================================================
export async function initializeCustomer(
  clerkUserId: string,
  email: string,
  fullName: string
): Promise<{ customer: Customer; authToken: string; hasOwnShop: boolean }> {
  try {
    authManager.setClerkUserId(clerkUserId);

    console.log(
      "[Customer] 📝 Step 1: Getting temporary auth token from /auth/me"
    );

    const authMeResponse = await fetch(`${BASE_URL}/auth/me`, {
      headers: BASE_HEADERS,
    });

    if (!authMeResponse.ok) {
      const errorText = await authMeResponse.text();
      console.error("[Customer] ❌ /auth/me failed:", errorText);
      throw new Error(`Failed to get auth token: ${authMeResponse.status}`);
    }

    const authData = await authMeResponse.json();
    const tempAuthToken = authData.authToken;

    console.log("[Customer] ✅ Got temporary token (parent shop access)");

    if (!tempAuthToken) {
      throw new Error("No authToken returned from /auth/me");
    }

    const headers = {
      ...BASE_HEADERS,
      "x-elegant-userid": clerkUserId,
      Authorization: `Bearer ${tempAuthToken}`,
    };

    console.log("[Customer] 📝 Step 2: Creating/updating customer");

    const postResponse = await fetch(`${BASE_URL}/customer`, {
      method: "POST",
      headers,
      body: JSON.stringify({ email, Full_name: fullName }),
    });

    if (!postResponse.ok) {
      const errorText = await postResponse.text();
      console.error("[Customer] ❌ POST /customer failed:", errorText);
      throw new Error(`POST /customer failed: ${postResponse.status}`);
    }

    console.log("[Customer] ✅ Customer created/updated");

    console.log("[Customer] 📝 Step 3: Getting customer data");

    const getResponse = await fetch(`${BASE_URL}/customer`, {
      headers,
    });

    if (!getResponse.ok) {
      const errorText = await getResponse.text();
      console.error("[Customer] ❌ GET /customer failed:", errorText);
      throw new Error(`GET /customer failed: ${getResponse.status}`);
    }

    const data = await getResponse.json();

    console.log("[Customer] ✅ Got customer data");
    console.log("[Customer] Response authToken:", {
      exists: !!data.authToken,
      isEmpty: data.authToken === "",
      length: data.authToken?.length || 0,
    });

    // Check if user has their own shop
    const hasOwnShop = !!(data.authToken && data.authToken.trim() !== "");

    if (hasOwnShop) {
      // User already has their own shop - save the shop-specific token
      authManager.setCustomerAuthToken(data.authToken);
      console.log(
        "[Customer] ✅ User has own shop - SHOP-SPECIFIC token saved"
      );

      // Save shop ID if available
      if (data.customer?._shops?.id) {
        localStorage.setItem("shopId", data.customer._shops.id);
        console.log(
          "[Customer] ✅ User's shop ID saved:",
          data.customer._shops.id
        );
      }
    } else {
      // NEW: User doesn't have shop - create one automatically
      console.log(
        "[Customer] ℹ️  User doesn't have own shop - creating automatically"
      );

      // Generate shop slug from user's name
      const shopSlug = fullName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");

      // Create shop with user's name
      const shopPayload: CreateShopRequest = {
        name: fullName,
        description: `${fullName}'s Business`,
        logo: "", // Empty logo initially
        custom_domain: shopSlug,
        Is_visible: 1,
        slug: shopSlug,
      };

      console.log(
        "[Customer] 📝 Step 4: Auto-creating shop with name:",
        fullName
      );

      try {
        const createdShop = await createShop(shopPayload);
        console.log("[Customer] ✅ Shop auto-created:", createdShop.id);

        // Save shop ID
        localStorage.setItem("shopId", createdShop.id);

        // IMPORTANT: Now fetch customer data again to get the NEW shop-specific token
        console.log(
          "[Customer] 📝 Step 5: Re-fetching customer data to get shop token"
        );

        const refreshedResponse = await fetch(`${BASE_URL}/customer`, {
          headers,
        });

        if (!refreshedResponse.ok) {
          throw new Error(
            `Failed to refresh customer data: ${refreshedResponse.status}`
          );
        }

        const refreshedData = await refreshedResponse.json();

        console.log(
          "[Customer] ✅ Got refreshed customer data with shop token"
        );

        // Save the NEW shop-specific token
        authManager.setCustomerAuthToken(refreshedData.authToken);
        console.log(
          "[Customer] ✅ Shop-specific token saved after auto-creation"
        );

        // Return the refreshed data
        return {
          ...refreshedData,
          hasOwnShop: true,
        };
      } catch (shopError) {
        console.error("[Customer] ❌ Failed to auto-create shop:", shopError);

        // Fallback: Save temp token and let user create shop manually
        authManager.setCustomerAuthToken(tempAuthToken);
        console.log("[Customer] ⚠️  Falling back to manual shop creation");

        return {
          ...data,
          hasOwnShop: false,
        };
      }
    }

    return {
      ...data,
      hasOwnShop,
    };
  } catch (error) {
    console.error("[Customer] ❌ Initialization failed:", error);
    throw error;
  }
}

export async function refreshCustomerToken(): Promise<boolean> {
  try {
    const clerkUserId = authManager.getClerkUserId();

    if (!clerkUserId) {
      console.error("[API] Cannot refresh token - no Clerk user ID");
      return false;
    }

    console.log("[API] 🔄 Refreshing customer token...");

    // Get fresh token by calling /customer endpoint
    const customerData = await getCustomer();

    console.log("[API] Refresh response:", {
      hasAuthToken: !!customerData.authToken,
      isEmpty: customerData.authToken === "",
      hasShop: !!customerData._shops,
      shopId: customerData._shops?.id,
      isOwner: customerData._customer_roles_of_customers_of_shops?.is_owner,
    });

    // Check if user now has a valid authToken (non-empty string)
    if (customerData.authToken && customerData.authToken.trim() !== "") {
      // Save the new token
      authManager.setCustomerAuthToken(customerData.authToken);
      console.log("[API] ✅ Token refreshed successfully");

      // Also update shop ID if available
      if (customerData._shops?.id) {
        localStorage.setItem("shopId", customerData._shops.id);
      }

      return true;
    } else {
      console.warn(
        "[API] ⚠️ Refresh returned empty token - ownership may not be propagated yet"
      );
      return false;
    }
  } catch (error) {
    console.error("[API] ❌ Token refresh failed:", error);
    return false;
  }
}

// ============================================================================
// LEADS API - Uses BASE_URL
// ============================================================================

export async function getLeads(
  page = 1,
  perPage = 100
): Promise<PaginatedResponse<Lead>> {
  return apiFetch<PaginatedResponse<Lead>>(
    `/leads?page=${page}&perPage=${perPage}`,
    {},
    false,
    true // Use customer auth
  );
}

export async function getLeadById(leadId: number): Promise<Lead> {
  return apiFetch<Lead>(`/leads/${leadId}`, {}, false, true);
}

// ============================================================================
// ITEMS API - Uses ITEMS_BOOKINGS_URL
// ============================================================================

export async function getAllItems(): Promise<PaginatedResponse<Item>> {
  return apiFetch<PaginatedResponse<Item>>(
    "/items_all?item_type=Product",
    {},
    true,
    true // Use customer auth
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
    true,
    true // Use customer auth
  );
}

export async function getItems(
  page = 1,
  perPage = 25
): Promise<PaginatedResponse<Item>> {
  return apiFetch<PaginatedResponse<Item>>(
    `/items_all?item_type=Product&external=${JSON.stringify({ page })}`,
    {},
    true,
    true // Use customer auth
  );
}

export async function createItem(
  data: CreateItemRequest
): Promise<ItemResponse> {
  return apiFetch<ItemResponse>(
    "/items",
    {
      method: "POST",
      body: JSON.stringify(data),
    },
    true, // useItemsBookingsUrl = true (uses ITEMS_BOOKINGS_URL)
    true // useCustomerAuth = true (includes auth token)
  );
}

// UPDATE item - Uses ITEMS_BOOKINGS_URL
export async function updateItem(
  itemId: number,
  data: Partial<CreateItemRequest>
): Promise<ItemResponse> {
  return apiFetch<ItemResponse>(
    `/items/${itemId}`,
    {
      method: "PATCH",
      body: JSON.stringify(data),
    },
    true, // useItemsBookingsUrl = true
    true // useCustomerAuth = true
  );
}

// SOFT DELETE item (set Is_disabled = true) - Uses ITEMS_BOOKINGS_URL
export async function deleteItem(itemId: number): Promise<ItemResponse> {
  return apiFetch<ItemResponse>(
    `/items/${itemId}`,
    {
      method: "PATCH",
      body: JSON.stringify({ Is_disabled: true }),
    },
    true, // useItemsBookingsUrl = true
    true // useCustomerAuth = true
  );
}

// RESTORE item (set Is_disabled = false) - Uses ITEMS_BOOKINGS_URL
export async function restoreItem(itemId: number): Promise<ItemResponse> {
  return apiFetch<ItemResponse>(
    `/items/${itemId}`,
    {
      method: "PATCH",
      body: JSON.stringify({ Is_disabled: false }),
    },
    true, // useItemsBookingsUrl = true
    true // useCustomerAuth = true
  );
}

// GET /items_all - Get all items (already exists, just update if needed)
export async function getAllItemsSimple(): Promise<
  PaginatedResponse<ItemResponse>
> {
  return apiFetch<PaginatedResponse<ItemResponse>>(
    "/items_all",
    {},
    true, // useItemsBookingsUrl = true
    true // useCustomerAuth = true
  );
}

// ============================================================================
// CUSTOMERS API - Uses BASE_URL
// ============================================================================

export async function getCustomer(): Promise<CustomerResponse> {
  return apiFetch<CustomerResponse>("/customer", {}, false, true);
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
    false,
    true // Use customer auth
  );
}

export async function getCustomerById(customerId: string): Promise<Customer> {
  return apiFetch<Customer>(`/customer/${customerId}`, {}, false, true);
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
    false,
    true // Use customer auth
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
    false,
    true // Use customer auth
  );
}

// ============================================================================
// CUSTOMER SIGNOUT API
// ============================================================================

export async function customerSignout(): Promise<void> {
  try {
    const clerkUserId = authManager.getClerkUserId();
    const token = authManager.getCustomerAuthToken();

    if (!clerkUserId || !token) {
      console.log("[API] No auth data to sign out");
      return;
    }

    console.log("[API] 📤 Signing out customer");

    await fetch(`${BASE_URL}/customer_signout`, {
      method: "POST",
      headers: {
        ...BASE_HEADERS,
        "x-elegant-userid": clerkUserId,
        Authorization: `Bearer ${token}`,
      },
    });

    console.log("[API] ✅ Signed out successfully");
  } catch (error) {
    console.error("[API] ❌ Signout failed:", error);
  } finally {
    // Always clear local tokens
    authManager.clearToken();
  }
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
    true,
    true // Use customer auth
  );
}

// Get single booking - Uses BASE_URL
export async function getBooking(bookingId: number): Promise<Booking> {
  return apiFetch<Booking>(`/booking/${bookingId}`, {}, false, true);
}

// Create booking - Uses BASE_URL
export async function createBooking(): Promise<CreateBookingResponse> {
  return apiFetch<CreateBookingResponse>(
    "/booking",
    {
      method: "POST",
      body: JSON.stringify({}),
    },
    false,
    true // Use customer auth
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
    false,
    true // Use customer auth
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
    false,
    true // Use customer auth
  );
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
    false,
    true // Use customer auth
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
    false,
    true // Use customer auth
  );
}

// Get booking items details (if needed separately)
export async function getBookingItems(bookingId: number): Promise<any> {
  return apiFetch(`/booking/${bookingId}/items`, {}, false, true);
}

export async function getBookingBySlug(
  bookingSlug: string
): Promise<Booking[]> {
  return apiFetch<Booking[]>(
    `/booking_by_slug/${bookingSlug}`,
    {},
    false, // useItemsBookingsUrl = false (uses BASE_URL)
    true // useCustomerAuth = true (includes Authorization Bearer token)
  );
}

export async function getBookingBySlugPublic(
  bookingSlug: string,
  authToken: string
): Promise<Booking[]> {
  const response = await fetch(`${BASE_URL}/booking_by_slug/${bookingSlug}`, {
    headers: {
      ...BASE_HEADERS,
      Authorization: `Bearer ${authToken}`,
    },
  });

  if (!response.ok) {
    throw new ApiError(
      response.status,
      response.statusText,
      "Failed to fetch booking"
    );
  }

  return response.json();
}

// ============================================================================
// SHOPS API
// ============================================================================

// GET current user's shop - Uses ITEMS_BOOKINGS_URL + auth token
export async function getCurrentShop(): Promise<Shop> {
  return apiFetch<Shop>(
    "/shop",
    {},
    true, // useItemsBookingsUrl
    true, // useCustomerAuth
    true // skipAutoLogout - NEW: Don't logout if shop doesn't exist
  );
}

// POST create/update shop - Uses ITEMS_BOOKINGS_URL + auth token
export async function createShop(data: CreateShopRequest): Promise<Shop> {
  return apiFetch<Shop>(
    "/shops",
    {
      method: "POST",
      body: JSON.stringify(data),
    },
    true,
    true
  );
}

// shop info

export async function getShopInfo(): Promise<ShopInfoPayload> {
  return apiFetch<ShopInfoPayload>("/shop_info", {}, true, true);
}

// PATCH shop info - Uses ITEMS_BOOKINGS_URL
export async function updateShopInfo(
  data: ShopInfoPayload
): Promise<ShopInfoPayload> {
  return apiFetch<ShopInfoPayload>(
    "/shop_info",
    {
      method: "PATCH",
      body: JSON.stringify(data),
    },
    true,
    true
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

    // Financial year boundaries
    const financialYearStart = new Date(financialYear, 3, 1).getTime(); // April 1st
    const financialYearEndDate = new Date(
      financialYearEnd,
      2,
      31,
      23,
      59,
      59
    ).getTime(); // March 31st

    // Fetch ALL bookings using pagination
    let allBookings: Booking[] = [];
    let currentPage = 1;
    let hasMorePages = true;

    while (hasMorePages) {
      const bookingsResponse = await getBookings(currentPage, 100); // 100 per page
      allBookings = allBookings.concat(bookingsResponse.items);

      hasMorePages = bookingsResponse.nextPage !== null;
      currentPage++;
    }

    // Count only bookings created in current financial year
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
// EXPORTS
// ============================================================================

export { authManager };

export default {
  // Auth
  authManager,
  getAuthMe,
  initializeCustomer,
  customerSignout,
  refreshCustomerToken,

  // Items
  getAllItems,
  getItems,
  searchItems,
  itemsCache,
  createItem,
  getAllItemsSimple,
  updateItem,
  deleteItem,
  restoreItem,

  // Customers
  getCustomer,
  createCustomer,
  getCustomerById,
  updateCustomer,
  linkCustomerToBooking,

  // Leads
  getLeads,
  getLeadById,

  // Bookings
  getBookings,
  getBooking,
  createBooking,
  addBookingItem,
  createCustomerInvite,
  getBookingBySlug,
  updateBookingItem,
  getBookingItems,

  // Shops
  getCurrentShop,
  createShop,
  getShopInfo,
  updateShopInfo,

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
  createLead,
};
