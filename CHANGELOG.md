# Changelog

All notable changes to PNLdotfun will be documented in this file.

Format based on [Keep a Changelog](https://keepachangelog.com/).

<!-- markdownlint-disable MD024 -->

---

## [Unreleased]

### Added

- Project scaffolding (Next.js + Tailwind + Framer Motion)
- README with project overview
- Issue tracking system (`docs/issues/`)
- `001_wallet_connection.md` - Wallet connection spec with Lazorkit + Wallet Adapter
- `002_custom_wallet_modal.md` - Custom wallet modal spec
- `003_wallet_details_gasless_transfer.md` - Wallet details modal + gasless transfer spec
- **Wallet connection with Lazorkit passkey + Solana Wallet Adapter**
  - `WalletProvider` with Lazorkit registration + LazorkitProvider
  - Buffer polyfill for Next.js SSR
- **Custom Wallet Modal (002)**
  - `WalletButton` - Wallet icon / connected address + disconnect
  - `WalletModal` - Split-view modal container
  - `PasskeySection` - Left side with Lazorkit passkey option
  - `WalletList` / `WalletListItem` - Right side with traditional wallets
  - Dual wallet support (Lazorkit native + Solana Wallet Adapter)
  - Responsive design (stacks on mobile)
- **Wallet Details Modal + Gasless Transfer (003)**
  - `WalletDetailsModal` - Tabbed modal with Transfer/Swap views
  - `AddressDisplay` - Wallet address with copy + explorer link
  - `BalanceDisplay` - SOL + USDC balances with refresh
  - `TransferForm` - USDC transfer with gasless/traditional wallet support
  - `ConfirmTransferModal` - Transfer confirmation dialog
  - `useBalances` hook - Efficient balance fetching
  - Devnet USDC support with proper PDA (off-curve) handling
  - Gasless transfers via Lazorkit paymaster
  - Traditional wallet transfers with normal gas fees
  - Design system aligned buttons and UI elements

### Changed

- Replaced old `ConnectWallet` component with new wallet component system
- `WalletButton` now opens details modal when connected

### Planned

- [x] Wallet connection (Lazorkit passkey + traditional wallets)
- [x] Custom wallet modal with split view
- [x] Wallet details modal with gasless USDC transfer
- [ ] Gasless Raydium swap (004)
- [ ] Transaction parser (Jupiter swaps)
- [ ] P&L card component (animated)
- [ ] Share/export functionality

---

## [0.0.1] - 2026-01-12

### Added

- Initial monorepo setup with pnpm workspaces
- `apps/web` - Next.js 16 frontend
- Basic project structure

---

## Legend

- **Added** - New features
- **Changed** - Changes in existing functionality
- **Deprecated** - Soon-to-be removed features
- **Removed** - Removed features
- **Fixed** - Bug fixes
- **Security** - Vulnerability fixes
