import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Wallet } from "lucide-react";

export function TreasuryBalance() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wallet className="h-5 w-5" />
          Treasury Balance
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold">1,250,000 XLM</div>
      </CardContent>
    </Card>
  );
}