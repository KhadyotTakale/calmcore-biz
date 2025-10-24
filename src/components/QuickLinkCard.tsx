import { LucideIcon } from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

interface QuickLinkCardProps {
  icon: LucideIcon;
  label: string;
  path: string;
  gradient: string;
  delay?: number;
}

export const QuickLinkCard = ({
  icon: Icon,
  label,
  path,
  gradient,
  delay = 0,
}: QuickLinkCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
    >
      <Link to={path}>
        <motion.div
          whileHover={{ scale: 1.05, y: -4 }}
          whileTap={{ scale: 0.98 }}
          className={`group relative overflow-hidden rounded-2xl p-6 shadow-md transition-all hover:shadow-xl ${gradient}`}
        >
          <div className="relative z-10 flex flex-col items-center gap-3">
            <motion.div
              whileHover={{ rotate: 10, scale: 1.1 }}
              transition={{ type: "spring", stiffness: 300 }}
              className="rounded-xl bg-white/30 p-3 backdrop-blur-sm"
            >
              <Icon className="h-6 w-6 text-white" strokeWidth={2.5} />
            </motion.div>
            <span className="text-sm font-semibold text-white">{label}</span>
          </div>
          
          {/* Glow effect on hover */}
          <div className="absolute inset-0 opacity-0 transition-opacity group-hover:opacity-100">
            <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent" />
          </div>
        </motion.div>
      </Link>
    </motion.div>
  );
};
