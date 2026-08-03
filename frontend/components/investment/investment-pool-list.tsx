import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp } from "lucide-react";

export function InvestmentPoolList() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Investment Pools
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="p-3 rounded-lg border">
            <p className="font-medium">Growth Fund</p>
            <p className="text-sm text-muted-foreground">Total Contributed: 500,000 XLM</p>
            <p className="text-sm text-muted-foreground">Returns: 25,000 XLM</p>
            <p className="text-sm text-muted-foreground">Members: 15</p>
          </div>
          <div className="p-3 rounded-lg border">
            <p className="font-medium">Stable Income Fund</p>
            <p className="text-sm text-muted-foreground">Total Contributed: 250,000 XLM</p>
            <p className="text-sm text-muted-foreground">Returns: 12,500 XLM</p>
            <p className="text-sm text-muted-foreground">Members: 8</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}