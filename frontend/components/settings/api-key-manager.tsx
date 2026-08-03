import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Key, Plus, Trash2 } from "lucide-react";

export function ApiKeyManager() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Key className="h-5 w-5" />
          API Keys
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-3 rounded-lg border">
            <div>
              <p className="font-medium">Production Key</p>
              <p className="text-sm text-muted-foreground">sk_live_****4242</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">Regenerate</Button>
              <Button variant="destructive" size="sm">
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Generate New Key
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}