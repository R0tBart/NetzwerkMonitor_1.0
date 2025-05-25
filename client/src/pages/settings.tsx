// src/pages/settings.tsx

import Sidebar from "@/components/layout/sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";

const settingsSchema = z.object({
  emailNotifications: z.boolean(),
  slackWebhook: z.string().url().optional(),
  retentionDays: z.number().min(1).max(365),
  scanInterval: z.number().min(1).max(60),
  autoBlock: z.boolean()
});

export default function Settings() {
  const { toast } = useToast();
  const form = useForm({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      emailNotifications: true,
      slackWebhook: "",
      retentionDays: 30,
      scanInterval: 5,
      autoBlock: true
    }
  });

  const onSubmit = async (data: any) => {
    try {
      // API-Aufruf hier
      toast({
        title: "Einstellungen gespeichert",
        description: "Die Änderungen wurden erfolgreich übernommen."
      });
    } catch (error) {
      toast({
        title: "Fehler",
        description: "Die Einstellungen konnten nicht gespeichert werden.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white dark:bg-card shadow-sm border-b border-slate-200 dark:border-border px-6 py-4">
          <h1 className="text-2xl font-bold">Einstellungen</h1>
        </header>

        <main className="flex-1 overflow-auto p-6">
          <Card>
            <CardHeader>
              <CardTitle>Systemeinstellungen</CardTitle>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="emailNotifications"
                    render={({ field }) => (
                      <FormItem className="flex items-center justify-between">
                        <FormLabel>E-Mail-Benachrichtigungen</FormLabel>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="slackWebhook"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Slack Webhook URL</FormLabel>
                        <Input {...field} placeholder="https://hooks.slack.com/..." />
                      </FormItem>
                    )}
                  />

                  <Button type="submit">Einstellungen speichern</Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
}