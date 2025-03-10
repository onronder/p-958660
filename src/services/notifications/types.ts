
import { Notification } from "@/types/notification";

export interface NotificationCreate {
  title: string;
  description: string;
  severity: string;
  category: string;
  link?: string;
  related_id?: string;
  showToast?: boolean;
}
