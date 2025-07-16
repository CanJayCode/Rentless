import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Save, RefreshCw, Trash2, Download, Upload } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Settings } from "@shared/schema";

export default function Settings() {
  const { toast } = useToast();
  const [baseRent, setBaseRent] = useState("");
  const [unitRate, setUnitRate] = useState("");

  const { data: settings } = useQuery<Settings>({
    queryKey: ["/api/settings"],
    onSuccess: (data) => {
      setBaseRent(data.baseRent.toString());
      setUnitRate(data.unitRate.toString());
    },
  });

  const updateSettingsMutation = useMutation({
    mutationFn: async (data: { baseRent: number; unitRate: number }) => {
      const response = await apiRequest("POST", "/api/settings", data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Settings updated",
        description: "Your settings have been saved successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/settings"] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update settings. Please try again.",
        variant: "destructive",
      });
    },
  });

  const resetMonthMutation = useMutation({
    mutationFn: async (month: string) => {
      const response = await apiRequest("POST", "/api/data/reset-month", { month });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Month data reset",
        description: "Current month data has been cleared.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/rooms"] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to reset month data. Please try again.",
        variant: "destructive",
      });
    },
  });

  const resetAllMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/data/reset-all", {});
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "All data reset",
        description: "All data has been permanently deleted.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/rooms"] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to reset all data. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSaveSettings = () => {
    const baseRentValue = parseInt(baseRent);
    const unitRateValue = parseInt(unitRate);

    if (!baseRentValue || !unitRateValue) {
      toast({
        title: "Invalid input",
        description: "Please enter valid numbers for both fields.",
        variant: "destructive",
      });
      return;
    }

    updateSettingsMutation.mutate({
      baseRent: baseRentValue,
      unitRate: unitRateValue,
    });
  };

  const handleResetMonth = () => {
    if (confirm("Are you sure you want to reset current month data?")) {
      const now = new Date();
      const month = `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}`;
      resetMonthMutation.mutate(month);
    }
  };

  const handleResetAll = () => {
    if (confirm("Are you sure you want to reset ALL data? This cannot be undone.")) {
      resetAllMutation.mutate();
    }
  };

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-slate-900 mb-2">Settings</h2>
        <p className="text-sm text-slate-600">Configure default values and manage data</p>
      </div>

      <div className="space-y-6">
        {/* General Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="text-md">General Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="baseRent">Base Monthly Rent</Label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500">₹</span>
                <Input
                  id="baseRent"
                  type="number"
                  className="pl-8"
                  value={baseRent}
                  onChange={(e) => setBaseRent(e.target.value)}
                  placeholder="3000"
                />
              </div>
              <p className="text-xs text-slate-500">Default rent amount for new rooms</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="unitRate">Electricity Unit Rate</Label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500">₹</span>
                <Input
                  id="unitRate"
                  type="number"
                  className="pl-8 pr-12"
                  value={unitRate}
                  onChange={(e) => setUnitRate(e.target.value)}
                  placeholder="10"
                />
                <span className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-500">/unit</span>
              </div>
              <p className="text-xs text-slate-500">Rate per unit of electricity consumption</p>
            </div>

            <Button
              onClick={handleSaveSettings}
              disabled={updateSettingsMutation.isPending}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Save className="mr-2 h-4 w-4" />
              Save Settings
            </Button>
          </CardContent>
        </Card>

        {/* Data Management */}
        <Card>
          <CardHeader>
            <CardTitle className="text-md">Data Management</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-amber-50 border border-amber-200 rounded-lg">
              <div>
                <h4 className="font-medium text-amber-900">Reset Current Month Data</h4>
                <p className="text-sm text-amber-700">Clear all rent and electricity data for current month</p>
              </div>
              <Button
                variant="outline"
                onClick={handleResetMonth}
                disabled={resetMonthMutation.isPending}
                className="bg-amber-600 text-white hover:bg-amber-700 border-amber-600"
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Reset Month
              </Button>
            </div>

            <div className="flex items-center justify-between p-4 bg-red-50 border border-red-200 rounded-lg">
              <div>
                <h4 className="font-medium text-red-900">Reset All Data</h4>
                <p className="text-sm text-red-700">Permanently delete all data for all months</p>
              </div>
              <Button
                variant="outline"
                onClick={handleResetAll}
                disabled={resetAllMutation.isPending}
                className="bg-red-600 text-white hover:bg-red-700 border-red-600"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Reset All
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
