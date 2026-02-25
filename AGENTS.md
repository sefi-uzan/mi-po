# AGENTS.md

## Cursor Cloud specific instructions

### Overview

**Mi-Po** is an emergency presence-tracking web app for buildings/families during missile attacks in Israel. It is a single-package TypeScript project (not a monorepo) using Next.js 15 (frontend) with a jstack/Hono API backend deployed to Cloudflare Workers.

### Services

| Service | Port | Command |
|---------|------|---------|
| Next.js dev server | 3000 | `yarn dev` |
| Wrangler (CF Workers API) | 8080 | `npx wrangler dev src/server/index.ts` (optional locally; Next.js catch-all route at `src/app/api/[[...route]]/route.ts` serves the API via Hono's Vercel adapter) |

### Key commands

See `package.json` scripts. Summary:

- **Dev server:** `yarn dev` (port 3000)
- **Lint:** `yarn lint`
- **Type check:** `yarn tsc --noEmit`
- **Build:** `yarn build`
- **DB migrations:** `yarn db:generate`, `yarn db:migrate`, `yarn db:push`

### Architecture notes

- In development, the API is served on the same Next.js server via the catch-all route (`src/app/api/[[...route]]/route.ts`), so `yarn dev` alone is sufficient for most development work.
- The client in `src/lib/client.ts` points to `http://localhost:8080` in dev mode (wrangler). If you only run `yarn dev` without wrangler, API calls from the client-side React Query hooks will hit wrangler on port 8080. Server-side API calls through the catch-all route work on port 3000 directly.
- Authentication requires Twilio Verify (SMS). Without real Twilio credentials, you cannot register or log in, but you can verify the app starts, pages render, and the `/api` endpoint returns `{"message":"Hello World"}`.

### External dependencies (not running locally)

- **PostgreSQL:** Neon serverless (`DATABASE_URL` env var)
- **Twilio:** SMS verification (`TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_VERIFY_SERVICE_SID`)
- **JWT secrets:** `JWT_SECRET`, `JWT_REFRESH_SECRET`, `JWT_EXPIRATION_TIME`

A `.env` file must exist at the project root with these variables (see `README.md` for the full template). Placeholder values are sufficient for starting the dev server and running lint/build/typecheck.

### Gotchas

- The project uses `yarn` 1.22.22 (classic). Do not use npm or pnpm.
- Node.js 22 is required (matches CI).
- No automated test suite exists (no test framework configured). Validation is via `yarn lint`, `yarn tsc --noEmit`, and `yarn build`.
- Tailwind CSS v4 is used with the PostCSS plugin (`@tailwindcss/postcss`), not the older `tailwind.config.js` approach.
- **Important:** If you run `yarn build` and then `yarn dev`, the stale `.next/` directory from the production build will cause CSS to not load in dev mode (the CSS file returns 404). Always run `rm -rf .next` before starting `yarn dev` if you previously ran `yarn build`.
- The dev server may pick a different port if 3000 is in use (e.g. 3001, 3002). Check the startup log for the actual port.
