import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Bell } from "lucide-react";

export function NotificationList() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          Notifications
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex justify-between items-center p-3 rounded-lg border">
            <div>
              <p className="font-medium">Contribution Reminder</p>
              <p className="text-sm text-muted-foreground">Your weekly contribution is due</p>
            </div>
            <span className="text-xs text-muted-foreground">2h ago</span>
          </div>
          <div className="flex justify-between items-center p-3 rounded-lg border">
            <div>
              <p className="font-medium">New Proposal</p>
              <p className="text-sm text-muted-foreground">Vote on the new contribution amount</p>
            </div>
            <span className="text-xs text-muted-foreground">1d ago</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}