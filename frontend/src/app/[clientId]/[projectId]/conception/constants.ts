import { ViewMode } from './types';

export const ROW_HEIGHT = 60; // px

// Default per-day widths by view
export const DEFAULT_DAY_WIDTH: Record<ViewMode, number> = {
  day: 24,
  week: 18,
  month: 6,
};

// Date utilities constants
export const DAY_MS = 24 * 60 * 60 * 1000;

// Minimum start date for timeline
export const MIN_START_DATE = new Date(2026, 0, 1);

// Maximum history states to keep
export const MAX_HISTORY_STATES = 20;

// Zoom limits
export const MIN_PX_PER_DAY = 4;
export const MAX_PX_PER_DAY = 48;

// Resize handle width in pixels
export const RESIZE_HANDLE_WIDTH = 10;

// Progress bar width in pixels
export const PROGRESS_BAR_WIDTH = 64; // w-16 = 64px
