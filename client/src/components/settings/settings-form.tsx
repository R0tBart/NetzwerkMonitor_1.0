import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

const settingsSchema = z.object({
  emailNotifications: z.boolean(),
  slackWebhook: z.string().url().optional(),
  retentionDays: z.number().min(1),
  scanInterval: z.number().min(1),
  autoBlockEnabled: z.boolean(),
  alertThreshold: z.number().min(0)
});

type SettingsFormData = z.infer<typeof settingsSchema>;

export default function SettingsForm() {
  const { toast } = useToast();
  
  const form = useForm<SettingsFormData>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      emailNotifications: true,
      retentionDays: 30,
      scanInterval: 5,
      autoBlockEnabled: true,
      alertThreshold: 10
    }
  });

  const updateSettings = useMutation({
    mutationFn: (data: SettingsFormData) => 
      apiRequest("PUT", "/api/settings", data),
    onSuccess: () => {
      toast({ title: "Einstellungen gespeichert" });
    }
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Systemeinstellungen</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit((data) => updateSettings.mutate(data))} className="space-y-4">
            <FormField
              control={form.control}
              name="emailNotifications"
              render={({ field }) => (
                <FormItem className="flex items-center justify-between">
                  <FormLabel>Email Benachrichtigungen</FormLabel>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    onBlur={field.onBlur}
                    name={field.name}
                    disabled={field.disabled}
                    ref={field.ref}
                  />
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

            <FormField
              control={form.control}
              name="retentionDays"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Daten Aufbewahrung (Tage)</FormLabel>
                  <Input type="number" {...field} min={1} />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="scanInterval"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Scan-Intervall (Minuten)</FormLabel>
                  <Input type="number" {...field} min={1} />
                </FormItem>
              )}
            />

            <Button type="submit" disabled={updateSettings.isPending}>
              Speichern
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}