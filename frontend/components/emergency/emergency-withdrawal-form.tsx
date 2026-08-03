import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export function EmergencyWithdrawalForm() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Emergency Withdrawal Request</CardTitle>
      </CardHeader>
      <CardContent>
        <form className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="amount">Amount</Label>
            <Input id="amount" type="number" placeholder="50000" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="reason">Reason</Label>
            <Textarea id="reason" placeholder="Describe the emergency" />
          </div>
          <Button type="submit">Submit Request</Button>
        </form>
      </CardContent>
    </Card>
  );
}