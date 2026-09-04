# 36Stories

36Stories helps emerging creators pressure-test demand for products, services,
and early ideas. Creators publish offers on a hosted bio page and use views,
outbound clicks, waitlist signups, and interest actions to decide what to
promote, stock, or build next.

## Run locally

Requirements: Node.js 22+, npm, Docker Desktop, and Docker Compose.

```bash
cp .env.example .env
npm install
docker compose up -d
npm run db:migrate
npm run db:generate
npm run db:seed
npm run dev
```

Dashboard access is closed-beta only. Before running the seed, fill every
`BETA_OWNER_*`, `BETA_WIFE_*`, and wife organization variable in `.env` with
your own values. The seed refuses partial configuration and does not print or
store plaintext passwords. If those variables are left empty, it seeds only
the public demo content and no dashboard login is provisioned.

Open [http://localhost:3000](http://localhost:3000), create an offer from the
dashboard, and view the demo bio page at
[http://localhost:3000/bio/36stories-demo](http://localhost:3000/bio/36stories-demo).

Useful database commands:

```bash
# Follow PostgreSQL logs
docker compose logs -f postgres

# Check migration state
npm run db:status

# Open Prisma Studio
npm run db:studio

# Stop services while retaining data
docker compose down
```

To intentionally erase the local database and its Docker volume:

```bash
docker compose down -v
docker compose up -d
npm run db:migrate
npm run db:generate
npm run db:seed
```

`prisma/migrations` contains the reproducible SQL history. PostgreSQL's
`_prisma_migrations` table records which migrations have been applied. Prisma 7
does not implicitly generate the client or run seeds during `prisma migrate
dev`, so both remain explicit steps. The seed is idempotent and creates the
`36stories-demo` organization, its `localhost` site, and sample offers with
analytics activity.

## Railway deployment

Railway Infrastructure as Code is defined in `.railway/railway.ts`. It creates
the `Postgres` database service, attaches persistent storage using Railway's
PostgreSQL resource, and creates the GitHub-backed `36Stories` web service.
The web service receives `DATABASE_URL` as a typed reference to the database's
private connection URL, so no database credentials are committed to source.

The Railway SDK is a development dependency used by the Railway CLI. Use
Railway CLI 5.42.1 or newer:

```bash
railway link
railway config plan
railway config apply
```

Review the plan before applying it. The first apply provisions PostgreSQL and
the web service in the linked project. Generate a public domain for the web
service, then set these web-service variables in Railway:

```dotenv
BETTER_AUTH_URL=https://your-public-domain.example
BETTER_AUTH_SECRET=<independent output of: openssl rand -base64 32>
NEXT_SERVER_ACTIONS_ENCRYPTION_KEY=<independent output of: openssl rand -base64 32>
```

The IaC file preserves those values without writing them to source. `BETTER_AUTH_URL`
must be the exact public HTTPS origin, without a path. `RAILPACK_NODE_NPM_INSTALL`
is set to `npm ci` by the IaC file. The build uses `npm run build`, migrations run
with `npm run deploy:prepare`, `npm start` launches the standalone server, and
`/api/health` is used as the healthcheck.

The build generates Prisma Client and packages `public/` plus `.next/static/`
inside the standalone output, so styles and static files are present in the
deployed image. Railway's Git commit SHA is also used as the Next.js deployment
ID to protect clients from version skew during deploys.

After the first successful deploy, run `npm run db:seed` once from an operator
shell after setting all beta variables in that shell. The seed never prints
passwords and refuses partial configuration. Then verify `/api/health`, the
public bio page, login, an offer view/click, and a waitlist signup. Do not expose
the PostgreSQL public proxy for application traffic.

The dashboard is username/password protected. Public Bio Pages and public
offer pages remain unauthenticated, while their analytics and waitlist writes
are body-limited, same-origin checked, rate-limited in PostgreSQL, and
conflict-safe. To rotate a beta password locally or in an operator shell, run:

```bash
npm run db:reset-password
```

## Project shape

The `app/` and `public/` directories are Next.js conventions: `app/page.tsx` defines `/`, `app/layout.tsx` wraps routes, and `public/` serves static files. The contents of those directories and the root configuration files are project-owned.

App Router pages are Server Components by default and read from Prisma on the
server. Interactive offer creation and public CTA components are client
boundaries. Database credentials and Prisma stay out of browser code.

## Offer policy

`lib/offers/policy.ts` is the shared, client-safe source of truth for offer
kinds, modes, CTA types, intent events, labels, and field capabilities. Client
components use it to render the right fields and actions; server validators,
route handlers, and analytics use the same policy without trusting client
input.

When adding an offer rule:

1. Update the shared policy and its tests.
2. If the change adds a persisted enum value, update `prisma/schema.prisma`,
   create a migration, and regenerate Prisma Client.
3. Implement genuinely new CTA UI behavior in `OfferAction.tsx`. Its exhaustive
   dispatch intentionally fails TypeScript until every CTA has a component.
4. Run `npm test`, `npm run lint`, and `npm run build`.

## Scripts

- `npm run dev` — start the development server
- `npm run build` — create a production build
- `npm start` — serve the production build
- `npm run lint` — run ESLint
- `npm test` — run the test suite once
- `npm run deploy:check` — validate required production deployment variables
- `npm run deploy:prepare` — validate variables and apply production migrations
- `npm run db:generate` — generate Prisma Client into `generated/prisma`
- `npm run db:migrate` — create/apply development migrations
- `npm run db:seed` — create or refresh the local demo organization and site
- `npm run db:status` — show applied and pending migrations
- `npm run db:studio` — inspect data in Prisma Studio
