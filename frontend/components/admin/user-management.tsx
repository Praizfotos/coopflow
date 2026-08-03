import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users } from "lucide-react";

export function UserManagement() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          User Management
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex justify-between items-center p-3 rounded-lg border">
            <div>
              <p className="font-medium">user@example.com</p>
              <p className="text-sm text-muted-foreground">Administrator</p>
            </div>
            <span className="text-sm">Active</span>
          </div>
          <div className="flex justify-between items-center p-3 rounded-lg border">
            <div>
              <p className="font-medium">member@example.com</p>
              <p className="text-sm text-muted-foreground">Member</p>
            </div>
            <span className="text-sm">Active</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}