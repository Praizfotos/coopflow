import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield } from "lucide-react";

export function ProposalList() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Proposals
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="p-3 rounded-lg border">
            <p className="font-medium">Increase contribution amount to 15,000 XLM</p>
            <p className="text-sm text-muted-foreground">67% Approved - Active</p>
          </div>
          <div className="p-3 rounded-lg border">
            <p className="font-medium">Add new member to cooperative</p>
            <p className="text-sm text-muted-foreground">Pending - Active</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}