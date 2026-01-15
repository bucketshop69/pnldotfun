import { PublicKey, Transaction, ComputeBudgetProgram } from "@solana/web3.js";
import { DEV_API_URLS } from "@raydium-io/raydium-sdk-v2";
import { TOKENS, TokenSymbol } from "./constants";

/**
 * Raydium API endpoints
 * Using DEV_API_URLS from Raydium SDK for devnet
 */
const RAYDIUM_SWAP_HOST = DEV_API_URLS.SWAP_HOST;

export interface SwapQuoteData {
  inputAmount: string;
  outputAmount: string;
  minOutputAmount: string;
  priceImpactPct: number;
  routePlan: unknown[];
}

export interface SwapQuoteResponse {
  id: string;
  success: boolean;
  version: string;
  data: SwapQuoteData;
}

/**
 * Get swap quote from Raydium API
 * Returns the full response (needed for building transaction)
 */
export async function getSwapQuote(
  inputToken: TokenSymbol,
  outputToken: TokenSymbol,
  inputAmount: number
): Promise<SwapQuoteResponse | null> {
  if (inputAmount <= 0) return null;

  const inputMint = TOKENS[inputToken].mint.toBase58();
  const outputMint = TOKENS[outputToken].mint.toBase58();
  const amountRaw = Math.floor(inputAmount * 10 ** TOKENS[inputToken].decimals);

  try {
    const url = new URL(`${RAYDIUM_SWAP_HOST}/compute/swap-base-in`);
    url.searchParams.set("inputMint", inputMint);
    url.searchParams.set("outputMint", outputMint);
    url.searchParams.set("amount", amountRaw.toString());
    url.searchParams.set("slippageBps", "100"); // 1% slippage
    url.searchParams.set("txVersion", "LEGACY");

    console.log("[Raydium] Fetching quote from:", url.toString());
    
    const response = await fetch(url.toString());
    const data: SwapQuoteResponse = await response.json();

    console.log("[Raydium] Quote response:", data);

    if (!data.success || !data.data) {
      console.error("[Raydium] Quote failed:", data);
      return null;
    }

    return data;
  } catch (error) {
    console.error("[Raydium] Quote error:", error);
    return null;
  }
}

/**
 * Build swap transaction from Raydium API
 * Pass the full quoteResponse (the entire API response object)
 */
export async function buildSwapTransaction(
  walletAddress: string,
  inputToken: TokenSymbol,
  outputToken: TokenSymbol,
  quoteResponse: SwapQuoteResponse
): Promise<Transaction | null> {
  const inputMint = TOKENS[inputToken].mint.toBase58();
  const outputMint = TOKENS[outputToken].mint.toBase58();
  const walletPubkey = new PublicKey(walletAddress);

  try {
    // Get ATA addresses for input/output tokens (needed for SPL tokens, not SOL)
    const { getAssociatedTokenAddressSync } = await import("@solana/spl-token");
    
    const inputAccount = inputMint === TOKENS.SOL.mint.toBase58() 
      ? undefined 
      : getAssociatedTokenAddressSync(TOKENS[inputToken].mint, walletPubkey, true).toBase58();
    
    const outputAccount = outputMint === TOKENS.SOL.mint.toBase58()
      ? undefined
      : getAssociatedTokenAddressSync(TOKENS[outputToken].mint, walletPubkey, true).toBase58();

    // Pass the FULL quoteResponse object (not just .data)
    const requestBody = {
      computeUnitPriceMicroLamports: "100000",
      swapResponse: quoteResponse, // Pass the ENTIRE response object
      txVersion: "LEGACY",
      wallet: walletAddress,
      wrapSol: inputMint === TOKENS.SOL.mint.toBase58(),
      unwrapSol: outputMint === TOKENS.SOL.mint.toBase58(),
      inputAccount,
      outputAccount,
    };

    console.log("[Raydium] Building tx with:", JSON.stringify(requestBody, null, 2));

    const response = await fetch(`${RAYDIUM_SWAP_HOST}/transaction/swap-base-in`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(requestBody),
    });

    const data = await response.json();

    console.log("[Raydium] Build tx response:", data);

    if (!data.success || !data.data?.[0]?.transaction) {
      console.error("[Raydium] Build tx failed:", data);
      return null;
    }

    // Deserialize the transaction
    const txBuffer = Buffer.from(data.data[0].transaction, "base64");
    const tx = Transaction.from(txBuffer);

    return tx;
  } catch (error) {
    console.error("[Raydium] Build tx error:", error);
    return null;
  }
}

/**
 * Process Raydium transaction for Lazorkit compatibility
 * 
 * 1. Filter out ComputeBudget instructions (Lazorkit handles this)
 * 2. Add smart wallet to all instruction key lists
 */
export function processTransactionForLazorkit(
  tx: Transaction,
  smartWalletPubkey: PublicKey
) {
  // Filter out ComputeBudget instructions (Lazorkit manages compute budget)
  const instructions = tx.instructions.filter(
    (ix) => !ix.programId.equals(ComputeBudgetProgram.programId)
  );

  // Add smart wallet to instructions that don't have it
  // Lazorkit's execute_cpi expects smart wallet in ALL instruction key lists
  instructions.forEach((ix) => {
    const hasSmartWallet = ix.keys.some((key) =>
      key.pubkey.equals(smartWalletPubkey)
    );

    if (!hasSmartWallet) {
      ix.keys.push({
        pubkey: smartWalletPubkey,
        isSigner: false,
        isWritable: false,
      });
    }
  });

  return instructions;
}

/**
 * Format output amount from raw to display
 */
export function formatOutputAmount(
  rawAmount: string,
  outputToken: TokenSymbol
): number {
  const decimals = TOKENS[outputToken].decimals;
  return parseFloat(rawAmount) / 10 ** decimals;
}

/**
 * Format price impact as percentage string
 */
export function formatPriceImpact(priceImpact: number): string {
  return `${(priceImpact * 100).toFixed(2)}%`;
}
