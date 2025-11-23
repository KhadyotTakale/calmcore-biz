import {
  Home,
  Receipt,
  FileText,
  BarChart3,
  Settings,
  LogOut,
} from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useClerk } from "@clerk/clerk-react";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

const navItems = [
  { icon: Home, label: "Home", path: "/home" },
  { icon: Receipt, label: "Estimates", path: "/estimates" },
  { icon: FileText, label: "Invoices", path: "/invoices" },
  { icon: BarChart3, label: "Reports", path: "/reports" },
  { icon: Settings, label: "Settings", path: "/settings" },
];

export const DesktopNav = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { signOut } = useClerk();
  const { toast } = useToast();
  const [isSigningOut, setIsSigningOut] = useState(false);

  const handleSignOut = async () => {
    try {
      setIsSigningOut(true);
      await signOut();

      toast({
        title: "Signed out successfully",
        description: "You have been logged out of your account.",
      });

      navigate("/");
    } catch (error) {
      console.error("Sign out error:", error);
      toast({
        title: "Sign out failed",
        description: "There was an error signing you out. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSigningOut(false);
    }
  };

  return (
    <nav className="hidden md:block fixed top-0 left-0 right-0 z-50 border-b border-border bg-background/80 backdrop-blur-xl">
      <div className="mx-auto max-w-7xl px-6">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-success shadow-primary">
              <span className="font-heading text-lg font-bold text-white">
                E
              </span>
            </div>
            <span className="font-heading text-xl font-bold text-foreground">
              Elegant Enterprises
            </span>
          </Link>

          {/* Navigation Items */}
          <div className="flex items-center gap-2">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              const Icon = item.icon;

              return (
                <Link key={item.path} to={item.path} className="relative">
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className={`flex items-center gap-2 rounded-xl px-4 py-2 transition-all ${
                      isActive
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                    }`}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="activeNavTab"
                        className="absolute inset-0 rounded-xl bg-primary/10"
                        transition={{
                          type: "spring",
                          stiffness: 380,
                          damping: 30,
                        }}
                      />
                    )}
                    <Icon
                      className={`relative z-10 h-5 w-5`}
                      strokeWidth={isActive ? 2.5 : 2}
                    />
                    <span
                      className={`relative z-10 font-medium ${
                        isActive ? "text-primary" : ""
                      }`}
                    >
                      {item.label}
                    </span>
                  </motion.div>
                </Link>
              );
            })}

            {/* Sign Out Button */}
            <button
              onClick={handleSignOut}
              disabled={isSigningOut}
              className="relative"
            >
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center gap-2 rounded-xl px-4 py-2 transition-all text-destructive hover:bg-destructive/10 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <LogOut className="relative z-10 h-5 w-5" strokeWidth={2} />
                <span className="relative z-10 font-medium">
                  {isSigningOut ? "Signing Out..." : "Sign Out"}
                </span>
              </motion.div>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};
