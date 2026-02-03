import { Task, Link, Livrable } from '../data';

export type { Task, Link, Livrable };

export interface ImportedTask extends Omit<Task, 'start' | 'end'> {
  start: string;
  end: string;
}

export interface SelectOption {
  value: number;
  label: string;
}

export type ViewMode = 'day' | 'week' | 'month';

export type EditorTab = 'general' | 'moyenHumain' | 'interns' | 'amenagements' | 'equipementsPedagogiques' | 'prestations' | 'communications';

export interface Column {
  key: string;
  start: Date;
  end: Date;
  label: string;
  width: number;
}

export interface Group {
  key: string;
  label: string;
  width: number;
}

export interface ContextMenuState {
  task: Task;
  x: number;
  y: number;
}

export interface DraggingProgressState {
  task: Task;
  startX: number;
  startProgress: number;
}

export interface ResizingTaskState {
  task: Task;
  side: 'left' | 'right';
}

export interface DateRange {
  start: Date;
  end: Date;
}

export interface HistoryState {
  tasks: Task[];
  links: Link[];
}

export interface MenuPosition {
  top: number;
  left: number;
}

export interface TooltipPosition {
  x: number;
  y: number;
}
