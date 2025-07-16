import { useQuery } from "@tanstack/react-query";
import type { Room } from "@shared/schema";

export function useRooms() {
  return useQuery<Room[]>({
    queryKey: ["/api/rooms"],
  });
}

export function useRoom(id: number) {
  return useQuery<Room>({
    queryKey: ["/api/rooms", id],
    enabled: !!id,
  });
}
