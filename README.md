# PNLdotfun

**Paste a Solana transaction. See your P&L. Share it.**

No wallet extension. No seed phrase. Just results.

---

## What is this?

You made a trade on Solana. You want to flex it (or cry about it). 

PNLdotfun takes your transaction hash, calculates your profit/loss, and generates a beautiful animated card you can share anywhere.

## How it works

```
Paste tx hash → Parse trade → Fetch prices → Calculate P&L → Animated card → Share
```

## Tech

- **Frontend**: Next.js + Tailwind + Framer Motion
- **Auth**: Lazorkit (passkey-based, no wallet install needed)
- **Data**: Helius (tx parsing) + Jupiter (prices)

## Development

```bash
pnpm install
pnpm run dev:web
```

## Project Structure

```
apps/
  web/          # Next.js frontend
docs/
  issues/       # Implementation specs (001_xyz.md format)
packages/       # Shared code
```

## Status

🚧 Building for Lazorkit Bounty (deadline: Jan 15, 2026)

---

*Built with [Lazorkit](https://lazorkit.com) — passkey wallets for Solana*
