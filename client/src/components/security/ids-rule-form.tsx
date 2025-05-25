// src/components/security/ids-rule-form.tsx

import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormField, FormItem, FormLabel, FormControl } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectItem } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";

const idsRuleSchema = z.object({
  name: z.string().min(1, "Name ist erforderlich"),
  description: z.string().min(1, "Beschreibung ist erforderlich"),
  pattern: z.string().min(1, "Pattern ist erforderlich"),
  severity: z.enum(["low", "medium", "high", "critical"]),
  enabled: z.boolean().default(true),
  actions: z.string(),
  notifyEmail: z.boolean().default(false),
  notifySlack: z.boolean().default(false),
  threshold: z.number().min(0).default(0)
});

type FormData = z.infer<typeof idsRuleSchema>;

interface IdsRuleFormProps {
  onSubmit: (data: FormData) => void;
  defaultValues?: Partial<FormData>;
}

export function IdsRuleForm({ onSubmit, defaultValues }: IdsRuleFormProps) {
  const form = useForm<FormData>({
    resolver: zodResolver(idsRuleSchema),
    defaultValues: {
      name: "",
      description: "",
      pattern: "",
      severity: "medium",
      enabled: true,
      actions: "",
      notifyEmail: false,
      notifySlack: false,
      threshold: 0,
      ...defaultValues
    }
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {/* Existing form fields from ids-rules-management.tsx */}
        
        {/* New fields */}
        <FormField
          control={form.control}
          name="actions"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Aktionen</FormLabel>
              <Select
                value={field.value}
                onValueChange={field.onChange}
              >
                <SelectItem value="block">IP blockieren</SelectItem>
                <SelectItem value="log">Loggen</SelectItem>
                <SelectItem value="alert">Alert senden</SelectItem>
              </Select>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="notifyEmail"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email Benachrichtigung</FormLabel>
              <Switch 
                checked={field.value}
                onCheckedChange={field.onChange}
              />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="threshold"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Schwellenwert</FormLabel>
              <Input 
                type="number"
                {...field}
                min={0}
              />
            </FormItem>
          )}
        />
      </form>
    </Form>
  );
}