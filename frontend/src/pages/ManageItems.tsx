import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Save,
  Loader2,
  CheckCircle,
  AlertCircle,
  Package,
  List,
  X,
  RefreshCw,
  Edit,
  Trash2,
} from "lucide-react";
import {
  createItem,
  getAllItemsSimple,
  updateItem,
  deleteItem,
} from "@/services/api";

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

const ManageItems = () => {
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [showItemsModal, setShowItemsModal] = useState(false);
  const [editingItem, setEditingItem] = useState<Item | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  const [items, setItems] = useState<Item[]>([]);

  const [formData, setFormData] = useState<FormData>({
    title: "",
    description: "",
    item_type: "Product",
    price: "",
    unit: "",
    currency: "USD",
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

  const itemTypes: string[] = [
    "Event",
    "Product",
    "Service",
    "Blog",
    "Cart item",
    "Booking",
    "Job",
    "Property",
    "Book",
    "Profile",
    "Recipe",
    "Local Business",
    "Agent",
    "Build",
    "About",
    "Application",
    "Task",
    "Note",
    "Video",
    "Lenders",
    "Plumbers",
    "Media",
    "Appraisals",
    "Photographers",
    "Plan",
    "Subscription",
    "Vendors",
    "Contributors",
    "Newsletters",
    "Course",
    "Minerals",
    "Jewelry",
    "Classes",
    "Instructor",
    "Membership",
  ];

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
      console.log("[ManageItems] ✅ Loaded items:", response.items.length);
    } catch (err: any) {
      console.error("[ManageItems] ❌ Failed to load items:", err);
      setError(err.message || "Failed to load items");
    } finally {
      setLoading(false);
    }
  };

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

      if (isEditing && editingItem) {
        // UPDATE existing item
        console.log("[ManageItems] 📤 Updating item:", editingItem.id, payload);
        response = await updateItem(editingItem.id, payload);
        console.log("[ManageItems] ✅ Item updated:", response);

        // Update in local state
        setItems((prev) =>
          prev.map((item) => (item.id === editingItem.id ? response : item))
        );
      } else {
        // CREATE new item
        console.log("[ManageItems] 📤 Creating item:", payload);
        response = await createItem(payload);
        console.log("[ManageItems] ✅ Item created:", response);

        // Add to local state
        setItems((prev) => [response, ...prev]);
      }

      setSuccess(true);

      // Reset form
      resetForm();

      setTimeout(() => {
        setSuccess(false);
      }, 3000);
    } catch (err: any) {
      console.error("[ManageItems] ❌ Save error:", err);
      setError(err.message || "Failed to save item. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (item: Item) => {
    setIsEditing(true);
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
    setShowItemsModal(false);
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
      console.log("[ManageItems] ✅ Item disabled:", itemId);
    } catch (err: any) {
      console.error("[ManageItems] ❌ Delete error:", err);
      setError(err.message || "Failed to disable item");
    }
  };

  const resetForm = () => {
    setIsEditing(false);
    setEditingItem(null);
    setFormData({
      title: "",
      description: "",
      item_type: "Product",
      price: "",
      unit: "",
      currency: "USD",
      sku: "",
      tags: "",
      SEO_Tags: "",
      min_quantity: 1,
      rank: 1,
      Is_disabled: false,
    });
  };

  const ItemsModal = () => (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-4xl max-h-[90vh] overflow-hidden rounded-2xl bg-white shadow-2xl">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-gray-200 p-6">
          <div className="flex items-center gap-3">
            <List className="h-6 w-6 text-blue-600" />
            <h2 className="text-2xl font-bold text-gray-900">All Items</h2>
            <span className="rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-700">
              {items.length}
            </span>
          </div>
          <button
            onClick={() => setShowItemsModal(false)}
            className="rounded-full p-2 transition-colors hover:bg-gray-100"
          >
            <X className="h-6 w-6 text-gray-500" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="max-h-[calc(90vh-140px)] overflow-y-auto p-6">
          {loading ? (
            <div className="py-12 text-center">
              <Loader2 className="mx-auto h-16 w-16 animate-spin text-blue-600" />
              <p className="mt-4 text-gray-500">Loading items...</p>
            </div>
          ) : items.length === 0 ? (
            <div className="py-12 text-center">
              <Package className="mx-auto h-16 w-16 text-gray-300" />
              <p className="mt-4 text-gray-500">No items added yet</p>
            </div>
          ) : (
            <div className="space-y-4">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="rounded-xl border border-gray-200 bg-white p-4 transition-all hover:shadow-md"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold text-gray-900">
                          {item.title}
                        </h3>
                        <span className="rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-700">
                          {item.item_type}
                        </span>
                        {item.Is_disabled && (
                          <span className="rounded-full bg-red-100 px-2 py-1 text-xs font-medium text-red-700">
                            Disabled
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mb-2">
                        {item.description}
                      </p>
                      <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                        <span>
                          <strong>Price:</strong> {item.currency} {item.price}
                        </span>
                        <span>
                          <strong>SKU:</strong> {item.sku}
                        </span>
                        {item.unit && (
                          <span>
                            <strong>Unit:</strong> {item.unit}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(item)}
                        className="flex items-center gap-1 rounded-lg bg-blue-100 px-3 py-2 text-sm font-medium text-blue-700 transition-all hover:bg-blue-200"
                      >
                        <Edit className="h-4 w-4" />
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(item.id)}
                        disabled={item.Is_disabled}
                        className="flex items-center gap-1 rounded-lg bg-red-100 px-3 py-2 text-sm font-medium text-red-700 transition-all hover:bg-red-200 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Trash2 className="h-4 w-4" />
                        {item.Is_disabled ? "Disabled" : "Delete"}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 pb-28">
      <div className="mx-auto max-w-5xl p-4 md:p-6 lg:p-8">
        {/* Header */}
        <div className="mb-6 animate-fadeIn">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate("/settings")}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-sm transition-all hover:shadow-md"
              >
                <ArrowLeft className="h-5 w-5 text-gray-700" />
              </button>
              <div>
                <div className="flex items-center gap-2">
                  <Package className="h-6 w-6 text-blue-600" />
                  <h1 className="text-2xl font-bold text-gray-900 md:text-3xl">
                    {isEditing ? "Edit Item" : "Manage Items"}
                  </h1>
                </div>
                <p className="text-sm text-gray-600">
                  {isEditing
                    ? "Update item details"
                    : "Add and manage your inventory items"}
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={loadItems}
                disabled={loading}
                className="flex items-center gap-2 rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 transition-all hover:bg-gray-200 disabled:opacity-50"
              >
                <RefreshCw
                  className={`h-4 w-4 ${loading ? "animate-spin" : ""}`}
                />
                Refresh
              </button>
              <button
                onClick={() => setShowItemsModal(true)}
                className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-all hover:bg-blue-700"
              >
                <List className="h-4 w-4" />
                View All ({items.length})
              </button>
            </div>
          </div>

          {/* Success/Error Messages */}
          {success && (
            <div className="flex items-center gap-2 rounded-lg bg-green-50 border border-green-200 p-4 text-green-800 animate-slideDown">
              <CheckCircle className="h-5 w-5" />
              <span className="font-medium">
                {isEditing
                  ? "Item updated successfully!"
                  : "Item saved successfully!"}
              </span>
            </div>
          )}

          {error && (
            <div className="flex items-center gap-2 rounded-lg bg-red-50 border border-red-200 p-4 text-red-800 animate-slideDown">
              <AlertCircle className="h-5 w-5" />
              <span className="font-medium">{error}</span>
            </div>
          )}
        </div>

        {/* Basic Information */}
        <div
          className="mb-6 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm animate-fadeIn"
          style={{ animationDelay: "0.1s" }}
        >
          <h2 className="mb-4 text-lg font-semibold text-gray-900">
            Basic Information
          </h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Item Title *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => handleInputChange("title", e.target.value)}
                placeholder="e.g., New Membership Multi-Year"
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>

            <div className="md:col-span-2">
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) =>
                  handleInputChange("description", e.target.value)
                }
                placeholder="Detailed description of the item"
                rows={4}
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Item Type *
              </label>
              <select
                value={formData.item_type}
                onChange={(e) => handleInputChange("item_type", e.target.value)}
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              >
                {itemTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                SKU *
              </label>
              <input
                type="text"
                value={formData.sku}
                onChange={(e) => handleInputChange("sku", e.target.value)}
                placeholder="e.g., PROD-001"
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>
          </div>
        </div>

        {/* Pricing */}
        <div
          className="mb-6 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm animate-fadeIn"
          style={{ animationDelay: "0.2s" }}
        >
          <h2 className="mb-4 text-lg font-semibold text-gray-900">Pricing</h2>
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Price *
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.price}
                onChange={(e) => handleInputChange("price", e.target.value)}
                placeholder="0.00"
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Currency *
              </label>
              <select
                value={formData.currency}
                onChange={(e) => handleInputChange("currency", e.target.value)}
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              >
                {currencies.map((currency) => (
                  <option key={currency.code} value={currency.code}>
                    {currency.symbol} {currency.code} - {currency.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Unit
              </label>
              <input
                type="text"
                value={formData.unit}
                onChange={(e) => handleInputChange("unit", e.target.value)}
                placeholder="e.g., Piece, Box, Hour"
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>
          </div>
        </div>

        {/* Additional Details */}
        <div
          className="mb-6 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm animate-fadeIn"
          style={{ animationDelay: "0.3s" }}
        >
          <h2 className="mb-4 text-lg font-semibold text-gray-900">
            Additional Details
          </h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Tags
              </label>
              <input
                type="text"
                value={formData.tags}
                onChange={(e) => handleInputChange("tags", e.target.value)}
                placeholder="e.g., Premium, Featured"
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                SEO Tags
              </label>
              <input
                type="text"
                value={formData.SEO_Tags}
                onChange={(e) => handleInputChange("SEO_Tags", e.target.value)}
                placeholder="SEO keywords"
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Minimum Quantity
              </label>
              <input
                type="number"
                value={formData.min_quantity}
                onChange={(e) =>
                  handleInputChange("min_quantity", parseInt(e.target.value))
                }
                min={1}
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Rank
              </label>
              <input
                type="number"
                value={formData.rank}
                onChange={(e) =>
                  handleInputChange("rank", parseInt(e.target.value))
                }
                min={1}
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>

            <div className="md:col-span-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.Is_disabled}
                  onChange={(e) =>
                    handleInputChange("Is_disabled", e.target.checked)
                  }
                  className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500"
                />
                <span className="text-sm font-medium text-gray-700">
                  Disable this item
                </span>
              </label>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div
          className="animate-fadeIn space-y-4"
          style={{ animationDelay: "0.4s" }}
        >
          {isEditing && (
            <button
              onClick={resetForm}
              className="w-full flex items-center justify-center gap-2 rounded-lg bg-gray-100 px-6 py-3 font-medium text-gray-700 transition-all hover:bg-gray-200"
            >
              <X className="h-5 w-5" />
              Cancel Edit
            </button>
          )}

          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-6 py-3 font-medium text-white transition-all hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                {isEditing ? "Updating..." : "Saving..."}
              </>
            ) : (
              <>
                <Save className="h-5 w-5" />
                {isEditing ? "Update Item" : "Save Item"}
              </>
            )}
          </button>
        </div>
      </div>

      {/* Items Modal */}
      {showItemsModal && <ItemsModal />}

      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out forwards;
          opacity: 0;
        }

        .animate-slideDown {
          animation: slideDown 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default ManageItems;
