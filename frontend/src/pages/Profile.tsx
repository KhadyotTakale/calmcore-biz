import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Building,
  Upload,
  Save,
  ArrowLeft,
  Loader2,
  CheckCircle,
  AlertCircle,
  FileText,
} from "lucide-react";

const Profile = () => {
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
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
  });

  const [logoPreview, setLogoPreview] = useState(null);
  const [signaturePreview, setSignaturePreview] = useState(null);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleBankDetailsChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      bank_details: {
        ...prev.bank_details,
        [field]: value,
      },
    }));
  };

  const handleLogoUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError("Logo file size must be less than 5MB");
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result);
        setFormData((prev) => ({
          ...prev,
          logo_url: reader.result,
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSignatureUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        setError("Signature file size must be less than 2MB");
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setSignaturePreview(reader.result);
        setFormData((prev) => ({
          ...prev,
          signature: reader.result,
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

      // TODO: API call will go here
      const payload = {
        shops_info: {
          shops_settings: formData,
        },
      };

      console.log("Payload to be sent:", JSON.stringify(payload, null, 2));

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500));

      setSuccess(true);

      setTimeout(() => {
        setSuccess(false);
      }, 3000);
    } catch (err) {
      console.error("Save error:", err);
      setError(err.message || "Failed to save profile. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 pb-28">
      <div className="mx-auto max-w-5xl p-4 md:p-6 lg:p-8">
        {/* Header */}
        <div className="mb-6 animate-fadeIn">
          <div className="flex items-center gap-4 mb-4">
            <button
              onClick={() => navigate("/settings")}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-sm transition-all hover:shadow-md"
            >
              <ArrowLeft className="h-5 w-5 text-gray-700" />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <User className="h-6 w-6 text-blue-600" />
                <h1 className="text-2xl font-bold text-gray-900 md:text-3xl">
                  Shop Profile & Settings
                </h1>
              </div>
              <p className="text-sm text-gray-600">
                Manage your business information for estimates and invoices
              </p>
            </div>
          </div>

          {/* Success/Error Messages */}
          {success && (
            <div className="flex items-center gap-2 rounded-lg bg-green-50 border border-green-200 p-4 text-green-800 animate-slideDown">
              <CheckCircle className="h-5 w-5" />
              <span className="font-medium">Profile saved successfully!</span>
            </div>
          )}

          {error && (
            <div className="flex items-center gap-2 rounded-lg bg-red-50 border border-red-200 p-4 text-red-800 animate-slideDown">
              <AlertCircle className="h-5 w-5" />
              <span className="font-medium">{error}</span>
            </div>
          )}
        </div>

        {/* Logo & Signature Upload Section */}
        <div
          className="mb-6 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm animate-fadeIn"
          style={{ animationDelay: "0.1s" }}
        >
          <h2 className="mb-6 text-lg font-semibold text-gray-900">Branding</h2>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Logo Upload */}
            <div>
              <h3 className="mb-3 text-sm font-medium text-gray-700">
                Company Logo
              </h3>
              <div className="flex flex-col gap-4">
                <div className="relative flex-shrink-0">
                  {logoPreview ? (
                    <div className="rounded-xl border-2 border-gray-200 bg-white p-4">
                      <img
                        src={logoPreview}
                        alt="Company Logo"
                        className="max-h-32 w-auto object-contain mx-auto"
                      />
                    </div>
                  ) : (
                    <div className="h-32 w-full rounded-xl bg-gray-100 flex items-center justify-center border-2 border-dashed border-gray-300">
                      <Building className="h-10 w-10 text-gray-400" />
                    </div>
                  )}
                </div>
                <div>
                  <label
                    htmlFor="logo-upload"
                    className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-all hover:bg-blue-700 cursor-pointer"
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
                    PNG, JPG, SVG supported. Max 5MB
                  </p>
                </div>
              </div>
            </div>

            {/* Signature Upload */}
            <div>
              <h3 className="mb-3 text-sm font-medium text-gray-700">
                Signature
              </h3>
              <div className="flex flex-col gap-4">
                <div className="relative flex-shrink-0">
                  {signaturePreview ? (
                    <div className="rounded-xl border-2 border-gray-200 bg-white p-4">
                      <img
                        src={signaturePreview}
                        alt="Signature"
                        className="max-h-32 w-auto object-contain mx-auto"
                      />
                    </div>
                  ) : (
                    <div className="h-32 w-full rounded-xl bg-gray-100 flex items-center justify-center border-2 border-dashed border-gray-300">
                      <FileText className="h-10 w-10 text-gray-400" />
                    </div>
                  )}
                </div>
                <div>
                  <label
                    htmlFor="signature-upload"
                    className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-all hover:bg-blue-700 cursor-pointer"
                  >
                    <Upload className="h-4 w-4" />
                    Upload Signature
                  </label>
                  <input
                    id="signature-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleSignatureUpload}
                    className="hidden"
                  />
                  <p className="mt-2 text-xs text-gray-500">
                    PNG, JPG supported. Max 2MB
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Company Information */}
        <div
          className="mb-6 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm animate-fadeIn"
          style={{ animationDelay: "0.2s" }}
        >
          <h2 className="mb-4 text-lg font-semibold text-gray-900">
            Company Information
          </h2>
          <div className="grid md:grid-cols-1 gap-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Company Name *
              </label>
              <input
                type="text"
                value={formData.company_name}
                onChange={(e) =>
                  handleInputChange("company_name", e.target.value)
                }
                placeholder="Your Company Name"
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>

            <div className="md:col-span-1">
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Address *
              </label>
              <textarea
                value={formData.address}
                onChange={(e) => handleInputChange("address", e.target.value)}
                placeholder="Complete business address"
                rows={3}
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Email *
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  placeholder="business@domain.com"
                  className="w-full rounded-lg border border-gray-300 bg-white pl-10 pr-4 py-2.5 text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Phone *
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleInputChange("phone", e.target.value)}
                  placeholder="+91 xxxxxxxxxx"
                  className="w-full rounded-lg border border-gray-300 bg-white pl-10 pr-4 py-2.5 text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Bank Details */}
        <div
          className="mb-6 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm animate-fadeIn"
          style={{ animationDelay: "0.3s" }}
        >
          <h2 className="mb-4 text-lg font-semibold text-gray-900">
            Bank Details (for NEFT/RTGS)
          </h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Beneficiary Name
              </label>
              <input
                type="text"
                value={formData.bank_details.beneficiary_name}
                onChange={(e) =>
                  handleBankDetailsChange("beneficiary_name", e.target.value)
                }
                placeholder="Beneficiary Name"
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Account Number
              </label>
              <input
                type="text"
                value={formData.bank_details.account_number}
                onChange={(e) =>
                  handleBankDetailsChange("account_number", e.target.value)
                }
                placeholder="xxxxxxxxxxxx"
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Bank Name
              </label>
              <input
                type="text"
                value={formData.bank_details.bank_name}
                onChange={(e) =>
                  handleBankDetailsChange("bank_name", e.target.value)
                }
                placeholder="Bank Name"
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Branch
              </label>
              <input
                type="text"
                value={formData.bank_details.branch}
                onChange={(e) =>
                  handleBankDetailsChange("branch", e.target.value)
                }
                placeholder="Branch Name"
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>

            <div className="md:col-span-2">
              <label className="mb-2 block text-sm font-medium text-gray-700">
                IFSC Code
              </label>
              <input
                type="text"
                value={formData.bank_details.ifsc_code}
                onChange={(e) =>
                  handleBankDetailsChange("ifsc_code", e.target.value)
                }
                placeholder="IFSC Code"
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>
          </div>
        </div>

        {/* Declaration */}
        <div
          className="mb-6 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm animate-fadeIn"
          style={{ animationDelay: "0.4s" }}
        >
          <h2 className="mb-4 text-lg font-semibold text-gray-900">
            Declaration
          </h2>
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Declaration Text
            </label>
            <textarea
              value={formData.declaration}
              onChange={(e) => handleInputChange("declaration", e.target.value)}
              placeholder="e.g., I/We declare that this estimate shows the actual price of services described and that all particulars are true and correct."
              rows={4}
              className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
            <p className="mt-1 text-xs text-gray-500">
              This text will appear at the bottom of estimates and invoices
            </p>
          </div>
        </div>

        {/* Save Button */}
        <div className="animate-fadeIn" style={{ animationDelay: "0.5s" }}>
          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-6 py-3 font-medium text-white transition-all hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Saving...
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

export default Profile;
