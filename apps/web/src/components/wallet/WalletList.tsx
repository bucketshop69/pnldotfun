"use client";

import { useState, useCallback } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { WalletListItem } from "./WalletListItem";

interface WalletListProps {
  onSuccess: () => void;
}

/**
 * Right side of the modal - list of available wallets.
 * Excludes Lazorkit (shown on left side as Passkey).
 */
export function WalletList({ onSuccess }: WalletListProps) {
  const { wallets, select, connect } = useWallet();
  const [connectingWallet, setConnectingWallet] = useState<string | null>(null);

  // Filter out Lazorkit (it's shown on the left as Passkey)
  const filteredWallets = wallets.filter(
    (wallet) => !wallet.adapter.name.toLowerCase().includes("lazor")
  );

  const handleWalletClick = useCallback(
    async (walletName: string) => {
      setConnectingWallet(walletName);
      try {
        select(walletName as any);
        await new Promise((resolve) => setTimeout(resolve, 100));
        await connect();
        onSuccess();
      } catch (error) {
        console.error("Wallet connection failed:", error);
      } finally {
        setConnectingWallet(null);
      }
    },
    [select, connect, onSuccess]
  );

  return (
    <div className="flex flex-col h-full">
      <h3 className="text-lg font-semibold text-text-primary mb-1">
        Select Wallet
      </h3>
      <p className="text-sm text-text-muted mb-4">
        Connect your existing Solana wallet
      </p>

      {/* Wallet list - scrollable */}
      <div className="flex-1 overflow-y-auto space-y-2 pr-2 -mr-2">
        {filteredWallets.length > 0 ? (
          filteredWallets.map((wallet) => (
            <WalletListItem
              key={wallet.adapter.name}
              name={wallet.adapter.name}
              icon={wallet.adapter.icon}
              onClick={() => handleWalletClick(wallet.adapter.name)}
              isConnecting={connectingWallet === wallet.adapter.name}
            />
          ))
        ) : (
          <p className="text-sm text-text-muted text-center py-8">
            No wallets detected.
            <br />
            Install Phantom, Solflare, or Backpack.
          </p>
        )}
      </div>
    </div>
  );
}
