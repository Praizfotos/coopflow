import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function PaymentForm() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Record Contribution Payment</CardTitle>
      </CardHeader>
      <CardContent>
        <form className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="cycleId">Cycle ID</Label>
            <Input id="cycleId" placeholder="Cycle UUID" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="memberId">Member ID</Label>
              <Input id="memberId" placeholder="Member UUID" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="amount">Amount</Label>
              <Input id="amount" type="number" placeholder="10000" />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="txHash">Transaction Hash</Label>
            <Input id="txHash" placeholder="0x..." />
          </div>
          <Button type="submit">Record Payment</Button>
        </form>
      </CardContent>
    </Card>
  );
}