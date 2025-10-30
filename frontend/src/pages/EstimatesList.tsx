import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Eye, Trash2, Search, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import {
  listEstimatesFromStorage,
  loadEstimateFromStorage,
  deleteEstimateFromStorage,
} from "@/services/api";

const EstimatesList = () => {
  const navigate = useNavigate();
  const [estimates, setEstimates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    loadEstimates();
  }, []);

  const loadEstimates = async () => {
    try {
      setLoading(true);
      const keys = await listEstimatesFromStorage();

      const estimatesData = await Promise.all(
        keys.map(async (key) => {
          const estimateNumber = key.replace("estimate:", "");
          const data = await loadEstimateFromStorage(estimateNumber);
          return data;
        })
      );

      // Sort by date (newest first)
      estimatesData.sort((a, b) => new Date(b.savedAt) - new Date(a.savedAt));

      setEstimates(estimatesData.filter(Boolean));
    } catch (error) {
      console.error("Error loading estimates:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (estimateNumber) => {
    if (!confirm("Are you sure you want to delete this estimate?")) return;

    try {
      await deleteEstimateFromStorage(estimateNumber);
      setEstimates(
        estimates.filter((e) => e.estimateNumber !== estimateNumber)
      );
    } catch (error) {
      console.error("Error deleting estimate:", error);
      alert("Failed to delete estimate");
    }
  };

  const handleView = (bookingId) => {
    navigate(`/estimate/${bookingId}`);
  };

  const filteredEstimates = estimates.filter(
    (estimate) =>
      estimate.customerInfo.name
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      estimate.estimateNumber.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 pb-28">
      <div className="mx-auto max-w-6xl p-4 md:p-6 lg:p-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 flex items-center justify-between"
        >
          <div>
            <h1 className="font-heading text-2xl font-bold text-foreground md:text-3xl">
              Estimates
            </h1>
            <p className="text-sm text-muted-foreground">
              Manage your customer estimates
            </p>
          </div>
          <button
            onClick={() => navigate("/generate-estimate")}
            className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 font-medium text-primary-foreground transition-all hover:bg-primary/90"
          >
            <Plus className="h-4 w-4" />
            New Estimate
          </button>
        </motion.div>

        {/* Search */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6"
        >
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by customer name or estimate number..."
              className="w-full rounded-lg border border-input bg-background pl-10 pr-4 py-3 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
        </motion.div>

        {/* Estimates List */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : filteredEstimates.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="rounded-2xl border border-border bg-card p-12 text-center"
          >
            <p className="text-muted-foreground">
              {searchQuery
                ? "No estimates found matching your search"
                : "No estimates yet. Create your first one!"}
            </p>
          </motion.div>
        ) : (
          <div className="space-y-4">
            {filteredEstimates.map((estimate, index) => (
              <motion.div
                key={estimate.estimateNumber}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="rounded-2xl border border-border bg-card p-6 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-lg text-foreground">
                        {estimate.customerInfo.name}
                      </h3>
                      <span className="text-sm font-medium text-primary bg-primary/10 px-3 py-1 rounded-full">
                        {estimate.estimateNumber}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                      <span>
                        Date:{" "}
                        {new Date(estimate.date).toLocaleDateString("en-IN")}
                      </span>
                      <span>
                        Valid Until:{" "}
                        {new Date(estimate.validUntil).toLocaleDateString(
                          "en-IN"
                        )}
                      </span>
                      <span>Items: {estimate.items.length}</span>
                      <span className="font-semibold text-foreground">
                        Total: ₹{estimate.totals.total.toFixed(2)}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {estimate.bookingId && (
                      <button
                        onClick={() => handleView(estimate.bookingId)}
                        className="flex items-center gap-2 rounded-lg bg-secondary px-4 py-2 text-sm font-medium text-secondary-foreground transition-all hover:bg-secondary/90"
                      >
                        <Eye className="h-4 w-4" />
                        View
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(estimate.estimateNumber)}
                      className="flex items-center justify-center rounded-lg border border-destructive/20 bg-destructive/10 p-2 text-destructive transition-all hover:bg-destructive/20"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default EstimatesList;
