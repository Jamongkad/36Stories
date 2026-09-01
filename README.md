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
- `npm run db:generate` — generate Prisma Client into `generated/prisma`
- `npm run db:migrate` — create/apply development migrations
- `npm run db:seed` — create or refresh the local demo organization and site
- `npm run db:status` — show applied and pending migrations
- `npm run db:studio` — inspect data in Prisma Studio
