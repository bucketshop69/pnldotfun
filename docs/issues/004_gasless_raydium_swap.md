# 004: Gasless Raydium Swap

## Goal
Add **gasless token swap** functionality using Raydium DEX, demonstrating Lazorkit's ability to integrate with existing Solana protocols while maintaining gasless UX. Also support traditional wallets for normal swaps.

## Features Implemented

1. **Dual Mode Support**:
   - **Gasless**: For Lazorkit wallets (Passkey), uses Lazorkit paymaster.
   - **Normal**: For traditional wallets, uses standard wallet adapter and user pays gas.

2. **Integration with Raydium API**:
   - Fetches live quotes from Raydium Devnet API (`https://api-v3-devnet.raydium.io`).
   - Uses `LEGACY` transaction version for compatibility.
   - Handles quote parsing and transaction building.

3. **Lazorkit Specifics**:
   - Filters out `ComputeBudgetProgram` instructions (handled by paymaster).
   - Adds smart wallet to all instruction keys (required by `execute_cpi`).

4. **UI Improvements**:
   - Compact Swap UI integrated into Wallet Details Modal.
   - Auto-fetching of quotes with debounce.
   - Token flip functionality.
   - Price impact and balance display.
   - Aligned with design system (Token inputs, buttons).

---

## Technical Implementation

### Components
- `SwapForm.tsx`: Main swap logic and UI. Handles both gasless/normal execution paths.
- `lib/raydium.ts`: Helper functions for Raydium API interaction (getQuote, buildTx, processForLazorkit).

### Key Integration Points

**1. Request Legacy Transactions**
Raydium API is called with `txVersion: 'LEGACY'` to ensure compatibility with Lazorkit's `execute_cpi`.

**2. Pass Full Quote Response**
The `buildSwapTransaction` function passes the *entire* quote response object (including `id`, `success`, `version`, `data`) to the Raydium transaction API, not just the data payload.

**3. ATA Handling**
Strictly calculates Associated Token Account (ATA) addresses for input/output tokens (USDC) and passes them as `inputAccount` and `outputAccount` to the transaction API.

**4. Lazorkit Transaction Processing**
```typescript
// Filter out compute budget
const instructions = tx.instructions.filter(
  (ix) => !ix.programId.equals(ComputeBudgetProgram.programId)
);

// Add smart wallet to all instructions
instructions.forEach((ix) => {
  if (!ix.keys.some(k => k.pubkey.equals(smartWallet))) {
    ix.keys.push({ pubkey: smartWallet, isSigner: false, isWritable: false });
  }
});
```

---

## Acceptance Criteria Status

- [x] User can select from/to tokens (SOL ↔ USDC)
- [x] Quote fetched from Raydium API on input
- [x] Shows estimated output amount
- [x] Shows price impact and rate
- [x] Swap executes without ETH/SOL gas fee (for Lazorkit users)
- [x] Normal swap works for traditional wallets
- [x] Transaction signature displayed
- [x] Error handling for failed swaps (imbalanced pools, cancellations)
- [x] Loading states during quote/swap

---

## Notes
- **Devnet Pools**: Raydium Devnet pools can sometimes be imbalanced or empty. If a swap fails with a generic error or "No liquidity", try swapping in the opposite direction (e.g., if SOL->USDC fails, try USDC->SOL).
- **Environment**: Requires `NEXT_PUBLIC_RP_ID` and HTTPS for WebAuthn (Lazorkit) to function correctly.
