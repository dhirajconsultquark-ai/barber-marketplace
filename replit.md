# Workspace

## Overview

Full-stack Barber Marketplace (LUXECUTS) — a platform where customers discover and book barber shops, barbers manage their business, and admins approve/moderate listings.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)
- **Frontend**: React + Vite (Tailwind CSS, Shadcn/ui)
- **Auth**: Session-based (express-session + bcryptjs)

## Structure

```text
artifacts-monorepo/
├── artifacts/
│   ├── barber-marketplace/   # React + Vite frontend (root path /)
│   └── api-server/           # Express API server
├── lib/
│   ├── api-spec/             # OpenAPI spec + Orval codegen config
│   ├── api-client-react/     # Generated React Query hooks
│   ├── api-zod/              # Generated Zod schemas from OpenAPI
│   └── db/                   # Drizzle ORM schema + DB connection
```

## User Roles

1. **Customer** — browse shops, book services, leave reviews, view booking history
2. **Barber** — create/edit shop profile, manage services, view and update bookings
3. **Admin** — approve/reject shops, moderate reviews, view all users

## Demo Accounts (password: `password` for all)

- Admin: `admin@barbermarket.com`
- Barber: `barber@test.com`
- Customer: `customer@test.com`

## Key API Routes

- `POST /api/auth/register` — register (customer or barber)
- `POST /api/auth/login` — login
- `GET /api/shops` — list approved shops (public)
- `GET /api/shops/:id` — shop detail with services
- `POST /api/shops` — create shop (barber only)
- `GET /api/shops/my` — get own shop (barber only)
- `POST /api/shops/:id/services` — add service (owner)
- `POST /api/bookings` — create booking (customer)
- `GET /api/bookings` — list my bookings
- `POST /api/shops/:id/reviews` — create review (customer)
- `GET /api/admin/shops` — admin: all shops
- `POST /api/admin/shops/:id/approve` — admin: approve
- `POST /api/admin/shops/:id/reject` — admin: reject with reason
- `DELETE /api/admin/reviews/:id/moderate` — admin: remove review

## DB Push

`pnpm --filter @workspace/db run push`

## Codegen

`pnpm --filter @workspace/api-spec run codegen`
