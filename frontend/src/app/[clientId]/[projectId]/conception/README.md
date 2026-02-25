# Conception Page Gantt Chart

## Overview

This module provides a full-featured Gantt chart for project planning and task management. It includes interactive features like drag-and-drop, task hierarchy, dependencies, and import/export capabilities.

## File Structure

```
frontend/src/app/[clientId]/[projectId]/conception/
├── page.tsx              # Main Gantt chart component
├── README.md             # This file
├── constants.ts          # Configuration constants
├── types.ts             # TypeScript type definitions
├── data.ts              # Type definitions and sample data
├── hooks/
│   ├── useGanttState.ts       # Main state management hook
│   ├── useGanttHandlers.ts    # Event handlers (drag, resize, etc.)
│   └── useGanttExportImport.ts # Import/Export functionality
├── components/
│   ├── GanttTimeline.tsx       # Timeline visualization
│   ├── GanttTaskList.tsx       # Task list sidebar
│   ├── GanttToolbar.tsx         # Toolbar with controls
│   ├── GanttTaskEditor.tsx      # Task edit modal
│   ├── GanttTaskSummary.tsx     # Task details sidebar (enhanced)
│   ├── GanttTooltip.tsx         # Hover tooltips
│   ├── GanttContextMenu.tsx     # Right-click context menu
│   ├── PortalMenu.tsx          # Portal-based menu
│   ├── MistralModal.tsx        # AI-powered Gantt generation
│   ├── VersionSelector.tsx     # Version management dropdown
│   └── GanttTutorial.tsx       # Interactive user tutorial
└── utils/
    ├── dateUtils.ts       # Date manipulation utilities
    ├── timelineUtils.ts   # Timeline generation
    ├── taskUtils.ts       # Task helpers
    ├── budgetUtils.ts     # Budget calculations
    └── mistralUtils.ts   # Mistral AI JSON parsing
```

## Data Types

### Task Interface

```typescript
interface Task {
  id: number;              // Unique identifier
  text: string;           // Task name
  start: Date;            // Start date
  end: Date;              // End date
  progress: number;        // 0-100 completion percentage
  parent: number;         // Parent task ID (0 for root tasks)
  type: 'task' | 'milestone' | 'project';
  details: string;        // Description
  notes: string;          // Additional notes
  files: string[];        // Attached file URLs
  assigneeIds: number[];  // Assigned user IDs
  livrableIds: number[]; // Related deliverable IDs
  goal?: string;          // Task objective
  color?: string;         // Custom task color (hex)
  budget?: Budget;        // Budget data
}
```

### Task Types

| Type | Description | Visual |
|------|-------------|--------|
| `task` | Regular task | Rounded rectangle bar |
| `milestone` | Single-point milestone | Diamond shape |
| `project` | Parent container task | Square indicator |

### Link Interface

```typescript
interface Link {
  id: number;
  source: number;  // Source task ID
  target: number;  // Target task ID
  type: number;    // 0: finish-to-start, 1: start-to-start, etc.
}
```

### GanttData Interface

```typescript
interface GanttData {
  tasks: Task[];
  links: Link[];
  users: { id: number; label: string }[];
  livrables: { id: number; label: string; description: string }[];
}
```

## Hooks

### useGanttState

Manages all React state for the Gantt chart.

**State managed:**
- `tasks` - Array of tasks
- `links` - Array of dependencies
- `data` - Full Gantt data from API
- `viewMode` - 'day' | 'week' | 'month'
- `pxPerDay` - Zoom level
- `expandedTasks` - Set of expanded parent task IDs
- `history` - Undo/redo history stack
- `selectedTask` - Currently selected task
- `editingTask` - Task being edited

**Actions:**
- `addTask()` - Create new task
- `addChildTask(parentId)` - Create subtask
- `deleteTask(id)` - Delete task (cascades to children)
- `updateTask()` - Save task changes
- `undo()` / `redo()` - History navigation

### useGanttHandlers

Handles all mouse/touch interactions:

| Handler | Purpose |
|---------|---------|
| `handleMouseDown` | Initiate drag/resize/progress change |
| `handleMouseMove` | Update position during drag |
| `handleMouseUp` | Finalize drag and save state |
| `handleTaskContextMenu` | Show right-click menu |
| `handleTimelineMouseMove` | Update cursor position |

### useGanttExportImport

Handles data import/export:

| Function | Format | Description |
|----------|--------|-------------|
| `exportData()` | JSON | Full export with tasks and links |
| `importData()` | JSON | Import from JSON file |
| `exportToCSV()` | CSV | Tabular export |
| `importFromCSV()` | CSV | Import from CSV |
| `exportToExcel()` | XLSX | Excel with Tasks/Links sheets |
| `importFromExcel()` | XLSX | Import from Excel |
| `exportToMSProject()` | XML | Microsoft Project format |
| `importMistralGantt()` | JSON | Import AI-generated Gantt from Mistral |

