# 36Stories

A minimal Next.js App Router foundation that creates and displays feedback persisted in PostgreSQL.

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

Open [http://localhost:3000](http://localhost:3000), submit the example feedback, and refresh to confirm it remains stored.

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

`prisma/migrations` contains the reproducible SQL history. PostgreSQL's `_prisma_migrations` table records which migrations have been applied. Prisma 7 does not implicitly generate the client or run seeds during `prisma migrate dev`, so both remain explicit steps. The seed is idempotent and creates the `36stories-demo` organization, its `localhost` site, and five sample feedback records.

## Project shape

The `app/` and `public/` directories are Next.js conventions: `app/page.tsx` defines `/`, `app/layout.tsx` wraps routes, and `public/` serves static files. The contents of those directories and the root configuration files are project-owned.

Unlike a circa-2022 client-rendered React application, App Router components are Server Components by default. This page reads from Prisma directly on the server, while its Server Action performs the mutation and revalidates `/`. Database credentials and Prisma stay out of browser code, and no Client Component is needed, keeping client JavaScript minimal.

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
