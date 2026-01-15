# 003: Wallet Details Modal + Gasless Transfer

## Goal

Create a **wallet details modal** that opens when clicking the connected address. This modal:
1. Shows full wallet address with copy functionality
2. Demonstrates **gasless USDC transfer** using Lazorkit's paymaster

## Why

1. Showcases Lazorkit's killer feature: **gasless transactions**
2. Users can send USDC without holding any SOL for gas
3. Judges see practical, real-world Lazorkit integration
4. Completes the "account abstraction" story for the bounty

---

## The Game Changer: Gasless Transactions

Traditional Solana experience:

- ❌ User needs SOL for gas
- ❌ Must buy SOL on exchange first
- ❌ Friction = user drop-off

**With Lazorkit Paymaster:**

- ✅ User only needs USDC
- ✅ Lazorkit pays the gas
- ✅ User signs once, pays $0 gas
- ✅ Web2-like UX

```typescript
const signature = await signAndSendTransaction({
  instructions: [transferIx],
});
// ✨ Transaction complete - user paid $0 in gas
```

---

## Design

### Trigger

Click on connected wallet address (e.g., `7xKp...3mNq`) → Opens modal

### Modal Layout (Compact)

```
┌─────────────────────────────────────────────────────────┐
│              Your Wallet                    ⚠️ Devnet [×]│
├─────────────────────────────────────────────────────────┤
│                                                         │
│  🔐 Passkey Wallet  (or 👛 Phantom/Solflare)            │
│                                                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │ 7xKpR9qLmN...vWz3mNqJKL                    [📋] │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
│  ◎ 0.45 SOL    |    💵 12.50 USDC                       │
│                                                         │
│  ┌─────────────────┬─────────────────┐                  │
│  │   💸 Transfer   │   🔄 Swap       │  ← Tabs          │
│  └─────────────────┴─────────────────┘                  │
│  ════════════════════════════════════                   │
│                                                         │
│  Recipient:                                             │
│  ┌─────────────────────────────────────────────────┐   │
│  │ Enter Solana address...                         │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
│  Amount:                          Available: 12.50 USDC │
│  ┌─────────────────────────────────────────────────┐   │
│  │ 0.50                          [MAX] [💸 Send]   │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
│  💡 Passkey: Gasless! | Traditional: Normal gas fees    │
│                                                         │
│  ────────────────────────────────────────────────────── │
│  [🔌 Disconnect]                                        │
└─────────────────────────────────────────────────────────┘
```

### Tab: Transfer (This Issue - 003)
- Send USDC to any Solana address
- Gasless for Passkey wallets

### Tab: Swap (Issue 004)
- Swap tokens via Raydium
- Placeholder UI: "Coming soon" or implement in 004
- See `004_gasless_raydium_swap.md`

### Confirmation Dialog (Before Sending)

```
┌─────────────────────────────────────────────────────────┐
│              Confirm Transfer                        [×]│
├─────────────────────────────────────────────────────────┤
│                                                         │
│  You are about to send:                                 │
│                                                         │
│  💵 0.50 USDC                                           │
│                                                         │
│  To:                                                    │
│  8yPr...4kLm                                            │
│                                                         │
│  Gas: $0.00 (Gasless)  OR  Gas: ~0.00005 SOL            │
│                                                         │
│  ┌────────────────┐  ┌────────────────┐                │
│  │     Cancel     │  │    Confirm     │                │
│  └────────────────┘  └────────────────┘                │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

## Features

### 1. Wallet Info
- Wallet type indicator (🔐 Passkey or 👛 Traditional wallet name)
- Full address with copy button
- **Devnet indicator** in header

### 2. Balance Display
- SOL balance (◎ symbol)
- USDC balance (💵 symbol)
- Real-time from blockchain

### 3. USDC Transfer
- Recipient address input (validated)
- Amount input with MAX button
- **Passkey wallet** → Gasless via Lazorkit paymaster
- **Traditional wallet** → Normal tx signing (user pays gas)
- Confirmation dialog before sending

### 4. Disconnect
- Disconnect button at bottom

> **Note:** Swap functionality will be in `004_gasless_raydium_swap.md`

---

## Technical Implementation

### USDC Token Info (Devnet)

```typescript
// Devnet USDC
const USDC_MINT = new PublicKey("4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU");
const USDC_DECIMALS = 6;
```

### Fetch Balances

```typescript
import { getAccount, getAssociatedTokenAddress } from "@solana/spl-token";

// Get SOL balance
const solBalance = await connection.getBalance(walletPubkey);
const solBalanceFormatted = solBalance / LAMPORTS_PER_SOL;

