import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle } from "lucide-react";

export function EmergencyFundOverview() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5" />
          Emergency Fund Overview
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Current Balance</span>
            <span className="font-semibold">250,000 XLM</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Total Contributed</span>
            <span className="font-semibold">500,000 XLM</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Total Withdrawn</span>
            <span className="font-semibold">250,000 XLM</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Monthly Target</span>
            <span className="font-semibold">50,000 XLM</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}