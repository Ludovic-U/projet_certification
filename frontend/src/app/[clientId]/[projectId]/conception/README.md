# Conception Page (`conception/page.tsx`)

## Overview

This file contains the **GanttChart** component, a full-featured project planning and task management interface. It's located at `frontend/src/app/[clientId]/[projectId]/conception/page.tsx` and renders a visual Gantt chart for project conception and task management.

## File Structure

```
frontend/src/app/[clientId]/[projectId]/
├── conception/
│   └── page.tsx          # Main Gantt chart component
└── data.ts               # Type definitions and sample data
```

## Data Types

### Task Interface

The core data model for tasks in the Gantt chart:

```typescript
interface Task {
  id: number;                    // Unique identifier
  text: string;                  // Task name
  start: Date;                   // Start date
  end: Date;                     // End date
  progress: number;              // 0-100 completion percentage
  parent: number;                // Parent task ID (0 for root tasks)
  type: 'task' | 'milestone' | 'project';
  details: string;               // Description
  notes: string;                 // Additional notes
  files: string[];               // Attached file URLs
  to1: number;                   // Primary assignee ID
  to2: number;                   // Secondary assignee ID
  budget?: {
    personnelDays: number;
    personnelCost: number;
    internsDays: number;
    internsCost: number;
    fittingsCost: number;
    educationalEquipmentCost: number;
    subcontractorCost: number;
    travelCost: number;
    otherPrestationsCost: number;
    communicationCost: number;
    overheadRate: number;
  };
}
```

### Task Types

| Type | Description | Visual |
|------|-------------|--------|
| `task` | Regular task | Rounded rectangle bar |
| `milestone` | Single-point milestone | Diamond shape |
| `project` | Parent container task | Square indicator |

### Link Interface

Represents dependencies between tasks:

```typescript
interface Link {
  id: number;
  source: number;  // Source task ID
  target: number;  // Target task ID
  type: number;    // Dependency type (currently unused)
}
```

### User Interface

Simple user/assignee model:

```typescript
interface User {
  id: number;
  label: string;   // Display name
}
```

## Key Features

### 1. Interactive Timeline

- **Drag-and-drop**: Click and drag task bars to move them in time
- **Resizing**: Drag left/right edges to adjust task duration
- **Progress tracking**: Drag the progress bar to update completion percentage
- **Zoom controls**: Zoom in/out for day, week, or month views
- **Today navigation**: Jump to current date

### 2. Task Management

- **Create tasks**: Add new tasks with the "Add Task" button
- **Hierarchical tasks**: Create child tasks via context menu
- **Edit tasks**: Double-click or use context menu to edit
- **Delete tasks**: Remove via context menu or editor
- **Task hierarchy**: Expand/collapse parent tasks

### 3. View Modes

| Mode | Description | Default Width |
|------|-------------|---------------|
| `day` | Daily view | 24px per day |
| `week` | Weekly view (ISO weeks) | 18px per day |
| `month` | Monthly view | 6px per day |

### 4. Editor Tabs

The task editor has 7 tabs for different aspects:

1. **General**: Basic task info (name, type, dates, progress, assignees)
2. **Moyen humain**: Personnel days and costs
3. **Interns**: Intern-related budget tracking
4. **Amenagements**: Fittings/renovation costs
5. **Equipements pedagogiques**: Educational equipment costs
6. **Prestations**: Subcontractor, travel, other costs + overhead
7. **Communications**: Communication costs

### 5. Budget Tracking

Each task can have an associated budget with:
- Personnel costs (days & monetary)
- Intern costs (days & monetary)
- Fittings/renovations
- Educational equipment
- Subcontractor services
- Travel expenses
- Other prestations
- Communication expenses
- Overhead rate calculation

**Budget Total Calculation**:
```
Total = Subtotal + (Subtotal × OverheadRate%)
```

## Component Architecture

### Main State

