import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export function InvestmentPoolForm() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Create Investment Pool</CardTitle>
      </CardHeader>
      <CardContent>
        <form className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Pool Name</Label>
            <Input id="name" placeholder="Growth Fund" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" placeholder="Investment pool description" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="targetAmount">Target Amount</Label>
              <Input id="targetAmount" type="number" placeholder="500000" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="asset">Asset</Label>
              <Input id="asset" defaultValue="XLM" />
            </div>
          </div>
          <Button type="submit">Create Pool</Button>
        </form>
      </CardContent>
    </Card>
  );
}