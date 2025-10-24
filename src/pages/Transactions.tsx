import { Receipt } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

const Transactions = () => {
  return (
    <div className="min-h-screen pb-28">
      <div className="mx-auto max-w-lg space-y-6 p-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <h1 className="font-heading text-2xl font-bold text-foreground">
            Transactions
          </h1>
          <Button className="rounded-xl bg-gradient-to-r from-primary to-success text-white shadow-primary hover:shadow-lg">
            Add New
          </Button>
        </motion.div>

        {/* Empty State */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="flex min-h-[60vh] flex-col items-center justify-center rounded-3xl border-2 border-dashed border-muted bg-card/50 p-12 text-center shadow-sm"
        >
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="mb-6 rounded-2xl bg-gradient-to-br from-primary/20 to-success/20 p-8 shadow-md"
          >
            <Receipt className="h-16 w-16 text-primary" strokeWidth={1.5} />
          </motion.div>

          <h2 className="mb-3 font-heading text-2xl font-semibold text-foreground">
            No Transactions Yet
          </h2>
          <p className="mb-8 max-w-sm text-muted-foreground">
            Start tracking your business by adding your first transaction. It's quick and easy!
          </p>

          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              size="lg"
              className="rounded-xl bg-gradient-to-r from-primary to-success px-8 text-white shadow-primary hover:shadow-lg"
            >
              Add First Transaction
            </Button>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default Transactions;
