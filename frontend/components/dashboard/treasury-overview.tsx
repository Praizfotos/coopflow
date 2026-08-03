import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Wallet } from "lucide-react";

export function TreasuryOverview() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Treasury Overview</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">XLM Balance</span>
            <span className="font-semibold">1,250,000 XLM</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Total Deposited</span>
            <span className="font-semibold">5,000,000 XLM</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Total Withdrawn</span>
            <span className="font-semibold">3,750,000 XLM</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Pending Withdrawals</span>
            <span className="font-semibold">250,000 XLM</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}