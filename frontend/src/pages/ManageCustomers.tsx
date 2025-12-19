import { useState, useEffect, useMemo, useCallback, memo } from "react";
import { useNavigate } from "react-router-dom";
import {
    ArrowLeft,
    CheckCircle,
    AlertCircle,
    Loader2,
    RefreshCw,
    Plus,
    Search,
    User,
    Phone,
    Mail,
    MapPin,
    Building2,
    Trash2,
    Edit,
    ChevronLeft,
    ChevronRight,
} from "lucide-react";
import {
    getLeads,
    createLead,
    updateLead,
    deleteLead,
    Lead,
} from "@/services/api";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";

// ============================================================================
// TYPES
// ============================================================================

interface CustomerFormData {
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
    address: string;
    state: string;
    gstin: string;
    company_name: string;
}

interface PaginationInfo {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
}

// ============================================================================
// CUSTOMER CARD COMPONENT (Memoized)
// ============================================================================

interface CustomerCardProps {
    customer: Lead;
    onEdit: (customer: Lead) => void;
    onDelete: (customerId: number) => void;
}

const CustomerCard = memo(({ customer, onEdit, onDelete }: CustomerCardProps) => {
    const { lead_payload } = customer;
    const fullName = `${lead_payload.first_name || ""} ${lead_payload.last_name || ""
        }`.trim();
    const email = lead_payload.email || "";
    const phone = lead_payload.phone_numbers?.[0]?.number || "";
    const address = lead_payload.addresses?.[0]?.line1 || "";
    const state = lead_payload.addresses?.[0]?.region || "";
    const gstin =
        lead_payload.config?.find((c) => c.key === "gstin")?.val || "";
    const company =
        lead_payload.config?.find((c) => c.key === "company")?.val || "";

    return (
        <div className="group relative overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-all hover:shadow-lg hover:scale-[1.02]">
            {/* Header */}
            <div className="bg-gradient-to-br from-primary/10 to-primary/5 p-4">
                <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                        <div className="rounded-xl bg-primary/10 p-2.5">
                            <User className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-foreground text-lg line-clamp-1">
                                {fullName || "Unnamed Customer"}
                            </h3>
                            {company && (
                                <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
                                    <Building2 className="h-3 w-3" />
                                    {company}
                                </div>
                            )}
                        </div>
                    </div>
                    {gstin && (
                        <span className="rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-700">
                            GST: {gstin}
                        </span>
                    )}
                </div>
            </div>

            {/* Content */}
            <div className="p-4 space-y-3">
                {/* Contact Info */}
                <div className="space-y-2 text-sm text-muted-foreground">
                    {email && (
                        <div className="flex items-center gap-2">
                            <Mail className="h-4 w-4" />
                            <span className="truncate">{email}</span>
                        </div>
                    )}
                    {phone && (
                        <div className="flex items-center gap-2">
                            <Phone className="h-4 w-4" />
                            <span>{phone}</span>
                        </div>
                    )}
                    {(address || state) && (
                        <div className="flex items-start gap-2">
                            <MapPin className="h-4 w-4 mt-0.5" />
                            <span className="line-clamp-2">
                                {address}
                                {address && state ? ", " : ""}
                                {state}
                            </span>
                        </div>
                    )}
                </div>

                {/* Actions */}
                <div className="grid grid-cols-2 gap-2 pt-3 mt-2 border-t border-border">
                    <button
                        onClick={() => onEdit(customer)}
                        className="flex items-center justify-center gap-2 rounded-lg border-2 border-border bg-background px-3 py-2 text-sm font-semibold text-foreground transition-all hover:border-primary/30 hover:bg-muted"
                    >
                        <Edit className="h-4 w-4" />
                        Edit
                    </button>
                    <button
                        onClick={() => onDelete(customer.id)}
                        className="flex items-center justify-center gap-2 rounded-lg border-2 border-destructive/30 bg-destructive/10 px-3 py-2 text-sm font-semibold text-destructive transition-all hover:border-destructive/50 hover:bg-destructive/20"
                    >
                        <Trash2 className="h-4 w-4" />
                        Delete
                    </button>
                </div>
            </div>

            {/* Hover overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
        </div>
    );
});

CustomerCard.displayName = "CustomerCard";

// ============================================================================
// STATS COMPONENT
// ============================================================================

const CustomerStats = memo(({ totalCustomers }: { totalCustomers: number }) => (
    <div className="grid gap-4 md:grid-cols-1 mb-6">
        <div className="stat-card stat-primary">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm text-muted-foreground">Total Customers</p>
                    <p className="text-2xl font-bold text-foreground">{totalCustomers}</p>
                </div>
                <div className="rounded-xl bg-primary/10 p-3">
                    <User className="h-6 w-6 text-primary" />
                </div>
            </div>
        </div>
    </div>
));

CustomerStats.displayName = "CustomerStats";

// ============================================================================
// PAGINATION COMPONENT
// ============================================================================

const Pagination = memo(
    ({
        pagination,
        onPageChange,
        loading,
    }: {
        pagination: PaginationInfo;
        onPageChange: (page: number) => void;
        loading: boolean;
    }) => {
        const {
            currentPage,
            totalPages,
            itemsPerPage,
            totalItems,
            hasPrevPage,
            hasNextPage,
        } = pagination;

        // Simple pagination logic
        const startItem = (currentPage - 1) * itemsPerPage + 1;
        const endItem = Math.min(currentPage * itemsPerPage, totalItems);

        return (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6 px-4 py-3 bg-card rounded-lg border border-border">
                {/* Info */}
                <div className="text-sm text-muted-foreground">
                    Showing {totalItems > 0 ? startItem : 0} to {endItem} of {totalItems}{" "}
                    customers
                </div>

                {/* Controls */}
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => onPageChange(currentPage - 1)}
                        disabled={!hasPrevPage || loading}
                        className="p-2 rounded-lg border border-border bg-background hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        <ChevronLeft className="h-4 w-4" />
                    </button>

                    <span className="text-sm font-medium">
                        Page {currentPage}
                    </span>

                    <button
                        onClick={() => onPageChange(currentPage + 1)}
                        disabled={!hasNextPage || loading}
                        className="p-2 rounded-lg border border-border bg-background hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        <ChevronRight className="h-4 w-4" />
                    </button>
                </div>
            </div>
        );
    }
);

