import { useState, useEffect } from "react";
import { useUser } from "@clerk/clerk-react";
import {
  Building2,
  Upload,
  Save,
  ArrowLeft,
  Loader2,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { createShop, getCustomer, getCurrentShop } from "@/services/api";

const CompanyInfo = () => {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [hasShop, setHasShop] = useState(false);
  const { user } = useUser();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    logo: "",
    custom_domain: "",
    Is_visible: true,
    slug: "",
  });

  const [logoPreview, setLogoPreview] = useState(null);

  useEffect(() => {
    checkUserShop();
  }, []);

  const checkUserShop = async () => {
    try {
      setLoading(true);

      if (!user?.id) {
        console.log("[CompanyInfo] No user");
        return;
      }

      console.log(
        "[CompanyInfo] 🔍 Checking if user has shop by calling GET /shop"
      );
      console.log(
        "[CompanyInfo] 📍 Will call: https://api.elegant.admin.wimsup.com/shop"
      );

      try {
        // SIMPLIFIED: Just try to fetch the shop directly
        // If it exists (200 OK), user has a shop
        // If it doesn't exist (404), user needs to create one
        const shopData = await getCurrentShop();

        console.log("[CompanyInfo] ✅ Shop found:", shopData);

        // Shop exists - fill the form
        setFormData({
          name: shopData.name || "",
          description: shopData.description || "",
          logo: shopData.logo || "",
          custom_domain: shopData.custom_domain || "",
          Is_visible: shopData.Is_visible ?? true,
          slug: shopData.slug || "",
        });

        setLogoPreview(shopData.logo);
        setHasShop(true);

        // Save shop ID if not already saved
        if (shopData.id) {
          const existingShopId = localStorage.getItem("shopId");
          if (existingShopId !== shopData.id) {
            localStorage.setItem("shopId", shopData.id);
            console.log("[CompanyInfo] 💾 Shop ID saved:", shopData.id);
          }
        }

        console.log("[CompanyInfo] ✅ Shop details loaded successfully");
      } catch (err: any) {
        // If GET /shop returns 404, user doesn't have a shop yet
        if (err.status === 404) {
          console.log(
            "[CompanyInfo] ℹ️ No shop found (404) - user needs to create one"
          );
          setHasShop(false);

          // Clear any stale shop ID
          localStorage.removeItem("shopId");
        } else {
          // Other errors (401, 500, etc.)
          console.error("[CompanyInfo] ❌ Error fetching shop:", err);
          setError("Failed to load shop details. Please try again.");
          setHasShop(false);
        }
      }
    } catch (err: any) {
      console.error("[CompanyInfo] ❌ Unexpected error:", err);
      setError("An unexpected error occurred");
      setHasShop(false);
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
    return true;
  };

  const handleCreateShop = async () => {
    setError(null);
    setSuccess(false);

    if (!validateForm()) {
      return;
    }

    try {
      setSaving(true);
      console.log("[CompanyInfo] 💾 Creating shop...");

      const shopPayload = {
        name: formData.name,
        description: formData.description,
        logo: formData.logo,
        custom_domain: formData.custom_domain,
        Is_visible: formData.Is_visible ? 1 : 0,
        slug: formData.slug || "",
      };

      console.log(
        "[CompanyInfo] 🔍 Shop Payload:",
        JSON.stringify(shopPayload, null, 2)
      );

      // Create shop using POST /shops
      const savedShop = await createShop(shopPayload);

      console.log("[CompanyInfo] 📥 POST /shops Response:", savedShop);

      if (!savedShop || !savedShop.id) {
        throw new Error("Shop creation failed - no shop ID returned");
      }

      console.log("[CompanyInfo] ✅ Shop created with ID:", savedShop.id);

      // Save shop ID to localStorage
      localStorage.setItem("shopId", savedShop.id);
      console.log("[CompanyInfo] 💾 Shop ID saved to localStorage");

      setSuccess(true);

      console.log("[CompanyInfo] ✅ Shop creation complete!");
      console.log(
        "[CompanyInfo] ⚠️  Note: Backend needs time to generate authToken"
      );
      console.log(
        "[CompanyInfo] 🔄 Performing full reload to re-initialize with new token..."
      );

      // Wait 2 seconds to show success message, then reload
      setTimeout(() => {
        console.log("[CompanyInfo] 🔄 Reloading page...");
        // Force full page reload to trigger re-initialization in App.tsx
        // This will call initializeCustomer() again which will get the new authToken
        window.location.reload();
      }, 2000);
    } catch (err) {
      console.error("[CompanyInfo] ❌ Shop creation error:", err);
      setError(err.message || "Failed to create shop. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 pb-28">
      <div className="mx-auto max-w-4xl p-4 md:p-6 lg:p-8">
        {/* Header */}
        <div className="mb-4 md:mb-6 animate-fadeIn">
          <div className="flex items-start gap-3 md:gap-4 mb-4">
            {hasShop && (
              <button
                onClick={() => navigate("/home")}
                className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-white shadow-sm transition-all hover:shadow-md"
              >
                <ArrowLeft className="h-5 w-5 text-gray-700" />
              </button>
            )}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <Building2 className="h-5 w-5 md:h-6 md:w-6 text-blue-600 flex-shrink-0" />
                <h1 className="text-xl md:text-2xl lg:text-3xl font-bold text-gray-900 break-words">
                  {hasShop
                    ? "Your Company Profile"
                    : "Create Your Company Profile"}
                </h1>
              </div>
              <p className="text-xs md:text-sm text-gray-600">
                {hasShop
                  ? "View your company details"
                  : "Welcome! Set up your company profile to get started"}
              </p>
            </div>
          </div>

          {/* Success/Error Messages */}
          {success && (
            <div className="flex items-start gap-2 rounded-lg bg-green-50 border border-green-200 p-3 md:p-4 text-green-800 animate-slideDown">
              <CheckCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
              <span className="text-sm md:text-base font-medium">
                Shop created successfully! Redirecting to home...
              </span>
            </div>
          )}

          {error && (
            <div className="flex items-start gap-2 rounded-lg bg-red-50 border border-red-200 p-3 md:p-4 text-red-800 animate-slideDown">
              <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
              <span className="text-sm md:text-base font-medium break-words">
                {error}
              </span>
            </div>
          )}
        </div>

        {/* Logo Upload */}
        <div
          className="mb-4 md:mb-6 rounded-xl md:rounded-2xl border border-gray-200 bg-white p-4 md:p-6 shadow-sm animate-fadeIn"
          style={{ animationDelay: "0.1s" }}
        >
          <h2 className="mb-4 text-base md:text-lg font-semibold text-gray-900">
            Company Logo
          </h2>
          <div className="flex flex-col sm:flex-row items-start gap-4 md:gap-6">
            <div className="relative flex-shrink-0 w-full sm:w-auto">
              {logoPreview ? (
                <div className="w-full sm:max-w-xs rounded-xl border-2 border-gray-200 bg-white p-3">
                  <img
                    src={logoPreview}
                    alt="Company Logo"
                    className="max-h-32 w-full sm:w-auto object-contain"
                  />
                </div>
              ) : (
                <div className="h-32 w-full sm:w-48 rounded-xl bg-gray-100 flex items-center justify-center border-2 border-dashed border-gray-300">
                  <Building2 className="h-10 w-10 text-gray-400" />
                </div>
              )}
            </div>
            <div className="flex-1 w-full sm:w-auto">
              <label
                htmlFor="logo-upload"
                className={`inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition-all hover:bg-blue-700 w-full sm:w-auto ${
                  hasShop ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
                }`}
              >
                <Upload className="h-4 w-4" />
                Upload Logo
              </label>
              <input
                id="logo-upload"
                type="file"
                accept="image/*"
                onChange={handleLogoUpload}
                disabled={hasShop}
                className="hidden"
              />
              <p className="mt-2 text-xs text-gray-500 break-words">
                Accepts any logo size or aspect ratio. Recommended minimum
                height: 200px
              </p>
              <p className="mt-1 text-xs text-gray-400 break-words">
                PNG, JPG, SVG supported. Max file size: 5MB
              </p>
            </div>
          </div>
        </div>

        {/* Basic Information */}
        <div
          className="mb-4 md:mb-6 rounded-xl md:rounded-2xl border border-gray-200 bg-white p-4 md:p-6 shadow-sm animate-fadeIn"
          style={{ animationDelay: "0.2s" }}
        >
          <h2 className="mb-4 text-base md:text-lg font-semibold text-gray-900">
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
                placeholder="e.g., Your Company Name"
                disabled={hasShop}
                className="w-full rounded-lg border border-gray-300 bg-white px-3 md:px-4 py-2.5 text-sm md:text-base text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
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
                disabled={hasShop}
                className="w-full rounded-lg border border-gray-300 bg-white px-3 md:px-4 py-2.5 text-sm md:text-base text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed resize-none"
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
                placeholder="e.g., yourcompany.com"
                disabled={hasShop}
                className="w-full rounded-lg border border-gray-300 bg-white px-3 md:px-4 py-2.5 text-sm md:text-base text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
              />
              <p className="mt-1.5 text-xs text-gray-500 break-words">
                This will be used as your unique identifier in the system
              </p>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                URL Slug (Optional)
              </label>
              <input
                type="text"
                value={formData.slug}
                onChange={(e) => handleInputChange("slug", e.target.value)}
                placeholder="e.g., your-company"
                disabled={hasShop}
                className="w-full rounded-lg border border-gray-300 bg-white px-3 md:px-4 py-2.5 text-sm md:text-base text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
              />
              <p className="mt-1.5 text-xs text-gray-500 break-words">
                Optional. Leave empty to auto-generate from company name.
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div
          className="space-y-3 md:space-y-4 animate-fadeIn"
          style={{ animationDelay: "0.5s" }}
        >
          {!hasShop ? (
            <button
              onClick={handleCreateShop}
              disabled={saving}
              className="w-full flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-6 py-3 text-sm md:text-base font-medium text-white transition-all hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Creating Shop...
                </>
              ) : (
                <>
                  <Save className="h-5 w-5" />
                  Create Shop
                </>
              )}
            </button>
          ) : (
            <div className="flex gap-3 md:gap-4">
              <button
                onClick={() => navigate("/home")}
                className="flex-1 rounded-lg border border-gray-300 bg-white px-6 py-3 text-sm md:text-base font-medium text-gray-700 transition-all hover:bg-gray-50"
              >
                Back to Home
              </button>
            </div>
          )}
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
