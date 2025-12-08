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
  Globe,
  Link2,
  FileText,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  createShop,
  getCustomer,
  getCurrentShop,
  updateShop,
} from "@/services/api";

const CompanyInfo = () => {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [hasShop, setHasShop] = useState(false);
  const [shopId, setShopId] = useState(null);
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
        return;
      }

      try {
        const shopData = await getCurrentShop();

        setShopId(shopData.id);
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

        if (shopData.id) {
          const existingShopId = localStorage.getItem("shopId");
          if (existingShopId !== shopData.id) {
            localStorage.setItem("shopId", shopData.id);
          }
        }
      } catch (err: any) {
        if (err.status === 404) {
          setHasShop(false);
          localStorage.removeItem("shopId");
        } else {
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

      const shopPayload = {
        name: formData.name,
        description: formData.description,
        logo: formData.logo,
        custom_domain: formData.custom_domain,
        Is_visible: formData.Is_visible ? 1 : 0,
        slug: formData.slug || "",
      };

      const savedShop = await createShop(shopPayload);

      if (!savedShop || !savedShop.id) {
        throw new Error("Shop creation failed - no shop ID returned");
      }

      localStorage.setItem("shopId", savedShop.id);

      setSuccess(true);

      setTimeout(() => {
        window.location.reload();
      }, 2000);
    } catch (err) {
      console.error("[CompanyInfo] ❌ Shop creation error:", err);
      setError(err.message || "Failed to create shop. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateShop = async () => {
    setError(null);
    setSuccess(false);

    if (!validateForm()) {
      return;
    }

    if (!shopId) {
      setError("Shop ID not found. Please refresh and try again.");
      return;
    }

    try {
      setSaving(true);

      const updatePayload = {
        name: formData.name,
        description: formData.description,
        logo: formData.logo,
        custom_domain: formData.custom_domain,
        Is_visible: formData.Is_visible ? 1 : 0,
        slug: formData.slug || "",
      };

      const updatedShop = await updateShop(shopId, updatePayload);

      setSuccess(true);

      // Auto-hide success message after 3 seconds
      setTimeout(() => {
        setSuccess(false);
      }, 3000);
    } catch (err) {
      console.error("[CompanyInfo] ❌ Shop update error:", err);
      setError(err.message || "Failed to update shop. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">
            Loading company information...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 pb-28">
      <div className="mx-auto max-w-4xl p-4 md:p-6 lg:p-8 fade-in-fast">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-4 mb-4">
            {hasShop && (
              <button
                onClick={() => navigate("/settings")}
                className="btn-secondary h-10 w-10 !p-0"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
            )}
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <div className="rounded-lg bg-primary/10 p-2">
                  <Building2 className="h-6 w-6 text-primary" />
                </div>
                <h1 className="font-heading text-2xl font-bold text-foreground md:text-3xl">
                  {hasShop ? "Company Profile" : "Create Your Company Profile"}
                </h1>
              </div>
              <p className="text-sm text-muted-foreground ml-14">
                {hasShop
                  ? "Update your company details"
                  : "Welcome! Set up your company profile to get started"}
              </p>
            </div>
          </div>

          {/* Success/Error Messages */}
          {success && (
            <div className="flex items-center gap-2 rounded-lg bg-success/10 border border-success/20 p-4 text-success animate-slideDown">
              <CheckCircle className="h-5 w-5 flex-shrink-0" />
              <span className="font-medium">
                {hasShop
                  ? "Shop updated successfully!"
                  : "Shop created successfully! Redirecting to home..."}
              </span>
            </div>
          )}

          {error && (
            <div className="flex items-center gap-2 rounded-lg bg-destructive/10 border border-destructive/20 p-4 text-destructive animate-slideDown">
              <AlertCircle className="h-5 w-5 flex-shrink-0" />
              <span className="font-medium">{error}</span>
            </div>
          )}
        </div>

        {/* Main Form Container */}
        <div className="rounded-2xl border-2 border-primary/20 bg-card p-6 md:p-8 shadow-lg">
          {/* Logo Upload Section */}
          <div className="mb-8 pb-6 border-b-2 border-border">
            <div className="mb-4 flex items-center gap-2">
              <h3 className="text-lg font-semibold text-foreground">
                Company Logo
              </h3>
              <div className="flex-1 h-px bg-border" />
            </div>

            <div className="flex flex-col md:flex-row items-start gap-6">
              {/* Logo Preview */}
              <div className="relative flex-shrink-0 w-full md:w-48">
                {logoPreview ? (
                  <div className="rounded-xl border-2 border-border bg-background p-4 transition-all hover:border-primary/30">
                    <img
                      src={logoPreview}
                      alt="Company Logo"
                      className="h-32 w-full object-contain"
                    />
                  </div>
                ) : (
                  <div className="h-40 w-full rounded-xl bg-muted flex flex-col items-center justify-center border-2 border-dashed border-border">
                    <Building2 className="h-12 w-12 text-muted-foreground mb-2" />
                    <span className="text-xs text-muted-foreground">
                      No logo uploaded
                    </span>
                  </div>
                )}
              </div>

              {/* Upload Controls */}
              <div className="flex-1 w-full">
                <label
                  htmlFor="logo-upload"
                  className="inline-flex items-center justify-center gap-2 rounded-lg px-6 py-3 text-sm font-semibold transition-all w-full md:w-auto bg-primary text-primary-foreground cursor-pointer hover:bg-primary/90 hover:shadow-lg"
                >
                  <Upload className="h-4 w-4" />
                  {logoPreview ? "Change Logo" : "Upload Logo"}
                </label>
                <input
                  id="logo-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  className="hidden"
                />
                <div className="mt-3 space-y-1">
                  <p className="text-sm text-muted-foreground">
                    Accepts any logo size or aspect ratio
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Recommended: 200px minimum height • PNG, JPG, SVG • Max 5MB
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Basic Information Section */}
          <div className="mb-8 pb-6 border-b-2 border-border">
            <div className="mb-4 flex items-center gap-2">
              <h3 className="text-lg font-semibold text-foreground">
                Basic Information
              </h3>
              <div className="flex-1 h-px bg-border" />
            </div>

            <div className="space-y-5">
              <div>
                <label className="mb-2 block text-sm font-semibold text-foreground">
                  Company Name <span className="text-destructive">*</span>
                </label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    onBlur={handleNameBlur}
                    placeholder="e.g., Your Company Name"
                    className="w-full rounded-lg border-2 border-border bg-background pl-11 pr-4 py-3 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-foreground">
                  Description
                </label>
                <div className="relative">
                  <FileText className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                  <textarea
                    value={formData.description}
                    onChange={(e) =>
                      handleInputChange("description", e.target.value)
                    }
                    placeholder="Brief description of your business"
                    rows={4}
                    className="w-full rounded-lg border-2 border-border bg-background pl-11 pr-4 py-3 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all resize-none"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Domain & URL Section */}
          <div className="mb-6">
            <div className="mb-4 flex items-center gap-2">
              <h3 className="text-lg font-semibold text-foreground">
                Domain & URL Settings
              </h3>
              <div className="flex-1 h-px bg-border" />
            </div>

            <div className="space-y-5">
              <div>
                <label className="mb-2 block text-sm font-semibold text-foreground">
                  Custom Domain <span className="text-destructive">*</span>
                </label>
                <div className="relative">
                  <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <input
                    type="text"
                    value={formData.custom_domain}
                    onChange={(e) =>
                      handleInputChange("custom_domain", e.target.value)
                    }
                    placeholder="e.g., yourcompany.com"
                    className="w-full rounded-lg border-2 border-border bg-background pl-11 pr-4 py-3 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-foreground">
                  URL Slug (Optional)
                </label>
                <div className="relative">
                  <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <input
                    type="text"
                    value={formData.slug}
                    onChange={(e) => handleInputChange("slug", e.target.value)}
                    placeholder="e.g., your-company"
                    className="w-full rounded-lg border-2 border-border bg-background pl-11 pr-4 py-3 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                  />
                </div>
                <p className="mt-2 text-xs text-muted-foreground">
                  Leave empty to auto-generate from company name
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-6 border-t-2 border-border">
            {!hasShop ? (
              <button
                onClick={handleCreateShop}
                disabled={saving}
                className="w-full flex items-center justify-center gap-2 rounded-lg bg-primary px-6 py-3.5 font-semibold text-primary-foreground transition-all hover:bg-primary/90 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Creating Shop...
                  </>
                ) : (
                  <>
                    <Save className="h-5 w-5" />
                    Create Shop & Continue
                  </>
                )}
              </button>
            ) : (
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={handleUpdateShop}
                  disabled={saving}
                  className="flex-1 flex items-center justify-center gap-2 rounded-lg bg-primary px-6 py-3.5 font-semibold text-primary-foreground transition-all hover:bg-primary/90 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Updating Shop...
                    </>
                  ) : (
                    <>
                      <Save className="h-5 w-5" />
                      Update Shop
                    </>
                  )}
                </button>
                <button
                  onClick={() => navigate("/settings")}
                  className="flex items-center justify-center gap-2 rounded-lg bg-muted px-6 py-3.5 font-semibold text-foreground transition-all hover:bg-muted/80 hover:shadow-md sm:w-auto"
                >
                  <ArrowLeft className="h-5 w-5" />
                  Back
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompanyInfo;
