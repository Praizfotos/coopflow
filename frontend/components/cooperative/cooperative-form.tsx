import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export function CooperativeForm() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Create New Cooperative</CardTitle>
      </CardHeader>
      <CardContent>
        <form className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Cooperative Name</Label>
            <Input id="name" placeholder="My Cooperative" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="organization">Organization</Label>
            <Input id="organization" placeholder="Organization ID" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" placeholder="Describe your cooperative" />
          </div>
          <Button type="submit">Create Cooperative</Button>
        </form>
      </CardContent>
    </Card>
  );
}