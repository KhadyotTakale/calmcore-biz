import { Settings, Bell } from "lucide-react";
import { motion } from "framer-motion";
import dashboardHero from "@/assets/dashboard-hero.jpg";

export const DashboardHeader = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary/10 via-secondary/10 to-info/10 p-8 shadow-lg"
      style={{
        backgroundImage: `url(${dashboardHero})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {/* Overlay for better text readability */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/90 via-white/85 to-white/80" />
      
      <div className="relative z-10">
        <div className="mb-6 flex items-start justify-between">
          <div className="flex items-center gap-4">
            <motion.div
              whileHover={{ rotate: 360 }}
              transition={{ duration: 0.6 }}
              className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-success shadow-primary"
            >
              <span className="font-heading text-2xl font-bold text-white">B</span>
            </motion.div>
            
            <div>
              <motion.h1
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="font-heading text-2xl font-bold text-foreground"
              >
                BizFlow Pro
              </motion.h1>
              <p className="text-sm text-muted-foreground">Premium Account</p>
            </div>
          </div>

          <div className="flex gap-2">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="rounded-xl bg-white/80 p-3 shadow-sm backdrop-blur-sm transition-all hover:shadow-md"
            >
              <Bell className="h-5 w-5 text-muted-foreground" />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="rounded-xl bg-white/80 p-3 shadow-sm backdrop-blur-sm transition-all hover:shadow-md"
            >
              <Settings className="h-5 w-5 text-muted-foreground" />
            </motion.button>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="grid grid-cols-3 gap-4"
        >
          <div className="rounded-xl bg-white/60 p-4 backdrop-blur-sm">
            <p className="mb-1 text-xs text-muted-foreground">Today's Sales</p>
            <p className="font-mono text-xl font-semibold text-success">₹12,450</p>
          </div>
          <div className="rounded-xl bg-white/60 p-4 backdrop-blur-sm">
            <p className="mb-1 text-xs text-muted-foreground">Pending</p>
            <p className="font-mono text-xl font-semibold text-warning">₹5,200</p>
          </div>
          <div className="rounded-xl bg-white/60 p-4 backdrop-blur-sm">
            <p className="mb-1 text-xs text-muted-foreground">This Month</p>
            <p className="font-mono text-xl font-semibold text-primary">₹1.2L</p>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};
