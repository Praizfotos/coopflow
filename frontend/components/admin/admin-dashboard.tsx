import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, Users, Activity, AlertTriangle } from "lucide-react";

export function AdminDashboard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Admin Dashboard
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="p-4 rounded-lg border">
            <p className="text-sm text-muted-foreground">Total Users</p>
            <p className="text-2xl font-bold">1,234</p>
          </div>
          <div className="p-4 rounded-lg border">
            <p className="text-sm text-muted-foreground">Active Cooperatives</p>
            <p className="text-2xl font-bold">56</p>
          </div>
          <div className="p-4 rounded-lg border">
            <p className="text-sm text-muted-foreground">Pending Reviews</p>
            <p className="text-2xl font-bold">12</p>
          </div>
          <div className="p-4 rounded-lg border">
            <p className="text-sm text-muted-foreground">Alerts</p>
            <p className="text-2xl font-bold">3</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}