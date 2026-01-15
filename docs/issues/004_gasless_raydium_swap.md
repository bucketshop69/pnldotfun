# 004: Gasless Raydium Swap

## Goal

Add **gasless token swap** functionality using Raydium DEX, demonstrating Lazorkit's ability to integrate with existing Solana protocols while maintaining gasless UX.

## Why

1. Shows Lazorkit works with real DeFi protocols (not just simple transfers)
2. Demonstrates advanced integration patterns
3. Practical use case for PNL.fun - users could swap profits
4. Impressive for bounty judges - "gasless DeFi"

---

## Devnet Limitations

> ⚠️ **Note**: Devnet liquidity pools can be unreliable
> - Some swap directions may fail due to imbalanced pools
> - If USDC→SOL fails, try SOL→USDC instead
> - Same code works reliably on Mainnet

---

## Design

### Location

Add swap section to the Wallet Details Modal (from PRD 003), or create separate swap page.

### UI

```
┌─────────────────────────────────────────────────────────┐
│                   Gasless Swap                          │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  Swap tokens on Raydium - no gas fees!                  │
│                                                         │
│  ┌─── From ──────────────────────────────────────────┐  │
│  │  [SOL ▼]         1.0                              │  │
│  │  Balance: 1.5 SOL                                 │  │
│  └───────────────────────────────────────────────────┘  │
│                                                         │
│                        ⇅                                │
│                                                         │
│  ┌─── To ────────────────────────────────────────────┐  │
│  │  [USDC ▼]        ~23.45                           │  │
│  │  Balance: 10.00 USDC                              │  │
│  └───────────────────────────────────────────────────┘  │
│                                                         │
│  Rate: 1 SOL = 23.45 USDC                               │
│  Price Impact: 0.12%                                    │
│  Slippage: 1%                                           │
│                                                         │
│  ┌─────────────────────────────────────────────────┐    │
│  │              💱 Swap (Gasless)                  │    │
│  └─────────────────────────────────────────────────┘    │
│                                                         │
│  💡 No SOL needed for gas! Lazorkit pays.               │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

## Technical Patterns

### Key Integration Points

From the Lazorkit Cookbook, there are specific patterns for integrating with Raydium:

#### 1. Request Legacy Transactions

```typescript
// Raydium API call
const response = await fetch(RAYDIUM_SWAP_API, {
  body: JSON.stringify({
    // ... swap params
    txVersion: 'LEGACY', // Important! Simpler than versioned txs
  }),
});
```

#### 2. Filter Compute Budget Instructions

Lazorkit manages compute budget automatically:

```typescript
import { ComputeBudgetProgram } from "@solana/web3.js";

const filteredInstructions = instructions.filter(
  (ix) => !ix.programId.equals(ComputeBudgetProgram.programId)
);
```

#### 3. Add Smart Wallet to All Instructions

Lazorkit's `execute_cpi` expects smart wallet in ALL instruction accounts:

```typescript
instructions.forEach((ix) => {
  const hasSmartWallet = ix.keys.some(
    (key) => key.pubkey.equals(smartWalletPubkey)
  );
  
  if (!hasSmartWallet) {
    ix.keys.push({
      pubkey: smartWalletPubkey,
      isSigner: false,
      isWritable: false,
    });
  }
});
```

---

## Implementation Flow

### 1. Get Quote from Raydium API

```typescript
const RAYDIUM_API_BASE = "https://api-v3.raydium.io";

const quoteResponse = await fetch(`${RAYDIUM_API_BASE}/compute/swap-base-in`, {
  method: "POST",
  body: JSON.stringify({
    inputMint: SOL_MINT,
    outputMint: USDC_MINT,
    amount: amountIn.toString(),
    slippage: 1, // 1%
    txVersion: "LEGACY",
  }),
});

const { data: quote } = await quoteResponse.json();
```

### 2. Get Swap Transaction

```typescript
const swapResponse = await fetch(`${RAYDIUM_API_BASE}/transaction/swap-base-in`, {
  method: "POST",
  body: JSON.stringify({
    wallet: smartWalletPubkey.toBase58(),
    computeUnitPriceMicroLamports: 100000,
    quoteResponse: quote,
    txVersion: "LEGACY",
  }),
});

const { data: swapTx } = await swapResponse.json();
```

### 3. Deserialize & Filter Instructions

```typescript
import { Transaction } from "@solana/web3.js";

const tx = Transaction.from(Buffer.from(swapTx.transaction, "base64"));

// Filter out compute budget (Lazorkit handles it)
const instructions = tx.instructions.filter(
  (ix) => !ix.programId.equals(ComputeBudgetProgram.programId)
);

// Add smart wallet to all instructions
instructions.forEach((ix) => {
  const hasSmartWallet = ix.keys.some(
    (key) => key.pubkey.equals(smartWalletPubkey)
  );
  if (!hasSmartWallet) {
    ix.keys.push({
      pubkey: smartWalletPubkey,
      isSigner: false,
      isWritable: false,
    });
  }
});
```

### 4. Execute Gasless Swap

```typescript
const signature = await signAndSendTransaction({
  instructions,
  transactionOptions: {
    clusterSimulation: "devnet",
  },
});
```

---

## Component Structure

```
src/components/swap/
├── SwapCard.tsx           # Main swap UI
├── TokenSelect.tsx        # Token dropdown (SOL/USDC)
├── SwapInput.tsx          # Amount input with balance
├── SwapButton.tsx         # Execute swap button
└── SwapResult.tsx         # Success/error display

src/lib/
├── raydium.ts             # Raydium API helpers
└── tokens.ts              # Token constants (mints, decimals)
```

---

## Token Constants (Devnet)

```typescript
export const TOKENS = {
  SOL: {
    symbol: "SOL",
    mint: "So11111111111111111111111111111111111111112", // Native SOL wrapped
    decimals: 9,
  },
  USDC: {
    symbol: "USDC",
    mint: "4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU",
    decimals: 6,
  },
};
```

---

## Acceptance Criteria

- [ ] User can select from/to tokens (SOL ↔ USDC)
- [ ] Quote fetched from Raydium API on input
- [ ] Shows estimated output amount
- [ ] Shows price impact and rate
- [ ] Swap executes without ETH/SOL gas fee
- [ ] Transaction signature displayed
- [ ] Error handling for failed swaps
- [ ] Loading states during quote/swap

---

## Edge Cases

1. **Insufficient balance** - Show error before attempting
2. **Pool imbalanced (devnet)** - Show helpful error message
3. **Slippage exceeded** - Retry with higher slippage
4. **Token account missing** - Create automatically

---

## Phase Approach

### Phase 1 (MVP)
- SOL → USDC swap only
- Fixed 1% slippage
- Basic UI

### Phase 2 (Enhancement)
- Bidirectional swap (SOL ↔ USDC)
- Custom slippage setting
- Price charts/history

---

## Dependencies

Already have `@solana/web3.js`. May need:

```bash
# For token balance fetching
pnpm add @solana/spl-token
```

---

## References

- [Lazorkit Cookbook - Gasless Raydium Swap](https://github.com/lazor-kit/lazorkit-cookbook/tree/main/app/app/recipes/04-gasless-raydium-swap)
- [Raydium API Docs](https://api-v3.raydium.io/docs)
- [Raydium Devnet](https://devnet.raydium.io/)
