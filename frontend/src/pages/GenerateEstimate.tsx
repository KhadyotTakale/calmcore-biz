import { useState, useEffect } from "react";
import {
  Plus,
  Trash2,
  ArrowLeft,
  Download,
  Send,
  AlertCircle,
} from "lucide-react";
import { motion } from "framer-motion";
import ItemSelector from "@/components/estimate/ItemSelector";
import CustomerSelector from "@/components/estimate/CustomerSelector";
import {
  createBooking,
  addBookingItem,
  updateBookingItem,
  createLead,
  generateFinancialYearEstimateNumber,
  authManager,
} from "@/services/api";

const GenerateEstimate = () => {
  const [customerInfo, setCustomerInfo] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    state: "",
    gstin: "",
  });

  const [items, setItems] = useState([
    {
      id: 1,
      catalogItemId: null,
      description: "",
      quantity: 1,
      rate: 0,
      amount: 0,
      imageUrl: null,
    },
  ]);

  const [estimateDetails, setEstimateDetails] = useState({
    estimateNumber: "Loading...",
    date: new Date().toISOString().split("T")[0],
    validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0],
    notes: "",
  });

  const [discount, setDiscount] = useState(0);
  const [cgst, setCgst] = useState(9);
  const [sgst, setSgst] = useState(9);
  const [loading, setLoading] = useState(false);
  const [bookingSlug, setBookingSlug] = useState(null);
  const [estimateCreated, setEstimateCreated] = useState(false);
  const [estimateNumberLoading, setEstimateNumberLoading] = useState(true);
  const [validationErrors, setValidationErrors] = useState([]);
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 4;

  // Generate estimate number on mount
  useEffect(() => {
    const initEstimateNumber = async () => {
      try {
        const estimateNumber = await generateFinancialYearEstimateNumber();
        setEstimateDetails((prev) => ({
          ...prev,
          estimateNumber,
        }));
        setEstimateNumberLoading(false);
      } catch (error) {
        console.error("Failed to generate estimate number:", error);
        setEstimateDetails((prev) => ({
          ...prev,
          estimateNumber: `EST-${Date.now().toString().slice(-6)}`,
        }));
        setEstimateNumberLoading(false);
      }
    };

    initEstimateNumber();
  }, []);

  const addItem = () => {
    setItems([
      ...items,
      {
        id: Date.now(),
        catalogItemId: null,
        description: "",
        quantity: 1,
        rate: 0,
        amount: 0,
        imageUrl: null,
      },
    ]);
  };

  const removeItem = (id) => {
    if (items.length > 1) {
      setItems(items.filter((item) => item.id !== id));
    }
  };

  const updateItem = (id, field, value) => {
    setItems(
      items.map((item) => {
        if (item.id === id) {
          const updated = { ...item, [field]: value };
          if (field === "quantity" || field === "rate") {
            updated.amount = updated.quantity * updated.rate;
          }
          return updated;
        }
        return item;
      })
    );
  };

  const handleItemSelect = (selectedItem, itemId) => {
    setItems(
      items.map((item) => {
        if (item.id === itemId) {
          return {
            ...item,
            catalogItemId: selectedItem.id,
            description: selectedItem.description,
            quantity: selectedItem.quantity,
            rate: selectedItem.rate,
            amount: selectedItem.amount,
            imageUrl: selectedItem.imageUrl || null,
          };
        }
        return item;
      })
    );
  };

  const nextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const goToStep = (step) => {
    setCurrentStep(step);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const subtotal = items.reduce((sum, item) => sum + item.amount, 0);
  const discountAmount = (subtotal * discount) / 100;
  const taxableAmount = subtotal - discountAmount;
  const cgstAmount = (taxableAmount * cgst) / 100;
  const sgstAmount = (taxableAmount * sgst) / 100;
  const total = taxableAmount + cgstAmount + sgstAmount;

  // ============================================================================
  // VALIDATION FUNCTION - Returns errors array
  // ============================================================================
  const validateEstimateData = () => {
    const errors = [];

    // 1. Customer Name (Required)
    const name = customerInfo.name?.trim();
    if (!name || name.length === 0) {
      errors.push("Customer name is required");
    }

    // 2. Phone (Required + Basic validation)
    const phone = customerInfo.phone?.trim().replace(/\D/g, "");
    if (!phone || phone.length === 0) {
      errors.push("Customer phone number is required");
    } else if (phone.length < 10) {
      errors.push("Phone number must be at least 10 digits");
    }

    // 3. Email (Optional but validate format if provided)
    const email = customerInfo.email?.trim();
    if (
      email &&
      email.length > 0 &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
    ) {
      errors.push("Please enter a valid email address");
    }

    // 4. Estimate Number
    if (
      estimateDetails.estimateNumber === "Loading..." ||
      !estimateDetails.estimateNumber
    ) {
      errors.push("Estimate number is still loading. Please wait...");
    }

    // 5. Items validation
    const validItems = items.filter(
      (item) =>
        item.catalogItemId &&
        typeof item.catalogItemId === "number" &&
        item.description?.trim() &&
        item.rate > 0 &&
        item.quantity > 0
    );

    if (validItems.length === 0) {
      errors.push("Please select at least one valid item from the catalog");
    }

    return { isValid: errors.length === 0, errors, validItems };
  };

  // ============================================================================
  // ENHANCED CREATE ESTIMATE - WITH VALIDATION & ERROR HANDLING
  // ============================================================================
  const handleCreateEstimate = async () => {
    // Clear previous errors
    setValidationErrors([]);

    // Validate before proceeding
    const validation = validateEstimateData();
    if (!validation.isValid) {
      setValidationErrors(validation.errors);
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    try {
      setLoading(true);

      // Prepare clean customer data (trim all values)
      const name = customerInfo.name.trim();
      const phone = customerInfo.phone.trim();
      const email = customerInfo.email?.trim() || "";
      const address = customerInfo.address?.trim() || "";
      const state = customerInfo.state?.trim() || "";
      const gstin = customerInfo.gstin?.trim() || "";

      const customerData = {
        name,
        email,
        phone,
        address,
        state,
        gstin,
      };

      console.log("📋 Customer data to save:", customerData);

      // Create booking
      const booking = await createBooking();
      console.log("✓ Booking created:", booking.id);

      // Add items sequentially with error tracking
      const itemErrors = [];

      for (let i = 0; i < validation.validItems.length; i++) {
        const item = validation.validItems[i];

        try {
          // Add item to booking
          await addBookingItem(booking.id, item.catalogItemId);
          console.log(
            `✓ Added item ${i + 1}/${validation.validItems.length}: ${
              item.description
            }`
          );

          // Update the item with its data
          if (i === 0) {
            // FIRST item gets ALL the estimate data
            await updateBookingItem(booking.id, item.catalogItemId, {
              quantity: item.quantity,
              price: item.rate.toString(),
              booking_items_info: {
                document_type: "estimate",
                special_instructions: estimateDetails.notes?.trim() || "",
                image_url: item.imageUrl || "",
                customer_info: customerData,
                estimate_details: {
                  estimateNumber: estimateDetails.estimateNumber,
                  date: estimateDetails.date,
                  validUntil: estimateDetails.validUntil,
                },
                tax_info: {
                  discount: discount,
                  cgst: cgst,
                  sgst: sgst,
                },
              },
            });
            console.log("✓ First item updated with COMPLETE estimate data");
          } else {
            // Remaining items get basic data only
            await updateBookingItem(booking.id, item.catalogItemId, {
              quantity: item.quantity,
              price: item.rate.toString(),
              booking_items_info: {
                image_url: item.imageUrl || "",
              },
            });
            console.log(`✓ Item ${i + 1} updated with basic data`);
          }
        } catch (itemError) {
          console.error(`❌ Failed to process item ${i + 1}:`, itemError);
          itemErrors.push(`Item "${item.description}": ${itemError.message}`);
        }
      }

      // Check if any items failed
      if (itemErrors.length > 0) {
        throw new Error(
          `Failed to add ${itemErrors.length} item(s):\n${itemErrors.join(
            "\n"
          )}`
        );
      }

      // Create lead - only if email is provided (non-critical)
      if (customerData.email) {
        try {
          await createLead({
            email: customerData.email,
            first_name: customerData.name.split(" ")[0] || customerData.name,
            last_name: customerData.name.split(" ").slice(1).join(" ") || "",
            addresses: customerData.address
              ? [
                  {
                    line1: customerData.address,
                    region: customerData.state || "",
                    country: "India",
                    country_code: "IN",
                  },
                ]
              : [],
            phone_numbers: customerData.phone
              ? [{ number: customerData.phone, type: "mobile" }]
              : [],
            config: customerData.gstin
              ? [{ key: "gstin", val: customerData.gstin, datatype: "STRING" }]
              : [],
          });
          console.log("✓ Lead created");
        } catch (leadError) {
          console.warn("⚠️ Lead creation failed (non-critical):", leadError);
        }
      }

      // Save booking slug and mark as created
      setBookingSlug(booking.booking_slug);
      setEstimateCreated(true);

      console.log("✅ ESTIMATE CREATED SUCCESSFULLY");
      console.log("Booking ID:", booking.id);
      console.log("Booking Slug:", booking.booking_slug);
      console.log("Customer:", customerData.name);

      alert(
        `✓ Estimate created successfully!\n\nEstimate #: ${estimateDetails.estimateNumber}\nCustomer: ${customerData.name}\nPhone: ${customerData.phone}\n\nYou can now download or send to customer.`
      );
    } catch (error) {
      console.error("❌ Error creating estimate:", error);
      const errorMessage = error.message || "An unexpected error occurred";
      alert("Failed to create estimate: " + errorMessage);
      setValidationErrors([errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  // Button 2: Download PDF
  const handleDownload = () => {
    if (!bookingSlug) return;
    window.open(`/estimate-preview?id=${bookingSlug}`, "_blank");
  };

  // Button 3: Send to Customer
  const handleSendToCustomer = () => {
    if (!bookingSlug) return;

    const shareableLink = `${window.location.origin}/estimate-preview?id=${bookingSlug}`;
    const message = `Hello ${
      customerInfo.name
    }! 👋\n\nThank you for your interest in Mrudgandh services. 🌿\n\nPlease find your estimate here:\n${shareableLink}\n\nValid until: ${new Date(
      estimateDetails.validUntil
    ).toLocaleDateString("en-IN")}\nTotal Amount: ₹${total.toFixed(
      2
    )}\n\nFeel free to reach out for any questions!\n\nTeam Mrudgandh`;

    const phone = customerInfo.phone.replace(/\D/g, "");
    const whatsappUrl = `https://wa.me/91${phone}?text=${encodeURIComponent(
      message
    )}`;

    window.open(whatsappUrl, "_blank");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 pb-28">
      <div className="mx-auto max-w-6xl p-4 md:p-6 lg:p-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 flex items-center justify-between"
        >
          <div className="flex items-center gap-4">
            <button
              onClick={() => window.history.back()}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-card shadow-sm transition-all hover:shadow-md"
            >
              <ArrowLeft className="h-5 w-5 text-foreground" />
            </button>
            <div>
              <h1 className="font-heading text-2xl font-bold text-foreground md:text-3xl">
                Generate Estimate
              </h1>
              <p className="text-sm text-muted-foreground">
                Create a professional quotation
              </p>
            </div>
          </div>
        </motion.div>

        {/* Mobile Stepper - Only visible on mobile */}
        <div className="lg:hidden mb-6">
          <div className="flex items-center mb-4">
            {[1, 2, 3, 4].map((step) => (
              <div key={step} className="flex-1 flex items-center">
                <div className="flex flex-col items-center flex-1">
                  <button
                    onClick={() => goToStep(step)}
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all ${
                      currentStep === step
                        ? "bg-primary text-primary-foreground"
                        : currentStep > step
                        ? "bg-primary/20 text-primary"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {step}
                  </button>
                  <span className="text-xs mt-1 text-center text-muted-foreground">
                    {step === 1 && "Details"}
                    {step === 2 && "Customer"}
                    {step === 3 && "Items"}
                    {step === 4 && "Review"}
                  </span>
                </div>
                {step < 4 && (
                  <div
                    className={`h-0.5 flex-1 mx-2 ${
                      currentStep > step ? "bg-primary" : "bg-muted"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Validation Errors Alert */}
        {validationErrors.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 rounded-lg border border-destructive/50 bg-destructive/10 p-4"
          >
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-destructive mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <h3 className="font-semibold text-destructive mb-2">
                  Please fix the following errors:
                </h3>
                <ul className="space-y-1 text-sm text-destructive/90">
                  {validationErrors.map((error, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span>•</span>
                      <span>{error}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </motion.div>
        )}

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Form */}
          <div className="space-y-6 lg:col-span-2">
            {/* Step 1: Estimate Details */}
            {(currentStep === 1 || window.innerWidth >= 1024) && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="rounded-2xl border border-border bg-card p-6 shadow-sm"
              >
                <h2 className="mb-4 font-heading text-lg font-semibold text-foreground">
                  Estimate Details
                </h2>
                <div className="grid gap-4 md:grid-cols-3">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-foreground">
                      Estimate Number
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={estimateDetails.estimateNumber}
                        onChange={(e) =>
                          setEstimateDetails({
                            ...estimateDetails,
                            estimateNumber: e.target.value,
                          })
                        }
                        disabled={estimateNumberLoading}
                        className="w-full rounded-lg border border-input bg-background px-4 py-2 text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-50"
                      />
                      {estimateNumberLoading && (
                        <div className="absolute right-3 top-1/2 -translate-y-1/2">
                          <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                        </div>
                      )}
                    </div>
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-medium text-foreground">
                      Date
                    </label>
                    <input
                      type="date"
                      value={estimateDetails.date}
                      onChange={(e) =>
                        setEstimateDetails({
                          ...estimateDetails,
                          date: e.target.value,
                        })
                      }
                      className="w-full rounded-lg border border-input bg-background px-4 py-2 text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-medium text-foreground">
                      Valid Until
                    </label>
                    <input
                      type="date"
                      value={estimateDetails.validUntil}
                      onChange={(e) =>
                        setEstimateDetails({
                          ...estimateDetails,
                          validUntil: e.target.value,
                        })
                      }
                      className="w-full rounded-lg border border-input bg-background px-4 py-2 text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                </div>
              </motion.div>
            )}

            {/* Step 2: Customer Information */}
            {(currentStep === 2 || window.innerWidth >= 1024) && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="rounded-2xl border border-border bg-card p-6 shadow-sm"
              >
                <h2 className="mb-4 font-heading text-lg font-semibold text-foreground">
                  Customer Information
                </h2>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="md:col-span-2">
                    <label className="mb-2 block text-sm font-medium text-foreground">
                      Customer Name <span className="text-destructive">*</span>
                    </label>
                    <CustomerSelector
                      value={customerInfo.name}
                      onCustomerSelect={(customer) => {
                        setCustomerInfo({
                          name: customer.name,
                          email: customer.email,
                          phone: customer.phone,
                          address: customer.address,
                          state: customer.state,
                          gstin: customer.gstin,
                        });
                      }}
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-foreground">
                      Phone <span className="text-destructive">*</span>
                    </label>
                    <input
                      type="tel"
                      value={customerInfo.phone}
                      onChange={(e) =>
                        setCustomerInfo({
                          ...customerInfo,
                          phone: e.target.value,
                        })
                      }
                      placeholder="XXXXXXXXXX"
                      className="w-full rounded-lg border border-input bg-background px-4 py-2 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-medium text-foreground">
                      Email
                    </label>
                    <input
                      type="email"
                      value={customerInfo.email}
                      onChange={(e) =>
                        setCustomerInfo({
                          ...customerInfo,
                          email: e.target.value,
                        })
                      }
                      placeholder="customer@example.com"
                      className="w-full rounded-lg border border-input bg-background px-4 py-2 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-medium text-foreground">
                      Address
                    </label>
                    <input
                      type="text"
                      value={customerInfo.address}
                      onChange={(e) =>
                        setCustomerInfo({
                          ...customerInfo,
                          address: e.target.value,
                        })
                      }
                      placeholder="Customer address"
                      className="w-full rounded-lg border border-input bg-background px-4 py-2 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-medium text-foreground">
                      State
                    </label>
                    <input
                      type="text"
                      value={customerInfo.state}
                      onChange={(e) =>
                        setCustomerInfo({
                          ...customerInfo,
                          state: e.target.value,
                        })
                      }
                      placeholder="Maharashtra"
                      className="w-full rounded-lg border border-input bg-background px-4 py-2 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-medium text-foreground">
                      GSTIN
                    </label>
                    <input
                      type="text"
                      value={customerInfo.gstin}
                      onChange={(e) =>
                        setCustomerInfo({
                          ...customerInfo,
                          gstin: e.target.value,
                        })
                      }
                      placeholder="GST Number"
                      className="w-full rounded-lg border border-input bg-background px-4 py-2 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                </div>
              </motion.div>
            )}

            {/* Step 3: Items */}
            {(currentStep === 3 || window.innerWidth >= 1024) && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="rounded-2xl border border-border bg-card p-6 shadow-sm"
              >
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="font-heading text-lg font-semibold text-foreground">
                    Items
                  </h2>
                  <button
                    onClick={addItem}
                    className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-all hover:bg-primary/90"
                  >
                    <Plus className="h-4 w-4" />
                    Add Item
                  </button>
                </div>

                <div className="space-y-4">
                  {items.map((item, index) => (
                    <div
                      key={item.id}
                      className="space-y-4 rounded-lg border border-border bg-muted/30 p-4"
                    >
                      {/* Item Selector */}
                      <div>
                        <label className="mb-2 block text-sm font-medium text-foreground">
                          Select Item from Catalog
                        </label>
                        <ItemSelector
                          onItemSelect={(selectedItem) =>
                            handleItemSelect(selectedItem, item.id)
                          }
                        />
                      </div>

                      {/* Item Preview with Image */}
                      {item.imageUrl && (
                        <div className="flex items-center gap-3 rounded-lg bg-background p-3 border border-border">
                          <img
                            src={item.imageUrl}
                            alt={item.description}
                            className="w-16 h-16 object-cover rounded border border-border"
                            onError={(e) => {
                              e.currentTarget.style.display = "none";
                            }}
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-foreground truncate">
                              {item.description}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Selected item preview
                            </p>
                          </div>
                        </div>
                      )}

                      {/* Item Details Grid */}
                      <div className="grid gap-4 md:grid-cols-20">
                        <div className="md:col-span-10">
                          <label className="mb-2 block text-sm font-medium text-foreground">
                            Description
                          </label>
                          <input
                            type="text"
                            value={item.description}
                            onChange={(e) =>
                              updateItem(item.id, "description", e.target.value)
                            }
                            placeholder="Item description"
                            className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                          />
                        </div>
                        <div className="md:col-span-3">
                          <label className="mb-2 block text-sm font-medium text-foreground">
                            Quantity
                          </label>
                          <input
                            type="number"
                            value={item.quantity}
                            onChange={(e) =>
                              updateItem(
                                item.id,
                                "quantity",
                                parseFloat(e.target.value) || 0
                              )
                            }
                            min="1"
                            className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                          />
                        </div>
                        <div className="md:col-span-3">
                          <label className="mb-2 block text-sm font-medium text-foreground">
                            Rate (₹)
                          </label>
                          <input
                            type="number"
                            value={item.rate}
                            onChange={(e) =>
                              updateItem(
                                item.id,
                                "rate",
                                parseFloat(e.target.value) || 0
                              )
                            }
                            min="0"
                            step="0.01"
                            className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                          />
                        </div>
                        <div className="md:col-span-3">
                          <label className="mb-2 block text-sm font-medium text-foreground">
                            Amount
                          </label>
                          <div className="flex h-10 items-center rounded-lg border border-input bg-muted px-3 text-sm font-medium text-foreground">
                            ₹{item.amount.toFixed(2)}
                          </div>
                        </div>
                        <div className="flex items-end md:col-span-1">
                          <button
                            onClick={() => removeItem(item.id)}
                            disabled={items.length === 1}
                            className="flex h-10 w-full items-center justify-center rounded-lg border border-destructive/20 bg-destructive/10 text-destructive transition-all hover:bg-destructive/20 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Step 4: Notes & Review */}
            {(currentStep === 4 || window.innerWidth >= 1024) && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="rounded-2xl border border-border bg-card p-6 shadow-sm"
              >
                <h2 className="mb-4 font-heading text-lg font-semibold text-foreground">
                  Additional Notes
                </h2>
                <textarea
                  value={estimateDetails.notes}
                  onChange={(e) =>
                    setEstimateDetails({
                      ...estimateDetails,
                      notes: e.target.value,
                    })
                  }
                  placeholder="Add any additional notes or terms and conditions..."
                  rows="4"
                  className="w-full rounded-lg border border-input bg-background px-4 py-2 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </motion.div>
            )}

            {/* Mobile Navigation Buttons */}
            <div className="lg:hidden flex gap-3 mt-6">
              {currentStep > 1 && (
                <button
                  onClick={prevStep}
                  className="flex-1 flex items-center justify-center gap-2 rounded-lg border border-border bg-background px-4 py-3 font-medium text-foreground"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Previous
                </button>
              )}
              {currentStep < totalSteps && (
                <button
                  onClick={nextStep}
                  className="flex-1 flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-3 font-medium text-primary-foreground"
                >
                  Next
                  <ArrowLeft className="h-4 w-4 rotate-180" />
                </button>
              )}
            </div>
          </div>

          {/* Summary Sidebar */}
          <div
            className={`space-y-6 ${
              currentStep === 4 ? "block" : "hidden lg:block"
            }`}
          >
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
              className="sticky top-6 rounded-2xl border border-border bg-card p-6 shadow-sm"
            >
              <h2 className="mb-4 font-heading text-lg font-semibold text-foreground">
                Summary
              </h2>

              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-medium text-foreground">
                    ₹{subtotal.toFixed(2)}
                  </span>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-foreground">
                    Discount (%)
                  </label>
                  <input
                    type="number"
                    value={discount}
                    onChange={(e) =>
                      setDiscount(parseFloat(e.target.value) || 0)
                    }
                    min="0"
                    max="100"
                    step="0.5"
                    className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                  {discount > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">
                        Discount Amount
                      </span>
                      <span className="font-medium text-destructive">
                        -₹{discountAmount.toFixed(2)}
                      </span>
                    </div>
                  )}
                </div>

                <div className="border-t border-border pt-2">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-muted-foreground">Net Amount</span>
                    <span className="font-medium text-foreground">
                      ₹{taxableAmount.toFixed(2)}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-foreground">
                      CGST (%)
                    </label>
                    <input
                      type="number"
                      value={cgst}
                      onChange={(e) => setCgst(parseFloat(e.target.value) || 0)}
                      min="0"
                      max="100"
                      step="0.5"
                      className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">Amount</span>
                      <span className="font-medium text-foreground">
                        ₹{cgstAmount.toFixed(2)}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-foreground">
                      SGST (%)
                    </label>
                    <input
                      type="number"
                      value={sgst}
                      onChange={(e) => setSgst(parseFloat(e.target.value) || 0)}
                      min="0"
                      max="100"
                      step="0.5"
                      className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">Amount</span>
                      <span className="font-medium text-foreground">
                        ₹{sgstAmount.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="border-t border-border pt-3">
                  <div className="flex justify-between">
                    <span className="font-heading text-lg font-bold text-foreground">
                      Grand Total
                    </span>
                    <span className="font-heading text-lg font-bold text-primary">
                      ₹{total.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-6 space-y-3">
                {/* Primary Action: Create Estimate */}
                <button
                  onClick={handleCreateEstimate}
                  disabled={loading || estimateNumberLoading}
                  className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-3 font-medium text-primary-foreground transition-all hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                      Creating...
                    </>
                  ) : estimateNumberLoading ? (
                    <>
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                      Loading...
                    </>
                  ) : estimateCreated ? (
                    <>Create New Version</>
                  ) : (
                    <>Create Estimate</>
                  )}
                </button>

                {/* Show success message after creation */}
                {estimateCreated && (
                  <div className="rounded-lg bg-green-50 border border-green-200 p-3 text-center">
                    <p className="text-sm font-medium text-green-800">
                      ✓ Estimate Created Successfully
                    </p>
                    <p className="text-xs text-green-600 mt-1">
                      Estimate #{estimateDetails.estimateNumber}
                    </p>
                  </div>
                )}

                {/* Secondary Actions: Download & Send */}
                <button
                  onClick={handleDownload}
                  disabled={!estimateCreated || loading}
                  className="flex w-full items-center justify-center gap-2 rounded-lg border border-border bg-background px-4 py-3 font-medium text-foreground transition-all hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Download className="h-4 w-4" />
                  Download PDF
                </button>

                <button
                  onClick={handleSendToCustomer}
                  disabled={!estimateCreated || loading}
                  className="flex w-full items-center justify-center gap-2 rounded-lg bg-green-600 px-4 py-3 font-medium text-white transition-all hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send className="h-4 w-4" />
                  Send to Customer
                </button>

                {/* Helper text when buttons are disabled */}
                {!estimateCreated && (
                  <p className="text-xs text-center text-muted-foreground mt-2">
                    Create estimate first to enable download and send options
                  </p>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GenerateEstimate;
