import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Dashboard from "@/pages/dashboard";
import Overview from "@/pages/overview";
import Settings from "@/pages/settings";
import NotFound from "@/pages/not-found";
import Navigation from "@/components/navigation";
import { useState } from "react";

function Router() {
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}`;
  });

  return (
    <div className="min-h-screen bg-slate-50">
      <Navigation selectedMonth={selectedMonth} onMonthChange={setSelectedMonth} />
      <Switch>
        <Route path="/" component={() => <Dashboard selectedMonth={selectedMonth} />} />
        <Route path="/overview" component={() => <Overview selectedMonth={selectedMonth} />} />
        <Route path="/settings" component={Settings} />
        <Route component={NotFound} />
      </Switch>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
