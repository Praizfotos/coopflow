import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export function WithdrawalForm() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Request Withdrawal</CardTitle>
      </CardHeader>
      <CardContent>
        <form className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="amount">Amount</Label>
            <Input id="amount" type="number" placeholder="50000" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="asset">Asset</Label>
            <Input id="asset" defaultValue="XLM" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="toAddress">Recipient Address</Label>
            <Input id="toAddress" placeholder="GAAZI4T6S6Q4..." />
          </div>
          <div className="space-y-2">
            <Label htmlFor="reason">Reason</Label>
            <Textarea id="reason" placeholder="Reason for withdrawal" />
          </div>
          <Button type="submit">Request Withdrawal</Button>
        </form>
      </CardContent>
    </Card>
  );
}