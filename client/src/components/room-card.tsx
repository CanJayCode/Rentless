import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Edit } from "lucide-react";
import type { Room } from "@shared/schema";

interface RoomCardProps {
  room: Room;
  selectedMonth: string;
  onManage: () => void;
}

export default function RoomCard({ room, selectedMonth, onManage }: RoomCardProps) {
  const monthData = (room.monthlyData as any)?.[selectedMonth];
  const rent = monthData?.rent || {};
  const electricity = monthData?.electricity || {};

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "paid":
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Paid</Badge>;
      case "partial":
        return <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100">Partial</Badge>;
      case "pending":
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Pending</Badge>;
      default:
        return <Badge variant="secondary">Not recorded</Badge>;
    }
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-slate-900">{room.roomNumber}</h3>
          <span className="text-xs text-slate-500">{room.tenantName}</span>
        </div>
        
        <div className="space-y-2 mb-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-600">Rent</span>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">₹{rent.amountPaid || 0}</span>
              {getStatusBadge(rent.status || "pending")}
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-600">Electricity</span>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">₹{electricity.amountDue || 0}</span>
              {getStatusBadge(electricity.status || "pending")}
            </div>
          </div>
        </div>
        
        <Button 
          onClick={onManage}
          className="w-full bg-blue-600 hover:bg-blue-700"
        >
          <Edit className="mr-2 h-4 w-4" />
          Manage
        </Button>
      </CardContent>
    </Card>
  );
}
