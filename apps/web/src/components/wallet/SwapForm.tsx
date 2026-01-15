"use client";

import { useState, useEffect, useCallback } from "react";
import { PublicKey, VersionedTransaction, Connection, TransactionMessage } from "@solana/web3.js";
import { ArrowUpDown, ExternalLink, Loader2 } from "lucide-react";
import { useWallet as useLazorkitWallet } from "@lazorkit/wallet";
import { useWallet } from "@solana/wallet-adapter-react";
import { 
  TOKENS, 
  TokenSymbol, 
  getExplorerUrl 
} from "@/lib/constants";
import { 
  getSwapQuote, 
  buildSwapTransaction, 
  processTransactionForLazorkit,
  formatOutputAmount,
  formatPriceImpact,
  SwapQuoteResponse
} from "@/lib/raydium";
import { LAZORKIT_CONFIG } from "@/lib/config";

interface SwapFormProps {
  walletPubkey: PublicKey;
  solBalance: number;
  usdcBalance: number;
  isLazorkitWallet: boolean;
  onSwapComplete?: () => void;
}

/**
 * Token swap form using Raydium DEX.
 * Supports gasless swaps for Lazorkit wallets, normal swaps for traditional wallets.
 */
export function SwapForm({
  walletPubkey,
  solBalance,
  usdcBalance,
  isLazorkitWallet,
  onSwapComplete,
}: SwapFormProps) {
  const [inputToken, setInputToken] = useState<TokenSymbol>("SOL");
  const [outputToken, setOutputToken] = useState<TokenSymbol>("USDC");
  const [inputAmount, setInputAmount] = useState("");
  const [outputAmount, setOutputAmount] = useState("");
  const [quoteResponse, setQuoteResponse] = useState<SwapQuoteResponse | null>(null);
  const [quoteLoading, setQuoteLoading] = useState(false);
  const [swapping, setSwapping] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [txSignature, setTxSignature] = useState<string | null>(null);

  const { signAndSendTransaction: lazorkitSignAndSend } = useLazorkitWallet();
  const { sendTransaction } = useWallet();

  // Get balance for current input token
  const inputBalance = inputToken === "SOL" ? solBalance : usdcBalance;
  const outputBalance = outputToken === "SOL" ? solBalance : usdcBalance;

  // Parsed input amount
  const parsedInput = parseFloat(inputAmount) || 0;
  const isValidAmount = parsedInput > 0 && parsedInput <= inputBalance;
  const canSwap = isValidAmount && quoteResponse && !swapping && !quoteLoading;

  // Fetch quote when input changes (debounced)
  const fetchQuote = useCallback(async () => {
    if (!inputAmount || parsedInput <= 0) {
      setQuoteResponse(null);
      setOutputAmount("");
      return;
    }

    setQuoteLoading(true);
    setError(null);

    try {
      const newQuoteResponse = await getSwapQuote(inputToken, outputToken, parsedInput);
      
      if (newQuoteResponse) {
        setQuoteResponse(newQuoteResponse);
        const formattedOutput = formatOutputAmount(newQuoteResponse.data.outputAmount, outputToken);
        setOutputAmount(formattedOutput.toFixed(outputToken === "USDC" ? 2 : 6));
      } else {
        setQuoteResponse(null);
        setOutputAmount("");
        setError("Failed to get quote. Pool may be unavailable on devnet.");
      }
    } catch (err) {
      console.error("Quote error:", err);
      setError("Failed to get quote");
    } finally {
      setQuoteLoading(false);
    }
  }, [inputAmount, inputToken, outputToken, parsedInput]);

  // Debounce quote fetching
  useEffect(() => {
    const timer = setTimeout(fetchQuote, 500);
    return () => clearTimeout(timer);
  }, [fetchQuote]);

  // Handle token flip
  const handleFlip = () => {
    setInputToken(outputToken);
    setOutputToken(inputToken);
    setInputAmount(outputAmount);
    setOutputAmount("");
    setQuoteResponse(null);
  };

  // Execute swap
  const handleSwap = async () => {
    if (!canSwap || !quoteResponse) return;

    setSwapping(true);
    setError(null);
    setTxSignature(null);

    try {
      // Build transaction from Raydium
      const tx = await buildSwapTransaction(
        walletPubkey.toBase58(),
        inputToken,
        outputToken,
        quoteResponse
      );

      if (!tx) {
        throw new Error("Failed to build swap transaction");
      }

      let signature: string;

      if (isLazorkitWallet) {
        // Gasless swap via Lazorkit
        const instructions = processTransactionForLazorkit(tx, walletPubkey);

        if (instructions.length === 0) {
          throw new Error("No valid instructions after processing");
        }

        signature = await lazorkitSignAndSend({
          instructions,
          transactionOptions: {
            computeUnitLimit: 600_000,
          },
        });
      } else {
        // Normal swap via wallet adapter
        const connection = new Connection(LAZORKIT_CONFIG.RPC_URL);
        const { blockhash } = await connection.getLatestBlockhash();
        
        tx.recentBlockhash = blockhash;
        tx.feePayer = walletPubkey;
        
        signature = await sendTransaction(tx, connection);
        
        // Wait for confirmation
        await connection.confirmTransaction(signature, "confirmed");
      }

      setTxSignature(signature);
      setInputAmount("");
      setOutputAmount("");
      setQuoteResponse(null);
      onSwapComplete?.();
    } catch (err: unknown) {
      console.error("Swap failed:", err);
      
      const errorMessage = err instanceof Error ? err.message : String(err);
      
      // Handle user cancellation
      if (
        errorMessage.toLowerCase().includes("cancel") ||
        errorMessage.toLowerCase().includes("reject") ||
        errorMessage.toLowerCase().includes("signing failed")
      ) {
        setError(null);
      } else if (errorMessage.includes("pool") || errorMessage.includes("liquidity")) {
        setError("Swap failed: Pool may be imbalanced on devnet. Try swapping in the other direction.");
      } else {
        setError(errorMessage || "Swap failed");
      }
    } finally {
      setSwapping(false);
    }
  };

  return (
    <div className="space-y-2 pt-2">
      {/* Input Token */}
      <div className="space-y-1.5">
        <div className="flex justify-between">
          <label className="text-sm text-text-muted">
            {TOKENS[inputToken].icon} {inputToken}
          </label>
          <span className="text-xs text-text-muted">
            Balance: {inputBalance.toFixed(inputToken === "SOL" ? 4 : 2)} {inputToken}
          </span>
        </div>
        <input
          type="number"
          value={inputAmount}
          onChange={(e) => setInputAmount(e.target.value)}
          placeholder="0.00"
          disabled={swapping}
          step="0.000001"
          min="0"
          className="w-full px-4 py-3 bg-elevated border border-white/10 rounded-xl text-text-primary font-mono text-sm placeholder:text-text-muted focus:outline-none focus:border-accent/50 disabled:opacity-50 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
        />
      </div>

      {/* Flip Button */}
      <div className="flex justify-center py-1">
        <button
          onClick={handleFlip}
          disabled={swapping}
          className="p-2 bg-surface border border-white/10 rounded-xl text-text-muted hover:text-text-primary hover:bg-elevated transition-colors disabled:opacity-50"
        >
          <ArrowUpDown size={18} />
        </button>
      </div>

      {/* Output Token */}
      <div className="space-y-1.5">
        <div className="flex justify-between">
          <label className="text-sm text-text-muted">
            {TOKENS[outputToken].icon} {outputToken}
          </label>
          <span className="text-xs text-text-muted">
            Balance: {outputBalance.toFixed(outputToken === "SOL" ? 4 : 2)} {outputToken}
          </span>
        </div>
        <div className="w-full px-4 py-3 bg-elevated border border-white/10 rounded-xl text-text-primary font-mono text-sm">
          {quoteLoading ? (
            <span className="text-text-muted animate-pulse">Loading...</span>
          ) : outputAmount ? (
            <span>~{outputAmount}</span>
          ) : (
            <span className="text-text-muted">0.00</span>
          )}
        </div>
      </div>

      {/* Quote Details */}
      {quoteResponse && (
        <div className="flex justify-between text-xs text-text-muted px-1">
          <span>Price Impact</span>
          <span className={quoteResponse.data.priceImpactPct > 1 ? "text-yellow-500" : ""}>
            {formatPriceImpact(quoteResponse.data.priceImpactPct)}
          </span>
        </div>
      )}

      {/* Swap Button */}
      <button
        onClick={handleSwap}
        disabled={!canSwap}
        className="w-full h-10 bg-white text-primary font-medium rounded-xl hover:scale-[1.02] active:scale-100 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2"
      >
        {swapping ? (
          <>
            <Loader2 size={16} className="animate-spin" />
            Swapping...
          </>
        ) : quoteLoading ? (
          "Getting Quote..."
        ) : isLazorkitWallet ? (
          "Swap (Gasless)"
        ) : (
          "Swap"
        )}
      </button>

      {/* Gas Info */}
      <p className="text-xs text-text-muted text-center">
        {isLazorkitWallet ? (
          <>✨ <span className="text-pnl-green">Gasless</span> — Lazorkit pays all fees</>
        ) : (
          <>💳 <span className="text-text-secondary">Normal gas fees apply</span></>
        )}
      </p>

      {/* Devnet Warning */}
      <p className="text-xs text-yellow-500/70 text-center">
        ⚠️ Devnet pools may be imbalanced. If swap fails, try the other direction.
      </p>

      {/* Error */}
      {error && (
        <div className="p-3 bg-pnl-red/10 border border-pnl-red/30 rounded-xl">
          <p className="text-sm text-pnl-red">{error}</p>
        </div>
      )}

      {/* Success */}
      {txSignature && (
        <div className="p-3 bg-pnl-green/10 border border-pnl-green/30 rounded-xl">
          <div className="flex items-center justify-between">
            <p className="text-sm text-pnl-green">Swap successful!</p>
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
    </div>
  );
}
