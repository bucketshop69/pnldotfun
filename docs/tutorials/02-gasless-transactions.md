# Tutorial: Triggering a Gasless Transaction on Solana

One of Lazorkit's most powerful features is **Gasless Transactions**. This means your users can interact with the blockchain (e.g., send USDC) without holding any SOL for network fees. The Lazorkit Paymaster covers the cost.

## Concept: The Paymaster

In a traditional Solana transaction, the user's wallet is the `feePayer`. In a Lazorkit transaction, the `feePayer` is replaced by the **Paymaster**.

## Implementation Guide

We implemented this in our `TransferForm.tsx`. Here is how to construct a gasless transfer.

### 1. Setup the Transfer Instruction

The actual token transfer instruction is standard SPL Token code. It doesn't change whether you use Lazorkit or a normal wallet.

```typescript
import { createTransferInstruction } from "@solana/spl-token";

// Standard Solana instruction
const transferIx = createTransferInstruction(
  senderAta,      // From
  recipientAta,   // To
  walletPubkey,   // Owner/Signer
  amount          // Amount in smallest unit
);
```

### 2. Signing with Lazorkit (Gasless)

Instead of building a `Transaction` object and asking a wallet adapter to sign it, we use the `signAndSendTransaction` method from the Lazorkit SDK.

**Critical Difference:** We pass the *instructions array* directly. The SDK handles the transaction construction and assigning the Paymaster as the fee payer.

```typescript
import { useWallet as useLazorkitWallet } from "@lazorkit/wallet";

// Inside component
const { signAndSendTransaction } = useLazorkitWallet();

const handleTransfer = async () => {
    // ... create instructions ...

    // ⚡️ MAGIC HAPPENS HERE
    // The SDK automatically routes this through the Paymaster
    const signature = await signAndSendTransaction({ 
        instructions: [transferIx] 
    });

    console.log("Transaction confirmed:", signature);
};
```

### 3. Handling "OwnerOffCurve"

Lazorkit wallets are **PDAs (Program Derived Addresses)**, not standard Keypairs.
When interacting with SPL tokens (getting ATAs), you **MUST** specify `allowOwnerOffCurve: true`.

```typescript
// ✅ CORRECT
const senderAta = await getAssociatedTokenAddress(
  USDC_MINT, 
  walletPubkey,
  true // <--- Critical for Smart Wallets!
);

// ❌ WRONG (Will throw "Invalid owner" error)
const senderAta = await getAssociatedTokenAddress(USDC_MINT, walletPubkey);
```

## Summary of Differences

| Feature | Traditional Wallet | Lazorkit Smart Wallet |
|BC|---|---|
| **Fee Payer** | User (SOL required) | Paymaster (0 SOL required) |
| **Signing** | `adapter.sendTransaction(tx)` | `lazorkit.signAndSendTransaction({ instructions })` |
| **Account Type** | System Account (Curve) | PDA (Off-Curve) |

By checking `isLazorkitWallet` in our code, we dynamically switch between these two flows, giving users the best of both worlds.
