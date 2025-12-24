import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  User,
  Mail,
  Phone,
  Building,
  Upload,
  Save,
  ArrowLeft,
  Loader2,
  CheckCircle,
  AlertCircle,
  FileText,
  MapPin,
  CreditCard,
  Users,
  Image,
  LayoutTemplate,
} from "lucide-react";
import { getShopInfo, updateShopInfo } from "@/services/api";
import { logger } from "@/services/logger";

const Profile = () => {
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    logo_url: "",
    company_name: "",
    address: "",
    email: "",
    phone: "",
    declaration: "",
    bank_details: {
      beneficiary_name: "",
      account_number: "",
      bank_name: "",
      branch: "",
      ifsc_code: "",
    },
    signature: "",
    preferred_template: "modern", // Default to modern template
  });

  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [signaturePreview, setSignaturePreview] = useState<string | null>(null);

  useEffect(() => {
    loadShopInfo();
  }, []);

  const loadShopInfo = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await getShopInfo();

      if (response.shops_settings) {
        const settings = response.shops_settings;

        setFormData({
          logo_url: settings.logo_url || "",
          company_name: settings.company_name || "",
          address: settings.address || "",
          email: settings.email || "",
          phone: settings.phone || "",
          declaration: settings.declaration || "",
          bank_details: {
            beneficiary_name: settings.bank_details?.beneficiary_name || "",
            account_number: settings.bank_details?.account_number || "",
            bank_name: settings.bank_details?.bank_name || "",
            branch: settings.bank_details?.branch || "",
            ifsc_code: settings.bank_details?.ifsc_code || "",
          },
          signature: settings.signature || "",
          preferred_template: settings.preferred_template || "modern",
        });

        if (settings.logo_url) {
          setLogoPreview(settings.logo_url);
        }

        if (settings.signature) {
          setSignaturePreview(settings.signature);
        }
      }
    } catch (err: any) {
      logger.error("[Profile] Failed to load shop info", err);

      if (err.status !== 404) {
        setError("Failed to load profile. Please try again.");
      } else {
        // Intentionally empty - 404 means no shop info yet, which is a valid state
        // User can create info by filling the form and saving
      }
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleBankDetailsChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      bank_details: {
        ...prev.bank_details,
        [field]: value,
      },
    }));
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError("Logo file size must be less than 5MB");
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setLogoPreview(result);
        setFormData((prev) => ({
          ...prev,
          logo_url: result,
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSignatureUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        setError("Signature file size must be less than 2MB");
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setSignaturePreview(result);
        setFormData((prev) => ({
          ...prev,
          signature: result,
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const validateForm = () => {
    if (!formData.company_name.trim()) {
      setError("Company name is required");
      return false;
    }
    if (!formData.email.trim()) {
      setError("Email is required");
      return false;
    }
    if (!formData.phone.trim()) {
      setError("Phone number is required");
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
        seo_script_text: "",
        contact_info: {},
        shops_settings: formData,
      };

      await updateShopInfo(payload);

      setSuccess(true);

      setTimeout(() => {
        setSuccess(false);
      }, 3000);
    } catch (err: any) {
      logger.error("[Profile] Save error", err);
      setError(err.message || "Failed to save profile. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 pb-28">
      <div className="mx-auto max-w-5xl p-4 md:p-6 lg:p-8 fade-in-fast">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-4 mb-4">
            <button
              onClick={() => navigate("/settings")}
              className="btn-secondary h-10 w-10 !p-0"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <div className="rounded-lg bg-primary/10 p-2">
                  <User className="h-6 w-6 text-primary" />
                </div>
                <h1 className="font-heading text-2xl font-bold text-foreground md:text-3xl">
                  Shop Profile & Settings
                </h1>
              </div>
              <p className="text-sm text-muted-foreground ml-14">
                Manage your business information for estimates and invoices
              </p>
            </div>
          </div>

          {/* Success/Error Messages */}
          {success && (
            <div className="flex items-center gap-2 rounded-lg bg-success/10 border border-success/20 p-4 text-success animate-slideDown">
              <CheckCircle className="h-5 w-5 flex-shrink-0" />
              <span className="font-medium">Profile saved successfully!</span>
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
          {/* Branding Section */}
          <div className="mb-8 pb-6 border-b-2 border-border">
            <div className="mb-4 flex items-center gap-2">
              <h3 className="text-lg font-semibold text-foreground">
                Branding
              </h3>
              <div className="flex-1 h-px bg-border" />
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Logo Upload */}
              <div>
                <label className="mb-3 block text-sm font-semibold text-foreground">
                  Company Logo
                </label>
                <div className="flex flex-col gap-4">
                  <div className="relative">
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
                        <Image className="h-12 w-12 text-muted-foreground mb-2" />
                        <span className="text-xs text-muted-foreground">
                          No logo uploaded
                        </span>
                      </div>
                    )}
                  </div>
                  <div>
                    <label
                      htmlFor="logo-upload"
                      className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary text-primary-foreground px-4 py-2.5 text-sm font-semibold transition-all hover:bg-primary/90 hover:shadow-lg cursor-pointer w-full"
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
                    <p className="mt-2 text-xs text-muted-foreground">
                      PNG, JPG, SVG supported • Max 5MB
                    </p>
                  </div>
                </div>
              </div>

              {/* Signature Upload */}
              <div>
                <label className="mb-3 block text-sm font-semibold text-foreground">
                  Signature
                </label>
                <div className="flex flex-col gap-4">
                  <div className="relative">
                    {signaturePreview ? (
                      <div className="rounded-xl border-2 border-border bg-background p-4 transition-all hover:border-primary/30">
                        <img
                          src={signaturePreview}
                          alt="Signature"
                          className="h-32 w-full object-contain"
                        />
                      </div>
                    ) : (
                      <div className="h-40 w-full rounded-xl bg-muted flex flex-col items-center justify-center border-2 border-dashed border-border">
                        <FileText className="h-12 w-12 text-muted-foreground mb-2" />
                        <span className="text-xs text-muted-foreground">
                          No signature uploaded
                        </span>
                      </div>
                    )}
                  </div>
                  <div>
                    <label
                      htmlFor="signature-upload"
                      className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary text-primary-foreground px-4 py-2.5 text-sm font-semibold transition-all hover:bg-primary/90 hover:shadow-lg cursor-pointer w-full"
                    >
                      <Upload className="h-4 w-4" />
                      {signaturePreview
                        ? "Change Signature"
                        : "Upload Signature"}
                    </label>
                    <input
                      id="signature-upload"
                      type="file"
                      accept="image/*"
                      onChange={handleSignatureUpload}
                      className="hidden"
                    />
                    <p className="mt-2 text-xs text-muted-foreground">
                      PNG, JPG supported • Max 2MB
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Company Information Section */}
          <div className="mb-8 pb-6 border-b-2 border-border">
            <div className="mb-4 flex items-center gap-2">
              <h3 className="text-lg font-semibold text-foreground">
                Company Information
              </h3>
              <div className="flex-1 h-px bg-border" />
            </div>

            <div className="space-y-5">
              <div>
                <label className="mb-2 block text-sm font-semibold text-foreground">
                  Company Name <span className="text-destructive">*</span>
                </label>
                <div className="relative">
                  <Building className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <input
                    type="text"
                    value={formData.company_name}
                    onChange={(e) =>
                      handleInputChange("company_name", e.target.value)
                    }
                    placeholder="Your Company Name"
                    className="w-full rounded-lg border-2 border-border bg-background pl-11 pr-4 py-3 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-foreground">
                  Address <span className="text-destructive">*</span>
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                  <textarea
                    value={formData.address}
                    onChange={(e) =>
                      handleInputChange("address", e.target.value)
                    }
                    placeholder="Complete business address"
                    rows={3}
                    className="w-full rounded-lg border-2 border-border bg-background pl-11 pr-4 py-3 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all resize-none"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-5">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-foreground">
                    Email <span className="text-destructive">*</span>
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) =>
                        handleInputChange("email", e.target.value)
                      }
                      placeholder="business@domain.com"
                      className="w-full rounded-lg border-2 border-border bg-background pl-11 pr-4 py-3 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-foreground">
                    Phone <span className="text-destructive">*</span>
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) =>
                        handleInputChange("phone", e.target.value)
                      }
                      placeholder="+91 xxxxxxxxxx"
                      className="w-full rounded-lg border-2 border-border bg-background pl-11 pr-4 py-3 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Bank Details Section */}
          <div className="mb-8 pb-6 border-b-2 border-border">
            <div className="mb-4 flex items-center gap-2">
              <h3 className="text-lg font-semibold text-foreground">
                Bank Details (for NEFT/RTGS)
              </h3>
              <div className="flex-1 h-px bg-border" />
            </div>

            <div className="space-y-5">
              <div className="grid md:grid-cols-2 gap-5">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-foreground">
                    Beneficiary Name
                  </label>
                  <div className="relative">
                    <Users className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <input
                      type="text"
                      value={formData.bank_details.beneficiary_name}
                      onChange={(e) =>
                        handleBankDetailsChange(
                          "beneficiary_name",
                          e.target.value
                        )
                      }
                      placeholder="Beneficiary Name"
                      className="w-full rounded-lg border-2 border-border bg-background pl-11 pr-4 py-3 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-foreground">
                    Account Number
                  </label>
                  <div className="relative">
                    <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <input
                      type="text"
                      value={formData.bank_details.account_number}
                      onChange={(e) =>
                        handleBankDetailsChange(
                          "account_number",
                          e.target.value
                        )
                      }
                      placeholder="xxxxxxxxxxxx"
                      className="w-full rounded-lg border-2 border-border bg-background pl-11 pr-4 py-3 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-foreground">
                    Bank Name
                  </label>
                  <div className="relative">
                    <Building className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <input
                      type="text"
                      value={formData.bank_details.bank_name}
                      onChange={(e) =>
                        handleBankDetailsChange("bank_name", e.target.value)
                      }
                      placeholder="Bank Name"
                      className="w-full rounded-lg border-2 border-border bg-background pl-11 pr-4 py-3 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-foreground">
                    Branch
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <input
                      type="text"
                      value={formData.bank_details.branch}
                      onChange={(e) =>
                        handleBankDetailsChange("branch", e.target.value)
                      }
                      placeholder="Branch Name"
                      className="w-full rounded-lg border-2 border-border bg-background pl-11 pr-4 py-3 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                    />
                  </div>
                </div>

                <div className="md:col-span-2">
                  <label className="mb-2 block text-sm font-semibold text-foreground">
                    IFSC Code
                  </label>
                  <div className="relative">
                    <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <input
                      type="text"
                      value={formData.bank_details.ifsc_code}
                      onChange={(e) =>
                        handleBankDetailsChange("ifsc_code", e.target.value)
                      }
                      placeholder="IFSC Code"
                      className="w-full rounded-lg border-2 border-border bg-background pl-11 pr-4 py-3 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Template Preferences Section */}
          <div className="mb-8 pb-6 border-b-2 border-border">
            <div className="mb-4 flex items-center gap-2">
              <h3 className="text-lg font-semibold text-foreground">
                Template Preferences
              </h3>
              <div className="flex-1 h-px bg-border" />
            </div>

            <div>
              <label className="mb-3 block text-sm font-semibold text-foreground">
                Preferred Estimate/Invoice Template
              </label>
              <p className="text-sm text-muted-foreground mb-4">
                Choose the template that will be used for all your estimates and invoices. Customers will see this template when viewing their documents.
              </p>

              <div className="grid md:grid-cols-3 gap-4">
                {/* Standard Template */}
                <button
                  type="button"
                  onClick={() => handleInputChange("preferred_template", "standard")}
                  className={`relative p-4 rounded-xl border-2 transition-all text-left ${formData.preferred_template === "standard"
                      ? "border-primary bg-primary/5 shadow-md"
                      : "border-border hover:border-primary/50"
                    }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`rounded-lg p-2 ${formData.preferred_template === "standard"
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground"
                      }`}>
                      <LayoutTemplate className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-foreground mb-1">Standard</h4>
                      <p className="text-xs text-muted-foreground">
                        Classic black & white template with clean borders
                      </p>
                    </div>
                  </div>
                  {formData.preferred_template === "standard" && (
                    <div className="absolute top-2 right-2">
                      <CheckCircle className="h-5 w-5 text-primary" />
                    </div>
                  )}
                </button>

                {/* Modern Purple Template */}
                <button
                  type="button"
                  onClick={() => handleInputChange("preferred_template", "modern")}
                  className={`relative p-4 rounded-xl border-2 transition-all text-left ${formData.preferred_template === "modern"
                      ? "border-primary bg-primary/5 shadow-md"
                      : "border-border hover:border-primary/50"
                    }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`rounded-lg p-2 ${formData.preferred_template === "modern"
                        ? "bg-primary text-primary-foreground"
                        : "bg-purple-100 text-purple-600"
                      }`}>
                      <LayoutTemplate className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-foreground mb-1">Modern Purple</h4>
                      <p className="text-xs text-muted-foreground">
                        Professional purple gradient with modern styling
                      </p>
                    </div>
                  </div>
                  {formData.preferred_template === "modern" && (
                    <div className="absolute top-2 right-2">
                      <CheckCircle className="h-5 w-5 text-primary" />
                    </div>
                  )}
                </button>

                {/* Fresh Teal Template */}
                <button
                  type="button"
                  onClick={() => handleInputChange("preferred_template", "teal")}
                  className={`relative p-4 rounded-xl border-2 transition-all text-left ${formData.preferred_template === "teal"
                      ? "border-primary bg-primary/5 shadow-md"
                      : "border-border hover:border-primary/50"
                    }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`rounded-lg p-2 ${formData.preferred_template === "teal"
                        ? "bg-primary text-primary-foreground"
                        : "bg-teal-100 text-teal-600"
                      }`}>
                      <LayoutTemplate className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-foreground mb-1">Fresh Teal</h4>
                      <p className="text-xs text-muted-foreground">
                        Fresh teal design with contemporary look
                      </p>
                    </div>
                  </div>
                  {formData.preferred_template === "teal" && (
                    <div className="absolute top-2 right-2">
                      <CheckCircle className="h-5 w-5 text-primary" />
                    </div>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Declaration Section */}
          <div className="mb-6">
            <div className="mb-4 flex items-center gap-2">
              <h3 className="text-lg font-semibold text-foreground">
                Declaration
              </h3>
              <div className="flex-1 h-px bg-border" />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-foreground">
                Declaration Text
              </label>
              <div className="relative">
                <FileText className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                <textarea
                  value={formData.declaration}
                  onChange={(e) =>
                    handleInputChange("declaration", e.target.value)
                  }
                  placeholder="e.g., I/We declare that this estimate shows the actual price of services described and that all particulars are true and correct."
                  rows={4}
                  className="w-full rounded-lg border-2 border-border bg-background pl-11 pr-4 py-3 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all resize-none"
                />
              </div>
              <p className="mt-2 text-xs text-muted-foreground">
                This text will appear at the bottom of estimates and invoices
              </p>
            </div>
          </div>

          {/* Save Button */}
          <div className="pt-6 border-t-2 border-border">
            <button
              onClick={handleSave}
              disabled={saving}
              className="w-full flex items-center justify-center gap-2 rounded-lg bg-primary px-6 py-3.5 font-semibold text-primary-foreground transition-all hover:bg-primary/90 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Saving Profile...
                </>
              ) : (
                <>
                  <Save className="h-5 w-5" />
                  Save Profile
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
