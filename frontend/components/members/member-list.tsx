import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users } from "lucide-react";

export function MemberList() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Members
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex justify-between items-center p-3 rounded-lg border">
            <div>
              <p className="font-medium">John Doe</p>
              <p className="text-sm text-muted-foreground">john@example.com</p>
            </div>
            <span className="text-sm">Member</span>
          </div>
          <div className="flex justify-between items-center p-3 rounded-lg border">
            <div>
              <p className="font-medium">Jane Doe</p>
              <p className="text-sm text-muted-foreground">jane@example.com</p>
            </div>
            <span className="text-sm">Treasurer</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}