import { LucideIcon } from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

interface ActionCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  path: string;
  variant: "primary" | "secondary";
  delay?: number;
}

export const ActionCard = ({
  icon: Icon,
  title,
  description,
  path,
  variant,
  delay = 0,
}: ActionCardProps) => {
  const colors = {
    primary: {
      border: "border-success/30",
      bg: "bg-success/5 dark:bg-[rgba(15, 121, 96, 0.08)]",
      iconBg: "bg-success/10 dark:bg-[rgba(29, 148, 118, 0.14)]",
      iconColor: "text-success dark:text-success",
      shadow: "hover:shadow-[0_8px_24px_hsla(165,43%,72%,0.25)]",
    },
    secondary: {
      border: "border-accent/30",
      bg: "bg-accent/5 dark:bg-[rgba(239, 79, 35, 0.06)]",
      iconBg: "bg-accent/10 dark:bg-[rgba(82, 25, 10, 0.12)]",
      iconColor: "text-accent dark:text-accent",
      shadow: "hover:shadow-[0_8px_24px_hsla(12,100%,82%,0.25)]",
    },
  };

  const color = colors[variant];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
    >
      <Link to={path}>
        <motion.div
          whileHover={{ scale: 1.02, y: -4 }}
          whileTap={{ scale: 0.98 }}
          className={`group relative overflow-hidden rounded-2xl border-2 ${color.border} ${color.bg} p-6 transition-all ${color.shadow}`}
        >
          <div className="flex items-start gap-4">
            <motion.div
              whileHover={{ rotate: 10, scale: 1.1 }}
              transition={{ type: "spring", stiffness: 300 }}
              className={`rounded-xl ${color.iconBg} p-3`}
            >
              <Icon
                className={`h-7 w-7 ${color.iconColor}`}
                strokeWidth={2.5}
              />
            </motion.div>

            <div className="flex-1">
              <h3 className="mb-1 font-heading text-lg font-semibold text-foreground">
                {title}
              </h3>
              <p className="text-sm text-muted-foreground">{description}</p>
            </div>
          </div>

          {/* Animated gradient overlay on hover */}
          <div className="absolute inset-0 opacity-0 transition-opacity group-hover:opacity-100">
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent" />
          </div>
        </motion.div>
      </Link>
    </motion.div>
  );
};
