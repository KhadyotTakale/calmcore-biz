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
  Crown,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  createShop,
  getCustomer,
  getShopFranchisorByShopId,
  grantShopOwnership,
  refreshCustomerToken,
  getCurrentShop,
} from "@/services/api";

const CompanyInfo = () => {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const { user } = useUser();
  const navigate = useNavigate();

  // NEW: Track flow state
  const [flowState, setFlowState] = useState("initial"); // initial, shop_created, ownership_granted
  const [createdShopId, setCreatedShopId] = useState(null);
  const [grantingOwnership, setGrantingOwnership] = useState(false);

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

      console.log("[CompanyInfo] Checking if user has own shop");

      const customerData = await getCustomer();

      console.log("[CompanyInfo] Customer data:", {
        hasShopsField: !!customerData._shops,
        shopsId: customerData._shops?.id,
        hasAuthToken: !!customerData.authToken,
        isOwner: customerData._customer_roles_of_customers_of_shops?.is_owner,
      });

      const userShopId = localStorage.getItem("shopId");

      if (userShopId && customerData._shops?.id === userShopId) {
        console.log("[CompanyInfo] ✅ User has own shop:", userShopId);

        setFormData({
          name: customerData._shops.name,
          description: customerData._shops.description,
          logo: customerData._shops.logo,
          custom_domain: customerData._shops.custom_domain,
          Is_visible: customerData._shops.Is_visible,
          slug: customerData._shops.slug || "",
        });
        setLogoPreview(customerData._shops.logo);
        setIsEditMode(true);

        const hasAuthToken =
          customerData.authToken && customerData.authToken.trim() !== "";
        const isOwner =
          customerData._customer_roles_of_customers_of_shops?.is_owner;

        if (hasAuthToken && isOwner) {
          setFlowState("ownership_granted");
        } else {
          setFlowState("shop_created");
          setCreatedShopId(userShopId);
        }
      } else if (userShopId && !customerData._shops) {
        // User has a shop ID but /customer doesn't return shop data yet
        // This happens right after creating shop - backend needs to update
        console.log(
          "[CompanyInfo] ⚠️ Shop ID exists but not in /customer response yet"
        );
        console.log(
          "[CompanyInfo] Checking if shop exists via franchisor endpoint..."
        );

        try {
          // Verify shop exists
          const franchisorData = await getShopFranchisorByShopId(userShopId);

          if (franchisorData && franchisorData.length > 0) {
            const ownerSet = franchisorData[0].owner_customers_id;
            console.log("[CompanyInfo] ✅ Shop verified via franchisor:", {
              shopId: userShopId,
              hasOwner: !!ownerSet,
            });

            // Shop exists! Show the grant ownership button
            setFlowState("shop_created");
            setCreatedShopId(userShopId);
            setIsEditMode(false);
          } else {
            console.log("[CompanyInfo] ℹ️ No shop found");
            setFlowState("initial");
          }
        } catch (err) {
          console.error("[CompanyInfo] Error verifying shop:", err);
          setFlowState("initial");
        }
      } else {
        console.log(
          "[CompanyInfo] ℹ️  User doesn't have own shop - show empty form"
        );
        setFlowState("initial");
      }
    } catch (err) {
      console.error("[CompanyInfo] Error checking shop:", err);

      if (err.status !== 404 && err.status !== 401) {
        console.error("[CompanyInfo] Unexpected error:", err);
      } else {
        console.log("[CompanyInfo] ℹ️  New user - this is normal");
      }

      setFlowState("initial");
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
      console.log("[CompanyInfo] 💾 Step 1: Creating user's own shop...");

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

      // Step 1: Create shop using POST /shops
      const savedShop = await createShop(shopPayload);

      console.log("[CompanyInfo] 📥 POST /shops Response:", savedShop);

      if (!savedShop || !savedShop.id) {
        throw new Error("Shop creation failed - no shop ID returned");
      }

      console.log("[CompanyInfo] ✅ Shop created with ID:", savedShop.id);

      // Save shop ID to localStorage and state
      localStorage.setItem("shopId", savedShop.id);
      setCreatedShopId(savedShop.id);
      console.log("[CompanyInfo] 💾 Shop ID saved to localStorage");

      // Update form with saved data
      setFormData({
        name: savedShop.name,
        description: savedShop.description,
        logo: savedShop.logo,
        custom_domain: savedShop.custom_domain,
        Is_visible: savedShop.Is_visible,
        slug: savedShop.slug || "",
      });
      setLogoPreview(savedShop.logo);

      // Move to next state
      setFlowState("shop_created");
      setSuccess(true);

      console.log(
        "[CompanyInfo] ✅ Shop creation complete! Now grant ownership."
      );
    } catch (err) {
      console.error("[CompanyInfo] ❌ Shop creation error:", err);
      setError(err.message || "Failed to create shop. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleGrantOwnership = async () => {
    setError(null);
    setSuccess(false);

    try {
      setGrantingOwnership(true);
      console.log(
        "[CompanyInfo] 🔑 Step 2: Starting ownership grant process..."
      );

      if (!createdShopId) {
        throw new Error("No shop ID found. Please create a shop first.");
      }

      console.log("[CompanyInfo] 📋 Using Shop ID:", createdShopId);

      // Step 2: Get franchisor relationship using GET /shop_franchisor_by_shops_id/{shopId}
      console.log("[CompanyInfo] 🔍 Fetching franchisor relationship...");
      const franchisorData = await getShopFranchisorByShopId(createdShopId);

      if (!franchisorData || franchisorData.length === 0) {
        throw new Error("No franchisor relationship found for this shop");
      }

      const franchisor = franchisorData[0];
      console.log("[CompanyInfo] ✅ Franchisor found:", {
        id: franchisor.id,
        franchiseId: franchisor.franchise_id,
      });

      // Step 3: Grant ownership using PUT /shops_franchisor_owner/{id}/{franchiseId}
      console.log("[CompanyInfo] 👑 Granting ownership...");
      await grantShopOwnership(franchisor.id, franchisor.franchise_id);

      console.log("[CompanyInfo] ✅ Ownership granted successfully!");

      // Step 4: Verify ownership was set
      console.log("[CompanyInfo] 🔄 Verifying ownership was set...");

      // Wait a moment for backend to propagate
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Verify by checking franchisor relationship again
      const verifyData = await getShopFranchisorByShopId(createdShopId);
      const verifiedOwner = verifyData[0]?.owner_customers_id;

      console.log("[CompanyInfo] Verification:", {
        franchisorId: verifyData[0]?.id,
        ownerId: verifiedOwner,
        expectedShopId: createdShopId,
        hasOwner: !!verifiedOwner,
        ownerMatchesShop: verifiedOwner === createdShopId,
      });

      // Check if ownership was set (owner_customers_id should match franchise_id)
      if (verifiedOwner) {
        console.log(
          "[CompanyInfo] ✅ Ownership verified! Owner ID:",
          verifiedOwner
        );
        console.log(
          "[CompanyInfo] ✅ User is now owner of shop:",
          createdShopId
        );

        setSuccess(true);
        setFlowState("ownership_granted");

        // Show success message
        setTimeout(() => {
          console.log("[CompanyInfo] 🔄 Reloading to apply new ownership...");
          console.log(
            "[CompanyInfo] Note: Backend /customer endpoint will now return new shop data"
          );

          // Force full page reload to reinitialize everything
          window.location.reload();
        }, 2000);
      } else {
        // This shouldn't happen if PUT succeeded
        console.error("[CompanyInfo] ❌ Ownership verification failed!");
        console.error(
          "[CompanyInfo] PUT succeeded but owner_customers_id not set"
        );
        throw new Error(
          "Ownership grant succeeded but verification failed. Please contact support."
        );
      }
    } catch (err) {
      console.error("[CompanyInfo] ❌ Ownership grant error:", err);
      setError(err.message || "Failed to grant ownership. Please try again.");
    } finally {
      setGrantingOwnership(false);
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
        <div className="mb-6 animate-fadeIn">
          <div className="flex items-center gap-4 mb-4">
            {flowState === "ownership_granted" && (
              <button
                onClick={() => navigate("/home")}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-sm transition-all hover:shadow-md"
              >
                <ArrowLeft className="h-5 w-5 text-gray-700" />
              </button>
            )}
            <div>
              <div className="flex items-center gap-2">
                <Building2 className="h-6 w-6 text-blue-600" />
                <h1 className="text-2xl font-bold text-gray-900 md:text-3xl">
                  {flowState === "ownership_granted"
                    ? "Edit Company Profile"
                    : "Create Your Company Profile"}
                </h1>
              </div>
              <p className="text-sm text-gray-600">
                {flowState === "initial" &&
                  "Welcome! Set up your company profile to get started"}
                {flowState === "shop_created" &&
                  "Shop created! Now grant yourself ownership"}
                {flowState === "ownership_granted" &&
                  "Update your company details"}
              </p>
            </div>
          </div>

          {/* Success/Error Messages */}
          {success && (
            <div className="flex items-center gap-2 rounded-lg bg-green-50 border border-green-200 p-4 text-green-800 animate-slideDown">
              <CheckCircle className="h-5 w-5" />
              <span className="font-medium">
                {flowState === "shop_created" &&
                  "Shop created successfully! Now grant ownership to access all features."}
                {flowState === "ownership_granted" &&
                  "Ownership granted! Redirecting to home..."}
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
                className={`inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-all hover:bg-blue-700 ${
                  flowState !== "initial"
                    ? "opacity-50 cursor-not-allowed"
                    : "cursor-pointer"
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
                disabled={flowState !== "initial"}
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
                placeholder="e.g., Your Company Name"
                disabled={flowState !== "initial"}
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
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
                disabled={flowState !== "initial"}
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
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
                disabled={flowState !== "initial"}
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
              />
              <p className="mt-1 text-xs text-gray-500">
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
                placeholder="e.g., your-company (leave empty for auto-generate)"
                disabled={flowState !== "initial"}
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
              />
              <p className="mt-1 text-xs text-gray-500">
                Optional. Leave empty to auto-generate from company name.
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div
          className="space-y-4 animate-fadeIn"
          style={{ animationDelay: "0.5s" }}
        >
          {/* Step 1: Create Shop Button */}
          {flowState === "initial" && (
            <button
              onClick={handleCreateShop}
              disabled={saving}
              className="w-full flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-6 py-3 font-medium text-white transition-all hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
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
          )}

          {/* Step 2: Grant Ownership Button */}
          {flowState === "shop_created" && (
            <div className="rounded-lg border-2 border-orange-200 bg-orange-50 p-4">
              <div className="mb-3 flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-orange-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h3 className="font-semibold text-orange-900 mb-1">
                    Ownership Required
                  </h3>
                  <p className="text-sm text-orange-700 mb-3">
                    Your shop has been created successfully! To access all
                    features and manage your business, you need to claim
                    ownership.
                  </p>
                  <button
                    onClick={handleGrantOwnership}
                    disabled={grantingOwnership}
                    className="w-full flex items-center justify-center gap-2 rounded-lg bg-orange-600 px-6 py-3 font-medium text-white transition-all hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {grantingOwnership ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin" />
                        Granting Ownership...
                      </>
                    ) : (
                      <>
                        <Crown className="h-5 w-5" />
                        Grant Ownership
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Edit Mode (After ownership granted) */}
          {flowState === "ownership_granted" && (
            <div className="flex gap-4">
              <button
                onClick={() => navigate("/home")}
                className="flex-1 rounded-lg border border-gray-300 bg-white px-6 py-3 font-medium text-gray-700 transition-all hover:bg-gray-50"
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
