# Database Models Documentation

This document describes the main database entities in the F2S application. The schema is defined in Prisma and can be found in [`backend/prisma/schema.prisma`](../../backend/prisma/schema.prisma).

## Entity Relationship Overview

```
User ←→ Client ←→ Project ←→ Task ←→ Version
  ↓                     ↓           ↓
  ↓                   Action    SubAction
  ↓                     ↓           ↓
  ↓                   Budget  Deliverable
  ↓
UserSession ←→ Role ←→ Permission
```

---

## Core Entities

### User

Represents application users who can log in and manage projects.

| Field | Type | Description |
|-------|------|-------------|
| userId | Int (PK) | Unique identifier |
| username | String (unique) | Login username |
| firstname | String | User's first name |
| lastname | String | User's last name |
| password | String | Hashed password (nullable for OAuth) |
| email | String (unique) | User's email |
| createdAt | DateTime | Account creation timestamp |

**Relationships:**
- `clientUserRoles` - Roles assigned per client
- `projects` - Projects managed by user
- `subActionsPiloteGrt` - Sub-actions where user is pilot
- `assigneeDetails` - Task assignment details
- `taskAssignments` - Task assignments
- `todos` - Todos assigned to user
- `roles` - Global roles
- `userSessions` - Login sessions

---

### Client

Represents client organizations that own projects.

| Field | Type | Description |
|-------|------|-------------|
| clientId | Int (PK) | Unique identifier |
| clientName | String (unique) | Organization name |
| clientType | String | Type of client |
| statusJuridique | String | Legal status |
| secteur | String | Business sector |
| description | String | Client description |
| createdAt | DateTime | Creation timestamp |

**Relationships:**
- `userRoles` - Users assigned to client with roles
- `projects` - Projects owned by client

---

### Project

The central entity representing a project managed for a client.

| Field | Type | Description |
|-------|------|-------------|
| projectId | Int (PK) | Unique identifier |
| projectName | String (unique) | Project name |
| startDate | DateTime | Project start date |
| endDate | DateTime | Project end date |
| projectManager | Int (FK) | User ID of manager |
| projectStage | String | Current phase (ideation, conception, etc.) |
| projectStatus | String | Project status |
| projectDesc | String | Project description |
| goNogo | String | Go/No-Go decision |
| SWOT_strength | String | SWOT Strengths |
| SWOT_weakness | String | SWOT Weaknesses |
| SWOT_opportunity | String | SWOT Opportunities |
| SWOT_threat | String | SWOT Threats |

**Relationships:**
- `client` - Owner client
- `manager` - Project manager user
- `actions` - Project actions
- `tasks` - Project tasks
- `financeurProjet` - Funding sources
- `mindmaps` - Associated mind maps
- `versions` - Project versions
- `responses` - Project question responses
- `questions` - Project-specific questions
- `types` - Project types
- `decisions` - Decision records
- `impacts` - Impact analysis records
- `todos` - Project todos

---

### Version

Represents different versions of project planning.

| Field | Type | Description |
|-------|------|-------------|
| versionId | Int (PK) | Unique identifier |
| projectId | Int (FK) | Associated project |
| name | String | Version name |
| description | String | Version description |
| isActive | Boolean | Whether this is the active version |
| createdAt | DateTime | Creation timestamp |
| updatedAt | DateTime | Last update timestamp |

**Relationships:**
- `project` - Parent project
- `tasks` - Tasks in this version
- `links` - Task links in this version
- `mindmaps` - Mind maps in this version

---

## Task Management

### Action

High-level project actions/tasks.

| Field | Type | Description |
|-------|------|-------------|
| actionId | Int (PK) | Unique identifier |
| actionName | String | Action name |
| actionObj | String | Action objective |
| projectId | Int (FK) | Parent project |
| startDate | DateTime | Start date |
| progress | Int | Calculated from sub-actions |

**Relationships:**
- `project` - Parent project
- `subActions` - Sub-actions under this action

---

### SubAction

Sub-tasks under actions.

| Field | Type | Description |
|-------|------|-------------|
| subActionId | Int (PK) | Unique identifier |
| actionId | Int (FK) | Parent action |
| description | String | Sub-action description |
| piloteGrtId | Int (FK) | Pilot user ID |
| startDate | DateTime | Start date |
| endDate | DateTime | End date |
| progress | Int | Calculated from tasks |

