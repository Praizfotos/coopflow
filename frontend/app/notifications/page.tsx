import { NotificationList } from "@/components/notifications/notification-list";
import { NotificationSettings } from "@/components/notifications/notification-settings";

export default function NotificationsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Notifications</h1>
      <NotificationSettings />
      <NotificationList />
    </div>
  );
}