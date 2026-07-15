# Learn and Code API

Backend for the [Learn and Code](https://alzeth.github.io/learn-and-code/) learning platform, built with NestJS, Prisma, and PostgreSQL.

## Prerequisites

- [Node.js](https://nodejs.org/) v22+ (use `.nvmrc`: `nvm use`)
- [npm](https://www.npmjs.com/) 10+
- if your OS is MacOS - [Colima](https://github.com/abiosoft/colima) — `brew install colima`
- [Docker](https://docs.docker.com/engine/install/) + [Docker Compose](https://docs.docker.com/compose/)

## First-time setup

### 1. Clone the repo

```bash
git clone https://github.com/Alzeth/learn-and-code-be.git
cd learn-and-code-be
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

```bash
cp .env.example .env
```

The defaults in `.env` work for local development without any changes.

### 4. Start the database

```bash
docker compose up -d
```

### 5. Run database migrations

```bash
npx prisma migrate dev
```

### 6. (Optional) Seed the database

```bash
npm run seed
```

Populates `Course`, `Lesson`, `CourseLesson`, and translation records from JSON fixtures in `prisma/` and `prisma/i18n/`, and Markdown theory files from `prisma/theory/`.

### 7. Start the development server

```bash
npm run start:dev
```

API is now running at `http://localhost:3001`.

## Subsequent runs

```bash
docker compose up -d
npm run start:dev
```

## API

All endpoints return a uniform JSON envelope:

```json
{
  "success": true,
  "data": <payload>,
  "error": null,
  "meta": { "requestId": "<uuid>", "timestamp": "<ISO>" }
}
```

### Internationalisation

Pass a locale via the `Accept-Language` header or the `?lang=` query parameter. Supported values: `en` (default), `uk`, `de`, `es`, `pl`, `fr`, `it`. Falls back to English when no translation exists for the requested locale.

```
GET /courses?lang=uk
Accept-Language: uk
```

### Endpoints

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/` | — | Health check |
| POST | `/auth/register` | — | Register a new user |
| POST | `/auth/login` | — | Log in, returns JWT |
| POST | `/auth/forgot-password` | — | Send password-reset email |
| POST | `/auth/reset-password` | — | Reset password with token |
| GET | `/courses` | — | All courses with ordered lesson table of contents |
| GET | `/courses/:id` | — | Single course by ID (e.g. `py01`) |
| GET | `/lessons` | — | All lessons ordered by `createdAt` |
| GET | `/lessons/:id` | — | Single lesson by ID |
| GET | `/lessons/:id/theory` | — | Lesson theory as Markdown (`text/plain`) |
| GET | `/progress` | JWT | Completion data for all lessons |
| GET | `/progress/lessons/:id` | JWT | Completion status for a single lesson |
| POST | `/progress/lessons/:id/complete` | JWT | Mark a lesson as complete |

### Swagger UI

Interactive API docs are available at `http://localhost:3001/api`.

## Useful commands

| Command | Description |
|---|---|
| `npm run start:dev` | Start with hot reload |
| `npm run start:prod` | Run the compiled production build |
| `npm run build` | Compile TypeScript to `dist/` |
| `npm run test` | Run unit tests |
| `npm run test:e2e` | Run end-to-end tests |
| `npm run test:cov` | Run tests with coverage report |
| `npm run lint` | Lint and auto-fix |
| `npm run format` | Format with Prettier |
| `npm run seed` | Seed the database from fixtures |
| `npx prisma migrate dev` | Apply new migrations locally |
| `npx prisma studio` | Open database GUI at `localhost:5555` |
| `docker compose down` | Stop the local database |

## Environment variables

| Variable | Default | Description |
|---|---|---|
| `DATABASE_URL` | `postgresql://kids:kids_password@localhost:5432/python_kids?schema=public` | PostgreSQL connection string |
| `PORT` | `3001` | Port the API listens on |
| `JWT_SECRET` | — | JWT signing secret |
| `JWT_EXPIRES_IN` | `7d` | Token lifetime |
| `MAIL_PROVIDER` | `resend` | `resend` or `smtp` |
| `MAIL_FROM` | — | Sender address (must match a verified Resend domain) |
| `APP_URL` | — | Frontend base URL, used in password-reset email links |
| `RESEND_API_KEY` | — | Resend API key (when `MAIL_PROVIDER=resend`) |
| `SMTP_HOST` / `SMTP_PORT` / `SMTP_USER` / `SMTP_PASS` | — | SMTP credentials (when `MAIL_PROVIDER=smtp`) |

## Project structure

```
src/
├── app.module.ts
├── main.ts                  # Bootstrap: CORS, Swagger, port
├── auth/                    # JWT auth — register, login, forgot/reset password
├── courses/                 # Course listing and detail
├── lessons/                 # Lesson content and theory
├── progress/                # User progress tracking
├── i18n/                    # Locale resolution (@Locale decorator, supported locales)
├── mail/                    # Email abstraction (Resend / SMTP)
├── users/                   # UsersService (DB access only)
├── prisma/
│   ├── prisma.module.ts
│   └── prisma.service.ts
├── interfaces/
└── utils/

prisma/
├── schema.prisma            # Models: Course, CourseTranslation, Lesson, LessonTranslation,
│                            #         CourseLesson, User, UserProgress, Submission
├── seed.ts
├── courses.json             # Course fixtures (English)
├── lessons.json             # Lesson fixtures (English — base/fallback)
├── i18n/                    # Per-locale translation fixtures
│   ├── lessons.uk.json
│   └── courses.uk.json
├── theory/                  # Markdown theory content per lesson (Ukrainian)
└── migrations/
```

### Adding a new translation locale

1. Create `prisma/i18n/lessons.{locale}.json` and/or `prisma/i18n/courses.{locale}.json` following the existing `uk` files as a template.
2. Optionally add theory Markdown files under `prisma/theory/{locale}/`.
3. Run `npm run seed` — the seed auto-discovers all locale files and upserts the translation rows.

## Deployment

The app is deployed on [Vercel](https://vercel.com). The database is hosted on [Supabase](https://supabase.com) (PostgreSQL).

- `vercel.json` — build runs `npx prisma generate && npx prisma migrate deploy` before the serverless function starts.
- `api/index.ts` — serverless NestJS entry point using `ExpressAdapter`.
- Swagger UI is served at `/api` using CDN assets (the lambda bundle does not include local `swagger-ui-dist` files).