**Relationships:**
- `action` - Parent action
- `piloteGrt` - Pilot user
- `budgets` - Budget items
- `deliverables` - Deliverables
- `tasks` - Tasks under this sub-action

---

### Task

Detailed project tasks. Supports hierarchical structure (parent-child).

| Field | Type | Description |
|-------|------|-------------|
| taskId | Int (PK) | Unique identifier |
| subActionId | Int (FK) | Parent sub-action (nullable) |
| name | String | Task name |
| description | String | Task description |
| projectId | Int (FK) | Parent project |
| details | String | Additional details |
| endDate | DateTime | Due date |
| files | String[] | Attached files |
| goal | Task | Goal/objective |
| notes | String | Notes |
| parentId | Int (FK) | Parent task (for hierarchy) |
| progress | Int | Progress percentage (0-100) |
| startDate | DateTime | Start date |
| type | String | Task type (task, milestone, etc.) |
| versionId | Int (FK) | Version this task belongs to |
| color | String | Task color in UI |

**Relationships:**
- `parent` - Parent task
- `children` - Child tasks
- `project` - Parent project
- `subAction` - Parent sub-action
- `version` - Version
- `assigneeDetails` - Assignee information
- `taskAssignments` - User assignments
- `deliverableStatus` - Deliverable status tracking
- `expenses` - Task expenses
- `linksSource` - Outgoing task links
- `linksTarget` - Incoming task links
- `deliverables` - Associated deliverables

---

### TaskLink

Represents dependencies between tasks.

| Field | Type | Description |
|-------|------|-------------|
| linkId | Int (PK) | Unique identifier |
| source | Int (FK) | Source task ID |
| target | Int (FK) | Target task ID |
| type | Int | Link type (0=finish-to-start, etc.) |
| versionId | Int (FK) | Version this link belongs to |

**Relationships:**
- `sourceTask` - Source task
- `targetTask` - Target task
- `version` - Version

---

### TaskAssignment

Many-to-many relationship between users and tasks.

| Field | Type | Description |
|-------|------|-------------|
| userId | Int (FK) | User ID |
| taskId | Int (FK) | Task ID |

---

### TaskAssigneeDetail

Detailed assignment information including role and allocation.

| Field | Type | Description |
|-------|------|-------------|
| id | Int (PK) | Unique identifier |
| taskId | Int (FK) | Task ID |
| userId | Int (FK) | User ID |
| role | String | Role (member, lead, etc.) |
| allocation | Int | Allocation percentage |

---

### TaskExpense

Expenses tracked against tasks.

| Field | Type | Description |
|-------|------|-------------|
| expenseId | Int (PK) | Unique identifier |
| taskId | Int (FK) | Task ID |
| category | String | Expense category |
| amount | Decimal | Amount |
| date | DateTime | Expense date |
| description | String | Description |
| vendor | String | Vendor/supplier |

---

### TaskDeliverableStatus

Tracks deliverable completion status.

| Field | Type | Description |
|-------|------|-------------|
| id | Int (PK) | Unique identifier |
| taskId | Int (FK) | Task ID |
| name | String | Deliverable name |
| status | String | Status (pending, in-progress, completed) |
| completedAt | DateTime | Completion timestamp |
| notes | String | Notes |
| fileUrl | String | Uploaded file URL |
| fileName | String | Original file name |
| confirmed | Boolean | Confirmed by approver |
| confirmedAt | DateTime | Confirmation timestamp |

---

## Budget & Finance

### Budget

Budget items for sub-actions.

| Field | Type | Description |
|-------|------|-------------|
| budgetId | Int (PK) | Unique identifier |
| subActionId | Int (FK) | Sub-action ID |
| category | Enum | Budget category |
| nature | String | Nature of expense |
| quantity | Int | Quantity |
| unit | String | Unit |
| avgUnitCostTtc | Decimal | Average unit cost (TTC) |
| total | Decimal | Total cost |