**Import process:**
1. Parse file
2. Create tasks with temporary IDs
3. Sort parents before children
4. Save to API with ID mapping
5. Update parent references with new IDs

## New Features (v2.0)

### Version Management

The Gantt chart now supports **version management**, allowing you to create and manage multiple versions of your project plan.

| Feature | Description |
|----------|-------------|
| Create Version | Create new named versions of the Gantt chart |
| Switch Versions | Switch between different versions to compare plans |
| Duplicate Version | Create a new version by copying an existing one |
| Delete Version | Remove unwanted versions |
| Activate Version | Mark a version as the active/default version |
| Persistence | Version selection is saved to localStorage |

**Usage:**
- Click the version dropdown in the toolbar
- Select "Nouvelle version" to create a new version
- Check "Dupliquer les actions de..." to copy tasks from current version
- The main version (no version selected) contains all tasks without version filtering

### Mistral AI Integration

Generate Gantt charts automatically using **Mistral AI** - describe your project in natural language and let AI create the task structure.

**Features:**
- Text input: Describe your project and tasks in French
- File upload: Upload PDF, DOC, or text files with project details
- AI Processing: Mistral AI parses your input and generates task structure
- Import to Gantt: One-click import of AI-generated tasks

**Usage:**
1. Click the menu button (⋯) in the toolbar
2. Select "Mistral" to open the AI modal
3. Enter a description like: "Créer un projet de construction d'école avec 3 phases: préparation (2 semaines), construction (3 mois), inauguration (1 mois)"
4. Click "Générer avec Mistral AI"
5. Review the generated tasks and click "Importer dans le Gantt"

### Interactive Tutorial

A comprehensive **step-by-step tutorial** helps new users learn all Gantt chart features.

**Tutorial Topics:**
- Welcome & introduction
- Adding tasks
- Editing tasks
- Moving tasks (drag & drop)
- Resizing tasks
- View modes (day/week/month)
- Zoom controls
- Today navigation
- Undo/Redo functionality
- Progress tracking
- Subtasks & hierarchy
- Assignees
- Dependencies
- Milestones
- Keyboard shortcuts

**Usage:**
- Click the "Tutoriel" button in the toolbar
- Navigate with arrow keys or click "Suivant/Précédent"
- Press ESC to close at any time

### Task List Toggle

The left sidebar (task list) can now be **hidden/shown** for better timeline visibility.

**Features:**
- Toggle button on the edge between panels
- Smooth animation when toggling
- Visual indicator showing current state
- Keyboard shortcut support

### Enhanced Task Summary Panel

The task details sidebar now includes **collapsible sections** and enhanced functionality:

| Section | Features |
|---------|----------|
| Task Name | Prominent display with color indicator |
| Budget Total | Real-time calculation display |
| Livrables | List of associated deliverables with status |
| Notes | Add/delete timestamped notes |
| Files | Upload, view, and delete attachments |
| Progress | Visual progress bar |
| Quick Info | Start date, end date, assignees, status |
| Description | Full task description |

### Enhanced Import/Export

New import options added:

| Format | Description |
|--------|-------------|
| Mistral JSON | Import AI-generated Gantt structure |
| CSV | Import from spreadsheet |
| Excel | Import from Excel workbook |
| JSON | Full data import |

## Components

### GanttTimeline

The main timeline visualization component.

**Features:**
- Sticky headers (groups + units)
- Today marker (red vertical line)
- Cursor date indicator
- Grid lines for time units
- Task bars with resize handles
- Milestone diamond shapes

### GanttTaskList

Left sidebar displaying task hierarchy:
- Task name with hierarchy indentation
- Start/end dates
- Assignees
- Progress percentage + visual bar
- Expand/collapse parent tasks

### GanttTaskEditor

Modal editor with tabs:
1. **General** - Basic task info
2. **Moyen humain** - Personnel costs
3. **Interns** - Intern budget
4. **Amenagements** - Fittings costs
5. **Equipements pedagogiques** - Equipment costs
6. **Prestations** - Subcontractor/travel costs
7. **Communications** - Communication costs

### GanttContextMenu

Right-click context menu options:
- Add Child Task
- Edit Task
- Delete Task

### MistralModal

AI-powered Gantt generation modal:
- Text input for project description
- File upload for documents
- Preview of generated tasks
- Import to Gantt functionality

### VersionSelector

Version management dropdown:
- Create new versions
- Switch between versions
- Delete versions
- Activate/deactivate versions
- Duplicate from current version

### GanttTutorial

Interactive tutorial modal:
- Step-by-step guide
- Keyboard navigation
- Visual highlights
- Progress tracking
- 15+ tutorial topics

## API Integration

### Backend Endpoints

