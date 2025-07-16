import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { updateRoomSchema } from "@shared/schema";
import { Home, Zap, Save } from "lucide-react";
import { useEffect } from "react";
import type { Room, Settings, UpdateRoom } from "@shared/schema";

interface RoomModalProps {
  room: Room;
  selectedMonth: string;
  onClose: () => void;
}

export default function RoomModal({ room, selectedMonth, onClose }: RoomModalProps) {
  const { toast } = useToast();
  
  const { data: settings } = useQuery<Settings>({
    queryKey: ["/api/settings"],
  });

  const monthData = (room.monthlyData as any)?.[selectedMonth];
  const rent = monthData?.rent || {};
  const electricity = monthData?.electricity || {};

  const form = useForm<UpdateRoom>({
    resolver: zodResolver(updateRoomSchema),
    defaultValues: {
      tenantName: room.tenantName,
      rentPaid: rent.amountPaid || 0,
      rentDate: rent.date || "",
      rentNotes: rent.notes || "",
      previousReading: electricity.previousReading || 0,
      currentReading: electricity.currentReading || 0,
      electricityPaid: electricity.amountPaid || 0,
      electricityDate: electricity.date || "",
      electricityNotes: electricity.notes || "",
    },
  });

  const updateRoomMutation = useMutation({
    mutationFn: async (data: UpdateRoom) => {
      const response = await apiRequest("POST", `/api/rooms/${room.id}/month/${selectedMonth}`, data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Room updated",
        description: "Room data has been saved successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/rooms"] });
      onClose();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update room. Please try again.",
        variant: "destructive",
      });
    },
  });

  const watchedValues = form.watch();
  const baseRent = settings?.baseRent || 3000;
  const unitRate = settings?.unitRate || 10;

  const unitsConsumed = Math.max(0, watchedValues.currentReading - watchedValues.previousReading);
  const electricityAmountDue = unitsConsumed * unitRate;
  const rentBalance = baseRent - watchedValues.rentPaid;
  const electricityBalance = electricityAmountDue - watchedValues.electricityPaid;

  const onSubmit = (data: UpdateRoom) => {
    updateRoomMutation.mutate(data);
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Manage {room.roomNumber}</DialogTitle>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Tenant Info */}
          <div className="space-y-2">
            <Label htmlFor="tenantName">Tenant Name</Label>
            <Input
              id="tenantName"
              {...form.register("tenantName")}
              placeholder="Enter tenant name"
            />
            {form.formState.errors.tenantName && (
              <p className="text-sm text-red-600">{form.formState.errors.tenantName.message}</p>
            )}
          </div>

          {/* Rent Section */}
          <div className="bg-slate-50 p-4 rounded-lg space-y-3">
            <h4 className="font-medium text-slate-900 flex items-center">
              <Home className="mr-2 h-4 w-4 text-blue-600" />
              Rent Details
            </h4>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-600">Amount Due</span>
              <span className="font-medium text-slate-900">₹{baseRent}</span>
            </div>

            <div className="space-y-2">
              <Label htmlFor="rentPaid">Amount Paid</Label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500">₹</span>
                <Input
                  id="rentPaid"
                  type="number"
                  className="pl-8"
                  {...form.register("rentPaid", { valueAsNumber: true })}
                />
              </div>
              {form.formState.errors.rentPaid && (
                <p className="text-sm text-red-600">{form.formState.errors.rentPaid.message}</p>
              )}
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-600">Balance Remaining</span>
              <span className={`font-medium ${rentBalance <= 0 ? 'text-green-600' : 'text-red-600'}`}>
                ₹{rentBalance}
              </span>
            </div>

            <div className="space-y-2">
              <Label htmlFor="rentDate">Payment Date</Label>
              <Input
                id="rentDate"
                type="date"
                {...form.register("rentDate")}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="rentNotes">Notes</Label>
              <Textarea
                id="rentNotes"
                rows={2}
                {...form.register("rentNotes")}
                placeholder="Payment notes..."
              />
            </div>
          </div>

          {/* Electricity Section */}
          <div className="bg-slate-50 p-4 rounded-lg space-y-3">
            <h4 className="font-medium text-slate-900 flex items-center">
              <Zap className="mr-2 h-4 w-4 text-amber-600" />
              Electricity Details
            </h4>
            
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="previousReading">Previous Reading</Label>
                <Input
                  id="previousReading"
                  type="number"
                  {...form.register("previousReading", { valueAsNumber: true })}
                />
                {form.formState.errors.previousReading && (
                  <p className="text-sm text-red-600">{form.formState.errors.previousReading.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="currentReading">Current Reading</Label>
                <Input
                  id="currentReading"
                  type="number"
                  {...form.register("currentReading", { valueAsNumber: true })}
                />
                {form.formState.errors.currentReading && (
                  <p className="text-sm text-red-600">{form.formState.errors.currentReading.message}</p>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-600">Units Consumed</span>
              <span className="font-medium text-slate-900">{unitsConsumed} units</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-600">Amount Due</span>
              <span className="font-medium text-slate-900">₹{electricityAmountDue}</span>
            </div>

            <div className="space-y-2">
              <Label htmlFor="electricityPaid">Amount Paid</Label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500">₹</span>
                <Input
                  id="electricityPaid"
                  type="number"
                  className="pl-8"
                  {...form.register("electricityPaid", { valueAsNumber: true })}
                />
              </div>
              {form.formState.errors.electricityPaid && (
                <p className="text-sm text-red-600">{form.formState.errors.electricityPaid.message}</p>
              )}
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-600">Balance Remaining</span>
              <span className={`font-medium ${electricityBalance <= 0 ? 'text-green-600' : 'text-red-600'}`}>
                ₹{electricityBalance}
              </span>
            </div>

            <div className="space-y-2">
              <Label htmlFor="electricityDate">Payment Date</Label>
              <Input
                id="electricityDate"
                type="date"
                {...form.register("electricityDate")}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="electricityNotes">Notes</Label>
              <Textarea
                id="electricityNotes"
                rows={2}
                {...form.register("electricityNotes")}
                placeholder="Payment notes..."
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3">
            <Button
              type="submit"
              disabled={updateRoomMutation.isPending}
              className="flex-1 bg-blue-600 hover:bg-blue-700"
            >
              <Save className="mr-2 h-4 w-4" />
              Save Changes
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
            >
              Cancel
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
