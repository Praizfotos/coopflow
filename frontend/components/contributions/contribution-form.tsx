import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";

export function ContributionForm() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Create Contribution Cycle</CardTitle>
      </CardHeader>
      <CardContent>
        <form className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="cycleType">Cycle Type</Label>
              <Select id="cycleType" defaultValue="Weekly">
                <option value="Weekly">Weekly</option>
                <option value="Biweekly">Biweekly</option>
                <option value="Monthly">Monthly</option>
                <option value="Quarterly">Quarterly</option>
                <option value="Yearly">Yearly</option>
                <option value="Custom">Custom</option>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="amount">Amount</Label>
              <Input id="amount" type="number" placeholder="10000" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="asset">Asset</Label>
              <Input id="asset" defaultValue="XLM" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="startDate">Start Date</Label>
              <Input id="startDate" type="date" />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="endDate">End Date</Label>
            <Input id="endDate" type="date" />
          </div>
          <Button type="submit">Create Cycle</Button>
        </form>
      </CardContent>
    </Card>
  );
}