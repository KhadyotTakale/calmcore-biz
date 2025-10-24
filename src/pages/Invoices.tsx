import { FileCheck } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

const Invoices = () => {
  return (
    <div className="min-h-screen pb-28">
      <div className="mx-auto max-w-lg space-y-6 p-6">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <h1 className="font-heading text-2xl font-bold text-foreground">Invoices</h1>
          <Button className="rounded-xl bg-gradient-to-r from-accent to-destructive text-foreground shadow-accent hover:shadow-lg">
            Create Invoice
          </Button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="flex min-h-[60vh] flex-col items-center justify-center rounded-3xl border-2 border-dashed border-muted bg-card/50 p-12 text-center"
        >
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="mb-6 rounded-2xl bg-gradient-to-br from-accent/20 to-destructive/20 p-8"
          >
            <FileCheck className="h-16 w-16 text-accent" strokeWidth={1.5} />
          </motion.div>

          <h2 className="mb-3 font-heading text-2xl font-semibold">No Invoices Yet</h2>
          <p className="mb-8 max-w-sm text-muted-foreground">
            Create professional invoices for your customers in seconds
          </p>

          <Button
            size="lg"
            className="rounded-xl bg-gradient-to-r from-accent to-destructive px-8 text-foreground shadow-accent"
          >
            Create First Invoice
          </Button>
        </motion.div>
      </div>
    </div>
  );
};

export default Invoices;
