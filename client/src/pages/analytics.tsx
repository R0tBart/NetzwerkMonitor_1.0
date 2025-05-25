// src/pages/analytics.tsx

import { useState } from "react";
import Sidebar from "@/components/layout/sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuery } from "@tanstack/react-query";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

export default function Analytics() {
  const [timeRange, setTimeRange] = useState("24h");

  type BandwidthDataPoint = {
    timestamp: string;
    value: number;
  };

  type AnalyticsData = {
    bandwidth: BandwidthDataPoint[];
    // ggf. weitere Felder
  };

  const { data: analyticsData } = useQuery<AnalyticsData>({
    queryKey: ["/api/analytics", timeRange],
    // API-Aufruf hier
  });

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white dark:bg-card shadow-sm border-b border-slate-200 dark:border-border px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-slate-800 dark:text-foreground">
                Netzwerk-Analytik
              </h2>
              <p className="text-sm text-slate-600 dark:text-muted-foreground mt-1">
                Detaillierte Netzwerk-Performance-Analyse
              </p>
            </div>
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="24h">Letzte 24 Stunden</SelectItem>
                <SelectItem value="7d">Letzte 7 Tage</SelectItem>
                <SelectItem value="30d">Letzter Monat</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </header>

        <main className="flex-1 overflow-auto p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Bandbreitennutzung</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={analyticsData?.bandwidth || []}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="timestamp" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="value" stroke="#2563eb" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Weitere Analytics-Karten hier */}
          </div>
        </main>
      </div>
    </div>
  );
}