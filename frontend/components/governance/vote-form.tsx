import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export function VoteForm() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Cast Your Vote</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <p className="text-sm">Proposal: Increase contribution amount to 15,000 XLM</p>
          <div className="flex gap-2">
            <Button variant="default">Vote Yes</Button>
            <Button variant="outline">Vote No</Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}