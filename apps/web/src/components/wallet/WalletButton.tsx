"use client";

import { useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { useWallet as useLazorkitWallet } from "@lazorkit/wallet";
import { Wallet, LogOut } from "lucide-react";
import { WalletModal } from "./WalletModal";

/**
 * Wallet button for the page.
 * - Disconnected: Shows wallet icon, opens modal on click
 * - Connected: Shows wallet icon + truncated address + disconnect
 * 
 * Supports both Solana Wallet Adapter and Lazorkit connections.
 */
export function WalletButton() {
  // Solana Wallet Adapter state
  const { publicKey, wallet, disconnect, connecting } = useWallet();
  
  // Lazorkit state
  const { 
    smartWalletPubkey, 
    isConnected: isLazorkitConnected, 
    disconnect: lazorkitDisconnect 
  } = useLazorkitWallet();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalKey, setModalKey] = useState(0);

  const openModal = () => {
    setModalKey((k) => k + 1); // Force remount to reset state
    setIsModalOpen(true);
  };
  const closeModal = () => setIsModalOpen(false);

  // Check if connected via either method
  const isConnected = publicKey || isLazorkitConnected;
  const displayAddress = publicKey?.toBase58() || smartWalletPubkey?.toBase58();

  const handleDisconnect = async () => {
    // Disconnect from both
    if (publicKey) {
      await disconnect();
    }
    if (isLazorkitConnected) {
      await lazorkitDisconnect();
    }
  };

  // Connected state
  if (isConnected && displayAddress) {
    const truncatedAddress = `${displayAddress.slice(0, 4)}...${displayAddress.slice(-4)}`;

    return (
      <div className="flex items-center gap-2">
        {/* Wallet icon + Address */}
        <div className="flex items-center gap-2 px-3 py-2 bg-surface rounded-xl border border-white/10">
          {wallet?.adapter.icon ? (
            <img
              src={wallet.adapter.icon}
              alt={wallet.adapter.name}
              className="w-5 h-5 rounded"
            />
          ) : (
            <Wallet size={18} className="text-accent" />
          )}
          <span className="font-mono text-sm text-text-primary">
            {truncatedAddress}
          </span>
        </div>

        {/* Disconnect button */}
        <button
          onClick={handleDisconnect}
          className="p-2 text-text-muted hover:text-pnl-red transition-colors rounded-lg hover:bg-white/5"
          title="Disconnect"
        >
          <LogOut size={18} />
        </button>
      </div>
    );
  }

  // Disconnected state
  return (
    <>
      <button
        onClick={openModal}
        disabled={connecting}
        className="
          p-2
          text-text-muted
          hover:text-accent
          transition-colors
          rounded-lg
          hover:bg-white/5
          disabled:opacity-50
        "
        title="Connect Wallet"
      >
        <Wallet size={24} />
      </button>

      <WalletModal key={modalKey} isOpen={isModalOpen} onClose={closeModal} />
    </>
  );
}
