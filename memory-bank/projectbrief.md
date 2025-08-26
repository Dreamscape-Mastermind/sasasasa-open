# Project Brief

Sasasasa Open is a Next.js 15 (App Router) TypeScript application for event discovery, ticketing, and on-site check-in with Web3 capabilities. The app integrates with a backend API for accounts, events, payments, and promotions, and uses Unlock Protocol–compatible smart contracts for on-chain ticketing.

Primary goals:
- Ship a performant, maintainable frontend with clear data-flow and error handling
- Provide secure auth via email OTP and Web3 (wallet-based), with RBAC
- Offer event management dashboards and customer experiences optimized for mobile and desktop
- Integrate on-chain features (minting, scanning, checking in) with a reliable UX

Key non-goals:
- Building a separate backend here (we consume an external API)
- Implementing a full blockchain indexer inside the app
