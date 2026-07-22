# AI Agent Guidelines for Invobid SPA

React + TypeScript + Vite frontend for the Invobid invoice bidding platform.

## Quick Navigation

- Setup, environment, and deployment: [README.md](README.md)
- Form implementation workflow: [.github/skills/add-form/SKILL.md](.github/skills/add-form/SKILL.md)
- React diagnostics workflow: [.github/skills/react-doctor/SKILL.md](.github/skills/react-doctor/SKILL.md)

## Build and Test Commands

```bash
npm install
npm run dev
npm run build
npm run test
npm run lint
npm run doctor
```

Use `npm run lint-fix` for autofixable lint issues and `npm run test:watch` for local test loops.

## Architecture Boundaries

```text
src/pages/       Route-level UI (admin, user, marketplace, dashboard, profile)
src/services/    API client functions by domain
src/lib/         Shared client primitives (fetchApi, socket, formatters, metrics)
src/components/  App components + shadcn/ui primitives
src/contexts/    Auth and locale global state
src/hooks/       Context access + cross-cutting hooks
src/types/       Shared domain and API response types
```

Prefer extending the existing layer instead of introducing a parallel abstraction.

## Core Conventions

### Data access and networking

- Always use `fetchApi` from `src/lib/fetchApi.ts` for HTTP requests.
- Do not call `fetch` directly in pages/components/services.
- Use Socket.IO only where already established for bid placement (`src/services/bid.api.ts` + `src/lib/socket.io.ts`).

### UI and forms

- Use existing shadcn/ui primitives in `src/components/ui`; do not add a second component library.
- For new forms, follow `.github/skills/add-form/SKILL.md` (react-hook-form + zod + Controller + Field patterns).

### Routing, auth, and state

- Keep protected routes wrapped with `ProtectedRoute` and role checks (`userType`) in route definitions.
- Access auth state through `useLoggedInUser()` / `useLogout()` and locale via `useLocale()`.

### Imports and type contracts

- Use the `@/` alias for internal imports (configured in `vite.config.ts` and `tsconfig.json`).
- Keep frontend formulas in `src/lib/auction-metrics.ts` aligned with backend behavior when auction calculations change.

## Testing and Diagnostics

- Unit tests: Vitest under `test/**`.
- For final checks or triage, use `.github/skills/react-doctor/SKILL.md` and run `npm run doctor`.
- When changing behavior, update or add tests close to the affected area (`test/lib`, `test/components`, `test/pages`).

## Common Pitfalls

- Bypassing `fetchApi` breaks shared auth/error/toast behavior.
- Mixing direct state with context state causes auth/locale inconsistencies.
- Editing auction metric formulas without backend parity causes UI drift.
- Introducing non-shadcn UI primitives creates style and maintenance inconsistency.

## Session History Note

Current session-history data for this workspace is sparse. These instructions are based on repository conventions and existing docs. Run `/chronicle improve` after a few SPA coding sessions to refine this file from real friction patterns.
