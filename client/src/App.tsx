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
import { LoginScreen } from "@/components/LoginScreen";
import { useState, useEffect } from "react";

function Router({ onLogout }: { onLogout: () => void }) {
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}`;
  });

  return (
    <div className="min-h-screen bg-slate-50">
      <Navigation selectedMonth={selectedMonth} onMonthChange={setSelectedMonth} onLogout={onLogout} />
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
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Check if user is already authenticated (session storage)
    const authStatus = sessionStorage.getItem('authenticated');
    if (authStatus === 'true') {
      setIsAuthenticated(true);
    }
  }, []);

  const handleLogin = () => {
    setIsAuthenticated(true);
    sessionStorage.setItem('authenticated', 'true');
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem('authenticated');
  };

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        {!isAuthenticated ? (
          <LoginScreen onLogin={handleLogin} />
        ) : (
          <Router onLogout={handleLogout} />
        )}
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
