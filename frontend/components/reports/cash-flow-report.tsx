import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function CashFlowReport() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Cash Flow Report</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex justify-between items-center p-3 rounded-lg border">
            <span>Operating Activities</span>
            <span className="font-semibold">+1,000,000 XLM</span>
          </div>
          <div className="flex justify-between items-center p-3 rounded-lg border">
            <span>Investing Activities</span>
            <span className="font-semibold">-250,000 XLM</span>
          </div>
          <div className="flex justify-between items-center p-3 rounded-lg border">
            <span>Financing Activities</span>
            <span className="font-semibold">+500,000 XLM</span>
          </div>
          <div className="flex justify-between items-center p-3 rounded-lg border">
            <span className="font-bold">Net Change</span>
            <span className="font-bold text-green-600">+1,250,000 XLM</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}