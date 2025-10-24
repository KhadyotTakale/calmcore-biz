import { Settings as SettingsIcon } from "lucide-react";
import { motion } from "framer-motion";

const Settings = () => {
  return (
    <div className="min-h-screen pb-28">
      <div className="mx-auto max-w-lg space-y-6 p-6">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="font-heading text-2xl font-bold text-foreground">Settings</h1>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="flex min-h-[60vh] flex-col items-center justify-center rounded-3xl border-2 border-dashed border-muted bg-card/50 p-12 text-center"
        >
          <motion.div
            animate={{ rotate: [0, 360] }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="mb-6 rounded-2xl bg-gradient-to-br from-primary/20 to-secondary/20 p-8"
          >
            <SettingsIcon className="h-16 w-16 text-primary" strokeWidth={1.5} />
          </motion.div>

          <h2 className="mb-3 font-heading text-2xl font-semibold">Settings</h2>
          <p className="max-w-sm text-muted-foreground">
            Customize your business preferences and account settings
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default Settings;
