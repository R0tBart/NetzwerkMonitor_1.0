import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { Eye, Edit, Trash2, Plus, ArrowUpDown, Router, Network, Wifi, Shield } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import DeviceFormDialog from "./device-form-dialog";
import type { Device } from "@shared/schema";

const deviceTypeIcons = {
  router: Router,
  switch: Network,
  access_point: Wifi,
  firewall: Shield,
};

const deviceTypeColors = {
  router: "bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400",
  switch: "bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-400",
  access_point: "bg-orange-100 dark:bg-orange-900 text-orange-600 dark:text-orange-400",
  firewall: "bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-400",
};

const statusVariants = {
  online: "bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200",
  warning: "bg-amber-100 dark:bg-amber-900 text-amber-800 dark:text-amber-200",
  offline: "bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200",
  maintenance: "bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200",
};

export default function DeviceTable() {
  const [filter, setFilter] = useState("all");
  const [sortField, setSortField] = useState<keyof Device>("id");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingDevice, setEditingDevice] = useState<Device | null>(null);

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: devices, isLoading } = useQuery<Device[]>({
    queryKey: ["/api/devices"],
    refetchInterval: 10000, // Refresh every 10 seconds
  });

  const deleteDevice = useMutation({
    mutationFn: (id: number) => apiRequest("DELETE", `/api/devices/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/devices"] });
      toast({ title: "Gerät erfolgreich gelöscht" });
    },
    onError: () => {
      toast({ title: "Fehler beim Löschen des Geräts", variant: "destructive" });
    },
  });

  const handleSort = (field: keyof Device) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const filteredAndSortedDevices = devices
    ?.filter(device => filter === "all" || device.type === filter)
    ?.sort((a, b) => {
      const aValue = a[sortField];
      const bValue = b[sortField];
      
      if (typeof aValue === "string" && typeof bValue === "string") {
        return sortDirection === "asc" 
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }
      
      if (typeof aValue === "number" && typeof bValue === "number") {
        return sortDirection === "asc" ? aValue - bValue : bValue - aValue;
      }
      
      return 0;
    }) || [];

  if (isLoading) {
    return (
      <Card className="bg-white dark:bg-card shadow-sm border border-slate-200 dark:border-border">
        <CardHeader>
          <CardTitle>Netzwerkgeräte</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-slate-100 dark:bg-slate-800 rounded animate-pulse"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="bg-white dark:bg-card shadow-sm border border-slate-200 dark:border-border">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold text-slate-800 dark:text-foreground">
              Netzwerkgeräte
            </CardTitle>
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2">
                <label className="text-sm text-slate-600 dark:text-muted-foreground">Filter:</label>
                <Select value={filter} onValueChange={setFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Alle Geräte</SelectItem>
                    <SelectItem value="router">Router</SelectItem>
                    <SelectItem value="switch">Switches</SelectItem>
                    <SelectItem value="access_point">Access Points</SelectItem>
                    <SelectItem value="firewall">Firewalls</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={() => setIsAddDialogOpen(true)} className="flex items-center space-x-2">
                <Plus className="h-4 w-4" />
                <span>Gerät hinzufügen</span>
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50 dark:bg-slate-800/50">
                  <TableHead>
                    <Button
                      variant="ghost"
                      onClick={() => handleSort("id")}
                      className="flex items-center space-x-1 h-auto p-0 font-medium text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider hover:text-slate-700 dark:hover:text-slate-300"
                    >
                      <span>Gerät ID</span>
                      <ArrowUpDown className="h-3 w-3" />
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button
                      variant="ghost"
                      onClick={() => handleSort("name")}
                      className="flex items-center space-x-1 h-auto p-0 font-medium text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider hover:text-slate-700 dark:hover:text-slate-300"
                    >
                      <span>Name</span>
                      <ArrowUpDown className="h-3 w-3" />
                    </Button>
                  </TableHead>
                  <TableHead className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Status
                  </TableHead>
                  <TableHead>
                    <Button
                      variant="ghost"
                      onClick={() => handleSort("bandwidth")}
                      className="flex items-center space-x-1 h-auto p-0 font-medium text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider hover:text-slate-700 dark:hover:text-slate-300"
                    >
                      <span>Bandbreite</span>
                      <ArrowUpDown className="h-3 w-3" />
                    </Button>
                  </TableHead>
                  <TableHead className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    IP Adresse
                  </TableHead>
                  <TableHead className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Letzte Aktivität
                  </TableHead>
                  <TableHead className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Aktionen
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAndSortedDevices.map((device) => {
                  const DeviceIcon = deviceTypeIcons[device.type as keyof typeof deviceTypeIcons] || Router;
                  const iconColorClass = deviceTypeColors[device.type as keyof typeof deviceTypeColors] || deviceTypeColors.router;
                  const statusClass = statusVariants[device.status as keyof typeof statusVariants] || statusVariants.offline;
                  const utilizationPercent = (device.bandwidth / device.maxBandwidth) * 100;
                  
                  return (
                    <TableRow key={device.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                      <TableCell className="whitespace-nowrap">
                        <span className="text-sm font-medium text-slate-800 dark:text-foreground">
                          {device.id.toString().padStart(3, '0')}
                        </span>
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        <div className="flex items-center">
                          <div className={`w-8 h-8 ${iconColorClass} rounded-lg flex items-center justify-center mr-3`}>
                            <DeviceIcon className="h-4 w-4" />
                          </div>
                          <div>
                            <div className="text-sm font-medium text-slate-800 dark:text-foreground">
                              {device.name}
                            </div>
                            <div className="text-sm text-slate-500 dark:text-muted-foreground">
                              {device.model || 'Unknown Model'}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        <Badge variant="secondary" className={statusClass}>
                          <div
                            className={`w-1.5 h-1.5 rounded-full mr-1 ${
                              device.status === 'online'
                                ? 'bg-green-500'
                                : device.status === 'warning'
                                ? 'bg-amber-500'
                                : device.status === 'offline'
                                ? 'bg-red-500'
                                : 'bg-slate-500'
                            }`}
                          />
                          {device.status === 'online' ? 'Online' :
                           device.status === 'warning' ? 'Warnung' :
                           device.status === 'offline' ? 'Offline' : 'Wartung'}
                        </Badge>
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="text-sm text-slate-800 dark:text-foreground mr-2">
                            {device.bandwidth} MB/s
                          </div>
                          <div className="w-16">
                            <Progress 
                              value={utilizationPercent} 
                              className="h-2"
                            />
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="whitespace-nowrap text-sm text-slate-600 dark:text-muted-foreground">
                        {device.ipAddress}
                      </TableCell>
                      <TableCell className="whitespace-nowrap text-sm text-slate-600 dark:text-muted-foreground">
                        {new Date(device.lastActivity).toLocaleString('de-DE', {
                          hour: '2-digit',
                          minute: '2-digit',
                          day: '2-digit',
                          month: '2-digit'
                        })}
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <Eye className="h-4 w-4 text-primary" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-8 w-8 p-0"
                            onClick={() => setEditingDevice(device)}
                          >
                            <Edit className="h-4 w-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-8 w-8 p-0"
                            onClick={() => deleteDevice.mutate(device.id)}
                            disabled={deleteDevice.isPending}
                          >
                            <Trash2 className="h-4 w-4 text-slate-400 hover:text-red-600" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          <div className="px-6 py-4 border-t border-slate-200 dark:border-border flex items-center justify-between">
            <div className="text-sm text-slate-600 dark:text-muted-foreground">
              Zeige 1-{filteredAndSortedDevices.length} von {devices?.length || 0} Geräten
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm" disabled>
                Zurück
              </Button>
              <Button size="sm">1</Button>
              <Button variant="outline" size="sm" disabled>
                Weiter
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <DeviceFormDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        device={null}
      />

      <DeviceFormDialog
        open={!!editingDevice}
        onOpenChange={() => setEditingDevice(null)}
        device={editingDevice}
      />
    </>
  );
}
