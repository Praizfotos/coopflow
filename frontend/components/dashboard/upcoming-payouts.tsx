import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RotateCcw } from "lucide-react";

export function UpcomingPayouts() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Upcoming Payouts</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-sm">Cycle #42 - Payout to member-001</span>
            <span className="text-sm font-medium">5,000 XLM</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm">Cycle #43 - Payout to member-002</span>
            <span className="text-sm font-medium">5,000 XLM</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm">Cycle #44 - Payout to member-003</span>
            <span className="text-sm font-medium">5,000 XLM</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}