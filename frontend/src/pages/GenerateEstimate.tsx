import { useState } from "react";
import { Plus, Trash2, ArrowLeft, Save, Send, Download } from "lucide-react";
import { motion } from "framer-motion";
import ItemSelector from "@/components/estimate/ItemSelector";
import { createBooking, addBookingItem } from "@/services/api";

// Storage helper functions
const saveToStorage = async (key, value) => {
  try {
    if (window.storage && typeof window.storage.set === "function") {
      // Claude artifacts environment
      await window.storage.set(key, value);
    } else {
      // Local development - use localStorage
      localStorage.setItem(key, value);
    }
  } catch (error) {
    console.warn("Storage save failed, falling back to localStorage:", error);
    localStorage.setItem(key, value);
  }
};

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
      description: "",
      quantity: 1,
      rate: 0,
      amount: 0,
      imageUrl: null,
      hsnCode: "",
    },
  ]);

  const [estimateDetails, setEstimateDetails] = useState({
    estimateNumber: `EST-${Date.now().toString().slice(-6)}`,
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

  const addItem = () => {
    setItems([
      ...items,
      {
        id: Date.now(),
        description: "",
        quantity: 1,
        rate: 0,
        amount: 0,
        imageUrl: null,
        hsnCode: "",
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
            description: selectedItem.description,
            quantity: selectedItem.quantity,
            rate: selectedItem.rate,
            amount: selectedItem.amount,
            imageUrl: selectedItem.imageUrl || null,
            hsnCode: selectedItem.hsnCode || "",
          };
        }
        return item;
      })
    );
  };

  const subtotal = items.reduce((sum, item) => sum + item.amount, 0);
  const discountAmount = (subtotal * discount) / 100;
  const taxableAmount = subtotal - discountAmount;
  const cgstAmount = (taxableAmount * cgst) / 100;
  const sgstAmount = (taxableAmount * sgst) / 100;
  const total = taxableAmount + cgstAmount + sgstAmount;

  const handleSave = async () => {
    try {
      setLoading(true);

      // Create booking
      const booking = await createBooking();

      // Add items to booking
      const itemPromises = items
        .filter((item) => item.description && item.rate > 0)
        .map((item) => addBookingItem(booking.id, item.id));

      await Promise.all(itemPromises);

      // Save metadata to storage
      const metadata = {
        estimateNumber: estimateDetails.estimateNumber,
        date: estimateDetails.date,
        validUntil: estimateDetails.validUntil,
        notes: estimateDetails.notes,
        customerInfo,
        items,
        discount,
        cgst,
        sgst,
        bookingId: booking.id,
        bookingSlug: booking.booking_slug,
        savedAt: new Date().toISOString(),
      };

      const storageKey = `estimate:booking:${booking.id}`;
      await saveToStorage(storageKey, JSON.stringify(metadata));

      alert(`Estimate saved successfully! Booking ID: ${booking.id}`);
      setLoading(false);
    } catch (error) {
      console.error("Error saving estimate:", error);
      alert("Failed to save estimate: " + error.message);
      setLoading(false);
    }
  };

  const handleSend = async () => {
    try {
      setLoading(true);

      // Create booking
      const booking = await createBooking();

      // Add items to booking
      const itemPromises = items
        .filter((item) => item.description && item.rate > 0)
        .map((item) => addBookingItem(booking.id, item.id));

      await Promise.all(itemPromises);

      // Save metadata to storage
      const metadata = {
        estimateNumber: estimateDetails.estimateNumber,
        date: estimateDetails.date,
        validUntil: estimateDetails.validUntil,
        notes: estimateDetails.notes,
        customerInfo,
        items,
        discount,
        cgst,
        sgst,
        bookingId: booking.id,
        bookingSlug: booking.booking_slug,
        savedAt: new Date().toISOString(),
      };

      const storageKey = `estimate:booking:${booking.id}`;
      await saveToStorage(storageKey, JSON.stringify(metadata));

      // Generate shareable link
      const shareableLink = `${window.location.origin}/estimate-preview?id=${booking.booking_slug}`;

      // Copy to clipboard
      await navigator.clipboard.writeText(shareableLink);

      alert(
        `Estimate link copied to clipboard!\n\nShare this link:\n${shareableLink}`
      );
      setLoading(false);
    } catch (error) {
      console.error("Error creating estimate:", error);
      alert("Failed to create estimate: " + error.message);
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    try {
      setLoading(true);

      // Create booking
      const booking = await createBooking();

      // Add items to booking
      const itemPromises = items
        .filter((item) => item.description && item.rate > 0)
        .map((item) => addBookingItem(booking.id, item.id));

      await Promise.all(itemPromises);

      // Save metadata to storage
      const metadata = {
        estimateNumber: estimateDetails.estimateNumber,
        date: estimateDetails.date,
        validUntil: estimateDetails.validUntil,
        notes: estimateDetails.notes,
        customerInfo,
        items,
        discount,
        cgst,
        sgst,
        bookingId: booking.id,
        bookingSlug: booking.booking_slug,
        savedAt: new Date().toISOString(),
      };

      const storageKey = `estimate:booking:${booking.id}`;
      await saveToStorage(storageKey, JSON.stringify(metadata));

      // Open preview page with slug
      window.open(`/estimate-preview?id=${booking.booking_slug}`, "_blank");

      setLoading(false);
    } catch (error) {
      console.error("Error creating estimate:", error);
      alert("Failed to create estimate: " + error.message);
      setLoading(false);
    }
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

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Form */}
          <div className="space-y-6 lg:col-span-2">
            {/* Estimate Details */}
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
                  <input
                    type="text"
                    value={estimateDetails.estimateNumber}
                    onChange={(e) =>
                      setEstimateDetails({
                        ...estimateDetails,
                        estimateNumber: e.target.value,
                      })
                    }
                    className="w-full rounded-lg border border-input bg-background px-4 py-2 text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
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

            {/* Customer Information */}
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
                <div>
                  <label className="mb-2 block text-sm font-medium text-foreground">
                    Customer Name *
                  </label>
                  <input
                    type="text"
                    value={customerInfo.name}
                    onChange={(e) =>
                      setCustomerInfo({ ...customerInfo, name: e.target.value })
                    }
                    placeholder="Enter customer name"
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
                    Phone
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
                    placeholder="+91 XXXXX XXXXX"
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

            {/* Items */}
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
                    <div className="grid gap-4 md:grid-cols-12">
                      <div className="md:col-span-4">
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
                      <div className="md:col-span-2">
                        <label className="mb-2 block text-sm font-medium text-foreground">
                          HSN Code
                        </label>
                        <input
                          type="text"
                          value={item.hsnCode}
                          onChange={(e) =>
                            updateItem(item.id, "hsnCode", e.target.value)
                          }
                          placeholder="HSN"
                          className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                        />
                      </div>
                      <div className="md:col-span-2">
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
                      <div className="md:col-span-2">
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
                      <div className="md:col-span-1">
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

            {/* Notes */}
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
          </div>

          {/* Summary Sidebar */}
          <div className="space-y-6">
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
                <button
                  onClick={handleSave}
                  disabled={loading}
                  className="flex w-full items-center justify-center gap-2 rounded-lg bg-secondary px-4 py-3 font-medium text-secondary-foreground transition-all hover:bg-secondary/90 disabled:opacity-50"
                >
                  <Save className="h-4 w-4" />
                  {loading ? "Saving..." : "Save Draft"}
                </button>
                <button
                  onClick={handleDownload}
                  disabled={loading}
                  className="flex w-full items-center justify-center gap-2 rounded-lg border border-border bg-background px-4 py-3 font-medium text-foreground transition-all hover:bg-muted disabled:opacity-50"
                >
                  <Download className="h-4 w-4" />
                  {loading ? "Creating..." : "Download PDF"}
                </button>
                <button
                  onClick={handleSend}
                  disabled={loading}
                  className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-3 font-medium text-primary-foreground transition-all hover:bg-primary/90 disabled:opacity-50"
                >
                  <Send className="h-4 w-4" />
                  {loading ? "Generating..." : "Send to Customer"}
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GenerateEstimate;
