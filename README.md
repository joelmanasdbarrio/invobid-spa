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
| `VITE_APP_NAME` | `!nvobid` | Application display name |
| `VITE_EXT_RATING_PROVIDER` | `Einforma` | External credit rating provider name |
| `VITE_SMALLEST_BID_INCREMENT_PERCENTAGE` | `0.1` | Minimum bid increment percentage |

### Other commands

```sh
npm run build      # Production build (outputs to dist/)
npm run test       # Run unit tests
npm run lint       # Lint
```

---

## Production

The SPA is **not deployed standalone**. In production it is built and served automatically as part of the `invobid-api` Docker Compose setup — nginx serves the compiled static files and reverse-proxies `/api/` and `/socket.io/` to the NestJS container.

See [invobid-api/README.md](../invobid-api/README.md) for the full production deployment guide.
```