```typescript
const [tasks, setTasks]          // Task list
const [links, setLinks]          // Task dependencies
const [viewMode, setViewMode]    // 'day' | 'week' | 'month'
const [pxPerDay, setPxPerDay]    // Pixels per day (zoom level)
const [expandedTasks, setExpandedTasks]  // Expanded parent tasks
const [history, setHistory]      // Undo/redo history
const [historyIndex, setHistoryIndex]    // Current history position
const [selectedTask, setSelectedTask]    // Currently selected task (sidebar)
const [editingTask, setEditingTask]      // Task being edited (modal)
const [showEditor, setShowEditor]        // Editor modal visibility
```

### Date Utilities

All date operations use **UTC** to avoid timezone issues:

- `toUTC(d: Date)`: Convert to UTC timestamp
- `startOfDay(d: Date)`: Get start of day in UTC
- `startOfWeekMon(d: Date)`: Get Monday of the week
- `startOfMonth(d: Date)`: Get first day of month
- `addDays/Weeks/Months`: Add time periods
- `daysInMonth(d: Date)`: Get days in month
- `getISOWeek(date: Date)`: Get ISO week number

### Column Generation

The timeline is rendered using dynamically generated columns:

```typescript
generateColumns(): { groups: Group[]; columns: Column[] }
```

- **Groups**: Higher-level groupings (years for month view, months for day/week)
- **Columns**: Individual time units (days, weeks, or months)

## Interactions

### Dragging System

The component uses `requestAnimationFrame` for smooth dragging:

```typescript
// Ref-based drag state
const rafId = useRef<number | null>(null);           // Animation frame ID
const pendingDeltaPx = useRef<number | null>(null);  // Pending delta
const draggingIdsRef = useRef<Set<number>>(new Set());  // Affected task IDs
const dragStartMapRef = useRef<Map<number, { start: number; end: number }>>();  // Original positions
```

### Mouse Event Handlers

| Handler | Purpose |
|---------|---------|
| `handleMouseDown` | Initiate drag/resize/progress change |
| `handleMouseMove` | Update position during drag |
| `handleMouseUp` | Finalize drag and save state |
| `handleTaskContextMenu` | Show right-click context menu |
| `handleTaskMouseEnter/Leave` | Show/hide tooltips |

### History Management (Undo/Redo)

```typescript
const saveState = (nextTasks, nextLinks) => {
  // Adds current state to history array
  // Keeps last 20 states
  // Updates historyIndex
}

const undo = () => { /* Restore previous state */ }
const redo = () => { /* Restore next state */ }
```

## User Interface Elements

### Toolbar Controls

| Control | Icon | Description |
|---------|------|-------------|
| Undo | ↩️ | Undo last action |
| Redo | ↪️ | Redo undone action |
| Day/Week/Month | text | View mode切换 |
| Zoom In/Out | 🔍+/🔍- | Adjust zoom level |
| Today | "Today" | Jump to current date |
| Add Task | + | Create new task |
| Export/Import | 📥/📤 | JSON export/import |

### Task List Panel (Left)

Displays task hierarchy with:
- Task name (with hierarchy indentation)
- Start date
- Assignees
- Progress percentage + visual bar

### Timeline Panel (Right)

- Sticky headers (groups + units)
- Today marker (red vertical line)
- Cursor date indicator
- Grid lines for time units
- Task bars with resize handles

### Sidebar (Task Summary)

When a task is clicked, shows:
- Task details (name, type, dates, progress)
- Assignees
- Description
- Editable notes
- File attachments
- Delete option

### Context Menu

Right-click on task provides:
- Add Child Task
- Edit Task
- Delete Task

### Editor Modal

Full-featured task editor with:
- Tabbed interface for different aspects
- Budget tracking per tab
- Auto-calculated budget totals
- Save/Delete actions

## Rendering Constants

