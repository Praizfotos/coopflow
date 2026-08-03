import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText } from "lucide-react";

export function TransactionHistory() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Transaction History
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="flex justify-between items-center p-2 rounded border">
            <span>Deposit - 100,000 XLM</span>
            <span className="text-sm text-muted-foreground">2026-08-03</span>
          </div>
          <div className="flex justify-between items-center p-2 rounded border">
            <span>Withdrawal - 50,000 XLM</span>
            <span className="text-sm text-muted-foreground">2026-08-02</span>
          </div>
          <div className="flex justify-between items-center p-2 rounded border">
            <span>Deposit - 200,000 XLM</span>
            <span className="text-sm text-muted-foreground">2026-08-01</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}