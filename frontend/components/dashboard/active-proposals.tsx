import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield } from "lucide-react";

export function ActiveProposals() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Active Governance Proposals</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-sm">Proposal #1 - Increase contribution amount</span>
            <span className="text-sm font-medium">67% Approved</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm">Proposal #2 - Add new member</span>
            <span className="text-sm font-medium">Pending</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}