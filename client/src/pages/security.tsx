import { useState } from "react";
import Sidebar from "@/components/layout/sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { 
  Shield, 
  AlertTriangle, 
  Search, 
  Filter,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  Plus,
  Settings,
  Activity
} from "lucide-react";
import type { SecurityEvent, IdsRule } from "@shared/schema";

const severityColors = {
  low: "bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200",
  medium: "bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200",
  high: "bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200",
  critical: "bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200",
};

const statusColors = {
  new: "bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200",
  investigating: "bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200",
  resolved: "bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200",
  false_positive: "bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200",
};

const eventTypeIcons = {
  intrusion_attempt: AlertTriangle,
  malware_detected: Shield,
  unusual_traffic: Activity,
  port_scan: Search,
  brute_force: XCircle,
};

export default function Security() {
  const [statusFilter, setStatusFilter] = useState("all");
  const [severityFilter, setSeverityFilter] = useState("all");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: securityEvents, isLoading: eventsLoading } = useQuery<SecurityEvent[]>({
    queryKey: ["/api/security-events"],
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  const { data: idsRules, isLoading: rulesLoading } = useQuery<IdsRule[]>({
    queryKey: ["/api/ids-rules"],
  });

  const updateEventStatus = useMutation({
    mutationFn: ({ id, status }: { id: number; status: string }) =>
      apiRequest("PUT", `/api/security-events/${id}`, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/security-events"] });
      toast({ title: "Status erfolgreich aktualisiert" });
    },
    onError: () => {
      toast({ title: "Fehler beim Aktualisieren des Status", variant: "destructive" });
    },
  });

  const toggleRule = useMutation({
    mutationFn: ({ id, enabled }: { id: number; enabled: boolean }) =>
      apiRequest("PUT", `/api/ids-rules/${id}`, { enabled }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/ids-rules"] });
      toast({ title: "Regel erfolgreich aktualisiert" });
    },
    onError: () => {
      toast({ title: "Fehler beim Aktualisieren der Regel", variant: "destructive" });
    },
  });

  const filteredEvents = securityEvents?.filter(event => {
    if (statusFilter !== "all" && event.status !== statusFilter) return false;
    if (severityFilter !== "all" && event.severity !== severityFilter) return false;
    return true;
  }) || [];

  const eventCounts = securityEvents?.reduce((acc, event) => {
    acc[event.status] = (acc[event.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>) || {};

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-background">
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white dark:bg-card shadow-sm border-b border-slate-200 dark:border-border px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-slate-800 dark:text-foreground">Sicherheits-Dashboard</h2>
              <p className="text-sm text-slate-600 dark:text-muted-foreground mt-1">
                Intrusion Detection System - Bedrohungen überwachen und verwalten
              </p>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-sm">
                <Shield className="h-2 w-2 bg-success rounded-full animate-pulse-dot fill-current text-success" />
                <span className="text-slate-600 dark:text-muted-foreground">IDS Aktiv</span>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-auto p-6">
          {/* Status Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card className="bg-white dark:bg-card shadow-sm border border-slate-200 dark:border-border">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-600 dark:text-muted-foreground">Neue Ereignisse</p>
                    <p className="text-3xl font-bold text-slate-800 dark:text-foreground mt-2">
                      {eventCounts.new || 0}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                    <AlertTriangle className="text-blue-600 dark:text-blue-400 h-6 w-6" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white dark:bg-card shadow-sm border border-slate-200 dark:border-border">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-600 dark:text-muted-foreground">In Bearbeitung</p>
                    <p className="text-3xl font-bold text-slate-800 dark:text-foreground mt-2">
                      {eventCounts.investigating || 0}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900 rounded-lg flex items-center justify-center">
                    <Clock className="text-yellow-600 dark:text-yellow-400 h-6 w-6" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white dark:bg-card shadow-sm border border-slate-200 dark:border-border">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-600 dark:text-muted-foreground">Gelöst</p>
                    <p className="text-3xl font-bold text-slate-800 dark:text-foreground mt-2">
                      {eventCounts.resolved || 0}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
                    <CheckCircle className="text-green-600 dark:text-green-400 h-6 w-6" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white dark:bg-card shadow-sm border border-slate-200 dark:border-border">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-600 dark:text-muted-foreground">Aktive Regeln</p>
                    <p className="text-3xl font-bold text-slate-800 dark:text-foreground mt-2">
                      {idsRules?.filter(rule => rule.enabled).length || 0}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center">
                    <Settings className="text-purple-600 dark:text-purple-400 h-6 w-6" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="events" className="space-y-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="events">Sicherheitsereignisse</TabsTrigger>
              <TabsTrigger value="rules">IDS Regeln</TabsTrigger>
            </TabsList>

            <TabsContent value="events">
              <Card className="bg-white dark:bg-card shadow-sm border border-slate-200 dark:border-border">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg font-semibold text-slate-800 dark:text-foreground">
                      Sicherheitsereignisse
                    </CardTitle>
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center space-x-2">
                        <label className="text-sm text-slate-600 dark:text-muted-foreground">Status:</label>
                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                          <SelectTrigger className="w-40">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">Alle</SelectItem>
                            <SelectItem value="new">Neu</SelectItem>
                            <SelectItem value="investigating">In Bearbeitung</SelectItem>
                            <SelectItem value="resolved">Gelöst</SelectItem>
                            <SelectItem value="false_positive">Fehlalarm</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex items-center space-x-2">
                        <label className="text-sm text-slate-600 dark:text-muted-foreground">Schweregrad:</label>
                        <Select value={severityFilter} onValueChange={setSeverityFilter}>
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">Alle</SelectItem>
                            <SelectItem value="low">Niedrig</SelectItem>
                            <SelectItem value="medium">Mittel</SelectItem>
                            <SelectItem value="high">Hoch</SelectItem>
                            <SelectItem value="critical">Kritisch</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="p-0">
                  {eventsLoading ? (
                    <div className="p-6">
                      <div className="space-y-4">
                        {[...Array(5)].map((_, i) => (
                          <div key={i} className="h-16 bg-slate-100 dark:bg-slate-800 rounded animate-pulse"></div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-slate-50 dark:bg-slate-800/50">
                            <TableHead className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                              Zeitstempel
                            </TableHead>
                            <TableHead className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                              Ereignistyp
                            </TableHead>
                            <TableHead className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                              Schweregrad
                            </TableHead>
                            <TableHead className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                              Quelle
                            </TableHead>
                            <TableHead className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                              Ziel
                            </TableHead>
                            <TableHead className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                              Beschreibung
                            </TableHead>
                            <TableHead className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                              Status
                            </TableHead>
                            <TableHead className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                              Aktionen
                            </TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredEvents.map((event) => {
                            const EventIcon = eventTypeIcons[event.eventType as keyof typeof eventTypeIcons] || AlertTriangle;
                            const severityClass = severityColors[event.severity as keyof typeof severityColors] || severityColors.low;
                            const statusClass = statusColors[event.status as keyof typeof statusColors] || statusColors.new;
                            
                            return (
                              <TableRow key={event.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                <TableCell className="whitespace-nowrap text-sm text-slate-600 dark:text-muted-foreground">
                                  {new Date(event.timestamp).toLocaleString('de-DE', {
                                    day: '2-digit',
                                    month: '2-digit',
                                    year: '2-digit',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  })}
                                </TableCell>
                                <TableCell className="whitespace-nowrap">
                                  <div className="flex items-center">
                                    <EventIcon className="h-4 w-4 text-slate-400 mr-2" />
                                    <span className="text-sm text-slate-800 dark:text-foreground">
                                      {event.eventType.replace('_', ' ')}
                                    </span>
                                  </div>
                                </TableCell>
                                <TableCell className="whitespace-nowrap">
                                  <Badge variant="secondary" className={severityClass}>
                                    {event.severity === 'low' ? 'Niedrig' :
                                     event.severity === 'medium' ? 'Mittel' :
                                     event.severity === 'high' ? 'Hoch' : 'Kritisch'}
                                  </Badge>
                                </TableCell>
                                <TableCell className="whitespace-nowrap text-sm text-slate-600 dark:text-muted-foreground">
                                  {event.sourceIp}
                                </TableCell>
                                <TableCell className="whitespace-nowrap text-sm text-slate-600 dark:text-muted-foreground">
                                  {event.targetIp || '-'}
                                </TableCell>
                                <TableCell className="max-w-xs truncate text-sm text-slate-600 dark:text-muted-foreground">
                                  {event.description}
                                </TableCell>
                                <TableCell className="whitespace-nowrap">
                                  <Select
                                    value={event.status}
                                    onValueChange={(value) => updateEventStatus.mutate({ id: event.id, status: value })}
                                  >
                                    <SelectTrigger className="w-32">
                                      <Badge variant="secondary" className={statusClass}>
                                        {event.status === 'new' ? 'Neu' :
                                         event.status === 'investigating' ? 'Bearbeitung' :
                                         event.status === 'resolved' ? 'Gelöst' : 'Fehlalarm'}
                                      </Badge>
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="new">Neu</SelectItem>
                                      <SelectItem value="investigating">In Bearbeitung</SelectItem>
                                      <SelectItem value="resolved">Gelöst</SelectItem>
                                      <SelectItem value="false_positive">Fehlalarm</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </TableCell>
                                <TableCell className="whitespace-nowrap">
                                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                    <Eye className="h-4 w-4 text-primary" />
                                  </Button>
                                </TableCell>
                              </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="rules">
              <Card className="bg-white dark:bg-card shadow-sm border border-slate-200 dark:border-border">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg font-semibold text-slate-800 dark:text-foreground">
                      IDS Regeln
                    </CardTitle>
                    <Button className="flex items-center space-x-2">
                      <Plus className="h-4 w-4" />
                      <span>Neue Regel</span>
                    </Button>
                  </div>
                </CardHeader>

                <CardContent className="p-0">
                  {rulesLoading ? (
                    <div className="p-6">
                      <div className="space-y-4">
                        {[...Array(4)].map((_, i) => (
                          <div key={i} className="h-20 bg-slate-100 dark:bg-slate-800 rounded animate-pulse"></div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-slate-50 dark:bg-slate-800/50">
                            <TableHead className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                              Name
                            </TableHead>
                            <TableHead className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                              Beschreibung
                            </TableHead>
                            <TableHead className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                              Schweregrad
                            </TableHead>
                            <TableHead className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                              Status
                            </TableHead>
                            <TableHead className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                              Letzte Änderung
                            </TableHead>
                            <TableHead className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                              Aktionen
                            </TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {idsRules?.map((rule) => {
                            const severityClass = severityColors[rule.severity as keyof typeof severityColors] || severityColors.low;
                            
                            return (
                              <TableRow key={rule.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                <TableCell className="font-medium text-slate-800 dark:text-foreground">
                                  {rule.name}
                                </TableCell>
                                <TableCell className="max-w-md text-sm text-slate-600 dark:text-muted-foreground">
                                  {rule.description}
                                </TableCell>
                                <TableCell>
                                  <Badge variant="secondary" className={severityClass}>
                                    {rule.severity === 'low' ? 'Niedrig' :
                                     rule.severity === 'medium' ? 'Mittel' :
                                     rule.severity === 'high' ? 'Hoch' : 'Kritisch'}
                                  </Badge>
                                </TableCell>
                                <TableCell>
                                  <Button
                                    variant={rule.enabled ? "default" : "outline"}
                                    size="sm"
                                    onClick={() => toggleRule.mutate({ id: rule.id, enabled: !rule.enabled })}
                                    disabled={toggleRule.isPending}
                                  >
                                    {rule.enabled ? 'Aktiv' : 'Inaktiv'}
                                  </Button>
                                </TableCell>
                                <TableCell className="text-sm text-slate-600 dark:text-muted-foreground">
                                  {new Date(rule.updatedAt).toLocaleString('de-DE', {
                                    day: '2-digit',
                                    month: '2-digit',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  })}
                                </TableCell>
                                <TableCell>
                                  <div className="flex items-center space-x-2">
                                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                      <Eye className="h-4 w-4 text-primary" />
                                    </Button>
                                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                      <Settings className="h-4 w-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300" />
                                    </Button>
                                  </div>
                                </TableCell>
                              </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  );
}