// Get USDC balance
const usdcAta = await getAssociatedTokenAddress(USDC_MINT, walletPubkey);
try {
  const tokenAccount = await getAccount(connection, usdcAta);
  const usdcBalance = Number(tokenAccount.amount) / 10 ** USDC_DECIMALS;
} catch {
  // Token account doesn't exist = 0 balance
  const usdcBalance = 0;
}
```

### Dual Wallet Transfer Logic

```typescript
import { createTransferInstruction, getAssociatedTokenAddress } from "@solana/spl-token";
import { useWallet as useLazorkitWallet } from "@lazorkit/wallet";
import { useWallet as useSolanaWallet } from "@solana/wallet-adapter-react";

// Detect wallet type
const isLazorkitWallet = !!lazorkitWallet.smartWalletPubkey;

// Build transfer instruction (same for both)
const senderAta = await getAssociatedTokenAddress(USDC_MINT, walletPubkey);
const recipientAta = await getAssociatedTokenAddress(USDC_MINT, recipientPubkey);

const transferIx = createTransferInstruction(
  senderAta,
  recipientAta,
  walletPubkey,
  amount * 10 ** USDC_DECIMALS,
);

// Send based on wallet type
if (isLazorkitWallet) {
  // GASLESS: Lazorkit paymaster pays gas
  const signature = await lazorkitWallet.signAndSendTransaction({
    instructions: [transferIx],
  });
} else {
  // TRADITIONAL: User pays gas via Wallet Adapter
  const tx = new Transaction().add(transferIx);
  const signature = await solanaWallet.sendTransaction(tx, connection);
}
```

### Handle Missing Token Account

If recipient doesn't have a USDC token account, create one:

```typescript
import { createAssociatedTokenAccountInstruction } from "@solana/spl-token";

// Check if recipient ATA exists
const recipientAtaInfo = await connection.getAccountInfo(recipientAta);

const instructions = [];

if (!recipientAtaInfo) {
  // Create ATA for recipient (payer = paymaster via Lazorkit)
  instructions.push(
    createAssociatedTokenAccountInstruction(
      smartWalletPubkey, // payer
      recipientAta,      // ata
      recipientPubkey,   // owner
      USDC_MINT,         // mint
    )
  );
}

instructions.push(transferIx);

const signature = await signAndSendTransaction({ instructions });
```

---

## Component Structure

```
src/components/wallet/
├── WalletButton.tsx         # Modify: click address opens WalletDetailsModal
├── WalletDetailsModal.tsx   # NEW: Main modal container
├── AddressDisplay.tsx       # NEW: Address with copy button
├── BalanceDisplay.tsx       # NEW: SOL + USDC balances
├── TransferForm.tsx         # NEW: USDC transfer form (works for both wallet types)
├── ConfirmTransferModal.tsx # NEW: Confirmation dialog
└── hooks/
    └── useBalances.ts       # NEW: Hook for fetching SOL + USDC balances
```

---

## Implementation Steps

### Step 1: Create AddressDisplay component
- Show full address
- Copy to clipboard button
- "Copied!" feedback

### Step 2: Create GaslessTransfer component
- Recipient input (validate Solana address)
- Amount input (validate number)
- Send button
- Loading/success/error states
- Uses `signAndSendTransaction`

### Step 3: Create TransactionResult component
- Shows signature
- Links to Solana Explorer

### Step 4: Create WalletDetailsModal
- Combines all components
- Disconnect button

### Step 5: Modify WalletButton
- Click on address opens WalletDetailsModal

---

## Acceptance Criteria

### Core
- [ ] Clicking connected address opens wallet details modal
- [ ] Modal shows wallet type (Passkey or Traditional wallet name)
- [ ] Full wallet address displayed with copy button
- [ ] Devnet indicator visible in modal header

### Balances
- [ ] SOL balance displayed and accurate
- [ ] USDC balance displayed and accurate
- [ ] Balances update after transfer

### Transfer
- [ ] User can enter recipient address (validated)
- [ ] User can enter USDC amount with MAX button
- [ ] **Passkey wallet**: Transfer is gasless (user pays $0)
- [ ] **Traditional wallet**: Normal tx signing (user pays gas)
- [ ] Confirmation dialog shows before sending
- [ ] Transaction signature displayed with Explorer link
- [ ] Error handling for: invalid address, insufficient balance, tx failure

### General
- [ ] Disconnect button works
- [ ] Modal closes properly (X button, backdrop click)

---

## Testing Notes

### Passkey Wallet (Gasless)
1. **Get devnet USDC**: https://faucet.circle.com/
2. **Test with no SOL**: Transfer should succeed (Lazorkit pays gas)

### Traditional Wallet (Phantom/Solflare)
1. Connect via traditional wallet
2. **Must have SOL**: Transfer requires gas
3. Verify normal signing flow works

---

## Dependencies

```bash
pnpm add @solana/spl-token
```

---

## References

- [Lazorkit Cookbook - Gasless Transfer](https://github.com/lazor-kit/lazorkit-cookbook/tree/main/app/app/recipes/02-gasless-transfer)
- [Circle USDC Faucet](https://faucet.circle.com/)
- [SPL Token Library](https://spl.solana.com/token)
