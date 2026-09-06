# Mavuno Potato Care

Mavuno is a full-stack farmer workspace for potato growers. It includes farm records, fields, tasks, crop diagnosis history, a farmer community feed, follows, comments, and private messaging.

## What runs where

The `client/` app is the React and Tailwind frontend. The `server/` app is an Express server with typed tRPC procedures. MySQL/TiDB stores application data through Drizzle ORM. Authentication and file storage are server-side capabilities and are not available from a static GitHub Pages deployment by themselves.

**GitHub Pages can serve the static frontend only.** To use login, persistent farms, community posts, messaging, diagnoses, and uploads, deploy the Node server and database as well. A Node-capable host such as Render, Railway, Fly.io, or a VPS can run the server, while a managed MySQL/TiDB provider can host the database.

## Local development

```bash
pnpm install
pnpm check
pnpm test
pnpm dev
```

The development server listens on port `3000` unless that port is already in use.

## Required server environment

Configure these values in the deployment environment rather than committing them:

- `DATABASE_URL` — MySQL/TiDB connection string
- `JWT_SECRET` — session signing secret
- `VITE_APP_ID` — OAuth application identifier
- `OAUTH_SERVER_URL` — OAuth service base URL
- `VITE_OAUTH_PORTAL_URL` — browser login portal URL
- `OWNER_OPEN_ID` and `OWNER_NAME` — project owner defaults
- `BUILT_IN_FORGE_API_URL` and `BUILT_IN_FORGE_API_KEY` — server-side storage and platform API access
- `VITE_FRONTEND_FORGE_API_URL` and `VITE_FRONTEND_FORGE_API_KEY` — only when a browser feature needs the frontend API integration

Never commit `.env` files or secrets.

## Database

The schema lives in `drizzle/schema.ts`. The initial migration is in `drizzle/0000_young_stryfe.sql` and has already been applied to the configured project database. For future schema changes:

```bash
pnpm drizzle-kit generate
pnpm db:push
```

Review generated SQL before applying it to a production database.

## Backend API areas

The typed API is defined in `server/routers.ts` and uses helpers in `server/db.ts`:

- `farms` — farms, fields, and task management
- `diagnosis` — persistent diagnosis history
- `community` — stories, likes, comments, farmer suggestions, and follows
- `messaging` — conversations, message threads, and sending messages
- `auth` — current session and logout

The frontend consumes these procedures through `client/src/lib/trpc.ts`; no separate REST client is required.

## Repository customization

The repository no longer includes the unused branded dialog, browser debug collector, analytics script tags, or generated debug artifacts. The remaining `server/_core` and `client/src/_core` directories are runtime infrastructure for authentication, sessions, API context, OAuth callbacks, storage proxying, and the Vite/server bridge. They should only be replaced if you also replace those capabilities.

## Production build

```bash
pnpm check
pnpm test
pnpm build
pnpm start
```

Set the deployed frontend origin and OAuth callback URL to the public Node server URL. If the frontend is hosted separately, configure the API gateway/proxy so browser requests to `/api/trpc` and `/api/oauth` reach the Node server.
