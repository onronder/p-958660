
import { useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { BellRing, Clock, MoonStar } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { useSettings } from "@/hooks/useSettings";

const preferencesFormSchema = z.object({
  dark_mode: z.boolean().default(false),
  notifications_enabled: z.boolean().default(true),
  auto_logout_minutes: z.number().min(5).max(240),
});

type PreferencesFormValues = z.infer<typeof preferencesFormSchema>;

const autoLogoutOptions = [
  { value: 15, label: "15 minutes" },
  { value: 30, label: "30 minutes" },
  { value: 60, label: "1 hour" },
  { value: 120, label: "2 hours" },
  { value: 240, label: "4 hours" },
];

const PreferencesSettings = () => {
  const { profile, isLoading, fetchProfile, updatePreferences } = useSettings();

  const form = useForm<PreferencesFormValues>({
    resolver: zodResolver(preferencesFormSchema),
    defaultValues: {
      dark_mode: false,
      notifications_enabled: true,
      auto_logout_minutes: 60,
    },
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  useEffect(() => {
    if (profile) {
      form.reset({
        dark_mode: profile.dark_mode || false,
        notifications_enabled: profile.notifications_enabled || true,
        auto_logout_minutes: profile.auto_logout_minutes || 60,
      });
    }
  }, [profile, form]);

  const onSubmit = async (data: PreferencesFormValues) => {
    await updatePreferences(data);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-[100px] w-full rounded-md" />
        <Skeleton className="h-[100px] w-full rounded-md" />
        <Skeleton className="h-[100px] w-full rounded-md" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MoonStar className="h-5 w-5" /> Appearance
              </CardTitle>
              <CardDescription>
                Customize the appearance of the application
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FormField
                control={form.control}
                name="dark_mode"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Dark Mode</FormLabel>
                      <FormDescription>
                        Switch between light and dark themes
                      </FormDescription>
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
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BellRing className="h-5 w-5" /> Notifications
              </CardTitle>
              <CardDescription>
                Configure notification preferences
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FormField
                control={form.control}
                name="notifications_enabled"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Enable Notifications</FormLabel>
                      <FormDescription>
                        Receive notifications for job completions, failures, and system updates
                      </FormDescription>
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
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" /> Session
              </CardTitle>
              <CardDescription>
                Configure your session preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="auto_logout_minutes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Auto Logout</FormLabel>
                    <Select
                      onValueChange={(value) => field.onChange(parseInt(value, 10))}
                      value={field.value.toString()}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select auto logout time" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {autoLogoutOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value.toString()}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Automatically log out after a period of inactivity
                    </FormDescription>
                    <Slider
                      value={[field.value]}
                      min={15}
                      max={240}
                      step={15}
                      className="mt-2"
                      onValueChange={(vals) => field.onChange(vals[0])}
                    />
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <Button type="submit" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? "Saving..." : "Save Preferences"}
          </Button>
        </form>
      </Form>
    </div>
  );
};

export default PreferencesSettings;
