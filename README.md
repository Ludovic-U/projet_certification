# F2S Application - Project Management System

## Table of Contents
- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Features](#features)
- [Getting Started](#getting-started)
- [Database](#database)
- [API Endpoints](#api-endpoints)
- [Authentication](#authentication)
- [Deployment](#deployment)

---

## Overview

F2S (Figure de Skills) is a comprehensive project management application designed for managing client projects through various phases: Ideation, Conception, Evaluation, and Pilotage. It provides tools for Gantt charts, mind mapping, SWOT analysis, budget management, decision tracking, and AI-powered assistance via Mistral AI.

---

## Tech Stack

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js (v5.1.0)
- **Database**: PostgreSQL with Prisma ORM (v6.14.0)
- **Authentication**: JWT tokens stored in HTTP-only cookies
- **File Upload**: Multer
- **Email**: Nodemailer
- **AI Integration**: Mistral AI SDK

### Frontend
- **Framework**: Next.js (v15.5.2) with App Router
- **Language**: TypeScript
- **UI Components**: Radix UI primitives
- **Styling**: Tailwind CSS (v4)
- **State Management**: React Hooks + Context
- **Gantt Charts**: @svar-ui/react-gantt
- **Mind Mapping**: @xyflow/react (React Flow)
- **Forms**: React Hook Form + Zod validation
- **Icons**: Font Awesome, Lucide React
- **Charts**: Recharts

---

## Project Structure

```
F2S_Application/
├── backend/                    # Express.js API server
│   ├── controllers/            # Request handlers
│   ├── services/              # Business logic
│   ├── routes/                # API route definitions
│   ├── middlewares/           # Express middleware
│   ├── prisma/                # Database schema & migrations
│   ├── utils/                 # Utility functions
│   ├── documentation/         # API documentation
│   └── index.js               # Server entry point
│
├── frontend/                   # Next.js application
│   ├── src/
│   │   ├── app/               # Next.js App Router pages
│   │   │   ├── [clientId]/    # Client-specific pages
│   │   │   │   ├── [projectId]/  # Project pages
│   │   │   │   │   ├── conception/  # Gantt & Planning
│   │   │   │   │   ├── ideation/    # Ideation phase
│   │   │   │   │   ├── evaluation/  # Evaluation phase
│   │   │   │   │   ├── pilotage/    # Pilotage phase
│   │   │   │   │   ├── mindmap/     # Mind mapping
│   │   │   │   │   ├── swot/        # SWOT analysis
│   │   │   │   │   └── vue_ensemble/ # Overview
│   │   │   ├── admin/         # Admin pages
│   │   │   ├── clients/       # Client management
│   │   │   └── home/          # Home page
│   │   ├── api/              # API client functions
│   │   ├── hooks/            # Custom React hooks
│   │   └── components/      # Shared components
│   └── public/               # Static assets
│
├── compose.yaml               # Docker Compose configuration
└── package.json              # Root dependencies
```

---

## Features

### Project Phases

1. **Ideation Phase** (`/ideation`)
   - Pre-project panel for initial planning
   - Strategic analysis with SWOT
   - Decision tracking (Feasibility & Strategic boards)
   - Impact analysis tracking

2. **Conception Phase** (`/conception`)
   - Gantt chart for project planning
   - Task management with hierarchy
   - Budget overview and tracking
   - Version support for planning variants
   - AI-powered task generation (Mistral)

3. **Evaluation Phase** (`/evaluation`)
   - Project evaluation tools

4. **Pilotage Phase** (`/pilotage`)
   - Project monitoring and control

5. **Reporting** (`/reporting`)
   - Project reports and analytics

6. **Vue d'Ensemble** (`/vue_ensemble`)
   - Project overview dashboard

### Core Modules

- **Gantt Charts**: Interactive task scheduling with timeline visualization
- **Mind Mapping**: Visual brainstorming with AI assistance
- **Budget Management**: Track expenses and allocations
- **Task Management**: Hierarchical tasks with assignments
- **Financeur Management**: Track project funding sources
- **Decision Tracking**: Feasibility and strategic decision boards
- **User Management**: Role-based access control (RBAC)
- **Client Management**: Multi-tenant architecture

---

## Getting Started

This guide covers installing the application on a local machine for development.  
The project uses a **monorepo** layout with a separate `frontend/` and `backend/` folder under a shared root.

---

### Prerequisites

| Tool | Version | Notes |
|------|---------|-------|
| Node.js | >= 18.x | LTS recommended |
| npm | >= 9.x | Comes with Node.js |
| PostgreSQL | >= 14.x | Required for local (non-Docker) installs |
| Docker & Docker Compose | latest | Optional – used to run the full stack |
| Git | any | To clone the repository |

---

### Project Structure

```
F2S_Application/
├── backend/                    # Express.js API server
│   ├── controllers/
│   ├── services/
│   ├── routes/
│   ├── middlewares/
│   ├── prisma/                 # Schema, migrations, seed
│   ├── config/                 # App configuration (app-config.json)
│   ├── index.js                # Server entry point
│   └── .env.example            # <-- copy to .env and fill in values
│
├── frontend/                   # Next.js 15 (App Router)
│   ├── src/
│   │   ├── app/                # Pages & layouts
│   │   ├── api/                # API client helpers
│   │   ├── hooks/
│   │   └── components/
│   └── .env.local.example      # <-- copy to .env.local and fill in values
│
├── compose.yaml                # Docker Compose (full stack)
├── docker-compose.test.yml     # Docker Compose for tests
├── .env                        # Root env – used by Docker Compose
└── backup.sql                  # Sample database backup (optional)
```

---

### Installation Steps

#### 1. Clone the repository

```bash
git clone <repository-url>
cd F2S_Application
```

#### 2. Install root / workspace dependencies

```bash
npm install
```

#### 3. Configure environment variables

**Step A – Backend** (`backend/.env`)

Create `backend/.env` from the existing `backend/.env` file (it is already present in the repo).  
Key variables:

| Variable | Example / Notes |
|----------|-----------------|
| `DATABASE_URL` | PostgreSQL connection string (see below) |
| `PORT` | `4000` (default) |
| `JWT_SECRET` | Random secret for token signing |
| `JWT_EXPIRATION` | `1d` |
| `MISTRAL_API_KEY` | Get yours at https://console.mistral.ai/ |
| `BCRYPT_SALT_ROUNDS` | `10` |

Example `backend/.env` content:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/f2s_db?schema=public"
PORT=4000
JWT_SECRET="change-me-to-a-secure-random-string"
JWT_EXPIRATION="1d"
MISTRAL_API_KEY="your-mistral-api-key"
BCRYPT_SALT_ROUNDS=10
```

> ⚠️ **Never commit `.env` or `.env.local` files.** Add them to `.gitignore`.

**Step B – Root `.env` (Docker Compose only)**

The root `.env` is consumed by `compose.yaml`:

```env
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=f2s_db
```

> The file `f2s_app/.env` (containing `NEXT_PUBLIC_CLERK_*` keys) is **not used by this project** and can be deleted.

#### 4. Install backend dependencies

```bash
cd backend
npm install
```

#### 5. Install frontend dependencies

```bash
cd ../frontend
npm install
```

#### 6. Run database migrations

From the `backend/` directory:

```bash
cd ../backend
npx prisma migrate deploy
```

Create and seed the database (permissions, roles, tutorials, etc.):

```bash
npx prisma db seed
```

To create a new migration after a schema change:

```bash
npx prisma migrate dev --name <migration_name>
```

#### 7. Start the application

**Backend** (runs on http://localhost:4000):

```bash
cd backend
npm run dev
```

**Frontend** (runs on http://localhost:3000):

```bash
cd frontend
npm run dev
```

Open http://localhost:3000 in your browser.

---

### Alternative: Docker Compose (Full Stack)

Docker Compose orchestrates frontend, backend, and PostgreSQL together.

```bash
docker compose up --build -d
```

Services exposed:

| Service | Port | URL |
|---------|------|-----|
| Frontend | 3000 | http://localhost:3000 |
| Backend | 4000 | http://localhost:4000 |
| PostgreSQL | 5432 | localhost:5432 |

Volumes:
- `./backend/uploads` → uploads directory
- `./backend/config` → app config
- `pgdata` → PostgreSQL data directory

Stop the stack:

```bash
docker compose down
```

---

## Database

### Backup

```bash
# Export to a .sql file
pg_dump -U postgres -d f2s_db > backup.sql

# Import from a .sql file
psql -U postgres -d f2s_db < backup.sql
```

When using Docker, replace `localhost` with the container name or published port:

```bash
pg_dump -U postgres -h localhost -p 5432 -d f2s_db > backup.sql
psql -U postgres -h localhost -p 5432 -d f2s_db < backup.sql
```

### Prisma Studio (visual database browser)

```bash
cd backend
npx prisma studio
# Opens at http://localhost:5555
```

---

## Environment Variables Reference

### Backend (`backend/.env`)

```env
# Database – matches your local/remote PostgreSQL instance
DATABASE_URL="postgresql://<user>:<password>@<host>:<port>/<db>?schema=public"

# Server
PORT=4000

# Authentication
JWT_SECRET="<long-random-string>"
JWT_EXPIRATION="1d"
BCRYPT_SALT_ROUNDS=10

# Mistral AI (optional – AI features will be disabled without a key)
MISTRAL_API_KEY="<your-mistral-key>"
```

### Root `.env` (Docker only)

```env
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=f2s_db
```

### Frontend (`frontend/.env.local`)

```env
NEXT_PUBLIC_API_URL=http://localhost:4000
```

> The frontend communicates with the backend via this URL. In Docker (production) this is set to the internal service URL.

---

## Common Issues

### CORS Errors
Ensure the frontend URL is allowed in the backend's CORS configuration.

### Database Connection Refused
- Verify PostgreSQL is running (`pg_ctl status` or `docker compose ps db`)
- Check that `DATABASE_URL` in `backend/.env` matches your database credentials and host

### Port Already in Use
Change `PORT` in `backend/.env` or free port `3000`/`4000`/`5432`.

### File Upload Permission Errors
Ensure the `backend/uploads/` directory exists and is writable.

### Migration Already Applied Error
Use `npx prisma migrate deploy` in production/CI instead of `migrate dev`.

---

## Running Tests

```bash
# Run all backend tests
cd backend && npm run test:all

# Run specific suites
npm run test:controllers
npm run test:services
npm run test:integration
npm run test:userflow

# Run frontend tests
cd frontend && npm test
```

---

## Deployment

### Production Build – Frontend

```bash
cd frontend
npm run build
npm start
```

### Production Build – Backend

```bash
cd backend
npm start
```

### Docker Production

```bash
docker compose -f compose.yaml up --build -d
```

---

## License

ISC

---

## Database Schema Overview

The database uses Prisma ORM with the following main entities:

#### Core Entities
- **User**: Application users with roles
- **Client**: Client organizations
- **Project**: Projects owned by clients
- **Version**: Project versions for planning variants

#### Project Management
- **Action**: High-level project actions
- **SubAction**: Sub-tasks under actions
- **Task**: Detailed tasks (supports hierarchy)
- **TaskAssignment**: User-task assignments
- **TaskLink**: Dependencies between tasks
- **Todo**: Project todo items

#### Budget & Finance
- **Budget**: Budget items by category
- **Financeur**: Funding sources
- **FinanceurProjet**: Funding allocations per project

#### Planning Tools
- **Mindmap**: Mind map documents
- **MindmapNode**: Nodes in mind maps
- **MindmapEdge**: Connections between nodes

#### Assessment & Decision
- **Question**: Assessment questions
- **Option**: Question options
- **Response**: Project responses to questions
- **ProjectDecision**: Decision tracking
- **ProjectImpact**: Impact analysis

#### Tutorial System
- **TutorialPage**: Tutorial steps per feature
- **UserTutorialView**: Per-user tutorial progress

---

## API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/user/register` | Register new user |
| POST | `/api/user/login` | User login |
| POST | `/api/user/logout` | User logout |
| POST | `/api/user/forgot-password` | Request password reset |
| POST | `/api/user/reset-password` | Reset password |
| GET | `/api/me` | Get current user |

### Clients
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/client/get` | List all clients |
| GET | `/api/client/getById/:id` | Get client by ID |
| POST | `/api/client/create` | Create client |

### Projects
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/project/get` | List projects |
| GET | `/api/project/getById/:id` | Get project details |
| POST | `/api/project/create` | Create project |
| PATCH | `/api/project/update/:id` | Update project |
| DELETE | `/api/project/delete/:id` | Delete project |

### Gantt / Tasks
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/gantt/tasks/:projectId` | Get project tasks |
| POST | `/api/gantt/tasks` | Create task |
| PATCH | `/api/gantt/tasks/:id` | Update task |
| DELETE | `/api/gantt/tasks/:id` | Delete task |
| POST | `/api/gantt/links` | Create task link |
| GET | `/api/gantt/versions/:projectId` | Get versions |
| POST | `/api/gantt/versions` | Create version |

### Mindmap
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/mindmap/:projectId` | Get mindmaps |
| POST | `/api/mindmap` | Create mindmap |
| PATCH | `/api/mindmap/:id` | Update mindmap |
| DELETE | `/api/mindmap/:id` | Delete mindmap |

### Questions & Responses
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/question/get` | List questions |
| POST | `/api/question/create` | Create question |
| GET | `/api/response/get/:projectId` | Get responses |
| POST | `/api/response/create` | Create response |

### Financeur
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/financeur/get` | List financeurs |
| POST | `/api/financeur/create` | Create financeur |
| POST | `/api/financeur/link` | Link financeur to project |

### AI Integration
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/mistral/generate-tasks` | Generate tasks with AI |

### Todos
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/todo/:projectId` | Get project todos |
| POST | `/api/todo` | Create todo |
| PATCH | `/api/todo/:id` | Update todo |
| DELETE | `/api/todo/:id` | Delete todo |

### Config
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/config` | Get app configuration |
| GET | `/api/config/rate-limits` | Get AI rate limits |

### Tutorials
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/tutorial/:page` | Get tutorial by page name |

### Feedback
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/feedback` | Submit user feedback |

---

## Authentication

### JWT-Based Authentication

1. **Login**: User submits credentials → Server validates → Returns JWT in HTTP-only cookie
2. **Protected Routes**: Frontend sends cookie → Middleware validates JWT → Request proceeds
3. **Logout**: Server clears the cookie

### Session Management

- Sessions are stored in the `UserSession` table
- Each session has an expiration time
- Sessions can be tracked by IP and user agent

### Role-Based Access Control (RBAC)

Users have roles assigned through the `UserRole` table. Roles have permissions through the `RolePermission` table.

---

## Frontend Architecture

### Key Components

#### Gantt Chart (`/conception`)
- `GanttChartComponent.tsx` - Main Gantt component
- `GanttTimeline.tsx` - Timeline visualization
- `GanttTaskList.tsx` - Task list sidebar
- `GanttToolbar.tsx` - Action toolbar
- `GanttTaskEditor.tsx` - Task edit modal
- `GanttTaskSummary.tsx` - Task details panel

#### Mind Map (`/mindmap`)
- `MindmapContent.tsx` - Main mind map canvas
- `MindmapNode.tsx` - Node component
- `MindmapToolbar.tsx` - Action toolbar
- `MindmapAIModal.tsx` - AI generation modal

#### Decision Panels
- `DecisionPanel.tsx` - Feasibility & strategic decisions
- `ImpactPanel.tsx` - Impact analysis

### Custom Hooks

- `useGanttState` - Gantt chart state management
- `useGanttHandlers` - Gantt event handlers
- `useGanttExportImport` - Import/export functionality
- `useProjectQuestions` - Questions and responses

---

## Migrations

New migrations are created when the schema changes:

```bash
cd backend
npx prisma migrate dev --name migration_name
```

---

## Future Improvements

See [`frontend/src/app/[clientId]/[projectId]/conception/FUTURE_IMPROVEMENTS.md`](frontend/src/app/[clientId]/[projectId]/conception/FUTURE_IMPROVEMENTS.md) for planned enhancements.

---

## License

ISC
