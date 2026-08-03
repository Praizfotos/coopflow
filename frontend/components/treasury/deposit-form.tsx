import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function DepositForm() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Deposit Funds</CardTitle>
      </CardHeader>
      <CardContent>
        <form className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="amount">Amount</Label>
            <Input id="amount" type="number" placeholder="10000" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="asset">Asset</Label>
            <Input id="asset" defaultValue="XLM" />
          </div>
          <Button type="submit">Deposit</Button>
        </form>
      </CardContent>
    </Card>
  );
}