Pagination.displayName = "Pagination";

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const ManageCustomers = () => {
    const navigate = useNavigate();
    const [customers, setCustomers] = useState<Lead[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [showForm, setShowForm] = useState(false);
    const [editingCustomer, setEditingCustomer] = useState<Lead | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [paginationInfo, setPaginationInfo] = useState<PaginationInfo>({
        currentPage: 1,
        totalPages: 1,
        totalItems: 0,
        itemsPerPage: 25,
        hasNextPage: false,
        hasPrevPage: false,
    });
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [customerToDelete, setCustomerToDelete] = useState<number | null>(null);
    const { toast } = useToast();

    const [formData, setFormData] = useState<CustomerFormData>({
        first_name: "",
        last_name: "",
        email: "",
        phone: "",
        address: "",
        state: "",
        gstin: "",
        company_name: "",
    });

    // Load customers on mount/page change
    useEffect(() => {
        loadCustomers(currentPage);
    }, [currentPage]);

    const loadCustomers = async (page: number) => {
        try {
            setLoading(true);
            setError(null);
            // Assuming getLeads returns PaginatedResponse<Lead>
            const response = await getLeads(page, 25);

            setCustomers(response.items);
            setPaginationInfo({
                currentPage: response.curPage || page,
                totalPages: response.pageTotal || 1,
                totalItems: response.itemsTotal || response.items.length,
                itemsPerPage: response.perPage || 25,
                hasNextPage: response.nextPage !== null,
                hasPrevPage: response.prevPage !== null,
            });
        } catch (err: any) {
            setError(err.message || "Failed to load customers");
        } finally {
            setLoading(false);
        }
    };

    const handleRefresh = useCallback(() => {
        loadCustomers(currentPage);
    }, [currentPage]);

    const handlePageChange = useCallback((page: number) => {
        setCurrentPage(page);
        window.scrollTo({ top: 0, behavior: "smooth" });
    }, []);

    // Filter customers based on search
    const filteredCustomers = useMemo(() => {
        if (!searchQuery) return customers;
        const query = searchQuery.toLowerCase();
        return customers.filter((customer) => {
            const payload = customer.lead_payload;
            const fullName = `${payload.first_name} ${payload.last_name}`.toLowerCase();
            const email = (payload.email || "").toLowerCase();
            const phone = (payload.phone_numbers?.[0]?.number || "").toLowerCase();

            return (
                fullName.includes(query) ||
                email.includes(query) ||
                phone.includes(query)
            );
        });
    }, [customers, searchQuery]);

    const handleInputChange = (field: keyof CustomerFormData, value: string) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    const validateForm = (): boolean => {
        if (!formData.first_name.trim()) {
            setError("First Name is required");
            return false;
        }
        return true;
    };

    const handleSave = async () => {
        setError(null);
        setSuccess(false);

        if (!validateForm()) return;

        try {
            setSaving(true);

            // Construct payload compatible with API schema
            const leadPayload = {
                first_name: formData.first_name,
                last_name: formData.last_name,
                email: formData.email,
                phone_numbers: formData.phone ? [{ number: formData.phone, type: "MOBILE" }] : [],
                addresses: (formData.address || formData.state) ? [{
                    line1: formData.address,
                    region: formData.state,
                    type: "SHIPPING" // Default
                }] : [],
                status: "prospect",
                config: [
                    { key: "gstin", val: formData.gstin },
                    { key: "company", val: formData.company_name }
                ],
            };

            if (editingCustomer) {
                await updateLead(editingCustomer.id, leadPayload);
            } else {
                await createLead(leadPayload);
            }

            setSuccess(true);
            resetForm();
            setShowForm(false);
            handleRefresh(); // Reload list

            setTimeout(() => setSuccess(false), 3000);
        } catch (err: any) {
            setError(err.message || "Failed to save customer");
        } finally {
            setSaving(false);
        }
    };

    const handleEdit = (customer: Lead) => {
        const payload = customer.lead_payload;
        const config = payload.config || [];

        setEditingCustomer(customer);
        setFormData({
            first_name: payload.first_name || "",
            last_name: payload.last_name || "",
            email: payload.email || "",
            phone: payload.phone_numbers?.[0]?.number || "",
            address: payload.addresses?.[0]?.line1 || "",
            state: payload.addresses?.[0]?.region || "",
            gstin: config.find((c) => c.key === "gstin")?.val || "",
            company_name: config.find((c) => c.key === "company")?.val || "",
        });

        setShowForm(true);
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const handleDelete = async (customerId: number) => {
        setCustomerToDelete(customerId);
        setDeleteDialogOpen(true);
    };

    const confirmDelete = async () => {
        if (!customerToDelete) return;

        try {
            await deleteLead(customerToDelete);
            toast({
                title: "Customer Deleted",
                description: "The customer has been successfully deleted.",
            });
            handleRefresh();
        } catch (err: any) {
            toast({
                title: "Failed to Delete Customer",
                description: err.message || "An error occurred while deleting the customer.",
                variant: "destructive",
            });
        } finally {
            setDeleteDialogOpen(false);
            setCustomerToDelete(null);
        }
    };

    const resetForm = () => {
        setEditingCustomer(null);
        setFormData({
            first_name: "",
            last_name: "",
            email: "",
            phone: "",
            address: "",
            state: "",
            gstin: "",
            company_name: "",
        });
    };

    const handleAddNew = () => {
        resetForm();
        setShowForm(true);
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 pb-28">
            <div className="mx-auto max-w-7xl p-4 md:p-6 lg:p-8 fade-in-fast">
                {/* Header */}
                <div className="mb-6">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => navigate("/settings")}
                                className="btn-secondary h-10 w-10 !p-0"
                            >
                                <ArrowLeft className="h-5 w-5" />
                            </button>
                            <div>
                                <h1 className="font-heading text-2xl font-bold text-foreground md:text-3xl">
                                    Manage Customers
                                </h1>
                                <p className="text-sm text-muted-foreground">
                                    View and manage your customer database
                                </p>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={handleRefresh}
                                disabled={loading}
                                className="btn-secondary"
                            >
                                <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
                                Refresh
                            </button>
                            <button onClick={handleAddNew} className="btn-accent">
                                <Plus className="h-4 w-4" />
                                Add Customer
                            </button>
                        </div>
                    </div>

                    {/* Messages */}
                    {success && (
                        <div className="mb-4 flex items-center gap-2 rounded-lg bg-success/10 border border-success/20 p-4 text-success animate-slideDown">
                            <CheckCircle className="h-5 w-5" />
                            <span className="font-medium">
                                {editingCustomer ? "Customer updated!" : "Customer created!"}
                            </span>
                        </div>
                    )}
                    {error && (
                        <div className="mb-4 flex items-center gap-2 rounded-lg bg-destructive/10 border border-destructive/20 p-4 text-destructive animate-slideDown">
                            <AlertCircle className="h-5 w-5" />
                            <span className="font-medium">{error}</span>
                        </div>
                    )}

                    {/* Stats */}
                    {!showForm && <CustomerStats totalCustomers={paginationInfo.totalItems} />}

                    {/* Search */}
                    {!showForm && (
                        <div className="relative mb-6">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search customers by name, email, or phone..."
                                className="search-input"
                            />
                        </div>
                    )}
                </div>

                {/* Form */}
                {showForm && (
                    <div className="mb-6">
                        <div className="rounded-2xl border-2 border-primary/20 bg-card p-6 md:p-8 shadow-lg">
                            <div className="mb-6 pb-4 border-b-2 border-border flex justify-between items-center">
                                <div className="flex items-center gap-3">
                                    <div className="rounded-lg bg-primary/10 p-2">
                                        <User className="h-6 w-6 text-primary" />
                                    </div>
                                    <h2 className="text-2xl font-bold text-foreground">
                                        {editingCustomer ? "Edit Customer" : "Add New Customer"}
                                    </h2>
                                </div>
                                <button onClick={() => setShowForm(false)} className="text-muted-foreground hover:text-foreground">
                                    Cancel
                                </button>
                            </div>

                            <div className="grid md:grid-cols-2 gap-5">
                                <div>
                                    <label className="mb-2 block text-sm font-semibold text-foreground">First Name *</label>
                                    <input type="text" className="input-field" value={formData.first_name} onChange={(e) => handleInputChange("first_name", e.target.value)} />
                                </div>
                                <div>
                                    <label className="mb-2 block text-sm font-semibold text-foreground">Last Name</label>
                                    <input type="text" className="input-field" value={formData.last_name} onChange={(e) => handleInputChange("last_name", e.target.value)} />
                                </div>
                                <div>
                                    <label className="mb-2 block text-sm font-semibold text-foreground">Email</label>
                                    <input type="email" className="input-field" value={formData.email} onChange={(e) => handleInputChange("email", e.target.value)} />
                                </div>
                                <div>
                                    <label className="mb-2 block text-sm font-semibold text-foreground">Phone</label>
                                    <input type="tel" className="input-field" value={formData.phone} onChange={(e) => handleInputChange("phone", e.target.value)} />
                                </div>
                                <div>
                                    <label className="mb-2 block text-sm font-semibold text-foreground">GSTIN</label>
                                    <input type="text" className="input-field" value={formData.gstin} onChange={(e) => handleInputChange("gstin", e.target.value)} />
                                </div>
                                <div>
                                    <label className="mb-2 block text-sm font-semibold text-foreground">Company Name</label>
                                    <input type="text" className="input-field" value={formData.company_name} onChange={(e) => handleInputChange("company_name", e.target.value)} />
                                </div>
                                <div className="md:col-span-2">
                                    <label className="mb-2 block text-sm font-semibold text-foreground">Address</label>
                                    <input type="text" className="input-field mb-3" placeholder="Street Address" value={formData.address} onChange={(e) => handleInputChange("address", e.target.value)} />
                                    <input type="text" className="input-field" placeholder="State/Region" value={formData.state} onChange={(e) => handleInputChange("state", e.target.value)} />
                                </div>
                            </div>

                            <div className="mt-8 flex gap-3 justify-end">
                                <button onClick={() => setShowForm(false)} className="btn-secondary" disabled={saving}>Cancel</button>
                                <button onClick={handleSave} className="btn-primary" disabled={saving}>
                                    {saving && <Loader2 className="h-4 w-4 animate-spin" />}
                                    {editingCustomer ? "Update Customer" : "Create Customer"}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* List */}
                {!showForm && (
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {filteredCustomers.map(customer => (
                            <CustomerCard
                                key={customer.id}
                                customer={customer}
                                onEdit={handleEdit}
                                onDelete={handleDelete}
                            />
                        ))}
                        {filteredCustomers.length === 0 && !loading && (
                            <div className="col-span-full py-12 text-center text-muted-foreground">
                                No customers found. Click "Add Customer" to create one.
                            </div>
                        )}
                    </div>
                )}

                {/* Pagination */}
                {!showForm && filteredCustomers.length > 0 && (
                    <Pagination pagination={paginationInfo} onPageChange={handlePageChange} loading={loading} />
                )}
            </div>

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Customer?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will permanently delete this customer from your database. This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
};

export default ManageCustomers;
