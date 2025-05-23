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
import { Separator } from "@/components/ui/separator";
import { Plus, Shield, Key, Edit, Trash2, Eye, EyeOff, Copy, Star, ExternalLink, Lock } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { PasswordVault, PasswordEntry, InsertPasswordVault, InsertPasswordEntry } from "@shared/schema";

const passwordEntrySchema = z.object({
  vaultId: z.number(),
  title: z.string().min(1, "Titel ist erforderlich"),
  username: z.string().optional(),
  email: z.string().email("Ungültige E-Mail-Adresse").optional().or(z.literal("")),
  encryptedPassword: z.string().min(1, "Passwort ist erforderlich"),
  website: z.string().url("Ungültige URL").optional().or(z.literal("")),
  notes: z.string().optional(),
  category: z.string().optional(),
  isFavorite: z.boolean().default(false),
});

const vaultSchema = z.object({
  name: z.string().min(1, "Name ist erforderlich"),
  description: z.string().optional(),
});

type FormData = z.infer<typeof passwordEntrySchema>;
type VaultFormData = z.infer<typeof vaultSchema>;

export default function Passwords() {
  const [selectedVault, setSelectedVault] = useState<number | null>(null);
  const [showPassword, setShowPassword] = useState<{ [key: number]: boolean }>({});
  const [entryDialogOpen, setEntryDialogOpen] = useState(false);
  const [vaultDialogOpen, setVaultDialogOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<PasswordEntry | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Queries
  const { data: vaults = [], isLoading: vaultsLoading } = useQuery({
    queryKey: ["/api/password-vaults"],
  });

  const { data: entries = [], isLoading: entriesLoading } = useQuery({
    queryKey: ["/api/password-entries", selectedVault],
    enabled: !!selectedVault,
  });

  // Forms
  const entryForm = useForm<FormData>({
    resolver: zodResolver(passwordEntrySchema),
    defaultValues: {
      vaultId: selectedVault || 1,
      title: "",
      username: "",
      email: "",
      encryptedPassword: "",
      website: "",
      notes: "",
      category: "",
      isFavorite: false,
    },
  });

  const vaultForm = useForm<VaultFormData>({
    resolver: zodResolver(vaultSchema),
    defaultValues: {
      name: "",
      description: "",
    },
  });

  // Mutations
  const createVaultMutation = useMutation({
    mutationFn: (data: InsertPasswordVault) => apiRequest("POST", "/api/password-vaults", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/password-vaults"] });
      setVaultDialogOpen(false);
      vaultForm.reset();
      toast({ title: "Tresor erstellt", description: "Der Passwort-Tresor wurde erfolgreich erstellt." });
    },
  });

  const createEntryMutation = useMutation({
    mutationFn: (data: InsertPasswordEntry) => apiRequest("POST", "/api/password-entries", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/password-entries"] });
      setEntryDialogOpen(false);
      entryForm.reset();
      setEditingEntry(null);
      toast({ title: "Passwort gespeichert", description: "Das Passwort wurde erfolgreich hinzugefügt." });
    },
  });

  const updateEntryMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<InsertPasswordEntry> }) =>
      apiRequest("PUT", `/api/password-entries/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/password-entries"] });
      setEntryDialogOpen(false);
      entryForm.reset();
      setEditingEntry(null);
      toast({ title: "Passwort aktualisiert", description: "Das Passwort wurde erfolgreich aktualisiert." });
    },
  });

  const deleteEntryMutation = useMutation({
    mutationFn: (id: number) => apiRequest("DELETE", `/api/password-entries/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/password-entries"] });
      toast({ title: "Passwort gelöscht", description: "Das Passwort wurde erfolgreich gelöscht." });
    },
  });

  const onSubmitEntry = (data: FormData) => {
    if (editingEntry) {
      updateEntryMutation.mutate({ id: editingEntry.id, data });
    } else {
      createEntryMutation.mutate(data);
    }
  };

  const onSubmitVault = (data: VaultFormData) => {
    createVaultMutation.mutate(data);
  };

  const togglePasswordVisibility = (entryId: number) => {
    setShowPassword(prev => ({ ...prev, [entryId]: !prev[entryId] }));
  };

  const copyToClipboard = async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({ title: "Kopiert", description: `${type} wurde in die Zwischenablage kopiert.` });
    } catch (error) {
      toast({ 
        title: "Fehler", 
        description: "Konnte nicht in die Zwischenablage kopieren.", 
        variant: "destructive" 
      });
    }
  };

  const handleEditEntry = (entry: PasswordEntry) => {
    setEditingEntry(entry);
    entryForm.reset({
      vaultId: entry.vaultId,
      title: entry.title,
      username: entry.username || "",
      email: entry.email || "",
      encryptedPassword: entry.encryptedPassword,
      website: entry.website || "",
      notes: entry.notes || "",
      category: entry.category || "",
      isFavorite: entry.isFavorite,
    });
    setEntryDialogOpen(true);
  };

  // Set default vault when vaults load
  if (vaults.length > 0 && !selectedVault) {
    setSelectedVault(vaults[0].id);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Passwort-Manager</h1>
          <p className="text-muted-foreground">
            Sichere Verwaltung Ihrer Netzwerk-Zugangsdaten und Passwörter
          </p>
        </div>
        <div className="flex gap-2">
          <Dialog open={vaultDialogOpen} onOpenChange={setVaultDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Shield className="h-4 w-4 mr-2" />
                Neuer Tresor
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Neuen Passwort-Tresor erstellen</DialogTitle>
                <DialogDescription>
                  Erstellen Sie einen neuen Tresor für Ihre Passwörter
                </DialogDescription>
              </DialogHeader>
              <Form {...vaultForm}>
                <form onSubmit={vaultForm.handleSubmit(onSubmitVault)} className="space-y-4">
                  <FormField
                    control={vaultForm.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Name</FormLabel>
                        <FormControl>
                          <Input placeholder="z.B. Netzwerk-Tresor" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={vaultForm.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Beschreibung</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Kurze Beschreibung des Tresors..." 
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <DialogFooter>
                    <Button type="submit" disabled={createVaultMutation.isPending}>
                      Tresor erstellen
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>

          <Dialog open={entryDialogOpen} onOpenChange={setEntryDialogOpen}>
            <DialogTrigger asChild>
              <Button disabled={!selectedVault}>
                <Plus className="h-4 w-4 mr-2" />
                Neues Passwort
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>
                  {editingEntry ? "Passwort bearbeiten" : "Neues Passwort hinzufügen"}
                </DialogTitle>
                <DialogDescription>
                  Fügen Sie ein neues Passwort zu Ihrem Tresor hinzu
                </DialogDescription>
              </DialogHeader>
              <Form {...entryForm}>
                <form onSubmit={entryForm.handleSubmit(onSubmitEntry)} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={entryForm.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Titel *</FormLabel>
                          <FormControl>
                            <Input placeholder="z.B. Router Admin" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={entryForm.control}
                      name="category"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Kategorie</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Kategorie wählen" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="Network Equipment">Netzwerk-Geräte</SelectItem>
                              <SelectItem value="Security">Sicherheit</SelectItem>
                              <SelectItem value="Server">Server</SelectItem>
                              <SelectItem value="Database">Datenbank</SelectItem>
                              <SelectItem value="Other">Sonstiges</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={entryForm.control}
                      name="username"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Benutzername</FormLabel>
                          <FormControl>
                            <Input placeholder="admin" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={entryForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>E-Mail</FormLabel>
                          <FormControl>
                            <Input placeholder="admin@example.com" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={entryForm.control}
                    name="encryptedPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Passwort *</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder="Sicheres Passwort" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={entryForm.control}
                    name="website"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Website/URL</FormLabel>
                        <FormControl>
                          <Input placeholder="https://192.168.1.1" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={entryForm.control}
                    name="notes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Notizen</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Zusätzliche Informationen..." 
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={entryForm.control}
                    name="isFavorite"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">Favorit</FormLabel>
                          <div className="text-[0.8rem] text-muted-foreground">
                            Als Favorit markieren für schnellen Zugriff
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
                    <Button type="submit" disabled={createEntryMutation.isPending || updateEntryMutation.isPending}>
                      {editingEntry ? "Aktualisieren" : "Hinzufügen"}
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Vault Selector */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Tresore
            </CardTitle>
            <CardDescription>
              Wählen Sie einen Tresor aus
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {vaultsLoading ? (
              <div>Lädt...</div>
            ) : (
              vaults.map((vault: PasswordVault) => (
                <Card 
                  key={vault.id} 
                  className={`cursor-pointer transition-colors ${
                    selectedVault === vault.id 
                      ? "border-primary bg-primary/5" 
                      : "hover:bg-muted/50"
                  }`}
                  onClick={() => setSelectedVault(vault.id)}
                >
                  <CardContent className="p-3">
                    <div className="font-medium">{vault.name}</div>
                    {vault.description && (
                      <div className="text-sm text-muted-foreground mt-1">
                        {vault.description}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))
            )}
          </CardContent>
        </Card>

        {/* Password Entries */}
        <div className="lg:col-span-3">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Key className="h-4 w-4" />
                Passwörter
                {selectedVault && (
                  <Badge variant="secondary">
                    {entries.filter((e: PasswordEntry) => e.isFavorite).length} Favoriten
                  </Badge>
                )}
              </CardTitle>
              <CardDescription>
                Ihre gespeicherten Zugangsdaten
              </CardDescription>
            </CardHeader>
            <CardContent>
              {entriesLoading ? (
                <div>Lädt Passwörter...</div>
              ) : entries.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Lock className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Keine Passwörter in diesem Tresor</p>
                  <p className="text-sm">Fügen Sie Ihr erstes Passwort hinzu</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {entries.map((entry: PasswordEntry) => (
                    <Card key={entry.id} className="border">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="font-medium">{entry.title}</h3>
                              {entry.isFavorite && (
                                <Star className="h-4 w-4 text-yellow-500 fill-current" />
                              )}
                              {entry.category && (
                                <Badge variant="outline" className="text-xs">
                                  {entry.category}
                                </Badge>
                              )}
                            </div>

                            <div className="grid grid-cols-2 gap-4 text-sm">
                              {entry.username && (
                                <div>
                                  <span className="text-muted-foreground">Benutzername:</span>
                                  <div className="flex items-center gap-2">
                                    <span className="font-mono">{entry.username}</span>
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      className="h-6 w-6 p-0"
                                      onClick={() => copyToClipboard(entry.username!, "Benutzername")}
                                    >
                                      <Copy className="h-3 w-3" />
                                    </Button>
                                  </div>
                                </div>
                              )}

                              {entry.email && (
                                <div>
                                  <span className="text-muted-foreground">E-Mail:</span>
                                  <div className="flex items-center gap-2">
                                    <span className="font-mono">{entry.email}</span>
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      className="h-6 w-6 p-0"
                                      onClick={() => copyToClipboard(entry.email!, "E-Mail")}
                                    >
                                      <Copy className="h-3 w-3" />
                                    </Button>
                                  </div>
                                </div>
                              )}

                              <div>
                                <span className="text-muted-foreground">Passwort:</span>
                                <div className="flex items-center gap-2">
                                  <span className="font-mono">
                                    {showPassword[entry.id] 
                                      ? entry.encryptedPassword 
                                      : "••••••••••••"
                                    }
                                  </span>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    className="h-6 w-6 p-0"
                                    onClick={() => togglePasswordVisibility(entry.id)}
                                  >
                                    {showPassword[entry.id] ? (
                                      <EyeOff className="h-3 w-3" />
                                    ) : (
                                      <Eye className="h-3 w-3" />
                                    )}
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    className="h-6 w-6 p-0"
                                    onClick={() => copyToClipboard(entry.encryptedPassword, "Passwort")}
                                  >
                                    <Copy className="h-3 w-3" />
                                  </Button>
                                </div>
                              </div>

                              {entry.website && (
                                <div>
                                  <span className="text-muted-foreground">Website:</span>
                                  <div className="flex items-center gap-2">
                                    <a 
                                      href={entry.website} 
                                      target="_blank" 
                                      rel="noopener noreferrer"
                                      className="text-blue-600 hover:underline font-mono text-sm"
                                    >
                                      {entry.website}
                                    </a>
                                    <ExternalLink className="h-3 w-3 text-muted-foreground" />
                                  </div>
                                </div>
                              )}
                            </div>

                            {entry.notes && (
                              <div className="mt-3 pt-3 border-t">
                                <span className="text-muted-foreground text-sm">Notizen:</span>
                                <p className="text-sm mt-1">{entry.notes}</p>
                              </div>
                            )}
                          </div>

                          <div className="flex gap-2 ml-4">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleEditEntry(entry)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => deleteEntryMutation.mutate(entry.id)}
                              className="text-destructive hover:text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}