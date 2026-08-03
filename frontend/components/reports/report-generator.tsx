import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { Label } from "@/components/ui/label";

export function ReportGenerator() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Generate Report</CardTitle>
      </CardHeader>
      <CardContent>
        <form className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="reportType">Report Type</Label>
            <Select id="reportType" defaultValue="contributions">
              <option value="contributions">Contribution Report</option>
              <option value="financial">Financial Statement</option>
              <option value="cashflow">Cash Flow</option>
              <option value="balance">Balance Sheet</option>
              <option value="loans">Loan Report</option>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startDate">Start Date</Label>
              <Input id="startDate" type="date" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endDate">End Date</Label>
              <Input id="endDate" type="date" />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="format">Export Format</Label>
            <Select id="format" defaultValue="csv">
              <option value="csv">CSV</option>
              <option value="excel">Excel</option>
              <option value="pdf">PDF</option>
            </Select>
          </div>
          <Button type="submit">Generate Report</Button>
        </form>
      </CardContent>
    </Card>
  );
}