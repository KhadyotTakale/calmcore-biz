import { Plus, Filter, Search } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { InvoiceCard } from "@/components/InvoiceCard";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

const mockInvoices = [
  {
    invoiceNumber: "INV-2024-001",
    customerName: "Acme Corporation",
    amount: 45000,
    status: "paid" as const,
    date: "15 Jan 2024",
    dueDate: "30 Jan 2024",
  },
  {
    invoiceNumber: "INV-2024-002",
    customerName: "TechStart Inc",
    amount: 28500,
    status: "pending" as const,
    date: "18 Jan 2024",
    dueDate: "02 Feb 2024",
  },
  {
    invoiceNumber: "INV-2024-003",
    customerName: "GlobalTech Solutions",
    amount: 67000,
    status: "paid" as const,
    date: "20 Jan 2024",
    dueDate: "05 Feb 2024",
  },
  {
    invoiceNumber: "INV-2024-004",
    customerName: "Digital Dynamics",
    amount: 15000,
    status: "overdue" as const,
    date: "10 Jan 2024",
    dueDate: "25 Jan 2024",
  },
  {
    invoiceNumber: "INV-2024-005",
    customerName: "Innovation Labs",
    amount: 52000,
    status: "pending" as const,
    date: "22 Jan 2024",
    dueDate: "08 Feb 2024",
  },
  {
    invoiceNumber: "INV-2024-006",
    customerName: "Future Systems",
    amount: 38000,
    status: "paid" as const,
    date: "25 Jan 2024",
    dueDate: "10 Feb 2024",
  },
];

const Invoices = () => {
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
              Invoices
            </h1>
            <p className="text-sm text-muted-foreground">
              Manage and track all your invoices
            </p>
          </div>
          <Button className="rounded-xl bg-gradient-to-r from-accent to-destructive text-white shadow-accent hover:shadow-lg">
            <Plus className="mr-2 h-4 w-4" />
            Create Invoice
          </Button>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="grid gap-4 sm:grid-cols-3"
        >
          <div className="rounded-2xl bg-gradient-to-br from-success/10 to-success/5 p-4">
            <p className="mb-1 text-xs text-muted-foreground">Total Invoiced</p>
            <p className="font-mono text-2xl font-bold text-success">₹2,45,500</p>
          </div>
          <div className="rounded-2xl bg-gradient-to-br from-warning/10 to-warning/5 p-4">
            <p className="mb-1 text-xs text-muted-foreground">Pending</p>
            <p className="font-mono text-2xl font-bold text-warning">₹80,500</p>
          </div>
          <div className="rounded-2xl bg-gradient-to-br from-destructive/10 to-destructive/5 p-4">
            <p className="mb-1 text-xs text-muted-foreground">Overdue</p>
            <p className="font-mono text-2xl font-bold text-destructive">₹15,000</p>
          </div>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex flex-col gap-3 sm:flex-row sm:items-center"
        >
          <Tabs defaultValue="all" className="w-full sm:w-auto">
            <TabsList className="grid w-full grid-cols-4 sm:w-auto">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="paid">Paid</TabsTrigger>
              <TabsTrigger value="pending">Pending</TabsTrigger>
              <TabsTrigger value="overdue">Overdue</TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="flex flex-1 gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Search invoices..." className="rounded-xl pl-10" />
            </div>
            <Button variant="outline" className="rounded-xl">
              <Filter className="mr-2 h-4 w-4" />
              Filter
            </Button>
          </div>
        </motion.div>

        {/* Invoices Grid */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="grid gap-4 md:grid-cols-2 lg:grid-cols-3"
        >
          {mockInvoices.map((invoice, index) => (
            <InvoiceCard key={invoice.invoiceNumber} {...invoice} delay={0.05 * index} />
          ))}
        </motion.div>
      </div>
    </div>
  );
};

export default Invoices;
