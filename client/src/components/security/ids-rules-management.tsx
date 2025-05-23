import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Shield, Edit, Trash2, AlertTriangle, CheckCircle, XCircle } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { formatRelativeTime } from "@/lib/utils";
import type { IdsRule, InsertIdsRule } from "@shared/schema";

const idsRuleSchema = z.object({
  name: z.string().min(1, "Name ist erforderlich"),
  description: z.string().min(1, "Beschreibung ist erforderlich"),
  pattern: z.string().min(1, "Pattern ist erforderlich"),
  severity: z.enum(["low", "medium", "high", "critical"], {
    required_error: "Schweregrad ist erforderlich",
  }),
  enabled: z.boolean().default(true),
});

type FormData = z.infer<typeof idsRuleSchema>;

const severityColors = {
  low: "bg-blue-500",
  medium: "bg-yellow-500", 
  high: "bg-orange-500",
  critical: "bg-red-500",
};

const severityLabels = {
  low: "Niedrig",
  medium: "Mittel",
  high: "Hoch", 
  critical: "Kritisch",
};

export default function IdsRulesManagement() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingRule, setEditingRule] = useState<IdsRule | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Query
  const { data: rules = [], isLoading } = useQuery<IdsRule[]>({
    queryKey: ["/api/ids-rules"],
  });

  // Form
  const form = useForm<FormData>({
    resolver: zodResolver(idsRuleSchema),
    defaultValues: {
      name: "",
      description: "",
      pattern: "",
      severity: "medium",
      enabled: true,
    },
  });

  // Mutations
  const createMutation = useMutation({
    mutationFn: (data: InsertIdsRule) => apiRequest("POST", "/api/ids-rules", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/ids-rules"] });
      setDialogOpen(false);
      form.reset();
      setEditingRule(null);
      toast({ title: "IDS-Regel erstellt", description: "Die neue Regel wurde erfolgreich hinzugefügt." });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<InsertIdsRule> }) =>
      apiRequest("PUT", `/api/ids-rules/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/ids-rules"] });
      setDialogOpen(false);
      form.reset();
      setEditingRule(null);
      toast({ title: "IDS-Regel aktualisiert", description: "Die Regel wurde erfolgreich aktualisiert." });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => apiRequest("DELETE", `/api/ids-rules/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/ids-rules"] });
      toast({ title: "IDS-Regel gelöscht", description: "Die Regel wurde erfolgreich gelöscht." });
    },
  });

  const toggleRuleMutation = useMutation({
    mutationFn: ({ id, enabled }: { id: number; enabled: boolean }) =>
      apiRequest("PUT", `/api/ids-rules/${id}`, { enabled }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/ids-rules"] });
      toast({ 
        title: "IDS-Regel aktualisiert", 
        description: "Der Status der Regel wurde geändert." 
      });
    },
  });

  const onSubmit = (data: FormData) => {
    if (editingRule) {
      updateMutation.mutate({ id: editingRule.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleEdit = (rule: IdsRule) => {
    setEditingRule(rule);
    form.reset({
      name: rule.name,
      description: rule.description,
      pattern: rule.pattern,
      severity: rule.severity as "low" | "medium" | "high" | "critical",
      enabled: rule.enabled,
    });
    setDialogOpen(true);
  };

  const handleToggleRule = (rule: IdsRule) => {
    toggleRuleMutation.mutate({ id: rule.id, enabled: !rule.enabled });
  };

  const enabledRules = rules.filter((rule: IdsRule) => rule.enabled);
  const disabledRules = rules.filter((rule: IdsRule) => !rule.enabled);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              IDS-Regeln Verwaltung
            </CardTitle>
            <CardDescription>
              Verwalten Sie Intrusion Detection System Regeln
            </CardDescription>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex gap-4 text-sm">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>{enabledRules.length} Aktiv</span>
              </div>
              <div className="flex items-center gap-2">
                <XCircle className="h-4 w-4 text-gray-500" />
                <span>{disabledRules.length} Deaktiviert</span>
              </div>
            </div>
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Neue Regel
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>
                    {editingRule ? "IDS-Regel bearbeiten" : "Neue IDS-Regel erstellen"}
                  </DialogTitle>
                  <DialogDescription>
                    Definieren Sie eine neue Regel für die Erkennung von Sicherheitsbedrohungen
                  </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Regel-Name *</FormLabel>
                            <FormControl>
                              <Input placeholder="z.B. SSH Brute Force Detection" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="severity"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Schweregrad *</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Schweregrad wählen" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="low">Niedrig</SelectItem>
                                <SelectItem value="medium">Mittel</SelectItem>
                                <SelectItem value="high">Hoch</SelectItem>
                                <SelectItem value="critical">Kritisch</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Beschreibung *</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Beschreibung der Regel und was sie erkennt..." 
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="pattern"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Erkennungsmuster *</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Regex-Pattern oder Signatur für die Erkennung..."
                              className="font-mono"
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="enabled"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">Regel aktivieren</FormLabel>
                            <div className="text-[0.8rem] text-muted-foreground">
                              Aktiviert die Regel für die Erkennung von Bedrohungen
                            </div>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    <DialogFooter>
                      <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                        {editingRule ? "Aktualisieren" : "Erstellen"}
                      </Button>
                    </DialogFooter>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div>Lädt IDS-Regeln...</div>
        ) : rules.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Shield className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Keine IDS-Regeln konfiguriert</p>
            <p className="text-sm">Erstellen Sie Ihre erste Regel für die Bedrohungserkennung</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Regel</TableHead>
                <TableHead>Schweregrad</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Erstellt</TableHead>
                <TableHead>Aktionen</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rules.map((rule: IdsRule) => (
                <TableRow key={rule.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{rule.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {rule.description}
                      </div>
                      <div className="text-xs font-mono mt-1 p-2 bg-muted rounded">
                        {rule.pattern}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge 
                      className={`${severityColors[rule.severity as keyof typeof severityColors]} text-white`}
                    >
                      {severityLabels[rule.severity as keyof typeof severityLabels]}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {rule.enabled ? (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      ) : (
                        <XCircle className="h-4 w-4 text-gray-500" />
                      )}
                      <span className="text-sm">
                        {rule.enabled ? "Aktiv" : "Deaktiviert"}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {formatRelativeTime(rule.createdAt)}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleToggleRule(rule)}
                        disabled={toggleRuleMutation.isPending}
                      >
                        {rule.enabled ? "Deaktivieren" : "Aktivieren"}
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleEdit(rule)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => deleteMutation.mutate(rule.id)}
                        className="text-destructive hover:text-destructive"
                        disabled={deleteMutation.isPending}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}