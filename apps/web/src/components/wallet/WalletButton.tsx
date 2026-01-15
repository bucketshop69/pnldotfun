"use client";

import { useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { useWallet as useLazorkitWallet } from "@lazorkit/wallet";
import { Wallet } from "lucide-react";
import { WalletModal } from "./WalletModal";
import { WalletDetailsModal } from "./WalletDetailsModal";

/**
 * Wallet button for the page.
 * - Disconnected: Shows wallet icon, opens connection modal on click
 * - Connected: Shows wallet icon + truncated address, opens details modal on click
 * 
 * Supports both Solana Wallet Adapter and Lazorkit connections.
 */
export function WalletButton() {
  // Solana Wallet Adapter state
  const { publicKey, wallet, connecting } = useWallet();
  
  // Lazorkit state
  const { 
    smartWalletPubkey, 
    isConnected: isLazorkitConnected, 
  } = useLazorkitWallet();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalKey, setModalKey] = useState(0);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  const openModal = () => {
    setModalKey((k) => k + 1); // Force remount to reset state
    setIsModalOpen(true);
  };
  const closeModal = () => setIsModalOpen(false);

  const openDetails = () => setIsDetailsOpen(true);
  const closeDetails = () => setIsDetailsOpen(false);

  // Check if connected via either method
  const isConnected = publicKey || isLazorkitConnected;
  const displayAddress = publicKey?.toBase58() || smartWalletPubkey?.toBase58();

  // Connected state - clicking opens details modal
  if (isConnected && displayAddress) {
    const truncatedAddress = `${displayAddress.slice(0, 4)}...${displayAddress.slice(-4)}`;

    return (
      <>
        <button
          onClick={openDetails}
          className="flex items-center gap-2 px-3 py-2 bg-surface rounded-xl border border-white/10 hover:border-accent/30 transition-colors cursor-pointer"
        >
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
        </button>

        <WalletDetailsModal isOpen={isDetailsOpen} onClose={closeDetails} />
      </>
    );
  }

  // Disconnected state
  return (
    <>
      <button
        onClick={openModal}
        disabled={connecting}
        className="
          px-6 py-3
          bg-white
          text-primary
          font-mono font-bold
          rounded-xl
          hover:scale-105
          active:scale-95
          transition-all
          disabled:opacity-50
          disabled:hover:scale-100
        "
      >
        Connect Wallet
      </button>

      <WalletModal key={modalKey} isOpen={isModalOpen} onClose={closeModal} />
    </>
  );
}

