"use client";

import { useWallet } from "@solana/wallet-adapter-react";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";
import { Wallet, LogOut } from "lucide-react";

export function ConnectWallet() {
    const { publicKey, disconnect, connecting } = useWallet();
    const { setVisible } = useWalletModal();

    const handleConnect = () => {
        setVisible(true);
    };

    const handleDisconnect = () => {
        disconnect();
    };

    // Connected state: show address + logout
    if (publicKey) {
        const address = publicKey.toBase58();
        return (
            <div className="flex items-center gap-3">
                <span className="font-mono text-sm text-text-muted">
                    {address}
                </span>
                <button
                    onClick={handleDisconnect}
                    className="text-text-muted hover:text-pnl-red transition-colors"
                    aria-label="Disconnect wallet"
                >
                    <LogOut size={18} />
                </button>
            </div>
        );
    }

    // Disconnected state: show wallet icon
    return (
        <button
            onClick={handleConnect}
            disabled={connecting}
            className="text-text-muted hover:text-accent transition-colors disabled:opacity-50"
            aria-label="Connect wallet"
        >
            <Wallet size={24} />
        </button>
    );
}
