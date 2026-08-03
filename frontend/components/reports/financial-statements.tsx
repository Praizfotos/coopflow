import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function FinancialStatements() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Financial Statements</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex justify-between items-center p-3 rounded-lg border">
            <span>Total Income (Q2 2026)</span>
            <span className="font-semibold">1,250,000 XLM</span>
          </div>
          <div className="flex justify-between items-center p-3 rounded-lg border">
            <span>Total Expenses (Q2 2026)</span>
            <span className="font-semibold">750,000 XLM</span>
          </div>
          <div className="flex justify-between items-center p-3 rounded-lg border">
            <span>Net Profit</span>
            <span className="font-semibold text-green-600">500,000 XLM</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}