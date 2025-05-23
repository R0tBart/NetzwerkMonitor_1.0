import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertDeviceSchema } from "@shared/schema";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Device, InsertDevice } from "@shared/schema";
import { z } from "zod";

const formSchema = insertDeviceSchema.extend({
  bandwidth: z.coerce.number().min(0, "Bandbreite muss mindestens 0 sein"),
  maxBandwidth: z.coerce.number().min(1, "Maximale Bandbreite muss mindestens 1 sein"),
});

type FormData = z.infer<typeof formSchema>;

interface DeviceFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  device: Device | null;
}

export default function DeviceFormDialog({ open, onOpenChange, device }: DeviceFormDialogProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const isEditing = !!device;

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      type: "router",
      ipAddress: "",
      status: "online",
      bandwidth: 0,
      maxBandwidth: 1000,
      model: "",
      location: "",
    },
  });

  useEffect(() => {
    if (device) {
      form.reset({
        name: device.name,
        type: device.type,
        ipAddress: device.ipAddress,
        status: device.status,
        bandwidth: device.bandwidth,
        maxBandwidth: device.maxBandwidth,
        model: device.model || "",
        location: device.location || "",
      });
    } else {
      form.reset({
        name: "",
        type: "router",
        ipAddress: "",
        status: "online",
        bandwidth: 0,
        maxBandwidth: 1000,
        model: "",
        location: "",
      });
    }
  }, [device, form]);

  const createDevice = useMutation({
    mutationFn: (data: InsertDevice) => apiRequest("POST", "/api/devices", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/devices"] });
      toast({ title: "Gerät erfolgreich hinzugefügt" });
      onOpenChange(false);
    },
    onError: () => {
      toast({ title: "Fehler beim Hinzufügen des Geräts", variant: "destructive" });
    },
  });

  const updateDevice = useMutation({
    mutationFn: (data: Partial<InsertDevice>) => 
      apiRequest("PUT", `/api/devices/${device!.id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/devices"] });
      toast({ title: "Gerät erfolgreich aktualisiert" });
      onOpenChange(false);
    },
    onError: () => {
      toast({ title: "Fehler beim Aktualisieren des Geräts", variant: "destructive" });
    },
  });

  const onSubmit = (data: FormData) => {
    if (isEditing) {
      updateDevice.mutate(data);
    } else {
      createDevice.mutate(data);
    }
  };

  const isPending = createDevice.isPending || updateDevice.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Gerät bearbeiten" : "Neues Gerät hinzufügen"}
          </DialogTitle>
          <DialogDescription>
            {isEditing 
              ? "Bearbeiten Sie die Geräteinformationen und klicken Sie auf Speichern."
              : "Geben Sie die Geräteinformationen ein und klicken Sie auf Hinzufügen."
            }
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Gerätename *</Label>
              <Input
                id="name"
                {...form.register("name")}
                placeholder="z.B. Core Router R1"
              />
              {form.formState.errors.name && (
                <p className="text-sm text-error">{form.formState.errors.name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="type">Gerätetyp *</Label>
              <Select 
                value={form.watch("type")} 
                onValueChange={(value) => form.setValue("type", value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="router">Router</SelectItem>
                  <SelectItem value="switch">Switch</SelectItem>
                  <SelectItem value="access_point">Access Point</SelectItem>
                  <SelectItem value="firewall">Firewall</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="ipAddress">IP-Adresse *</Label>
              <Input
                id="ipAddress"
                {...form.register("ipAddress")}
                placeholder="z.B. 192.168.1.1"
              />
              {form.formState.errors.ipAddress && (
                <p className="text-sm text-error">{form.formState.errors.ipAddress.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select 
                value={form.watch("status")} 
                onValueChange={(value) => form.setValue("status", value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="online">Online</SelectItem>
                  <SelectItem value="warning">Warnung</SelectItem>
                  <SelectItem value="offline">Offline</SelectItem>
                  <SelectItem value="maintenance">Wartung</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="bandwidth">Aktuelle Bandbreite (MB/s)</Label>
              <Input
                id="bandwidth"
                type="number"
                {...form.register("bandwidth")}
                placeholder="0"
              />
              {form.formState.errors.bandwidth && (
                <p className="text-sm text-error">{form.formState.errors.bandwidth.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="maxBandwidth">Max. Bandbreite (MB/s) *</Label>
              <Input
                id="maxBandwidth"
                type="number"
                {...form.register("maxBandwidth")}
                placeholder="1000"
              />
              {form.formState.errors.maxBandwidth && (
                <p className="text-sm text-error">{form.formState.errors.maxBandwidth.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="model">Modell</Label>
              <Input
                id="model"
                {...form.register("model")}
                placeholder="z.B. Cisco ASR 1000"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Standort</Label>
              <Input
                id="location"
                {...form.register("location")}
                placeholder="z.B. Data Center A"
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Abbrechen
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Speichern..." : isEditing ? "Speichern" : "Hinzufügen"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
