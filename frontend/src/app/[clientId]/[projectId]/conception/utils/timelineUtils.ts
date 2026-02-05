import { ViewMode, Column, Group, DateRange, Task } from '../types';
import { DAY_MS } from '../constants';
import { startOfDay, startOfWeekMon, startOfMonth, endOfMonth, addMonths, addWeeks, addDays, daysInMonth } from './dateUtils';

// Generate timeline columns and groups based on the current view mode
export const generateColumns = (
  viewMode: ViewMode,
  baseStart: Date,
  dateRange: DateRange,
  pxPerDay: number
): { groups: Group[]; columns: Column[] } => {
  const cols: Column[] = [];

  if (viewMode === 'month') {
    // Month columns: each full month
    let cursor = startOfMonth(baseStart);
    const end = dateRange.end;
    while (cursor <= end) {
      const days = daysInMonth(cursor);
      const width = days * pxPerDay;
      cols.push({
        key: `${cursor.getUTCFullYear()}-${cursor.getUTCMonth()}`,
        start: new Date(cursor),
        end: endOfMonth(cursor),
        label: cursor.toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' }),
        width,
      });
      cursor = startOfMonth(addMonths(cursor, 1));
    }
  } else if (viewMode === 'week') {
    // ISO weeks, Monday start
    let cursor = startOfWeekMon(baseStart);
    const end = dateRange.end;
    while (cursor <= end) {
      const width = 7 * pxPerDay;
      const week = getISOWeek(cursor);
      const year = getISOWeekYear(cursor);
      cols.push({
        key: `W${week}-${year}-${cursor.getTime()}`,
        start: new Date(cursor),
        end: addDays(cursor, 6),
        label: `S${week} ${year}`,
        width,
      });
      cursor = addWeeks(cursor, 1);
    }
  } else {
    // Day columns
    let cursor = startOfDay(baseStart);
    const end = dateRange.end;
    while (cursor <= end) {
      cols.push({
        key: `${cursor.getTime()}`,
        start: new Date(cursor),
        end: new Date(cursor),
        label: cursor.toLocaleDateString('fr-FR', { weekday: 'short', day: '2-digit', month: 'short' }),
        width: pxPerDay,
      });
      cursor = addDays(cursor, 1);
    }
  }

  // Groups: months for day/week, years for month
  const groups: Group[] = [];
  if (viewMode === 'month') {
    // Group by year
    let currentYear = cols.length ? cols[0].start.getUTCFullYear() : undefined;
    let acc = 0;
    for (const c of cols) {
      const y = c.start.getUTCFullYear();
      if (currentYear === undefined) currentYear = y;
      if (y !== currentYear) {
        groups.push({ key: `${currentYear}`, label: `${currentYear}`, width: acc });
        currentYear = y;
        acc = 0;
      }
      acc += c.width;
    }
    if (currentYear !== undefined) groups.push({ key: `${currentYear}`, label: `${currentYear}`, width: acc });
  } else {
    // Group by month name + year
    let currentMonth = cols.length ? `${cols[0].start.getUTCFullYear()}-${cols[0].start.getUTCMonth()}` : undefined;
    let currentLabel = cols.length ? cols[0].start.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' }) : '';
    let acc = 0;
    for (const c of cols) {
      const key = `${c.start.getUTCFullYear()}-${c.start.getUTCMonth()}`;
      if (currentMonth === undefined) currentMonth = key;
      if (key !== currentMonth) {
        groups.push({ key: currentMonth, label: currentLabel, width: acc });
        currentMonth = key;
        currentLabel = c.start.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
        acc = 0;
      }
      acc += c.width;
    }
    if (currentMonth !== undefined) groups.push({ key: currentMonth, label: currentLabel, width: acc });
  }

  return { groups, columns: cols };
};

// ISO week helpers
const getISOWeek = (date: Date) => {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d.getTime() - yearStart.getTime()) / DAY_MS) + 1) / 7);
};

const getISOWeekYear = (date: Date) => {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
  return d.getUTCFullYear();
};

// Get aligned base start depending on view
export const getBaseStart = (viewMode: ViewMode, dateRange: DateRange): Date => {
  if (viewMode === 'week') return startOfWeekMon(dateRange.start);
  if (viewMode === 'day') return startOfDay(dateRange.start);
  return startOfMonth(dateRange.start);
};

// Calculate date range for the timeline based on existing tasks
export const getDateRange = (tasks: Task[], minStartDate: Date): DateRange => {
  const today = new Date();
  let start = new Date(today.getFullYear(), 0, 1);
  let end = new Date(today.getFullYear() + 1, 11, 31);

  if (tasks.length > 0) {
    const dates = tasks.flatMap((t: Task) => [t.start.getTime(), t.end.getTime()]);
    const minDate = new Date(Math.min(...dates));
    const maxDate = new Date(Math.max(...dates));

    if (minDate < start) start = new Date(minDate);
    start.setDate(1);
    if (maxDate > end) end = new Date(maxDate.getFullYear(), maxDate.getMonth() + 1, 0);
  }

  // Expand by margins to give breathing room (no margin on start to avoid previous years)
  let s = new Date(start);
  const e = new Date(end);
  s.setMonth(s.getMonth());
  e.setMonth(e.getMonth() + 1);
  // Ensure timeline does not start before minStartDate
  if (s < minStartDate) s = minStartDate;
  return { start: s, end: e };
};
