"use client";

import { useState, useEffect } from "react";
import { PublicKey } from "@solana/web3.js";
import { X, LogOut, Key, Wallet } from "lucide-react";
import { useWallet } from "@solana/wallet-adapter-react";
import { useWallet as useLazorkitWallet } from "@lazorkit/wallet";
import { AddressDisplay } from "./AddressDisplay";
import { BalanceDisplay } from "./BalanceDisplay";
import { TransferForm } from "./TransferForm";
import { SwapForm } from "./SwapForm";
import { useBalances } from "./hooks/useBalances";

type TabType = "transfer" | "swap";

interface WalletDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * Wallet details modal with tabs for Transfer and Swap.
 * Shows wallet info, balances, and actions.
 */
export function WalletDetailsModal({ isOpen, onClose }: WalletDetailsModalProps) {
  const [activeTab, setActiveTab] = useState<TabType>("transfer");

  // Solana Wallet Adapter state
  const { publicKey, wallet, disconnect } = useWallet();

  // Lazorkit state
  const {
    smartWalletPubkey,
    isConnected: isLazorkitConnected,
    disconnect: lazorkitDisconnect,
  } = useLazorkitWallet();

  // Determine wallet type and address
  // Prioritize traditional wallet if connected, otherwise use Lazorkit
  const isLazorkitWallet = !publicKey && !!smartWalletPubkey && isLazorkitConnected;
  const walletPubkey: PublicKey | null = publicKey || smartWalletPubkey || null;
  const walletAddress = walletPubkey?.toBase58() || "";

  // Fetch balances - only when modal is open
  // Pass address string to prevent object recreation issues
  const { sol, usdc, loading: balancesLoading, refetch } = useBalances(walletAddress, { 
    enabled: isOpen 
  });

  // Close on Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose]);

  // Only check isOpen - we'll show even without wallet (edge case handling)
  if (!isOpen) return null;
  
  // If modal is open but no wallet connected, show error state
  if (!walletPubkey) {
    console.error("[WalletDetailsModal] Modal opened but no wallet connected!");
    return null;
  }

  const handleDisconnect = async () => {
    if (publicKey) {
      await disconnect();
    }
    if (isLazorkitConnected) {
      await lazorkitDisconnect();
    }
    onClose();
  };

  const handleClose = (e: React.MouseEvent) => {
    e.stopPropagation();
    onClose();
  };

  return (
    <div
      className="fixed inset-0 flex items-center justify-center p-4"
      style={{ zIndex: 9999 }}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Modal */}
      <div
        className="relative w-full max-w-md bg-primary border border-white/10 rounded-2xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
          <h2 className="text-lg font-semibold text-text-primary">Your Wallet</h2>
          <div className="flex items-center gap-2">
            {/* Devnet badge */}
            <span className="px-2 py-0.5 text-xs font-medium text-yellow-500 bg-yellow-500/10 rounded-full">
              ⚠️ Devnet
            </span>
            <button
              onClick={handleClose}
              className="p-1.5 text-text-muted hover:text-text-primary transition-colors rounded-lg hover:bg-white/5"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4">
          {/* Wallet type indicator */}
          <div className="flex items-center gap-2">
            {isLazorkitWallet ? (
              <>
                <Key size={16} className="text-accent" />
                <span className="text-sm text-text-secondary">Passkey Wallet</span>
              </>
            ) : (
              <>
                {wallet?.adapter.icon ? (
                  <img
                    src={wallet.adapter.icon}
                    alt={wallet.adapter.name}
                    className="w-4 h-4 rounded"
                  />
                ) : (
                  <Wallet size={16} className="text-accent" />
                )}
                <span className="text-sm text-text-secondary">
                  {wallet?.adapter.name || "Wallet"}
                </span>
              </>
            )}
          </div>

          {/* Address */}
          <AddressDisplay address={walletAddress} />

          {/* Balances */}
          <BalanceDisplay
            sol={sol}
            usdc={usdc}
            loading={balancesLoading}
            onRefresh={refetch}
          />

          {/* Tabs */}
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab("transfer")}
              className={`flex-1 h-10 px-4 rounded-xl text-sm font-medium transition-all ${
                activeTab === "transfer"
                  ? "bg-white text-primary hover:scale-[1.02] active:scale-100"
                  : "bg-surface border border-white/10 text-text-muted hover:bg-elevated hover:text-text-primary"
              }`}
            >
              💸 Transfer
            </button>
            <button
              onClick={() => setActiveTab("swap")}
              className={`flex-1 h-10 px-4 rounded-xl text-sm font-medium transition-all ${
                activeTab === "swap"
                  ? "bg-white text-primary hover:scale-[1.02] active:scale-100"
                  : "bg-surface border border-white/10 text-text-muted hover:bg-elevated hover:text-text-primary"
              }`}
            >
              🔄 Swap
            </button>
          </div>

          {/* Tab Content */}
          <div className="min-h-[200px]">
            {activeTab === "transfer" && (
              <TransferForm
                walletPubkey={walletPubkey}
                usdcBalance={usdc}
                isLazorkitWallet={isLazorkitWallet}
                onTransferComplete={refetch}
              />
            )}

            {activeTab === "swap" && isLazorkitWallet && (
              <SwapForm
                walletPubkey={walletPubkey}
                solBalance={sol}
                usdcBalance={usdc}
                onSwapComplete={refetch}
              />
            )}

            {activeTab === "swap" && !isLazorkitWallet && (
              <div className="flex flex-col items-center justify-center h-[200px] text-center">
                <p className="text-text-secondary font-medium">Passkey Required</p>
                <p className="text-sm text-text-muted mt-1">
                  Gasless swaps are only available with Passkey wallets.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-white/10">
          <button
            onClick={handleDisconnect}
            className="w-full h-10 flex items-center justify-center gap-2 bg-surface border border-white/10 text-pnl-red rounded-xl hover:bg-pnl-red/10 hover:border-pnl-red/30 transition-colors"
          >
            <LogOut size={16} />
            <span className="font-medium">Disconnect</span>
          </button>
        </div>
      </div>
    </div>
  );
}
