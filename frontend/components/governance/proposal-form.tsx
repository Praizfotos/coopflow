import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";

export function ProposalForm() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Create Proposal</CardTitle>
      </CardHeader>
      <CardContent>
        <form className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input id="title" placeholder="Proposal title" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" placeholder="Describe the proposal" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="type">Type</Label>
              <Select id="type" defaultValue="Spend">
                <option value="Spend">Spend</option>
                <option value="MemberApproval">Member Approval</option>
                <option value="RuleChange">Rule Change</option>
                <option value="Custom">Custom</option>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="threshold">Approval Threshold (%)</Label>
              <Input id="threshold" type="number" defaultValue="60" />
            </div>
          </div>
          <Button type="submit">Create Proposal</Button>
        </form>
      </CardContent>
    </Card>
  );
}