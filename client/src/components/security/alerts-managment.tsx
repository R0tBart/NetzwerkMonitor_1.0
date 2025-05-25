// src/components/security/alerts-management.tsx

import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { apiRequest } from "@/lib/queryClient";
import { formatRelativeTime } from "@/lib/utils";

interface Alert {
  id: number;
  type: string;
  message: string;
  severity: "low" | "medium" | "high" | "critical";
  timestamp: string;
  read: boolean;
}

export default function AlertsManagement() {
  const [filter, setFilter] = useState("all");

  const { data: alerts = [] } = useQuery<Alert[]>({
    queryKey: ["/api/alerts"],
    refetchInterval: 10000
  });

  const markAsRead = useMutation({
    mutationFn: (id: number) => 
      apiRequest("PUT", `/api/alerts/${id}`, { read: true })
  });

  const filteredAlerts = alerts.filter(alert => {
    if (filter === "all") { return true; }
    if (filter === "unread") { return !alert.read; }
    return alert.severity === filter;
  });

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Sicherheitsalarme</CardTitle>
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Alle Alarme</SelectItem>
              <SelectItem value="unread">Ungelesen</SelectItem>
              <SelectItem value="critical">Kritisch</SelectItem>
              <SelectItem value="high">Hoch</SelectItem>
              <SelectItem value="medium">Mittel</SelectItem>
              <SelectItem value="low">Niedrig</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Zeitpunkt</TableHead>
              <TableHead>Typ</TableHead>
              <TableHead>Nachricht</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Aktionen</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredAlerts.map(alert => (
              <TableRow key={alert.id}>
                <TableCell>{formatRelativeTime(alert.timestamp)}</TableCell>
                <TableCell>
                  <Badge
                    variant={
                      alert.severity === "critical"
                        ? "destructive"
                        : alert.severity === "high"
                        ? "default"
                        : alert.severity === "medium"
                        ? "secondary"
                        : "outline"
                    }
                  >
                    {alert.severity.toUpperCase()}
                  </Badge>
                </TableCell>
                <TableCell>{alert.message}</TableCell>
                <TableCell>
                  {alert.read ? "Gelesen" : "Neu"}
                </TableCell>
                <TableCell>
                  <Button 
                    variant="outline"
                    size="sm"
                    onClick={() => markAsRead.mutate(alert.id)}
                    disabled={alert.read}
                  >
                    Als gelesen markieren
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}