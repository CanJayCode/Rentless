import { useQuery } from "@tanstack/react-query";
import RoomCard from "@/components/room-card";
import RoomModal from "@/components/room-modal";
import { useState } from "react";
import type { Room } from "@shared/schema";

interface DashboardProps {
  selectedMonth: string;
}

export default function Dashboard({ selectedMonth }: DashboardProps) {
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);

  const { data: rooms = [], isLoading } = useQuery<Room[]>({
    queryKey: ["/api/rooms"],
  });

  const formatMonthName = (month: string) => {
    const [year, monthNum] = month.split("-");
    const date = new Date(parseInt(year), parseInt(monthNum) - 1);
    return date.toLocaleDateString("en-US", { month: "long", year: "numeric" });
  };

  if (isLoading) {
    return (
      <main className="p-4 max-w-6xl mx-auto">
        <div className="mb-4">
          <div className="h-6 bg-slate-200 rounded w-32 mb-2"></div>
          <div className="h-4 bg-slate-200 rounded w-64"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {Array.from({ length: 16 }).map((_, i) => (
            <div key={i} className="bg-white rounded-lg shadow-sm border border-slate-200 p-4 animate-pulse">
              <div className="h-4 bg-slate-200 rounded w-20 mb-3"></div>
              <div className="space-y-2 mb-4">
                <div className="h-4 bg-slate-200 rounded"></div>
                <div className="h-4 bg-slate-200 rounded"></div>
              </div>
              <div className="h-8 bg-slate-200 rounded"></div>
            </div>
          ))}
        </div>
      </main>
    );
  }

  return (
    <main className="p-4 max-w-6xl mx-auto">
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-slate-900 mb-2">All Rooms</h2>
        <p className="text-sm text-slate-600">
          {formatMonthName(selectedMonth)} - Manage rent and electricity for all rooms
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {rooms.map((room) => (
          <RoomCard
            key={room.id}
            room={room}
            selectedMonth={selectedMonth}
            onManage={() => setSelectedRoom(room)}
          />
        ))}
      </div>

      {selectedRoom && (
        <RoomModal
          room={selectedRoom}
          selectedMonth={selectedMonth}
          onClose={() => setSelectedRoom(null)}
        />
      )}
    </main>
  );
}
