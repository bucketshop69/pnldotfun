# PNL.fun

**Paste a Solana transaction. See your P&L. Share it.**

PNL.fun is a trading terminal style visualizer that takes any Solana transaction signature and generates a beautiful, shareable Image card showing your Profit/Loss.

It is built to demonstrate the future of Solana UX — **Seedless Onboarding** and **Gasless Transactions** — powered by [Lazorkit](https://lazorkit.com).

---

## 📖 Documentation & Implementation

We have written detailed tutorials explaining exactly how the Lazorkit integration works specifically for this project:

### 1. [Passkey Authentication Implementation](./docs/tutorials/01-passkey-wallet-setup.md)

How we implemented the "Connect with FaceID" flow using `useLazorkitWallet` to replace traditional wallet adapters.

### 2. [Gasless Transactions Guide](./docs/tutorials/02-gasless-transactions.md)

How we set up the Paymaster to sponsor USDC transfers and how to handle SPL tokens with Smart Wallet PDAs.

### 🧠 Implementation Specs (PRD)

Follow our thought process and design decisions through these implementation specifications:

- **[Custom Wallet Modal Design](./docs/issues/002_custom_wallet_modal.md)**: Designing a premium, unified modal that supports both traditional wallets and Passkeys.
- **[Gasless Transfer Logic](./docs/issues/003_wallet_details_gasless_transfer.md)**: Technical breakdown of the gasless transfer implementation and state management.
- **[Zero-Cost Swaps](./docs/issues/004_gasless_raydium_swap.md)**: Exploration of implementing gasless Raydium swaps using the Lazorkit Paymaster.

---

## ⚡ Features

- **Instant Onboarding**: Users create a wallet in 2 seconds using FaceID/TouchID (Lazorkit).
- **Shareable Cards**: Auto-generated gradient cards for your best (or worst) trades.
- **Gasless Transfers**: Users can move funds without holding SOL.


---

## 🚀 Quick Start Guide

### 1. Prerequisites

- Node.js 18+
- `pnpm` (recommended) or `npm`

### 2. Installation

```bash
# Clone the repo
git clone https://github.com/bucketshop69/pnldotfun.git

# Install dependencies
cd pnldotfun
pnpm install
```

### 3. Environment Setup

The project comes pre-configured for **Solana Devnet**.
Configuration is located in `apps/web/src/lib/config.ts`.

> **Note**: No `.env` file is required to get started! We use public Devnet endpoints for this demo to ensure it works out-of-the-box.

### 4. Run the Dev Server

```bash
pnpm dev:web
```
Open [http://localhost:3000](http://localhost:3000) to see the app.

---

## 🛠 SDK Integration Details

### Provider Setup

We wrap our application in `LazorkitProvider` alongside the standard Solana Wallet Adapter. This allows us to support **BOTH** traditional wallets (Phantom, Solflare) and biometric wallets simultaneously.

See: `apps/web/src/providers/WalletProvider.tsx`

```typescript
<LazorkitProvider 
    config={{
        rpcUrl: "https://api.devnet.solana.com",
        paymaster: { url: "..." }
    }}
>
    <WalletProvider>
        {children}
    </WalletProvider>
</LazorkitProvider>
```

### Key Components

- **`PasskeySection.tsx`**: Handles the biometric login UI.
- **`TransferForm.tsx`**: Demonstrates the logic for switching between gasless (Lazorkit) and paid (Standard) transactions.

---

## 📝 Project Structure

```
apps/web/
├── src/
│   ├── components/wallet/
│   │   ├── PasskeySection.tsx   # <-- LOGIN LOGIC
│   │   ├── TransferForm.tsx     # <-- TRANSACTION LOGIC
│   │   └── ...
│   ├── providers/
│   │   └── WalletProvider.tsx   # <-- SDK CONFIG
│   └── lib/
│       └── config.ts            # <-- ENDPOINTS
docs/
└── tutorials/                   # <-- GUIDES
```

---

*Verified working on Solana Devnet - Jan 2026*
