# Changelog

All notable changes to PNLdotfun will be documented in this file.

Format based on [Keep a Changelog](https://keepachangelog.com/).

---

## [Unreleased]

### Added
- Project scaffolding (Next.js + Tailwind + Framer Motion)
- README with project overview
- Issue tracking system (`docs/issues/`)
- `001_wallet_connection.md` - Wallet connection spec with Lazorkit + Wallet Adapter
- **Wallet connection with Lazorkit passkey + Solana Wallet Adapter**
  - `WalletProvider` with Lazorkit registration
  - `ConnectWallet` component (wallet icon → address + logout)
  - Buffer polyfill for Next.js SSR

### Planned
- [x] Wallet connection (Lazorkit passkey + traditional wallets)
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
