import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText } from "lucide-react";

export function LoanList() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Loan List
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex justify-between items-center p-3 rounded-lg border">
            <div>
              <p className="font-medium">Loan #101</p>
              <p className="text-sm text-muted-foreground">member-001</p>
            </div>
            <div className="text-right">
              <p className="font-semibold">50,000 XLM</p>
              <Badge variant="default">Active</Badge>
            </div>
          </div>
          <div className="flex justify-between items-center p-3 rounded-lg border">
            <div>
              <p className="font-medium">Loan #102</p>
              <p className="text-sm text-muted-foreground">member-002</p>
            </div>
            <div className="text-right">
              <p className="font-semibold">25,000 XLM</p>
              <Badge variant="secondary">Approved</Badge>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}