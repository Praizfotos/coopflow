import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";

export function LoanForm() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Request Loan</CardTitle>
      </CardHeader>
      <CardContent>
        <form className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="amount">Amount</Label>
              <Input id="amount" type="number" placeholder="50000" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="asset">Asset</Label>
              <Select id="asset" defaultValue="XLM">
                <option value="XLM">XLM</option>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="interestRate">Interest Rate (%)</Label>
              <Input id="interestRate" type="number" step="0.01" placeholder="5.00" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="termDays">Term (Days)</Label>
              <Input id="termDays" type="number" placeholder="30" />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="reason">Reason</Label>
            <Input id="reason" placeholder="Emergency expense" />
          </div>
          <Button type="submit">Submit Loan Request</Button>
        </form>
      </CardContent>
    </Card>
  );
}