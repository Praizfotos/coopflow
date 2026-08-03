import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText } from "lucide-react";

export function ActiveLoans() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Active Loans</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-sm">Loan #101 - member-001</span>
            <span className="text-sm font-medium">50,000 XLM</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm">Loan #102 - member-002</span>
            <span className="text-sm font-medium">25,000 XLM</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm">Loan #103 - member-003</span>
            <span className="text-sm font-medium">75,000 XLM</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}