**Categories:**
- `MOYENS_HUMAINS_INTERNES` - Internal human resources
- `AMENAGEMENTS_MOBILIER` - Furnishing
- `EQUIPEMENTS_PEDAGOGIQUES` - Pedagogical equipment
- `PRESTATIONS` - Services
- `COMMUNICATION_EVENEMENTIEL` - Communication/Events

---

### Financeur

Funding sources/organizations.

| Field | Type | Description |
|-------|------|-------------|
| financeurId | Int (PK) | Unique identifier |
| FinanceurName | String (unique) | Funder name |

**Relationships:**
- `FinanceurProjet` - Project funding allocations

---

### FinanceurProjet

Many-to-many relationship linking funders to projects with funding amounts.

| Field | Type | Description |
|-------|------|-------------|
| projectId | Int (FK) | Project ID |
| financeurId | Int (FK) | Funder ID |
| pourcentage | Int | Funding percentage |
| montant | Decimal | Funding amount |

---

## Mind Mapping

### Mindmap

Mind map documents for brainstorming.

| Field | Type | Description |
|-------|------|-------------|
| mindmapId | Int (PK) | Unique identifier |
| projectId | Int (FK) | Project ID |
| versionId | Int (FK) | Version ID (nullable) |
| name | String | Mind map name |
| createdAt | DateTime | Creation timestamp |
| updatedAt | DateTime | Last update timestamp |

**Relationships:**
- `project` - Parent project
- `version` - Version
- `nodes` - Mind map nodes
- `edges` - Mind map edges

---

### MindmapNode

Nodes in a mind map.

| Field | Type | Description |
|-------|------|-------------|
| nodeId | Int (PK) | Unique identifier |
| mindmapId | Int (FK) | Parent mind map |
| externalId | String | External ID for sync |
| label | String | Node label |
| nodeType | String | Node type |
| positionX | Float | X position |
| positionY | Float | Y position |
| color | String | Node color |
| fontSize | Int | Font size |
| isRoot | Boolean | Whether this is the root node |

---

### MindmapEdge

Connections between mind map nodes.

| Field | Type | Description |
|-------|------|-------------|
| edgeId | Int (PK) | Unique identifier |
| mindmapId | Int (FK) | Parent mind map |
| externalId | String | External ID for sync |
| source | String | Source node ID |
| target | String | Target node ID |

---

## Assessment & Decision Making

### Question

Assessment questions for project evaluation.

| Field | Type | Description |
|-------|------|-------------|
| questionId | Int (PK) | Unique identifier |
| label | String | Question text |
| keyword | String | Search keyword |
| category | String | Question category |
| numberOfSelectionableOpt | Int | Max options selectable |
| questionIdParent | Int (FK) | Parent question |
| questionCategoryId | Int (FK) | Question category |

**Relationships:**
- `options` - Answer options
- `parent` - Parent question
- `children` - Sub-questions
- `responses` - Project responses
- `projects` - Associated projects
- `types` - Question types

---

### Option

Answer options for questions.

| Field | Type | Description |
|-------|------|-------------|
| optionId | Int (PK) | Unique identifier |
| label | String | Option text |
| questionId | Int (FK) | Parent question |

---

### Response

Project responses to questions.

| Field | Type | Description |
|-------|------|-------------|
| responseId | Int (PK) | Unique identifier |
| label | String | Response text |
| keyword | String | Search keyword |
| projectId | Int (FK) | Project ID |
| questionId | Int (FK) | Question ID |
| optionId | Int (FK) | Selected option |
| responseIdParent | Int (FK) | Parent response |

---

### ProjectDecision

Tracks decisions made in feasibility and strategic boards.

| Field | Type | Description |
|-------|------|-------------|
| decisionId | Int (PK) | Unique identifier |
| projectId | Int (FK) | Project ID |
| boardType | String | Board type (faisabilite/strategique) |
| decisionType | String | Type of decision |
| isApproved | Boolean | Approval status |
| pourquoi | String | Reason/justification |
| decisionFinale | String | Final decision (go/nogo/pending) |

**Unique constraint:** (projectId, boardType, decisionType)

---

### ProjectImpact

Impact analysis records for the ideation phase.

| Field | Type | Description |
|-------|------|-------------|
| impactId | Int (PK) | Unique identifier |
| projectId | Int (FK) | Project ID |
| rowOrder | Int | Row order for display |
| resultatsAttendus | String | Expected results |
| criteres | String | Criteria |
| indicateurs | String | Indicators |
| situationDepart | String | Current situation |
| objectif | String | Objective/target |

