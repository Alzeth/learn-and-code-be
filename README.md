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

Populates `Course`, `Lesson`, and `CourseLesson` records from JSON fixtures in `prisma/` and Markdown theory files from `prisma/theory/`.

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

| Method | Path | Description |
|---|---|---|
| GET | `/` | Health check |
| GET | `/courses` | All courses with ordered lesson table of contents |
| GET | `/courses/:id` | Single course by ID (e.g. `py01`) |
| GET | `/lessons` | All lessons ordered by `createdAt` |
| GET | `/lessons/:id` | Single lesson by ID |
| GET | `/lessons/:id/theory` | Raw Markdown theory content (`text/plain`) |

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
| `npm run seed` | Seed the database from fixtures |
| `npx prisma migrate dev` | Apply new migrations |
| `npx prisma studio` | Open database GUI at `localhost:5555` |
| `docker compose down` | Stop the database |

## Environment variables

| Variable | Default | Description |
|---|---|---|
| `DATABASE_URL` | `postgresql://kids:kids_password@localhost:5432/python_kids?schema=public` | PostgreSQL connection string |
| `PORT` | `3001` | Port the API listens on |

## Project structure

```
src/
├── app.module.ts
├── main.ts                  # Bootstrap: CORS, Swagger, port
├── courses/
│   ├── courses.controller.ts
│   ├── courses.service.ts
│   └── dto/course.dto.ts
├── lessons/
│   ├── lessons.controller.ts
│   ├── lessons.service.ts
│   └── dto/lesson.dto.ts
├── prisma/
│   ├── prisma.module.ts
│   └── prisma.service.ts    # PrismaClient with PrismaPg adapter
├── interfaces/
└── utils/

prisma/
├── schema.prisma            # Models: Course, Lesson, CourseLesson, Submission
├── seed.ts
├── courses.json
├── lessons.json
├── theory/                  # Markdown content per lesson
└── migrations/
```

## Deployment

The app is deployed on [Railway](https://railway.app). The production API base URL is `https://learn-and-code-be-production.up.railway.app`.

The `Dockerfile` builds with `node:22-alpine`, runs `prisma migrate deploy`, then starts `node dist/src/main.js`.
