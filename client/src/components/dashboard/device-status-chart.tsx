import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import type { Device } from "@shared/schema";

ChartJS.register(ArcElement, Tooltip, Legend);

export default function DeviceStatusChart() {
  const { data: devices, isLoading } = useQuery<Device[]>({
    queryKey: ["/api/devices"],
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  if (isLoading) {
    return (
      <Card className="bg-white dark:bg-card shadow-sm border border-slate-200 dark:border-border">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold text-slate-800 dark:text-foreground">
              Gerätestatus
            </CardTitle>
            <div className="h-8 w-24 bg-slate-200 dark:bg-slate-700 rounded animate-pulse"></div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-64 bg-slate-100 dark:bg-slate-800 rounded animate-pulse"></div>
        </CardContent>
      </Card>
    );
  }

  const statusCounts = devices?.reduce((acc, device) => {
    acc[device.status] = (acc[device.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>) || {};

  const statusLabels = {
    online: 'Online',
    warning: 'Warnung',
    offline: 'Offline',
    maintenance: 'Wartung'
  };

  const statusColors = {
    online: '#10b981',
    warning: '#f59e0b',
    offline: '#ef4444',
    maintenance: '#64748b'
  };

  const chartData = {
    labels: Object.keys(statusCounts).map(status => statusLabels[status as keyof typeof statusLabels] || status),
    datasets: [{
      data: Object.values(statusCounts),
      backgroundColor: Object.keys(statusCounts).map(status => statusColors[status as keyof typeof statusColors] || '#64748b'),
      borderWidth: 0,
    }]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          padding: 20,
          usePointStyle: true,
        }
      }
    }
  };

  return (
    <Card className="bg-white dark:bg-card shadow-sm border border-slate-200 dark:border-border">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-slate-800 dark:text-foreground">
            Gerätestatus
          </CardTitle>
          <Button variant="link" className="text-sm text-primary hover:text-blue-700 font-medium p-0">
            Details anzeigen
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <Doughnut data={chartData} options={options} />
        </div>
      </CardContent>
    </Card>
  );
}
