import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";

export function MemberForm() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Add Member</CardTitle>
      </CardHeader>
      <CardContent>
        <form className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input id="name" placeholder="John Doe" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" placeholder="john@example.com" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="walletAddress">Wallet Address</Label>
            <Input id="walletAddress" placeholder="GAAZI4T6S6Q4..." />
          </div>
          <div className="space-y-2">
            <Label htmlFor="role">Role</Label>
            <Select id="role" defaultValue="Member">
              <option value="Founder">Founder</option>
              <option value="Administrator">Administrator</option>
              <option value="Treasurer">Treasurer</option>
              <option value="Secretary">Secretary</option>
              <option value="Auditor">Auditor</option>
              <option value="Member">Member</option>
            </Select>
          </div>
          <Button type="submit">Add Member</Button>
        </form>
      </CardContent>
    </Card>
  );
}