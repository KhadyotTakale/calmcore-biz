import { useState, useEffect } from "react";
import { Search, User, Loader2 } from "lucide-react";
import { getLeads, Lead } from "@/services/api";

interface CustomerSelectorProps {
  onCustomerSelect: (customer: {
    name: string;
    email: string;
    phone: string;
    address: string;
    state: string;
    gstin: string;
  }) => void;
  value?: string;
  disabled?: boolean;
}

const CustomerSelector = ({
  onCustomerSelect,
  value = "",
  disabled = false,
}: CustomerSelectorProps) => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [filteredLeads, setFilteredLeads] = useState<Lead[]>([]);
  const [searchQuery, setSearchQuery] = useState(value);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load leads on component mount
  useEffect(() => {
    loadLeads();
  }, []);

  // Update search query when value prop changes
  useEffect(() => {
    setSearchQuery(value);
  }, [value]);

  // Filter leads when search query changes
  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredLeads(leads);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = leads.filter((lead) => {
        const fullName =
          `${lead.lead_payload.first_name} ${lead.lead_payload.last_name}`.toLowerCase();
        const email = lead.lead_payload.email?.toLowerCase() || "";
        const phone = lead.lead_payload.phone_numbers?.[0]?.number || "";

        return (
          fullName.includes(query) ||
          email.includes(query) ||
          phone.includes(query)
        );
      });
      setFilteredLeads(filtered);
    }
  }, [searchQuery, leads]);

  const loadLeads = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Fetch all leads (paginated)
      let allLeads: Lead[] = [];
      let currentPage = 1;
      let hasMorePages = true;

      while (hasMorePages) {
        const response = await getLeads(currentPage, 100);
        allLeads = allLeads.concat(response.items);
        hasMorePages = response.nextPage !== null;
        currentPage++;
      }

      setLeads(allLeads);
      setFilteredLeads(allLeads);
    } catch (err) {
      console.error("Failed to load leads:", err);
      setError("Failed to load customers. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLeadClick = (lead: Lead) => {
    const fullName =
      `${lead.lead_payload.first_name} ${lead.lead_payload.last_name}`.trim();
    const email = lead.lead_payload.email || "";
    const phone = lead.lead_payload.phone_numbers?.[0]?.number || "";
    const address = lead.lead_payload.addresses?.[0]?.line1 || "";
    const state = lead.lead_payload.addresses?.[0]?.region || "";
    const gstin =
      lead.lead_payload.config?.find((c) => c.key === "gstin")?.val || "";

    onCustomerSelect({
      name: fullName,
      email,
      phone,
      address,
      state,
      gstin,
    });

    setSearchQuery(fullName);
    setIsOpen(false);
  };

  const handleSearchFocus = () => {
    setIsOpen(true);
  };

  const handleSearchBlur = () => {
    // Delay to allow click on lead
    setTimeout(() => setIsOpen(false), 200);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setSearchQuery(newValue);
    setIsOpen(true);

    // 🔥 FIX: Always update parent component when user types
    // This ensures new customer names are captured
    onCustomerSelect({
      name: newValue,
      email: "",
      phone: "",
      address: "",
      state: "",
      gstin: "",
    });
  };

  return (
    <div className="relative">
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          value={searchQuery}
          onChange={handleInputChange}
          onFocus={handleSearchFocus}
          onBlur={handleSearchBlur}
          placeholder="Search existing customers or type new name..."
          disabled={disabled || isLoading}
          className="w-full rounded-lg border border-input bg-background py-2 pl-10 pr-4 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-50"
        />
        {isLoading && (
          <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-primary" />
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="mt-2 rounded-lg border border-destructive/20 bg-destructive/10 p-3 text-sm text-destructive">
          {error}
          <button
            onClick={() => loadLeads()}
            className="ml-2 underline hover:no-underline"
          >
            Retry
          </button>
        </div>
      )}

      {/* Dropdown */}
      {isOpen && !error && filteredLeads.length > 0 && (
        <div className="absolute z-50 mt-2 max-h-80 w-full overflow-y-auto rounded-lg border border-border bg-card shadow-lg">
          {filteredLeads.length === 0 ? (
            <div className="p-4 text-center text-sm text-muted-foreground">
              {isLoading ? (
                <div className="flex items-center justify-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Loading customers...</span>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2">
                  <User className="h-8 w-8 text-muted-foreground/50" />
                  <span>No customers found</span>
                  <span className="text-xs">Type to add a new customer</span>
                </div>
              )}
            </div>
          ) : (
            <div className="divide-y divide-border">
              {filteredLeads.map((lead) => {
                const fullName =
                  `${lead.lead_payload.first_name} ${lead.lead_payload.last_name}`.trim();
                const email = lead.lead_payload.email || "";
                const phone =
                  lead.lead_payload.phone_numbers?.[0]?.number || "";
                const address = lead.lead_payload.addresses?.[0]?.line1 || "";
                const gstin =
                  lead.lead_payload.config?.find((c) => c.key === "gstin")
                    ?.val || "";

                return (
                  <button
                    key={lead.id}
                    onClick={() => handleLeadClick(lead)}
                    className="w-full p-3 text-left transition-colors hover:bg-muted focus:bg-muted focus:outline-none"
                  >
                    <div className="flex items-start gap-3">
                      {/* Avatar */}
                      <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                        <User className="h-5 w-5" />
                      </div>

                      {/* Customer Details */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className="truncate text-sm font-medium text-foreground">
                            {fullName}
                          </h4>
                          {gstin && (
                            <span className="flex-shrink-0 rounded bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                              GST
                            </span>
                          )}
                        </div>

                        {email && (
                          <p className="mt-0.5 truncate text-xs text-muted-foreground">
                            {email}
                          </p>
                        )}

                        <div className="mt-1 flex flex-wrap gap-2 text-xs text-muted-foreground">
                          {phone && (
                            <span className="flex items-center gap-1">
                              📱 {phone}
                            </span>
                          )}
                          {address && (
                            <span className="flex items-center gap-1 truncate">
                              📍 {address}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Helper text */}
      {!isOpen && leads.length > 0 && (
        <p className="mt-1 text-xs text-muted-foreground">
          Select from {leads.length} existing customer
          {leads.length !== 1 ? "s" : ""} or type a new name
        </p>
      )}
    </div>
  );
};

export default CustomerSelector;
