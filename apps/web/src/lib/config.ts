/**
 * Lazorkit + Solana configuration
 * Using Devnet for development
 */

export const LAZORKIT_CONFIG = {
    RPC_URL: "https://api.devnet.solana.com",
    PORTAL_URL: "https://portal.lazor.sh",
    PAYMASTER: {
        paymasterUrl: "https://kora.devnet.lazorkit.com",
    },
    CLUSTER: "devnet" as const,
};

/**
 * Wallet adapter configuration
 */
export const WALLET_CONFIG = {
    autoConnect: true,
};
