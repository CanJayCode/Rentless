import { Link, useLocation } from "wouter";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LayoutDashboard, Calendar, Settings, Menu } from "lucide-react";

interface NavigationProps {
  selectedMonth: string;
  onMonthChange: (month: string) => void;
}

export default function Navigation({ selectedMonth, onMonthChange }: NavigationProps) {
  const [location] = useLocation();

  const generateMonthOptions = () => {
    const options = [];
    const now = new Date();
    for (let i = -6; i <= 6; i++) {
      const date = new Date(now.getFullYear(), now.getMonth() + i, 1);
      const monthValue = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
      const monthLabel = date.toLocaleDateString("en-US", { month: "long", year: "numeric" });
      options.push({ value: monthValue, label: monthLabel });
    }
    return options;
  };

  const monthOptions = generateMonthOptions();

  return (
    <>
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-semibold text-slate-900">Room Manager</h1>
            <div className="flex items-center gap-3">
              <Select value={selectedMonth} onValueChange={onMonthChange}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {monthOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <nav className="bg-white border-b border-slate-200">
        <div className="px-4">
          <div className="flex space-x-8">
            <Link href="/">
              <a className={`py-3 px-1 border-b-2 font-medium text-sm flex items-center ${
                location === "/" 
                  ? "border-blue-500 text-blue-600" 
                  : "border-transparent text-slate-500 hover:text-slate-700"
              }`}>
                <LayoutDashboard className="mr-2 h-4 w-4" />
                Dashboard
              </a>
            </Link>
            <Link href="/overview">
              <a className={`py-3 px-1 border-b-2 font-medium text-sm flex items-center ${
                location === "/overview" 
                  ? "border-blue-500 text-blue-600" 
                  : "border-transparent text-slate-500 hover:text-slate-700"
              }`}>
                <Calendar className="mr-2 h-4 w-4" />
                Overview
              </a>
            </Link>
            <Link href="/settings">
              <a className={`py-3 px-1 border-b-2 font-medium text-sm flex items-center ${
                location === "/settings" 
                  ? "border-blue-500 text-blue-600" 
                  : "border-transparent text-slate-500 hover:text-slate-700"
              }`}>
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </a>
            </Link>
          </div>
        </div>
      </nav>
    </>
  );
}
