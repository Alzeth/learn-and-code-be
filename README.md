# Learn and Code API

Backend for the Learn and Code learning platform, built with NestJS, Prisma, and PostgreSQL.

## Prerequisites

Make sure you have the following installed:

- [Node.js](https://nodejs.org/) v18+
- [pnpm](https://pnpm.io/) — `npm install -g pnpm`
- [Colima](https://github.com/abiosoft/colima) — `brew install colima`
- [Docker](https://docs.docker.com/engine/install/) — `brew install docker`
- [Docker Compose](https://docs.docker.com/compose/) — `brew install docker-compose`

## First-time setup

### 1. Clone the repo and navigate to the backend

```bash
git clone <repo-url>
cd python-kids-platform/backend
```

### 2. Install dependencies

```bash
pnpm install
pnpm approve-builds
```

### 3. Configure environment variables

```bash
cp .env.example .env
```

Open `.env` and fill in the values if needed. The defaults work for local development.

### 4. Set up Docker socket for Colima

Add this to your `~/.zshrc` (or `~/.bashrc`):

```bash
export DOCKER_HOST="unix://${HOME}/.colima/default/docker.sock"
```

Then reload your shell:

```bash
source ~/.zshrc
```

### 5. Set up the Docker Compose plugin

```bash
mkdir -p ~/.docker/cli-plugins
ln -sfn $(brew --prefix)/opt/docker-compose/bin/docker-compose ~/.docker/cli-plugins/docker-compose
```

### 6. Start the database

```bash
colima start --dns 8.8.8.8
docker compose up -d
```

### 7. Run database migrations

```bash
npx prisma migrate dev
```

### 8. Start the development server

```bash
pnpm run start:dev
```

API is now running at `http://localhost:3001`.

## Subsequent runs

Once everything is set up, starting the project each time only requires:

```bash
colima start
docker compose up -d
pnpm run start:dev
```

## Useful commands

| Command | Description |
|---|---|
| `pnpm run start:dev` | Start with hot reload |
| `pnpm run build` | Compile for production |
| `pnpm run test` | Run unit tests |
| `npx prisma migrate dev` | Apply new migrations |
| `npx prisma studio` | Open database GUI at localhost:5555 |
| `docker compose down` | Stop the database |
| `colima stop` | Stop the Colima VM |

## Environment variables

| Variable | Description | Default |
|---|---|---|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://kids:kids_password@localhost:5432/python_kids?schema=public` |
| `PORT` | Port the API listens on | `3001` |
