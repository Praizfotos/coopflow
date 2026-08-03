import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity } from "lucide-react";

export function SystemLogs() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5" />
          System Logs
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2 font-mono text-sm">
          <div className="p-2 rounded bg-muted">
            <span className="text-muted-foreground">[2026-08-03 10:00:00]</span> System started
          </div>
          <div className="p-2 rounded bg-muted">
            <span className="text-muted-foreground">[2026-08-03 10:01:00]</span> Database connected
          </div>
          <div className="p-2 rounded bg-muted">
            <span className="text-muted-foreground">[2026-08-03 10:02:00]</span> API server listening on port 3001
          </div>
        </div>
      </CardContent>
    </Card>
  );
}