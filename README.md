# Invobid SPA

React + TypeScript + Vite front-end for the Invobid invoice bidding platform.

## Local development

### Prerequisites

- [Node.js 22+](https://nodejs.org/)
- [invobid-api](../invobid-api) running locally (see its README)

### Setup

1. Install dependencies:

```sh
npm install
```

2. Copy the environment template:

```sh
cp .env.template .env
```

The default values in `.env.template` point to the local API and can be used as-is.

3. Start the development server with HMR:

```sh
npm run dev
```

App: [`http://localhost:5173`](http://localhost:5173)

### Environment variables

All variables are baked into the static build at compile time (`import.meta.env`). Changes require a rebuild.

| Variable | Default | Description |
|---|---|---|
| `VITE_BASE_URL` | `http://localhost:3000/api/v1` | API base URL |
| `VITE_SOCKET_URL` | `http://localhost:3000` | Socket.IO server URL |
| `VITE_APP_NAME` | `Invobid` | Application display name |
| `VITE_EXT_RATING_PROVIDER` | `Einforma` | External credit rating provider name |
| `VITE_SMALLEST_BID_INCREMENT_PERCENTAGE` | `0.1` | Minimum bid increment percentage |

### Other commands

```sh
npm run build      # Production build (outputs to dist/)
npm run test       # Run unit tests (Vitest)
npm run test:watch # Run unit tests in watch mode
npm run lint       # ESLint
```

---

## Code structure

### Folder directory layout

```
.github/
  ├─ skills/                          # GitHub Copilot skills for AI-assisted code generation
  └─ workflows/                       # CI/CD pipelines for testing and publishing
public/
  └─ img/                             # Static images served as-is (not bundled)
src/
  ├─ App.tsx                          # Route tree and layout wiring
  ├─ main.tsx                         # Application bootstrap (provider stack)
  ├─ index.css                        # Global styles and Tailwind base
  ├─ assets/                          # Bundled static assets (SVGs, images)
  ├─ components/
  │  ├─ color-badge.tsx               # Status badge with color variant mapping
  │  ├─ document-preview.tsx          # Inline document preview widget
  │  ├─ protected-route.tsx           # Auth guard: redirects unauthenticated or wrong-role users
  │  ├─ dark-mode/                    # ThemeProvider context + mode toggle button
  │  └─ ui/                           # shadcn/ui primitives (button, table, dialog, chart, date pickers, etc.)
  ├─ contexts/
  │  ├─ auth.context.ts               # AuthContext type definition
  │  ├─ auth.context.tsx              # AuthProvider: user state hydrated from cookie on mount
  │  ├─ locale.context.ts             # LocaleContext type definition
  │  └─ locale.context.tsx            # LocaleProvider: i18n locale, persisted to localStorage
  ├─ hooks/
  │  ├─ use-loggedInUser.ts           # Access { loggedInUser, setLoggedInUser } from AuthContext
  │  ├─ use-logout.ts                 # Clear auth state, remove cookie, redirect to /login
  │  ├─ use-locale.ts                 # Access { locale, setLocale } from LocaleContext
  │  └─ use-mobile.ts                 # Returns true when viewport width < 768 px
  ├─ layouts/
  │  ├─ layout.tsx                    # MainLayout: sidebar, breadcrumb trail, account-status alert
  │  └─ components/                   # Role-specific sidebar content, investor balance widget, user dropdown
  ├─ lib/
  │  ├─ fetchApi.ts                   # Fetch wrapper with cookie credentials, toast feedback, and downloadFile()
  │  ├─ socket.io.ts                  # Socket.IO client factory and promise-based socketEmit() helper
  │  ├─ utils.ts                      # cn() — Tailwind class merging via clsx + twMerge
  │  ├─ auction-metrics.ts            # calcDiscount / calcProfitability formulas (mirrored from backend)
  │  ├─ calculate-max-price.ts        # Derives max allowed bid price from profitability target
  │  ├─ copy-to-clipboard.ts          # Clipboard write with toast confirmation
  │  ├─ format-currency.ts            # Intl.NumberFormat currency formatter
  │  ├─ format-date.ts                # Locale-aware date/time formatters
  │  └─ format-percentage.ts          # Percentage display formatter
  ├─ pages/
  │  ├─ page.tsx                      # Public landing page
  │  ├─ login/                        # Login form page
  │  ├─ register/                     # Admin and investor registration forms
  │  ├─ logout.tsx                    # Clears session and redirects
  │  ├─ not-found.tsx                 # 404 page
  │  ├─ dashboard/                    # Investor dashboard and aggregated metrics view
  │  ├─ profile/                      # User profile, settings, and bank account form
  │  ├─ admin/                        # Admin panel: manage users, debtors, invoices, and auctions
  │  ├─ user/                         # Seller flows: manage debtors, invoices, and auctions (with create forms)
  │  └─ marketplace/                  # Investor flows: browse and bid on auctions, view purchased invoices
  ├─ services/
  │  ├─ auth.api.ts                   # Login and registration requests
  │  ├─ admin.api.ts                  # Admin user CRUD
  │  ├─ investor.api.ts               # Investor profile and status management
  │  ├─ auction.api.ts                # Auction list, detail, and lifecycle calls
  │  ├─ bid.api.ts                    # Bid queries; real-time bid placement via socketEmit()
  │  ├─ debtor.api.ts                 # Debtor CRUD and lookup
  │  ├─ invoice.api.ts                # Invoice CRUD and document upload
  │  ├─ bank-account.api.ts           # Bank account update
  │  ├─ document.api.ts               # Document download and preview URLs
  │  └─ metric.api.ts                 # Aggregated metric queries
  └─ types/
     ├─ User.ts                       # Admin / Investor types; UserType, InvestorType, InvestorStatus enums
     ├─ Auction.ts                    # Auction type with nested Price, Discount, Profitability; AuctionStatus enum
     ├─ Invoice.ts                    # Invoice type with TransactionFee breakdown; InvoiceStatus, Currency enums
     ├─ Bid.ts                        # Bid type referencing auction and investor
     ├─ Debtor.ts                     # Debtor type; DebtorStatus enum
     ├─ Document.ts                   # Document interface; DocumentType enum
     ├─ BankAccount.ts                # Bank account reference type
     ├─ Metrics.ts                    # 15+ metric response types (balance, volume, portfolio, risk, etc.)
     └─ Response.ts                   # ResponseOK<T>, PaginatedResponse<T>, ResponseKO shared interfaces
test/
  ├─ setup.ts                         # Vitest global setup
  ├─ vitest.d.ts                      # Type extensions for test utilities
  ├─ components/ui/                   # Tests for date picker components
  ├─ lib/                             # Unit tests for lib utilities (formatting, calculations)
  └─ pages/                           # Page-level tests
```

1. `src/`: contains the main application source code.
    1. `App.tsx` / `main.tsx`: `main.tsx` bootstraps the app with the full provider stack: `BrowserRouter` → `LocaleProvider` → `AuthProvider` → `Toaster`. `App.tsx` defines the route tree. Every protected route is wrapped in `ProtectedRoute`, which accepts an optional `userType` to enforce role-based access — unauthenticated users are redirected to `/login` and wrong-role users to `/dashboard`.
    2. `components/`: contains app-specific shared components and the UI primitive library.
        - [protected-route.tsx](src/components/protected-route.tsx): auth guard component that handles loading state, authentication check, and role/type validation before rendering children.
        - `dark-mode/`: `ThemeProvider` context and the mode toggle button.
        - `ui/`: the full [shadcn/ui](https://ui.shadcn.com/) primitive library (accordion, button, dialog, table, chart, date pickers, etc.). These are the only UI primitives used throughout the app — do not introduce a second component library.
    3. `contexts/`: React context providers for cross-cutting state.
        - [auth.context.tsx](src/contexts/auth.context.tsx): `AuthProvider` initializes user state by reading a `logged-in-user` cookie on mount and fetching the full user record from the API. Access it through `useLoggedInUser()`. Log out with `useLogout()`, which clears state, removes the cookie, and navigates to `/login`.
        - [locale.context.tsx](src/contexts/locale.context.tsx): `LocaleProvider` defaults to `es-ES` and persists the selected locale to `localStorage`. Access it via `useLocale()`.
    4. `hooks/`: custom hooks that wrap context access and common side-effect patterns.
        - [use-loggedInUser.ts](src/hooks/use-loggedInUser.ts): returns `{ loggedInUser, setLoggedInUser }` from `AuthContext`.
        - [use-logout.ts](src/hooks/use-logout.ts): clears auth state, removes the cookie, and redirects to `/login`.
        - [use-locale.ts](src/hooks/use-locale.ts): returns `{ locale, setLocale }` from `LocaleContext`.
        - [use-mobile.ts](src/hooks/use-mobile.ts): returns `true` when viewport width is below the 768 px breakpoint.
    5. `layouts/`: application shell components.
        - [layout.tsx](src/layouts/layout.tsx): `MainLayout` composes the app shell — a role-aware `AppSidebar` (separate content components for admin vs investor), a breadcrumb trail passed as props, and an account-status alert dialog that warns unverified investors (pending/correction/denied states) on each navigation.
        - `components/`: role-specific sidebar content variants, investor balance widget, and user dropdown menu.
    6. `lib/`: utility functions and shared client-side logic.
        - [fetchApi.ts](src/lib/fetchApi.ts): the single HTTP entry point. Always sends credentials (cookies), optionally shows loading/success/error toasts via [sonner](https://sonner.emilkowal.ski/), and throws the parsed error body on non-OK responses. `downloadFile()` creates a blob URL download. All service files import from `fetchApi.ts` — never use `fetch` directly.
        - [socket.io.ts](src/lib/socket.io.ts): exposes `connectSocketIO()` to open a namespaced Socket.IO connection and `socketEmit()`, a promise wrapper around `socket.emit` that resolves or rejects based on server ACK callbacks. `bid.api.ts` uses this for real-time bid placement.
        - [utils.ts](src/lib/utils.ts): `cn()` merges Tailwind classes without conflicts via `clsx` + `twMerge`.
        - [auction-metrics.ts](src/lib/auction-metrics.ts): `calcDiscount` and `calcProfitability` formulas that mirror the backend's calculation logic. Keep them in sync if the backend formulas change.
        - Formatting helpers: `format-currency.ts`, `format-date.ts`, and `format-percentage.ts` provide locale-aware display functions used throughout the UI.
    7. `pages/`: route-level components grouped by role.
        - `admin/`: admin-only panel for managing platform users, debtors, invoices, and auctions.
        - `user/`: seller flows — create and manage debtors, upload invoices, and list auctions created from those invoices.
        - `marketplace/`: investor flows — browse active auctions, place bids in real time, and review purchased invoices.
        - `dashboard/` and `profile/`: shared authenticated area for aggregated metrics and account settings.
    8. `services/`: API client functions, one file per domain. Each function calls `fetchApi` (or `socketEmit` for bids) and returns typed results using the interfaces from `types/`. Never embed fetch calls in components or pages — add a function to the relevant service file instead.
    9. `types/`: shared TypeScript interfaces and enums for every domain model (`User`, `Auction`, `Invoice`, `Bid`, `Debtor`, `Document`, `BankAccount`, `Metrics`). [Response.ts](src/types/Response.ts) defines the three standard API response shapes (`ResponseOK<T>`, `PaginatedResponse<T>`, `ResponseKO`) used as return types throughout the service layer.
2. `test/`: unit tests grouped by the source area they cover (`components/ui/`, `lib/`, `pages/`). Tests are written with [Vitest](https://vitest.dev/) and run in jsdom. [test/setup.ts](test/setup.ts) provides global test utilities.
3. `vite.config.ts` / `tsconfig.json`: both configure the `@` path alias resolving to `src/`, so all internal imports use `@/` rather than relative paths.


## Production

The SPA is **not deployed standalone**. In production a pre-built Docker image is published to GitHub Container Registry and served by nginx, which also reverse-proxies `/api/` and `/socket.io/` to the NestJS container.

### Image publishing

Images are built and pushed by GitHub Actions (`.github/workflows/ci.yml`) on two events:

| Event | Image tag produced |
|---|---|
| Push to `release/vX.Y.Z` branch | `ghcr.io/joelmanasdbarrio/invobid-spa:vX.Y.Z-rc.N` |
| Push of `vX.Y.Z` git tag | `ghcr.io/joelmanasdbarrio/invobid-spa:vX.Y.Z` + `:latest` |

The publish job only runs after unit tests pass.

The production `VITE_SOCKET_URL` value is read from a GitHub Actions repository variable. Set it once in the repo settings:
**Settings → Secrets and variables → Actions → Variables → New repository variable**
- Name: `VITE_SOCKET_URL`
- Value: `https://invobid.com`

All other `VITE_*` values are hardcoded in the workflow (they are already public in the compose configuration).

See [invobid-api/README.md](../invobid-api/README.md) for the full server deployment guide.

### RC image cleanup

To avoid accumulating old release-candidate container versions in GHCR, a scheduled workflow runs from [.github/workflows/cleanup-old-images.yml](.github/workflows/cleanup-old-images.yml).

| Trigger | Behavior |
|---|---|
| Daily schedule (`0 6 * * *`) | Deletes `invobid-spa` container versions tagged like `vX.Y.Z-rc.N` when older than `RC_RETENTION_DAYS` |
| Manual trigger (`workflow_dispatch`) | Allows on-demand cleanup run from the Actions tab |

Configure retention in repository settings as an Actions variable:

- Name: `RC_RETENTION_DAYS`
- Example value: `7`
- Fallback behavior: defaults to `7` if the variable is missing or invalid

Only RC-tagged versions are targeted. Stable release tags such as `vX.Y.Z` and `latest` are not affected.