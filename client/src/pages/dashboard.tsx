import { useEffect } from "react";
import Sidebar from "@/components/layout/sidebar";
import MetricsOverview from "@/components/dashboard/metrics-overview";
import BandwidthChart from "@/components/dashboard/bandwidth-chart";
import DeviceStatusChart from "@/components/dashboard/device-status-chart";
import DeviceTable from "@/components/dashboard/device-table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Download, Circle } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

export default function Dashboard() {
  const queryClient = useQueryClient();

  // Initialize mock data on first load
  const initMockData = useMutation({
    mutationFn: () => apiRequest("POST", "/api/generate-mock-data"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/bandwidth-metrics"] });
      queryClient.invalidateQueries({ queryKey: ["/api/system-metrics/history"] });
    },
  });

  useEffect(() => {
    // Generate initial mock data
    initMockData.mutate();
  }, []);

  const handleExport = () => {
    // Implementation for exporting data
    console.log("Exporting network data...");
  };

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-background">
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white dark:bg-card shadow-sm border-b border-slate-200 dark:border-border px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-slate-800 dark:text-foreground">Netzwerk Dashboard</h2>
              <p className="text-sm text-slate-600 dark:text-muted-foreground mt-1">
                Echtzeit-Überwachung Ihrer Netzwerkinfrastruktur
              </p>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Search Bar */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
                <Input
                  type="text"
                  placeholder="Geräte suchen..."
                  className="pl-10 w-64"
                />
              </div>
              
              <Button onClick={handleExport} className="flex items-center space-x-2">
                <Download className="h-4 w-4" />
                <span>Export</span>
              </Button>
              
              <div className="flex items-center space-x-2 text-sm">
                <Circle className="h-2 w-2 bg-success rounded-full animate-pulse-dot fill-current text-success" />
                <span className="text-slate-600 dark:text-muted-foreground">Live</span>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-auto p-6">
          <MetricsOverview />
          
          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <BandwidthChart />
            <DeviceStatusChart />
          </div>
          
          <DeviceTable />
        </main>
      </div>
    </div>
  );
}
