import { useState, useEffect, useMemo, useCallback, memo } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Save,
  Loader2,
  CheckCircle,
  AlertCircle,
  Package,
  RefreshCw,
  Edit,
  Trash2,
  Plus,
  Search,
  X,
  TrendingUp,
  Grid,
  DollarSign,
  Tag,
  ShoppingBag,
} from "lucide-react";
import {
  createItem,
  getAllItemsSimple,
  updateItem,
  deleteItem,
  restoreItem,
} from "@/services/api";

// ============================================================================
// TYPES
// ============================================================================

interface Currency {
  code: string;
  symbol: string;
  name: string;
}

interface Item {
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

interface FormData {
  title: string;
  description: string;
  item_type: string;
  price: string;
  unit: string;
  currency: string;
  sku: string;
  tags: string;
  SEO_Tags: string;
  min_quantity: number;
  rank: number;
  Is_disabled: boolean;
}

// ============================================================================
// ITEM CARD COMPONENT (Memoized)
// ============================================================================

interface ItemCardProps {
  item: Item;
  onEdit: (item: Item) => void;
  onDelete: (itemId: number) => void;
  onRestore: (itemId: number) => void;
}

const ItemCard = memo(
  ({ item, onEdit, onDelete, onRestore }: ItemCardProps) => {
    const getCurrencySymbol = (code: string) => {
      const symbols: Record<string, string> = {
        USD: "$",
        EUR: "€",
        GBP: "£",
        INR: "₹",
        JPY: "¥",
        AUD: "A$",
        CAD: "C$",
      };
      return symbols[code] || code;
    };

    return (
      <div className="transaction-card group relative overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-all hover:shadow-lg hover:scale-[1.02]">
        {/* Header */}
        <div className="bg-gradient-to-br from-primary/10 to-primary/5 p-4">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-primary/10 p-2.5">
                <Package className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground text-lg line-clamp-1">
                  {item.title}
                </h3>
                <p className="text-xs text-muted-foreground font-mono">
                  {item.sku}
                </p>
              </div>
            </div>
            <div className="flex flex-col gap-1 items-end">
              <span className="rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-700">
                {item.item_type}
              </span>
              {item.Is_disabled && (
                <span className="rounded-full bg-destructive/10 px-2 py-1 text-xs font-medium text-destructive">
                  Disabled
                </span>
              )}
            </div>
          </div>

          {/* Info Grid */}
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="flex items-center gap-2">
              <ShoppingBag className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground truncate">
                {item.unit || "Unit"}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Tag className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground truncate">
                Qty: {item.min_quantity}
              </span>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 space-y-3">
          {/* Description */}
          {item.description && (
            <p className="text-sm text-muted-foreground line-clamp-2">
              {item.description}
            </p>
          )}

          {/* Tags */}
          {item.tags && (
            <div className="flex flex-wrap gap-1">
              {item.tags
                .split(",")
                .slice(0, 3)
                .map((tag, idx) => (
                  <span
                    key={idx}
                    className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground"
                  >
                    {tag.trim()}
                  </span>
                ))}
            </div>
          )}

          {/* Price */}
          <div className="flex items-center justify-between pt-2 border-t border-border">
            <span className="text-sm font-medium text-muted-foreground">
              Price
            </span>
            <div className="flex items-center gap-1">
              <span className="text-xs text-muted-foreground">
                {getCurrencySymbol(item.currency)}
              </span>
              <span className="text-xl font-bold text-primary">
                {item.price.toLocaleString("en-IN", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="grid grid-cols-2 gap-2 pt-3">
            <button
              onClick={() => onEdit(item)}
              className="flex items-center justify-center gap-2 rounded-lg border-2 border-border bg-background px-3 py-2 text-sm font-semibold text-foreground transition-all hover:border-primary/30 hover:bg-muted"
            >
              <Edit className="h-4 w-4" />
              Edit
            </button>
            {item.Is_disabled ? (
              <button
                onClick={() => onRestore(item.id)}
                className="flex items-center justify-center gap-2 rounded-lg border-2 border-success/30 bg-success/10 px-3 py-2 text-sm font-semibold text-success transition-all hover:border-success/50 hover:bg-success/20"
              >
                <RefreshCw className="h-4 w-4" />
                Restore
              </button>
            ) : (
              <button
                onClick={() => onDelete(item.id)}
                className="flex items-center justify-center gap-2 rounded-lg border-2 border-destructive/30 bg-destructive/10 px-3 py-2 text-sm font-semibold text-destructive transition-all hover:border-destructive/50 hover:bg-destructive/20"
              >
                <Trash2 className="h-4 w-4" />
                Disable
              </button>
            )}
          </div>
        </div>

        {/* Hover overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
      </div>
    );
  }
);

ItemCard.displayName = "ItemCard";

// ============================================================================
// STATS COMPONENT (Memoized)
// ============================================================================

interface StatsProps {
  totalItems: number;
  activeItems: number;
  totalValue: number;
}

const ItemStats = memo(
  ({ totalItems, activeItems, totalValue }: StatsProps) => (
    <div className="grid gap-4 md:grid-cols-3 mb-6">
      <div className="stat-card stat-primary">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Total Items</p>
            <p className="text-2xl font-bold text-foreground">{totalItems}</p>
          </div>
          <div className="rounded-xl bg-primary/10 p-3">
            <Package className="h-6 w-6 text-primary" />
          </div>
        </div>
      </div>

      <div className="stat-card stat-success">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Active Items</p>
            <p className="text-2xl font-bold text-foreground">{activeItems}</p>
          </div>
          <div className="rounded-xl bg-success/10 p-3">
            <TrendingUp className="h-6 w-6 text-success" />
          </div>
        </div>
      </div>

      <div className="stat-card stat-warning">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Total Value</p>
            <p className="text-2xl font-bold text-foreground font-mono">
              ₹{totalValue.toLocaleString("en-IN")}
            </p>
          </div>
          <div className="rounded-xl bg-warning/10 p-3">
            <DollarSign className="h-6 w-6 text-warning" />
          </div>
        </div>
      </div>
    </div>
  )
);

ItemStats.displayName = "ItemStats";

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const ManageItems = () => {
  const navigate = useNavigate();
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState<Item | null>(null);

  const [formData, setFormData] = useState<FormData>({
    title: "",
    description: "",
    item_type: "Product",
    price: "",
    unit: "",
    currency: "INR",
    sku: "",
    tags: "",
    SEO_Tags: "",
    min_quantity: 1,
    rank: 1,
    Is_disabled: false,
  });

  const currencies: Currency[] = [
    { code: "USD", symbol: "$", name: "US Dollar" },
    { code: "EUR", symbol: "€", name: "Euro" },
    { code: "GBP", symbol: "£", name: "British Pound" },
    { code: "INR", symbol: "₹", name: "Indian Rupee" },
    { code: "JPY", symbol: "¥", name: "Japanese Yen" },
    { code: "AUD", symbol: "A$", name: "Australian Dollar" },
    { code: "CAD", symbol: "C$", name: "Canadian Dollar" },
  ];

  const itemTypes: string[] = ["Event", "Product", "Service"];

  // Load items on mount
  useEffect(() => {
    loadItems();
  }, []);

  const loadItems = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getAllItemsSimple();
      setItems(response.items);
    } catch (err: any) {
      setError(err.message || "Failed to load items");
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = useCallback(() => {
    loadItems();
  }, []);

  // Filter items based on search
  const filteredItems = useMemo(() => {
    if (!searchQuery) return items;

    const query = searchQuery.toLowerCase();
    return items.filter(
      (item) =>
        item.title.toLowerCase().includes(query) ||
        item.description?.toLowerCase().includes(query) ||
        item.sku.toLowerCase().includes(query) ||
        item.tags?.toLowerCase().includes(query)
    );
  }, [items, searchQuery]);

  // Calculate stats
  const stats = useMemo(() => {
    const totalItems = items.length;
    const activeItems = items.filter((item) => !item.Is_disabled).length;
    const totalValue = items
      .filter((item) => !item.Is_disabled)
      .reduce((sum, item) => sum + item.price, 0);

    return { totalItems, activeItems, totalValue };
  }, [items]);

  const handleInputChange = (
    field: keyof FormData,
    value: string | number | boolean
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const validateForm = (): boolean => {
    if (!formData.title.trim()) {
      setError("Item title is required");
      return false;
    }
    if (!formData.price || parseFloat(formData.price) <= 0) {
      setError("Valid price is required");
      return false;
    }
    if (!formData.sku.trim()) {
      setError("SKU is required");
      return false;
    }
    return true;
  };

  const handleSave = async () => {
    setError(null);
    setSuccess(false);

    if (!validateForm()) {
      return;
    }

    try {
      setSaving(true);

      const payload = {
        item_type: formData.item_type,
        Is_disabled: formData.Is_disabled,
        title: formData.title,
        description: formData.description,
        SEO_Tags: formData.SEO_Tags,
        tags: formData.tags,
        price: parseFloat(formData.price),
        unit: formData.unit,
        currency: formData.currency,
        sku: formData.sku,
        rank: parseInt(formData.rank.toString()),
        min_quantity: parseInt(formData.min_quantity.toString()),
        item_attributes: {},
      };

      let response;

      if (editingItem) {
        response = await updateItem(editingItem.id, payload);
        setItems((prev) =>
          prev.map((item) => (item.id === editingItem.id ? response : item))
        );
      } else {
        response = await createItem(payload);
        setItems((prev) => [response, ...prev]);
      }

      setSuccess(true);
      resetForm();
      setShowForm(false);

      setTimeout(() => {
        setSuccess(false);
      }, 3000);
    } catch (err: any) {
      setError(err.message || "Failed to save item. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (item: Item) => {
    setEditingItem(item);
    setFormData({
      title: item.title,
      description: item.description,
      item_type: item.item_type,
      price: item.price.toString(),
      unit: item.unit,
      currency: item.currency,
      sku: item.sku,
      tags: item.tags,
      SEO_Tags: item.SEO_Tags,
      min_quantity: item.min_quantity,
      rank: item.rank,
      Is_disabled: item.Is_disabled,
    });
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (itemId: number) => {
    if (!confirm("Are you sure you want to disable this item?")) {
      return;
    }

    try {
      await deleteItem(itemId);
      setItems((prev) =>
        prev.map((item) =>
          item.id === itemId ? { ...item, Is_disabled: true } : item
        )
      );
    } catch (err: any) {
      setError(err.message || "Failed to disable item");
    }
  };

  const handleRestore = async (itemId: number) => {
    try {
      await restoreItem(itemId);
      setItems((prev) =>
        prev.map((item) =>
          item.id === itemId ? { ...item, Is_disabled: false } : item
        )
      );
    } catch (err: any) {
      setError(err.message || "Failed to restore item");
    }
  };

  const resetForm = () => {
    setEditingItem(null);
    setFormData({
      title: "",
      description: "",
      item_type: "Product",
      price: "",
      unit: "",
      currency: "INR",
      sku: "",
      tags: "",
      SEO_Tags: "",
      min_quantity: 1,
      rank: 1,
      Is_disabled: false,
    });
  };

  const handleAddNew = () => {
    resetForm();
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleCancelForm = () => {
    resetForm();
    setShowForm(false);
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
                  Manage Items
                </h1>
                <p className="text-sm text-muted-foreground">
                  Add and manage your inventory items
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleRefresh}
                disabled={loading}
                className="btn-secondary"
              >
                <RefreshCw
                  className={`h-4 w-4 ${loading ? "animate-spin" : ""}`}
                />
                Refresh
              </button>
              <button onClick={handleAddNew} className="btn-accent">
                <Plus className="h-4 w-4" />
                Add Item
              </button>
            </div>
          </div>

          {/* Success/Error Messages */}
          {success && (
            <div className="mb-4 flex items-center gap-2 rounded-lg bg-success/10 border border-success/20 p-4 text-success animate-slideDown">
              <CheckCircle className="h-5 w-5" />
              <span className="font-medium">
                {editingItem
                  ? "Item updated successfully!"
                  : "Item created successfully!"}
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
          {!showForm && (
            <ItemStats
              totalItems={stats.totalItems}
              activeItems={stats.activeItems}
              totalValue={stats.totalValue}
            />
          )}

          {/* Search */}
          {!showForm && (
            <div className="relative mb-6">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by title, description, SKU, or tags..."
                className="search-input"
              />
            </div>
          )}
        </div>

        {/* Add/Edit Form */}
        {showForm && (
          <div className="mb-6">
            <div className="rounded-2xl border-2 border-primary/20 bg-card p-6 md:p-8 shadow-lg">
              {/* Form Header */}
              <div className="mb-6 pb-4 border-b-2 border-border">
                <div className="flex items-center gap-3 mb-2">
                  <div className="rounded-lg bg-primary/10 p-2">
                    <Package className="h-6 w-6 text-primary" />
                  </div>
                  <h2 className="text-2xl font-bold text-foreground">
                    {editingItem ? "Edit Item" : "Add New Item"}
                  </h2>
                </div>
                <p className="text-sm text-muted-foreground ml-14">
                  {editingItem
                    ? "Update the details of your item"
                    : "Fill in the details to add a new item to your inventory"}
                </p>
              </div>

              {/* Basic Information */}
              <div className="mb-6">
                <div className="mb-4 flex items-center gap-2">
                  <h3 className="text-lg font-semibold text-foreground">
                    Basic Information
                  </h3>
                  <div className="flex-1 h-px bg-border" />
                </div>
                <div className="grid md:grid-cols-2 gap-5">
                  <div className="md:col-span-2">
                    <label className="mb-2 block text-sm font-semibold text-foreground">
                      Item Title <span className="text-destructive">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) =>
                        handleInputChange("title", e.target.value)
                      }
                      placeholder="e.g., Premium Membership"
                      className="w-full rounded-lg border-2 border-border bg-background px-4 py-3 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="mb-2 block text-sm font-semibold text-foreground">
                      Description
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) =>
                        handleInputChange("description", e.target.value)
                      }
                      placeholder="Detailed description of the item"
                      rows={4}
                      className="w-full rounded-lg border-2 border-border bg-background px-4 py-3 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all resize-none"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-foreground">
                      Item Type <span className="text-destructive">*</span>
                    </label>
                    <select
                      value={formData.item_type}
                      onChange={(e) =>
                        handleInputChange("item_type", e.target.value)
                      }
                      className="w-full rounded-lg border-2 border-border bg-background px-4 py-3 text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                    >
                      {itemTypes.map((type) => (
                        <option key={type} value={type}>
                          {type}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-foreground">
                      SKU <span className="text-destructive">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.sku}
                      onChange={(e) => handleInputChange("sku", e.target.value)}
                      placeholder="e.g., PROD-001"
                      className="w-full rounded-lg border-2 border-border bg-background px-4 py-3 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* Pricing */}
              <div className="mb-6">
                <div className="mb-4 flex items-center gap-2">
                  <h3 className="text-lg font-semibold text-foreground">
                    Pricing
                  </h3>
                  <div className="flex-1 h-px bg-border" />
                </div>
                <div className="grid md:grid-cols-3 gap-5">
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-foreground">
                      Price <span className="text-destructive">*</span>
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.price}
                      onChange={(e) =>
                        handleInputChange("price", e.target.value)
                      }
                      placeholder="0.00"
                      className="w-full rounded-lg border-2 border-border bg-background px-4 py-3 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-foreground">
                      Currency <span className="text-destructive">*</span>
                    </label>
                    <select
                      value={formData.currency}
                      onChange={(e) =>
                        handleInputChange("currency", e.target.value)
                      }
                      className="w-full rounded-lg border-2 border-border bg-background px-4 py-3 text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                    >
                      {currencies.map((currency) => (
                        <option key={currency.code} value={currency.code}>
                          {currency.symbol} {currency.code} - {currency.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-foreground">
                      Unit
                    </label>
                    <input
                      type="text"
                      value={formData.unit}
                      onChange={(e) =>
                        handleInputChange("unit", e.target.value)
                      }
                      placeholder="e.g., Piece, Box, Hour"
                      className="w-full rounded-lg border-2 border-border bg-background px-4 py-3 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* Additional Details */}
              <div className="mb-6">
                <div className="mb-4 flex items-center gap-2">
                  <h3 className="text-lg font-semibold text-foreground">
                    Additional Details
                  </h3>
                  <div className="flex-1 h-px bg-border" />
                </div>
                <div className="grid md:grid-cols-2 gap-5">
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-foreground">
                      Tags
                    </label>
                    <input
                      type="text"
                      value={formData.tags}
                      onChange={(e) =>
                        handleInputChange("tags", e.target.value)
                      }
                      placeholder="e.g., Premium, Featured"
                      className="w-full rounded-lg border-2 border-border bg-background px-4 py-3 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-foreground">
                      SEO Tags
                    </label>
                    <input
                      type="text"
                      value={formData.SEO_Tags}
                      onChange={(e) =>
                        handleInputChange("SEO_Tags", e.target.value)
                      }
                      placeholder="SEO keywords"
                      className="w-full rounded-lg border-2 border-border bg-background px-4 py-3 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-foreground">
                      Minimum Quantity
                    </label>
                    <input
                      type="number"
                      value={formData.min_quantity}
                      onChange={(e) =>
                        handleInputChange(
                          "min_quantity",
                          parseInt(e.target.value)
                        )
                      }
                      min={1}
                      className="w-full rounded-lg border-2 border-border bg-background px-4 py-3 text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-foreground">
                      Rank
                    </label>
                    <input
                      type="number"
                      value={formData.rank}
                      onChange={(e) =>
                        handleInputChange("rank", parseInt(e.target.value))
                      }
                      min={1}
                      className="w-full rounded-lg border-2 border-border bg-background px-4 py-3 text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                    />
                  </div>

                  <div className="md:col-span-2 pt-2">
                    <label className="flex items-center gap-3 cursor-pointer p-3 rounded-lg border-2 border-border hover:border-primary/30 transition-colors">
                      <input
                        type="checkbox"
                        checked={formData.Is_disabled}
                        onChange={(e) =>
                          handleInputChange("Is_disabled", e.target.checked)
                        }
                        className="h-5 w-5 rounded border-border text-primary focus:ring-2 focus:ring-primary"
                      />
                      <span className="text-sm font-semibold text-foreground">
                        Disable this item
                      </span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4 border-t-2 border-border">
                <button
                  onClick={handleCancelForm}
                  className="flex-1 flex items-center justify-center gap-2 rounded-lg bg-muted px-6 py-3.5 font-semibold text-foreground transition-all hover:bg-muted/80 hover:shadow-md"
                >
                  <X className="h-5 w-5" />
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex-1 flex items-center justify-center gap-2 rounded-lg bg-primary px-6 py-3.5 font-semibold text-primary-foreground transition-all hover:bg-primary/90 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      {editingItem ? "Updating..." : "Saving..."}
                    </>
                  ) : (
                    <>
                      <Save className="h-5 w-5" />
                      {editingItem ? "Update Item" : "Save Item"}
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Items Grid */}
        {!showForm && (
          <>
            {loading ? (
              <div className="flex flex-col items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
                <p className="text-muted-foreground">Loading items...</p>
              </div>
            ) : error && items.length === 0 ? (
              <div className="error-state">
                <div className="text-destructive text-4xl mb-2">⚠️</div>
                <h3 className="font-semibold text-foreground mb-2">
                  Error Loading Items
                </h3>
                <p className="text-sm text-muted-foreground mb-4">{error}</p>
                <button onClick={handleRefresh} className="btn-primary">
                  Try Again
                </button>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {filteredItems.length > 0 ? (
                  filteredItems.map((item) => (
                    <ItemCard
                      key={item.id}
                      item={item}
                      onEdit={handleEdit}
                      onDelete={handleDelete}
                      onRestore={handleRestore}
                    />
                  ))
                ) : (
                  <div className="col-span-full empty-state">
                    <div className="text-muted-foreground text-5xl mb-4">
                      📦
                    </div>
                    <h3 className="font-semibold text-foreground mb-2">
                      No Items Found
                    </h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      {searchQuery
                        ? "Try adjusting your search query"
                        : "Start adding items to your inventory"}
                    </p>
                    <button onClick={handleAddNew} className="btn-primary">
                      Add Your First Item
                    </button>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ManageItems;
