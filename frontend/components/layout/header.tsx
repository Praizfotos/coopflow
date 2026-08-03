"use client";

import { useWallet } from "@/contexts/wallet-context";
import { Button } from "@/components/ui/button";
import { Wallet, LogOut } from "lucide-react";

export function Header() {
  const { connect, disconnect, address, balance } = useWallet();

  return (
    <header className="flex h-16 items-center justify-between border-b px-6">
      <div className="flex items-center gap-4">
        <h2 className="text-lg font-semibold">CoopFlow</h2>
      </div>
      <div className="flex items-center gap-4">
        {address ? (
          <>
            <span className="text-sm text-muted-foreground">
              {address.slice(0, 6)}...{address.slice(-4)}
            </span>
            <span className="text-sm font-medium">{balance} XLM</span>
            <Button variant="outline" size="sm" onClick={disconnect}>
              <LogOut className="h-4 w-4 mr-2" />
              Disconnect
            </Button>
          </>
        ) : (
          <Button size="sm" onClick={connect}>
            <Wallet className="h-4 w-4 mr-2" />
            Connect Wallet
          </Button>
        )}
      </div>
    </header>
  );
}