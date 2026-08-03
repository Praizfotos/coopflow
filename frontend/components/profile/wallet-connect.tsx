import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Wallet } from "lucide-react";

export function WalletConnect() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Wallet Connection</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Connect your Stellar wallet to interact with CoopFlow.
          </p>
          <Button>
            <Wallet className="h-4 w-4 mr-2" />
            Connect with Freighter
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}