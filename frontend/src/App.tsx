import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { BottomNav } from "@/components/BottomNav";
import { DesktopNav } from "@/components/DesktopNav";
import Home from "./pages/Home";
import Transactions from "./pages/Transactions";
import Invoices from "./pages/Invoices";
import Reports from "./pages/Reports";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";
import GenerateEstimate from "./pages/GenerateEstimate";
import GenerateInvoice from "./pages/GenerateInvoice";
import EstimatesList from "./pages/EstimatesList";
import ViewEstimate from "./pages/ViewEstimate";
import EstimatePreview from "./pages/EstimatePreview";
import Daybook from "./pages/Daybook";
import InvoicePreview from "./pages/InvoicePreview";

const queryClient = new QueryClient();

// Create a Layout component that conditionally shows navigation
const Layout = ({ children }) => {
  const location = useLocation();

  // Pages where navigation should be hidden
  const hideNavRoutes = ["/estimate-preview", "/invoice-preview"];
  const shouldHideNav = hideNavRoutes.includes(location.pathname);

  return (
    <>
      {!shouldHideNav && <DesktopNav />}
      {/* Desktop: Add left margin for sidebar. Mobile: Add top padding for hamburger header */}
      <div className={!shouldHideNav ? "pt-16 pb-6" : ""}>{children}</div>
      {!shouldHideNav && <BottomNav />}
    </>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Layout>
          <Routes>
            {/* Main Pages */}
            <Route path="/" element={<Home />} />
            <Route path="/transactions" element={<Transactions />} />
            <Route path="/invoices" element={<Invoices />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/daybook" element={<Daybook />} />

            {/* Estimates Routes */}
            <Route path="/estimates" element={<EstimatesList />} />
            <Route path="/estimates/new" element={<GenerateEstimate />} />
            <Route path="/generate-estimate" element={<GenerateEstimate />} />
            <Route path="/estimate/:bookingId" element={<ViewEstimate />} />
            <Route path="/estimate-preview" element={<EstimatePreview />} />

            {/* Invoices Routes */}
            <Route path="/invoices/new" element={<GenerateInvoice />} />
            <Route path="/invoice-preview" element={<InvoicePreview />} />

            {/* 404 Catch-All - MUST BE LAST */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Layout>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
