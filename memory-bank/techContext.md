# Tech Context

Technologies:
- Next.js 15 (App Router) with TypeScript
- TailwindCSS (+ forms, typography, animate)
- Radix UI primitives and Lucide icons
- React Hook Form, Zod, React Query
- Axios API client with interceptors
- Web3: `@reown/appkit`, `viem`, `ethers`
- Unlock Protocol libs and Hardhat for contracts

Configuration:
- Path alias `@/*` -> `src/*` (see `tsconfig.json`)
- Env: `NEXT_PUBLIC_SASASASA_API_URL`, `NEXT_PUBLIC_REOWN_PROJECT_ID`
- Images: remote hosts configured in `next.config.ts`
- Query defaults set in `src/providers/AppProviders.tsx`

Constraints:
- TypeScript `strict` disabled but `strictNullChecks` enabled
- API timeouts 10s, retries limited (see `api.service.ts`)
- Single yarn workspace (uses `yarn.lock`)

Local Dev:
- `yarn dev` to run Next.js
- Contracts via Hardhat; local network 127.0.0.1:8545

Deployment:
- PM2 configs `ecosystem.config.js` and `ecosystem.staging.config.js`
- Nginx templates in `nginx/`
