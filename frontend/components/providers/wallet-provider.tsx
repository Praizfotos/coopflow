"use client";

import * as React from "react";

interface WalletContextType {
  address: string | null;
  balance: string;
  connect: () => Promise<void>;
  disconnect: () => void;
  isConnected: boolean;
}

const WalletContext = React.createContext<WalletContextType>({
  address: null,
  balance: "0",
  connect: async () => {},
  disconnect: () => {},
  isConnected: false,
});

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const [address, setAddress] = React.useState<string | null>(null);
  const [balance, setBalance] = React.useState("0");

  const connect = React.useCallback(async () => {
    try {
      if (typeof window !== "undefined" && (window as any).Freighter) {
        const freighter = (window as any).Freighter;
        const accounts = await freighter.getAccounts();
        if (accounts.length > 0) {
          setAddress(accounts[0].publicKey);
          setBalance(accounts[0].balance);
        }
      }
    } catch (error) {
      console.error("Wallet connection failed:", error);
    }
  }, []);

  const disconnect = React.useCallback(() => {
    setAddress(null);
    setBalance("0");
  }, []);

  return (
    <WalletContext.Provider value={{ address, balance, connect, disconnect, isConnected: !!address }}>
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  const context = React.useContext(WalletContext);
  if (!context) {
    throw new Error("useWallet must be used within a WalletProvider");
  }
  return context;
}