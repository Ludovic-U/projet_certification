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
│   ├── GanttTaskSummary.tsx     # Task details sidebar
│   ├── GanttTooltip.tsx         # Hover tooltips
│   ├── GanttContextMenu.tsx     # Right-click context menu
│   └── PortalMenu.tsx          # Portal-based menu
└── utils/
    ├── dateUtils.ts       # Date manipulation utilities
    ├── timelineUtils.ts   # Timeline generation
    ├── taskUtils.ts       # Task helpers
    └── budgetUtils.ts     # Budget calculations
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
  livrableIds: number[];  // Related deliverable IDs
  goal?: string;          // Task objective
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

**Import process:**
1. Parse file
2. Create tasks with temporary IDs
3. Sort parents before children
4. Save to API with ID mapping
5. Update parent references with new IDs

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

### API Functions (ganttApi.ts)

```typescript
fetchGanttData(projectId): Promise<GanttData>
createTask(projectId, taskData): Promise<Task>
updateTask(projectId, taskId, taskData): Promise<Task>
deleteTask(projectId, taskId): Promise<void>
bulkUpdateTasks(projectId, tasks): Promise<void>
createTaskLink(projectId, linkData): Promise<Link>
deleteTaskLink(projectId, linkId): Promise<void>
createDeliverable(projectId, data): Promise<Livrable>
fetchSubActions(projectId): Promise<SubAction[]>
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
