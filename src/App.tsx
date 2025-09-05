import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { AppSidebar } from "@/components/AppSidebar";
import { FinancialProvider } from "@/contexts/FinancialContext";
import Dashboard from "./pages/Dashboard";
import Renegotiation from "./pages/Renegotiation";
import OperationalCosts from "./pages/OperationalCosts";
import CashFlow from "./pages/CashFlow";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <FinancialProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <SidebarProvider>
            <div className="min-h-screen flex w-full bg-background">
              <AppSidebar />
              <div className="flex-1 flex flex-col">
                <header className="h-14 flex items-center justify-between border-b bg-surface px-6">
                  <div className="flex items-center gap-4">
                    <SidebarTrigger />
                    <h1 className="text-xl font-semibold text-foreground">Wincenter Financial</h1>
                  </div>
                  <nav className="hidden md:flex items-center gap-2">
                    <Button asChild variant="ghost" size="sm">
                      <Link to="/">Dashboard</Link>
                    </Button>
                    <Button asChild variant="ghost" size="sm">
                      <Link to="/renegotiation">Renegociação</Link>
                    </Button>
                    <Button asChild variant="ghost" size="sm">
                      <Link to="/costs">Custos</Link>
                    </Button>
                    <Button asChild variant="ghost" size="sm">
                      <Link to="/cashflow">Fluxo de Caixa</Link>
                    </Button>
                  </nav>
                </header>
                <main className="flex-1 p-6">
                  <Routes>
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/renegotiation" element={<Renegotiation />} />
                    <Route path="/costs" element={<OperationalCosts />} />
                    <Route path="/cashflow" element={<CashFlow />} />
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </main>
              </div>
            </div>
          </SidebarProvider>
        </BrowserRouter>
      </FinancialProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
