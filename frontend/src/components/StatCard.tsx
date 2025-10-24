import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";

interface StatCardProps {
  icon: LucideIcon;
  label: string;
  value: string;
  change?: string;
  changeType?: "positive" | "negative";
  gradient: string;
  delay?: number;
}

export const StatCard = ({
  icon: Icon,
  label,
  value,
  change,
  changeType,
  gradient,
  delay = 0,
}: StatCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3, delay }}
      className={`rounded-2xl ${gradient} p-6 shadow-md`}
    >
      <div className="mb-3 flex items-start justify-between">
        <div className="rounded-xl bg-white/30 p-3 backdrop-blur-sm">
          <Icon className="h-6 w-6 text-white" strokeWidth={2.5} />
        </div>
        {change && (
          <div
            className={`rounded-full px-2 py-1 text-xs font-semibold ${
              changeType === "positive"
                ? "bg-white/20 text-white"
                : "bg-white/20 text-white"
            }`}
          >
            {change}
          </div>
        )}
      </div>

      <p className="mb-1 text-sm font-medium text-white/80">{label}</p>
      <p className="font-mono text-3xl font-bold text-white">{value}</p>
    </motion.div>
  );
};
