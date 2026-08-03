import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function LoanRepaymentForm() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Record Repayment</CardTitle>
      </CardHeader>
      <CardContent>
        <form className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="loanId">Loan ID</Label>
            <Input id="loanId" placeholder="Loan UUID" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="amount">Amount</Label>
              <Input id="amount" type="number" placeholder="5000" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="asset">Asset</Label>
              <Input id="asset" defaultValue="XLM" />
            </div>
          </div>
          <Button type="submit">Record Payment</Button>
        </form>
      </CardContent>
    </Card>
  );
}