# Event Website - Docker Setup

This project includes a complete Docker setup with PostgreSQL database.

## 🚀 Quick Start

### Prerequisites
- Docker
- Docker Compose

### Running the Application

1. **Start the services:**
   ```bash
   npm run docker:up
   ```
   This will start both the Node.js application and PostgreSQL database.

2. **View logs:**
   ```bash
   npm run docker:logs
   ```

3. **Stop the services:**
   ```bash
   npm run docker:down
   ```

## 📋 Available Services

### Application (Node.js + TypeScript)
- **Port:** 3000
- **URL:** http://localhost:3000
- **Endpoints:**
  - `GET /` - Hello World
  - `GET /events/list` - List all active events

### PostgreSQL Database
- **Port:** 5432
- **Database:** eventdb
- **Username:** eventuser
- **Password:** eventpass
- **Connection String:** `postgresql://eventuser:eventpass@localhost:5432/eventdb`

## 🗃️ Database Schema

The database is automatically initialized with your migration files from the `/migration` directory:
- `0001_20251026_event_schema.up.sql` - Base schema
- `1001_20251026_event_events.up.sql` - Events table
- `1002_20251026_event_tickets.up.sql` - Tickets table

## 🛠️ Development Commands

```bash
# Build the Docker images
npm run docker:build

# Start services in background
npm run docker:up

# View application logs
npm run docker:logs

# Stop all services
npm run docker:down

# Generate Prisma client
npm run prisma:generate

# Run database migrations
npm run prisma:migrate
```

## 📁 Docker Files

- `docker/docker-compose.yml` - Main compose configuration
- `docker/Dockerfile` - Node.js application container
- `docker/.dockerignore` - Files to exclude from Docker build
- `.env.docker` - Environment variables template

## 🔧 Configuration

The application uses these environment variables:
- `DATABASE_URL` - PostgreSQL connection string
- `NODE_ENV` - Application environment (development/production)
- `PORT` - Application port (default: 3000)

## 📝 Notes

- The PostgreSQL data is persisted in a Docker volume
- Hot reloading is enabled for development
- Migration files are automatically executed on database startup
- The application waits for the database to be healthy before starting