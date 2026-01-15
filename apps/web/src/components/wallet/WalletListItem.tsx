"use client";

import { useWallet } from "@solana/wallet-adapter-react";

interface WalletListItemProps {
  name: string;
  icon: string;
  onClick: () => void;
  isConnecting?: boolean;
}

/**
 * Individual wallet item in the wallet list.
 * Shows wallet icon and name, clickable to connect.
 */
export function WalletListItem({
  name,
  icon,
  onClick,
  isConnecting = false,
}: WalletListItemProps) {
  return (
    <button
      onClick={onClick}
      disabled={isConnecting}
      className="
        w-full
        flex items-center gap-3
        px-4 py-3
        bg-surface
        hover:bg-elevated
        border border-transparent
        hover:border-white/10
        rounded-xl
        transition-all duration-150
        disabled:opacity-50 disabled:cursor-wait
        group
      "
    >
      <img
        src={icon}
        alt={name}
        className="w-8 h-8 rounded-lg"
      />
      <span className="text-text-primary font-medium group-hover:text-white transition-colors">
        {isConnecting ? "Connecting..." : name}
      </span>
    </button>
  );
}
