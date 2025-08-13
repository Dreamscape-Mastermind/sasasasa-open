# System Patterns

Architecture:
- Next.js 15 App Router (`src/app`) with nested routes and layouts
- Client state via React Contexts and `@tanstack/react-query`
- Service layer using Axios with interceptors (`src/services/api.service.ts`)
- UI via TailwindCSS and Radix primitives
- Web3 via `@reown/appkit` + `viem` and Unlock ecosystem
- Hardhat for solidity contracts and scripts

Patterns:
- API client singleton with robust error handling and token refresh
- Query caching tuned for performance and reduced refetching
- Providers composed in `src/providers/AppProviders.tsx`
- Feature-based and domain-driven directories under `src/components`, `src/services`, `src/types`
- Environment-driven configuration (e.g., `NEXT_PUBLIC_SASASASA_API_URL`)

Security:
- JWT storage in cookies via `cookieService`
- 401 handling triggers refresh or redirect to `/login`
- Role-based route guards and hooks

Performance:
- Next.js experimental `optimizePackageImports`
- Tailwind purge content set for all app areas
- Image optimization with remote patterns

DevOps:
- PM2 ecosystem configs for production and staging
- `.env.*` for environment separation
