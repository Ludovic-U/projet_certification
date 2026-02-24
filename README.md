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

### Prerequisites

- Node.js 18+
- PostgreSQL 14+
- Docker & Docker Compose (optional)

### Environment Variables

Create a `.env` file in the backend directory:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/f2s_db"

# Server
PORT=4000

# JWT Secret
JWT_SECRET=your-secret-key

# Email (for password reset)
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=user@example.com
SMTP_PASS=password

# Mistral AI
MISTRAL_API_KEY=your-mistral-api-key
```

### Installation

1. **Clone the repository**
   ```bash
   cd F2S_Application
   ```

2. **Install backend dependencies**
   ```bash
   cd backend
   npm install
   ```

3. **Install frontend dependencies**
   ```bash
   cd frontend
   npm install
   ```

4. **Set up the database**
   ```bash
   cd backend
   npx prisma migrate dev
   npx prisma db seed
   ```

5. **Start development servers**

   Backend:
   ```bash
   cd backend
   npm run dev
   ```

   Frontend:
   ```bash
   cd frontend
   npm run dev
   ```

### Using Docker Compose

```bash
docker compose up --build -d
```

This will start:
- Frontend on http://localhost:3000
- Backend on http://localhost:4000
- PostgreSQL on http://localhost:5432

---

## Database

### Schema Overview

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

### Migrations

New migrations are created when the schema changes:

```bash
cd backend
npx prisma migrate dev --name migration_name
```

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

## Deployment

### Development
```bash
# Backend
cd backend && npm run dev

# Frontend
cd frontend && npm run dev
```

### Production Build

```bash
# Frontend build
cd frontend
npm run build
npm start

# Backend (production)
cd backend
npm start
```

### Docker Production

```bash
docker compose -f compose.yaml up --build -d
```

### Database Backup

```bash
# Export database
pg_dump -U user -d f2s_db > backup.sql

# Import database
psql -U user -d f2s_db < backup.sql
```

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

## Testing

### Backend Tests

```bash
# Run all tests
cd backend && npm run test:all

# Run controller tests
npm run test:controllers

# Run service tests
npm run test:services

# Run integration tests
npm run test:integration
```

---

## Common Issues & Solutions

### CORS Errors
- Ensure frontend URL is in the CORS whitelist in `backend/index.js`

### Database Connection
- Verify `DATABASE_URL` in environment variables
- Ensure PostgreSQL is running

### Session Expiry
- JWT tokens expire based on session settings
- User needs to re-login

### File Uploads
- Check `uploads` directory permissions
- Verify file size limits in multer config

---

## Future Improvements

See [`frontend/src/app/[clientId]/[projectId]/conception/FUTURE_IMPROVEMENTS.md`](frontend/src/app/[clientId]/[projectId]/conception/FUTURE_IMPROVEMENTS.md) for planned enhancements.

---

## License

ISC