```typescript
const ROW_HEIGHT = 60;  // px - Height of each task row

const DEFAULT_DAY_WIDTH: Record<'day' | 'week' | 'month', number> = {
  day: 24,    // 24px per day
  week: 18,   // 18px per day
  month: 6,   // 6px per day
};
```

## Color Coding

Task bar colors indicate progress:

| Progress | Color | RGB/Hex |
|----------|-------|---------|
| 100% | Green | `#00C000` |
| 75-99% | Emerald | `#10b981` |
| 50-74% | Amber | `#f59e0b` |
| 1-49% | Red | `#FF0000` |
| 0% | Gray | `#6b7280` |

## API Integration Notes

Currently, `getData()` returns static sample data from [`data.ts`](data.ts). For production:

1. Replace `getData()` with API call to fetch tasks
2. Implement `saveTask()` to persist changes
3. Add real-time updates via WebSocket or polling
4. Integrate with backend endpoints for task CRUD

### Suggested Backend Endpoints

```
GET    /api/clients/:clientId/projects/:projectId/tasks
POST   /api/clients/:clientId/projects/:projectId/tasks
PUT    /api/clients/:clientId/projects/:projectId/tasks/:id
DELETE /api/clients/:clientId/projects/:projectId/tasks/:id
GET    /api/clients/:clientId/projects/:projectId/links
POST   /api/clients/:clientId/projects/:projectId/links
DELETE /api/clients/:clientId/projects/:projectId/links/:id
```

## Dependencies

- **React**: UI library
- **lucide-react**: Icons (Calendar, Plus, Trash2, Save, Download, Upload, Edit, X, ChevronDown, ChevronRight, Undo, Redo, MoreHorizontal, ZoomIn, ZoomOut, GripVertical)
- **@/components/ui**: PageHeader component

## Styling

Uses Tailwind CSS with:
- Slate color palette for dark theme
- Flexbox for layout
- Fixed positioning for overlays (modals, tooltips, context menus)
- CSS transitions for hover effects
- `clip-path` for milestone diamond shape

## Performance Considerations

- `useMemo` for expensive calculations (columns, date range)
- `requestAnimationFrame` for smooth 60fps dragging
- Virtual scrolling (via overflow management)
- Limited history to 20 states

## Accessibility Notes

- Keyboard navigation not fully implemented
- Focus indicators present
- Semantic HTML structure (tables, buttons)
- ARIA labels could be improved

## Common Issues & Solutions

### Issue: Tasks not saving
**Solution**: Ensure `saveState()` is called after modifications

### Issue: Dragging not smooth
**Solution**: Check `rafId` and `requestAnimationFrame` cleanup in `handleMouseUp`

### Issue: Timezone offset
**Solution**: All dates use UTC utilities; avoid mixing Date methods

### Issue: Editor not opening
**Solution**: Check `editingTask` and `showEditor` state synchronization

## Future Improvements

1. **Task dependencies**: Visual links between tasks
2. **Critical path**: Highlight critical path
3. **Resource view**: Show resource allocation
4. **Baseline**: Compare against baseline plan
5. **Export**: PDF/PNG export options
6. **Collaborative editing**: Real-time sync
7. **Keyboard shortcuts**: Full keyboard navigation
8. **Filters**: Filter by assignee, status, etc.
9. **Search**: Find tasks by name
10. **Custom columns**: Configurable task list columns

## File Dependencies

- [`../data.ts`](data.ts): Type definitions and sample data
- `@/components/ui/PageHeader`: Page header component
- `lucide-react`: Icon library

## Navigation Context

This page is part of a larger Next.js app with dynamic routes:

```
/:clientId/:projectId/conception
├── [clientId] - Client identifier
└── [projectId] - Project identifier
```

Related pages:
- `/reporting` - Project reporting
- `/pilotage` - Project pilotage
- `/evaluation` - Project evaluation
- `/swot` - SWOT analysis
- `/vue_ensemble` - Overview page
- `/ideation` - Ideation page
