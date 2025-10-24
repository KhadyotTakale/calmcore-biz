import { motion } from "framer-motion";
import { ArrowDownRight, ArrowUpRight, TrendingDown, TrendingUp } from "lucide-react";

interface TransactionCardProps {
  id: string;
  type: "sale" | "purchase" | "expense" | "income";
  amount: number;
  party: string;
  date: string;
  category?: string;
  delay?: number;
}

export const TransactionCard = ({
  type,
  amount,
  party,
  date,
  category,
  delay = 0,
}: TransactionCardProps) => {
  const typeConfig = {
    sale: {
      icon: ArrowUpRight,
      gradient: "from-success/10 to-success/5",
      iconColor: "text-success",
      iconBg: "bg-success/10",
      label: "Sale",
    },
    income: {
      icon: TrendingUp,
      gradient: "from-primary/10 to-primary/5",
      iconColor: "text-primary",
      iconBg: "bg-primary/10",
      label: "Income",
    },
    purchase: {
      icon: ArrowDownRight,
      gradient: "from-warning/10 to-warning/5",
      iconColor: "text-warning",
      iconBg: "bg-warning/10",
      label: "Purchase",
    },
    expense: {
      icon: TrendingDown,
      gradient: "from-destructive/10 to-destructive/5",
      iconColor: "text-destructive",
      iconBg: "bg-destructive/10",
      label: "Expense",
    },
  };

  const config = typeConfig[type];
  const Icon = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay }}
      whileHover={{ scale: 1.02, y: -2 }}
      className={`rounded-2xl border border-border bg-gradient-to-br ${config.gradient} p-4 shadow-sm transition-all hover:shadow-md`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`rounded-xl ${config.iconBg} p-2.5`}>
            <Icon className={`h-5 w-5 ${config.iconColor}`} strokeWidth={2.5} />
          </div>
          
          <div>
            <h3 className="font-semibold text-foreground">{party}</h3>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span>{config.label}</span>
              {category && (
                <>
                  <span>•</span>
                  <span>{category}</span>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="text-right">
          <p className={`font-mono text-lg font-semibold ${config.iconColor}`}>
            ₹{amount.toLocaleString()}
          </p>
          <p className="text-xs text-muted-foreground">{date}</p>
        </div>
      </div>
    </motion.div>
  );
};
