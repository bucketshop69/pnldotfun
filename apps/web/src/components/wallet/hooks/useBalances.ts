"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Connection, PublicKey, LAMPORTS_PER_SOL } from "@solana/web3.js";
import { getAccount, getAssociatedTokenAddress } from "@solana/spl-token";
import { USDC_MINT, USDC_DECIMALS } from "@/lib/constants";
import { LAZORKIT_CONFIG } from "@/lib/config";

interface Balances {
  sol: number;
  usdc: number;
  loading: boolean;
  error: string | null;
}

interface UseBalancesOptions {
  /** Only fetch when enabled is true (e.g., when modal is open) */
  enabled?: boolean;
}

/**
 * Hook to fetch SOL and USDC balances for a wallet.
 * Accepts wallet address as string to prevent object recreation issues.
 * Only fetches when enabled is true to prevent excessive RPC calls.
 */
export function useBalances(
  walletAddress: string,
  options: UseBalancesOptions = {}
) {
  const { enabled = true } = options;
  
  const [balances, setBalances] = useState<Balances>({
    sol: 0,
    usdc: 0,
    loading: false,
    error: null,
  });

  // Track if we've already fetched for this address
  const hasFetchedRef = useRef<string | null>(null);
  // Track if a fetch is in progress
  const isFetchingRef = useRef(false);

  const fetchBalances = useCallback(async () => {
    if (!walletAddress) {
      setBalances({ sol: 0, usdc: 0, loading: false, error: null });
      return;
    }

    // Prevent concurrent fetches
    if (isFetchingRef.current) {
      return;
    }

    isFetchingRef.current = true;
    setBalances((prev) => ({ ...prev, loading: true, error: null }));

    try {
      const walletPubkey = new PublicKey(walletAddress);
      const connection = new Connection(LAZORKIT_CONFIG.RPC_URL, "confirmed");

      // Fetch SOL balance
      const solBalance = await connection.getBalance(walletPubkey);
      const solFormatted = solBalance / LAMPORTS_PER_SOL;

      // Fetch USDC balance
      let usdcBalance = 0;
      try {
        // allowOwnerOffCurve: true is needed for PDA wallets like Lazorkit smart wallets
        const usdcAta = await getAssociatedTokenAddress(
          USDC_MINT, 
          walletPubkey,
          true // allowOwnerOffCurve
        );
        const tokenAccount = await getAccount(connection, usdcAta);
        usdcBalance = Number(tokenAccount.amount) / 10 ** USDC_DECIMALS;
      } catch {
        // Token account doesn't exist = 0 balance
        usdcBalance = 0;
      }

      setBalances({
        sol: solFormatted,
        usdc: usdcBalance,
        loading: false,
        error: null,
      });

      // Mark as fetched for this address
      hasFetchedRef.current = walletAddress;
    } catch (err) {
      console.error("[useBalances] Failed to fetch balances:", err);
      setBalances((prev) => ({
        ...prev,
        loading: false,
        error: "Failed to fetch balances",
      }));
    } finally {
      isFetchingRef.current = false;
    }
  }, [walletAddress]);

  // Fetch when enabled and address changes (or hasn't been fetched yet)
  useEffect(() => {
    // Only fetch if:
    // 1. enabled is true
    // 2. We have an address
    // 3. We haven't fetched for this address yet
    if (enabled && walletAddress && hasFetchedRef.current !== walletAddress) {
      fetchBalances();
    }
  }, [enabled, walletAddress, fetchBalances]);

  // Reset when disabled
  useEffect(() => {
    if (!enabled) {
      hasFetchedRef.current = null;
    }
  }, [enabled]);

  return { ...balances, refetch: fetchBalances };
}
