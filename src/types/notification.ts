
export type NotificationSeverity = "info" | "success" | "warning" | "error";
export type NotificationCategory = "job" | "transformation" | "source" | "destination" | "system" | "export";

export interface Notification {
  id: string;
  title: string;
  description: string;
  severity: NotificationSeverity;
  category: NotificationCategory;
  read: boolean;
  created_at: string;
  user_id: string;
  link?: string;
  related_id?: string;
}
