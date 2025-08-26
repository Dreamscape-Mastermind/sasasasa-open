# Active Context

Current focus:
- Stabilize auth flows (OTP + wallet) and token refresh UX
- Harden API error surfaces using `ApiError` and toast patterns
- Improve dashboard performance and perceived latency

Recent changes:
- Query client defaults tuned for fewer refetches
- Next.js images remote patterns set for prod/staging
- Web3 config using `@reown/appkit` scrollSepolia

Next steps:
- Consolidate service methods to use `apiClient` consistently
- Add loading skeletons for slow lists and charts
- Audit environment variables and update `.env.local.example`

Open questions:
- Are we expanding chains beyond scrollSepolia?
- What metrics define "fast enough" for check-in scans?
