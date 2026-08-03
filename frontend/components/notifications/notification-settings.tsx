import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export function NotificationSettings() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Notification Preferences</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span>Email Notifications</span>
            <Button variant="outline" size="sm">Enabled</Button>
          </div>
          <div className="flex justify-between items-center">
            <span>SMS Notifications</span>
            <Button variant="outline" size="sm">Disabled</Button>
          </div>
          <div className="flex justify-between items-center">
            <span>Push Notifications</span>
            <Button variant="outline" size="sm">Enabled</Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}