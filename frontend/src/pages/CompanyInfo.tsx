import { useState, useEffect } from "react";
import {
  Building2,
  Upload,
  Save,
  ArrowLeft,
  Loader2,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { getShop, createShop, updateShop } from "@/services/api";

const CompanyInfo = () => {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [shopData, setShopData] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    logo: "",
    custom_domain: "",
    Is_visible: true,
    slug: "",
  });

  const [logoPreview, setLogoPreview] = useState(null);

  // Check if shop exists on mount
  useEffect(() => {
    checkExistingShop();
  }, []);

  const checkExistingShop = async () => {
    try {
      setLoading(true);

      // TODO: Get shop ID from Clerk user context
      // For now, we'll use localStorage
      const shopId = localStorage.getItem("shopId");

      if (shopId) {
        // Fetch existing shop data using API
        const data = await getShop(shopId);
        setShopData(data);
        setFormData({
          name: data.name,
          description: data.description,
          logo: data.logo,
          custom_domain: data.custom_domain,
          Is_visible: data.Is_visible,
          slug: data.slug,
        });
        setLogoPreview(data.logo);
        setIsEditMode(true);
      }
    } catch (err) {
      console.error("Error checking shop:", err);
      // Don't show error if shop doesn't exist (new user)
      if (err.status !== 404) {
        setError("Failed to load shop information");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleLogoUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        setError("File size must be less than 5MB");
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result);
        setFormData((prev) => ({
          ...prev,
          logo: reader.result,
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const generateSlug = (name) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  };

  const handleNameBlur = () => {
    if (formData.name && !formData.slug) {
      handleInputChange("slug", generateSlug(formData.name));
    }
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      setError("Company name is required");
      return false;
    }
    if (!formData.custom_domain.trim()) {
      setError("Custom domain is required");
      return false;
    }
    if (!formData.slug.trim()) {
      setError("Slug is required");
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    setError(null);
    setSuccess(false);

    if (!validateForm()) {
      return;
    }

    try {
      setSaving(true);

      const shopPayload = {
        name: formData.name,
        description: formData.description,
        logo: formData.logo,
        custom_domain: formData.custom_domain,
        Is_visible: formData.Is_visible ? 1 : 0,
        slug: formData.slug,
      };

      let data;
      if (isEditMode && shopData) {
        // Update existing shop
        data = await updateShop(shopData.id, shopPayload);
      } else {
        // Create new shop
        data = await createShop(shopPayload);
      }

      // Save shop ID to localStorage (later replace with Clerk)
      localStorage.setItem("shopId", data.id);

      setShopData(data);
      setSuccess(true);
      setIsEditMode(true);

      // Reset success message after 3 seconds
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error("Error saving shop:", err);
      setError(err.message || "Failed to save company information");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading company information...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 pb-28">
      <div className="mx-auto max-w-4xl p-4 md:p-6 lg:p-8">
        {/* Header */}
        <div className="mb-6 animate-fadeIn">
          <div className="flex items-center gap-4 mb-4">
            <button
              onClick={() => window.history.back()}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-sm transition-all hover:shadow-md"
            >
              <ArrowLeft className="h-5 w-5 text-gray-700" />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <Building2 className="h-6 w-6 text-blue-600" />
                <h1 className="text-2xl font-bold text-gray-900 md:text-3xl">
                  Company Information
                </h1>
              </div>
              <p className="text-sm text-gray-600">
                {isEditMode
                  ? "Update your company details"
                  : "Set up your company profile"}
              </p>
            </div>
          </div>

          {/* Success/Error Messages */}
          {success && (
            <div className="flex items-center gap-2 rounded-lg bg-green-50 border border-green-200 p-4 text-green-800 animate-slideDown">
              <CheckCircle className="h-5 w-5" />
              <span className="font-medium">
                Company information saved successfully!
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

        {/* Logo Upload */}
        <div
          className="mb-6 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm animate-fadeIn"
          style={{ animationDelay: "0.1s" }}
        >
          <h2 className="mb-4 text-lg font-semibold text-gray-900">
            Company Logo
          </h2>
          <div className="flex items-start gap-6">
            <div className="relative flex-shrink-0">
              {logoPreview ? (
                <div className="max-w-xs rounded-xl border-2 border-gray-200 bg-white p-3">
                  <img
                    src={logoPreview}
                    alt="Company Logo"
                    className="max-h-32 w-auto object-contain"
                  />
                </div>
              ) : (
                <div className="h-32 w-48 rounded-xl bg-gray-100 flex items-center justify-center border-2 border-dashed border-gray-300">
                  <Building2 className="h-10 w-10 text-gray-400" />
                </div>
              )}
            </div>
            <div className="flex-1">
              <label
                htmlFor="logo-upload"
                className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white cursor-pointer transition-all hover:bg-blue-700"
              >
                <Upload className="h-4 w-4" />
                Upload Logo
              </label>
              <input
                id="logo-upload"
                type="file"
                accept="image/*"
                onChange={handleLogoUpload}
                className="hidden"
              />
              <p className="mt-2 text-xs text-gray-500">
                Accepts any logo size or aspect ratio. Recommended minimum
                height: 200px
              </p>
              <p className="mt-1 text-xs text-gray-400">
                PNG, JPG, SVG supported. Max file size: 5MB
              </p>
            </div>
          </div>
        </div>

        {/* Basic Information */}
        <div
          className="mb-6 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm animate-fadeIn"
          style={{ animationDelay: "0.2s" }}
        >
          <h2 className="mb-4 text-lg font-semibold text-gray-900">
            Basic Information
          </h2>
          <div className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Company Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                onBlur={handleNameBlur}
                placeholder="e.g., Mrudgandh"
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) =>
                  handleInputChange("description", e.target.value)
                }
                placeholder="Brief description of your business"
                rows={3}
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Custom Domain *
              </label>
              <input
                type="text"
                value={formData.custom_domain}
                onChange={(e) =>
                  handleInputChange("custom_domain", e.target.value)
                }
                placeholder="e.g., mrudgandh.in or yourcompany.com"
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
              <p className="mt-1 text-xs text-gray-500">
                This will be used as your unique identifier in the system
              </p>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                URL Slug *
              </label>
              <input
                type="text"
                value={formData.slug}
                onChange={(e) => handleInputChange("slug", e.target.value)}
                placeholder="e.g., mrudgandhin"
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
              <p className="mt-1 text-xs text-gray-500">
                Auto-generated from company name. Only lowercase letters and
                hyphens.
              </p>
            </div>
          </div>
        </div>

        {/* Visibility Settings */}
        <div
          className="mb-6 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm animate-fadeIn"
          style={{ animationDelay: "0.3s" }}
        >
          <h2 className="mb-4 text-lg font-semibold text-gray-900">Settings</h2>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900">Shop Visibility</p>
              <p className="text-sm text-gray-600">
                Make your shop visible to customers
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={formData.Is_visible}
                onChange={(e) =>
                  handleInputChange("Is_visible", e.target.checked)
                }
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
        </div>

        {/* Shop Info Display */}
        {shopData && (
          <div
            className="mb-6 rounded-2xl border border-blue-200 bg-blue-50 p-6 animate-fadeIn"
            style={{ animationDelay: "0.4s" }}
          >
            <h2 className="mb-3 text-lg font-semibold text-gray-900">
              Shop Details
            </h2>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-600">Shop ID</p>
                <p className="font-mono text-gray-900 break-all">
                  {shopData.id}
                </p>
              </div>
              <div>
                <p className="text-gray-600">Created</p>
                <p className="text-gray-900">
                  {new Date(shopData.created_at).toLocaleDateString("en-IN")}
                </p>
              </div>
              <div>
                <p className="text-gray-600">Test Mode</p>
                <p className="text-gray-900">
                  {shopData.testmode ? "Enabled" : "Disabled"}
                </p>
              </div>
              <div>
                <p className="text-gray-600">Affiliate</p>
                <p className="text-gray-900">
                  {shopData.allow_affiliate ? "Enabled" : "Disabled"}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div
          className="flex gap-4 animate-fadeIn"
          style={{ animationDelay: "0.5s" }}
        >
          <button
            onClick={() => window.history.back()}
            className="flex-1 rounded-lg border border-gray-300 bg-white px-6 py-3 font-medium text-gray-700 transition-all hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={saving}
            className="flex-1 flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-6 py-3 font-medium text-white transition-all hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-5 w-5" />
                {isEditMode ? "Update Company" : "Create Company"}
              </>
            )}
          </button>
        </div>
      </div>

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

export default CompanyInfo;
