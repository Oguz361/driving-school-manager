# Driving School Manager

A full-featured driving school management platform built with Next.js 15. Manage students, instructors, vehicles, lessons, finances, and more — all in one place.

![Next.js](https://img.shields.io/badge/Next.js-15-black?logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)
![Prisma](https://img.shields.io/badge/Prisma-ORM-2D3748?logo=prisma)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-336791?logo=postgresql)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-38B2AC?logo=tailwind-css)

---

## Pictures
<img width="1470" height="802" alt="Bildschirmfoto 2026-03-01 um 00 39 27" src="https://github.com/user-attachments/assets/05928925-b5ca-4ea3-84ca-a7075356986c" />
<img width="1470" height="802" alt="Bildschirmfoto 2026-03-01 um 00 40 07" src="https://github.com/user-attachments/assets/e4c9d6fe-db2f-4dab-9286-cfed70fddb30" />
<img width="1470" height="802" alt="Bildschirmfoto 2026-03-01 um 00 40 36" src="https://github.com/user-attachments/assets/ca66340a-c033-4ed5-9722-5b6c49829059" />



**Key highlights:**

- Interactive calendar for scheduling driving lessons
- Full student lifecycle management (registration → license)
- Role-based access control (Owner / Admin / Instructor)
- Financial tracking with revenue statistics and charts

---

## Features

### Modules

| Module         | Description                                                      |
| -------------- | ---------------------------------------------------------------- |
| **Dashboard**  | Overview of key metrics, upcoming lessons, and recent activity   |
| **Calendar**   | Schedule and manage driving lessons with drag-and-drop support   |
| **Students**   | Full student profiles, progress tracking, and license management |
| **Vehicles**   | Fleet management with maintenance records and availability       |
| **Users**      | Manage instructors and staff accounts                            |
| **Finances**   | Track payments, invoices, and revenue                            |
| **Statistics** | Charts and reports for business insights                         |

### Role System

- **OWNER** — Full access to all settings and data
- **ADMIN** — Manage students, lessons, and finances
- **INSTRUCTOR** — View own schedule and assigned students

---

## Tech Stack

### Frontend

- [Next.js 15](https://nextjs.org) with App Router
- [React 19](https://react.dev)
- [Tailwind CSS 4](https://tailwindcss.com)
- [Radix UI](https://www.radix-ui.com) — accessible headless components
- [react-big-calendar](https://github.com/jquense/react-big-calendar) — calendar view

### Backend

- Next.js API Routes (Server Actions)
- [NextAuth v5](https://authjs.dev) — authentication & session management
- [Prisma ORM](https://www.prisma.io) — type-safe database access

### Database

- [PostgreSQL](https://www.postgresql.org) (compatible with Neon, Supabase, Railway)

---

## Prerequisites

- **Node.js** ≥ 18
- **PostgreSQL** — local instance or cloud provider (Neon, Supabase, Railway)
- **npm**, **pnpm**, or **yarn**

---

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/<your-username>/driving-school-manager.git
cd driving-school-manager
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

```bash
cp .env.example .env
```

Open `.env` and fill in your values (see [Environment Variables](#environment-variables) below).

### 4. Set up the database

```bash
# Run migrations
npx prisma migrate dev

# (Optional) Seed with sample data
npx prisma db seed
```

### 5. Start the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Environment Variables

Copy `.env.example` to `.env` and set the following:

| Variable       | Description                                | Example                                                |
| -------------- | ------------------------------------------ | ------------------------------------------------------ |
| `DATABASE_URL` | PostgreSQL connection string               | `postgresql://user:pass@localhost:5432/driving_school` |
| `AUTH_SECRET`  | Random secret for NextAuth session signing | `openssl rand -hex 32`                                 |
| `NEXTAUTH_URL` | Base URL of your app                       | `http://localhost:3000`                                |
| `CRON_SECRET`  | Secret for protecting scheduled API routes | `openssl rand -hex 32`                                 |
| `NODE_ENV`     | Runtime environment                        | `development`                                          |

See `.env.example` for the full template.

---

## Database Setup

```bash
# Apply all pending migrations
npx prisma migrate dev

# Seed the database with sample data
npx prisma db seed

# Open Prisma Studio (visual database browser)
npx prisma studio
```

---

## Deployment

### Vercel + PostgreSQL (recommended)

1. Push this repository to GitHub.
2. Import the project on [Vercel](https://vercel.com/new).
3. Add a PostgreSQL database (e.g., [Neon](https://neon.tech) or [Supabase](https://supabase.com)) and copy the connection string.
4. Set all environment variables from the table above in Vercel's **Project Settings → Environment Variables**.
5. Deploy — Vercel runs `npm run build` automatically.

> **Note:** Make sure to run `npx prisma migrate deploy` as part of your build or via a one-time deploy hook to apply migrations in production.
