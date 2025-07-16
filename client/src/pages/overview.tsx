import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Download } from "lucide-react";
import type { Room } from "@shared/schema";

interface OverviewProps {
  selectedMonth: string;
}

export default function Overview({ selectedMonth }: OverviewProps) {
  const { data: rooms = [], isLoading } = useQuery<Room[]>({
    queryKey: ["/api/rooms"],
  });

  const formatMonthName = (month: string) => {
    const [year, monthNum] = month.split("-");
    const date = new Date(parseInt(year), parseInt(monthNum) - 1);
    return date.toLocaleDateString("en-US", { month: "long", year: "numeric" });
  };

  const handleExportCSV = () => {
    const url = `/api/export/csv/${selectedMonth}`;
    const link = document.createElement("a");
    link.href = url;
    link.download = `rooms-${selectedMonth}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "paid":
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Paid</Badge>;
      case "partial":
        return <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100">Partial</Badge>;
      case "pending":
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Pending</Badge>;
      default:
        return <Badge variant="secondary">N/A</Badge>;
    }
  };

  if (isLoading) {
    return (
      <div className="p-4 max-w-6xl mx-auto">
        <div className="mb-6">
          <div className="h-6 bg-slate-200 rounded w-40 mb-2"></div>
          <div className="h-4 bg-slate-200 rounded w-60"></div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4">
          <div className="animate-pulse">
            <div className="h-4 bg-slate-200 rounded w-full mb-2"></div>
            <div className="h-4 bg-slate-200 rounded w-3/4"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 max-w-6xl mx-auto">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-slate-900">Monthly Overview</h2>
          <Button onClick={handleExportCSV} className="bg-green-600 hover:bg-green-700">
            <Download className="mr-2 h-4 w-4" />
            Export CSV
          </Button>
        </div>
        <p className="text-sm text-slate-600">
          Complete overview of all rooms for {formatMonthName(selectedMonth)}
        </p>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Room
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Tenant
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Rent Status
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Rent Amount
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Units
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Electricity
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Bill Status
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Notes
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {rooms.map((room) => {
                const monthData = (room.monthlyData as any)?.[selectedMonth];
                const rent = monthData?.rent || {};
                const electricity = monthData?.electricity || {};

                return (
                  <tr key={room.id} className="hover:bg-slate-50">
                    <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-slate-900">
                      {room.roomNumber}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-slate-600">
                      {room.tenantName}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      {getStatusBadge(rent.status || "pending")}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-slate-600">
                      ₹{rent.amountPaid || 0}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-slate-600">
                      {electricity.unitsConsumed ? `${electricity.unitsConsumed} units` : "N/A"}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-slate-600">
                      ₹{electricity.amountDue || 0}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      {getStatusBadge(electricity.status || "pending")}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-slate-600">
                      {rent.notes || electricity.notes || ""}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
