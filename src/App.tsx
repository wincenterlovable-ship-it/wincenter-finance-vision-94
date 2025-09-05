import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu, Home, FileText, BarChart3, TrendingUp } from "lucide-react";
import { AppSidebar } from "@/components/AppSidebar";
import { FinancialProvider } from "@/contexts/FinancialContext";
import Dashboard from "./pages/Dashboard";
import Renegotiation from "./pages/Renegotiation";
import OperationalCosts from "./pages/OperationalCosts";
import CashFlow from "./pages/CashFlow";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const menuItems = [
  { title: "Dashboard", url: "/", icon: Home },
  { title: "Renegociação", url: "/renegotiation", icon: FileText },
  { title: "Custos", url: "/costs", icon: BarChart3 },
  { title: "Fluxo de Caixa", url: "/cashflow", icon: TrendingUp },
];

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <BrowserRouter>
        <FinancialProvider>
          <SidebarProvider>
            <div className="min-h-screen flex w-full bg-background">
              <AppSidebar />
              <div className="flex-1 flex flex-col">
                <header className="h-14 flex items-center justify-between border-b bg-surface px-4 sm:px-6">
                  <div className="flex items-center gap-2 sm:gap-4">
                    {/* Desktop Sidebar Trigger */}
                    <div className="hidden sm:block">
                      <SidebarTrigger />
                    </div>
                    
                    {/* Mobile Menu */}
                    <Sheet>
                      <SheetTrigger asChild>
                        <Button variant="ghost" size="sm" className="sm:hidden">
                          <Menu className="h-5 w-5" />
                        </Button>
                      </SheetTrigger>
                      <SheetContent side="left" className="w-64 p-0">
                        <div className="flex flex-col h-full">
                          <div className="p-6 border-b">
                            <div className="flex items-center gap-2">
                              <BarChart3 className="h-6 w-6 text-primary" />
                              <div>
                                <h2 className="text-lg font-bold text-foreground">Wincenter</h2>
                                <p className="text-sm text-muted-foreground">Financial System</p>
                              </div>
                            </div>
                          </div>
                          
                          <nav className="flex-1 p-4">
                            <div className="space-y-2">
                              {menuItems.map((item) => (
                                <Link
                                  key={item.title}
                                  to={item.url}
                                  className="flex items-center gap-3 w-full p-3 rounded-lg hover:bg-accent hover:text-accent-foreground transition-colors"
                                >
                                  <item.icon className="h-4 w-4" />
                                  <span>{item.title}</span>
                                </Link>
                              ))}
                            </div>
                          </nav>
                        </div>
                      </SheetContent>
                    </Sheet>
                    
                    <h1 className="text-lg sm:text-xl font-semibold text-foreground truncate">Wincenter Financial</h1>
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
                <main className="flex-1 p-4 sm:p-6 overflow-auto">
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
          <Toaster />
          <Sonner />
        </FinancialProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