---

## Todo Management

### Todo

Project todo items/task lists.

| Field | Type | Description |
|-------|------|-------------|
| todoId | Int (PK) | Unique identifier |
| text | String | Todo text |
| completed | Boolean | Completion status |
| projectId | Int (FK) | Project ID |
| assignedTo | Int (FK) | Assigned user ID |
| deadline | DateTime | Due date |
| createdAt | DateTime | Creation timestamp |

---

## User Management & Security

### Role

User roles for RBAC.

| Field | Type | Description |
|-------|------|-------------|
| roleId | Int (PK) | Unique identifier |
| roleName | String (unique) | Role name |
| roleDesc | String | Role description |

---

### Permission

System permissions.

| Field | Type | Description |
|-------|------|-------------|
| permId | Int (PK) | Unique identifier |
| permName | String (unique) | Permission name |
| permDesc | String | Permission description |

---

### RolePermission

Many-to-many relationship between roles and permissions.

| Field | Type | Description |
|-------|------|-------------|
| roleId | Int (FK) | Role ID |
| permId | Int (FK) | Permission ID |

---

### UserRole

Global roles assigned to users.

| Field | Type | Description |
|-------|------|-------------|
| userId | Int (FK) | User ID |
| roleId | Int (FK) | Role ID |

---

### ClientUserRole

Roles assigned to users per client (for multi-tenant access).

| Field | Type | Description |
|-------|------|-------------|
| clientId | Int (FK) | Client ID |
| userId | Int (FK) | User ID |
| isManager | Boolean | Manager status |
| position | String | Position title |

---

### UserSession

Active user sessions for authentication tracking.

| Field | Type | Description |
|-------|------|-------------|
| sessionId | Int (PK) | Unique identifier |
| userId | Int (FK) | User ID |
| tokenHash | String | Hashed session token |
| createdAt | DateTime | Session creation |
| expiresAt | DateTime | Session expiration |
| ip | String | Client IP address |
| userAgent | String | Client user agent |

---

## Type & Category Models

### Type

Project or question types.

| Field | Type | Description |
|-------|------|-------------|
| typeId | Int (PK) | Unique identifier |
| label | String | Type label |

---

### QuestionCategory

Categories for organizing questions.

| Field | Type | Description |
|-------|------|-------------|
| questionCategoryId | Int (PK) | Unique identifier |
| label | String (unique) | Category label |

---

## Deliverable

### Deliverable

Project deliverables associated with sub-actions.

| Field | Type | Description |
|-------|------|-------------|
| deliverableId | Int (PK) | Unique identifier |
| subActionId | Int (FK) | Sub-action ID |
| file | String | File path/URL |
| startDate | DateTime | Start date |
| endDate | DateTime | End date |

---

## Database Indexes

Key indexes for query performance:

- `UserSession` on `userId`
- `Task` on `projectId`, `versionId`, `parentId`
- `TaskLink` on `source`, `target`, `versionId`
- `TaskExpense` on `taskId`
- `TaskAssigneeDetail` on `taskId`, `userId`
- `TaskDeliverableStatus` on `taskId`
- `Version` on `projectId`
- `Mindmap` on `projectId`, `versionId`
- `MindmapNode` on `mindmapId`
- `MindmapEdge` on `mindmapId`
- `ProjectDecision` on `projectId`
- `ProjectImpact` on `projectId`

---

## Cascading Deletes

The following relationships use cascade delete:

- `ClientUserRole` → `Client`, `User`
- `Project` → `Client`
- `Todo` → `Project`
- `FinanceurProjet` → `Project`, `Financeur`
- `Action` → `Project`
- `SubAction` → `Action`
- `Budget`, `Deliverable` → `SubAction`
- `Task` → `Project`, `SubAction`, `Version`, `Parent`
- `Mindmap`, `MindmapNode`, `MindmapEdge` → `Project`, `Version`
- `TaskExpense`, `TaskAssigneeDetail`, `TaskDeliverableStatus` → `Task`
- `ProjectDecision`, `ProjectImpact` → `Project`
