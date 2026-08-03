import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2 } from "lucide-react";

export function CooperativeList() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building2 className="h-5 w-5" />
          Your Cooperatives
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="p-3 rounded-lg border">
            <p className="font-medium">Demo Savings Cooperative</p>
            <p className="text-sm text-muted-foreground">12 members</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}