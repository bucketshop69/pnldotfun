import { PublicKey } from "@solana/web3.js";

/**
 * Token configuration for Devnet
 */
export const USDC_MINT = new PublicKey(
  "4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU"
);
export const USDC_DECIMALS = 6;

/**
 * Solana Explorer base URL
 */
export const EXPLORER_URL = "https://explorer.solana.com";
export const EXPLORER_CLUSTER = "devnet";

/**
 * Get explorer URL for a transaction
 */
export function getExplorerUrl(signature: string): string {
  return `${EXPLORER_URL}/tx/${signature}?cluster=${EXPLORER_CLUSTER}`;
}

/**
 * Get explorer URL for an address
 */
export function getAddressExplorerUrl(address: string): string {
  return `${EXPLORER_URL}/address/${address}?cluster=${EXPLORER_CLUSTER}`;
}
