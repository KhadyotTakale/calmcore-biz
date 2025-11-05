import { useState } from "react";
import {
  Plus,
  Trash2,
  ArrowLeft,
  Save,
  Send,
  Download,
  FileCheck,
} from "lucide-react";
import { motion } from "framer-motion";

const GenerateInvoice = () => {
  const [customerInfo, setCustomerInfo] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    gst: "",
  });

  const [items, setItems] = useState([
    { id: 1, description: "", quantity: 1, rate: 0, amount: 0 },
  ]);

  const [invoiceDetails, setInvoiceDetails] = useState({
    invoiceNumber: `INV-${Date.now().toString().slice(-6)}`,
    date: new Date().toISOString().split("T")[0],
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0],
    paymentTerms: "Net 30",
    notes: "",
    bankDetails: "",
  });

  const [discount, setDiscount] = useState(0);
  const [tax, setTax] = useState(18);
  const [shippingCharges, setShippingCharges] = useState(0);
  const [paymentStatus, setPaymentStatus] = useState("unpaid");

  const addItem = () => {
    setItems([
      ...items,
      { id: Date.now(), description: "", quantity: 1, rate: 0, amount: 0 },
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

  const subtotal = items.reduce((sum, item) => sum + item.amount, 0);
  const discountAmount = (subtotal * discount) / 100;
  const taxableAmount = subtotal - discountAmount;
  const taxAmount = (taxableAmount * tax) / 100;
  const total = taxableAmount + taxAmount + shippingCharges;

  const handleSend = () => {
    alert("Invoice sent to customer!");
  };

  const handleDownload = () => {
    alert("Invoice downloaded as PDF!");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/5 pb-28">
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
              <div className="flex items-center gap-2">
                <FileCheck className="h-6 w-6 text-secondary" />
                <h1 className="font-heading text-2xl font-bold text-foreground md:text-3xl">
                  Generate Invoice
                </h1>
              </div>
              <p className="text-sm text-muted-foreground">
                Create and send professional invoices
              </p>
            </div>
          </div>
        </motion.div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Form */}
          <div className="space-y-6 lg:col-span-2">
            {/* Invoice Details */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="rounded-2xl border border-border bg-card p-6 shadow-sm"
            >
              <h2 className="mb-4 font-heading text-lg font-semibold text-foreground">
                Invoice Details
              </h2>
              <div className="grid gap-4 md:grid-cols-3">
                <div>
                  <label className="mb-2 block text-sm font-medium text-foreground">
                    Invoice Number
                  </label>
                  <input
                    type="text"
                    value={invoiceDetails.invoiceNumber}
                    onChange={(e) =>
                      setInvoiceDetails({
                        ...invoiceDetails,
                        invoiceNumber: e.target.value,
                      })
                    }
                    className="w-full rounded-lg border border-input bg-background px-4 py-2 text-foreground focus:border-secondary focus:outline-none focus:ring-2 focus:ring-secondary/20"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-foreground">
                    Invoice Date
                  </label>
                  <input
                    type="date"
                    value={invoiceDetails.date}
                    onChange={(e) =>
                      setInvoiceDetails({
                        ...invoiceDetails,
                        date: e.target.value,
                      })
                    }
                    className="w-full rounded-lg border border-input bg-background px-4 py-2 text-foreground focus:border-secondary focus:outline-none focus:ring-2 focus:ring-secondary/20"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-foreground">
                    Due Date
                  </label>
                  <input
                    type="date"
                    value={invoiceDetails.dueDate}
                    onChange={(e) =>
                      setInvoiceDetails({
                        ...invoiceDetails,
                        dueDate: e.target.value,
                      })
                    }
                    className="w-full rounded-lg border border-input bg-background px-4 py-2 text-foreground focus:border-secondary focus:outline-none focus:ring-2 focus:ring-secondary/20"
                  />
                </div>
              </div>
              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium text-foreground">
                    Payment Terms
                  </label>
                  <select
                    value={invoiceDetails.paymentTerms}
                    onChange={(e) =>
                      setInvoiceDetails({
                        ...invoiceDetails,
                        paymentTerms: e.target.value,
                      })
                    }
                    className="w-full rounded-lg border border-input bg-background px-4 py-2 text-foreground focus:border-secondary focus:outline-none focus:ring-2 focus:ring-secondary/20"
                  >
                    <option value="Due on Receipt">Due on Receipt</option>
                    <option value="Net 15">Net 15</option>
                    <option value="Net 30">Net 30</option>
                    <option value="Net 45">Net 45</option>
                    <option value="Net 60">Net 60</option>
                  </select>
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-foreground">
                    Payment Status
                  </label>
                  <select
                    value={paymentStatus}
                    onChange={(e) => setPaymentStatus(e.target.value)}
                    className="w-full rounded-lg border border-input bg-background px-4 py-2 text-foreground focus:border-secondary focus:outline-none focus:ring-2 focus:ring-secondary/20"
                  >
                    <option value="unpaid">Unpaid</option>
                    <option value="partially_paid">Partially Paid</option>
                    <option value="paid">Paid</option>
                  </select>
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
                Bill To
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
                    className="w-full rounded-lg border border-input bg-background px-4 py-2 text-foreground placeholder:text-muted-foreground focus:border-secondary focus:outline-none focus:ring-2 focus:ring-secondary/20"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-foreground">
                    Email *
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
                    className="w-full rounded-lg border border-input bg-background px-4 py-2 text-foreground placeholder:text-muted-foreground focus:border-secondary focus:outline-none focus:ring-2 focus:ring-secondary/20"
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
                    className="w-full rounded-lg border border-input bg-background px-4 py-2 text-foreground placeholder:text-muted-foreground focus:border-secondary focus:outline-none focus:ring-2 focus:ring-secondary/20"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-foreground">
                    GST Number
                  </label>
                  <input
                    type="text"
                    value={customerInfo.gst}
                    onChange={(e) =>
                      setCustomerInfo({
                        ...customerInfo,
                        gst: e.target.value,
                      })
                    }
                    placeholder="GSTIN (optional)"
                    className="w-full rounded-lg border border-input bg-background px-4 py-2 text-foreground placeholder:text-muted-foreground focus:border-secondary focus:outline-none focus:ring-2 focus:ring-secondary/20"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="mb-2 block text-sm font-medium text-foreground">
                    Billing Address
                  </label>
                  <textarea
                    value={customerInfo.address}
                    onChange={(e) =>
                      setCustomerInfo({
                        ...customerInfo,
                        address: e.target.value,
                      })
                    }
                    placeholder="Customer billing address"
                    rows="2"
                    className="w-full rounded-lg border border-input bg-background px-4 py-2 text-foreground placeholder:text-muted-foreground focus:border-secondary focus:outline-none focus:ring-2 focus:ring-secondary/20"
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
                  Items / Services
                </h2>
                <button
                  onClick={addItem}
                  className="flex items-center gap-2 rounded-lg bg-secondary px-4 py-2 text-sm font-medium text-secondary-foreground transition-all hover:bg-secondary/90"
                >
                  <Plus className="h-4 w-4" />
                  Add Item
                </button>
              </div>

              <div className="space-y-4">
                {items.map((item, index) => (
                  <div
                    key={item.id}
                    className="grid gap-4 rounded-lg border border-border bg-muted/30 p-4 md:grid-cols-12"
                  >
                    <div className="md:col-span-5">
                      <label className="mb-2 block text-sm font-medium text-foreground">
                        Description
                      </label>
                      <input
                        type="text"
                        value={item.description}
                        onChange={(e) =>
                          updateItem(item.id, "description", e.target.value)
                        }
                        placeholder="Item or service description"
                        className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-secondary focus:outline-none focus:ring-2 focus:ring-secondary/20"
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
                        className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground focus:border-secondary focus:outline-none focus:ring-2 focus:ring-secondary/20"
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
                        className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground focus:border-secondary focus:outline-none focus:ring-2 focus:ring-secondary/20"
                      />
                    </div>
                    <div className="md:col-span-2">
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
                ))}
              </div>
            </motion.div>

            {/* Notes & Bank Details */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="grid gap-6 md:grid-cols-2"
            >
              <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
                <h2 className="mb-4 font-heading text-lg font-semibold text-foreground">
                  Notes
                </h2>
                <textarea
                  value={invoiceDetails.notes}
                  onChange={(e) =>
                    setInvoiceDetails({
                      ...invoiceDetails,
                      notes: e.target.value,
                    })
                  }
                  placeholder="Add any additional notes or terms..."
                  rows="4"
                  className="w-full rounded-lg border border-input bg-background px-4 py-2 text-foreground placeholder:text-muted-foreground focus:border-secondary focus:outline-none focus:ring-2 focus:ring-secondary/20"
                />
              </div>
              <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
                <h2 className="mb-4 font-heading text-lg font-semibold text-foreground">
                  Bank Details
                </h2>
                <textarea
                  value={invoiceDetails.bankDetails}
                  onChange={(e) =>
                    setInvoiceDetails({
                      ...invoiceDetails,
                      bankDetails: e.target.value,
                    })
                  }
                  placeholder="Account Name, Bank Name, Account Number, IFSC Code..."
                  rows="4"
                  className="w-full rounded-lg border border-input bg-background px-4 py-2 text-foreground placeholder:text-muted-foreground focus:border-secondary focus:outline-none focus:ring-2 focus:ring-secondary/20"
                />
              </div>
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
                Invoice Summary
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
                    className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground focus:border-secondary focus:outline-none focus:ring-2 focus:ring-secondary/20"
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

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-foreground">
                    Tax / GST (%)
                  </label>
                  <input
                    type="number"
                    value={tax}
                    onChange={(e) => setTax(parseFloat(e.target.value) || 0)}
                    min="0"
                    max="100"
                    step="0.5"
                    className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground focus:border-secondary focus:outline-none focus:ring-2 focus:ring-secondary/20"
                  />
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Tax Amount</span>
                    <span className="font-medium text-foreground">
                      +₹{taxAmount.toFixed(2)}
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-foreground">
                    Shipping Charges (₹)
                  </label>
                  <input
                    type="number"
                    value={shippingCharges}
                    onChange={(e) =>
                      setShippingCharges(parseFloat(e.target.value) || 0)
                    }
                    min="0"
                    step="0.01"
                    className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground focus:border-secondary focus:outline-none focus:ring-2 focus:ring-secondary/20"
                  />
                  {shippingCharges > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Shipping</span>
                      <span className="font-medium text-foreground">
                        +₹{shippingCharges.toFixed(2)}
                      </span>
                    </div>
                  )}
                </div>

                <div className="border-t border-border pt-3">
                  <div className="flex justify-between">
                    <span className="font-heading text-lg font-bold text-foreground">
                      Total Amount
                    </span>
                    <span className="font-heading text-lg font-bold text-secondary">
                      ₹{total.toFixed(2)}
                    </span>
                  </div>
                </div>

                <div className="rounded-lg bg-muted/50 p-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-foreground">
                      Status
                    </span>
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${
                        paymentStatus === "paid"
                          ? "bg-green-100 text-green-700"
                          : paymentStatus === "partially_paid"
                          ? "bg-yellow-100 text-yellow-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {paymentStatus === "paid"
                        ? "Paid"
                        : paymentStatus === "partially_paid"
                        ? "Partially Paid"
                        : "Unpaid"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-6 space-y-3">
                <button
                  onClick={handleSave}
                  className="flex w-full items-center justify-center gap-2 rounded-lg bg-accent px-4 py-3 font-medium text-accent-foreground transition-all hover:bg-accent/90"
                >
                  <Save className="h-4 w-4" />
                  Save Invoice
                </button>
                <button
                  onClick={handleDownload}
                  className="flex w-full items-center justify-center gap-2 rounded-lg border border-border bg-background px-4 py-3 font-medium text-foreground transition-all hover:bg-muted"
                >
                  <Download className="h-4 w-4" />
                  Download PDF
                </button>
                <button
                  onClick={handleSend}
                  className="flex w-full items-center justify-center gap-2 rounded-lg bg-secondary px-4 py-3 font-medium text-secondary-foreground transition-all hover:bg-secondary/90"
                >
                  <Send className="h-4 w-4" />
                  Send to Customer
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GenerateInvoice;
