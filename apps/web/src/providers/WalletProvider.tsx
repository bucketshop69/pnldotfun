"use client";

import { useMemo, useEffect, ReactNode } from "react";
import {
    ConnectionProvider,
    WalletProvider as SolanaWalletProvider,
} from "@solana/wallet-adapter-react";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import { registerLazorkitWallet } from "@lazorkit/wallet";
import { LAZORKIT_CONFIG, WALLET_CONFIG } from "@/lib/config";

// Required for wallet-adapter UI
import "@solana/wallet-adapter-react-ui/styles.css";

// Buffer polyfill for Next.js
if (typeof window !== "undefined") {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    window.Buffer = window.Buffer || require("buffer").Buffer;
}

interface WalletProviderProps {
    children: ReactNode;
}

export function WalletProvider({ children }: WalletProviderProps) {
    // Register Lazorkit wallet on mount (before wallet detection)
    useEffect(() => {
        registerLazorkitWallet({
            rpcUrl: LAZORKIT_CONFIG.RPC_URL,
            portalUrl: LAZORKIT_CONFIG.PORTAL_URL,
            paymasterConfig: LAZORKIT_CONFIG.PAYMASTER,
            clusterSimulation: LAZORKIT_CONFIG.CLUSTER,
        });
    }, []);

    // Standard wallets are auto-detected via Wallet Standard
    // Lazorkit will appear after registration
    const wallets = useMemo(() => [], []);

    return (
        <ConnectionProvider endpoint={LAZORKIT_CONFIG.RPC_URL}>
            <SolanaWalletProvider
                wallets={wallets}
                autoConnect={WALLET_CONFIG.autoConnect}
            >
                <WalletModalProvider>{children}</WalletModalProvider>
            </SolanaWalletProvider>
        </ConnectionProvider>
    );
}
