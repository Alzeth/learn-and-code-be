# CLAUDE.md — learn-and-code-be
NestJS backend for a coding learning platform. Deployed on Vercel, database on Supabase (PostgreSQL). Frontend is Angular, hosted on GitHub Pages at `https://alzeth.github.io/learn-and-code/`.

## Commands
```bash
npm run start:dev        # dev server (port 3001)
npm run build            # compile — run this to verify type correctness
npm run test             # unit tests
npm run test:e2e         # integration tests (requires local DB via docker-compose)
npm run lint             # ESLint (auto-fixes)
npm run format           # Prettier (auto-fixes)
npm run format:check     # Prettier check only (used in CI)
npm run seed             # seed DB with courses and lessons

npx prisma migrate dev --name <name>   # create and apply a migration
npx prisma generate                    # regenerate client after schema changes (always do this after schema edits)
npx prisma studio                      # DB GUI
```
Local DB: `docker-compose up -d` starts PostgreSQL on port 5432.

## Linting and formatting
- **ESLint** — `typescript-eslint` with `recommendedTypeChecked` (type-aware rules). Config: `eslint.config.mjs`.
- **Prettier** — single quotes, trailing commas, 2-space indent, 100-char line width. Config: `.prettierrc`.
- **Pre-commit hook** (Husky + lint-staged) — runs Prettier then ESLint `--fix` on every staged `.ts` file automatically before each commit. No manual step needed.

## Architecture
Standard NestJS module layout. Each feature is a self-contained module under `src/`.
```
src/
  auth/           JWT auth — register, login, forgot-password, reset-password
  users/          UsersService (DB access only, no controller)
  courses/        Course listing and detail
  lessons/        Lesson content and theory
  progress/       User progress tracking
  submissions/    Code submission results
  mail/           Email abstraction — see below
  health/         Health check endpoint
  prisma/         PrismaService singleton
  interfaces/     Shared TypeScript interfaces (ResponseEntity)
  utils/          responseMapping() helper
  logger/
```

### Response shape
All endpoints return `ResponseEntity<T>` via `responseMapping()`:
```json
{ "success": true, "data": {}, "error": null, "meta": { "requestId": "...", "timestamp": "..." } }
```

### Mail module
Provider-switched via `MAIL_PROVIDER` env var (`"resend"` default, `"smtp"` for Nodemailer).

## TypeScript gotchas
**No `.js` extensions in imports.** The project uses `"module": "nodenext"` but `ts-jest` compiles to CommonJS and cannot resolve `.js` → `.ts`. Write `import { X } from './foo'` not `import { X } from './foo.js'`. All existing files follow this — match them.
**`import type` in decorated classes.** `isolatedModules: true` + `emitDecoratorMetadata: true` are both on. For types used as decorated constructor parameter types or return types, use `import type` to avoid TS1272. Use a regular import for the injection token value alongside it:
```typescript
import { EMAIL_PROVIDER } from './interfaces/email-provider.interface';
import type { IEmailProvider } from './interfaces/email-provider.interface';
```

## Testing
- Unit tests: `src/**/*.spec.ts`
- e2e tests: `test/app.e2e-spec.ts` — boots the full `AppModule`
- The e2e test stubs env vars at the top of the file (`JWT_SECRET`, `RESEND_API_KEY`). Any service that validates config in its constructor needs a stub added there.
- After any schema change: run `npx prisma generate` before `npm run build` or tests will fail with type errors.

## Environment variables
| Variable | Purpose |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string |
| `JWT_SECRET` | JWT signing secret |
| `JWT_EXPIRES_IN` | Token lifetime (default `7d`) |
| `MAIL_PROVIDER` | `"resend"` (default) or `"smtp"` |
| `MAIL_FROM` | Sender address — must match a verified domain in Resend |
| `APP_URL` | Frontend base URL, used in email links |
| `RESEND_API_KEY` | Resend API key (when `MAIL_PROVIDER=resend`) |
| `SMTP_HOST/PORT/USER/PASS` | SMTP credentials (when `MAIL_PROVIDER=smtp`) |

## Deployment
- Platform: **Vercel** — auto-deploys on push to `main`
- Database: **Supabase** (PostgreSQL) — set `DATABASE_URL` in Vercel environment variables
- Entry point: `api/index.ts` (serverless, `ExpressAdapter`) — `vercel.json` runs `prisma generate && prisma migrate deploy` at build time
- Swagger UI available at `/api` — served via CDN assets (no local `swagger-ui-dist` in the lambda bundle)
- CORS: currently open (`origin: '*'`), intended to be restricted to `https://alzeth.github.io`

## NestJS best practices

### Modules
- One module per feature. Each module owns its controller, service, and DTOs — nothing bleeds across.
- Only export what other modules actually need. `UsersModule` exports `UsersService` but not `PrismaService`.
- `PrismaModule` is global — never import it directly in feature modules; it is always available.
- `MailModule` is imported by `AuthModule`, not `AppModule` — keep mail a dependency of the feature that needs it, not the root.

### Controllers
- Controllers are thin — no business logic. Every method calls a service and wraps the result in `responseMapping()`.
- Use `@HttpCode()` explicitly for any non-200 response (`202` for `forgot-password`, etc.).
- Decorate every endpoint with `@ApiOperation` and tag the controller with `@ApiTags`. Protected routes get `@ApiBearerAuth()`.
- Protect endpoints with `@UseGuards(JwtAuthGuard)` — never roll custom auth logic in a controller.

### Services
- All business logic lives in services. Services are the only layer that knows about Prisma.
- Services call other services (e.g. `AuthService` calls `UsersService`), never other modules' controllers.
- Throw NestJS built-in exceptions (`NotFoundException`, `ConflictException`, `BadRequestException`, `UnauthorizedException`) — the global exception filter handles the response shape.
- Never expose raw Prisma models from a service if the caller only needs a subset — return a mapped object or DTO.

### DTOs and validation
- Every request body has a dedicated DTO class with `class-validator` decorators.
- `ValidationPipe({ whitelist: true })` is global — properties not declared in the DTO are stripped automatically. Do not add manual stripping logic.
- Add `@ApiProperty()` to every DTO field so Swagger stays accurate.
- Response types get their own DTO class (e.g. `AuthResponseDto`) — never return a raw Prisma type from a controller.

### Security
- Passwords: always hash with `bcrypt` (salt rounds `10`). Never store or log plaintext passwords.
- Tokens (reset, etc.): generate with `crypto.randomBytes`, store only the SHA-256 hash in the DB, send the plain token only via the out-of-band channel (email).
- Never reveal whether a user email exists to unauthenticated callers — return the same response regardless.
- Secrets and API keys live in `.env` only, read via `ConfigService`. Never hardcode them.

### Prisma
- Run `npx prisma migrate dev --name <descriptive-name>` for every schema change — never edit the DB directly.
- Run `npx prisma generate` immediately after any schema change, before building or running tests.
- All DB access goes through `PrismaService` inside a feature's own service — no raw queries in controllers or guards.
- Use nullable fields (`String?`, `DateTime?`) for optional data; add `@@index` for fields used in `WHERE` filters on large tables.

### Error handling
- Use NestJS exceptions for expected error cases — do not `try/catch` and return error objects manually.
- For external calls (email sending, third-party APIs), catch errors at the boundary, log with `Logger`, and decide whether to rethrow or swallow based on whether the caller needs to know.

## Postman collection
Requests live in `postman/collections/Learn and Code Backend/` as individual `.request.yaml` files. When adding a new endpoint, create a matching file following the existing format. Use `{{base_url}}` and `{{access_token}}` variables.
