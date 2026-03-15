# AGENTS.md

## Cursor Cloud specific instructions

### Overview

FurryCons.cn (兽展日历) is a Next.js 16 (Pages Router) frontend for browsing furry conventions in mainland China. It consumes an external REST API and has no local database.

### Running the dev server

```bash
yarn dev
```

Dev server starts on `http://localhost:3000`. See `README.md` for standard setup steps (`nvm use`, `corepack enable`, `yarn install`).

### Key caveats

- **External API dependency**: In development mode, `src/api/index.ts` hardcodes the API host to `http://localhost:8787`. Most pages (homepage, cities, organizations, event details) call `getStaticProps`/`getServerSideProps` that hit this API. Without a local backend or `FEC_API_TOKEN`, these pages will error with `ECONNREFUSED`. The `/about` page works without the API.
- **`FEC_API_TOKEN`** must be set in `.env` and a local API backend must run on port 8787 for full functionality. The token is obtained by registering at the project's console.
- **No automated tests**: The project has no test suite (no `test` script in `package.json`, no test files).
- **Lint**: `yarn lint` runs ESLint. There are pre-existing lint errors in `src/utils/track.ts` (4 errors) and 28 warnings across the codebase; these are not regressions.
- **Node version**: Requires Node 20 (lts/iron) as specified in `.nvmrc`.
- **Package manager**: Yarn 4.4.1 via Corepack (`corepack enable` required before `yarn install`).
- **Build**: `yarn build` produces a standalone Next.js build. Sentry source map upload requires `SENTRY_AUTH_TOKEN` but fails gracefully without it.