All endpoints require authentication via JWT cookie.

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/gantt/:projectId` | Fetch all Gantt data |
| POST | `/api/gantt/:projectId/tasks` | Create task |
| PUT | `/api/gantt/:projectId/tasks/:taskId` | Update task |
| DELETE | `/api/gantt/:projectId/tasks/:taskId` | Delete task (cascades) |
| PUT | `/api/gantt/:projectId/tasks/bulk` | Bulk update |
| POST | `/api/gantt/:projectId/links` | Create dependency |
| DELETE | `/api/gantt/:projectId/links/:linkId` | Delete dependency |
| POST | `/api/gantt/:projectId/deliverables` | Create deliverable |
| GET | `/api/gantt/:projectId/subactions` | Get subActions |

### Version API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/gantt/:projectId/versions` | Fetch all versions |
| POST | `/api/gantt/:projectId/versions` | Create new version |
| PUT | `/api/gantt/:projectId/versions/:versionId` | Update version |
| DELETE | `/api/gantt/:projectId/versions/:versionId` | Delete version |
| PUT | `/api/gantt/:projectId/versions/:versionId/activate` | Activate version |

### API Functions (ganttApi.ts)

```typescript
fetchGanttData(projectId, versionId?): Promise<GanttData>
createTask(projectId, taskData): Promise<Task>
updateTask(projectId, taskId, taskData): Promise<Task>
deleteTask(projectId, taskId): Promise<void>
bulkUpdateTasks(projectId, tasks): Promise<void>
createTaskLink(projectId, linkData): Promise<Link>
deleteTaskLink(projectId, linkId): Promise<void>
createDeliverable(projectId, data): Promise<Livrable>
fetchSubActions(projectId): Promise<SubAction[]>

// Version functions
fetchVersions(projectId): Promise<Version[]>
createVersion(projectId, versionData): Promise<Version>
updateVersion(projectId, versionId, versionData): Promise<Version>
deleteVersion(projectId, versionId): Promise<void>
activateVersion(projectId, versionId): Promise<Version>
```

### Version Interface

```typescript
interface Version {
  versionId: number;
  projectId: number;
  name: string;
  description: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  taskCount?: number;
  linkCount?: number;
}
```

## Configuration

### Constants (constants.ts)

```typescript
const ROW_HEIGHT = 60;           // Task row height in px
const MIN_START_DATE = new Date(2020, 0, 1);
const MAX_HISTORY_STATES = 20;
const DEFAULT_DAY_WIDTH = {
  day: 24,    // 24px per day
  week: 18,   // 18px per day
  month: 6,   // 6px per day
};
```

### View Modes

| Mode | Description | Default Width |
|------|-------------|---------------|
| `day` | Daily view | 24px/day |
| `week` | Weekly view | 18px/day |
| `month` | Monthly view | 6px/day |

## Color Coding

Task bar colors indicate progress:

| Progress | Color | Hex |
|----------|-------|-----|
| 100% | Green | `#00C000` |
| 75-99% | Emerald | `#10b981` |
| 50-74% | Amber | `#f59e0b` |
| 1-49% | Orange | `#f97316` |
| 0% | Gray | `#6b7280` |

## Utilities

### dateUtils

All date operations use **UTC** to avoid timezone issues:

| Function | Purpose |
|----------|---------|
| `toUTC(d)` | Convert to UTC timestamp |
| `startOfDay(d)` | Get start of day in UTC |
| `addDays/Weeks/Months` | Add time periods |
| `daysInMonth(d)` | Get days in month |
| `getISOWeek(d)` | Get ISO week number |

### timelineUtils

| Function | Purpose |
|----------|---------|
| `generateColumns()` | Create timeline columns |
| `getBaseStart()` | Get timeline start date |
| `getDateRange()` | Calculate date range from tasks |

### budgetUtils

| Function | Purpose |
|----------|---------|
| `createEmptyBudget()` | Create default budget object |
| `calculateTotal()` | Calculate budget total |
| `calculateBudgetTotals()` | Calculate detailed budget totals |

### mistralUtils

| Function | Purpose |
|----------|---------|
| `parseMistralJSON()` | Parse AI response JSON |
| `transformMistralJSONToGanttTasks()` | Convert AI tasks to Gantt tasks |

## Common Issues

### Tasks not appearing after reload
- Check API connection
- Verify projectId in URL
- Check browser console for errors

### Drag and drop not working
- Ensure no other mouse button is pressed
- Check for conflicting event listeners

### Import failing
- Verify JSON/CSV format matches expected structure
- Check for duplicate IDs
- Ensure parent tasks exist before children

### Subtasks not deleted with parent
- Backend should cascade delete (see ganttService.js)
- Ensure server was restarted after updates

## Performance

- `useMemo` for expensive calculations
- `requestAnimationFrame` for smooth dragging
- History limited to 20 states
- Virtual scrolling via overflow management

## Dependencies

- **React** - UI library
- **lucide-react** - Icons
- **xlsx** - Excel import/export
- **@/api/ganttApi** - API client

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `N` | Add new task |
| `E` | Edit selected task |
| `Delete` | Delete selected task |
| `Ctrl+Z` | Undo |
| `Ctrl+Y` | Redo |
| `←/→` | Navigate tutorial steps |
| `ESC` | Close modal / Exit tutorial
