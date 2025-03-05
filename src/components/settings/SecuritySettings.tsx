
import { useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { format } from "date-fns";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle, CheckCircle2, Shield } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useSettings } from "@/hooks/useSettings";

const passwordFormSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string().min(8, "Confirm password is required"),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type PasswordFormValues = z.infer<typeof passwordFormSchema>;

const SecuritySettings = () => {
  const { securitySettings, isLoadingSecurity, fetchSecurity, changePassword, toggle2FA } = useSettings();
  const [passwordChangeSuccess, setPasswordChangeSuccess] = useState<boolean | null>(null);

  const form = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordFormSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  useEffect(() => {
    fetchSecurity();
  }, []);

  const onSubmit = async (data: PasswordFormValues) => {
    const success = await changePassword(data.currentPassword, data.newPassword);
    setPasswordChangeSuccess(success);
    
    if (success) {
      form.reset();
    }
  };

  const handleToggle2FA = async (enabled: boolean) => {
    await toggle2FA(enabled);
  };

  if (isLoadingSecurity) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-32 w-full rounded-md" />
        <Skeleton className="h-64 w-full rounded-md" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-xl flex items-center gap-2">
            <Shield className="h-5 w-5" /> Two-Factor Authentication
          </CardTitle>
          <CardDescription>
            Add an extra layer of security to your account by requiring a verification code in addition to your password.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="font-medium">
                {securitySettings?.two_factor_enabled ? 'Enabled' : 'Disabled'}
              </p>
              <p className="text-sm text-muted-foreground">
                {securitySettings?.two_factor_enabled
                  ? 'Your account is protected with two-factor authentication'
                  : 'Two-factor authentication is currently disabled'}
              </p>
            </div>
            <Switch
              checked={securitySettings?.two_factor_enabled || false}
              onCheckedChange={handleToggle2FA}
              aria-label="Toggle two-factor authentication"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Change Password</CardTitle>
          <CardDescription>
            Update your password to maintain security. Your last password change was{' '}
            {securitySettings?.last_password_change
              ? format(new Date(securitySettings.last_password_change), 'MMMM d, yyyy')
              : 'never'}.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {passwordChangeSuccess !== null && (
            <Alert 
              className={`mb-4 ${passwordChangeSuccess ? 'bg-green-50 text-green-700 border-green-200' : 'bg-destructive/15 text-destructive border-destructive/30'}`}
            >
              {passwordChangeSuccess ? (
                <>
                  <CheckCircle2 className="h-4 w-4" />
                  <AlertTitle>Success</AlertTitle>
                  <AlertDescription>
                    Your password has been changed successfully.
                  </AlertDescription>
                </>
              ) : (
                <>
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>
                    There was a problem changing your password. Please check your current password and try again.
                  </AlertDescription>
                </>
              )}
            </Alert>
          )}

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="currentPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Current Password</FormLabel>
                    <FormControl>
                      <Input type="password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="newPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>New Password</FormLabel>
                    <FormControl>
                      <Input type="password" {...field} />
                    </FormControl>
                    <FormDescription>
                      Must be at least 8 characters
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirm New Password</FormLabel>
                    <FormControl>
                      <Input type="password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button 
                type="submit" 
                disabled={form.formState.isSubmitting}
                className="mt-2"
              >
                {form.formState.isSubmitting ? "Updating..." : "Update Password"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};

export default SecuritySettings;
