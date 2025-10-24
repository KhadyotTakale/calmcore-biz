import { motion } from "framer-motion";
import { FileText, Download, Send } from "lucide-react";
import { Button } from "@/components/ui/button";

interface InvoiceCardProps {
  invoiceNumber: string;
  customerName: string;
  amount: number;
  status: "paid" | "pending" | "overdue";
  date: string;
  dueDate: string;
  delay?: number;
}

export const InvoiceCard = ({
  invoiceNumber,
  customerName,
  amount,
  status,
  date,
  dueDate,
  delay = 0,
}: InvoiceCardProps) => {
  const statusConfig = {
    paid: {
      bg: "bg-success/10",
      text: "text-success",
      label: "Paid",
    },
    pending: {
      bg: "bg-warning/10",
      text: "text-warning",
      label: "Pending",
    },
    overdue: {
      bg: "bg-destructive/10",
      text: "text-destructive",
      label: "Overdue",
    },
  };

  const config = statusConfig[status];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay }}
      className="rounded-2xl border border-border bg-card p-6 shadow-sm transition-all hover:shadow-md"
    >
      <div className="mb-4 flex items-start justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2">
            <div className="rounded-lg bg-secondary/10 p-2">
              <FileText className="h-5 w-5 text-secondary" />
            </div>
            <div>
              <h3 className="font-mono text-sm font-semibold text-foreground">
                {invoiceNumber}
              </h3>
              <p className="text-xs text-muted-foreground">{date}</p>
            </div>
          </div>
          <h4 className="mb-1 font-semibold text-foreground">{customerName}</h4>
          <p className="font-mono text-2xl font-bold text-primary">
            ₹{amount.toLocaleString()}
          </p>
        </div>

        <div className={`rounded-full px-3 py-1 ${config.bg}`}>
          <span className={`text-xs font-semibold ${config.text}`}>{config.label}</span>
        </div>
      </div>

      <div className="mb-4 flex items-center gap-2 text-xs text-muted-foreground">
        <span>Due: {dueDate}</span>
      </div>

      <div className="flex gap-2">
        <Button
          size="sm"
          variant="outline"
          className="flex-1 rounded-xl hover:bg-primary/5"
        >
          <Download className="mr-2 h-4 w-4" />
          Download
        </Button>
        <Button
          size="sm"
          className="flex-1 rounded-xl bg-gradient-to-r from-primary to-success text-white"
        >
          <Send className="mr-2 h-4 w-4" />
          Send
        </Button>
      </div>
    </motion.div>
  );
};
