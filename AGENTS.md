# AI Agent Guidelines for Invobid SPA

React + TypeScript + Vite front-end for the Invobid invoice bidding platform.

## Quick Navigation

- **Setup & Environment**: See [README.md](README.md)
- **Backend contract**: See [invobid-api/test/e2e-spec.md](../invobid-api/test/e2e-spec.md)

## Build & Test Commands

```bash
npm run dev          # Dev server with HMR (http://localhost:5173)
npm run build        # TypeScript check + production bundle
npm run test         # Run all tests once (Vitest)
npm run test:watch   # Watch mode
npm run lint         # ESLint (no auto-fix)
npm run lint-fix     # ESLint with auto-fix
```

**Requires `.env`** — copy from `.env.template`. Must have `VITE_BASE_URL`, `VITE_SOCKET_URL`, `VITE_APP_NAME`.

## Architecture

```
src/
├── App.tsx           # All route definitions
├── main.tsx          # Provider tree: BrowserRouter > LocaleProvider > AuthProvider > App
├── pages/            # One folder per route (admin/, user/, marketplace/, etc.)
├── components/ui/    # shadcn-style Radix UI primitives (CVA variants)
├── services/         # One file per API domain (auction.api.ts, bid.api.ts, …)
├── lib/              # Pure utilities (fetchApi.ts, format-date.ts, auction-metrics.ts)
├── contexts/         # Auth + Locale (each split into .ts and .tsx — see pitfalls)
├── hooks/            # use-loggedInUser.ts, use-logout.ts, use-locale.ts
└── types/            # Domain types (Auction.ts, User.ts, Response.ts, …)
```

**Tests** live in `test/` (outside `src/`) — see [Testing Patterns](#testing-patterns).

## Stack

| Category | Library |
|---|---|
| Framework | React 19 |
| Build | Vite 7 + SWC |
| Styling | Tailwind CSS 4 |
| UI | Radix UI + shadcn-style wrappers in `src/components/ui/` |
| Routing | react-router v7 (declarative `<Routes>/<Route>`) |
| Forms | react-hook-form 7 + zod 4 + `@hookform/resolvers` |
| Tables | @tanstack/react-table 8 |
| Notifications | sonner 2 (`toast`) |
| Real-time | socket.io-client 4 |
| Testing | Vitest 4 + @testing-library/react + jsdom |

## Core Patterns

### API Calls

All HTTP calls use `fetchApi<T>()` from [src/lib/fetchApi.ts](src/lib/fetchApi.ts):

```ts
fetchApi<ResponseOK<Auction>>(url, { method: 'GET' }, {
  promise: 'Loading...', resolve: 'Done!', reject: 'Error message: '
})
```

- Always sends `credentials: 'include'` (JWT via HTTP-only cookie)
- Non-2xx throws the parsed JSON body
- Pass a `notification` object to show `toast.promise()` feedback
- Never set `Content-Type` manually for `FormData` — the browser sets the multipart boundary

Service files (`src/services/*.api.ts`) call `fetchApi` directly. Add new service functions there, not inline in components.

### Authentication

- JWT stored as HTTP-only cookie (set by API); user profile in `logged-in-user` cookie (JSON)
- `AuthProvider` ([src/contexts/auth.context.tsx](src/contexts/auth.context.tsx)) reads the cookie on mount and refreshes from the API
- `useLoggedInUser()` returns `User | undefined` — check `undefined`, not `null`
- `useLogout()` clears state, removes cookie, navigates to `/login`

**Route protection**: Wrap routes with `<ProtectedRoute userType={…}>`. Accepts `UserType` (`ADMIN`, `INVESTOR`) and `InvestorType` (`INDIVIDUAL`, `COMPANY`). Passing `UserType.INVESTOR` allows all investors regardless of sub-type.

### Forms

```ts
const formSchema = z.object({ field: z.string() })

const form = useForm<z.infer<typeof formSchema>>({
  resolver: zodResolver(formSchema),
  mode: 'onTouched',
  defaultValues: { field: '' }
})
```

Use `<Controller>` + the custom `<Field data-invalid={fieldState.invalid}>` component from [src/components/ui/field.tsx](src/components/ui/field.tsx) for consistent styling and error display.

### Types

Response types are in [src/types/Response.ts](src/types/Response.ts):
- `ResponseOK<T>` — `{ status: 'success', data: T }`
- `PaginatedResponse<T>` — includes `_metadata` with `total`, `page`, `limit`
- `ResponseKO` — error body thrown by `fetchApi`

User types in [src/types/User.ts](src/types/User.ts) — `User = Admin | Investor`, all enums live here.

### Breadcrumbs for Detail Pages

`lastBreadcrumb` state lives in `App.tsx` and is passed as `setLastBreadcrumb` prop to detail pages. Always call `setLastBreadcrumb(entity.name)` in detail page components or the breadcrumb will show a stale label.

## Testing Patterns

Tests in `test/` use Vitest globals (no imports needed for `describe`/`it`/`expect`). Use the `@` alias (`@/lib/...`) to import from `src/`.

**Unit tests**: Pure function tests in `test/lib/`. Example: [test/lib/format-date.test.ts](test/lib/format-date.test.ts)

**Component tests**: Use `@testing-library/react` in `test/components/ui/`. `ResizeObserver` and `matchMedia` are mocked in [test/setup.ts](test/setup.ts) — required for Radix UI and react-day-picker.

## Common Pitfalls

| Issue | Solution |
|---|---|
| Auth context split files | `AuthContext` (no JSX) in `auth.context.ts`, `AuthProvider` in `auth.context.tsx` — import from the correct file |
| Date off-by-one | Date-only fields (e.g. invoice due date) must use `parseDateOnly()` / `toDateOnlyString()` from [src/lib/format-date.ts](src/lib/format-date.ts) with `timeZone: 'UTC'`; never use `new Date('YYYY-MM-DD')` directly |
| FormData Content-Type | Never set `Content-Type` for `FormData` — the browser must set it with the multipart boundary |
| Missing `.env` | Copy `.env.template` → `.env`; all `VITE_*` vars are baked in at build time |
| Error messages not visible | Server errors surface only via `toast.error` (sonner) — no inline form errors from API responses |
| Stale breadcrumb | Call `setLastBreadcrumb` in every detail page component |
| Locale for formatting | Pass the `locale` from `useLocale()` explicitly to all `format-currency` / `format-date` helpers |

---

**Last Updated**: April 2026 | **Stack**: React 19 + Vite 7 + TypeScript 5
