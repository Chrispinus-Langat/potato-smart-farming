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

- `farms` — farms, detailed farm views, fields, and task management
- `diagnosis` — image upload, server-side vision analysis, and persistent diagnosis history
- `community` — stories, likes, comments, farmer suggestions, and follows
- `messaging` — conversations, message threads, and sending messages
- `auth` — current session and logout

The frontend consumes these procedures through `client/src/lib/trpc.ts`; no separate REST client is required.

Crop analysis accepts JPEG, PNG, and WebP images up to 8 MB, uploads them to object storage, calls the configured vision-capable model server-side, and saves the structured result. Model output is advisory; uncertain results are marked for expert review.

## Repository customization

The repository no longer includes the unused branded dialog, browser debug collector, analytics script tags, or generated debug artifacts. The remaining `server/_core` and `client/src/_core` directories are runtime infrastructure for authentication, sessions, API context, OAuth callbacks, storage proxying, and the Vite/server bridge. They should only be replaced if you also replace those capabilities.

## Production build

```bash
pnpm check
pnpm test
pnpm build
pnpm start
```

The server exposes `GET /api/health` for hosting-provider health checks.

## Docker deployment

The repository includes a production `Dockerfile` and `.dockerignore`:

```bash
docker build -t mavuno-potato-care .
docker run --env-file .env -p 3000:3000 mavuno-potato-care
```

Do not commit the `.env` file. Configure the variables listed above in the hosting provider's secret/environment settings.

## Render-style deployment

`render.yaml` defines a Docker web service and maps its health check to `/api/health`. To deploy, create a new Blueprint from this repository, provide the environment values in the provider dashboard, and deploy. The database can be a managed MySQL/TiDB instance from the same provider or another database provider.

Set the OAuth application's callback URL to:

```text
https://YOUR_BACKEND_DOMAIN/api/oauth/callback
```

Set `VITE_OAUTH_PORTAL_URL`, `OAUTH_SERVER_URL`, and `VITE_APP_ID` to values from the OAuth provider you choose. If the frontend is hosted separately, configure the API gateway/proxy so browser requests to `/api/trpc`, `/api/oauth`, and `/api/health` reach the Node server. For the simplest deployment, serve the built frontend and API from the same Node domain.
