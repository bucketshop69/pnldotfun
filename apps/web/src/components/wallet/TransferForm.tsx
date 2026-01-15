"use client";

import { useState, useCallback } from "react";
import { Connection, PublicKey, Transaction } from "@solana/web3.js";
import {
  createTransferInstruction,
  createAssociatedTokenAccountInstruction,
  getAssociatedTokenAddress,
  getAccount,
} from "@solana/spl-token";
import { useWallet } from "@solana/wallet-adapter-react";
import { useWallet as useLazorkitWallet } from "@lazorkit/wallet";
import { ExternalLink } from "lucide-react";
import { USDC_MINT, USDC_DECIMALS, getExplorerUrl } from "@/lib/constants";
import { LAZORKIT_CONFIG } from "@/lib/config";
import { ConfirmTransferModal } from "./ConfirmTransferModal";

interface TransferFormProps {
  walletPubkey: PublicKey;
  usdcBalance: number;
  isLazorkitWallet: boolean;
  onTransferComplete?: () => void;
}

/**
 * USDC Transfer form with MAX button and inline Send button.
 * Supports both gasless (Lazorkit) and traditional (Wallet Adapter) transfers.
 */
export function TransferForm({
  walletPubkey,
  usdcBalance,
  isLazorkitWallet,
  onTransferComplete,
}: TransferFormProps) {
  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [txSignature, setTxSignature] = useState<string | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);

  // Wallet adapters
  const { signAndSendTransaction } = useLazorkitWallet();
  const { sendTransaction } = useWallet();

  // Validate recipient address
  const isValidRecipient = useCallback((addr: string): boolean => {
    try {
      new PublicKey(addr);
      return true;
    } catch {
      return false;
    }
  }, []);

  // Validate amount
  const parsedAmount = parseFloat(amount) || 0;
  const isValidAmount = parsedAmount > 0 && parsedAmount <= usdcBalance;
  const canSubmit = isValidRecipient(recipient) && isValidAmount && !loading;

  const handleMaxClick = () => {
    setAmount(usdcBalance.toString());
  };

  const handleSendClick = () => {
    if (!canSubmit) return;
    setError(null);
    setShowConfirm(true);
  };

  const handleConfirmTransfer = async () => {
    setShowConfirm(false);
    setLoading(true);
    setError(null);
    setTxSignature(null);

    try {
      const connection = new Connection(LAZORKIT_CONFIG.RPC_URL, "confirmed");
      const recipientPubkey = new PublicKey(recipient);

      // Get token accounts
      // allowOwnerOffCurve: true is needed for PDA wallets like Lazorkit smart wallets
      const senderAta = await getAssociatedTokenAddress(
        USDC_MINT, 
        walletPubkey,
        true // allowOwnerOffCurve - important for PDAs!
      );
      const recipientAta = await getAssociatedTokenAddress(
        USDC_MINT, 
        recipientPubkey,
        true // allowOwnerOffCurve - recipient might also be a PDA
      );

      // Build instructions
      const instructions = [];

      // Check if recipient ATA exists
      try {
        await getAccount(connection, recipientAta);
      } catch {
        // Create ATA for recipient
        instructions.push(
          createAssociatedTokenAccountInstruction(
            walletPubkey, // payer
            recipientAta, // ata
            recipientPubkey, // owner
            USDC_MINT // mint
          )
        );
      }

      // Add transfer instruction
      instructions.push(
        createTransferInstruction(
          senderAta,
          recipientAta,
          walletPubkey,
          BigInt(Math.floor(parsedAmount * 10 ** USDC_DECIMALS))
        )
      );

      let signature: string;

      if (isLazorkitWallet) {
        // GASLESS: Lazorkit paymaster pays gas
        signature = await signAndSendTransaction({ instructions });
      } else {
        // TRADITIONAL: User pays gas via Wallet Adapter
        const tx = new Transaction();
        instructions.forEach((ix) => tx.add(ix));
        
        const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash();
        tx.recentBlockhash = blockhash;
        tx.feePayer = walletPubkey;

        signature = await sendTransaction(tx, connection);
        
        // Wait for confirmation
        await connection.confirmTransaction({
          signature,
          blockhash,
          lastValidBlockHeight,
        });
      }

      setTxSignature(signature);
      setRecipient("");
      setAmount("");
      onTransferComplete?.();
    } catch (err: unknown) {
      console.error("Transfer failed:", err);
      
      // Check if this was a user cancellation (passkey dialog closed)
      const errorMessage = err instanceof Error ? err.message : String(err);
      const isUserCancellation = 
        errorMessage.toLowerCase().includes("cancel") ||
        errorMessage.toLowerCase().includes("abort") ||
        errorMessage.toLowerCase().includes("closed") ||
        errorMessage.toLowerCase().includes("reject") ||
        errorMessage.toLowerCase().includes("signing failed");
      
      if (isUserCancellation) {
        // User cancelled - don't show error, just reset
        setError(null);
      } else {
        setError(errorMessage || "Transfer failed");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Recipient input */}
      <div className="space-y-1.5">
        <label className="text-sm text-text-muted">Recipient</label>
        <input
          type="text"
          value={recipient}
          onChange={(e) => setRecipient(e.target.value)}
          placeholder="Enter Solana address..."
          disabled={loading}
          className="w-full px-4 py-3 bg-elevated border border-white/10 rounded-xl text-text-primary font-mono text-sm placeholder:text-text-muted focus:outline-none focus:border-accent/50 disabled:opacity-50"
        />
        {recipient && !isValidRecipient(recipient) && (
          <p className="text-xs text-pnl-red">Invalid Solana address</p>
        )}
      </div>

      {/* Amount input with MAX and Send */}
      <div className="space-y-1.5">
        <div className="flex justify-between">
          <label className="text-sm text-text-muted">Amount</label>
          <span className="text-xs text-text-muted">
            Available: {usdcBalance.toFixed(2)} USDC
          </span>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-elevated border border-white/10 rounded-xl focus-within:border-accent/50">
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
            disabled={loading}
            step="0.01"
            min="0"
            className="flex-1 bg-transparent text-text-primary font-mono text-sm placeholder:text-text-muted focus:outline-none disabled:opacity-50 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
          />
          <button
            onClick={handleMaxClick}
            disabled={loading || usdcBalance === 0}
            className="px-2 py-1 text-xs font-medium text-accent hover:text-accent/80 transition-colors disabled:opacity-50"
          >
            MAX
          </button>
          <button
            onClick={handleSendClick}
            disabled={!canSubmit}
            className="h-8 px-4 text-sm font-medium bg-white text-primary rounded-lg hover:scale-[1.02] active:scale-100 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            Send
          </button>
        </div>
        {parsedAmount > usdcBalance && (
          <p className="text-xs text-pnl-red">Insufficient balance</p>
        )}
      </div>

      {/* Gas info */}
      <p className="text-xs text-text-muted text-center">
        💡 {isLazorkitWallet ? (
          <span className="text-pnl-green">Gasless!</span>
        ) : (
          "Traditional wallet"
        )} — {isLazorkitWallet ? "You pay $0 in fees" : "Normal gas fees apply"}
      </p>

      {/* Error */}
      {error && (
        <div className="p-3 bg-pnl-red/10 border border-pnl-red/30 rounded-lg">
          <p className="text-sm text-pnl-red">{error}</p>
        </div>
      )}

      {/* Success */}
      {txSignature && (
        <div className="p-3 bg-pnl-green/10 border border-pnl-green/30 rounded-lg">
          <div className="flex items-center justify-between">
            <p className="text-sm text-pnl-green">Transfer successful!</p>
            <a
              href={getExplorerUrl(txSignature)}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-xs text-accent hover:underline"
            >
              View <ExternalLink size={12} />
            </a>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      <ConfirmTransferModal
        isOpen={showConfirm}
        onClose={() => setShowConfirm(false)}
        onConfirm={handleConfirmTransfer}
        amount={parsedAmount}
        recipient={recipient}
        isGasless={isLazorkitWallet}
        loading={loading}
      />
    </div>
  );
}
