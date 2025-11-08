import {
  TrendingUp,
  DollarSign,
  ShoppingCart,
  CreditCard,
  Calendar,
} from "lucide-react";
import { motion } from "framer-motion";
import { StatCard } from "@/components/StatCard";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const Reports = () => {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen pb-28">
      <div className="mx-auto max-w-7xl space-y-6 p-4 md:p-6 lg:p-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
        >
          <div>
            <h1 className="font-heading text-2xl font-bold text-foreground md:text-3xl">
              Reports & Analytics
            </h1>
            <p className="text-sm text-muted-foreground">
              Track your business performance
            </p>
          </div>
          <Button variant="outline" className="rounded-xl">
            <Calendar className="mr-2 h-4 w-4" />
            This Month
          </Button>
        </motion.div>

        {/* Stats Overview */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
        >
          <StatCard
            icon={DollarSign}
            label="Total Revenue"
            value="₹2.45L"
            change="+12.5%"
            changeType="positive"
            gradient="gradient-primary"
            delay={0.1}
          />
          <StatCard
            icon={TrendingUp}
            label="Net Profit"
            value="₹1.82L"
            change="+8.3%"
            changeType="positive"
            gradient="gradient-secondary"
            delay={0.15}
          />
          <StatCard
            icon={ShoppingCart}
            label="Total Sales"
            value="₹1.95L"
            change="+15.2%"
            changeType="positive"
            gradient="gradient-accent"
            delay={0.2}
          />
          <StatCard
            icon={CreditCard}
            label="Expenses"
            value="₹63K"
            change="-3.1%"
            changeType="positive"
            gradient="bg-gradient-to-br from-warning to-warning/80"
            delay={0.25}
          />
        </motion.div>

        {/* Charts Section */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="grid gap-6 lg:grid-cols-2"
        >
          {/* Revenue Chart */}
          <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
            <h3 className="mb-4 font-heading text-lg font-semibold text-foreground">
              Revenue Overview
            </h3>
            <div className="flex h-64 items-end justify-around gap-2">
              {[65, 78, 82, 90, 85, 95, 88].map((height, index) => (
                <motion.div
                  key={index}
                  initial={{ height: 0 }}
                  animate={{ height: `${height}%` }}
                  transition={{ delay: 0.4 + index * 0.1, duration: 0.5 }}
                  className="flex-1 rounded-t-lg bg-gradient-to-t from-primary to-success"
                />
              ))}
            </div>
            <div className="mt-4 flex justify-around text-xs text-muted-foreground">
              <span>Mon</span>
              <span>Tue</span>
              <span>Wed</span>
              <span>Thu</span>
              <span>Fri</span>
              <span>Sat</span>
              <span>Sun</span>
            </div>
          </div>

          {/* Expense Breakdown */}
          <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
            <h3 className="mb-4 font-heading text-lg font-semibold text-foreground">
              Expense Breakdown
            </h3>
            <div className="space-y-4">
              {[
                {
                  label: "Inventory",
                  amount: "₹28,000",
                  percentage: 45,
                  color: "bg-primary",
                },
                {
                  label: "Salaries",
                  amount: "₹18,000",
                  percentage: 30,
                  color: "bg-secondary",
                },
                {
                  label: "Office",
                  amount: "₹10,000",
                  percentage: 15,
                  color: "bg-accent",
                },
                {
                  label: "Utilities",
                  amount: "₹7,000",
                  percentage: 10,
                  color: "bg-warning",
                },
              ].map((item, index) => (
                <motion.div
                  key={item.label}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + index * 0.1 }}
                >
                  <div className="mb-2 flex items-center justify-between text-sm">
                    <span className="font-medium text-foreground">
                      {item.label}
                    </span>
                    <span className="font-mono text-muted-foreground">
                      {item.amount}
                    </span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-muted">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${item.percentage}%` }}
                      transition={{ delay: 0.6 + index * 0.1, duration: 0.8 }}
                      className={`h-full ${item.color}`}
                    />
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Quick Reports */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
        >
          <h2 className="mb-4 font-heading text-lg font-semibold text-foreground">
            Quick Reports
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                title: "Day Book",
                description: "View all transactions for any day",
                gradient: "from-primary/10 to-primary/5",
                onclick: () => navigate("/daybook"),
              },
              {
                title: "Profit & Loss",
                description: "Detailed P&L statement",
                gradient: "from-success/10 to-success/5",
              },
              {
                title: "Sales Report",
                description: "Complete sales analysis",
                gradient: "from-secondary/10 to-secondary/5",
              },
              {
                title: "Purchase Report",
                description: "Track all purchases",
                gradient: "from-warning/10 to-warning/5",
              },
              {
                title: "Party Ledger",
                description: "Customer & vendor statements",
                gradient: "from-info/10 to-info/5",
              },
              {
                title: "Tax Summary",
                description: "GST and tax reports",
                gradient: "from-accent/10 to-accent/5",
              },
            ].map((report, index) => (
              <motion.button
                key={report.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 + index * 0.05 }}
                whileHover={{ scale: 1.02, y: -2 }}
                className={`rounded-2xl border border-border bg-gradient-to-br ${report.gradient} p-6 text-left shadow-sm transition-all hover:shadow-md`}
              >
                <h3 className="mb-2 font-heading text-lg font-semibold text-foreground">
                  {report.title}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {report.description}
                </p>
              </motion.button>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Reports;
