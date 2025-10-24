import { Plus, Filter, Search } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { TransactionCard } from "@/components/TransactionCard";
import { Input } from "@/components/ui/input";

const mockTransactions = [
  {
    id: "1",
    type: "sale" as const,
    amount: 15450,
    party: "Acme Corp",
    date: "Today",
    category: "Product Sales",
  },
  {
    id: "2",
    type: "income" as const,
    amount: 8500,
    party: "TechStart Inc",
    date: "Today",
    category: "Services",
  },
  {
    id: "3",
    type: "expense" as const,
    amount: 3200,
    party: "Office Supplies Co",
    date: "Yesterday",
    category: "Office",
  },
  {
    id: "4",
    type: "purchase" as const,
    amount: 12000,
    party: "Wholesale Mart",
    date: "Yesterday",
    category: "Inventory",
  },
  {
    id: "5",
    type: "sale" as const,
    amount: 22500,
    party: "GlobalTech Solutions",
    date: "2 days ago",
    category: "Consulting",
  },
  {
    id: "6",
    type: "expense" as const,
    amount: 1800,
    party: "Utility Services",
    date: "2 days ago",
    category: "Bills",
  },
];

const Transactions = () => {
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
              Transactions
            </h1>
            <p className="text-sm text-muted-foreground">
              Track all your business transactions
            </p>
          </div>
          <Button className="rounded-xl bg-gradient-to-r from-primary to-success text-white shadow-primary hover:shadow-lg">
            <Plus className="mr-2 h-4 w-4" />
            Add New
          </Button>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex flex-col gap-3 sm:flex-row"
        >
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search transactions..."
              className="rounded-xl pl-10"
            />
          </div>
          <Button variant="outline" className="rounded-xl">
            <Filter className="mr-2 h-4 w-4" />
            Filter
          </Button>
        </motion.div>

        {/* Summary Cards */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
        >
          <div className="rounded-2xl bg-gradient-to-br from-success/10 to-success/5 p-4">
            <p className="mb-1 text-xs text-muted-foreground">Total Sales</p>
            <p className="font-mono text-2xl font-bold text-success">₹52,450</p>
          </div>
          <div className="rounded-2xl bg-gradient-to-br from-warning/10 to-warning/5 p-4">
            <p className="mb-1 text-xs text-muted-foreground">Total Purchases</p>
            <p className="font-mono text-2xl font-bold text-warning">₹12,000</p>
          </div>
          <div className="rounded-2xl bg-gradient-to-br from-destructive/10 to-destructive/5 p-4">
            <p className="mb-1 text-xs text-muted-foreground">Total Expenses</p>
            <p className="font-mono text-2xl font-bold text-destructive">₹5,000</p>
          </div>
          <div className="rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 p-4">
            <p className="mb-1 text-xs text-muted-foreground">Net Profit</p>
            <p className="font-mono text-2xl font-bold text-primary">₹35,450</p>
          </div>
        </motion.div>

        {/* Transactions List */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="space-y-4"
        >
          <h2 className="font-heading text-lg font-semibold text-foreground">
            Recent Transactions
          </h2>
          <div className="grid gap-4 lg:grid-cols-2">
            {mockTransactions.map((transaction, index) => (
              <TransactionCard
                key={transaction.id}
                {...transaction}
                delay={0.05 * index}
              />
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Transactions;
