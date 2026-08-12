import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "lucide-react";

export function ContributionCycleList() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Contribution Cycles
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex justify-between items-center p-3 rounded-lg border">
            <div>
              <p className="font-medium">Weekly Cycle #1</p>
              <p className="text-sm text-muted-foreground">10,000 XLM per member</p>
            </div>
            <Badge variant="default">Active</Badge>
          </div>
          <div className="flex justify-between items-center p-3 rounded-lg border">
            <div>
              <p className="font-medium">Monthly Cycle #2</p>
              <p className="text-sm text-muted-foreground">50,000 XLM per member</p>
            </div>
            <Badge variant="secondary">Active</Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}