"use client";

/**
 * Gantt Chart Component for Project Conception
 * This component provides a full-featured Gantt chart for managing project tasks,
 * including drag-and-drop, resizing, progress tracking, and timeline visualization.
 */

import React, { useMemo, useState, useRef, useEffect } from 'react';
import { Calendar, Plus, Trash2, Save, Download, Upload, Edit, X, ChevronDown, ChevronRight, Undo, Redo, MoreHorizontal, ZoomIn, ZoomOut, GripVertical } from 'lucide-react';
import { PageHeader } from '@/components/ui';
import { getData, Task, Link } from '../data';

interface ImportedTask extends Omit<Task, 'start' | 'end'> {
  start: string;
  end: string;
}

const ROW_HEIGHT = 60; // px

// Default per-day widths by view
const DEFAULT_DAY_WIDTH: Record<'day' | 'week' | 'month', number> = {
  day: 24,
  week: 18,
  month: 6,
};

// Date utilities (UTC-safe)
const DAY_MS = 24 * 60 * 60 * 1000;
const toUTC = (d: Date) => Date.UTC(d.getFullYear(), d.getMonth(), d.getDate());
const startOfDay = (d: Date) => new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
const startOfWeekMon = (d: Date) => {
  const sd = startOfDay(d);
  const dow = (sd.getUTCDay() + 6) % 7; // 0=Mon, ... 6=Sun
  return new Date(sd.getTime() - dow * DAY_MS);
};
const startOfMonth = (d: Date) => new Date(Date.UTC(d.getFullYear(), d.getMonth(), 1));
const endOfMonth = (d: Date) => new Date(Date.UTC(d.getFullYear(), d.getMonth() + 1, 0));
const addDays = (d: Date, days: number) => new Date(d.getTime() + days * DAY_MS);
const addWeeks = (d: Date, weeks: number) => addDays(d, weeks * 7);
const addMonths = (d: Date, months: number) => new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + months, d.getUTCDate()));
const daysInMonth = (d: Date) => new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + 1, 0)).getUTCDate();

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

const isDateInRange = (d: Date, start: Date, end: Date) => {
  const du = toUTC(d), su = toUTC(start), eu = toUTC(end);
  return du >= su && du <= eu;
};

/**
 * Main Gantt Chart Component
 * Handles the entire Gantt chart interface including task management, timeline rendering, and user interactions.
 */
const GanttChart = () => {
  

  // Load initial data from the data source
  const [data, setDate] = useState<{ tasks: Task[]; links: Link[]; users: any[] }> ({
    tasks: [],
    links: [],
    users: [],
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    
    getData()
    .then((res)=> {
      if (mounted) {
        setData(res);
        setTasks(res.tasks);
        setLinks(res.links);
        setHistory([{ tasks: res.tasks, links: res.links }]);
      }
    })
    .catch(console.error)
    .finally(() => mounted && setLoading(false));

    return () => {
      mounted = false;
    }
  }, []);

    if (loading) {
  return (
    <div className="flex items-center justify-center h-screen text-white">
      Loading Gantt…
    </div>
  );
}
  

  // State for tasks and links
  const [tasks, setTasks] = useState<Task[]>([]);
  const [links, setLinks] = useState<Link[]>([]);

  // UI state for editing and interactions
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [showEditor, setShowEditor] = useState(false);
  const [hoveredTask, setHoveredTask] = useState<Task | null>(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });
  const [contextMenu, setContextMenu] = useState<{ task: Task; x: number; y: number } | null>(null);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  // Timeline view settings
  const [viewMode, setViewMode] = useState<'day' | 'week' | 'month'>('month');
  const [pxPerDay, setPxPerDay] = useState<number>(DEFAULT_DAY_WIDTH['month']);
  const [expandedTasks, setExpandedTasks] = useState<Set<number>>(new Set([0]));

  // History for undo/redo functionality
  const [history, setHistory] = useState<{ tasks: Task[]; links: Link[] }[]>([{ tasks: data.tasks, links: data.links }]);
  const [historyIndex, setHistoryIndex] = useState(0);

  // Dragging and interaction state
  const [draggingTask, setDraggingTask] = useState<Task | null>(null);
  const [resizingTask, setResizingTask] = useState<{ task: Task; side: 'left' | 'right' } | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [wasDragged, setWasDragged] = useState(false);
  const [draggingProgress, setDraggingProgress] = useState<{task: Task, startX: number, startProgress: number} | null>(null);
  const [isDraggingAny, setIsDraggingAny] = useState(false);
  const [dragStartPositions, setDragStartPositions] = useState<Map<number, { start: Date; end: Date }>>(new Map());

  // Refs for smooth dragging animation
  const rafId = useRef<number | null>(null);
  const pendingDeltaPx = useRef<number | null>(null);
  const draggingIdsRef = useRef<Set<number>>(new Set());
  const dragStartMapRef = useRef<Map<number, { start: number; end: number }>>(new Map());
  const draggingActiveRef = useRef(false);
  const lastClientXRef = useRef<number | null>(null);

  // Cursor position for timeline interaction
  const [cursorX, setCursorX] = useState<number | null>(null);

  // Current visible date range for the timeline
  const [currentDateRange, setCurrentDateRange] = useState(() => {
    if (data.tasks.length === 0) {
      const today = new Date();
      return {
        start: new Date(today.getFullYear(), 0, 1),
        end: new Date(today.getFullYear(), 11, 31)
      };
    }
    const dates = data.tasks.flatMap(t => [t.start.getTime(), t.end.getTime()]);
    const minDate = new Date(Math.min(...dates));
    const maxDate = new Date(Math.max(...dates));
    minDate.setDate(1);
    const end = new Date(maxDate.getFullYear(), maxDate.getMonth() + 1, 0);
    return { start: minDate, end };
  });

  // Refs for DOM elements
  const timelineRef = useRef<HTMLDivElement>(null);
  const taskListRef = useRef<HTMLDivElement>(null);

  // Reset pxPerDay on view change to sensible defaults
  useEffect(() => {
    setPxPerDay(DEFAULT_DAY_WIDTH[viewMode]);
  }, [viewMode]);

  /**
   * Calculates the date range for the timeline based on existing tasks
   * Expands the range with margins and ensures it doesn't start before 2026
   */
  const getDateRange = () => {
    const today = new Date();
    let start = new Date(today.getFullYear(), 0, 1);
    let end = new Date(today.getFullYear() + 1, 11, 31);

    if (tasks.length > 0) {
      const dates = tasks.flatMap(t => [t.start.getTime(), t.end.getTime()]);
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
    // Ensure timeline does not start before 2026
    const minStart = new Date(2026, 0, 1);
    if (s < minStart) s = minStart;
    return { start: s, end: e };
  };

  const dateRange = currentDateRange;

  useEffect(() => {
    setCurrentDateRange(getDateRange());
  }, [tasks, isDraggingAny]);

  // Aligned base start depending on view
  const baseStart = useMemo(() => {
    if (viewMode === 'week') return startOfWeekMon(dateRange.start);
    if (viewMode === 'day') return startOfDay(dateRange.start);
    return startOfMonth(dateRange.start);
  }, [viewMode, dateRange]);

  // Scale helpers
  const xFromDate = (d: Date) => ((toUTC(d) - toUTC(baseStart)) / DAY_MS) * pxPerDay;
  const dateFromX = (x: number) => addDays(baseStart, x / pxPerDay);
  const today = startOfDay(new Date());
  const todayX = xFromDate(today);
  const scrollToDate = (d: Date) => {
    const el = timelineRef.current;
    if (!el) return;
    const x = xFromDate(d);
    el.scrollLeft = Math.max(0, x - el.clientWidth / 2);
  };

  type Column = { key: string; start: Date; end: Date; label: string; width: number };
  type Group = { key: string; label: string; width: number };

  /**
   * Generates timeline columns and groups based on the current view mode
   * Creates columns for days/weeks/months and groups them for header display
   */
  const generateColumns = (): { groups: Group[]; columns: Column[] } => {
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
          label: cursor.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
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
          key: `W${week}-${year}-${toUTC(cursor)}`,
          start: new Date(cursor),
          end: addDays(cursor, 6),
          label: `W${week} ${year}`,
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
          key: `${toUTC(cursor)}`,
          start: new Date(cursor),
          end: new Date(cursor),
          label: cursor.toLocaleDateString('en-US', { weekday: 'short', day: '2-digit', month: 'short' }),
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
      let currentLabel = cols.length ? cols[0].start.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : '';
      let acc = 0;
      for (const c of cols) {
        const key = `${c.start.getUTCFullYear()}-${c.start.getUTCMonth()}`;
        if (currentMonth === undefined) currentMonth = key;
        if (key !== currentMonth) {
          groups.push({ key: currentMonth, label: currentLabel, width: acc });
          currentMonth = key;
          currentLabel = c.start.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
          acc = 0;
        }
        acc += c.width;
      }
      if (currentMonth !== undefined) groups.push({ key: currentMonth, label: currentLabel, width: acc });
    }

    return { groups, columns: cols };
  };

  const { groups, columns } = useMemo(generateColumns, [viewMode, pxPerDay, baseStart, dateRange]);
  const totalTimelineWidth = useMemo(() => columns.reduce((s, c) => s + c.width, 0), [columns]);

  const getTaskStyle = (task: Task) => {
    const taskStart = new Date(task.start);
    const taskEnd = new Date(task.end);
    const left = xFromDate(taskStart);
    const width = Math.max(1, xFromDate(taskEnd) - xFromDate(taskStart));
    return {
      left: `${Math.max(0, left)}px`,
      width: `${width}px`
    };
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: '2-digit', 
      day: '2-digit' 
    });
  };

  const getAssignees = (task: Task) => {
    return [task.to1, task.to2]
      .map(id => data.users.find(u => u.id === id)?.label)
      .filter(Boolean)
      .join(', ');
  };

  /**
   * Creates a new task with default values and opens the editor
   */
  const addTask = () => {
    const newTask: Task = {
      id: Math.max(...tasks.map(t => t.id), 0) + 1,
      text: 'New Task',
      start: new Date(),
      end: new Date(),
      progress: 0,
      parent: 0,
      type: 'task',
      details: 'New task description',
      notes: '',
      files: [],
      to1: 1,
      to2: 2
    };
    const nextTasks = [...tasks, newTask];
    setTasks(nextTasks);
    saveState(nextTasks, links);
    setEditingTask(newTask);
    setShowEditor(true);
  };

  const addChildTask = (parentId: number) => {
    const newTask: Task = {
      id: Math.max(...tasks.map(t => t.id), 0) + 1,
      text: 'New Subtask',
      start: new Date(),
      end: new Date(Date.now() + 7 * DAY_MS),
      progress: 0,
      parent: parentId,
      type: 'task',
      details: 'New subtask description',
      notes: '',
      files: [],
      to1: 1,
      to2: 2
    };
    const nextTasks = [...tasks, newTask];
    setTasks(nextTasks);
    saveState(nextTasks, links);
    setContextMenu(null);
  };

  const deleteTask = (id: number) => {
    const nextTasks = tasks.filter(t => t.id !== id);
    const nextLinks = links.filter(l => l.source !== id && l.target !== id);
    setTasks(nextTasks);
    setLinks(nextLinks);
    saveState(nextTasks, nextLinks);
    setShowEditor(false);
    setContextMenu(null);
  };

  const updateTask = () => {
    if (editingTask) {
      if (editingTask.type !== 'milestone' && editingTask.start > editingTask.end) {
        alert('Start date must be before end date');
        return;
      }
      const nextTasks = tasks.map(t => t.id === editingTask.id ? editingTask : t);
      setTasks(nextTasks);
      saveState(nextTasks, links);
    }
    setShowEditor(false);
    setEditingTask(null);
  };

  const exportData = () => {
    const dataStr = JSON.stringify({ tasks, links }, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'gantt-chart.json';
    link.click();
  };

  const importData = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const result = event.target?.result;
          if (typeof result === 'string') {
            const imported = JSON.parse(result);
            const nextTasks: Task[] = imported.tasks
              ? imported.tasks.map((t: ImportedTask) => ({
                  ...t,
                  start: new Date(t.start),
                  end: new Date(t.end),
                }))
              : tasks;
            const nextLinks: Link[] = imported.links ? imported.links : links;
            setTasks(nextTasks);
            setLinks(nextLinks);
            saveState(nextTasks, nextLinks);
          }
        } catch {
          alert('Invalid file format');
        }
      };
      reader.readAsText(file);
    }
  };

  const handleTaskMouseEnter = (task: Task, e: React.MouseEvent<HTMLElement>) => {
    setHoveredTask(task);
    setTooltipPos({ x: e.clientX, y: e.clientY });
  };

  const handleTaskMouseLeave = () => {
    setHoveredTask(null);
  };

  const handleTaskContextMenu = (task: Task, e: React.MouseEvent<HTMLElement>) => {
    e.preventDefault();
    setContextMenu({
      task,
      x: e.clientX,
      y: e.clientY
    });
  };

  const getTaskColor = (progress: number) => {
    if (progress === 100) return '#00C000';
    if (progress >= 75) return '#10b981';
    if (progress >= 50) return '#f59e0b';
    if (progress > 0) return '#FF0000';
    return '#6b7280';
  };

  const getVisibleTasks = () => {
    const visible: Task[] = [];
    const processTasks = (parentId: number, level: number) => {
      tasks
        .filter(t => t.parent === parentId)
        .forEach(task => {
          visible.push(task);
          if (expandedTasks.has(task.id)) {
            processTasks(task.id, level + 1);
          }
        });
    };
    processTasks(0, 0);
    return visible;
  };

  const getTaskDepth = (taskId: number) => {
    let depth = 0;
    const currentTask = tasks.find(t => t.id === taskId);
    if (!currentTask) return 0;
    let task: Task = currentTask;
    while (task.parent !== 0) {
      const parentTask = tasks.find(t => t.id === task.parent);
      if (!parentTask) break;
      depth++;
      task = parentTask;
    }
    return depth;
  };

  const getDirectChildren = (taskId: number): Task[] => {
    return tasks.filter(t => t.parent === taskId);
  };

  const saveState = (nextTasks: Task[] = tasks, nextLinks: Link[] = links) => {
    const newState = { tasks: [...nextTasks], links: [...nextLinks] };
    setHistory(prev => {
      const newHistory = prev.slice(0, historyIndex + 1);
      newHistory.push(newState);
      return newHistory.slice(-20); // Keep last 20 states
    });
    setHistoryIndex(prev => Math.min(prev + 1, 19));
  };

  const undo = () => {
    if (historyIndex > 0) {
      const prevState = history[historyIndex - 1];
      setTasks(prevState.tasks);
      setLinks(prevState.links);
      setHistoryIndex(historyIndex - 1);
    }
  };

  const redo = () => {
    if (historyIndex < history.length - 1) {
      const nextState = history[historyIndex + 1];
      setTasks(nextState.tasks);
      setLinks(nextState.links);
      setHistoryIndex(historyIndex + 1);
    }
  };

  /**
   * Handles mouse down on task bars for dragging or resizing
   * Determines if it's a drag or resize based on click position
   */
  const handleMouseDown = (task: Task, e: React.MouseEvent<HTMLDivElement>) => {
    setWasDragged(false);
    setIsDraggingAny(true);
    if (e.button === 2) return; // Right click, don't start dragging

    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const x = e.clientX - rect.left;
    const width = rect.width;
    const isNearLeft = x < 10;
    const isNearRight = x > width - 10;

    // For milestones, always drag (no resize) due to small hit area
    if (task.type !== 'milestone' && (isNearLeft || isNearRight)) {
      setResizingTask({ task, side: isNearLeft ? 'left' : 'right' });
      setDragOffset({ x: e.clientX, y: e.clientY });
    } else {
      // Store initial positions when drag starts
      const children = getDirectChildren(task.id);
      const positions = new Map<number, { start: Date; end: Date }>();
      positions.set(task.id, { start: new Date(task.start), end: new Date(task.end) });
      children.forEach(child => {
        positions.set(child.id, { start: new Date(child.start), end: new Date(child.end) });
      });

      setDraggingTask(task);
      setDragStartPositions(positions);
      // initialize rAF-based drag maps/refs
      dragStartMapRef.current = new Map(Array.from(positions.entries()).map(([id, p]) => [id, { start: p.start.getTime(), end: p.end.getTime() }]));
      draggingIdsRef.current = new Set(positions.keys());
      pendingDeltaPx.current = 0;
      draggingActiveRef.current = true;
      setDragOffset({ x: e.clientX, y: e.clientY });
    }
    e.preventDefault();
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (draggingTask || resizingTask || draggingProgress) {
      setWasDragged(true);
    }
    if (draggingProgress) {
      const deltaX = e.clientX - draggingProgress.startX;
      const width = 64; // w-16 = 64px
      const deltaProgress = (deltaX / width) * 100;
      const newProgress = Math.max(0, Math.min(100, draggingProgress.startProgress + deltaProgress));
      setTasks(tasks.map(t => t.id === draggingProgress.task.id ? {...t, progress: Math.round(newProgress)} : t));
    }
    if (draggingTask) {
      const deltaX = e.clientX - dragOffset.x;
      pendingDeltaPx.current = deltaX;
      if (!rafId.current) {
        rafId.current = requestAnimationFrame(tick);
      }
    } else if (resizingTask) {
      const deltaX = e.clientX - dragOffset.x;
      const deltaDays = deltaX / pxPerDay;

      let newStart = resizingTask.task.start;
      let newEnd = resizingTask.task.end;

      if (resizingTask.side === 'left') {
        newStart = new Date(resizingTask.task.start.getTime() + deltaDays * DAY_MS);
      } else {
        newEnd = new Date(resizingTask.task.end.getTime() + deltaDays * DAY_MS);
      }

      if (newStart < newEnd) {
        setTasks(tasks.map(t => t.id === resizingTask.task.id ? { ...t, start: newStart, end: newEnd } : t));
      }
    }
  };

  const handleMouseUp = () => {
    // stop rAF-based dragging
    if (rafId.current) {
      cancelAnimationFrame(rafId.current);
      rafId.current = null;
    }
    draggingActiveRef.current = false;
    pendingDeltaPx.current = null;
    dragStartMapRef.current.clear();
    draggingIdsRef.current.clear();
    let didSnap = false;
    if (draggingTask) {
      const affectedIds = new Set(dragStartPositions.keys());
      const nextTasks = tasks.map(t => {
        if (!affectedIds.has(t.id)) return t;
        const s = startOfDay(new Date(t.start));
        const e = t.type === 'milestone' ? s : startOfDay(new Date(t.end));
        return { ...t, start: s, end: e };
      });
      setTasks(nextTasks);
      saveState(nextTasks, links);
      didSnap = true;
    } else if (resizingTask) {
      const nextTasks = tasks.map(t => {
        if (t.id !== resizingTask.task.id) return t;
        const s = startOfDay(new Date(t.start));
        const e = t.type === 'milestone' ? s : startOfDay(new Date(t.end));
        return { ...t, start: s, end: e };
      });
      setTasks(nextTasks);
      saveState(nextTasks, links);
      didSnap = true;
    } else if (draggingProgress) {
      saveState();
    }
    if (!didSnap && !draggingProgress && (draggingTask || resizingTask)) {
      saveState();
    }
    setDraggingTask(null);
    setResizingTask(null);
    setDraggingProgress(null);
    setDragStartPositions(new Map());
    setIsDraggingAny(false);
  };

  const handleTaskListScroll = (e: React.UIEvent<HTMLDivElement>) => {
    if (timelineRef.current) {
      timelineRef.current.scrollTop = e.currentTarget.scrollTop;
    }
  };

  const handleTimelineScroll = (e: React.UIEvent<HTMLDivElement>) => {
    if (taskListRef.current) {
      taskListRef.current.scrollTop = e.currentTarget.scrollTop;
    }
    // Keep cursor date aligned while scrolling horizontally
    const scroller = timelineRef.current;
    const clientX = lastClientXRef.current;
    if (scroller && clientX !== null) {
      const rect = scroller.getBoundingClientRect();
      const x = (clientX - rect.left) + scroller.scrollLeft;
      const clamped = Math.max(0, Math.min(x, totalTimelineWidth));
      setCursorX(clamped);
    }
  };

  const zoomBy = (delta: number) => {
    const el = timelineRef.current;
    const min = 4;
    const max = 48;
    const next = Math.min(max, Math.max(min, pxPerDay + delta));
    if (!el || next === pxPerDay) {
      setPxPerDay(next);
      return;
    }
    const centerX = el.scrollLeft + el.clientWidth / 2;
    const centerDays = centerX / pxPerDay;
    setPxPerDay(next);
    // keep same center date
    const newCenterX = centerDays * next;
    el.scrollLeft = Math.max(0, newCenterX - el.clientWidth / 2);
  };

  // Smooth drag animation frame tick
  const tick = () => {
    rafId.current = null;
    const dx = pendingDeltaPx.current;
    if (dx === null) return;
    const deltaDays = dx / pxPerDay;
    const ids = draggingIdsRef.current;
    const baseMap = dragStartMapRef.current;
    if (ids.size === 0 || baseMap.size === 0) return;

    const nextTasks = tasks.map(t => {
      if (!ids.has(t.id)) return t;
      const base = baseMap.get(t.id);
      if (!base) return t;
      const newStart = new Date(base.start + deltaDays * DAY_MS);
      const newEnd = t.type === 'milestone' ? newStart : new Date(base.end + deltaDays * DAY_MS);
      return { ...t, start: newStart, end: newEnd };
    });
    setTasks(nextTasks);

    if (draggingActiveRef.current) {
      rafId.current = requestAnimationFrame(tick);
    }
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      {/* Page header */}
      <PageHeader
        title="Conception"
        description="Planification et gestion des tâches du projet"
      />
      <div className={`flex-1 bg-gradient-to-br from-slate-900 to-slate-800 flex flex-col overflow-hidden ${selectedTask ? 'pr-96' : ''}`}>
        {/* Toolbar with controls */}
        <div className="bg-slate-800 border-b border-slate-700 flex-shrink-0">
          <div className="flex items-center justify-between px-4 py-4 gap-4 flex-wrap">
            <div className="flex items-center gap-3">
              <Calendar className="w-7 h-7 text-blue-400" />
              <h1 className="text-2xl font-bold text-white">Project Gantt Chart</h1>
            </div>
            <div className="flex gap-2 flex-wrap items-center">
              <button
                onClick={undo}
                disabled={historyIndex === 0}
                className="p-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Undo className="w-4 h-4" />
              </button>
              <button
                onClick={redo}
                disabled={historyIndex === history.length - 1}
                className="p-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Redo className="w-4 h-4" />
              </button>
              <div className="flex gap-1">
                <button
                  onClick={() => setViewMode('day')}
                  className={`px-3 py-2 text-white rounded-lg transition-colors ${viewMode === 'day' ? 'bg-blue-600' : 'bg-slate-700 hover:bg-slate-600'}`}
                >
                  Day
                </button>
                <button
                  onClick={() => setViewMode('week')}
                  className={`px-3 py-2 text-white rounded-lg transition-colors ${viewMode === 'week' ? 'bg-blue-600' : 'bg-slate-700 hover:bg-slate-600'}`}
                >
                  Week
                </button>
                <button
                  onClick={() => setViewMode('month')}
                  className={`px-3 py-2 text-white rounded-lg transition-colors ${viewMode === 'month' ? 'bg-blue-600' : 'bg-slate-700 hover:bg-slate-600'}`}
                >
                  Month
                </button>
              </div>
              <div className="flex gap-1 ml-2">
                <button onClick={() => zoomBy(-2)} className="p-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600" title="Zoom out">
                  <ZoomOut className="w-4 h-4" />
                </button>
                <button onClick={() => zoomBy(2)} className="p-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600" title="Zoom in">
                  <ZoomIn className="w-4 h-4" />
                </button>
              </div>
              <button onClick={() => scrollToDate(today)} className="px-3 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600" title="Jump to today">Today</button>
              <button
                onClick={addTask}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors ml-2"
              >
                <Plus className="w-4 h-4" />
                Add Task
              </button>
              <div className="relative">
                <button
                  onClick={() => setMenuOpen(!menuOpen)}
                  className="p-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-colors"
                >
                  <MoreHorizontal className="w-4 h-4" />
                </button>
                {menuOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setMenuOpen(false)}
                    />
                    <div className="absolute right-0 top-full mt-2 bg-slate-800 border border-slate-700 rounded-lg shadow-xl py-1 z-50 min-w-[120px]">
                      <button
                        onClick={() => {
                          exportData();
                          setMenuOpen(false);
                        }}
                        className="w-full px-4 py-2 text-left text-white hover:bg-slate-700 flex items-center gap-2"
                      >
                        <Download className="w-4 h-4" />
                        Export
                      </button>
                      <label className="w-full px-4 py-2 text-left text-white hover:bg-slate-700 flex items-center gap-2 cursor-pointer">
                        <Upload className="w-4 h-4" />
                        Import
                        <input type="file" accept=".json" onChange={importData} className="hidden" />
                      </label>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Main Gantt Chart Area */}
        <div className="flex-1 overflow-hidden" onMouseMove={handleMouseMove} onMouseUp={handleMouseUp}>
          <div className="h-full flex bg-slate-800 overflow-hidden max-w-screen">
            {/* Left panel: Task list with details */}
            <div className="w-[32rem] border-r border-slate-700 bg-slate-800 flex flex-col overflow-hidden">
              <div className="flex-shrink-0 bg-slate-800 border-b border-slate-700">
                <table className="w-full">
                  <thead>
                    <tr>
                      <th className="text-left p-3 font-semibold text-white border-r border-slate-600">Task name</th>
                      <th className="text-left p-3 font-semibold text-white border-r border-slate-600">Start Date</th>
                      <th className="text-left p-3 font-semibold text-white border-r border-slate-600">Assignees</th>
                      <th className="text-left p-3 font-semibold text-white">Progress</th>
                    </tr>
                  </thead>
                </table>
              </div>
              <div ref={taskListRef} className="flex-1 overflow-y-auto" onScroll={handleTaskListScroll}>
                <table className="w-full">
                  <tbody>
                  {getVisibleTasks().map(task => {
                    const hasChildren = tasks.some(t => t.parent === task.id);
                    const isExpanded = expandedTasks.has(task.id);
                    const indent = getTaskDepth(task.id) * 20;
                    return (
                      <tr
                        key={task.id}
                        className="border-b border-slate-700 hover:bg-slate-700 cursor-pointer group"
                        onClick={() => {
                          if (wasDragged) {
                            setWasDragged(false);
                            return;
                          }
                          setSelectedTask(task);
                        }}
                        onDoubleClick={() => {
                          setEditingTask(task);
                          setShowEditor(true);
                        }}
                        onContextMenu={(e) => handleTaskContextMenu(task, e)}
                      >
                        <td className="p-3 border-r border-slate-600">
                          <div className="flex items-center" style={{ paddingLeft: `${indent}px` }}>
                            {hasChildren && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setExpandedTasks(prev => {
                                    const newSet = new Set(prev);
                                    if (isExpanded) {
                                      newSet.delete(task.id);
                                    } else {
                                      newSet.add(task.id);
                                    }
                                    return newSet;
                                  });
                                }}
                                className="mr-2 p-1 hover:bg-slate-600 rounded"
                              >
                                {isExpanded ? <ChevronDown className="w-4 h-4 text-slate-400" /> : <ChevronRight className="w-4 h-4 text-slate-400" />}
                              </button>
                            )}
                            {task.type === 'milestone' && (
                              <div
                                className="w-7 h-7 bg-purple-500 mr-2"
                                style={{ clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)' }}
                              ></div>
                            )}
                            <div className="font-medium text-white">{task.text} {task.type === 'project' ? '■' : ''}</div>
                          </div>
                        </td>
                        <td className="p-3 border-r border-slate-600 text-xs text-slate-400">
                          {formatDate(task.start)}
                        </td>
                        <td className="p-3 border-r border-slate-600 text-xs text-slate-400">
                          {getAssignees(task)}
                        </td>
                        <td className="p-3">
                          <div className="flex flex-col items-end">
                            <div className="text-xs text-slate-400 mb-1">{task.progress}%</div>
                            <div
                              className="w-16 bg-slate-700 rounded-full h-2 cursor-ew-resize"
                              onMouseDown={(e) => {
                                e.stopPropagation();
                                const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
                                const deltaX = e.clientX - rect.left;
                                const initialProgress = (deltaX / rect.width) * 100;
                                setDraggingProgress({task, startX: e.clientX, startProgress: initialProgress});
                              }}
                            >
                              <div
                                className="h-2 rounded-full transition-all"
                                style={{
                                  width: `${task.progress}%`,
                                  backgroundColor: getTaskColor(task.progress)
                                }}
                              />
                            </div>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteTask(task.id);
                              }}
                              className="opacity-0 group-hover:opacity-100 p-1 text-red-400 hover:bg-red-900/20 rounded transition-opacity mt-1"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              </div>
            </div>

            {/* Right panel: Scrollable timeline */}
            <div ref={timelineRef} className="flex-1 overflow-x-auto bg-slate-800 min-w-0" onScroll={handleTimelineScroll} onMouseMove={handleMouseMove} onMouseUp={handleMouseUp}>
              <div className="relative" style={{ width: `${totalTimelineWidth}px` }}>
                {/* Sticky timeline headers */}
                <div className="sticky top-0 z-20 bg-slate-800">
                  {/* Group row */}
                  <div className="flex border-b border-slate-700">
                    {groups.map((g) => (
                      <div
                        key={g.key}
                        className="px-3 py-2 text-center text-sm font-semibold text-slate-300 border-r border-slate-700"
                        style={{ width: `${g.width}px` }}
                      >
                        {g.label}
                      </div>
                    ))}
                  </div>
                  {/* Unit row */}
                  <div className="flex border-b border-slate-700">
                    {columns.map((col) => (
                      <div
                        key={col.key}
                        className={`px-3 py-2 text-center text-xs font-medium text-slate-300 border-r border-slate-700 ${isDateInRange(today, col.start, col.end) ? 'bg-slate-700/40' : ''}`}
                        style={{ width: `${col.width}px` }}
                      >
                        {col.label}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Task bars and grid lines */}
                <div className="relative" onMouseMove={(e) => { const scroller = timelineRef.current; if (!scroller) return; lastClientXRef.current = e.clientX; const rect = scroller.getBoundingClientRect(); const x = (e.clientX - rect.left) + scroller.scrollLeft; const clamped = Math.max(0, Math.min(x, totalTimelineWidth)); setCursorX(clamped); }} onMouseLeave={() => { lastClientXRef.current = null; setCursorX(null); }}>
                  {/* Today marker */}
                  <div className="pointer-events-none absolute top-0 bottom-0 w-[2px] bg-red-500/80 z-30" style={{ left: `${todayX}px` }} />
                  {cursorX !== null && (
                    <>
                      <div className="pointer-events-none absolute top-0 bottom-0 w-px bg-white/40 z-30" style={{ left: `${cursorX}px` }} />
                      <div className="pointer-events-none absolute z-30 -translate-x-1/2 -translate-y-1/2 text-xs bg-slate-900 text-slate-200 px-2 py-1 rounded border border-slate-700" style={{ top: 0, left: `${cursorX}px` }}>
                        {formatDate(startOfDay(dateFromX(cursorX)))}
                      </div>
                    </>
                  )}
                  {getVisibleTasks().map((task) => (
                    <div
                      key={task.id}
                      className="relative border-b border-slate-700"
                      style={{ height: `${ROW_HEIGHT}px` }}
                    >
                      {/* Grid lines */}
                      <div className="absolute inset-0 flex">
                        {columns.map((col) => (
                          <div
                            key={col.key}
                            className="border-r border-slate-700"
                            style={{ width: `${col.width}px` }}
                          />
                        ))}
                      </div>

                      {task.type === 'milestone' ? (
                        <div
                          className="absolute top-1/2 -translate-y-1/2 shadow-lg hover:shadow-xl transition-all cursor-move z-10"
                          style={{
                            left: `${xFromDate(new Date(task.start)) - 10}px`,
                            backgroundColor: '#a855f7',
                            width: '20px',
                            height: '20px',
                            clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)'
                          }}
                          onMouseDown={(e) => handleMouseDown(task, e as React.MouseEvent<HTMLDivElement>)}
                          onClick={() => {
                            if (wasDragged) {
                              setWasDragged(false);
                              return;
                            }
                            setSelectedTask(task);
                          }}
                          onDoubleClick={() => {
                            setEditingTask(task);
                            setShowEditor(true);
                          }}
                          onContextMenu={(e) => handleTaskContextMenu(task, e)}
                          onMouseEnter={(e) => handleTaskMouseEnter(task, e)}
                          onMouseLeave={handleTaskMouseLeave}
                          onMouseMove={(e) => setTooltipPos({ x: e.clientX, y: e.clientY })}
                        />
                      ) : (
                        <div
                          className="group absolute top-1/2 -translate-y-1/2 rounded-lg shadow-lg hover:shadow-xl transition-all cursor-move z-10"
                          style={{
                            ...getTaskStyle(task),
                            backgroundColor: getTaskColor(task.progress),
                            height: '32px'
                          }}
                          onMouseDown={(e) => handleMouseDown(task, e as React.MouseEvent<HTMLDivElement>)}
                          onClick={() => {
                            if (wasDragged) {
                              setWasDragged(false);
                              return;
                            }
                            setSelectedTask(task);
                          }}
                          onDoubleClick={() => {
                            setEditingTask(task);
                            setShowEditor(true);
                          }}
                          onContextMenu={(e) => handleTaskContextMenu(task, e)}
                          onMouseEnter={(e) => handleTaskMouseEnter(task, e)}
                          onMouseLeave={handleTaskMouseLeave}
                          onMouseMove={(e) => setTooltipPos({ x: e.clientX, y: e.clientY })}
                        >
                          {/* Resize handles */}
                          <div
                            className="absolute inset-y-0 left-0 w-4 cursor-ew-resize opacity-0 group-hover:opacity-100 transition-opacity bg-white/20 group-hover:bg-white/30 rounded-l z-20 border-l-2 border-white/70 flex items-center justify-center"
                            onMouseDown={(e) => { e.stopPropagation(); setResizingTask({ task, side: 'left' }); setDragOffset({ x: e.clientX, y: e.clientY }); }}
                            title="Resize start"
                          >
                            <GripVertical className="pointer-events-none w-3 h-3 text-white/90" />
                          </div>
                          <div
                            className="absolute inset-y-0 right-0 w-4 cursor-ew-resize opacity-0 group-hover:opacity-100 transition-opacity bg-white/20 group-hover:bg-white/30 rounded-r z-20 border-r-2 border-white/70 flex items-center justify-center"
                            onMouseDown={(e) => { e.stopPropagation(); setResizingTask({ task, side: 'right' }); setDragOffset({ x: e.clientX, y: e.clientY }); }}
                            title="Resize end"
                          >
                            <GripVertical className="pointer-events-none w-3 h-3 text-white/90" />
                          </div>
                          {/* Visual grip hints */}
                          <GripVertical className="pointer-events-none absolute left-1 top-1/2 -translate-y-1/2 w-3 h-3 text-white/80 opacity-0 group-hover:opacity-100 transition-opacity z-10" />
                          <GripVertical className="pointer-events-none absolute right-1 top-1/2 -translate-y-1/2 w-3 h-3 text-white/80 opacity-0 group-hover:opacity-100 transition-opacity z-10" />
                          <div className="h-full flex items-center justify-between px-3 text-white text-sm font-medium">
                            <span className="truncate">{task.text}</span>
                            <div className="flex flex-col items-end text-xs">
                              <span>{task.progress}%</span>
                              <span className="opacity-75">{formatDate(task.start)}</span>
                            </div>
                          </div>

                          {/* Progress overlay */}
                          <div
                            className="absolute bottom-0 left-0 h-1 bg-white/30 rounded-b-lg"
                            style={{ width: `${task.progress}%` }}
                          />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Side panel: Task details when a task is selected */}
      {selectedTask && (
        <div className="fixed right-0 top-0 h-full w-96 border-l border-slate-700 bg-slate-800 p-4 overflow-y-auto z-40">
          <div className="flex items-center justify-between mb-4 bg-slate-700 p-2 rounded">
            <h3 className="text-lg font-semibold text-white">Task Summary</h3>
            <button
              onClick={() => setSelectedTask(null)}
              className="p-1 hover:bg-slate-600 rounded"
            >
              <X className="w-4 h-4 text-slate-400" />
            </button>
          </div>
          <div className="space-y-4 bg-slate-800 p-4 rounded">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Task Name</label>
              <p className="text-white text-lg">{selectedTask.text}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Type</label>
              <p className="text-white capitalize">{selectedTask.type}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Start Date</label>
              <p className="text-white">{formatDate(selectedTask.start)}</p>
            </div>
            {selectedTask.end && selectedTask.type !== 'milestone' && (
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">End Date</label>
                <p className="text-white">{formatDate(selectedTask.end)}</p>
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Progress</label>
              <p className="text-white">{selectedTask.progress}%</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Assigned to</label>
              <p className="text-white">{getAssignees(selectedTask)}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Description</label>
              <p className="text-white">{selectedTask.details || 'No description available'}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Notes</label>
              <textarea
                value={selectedTask.notes}
                onChange={(e) => {
                  const updatedTasks = tasks.map(t => t.id === selectedTask.id ? { ...t, notes: e.target.value } : t);
                  setTasks(updatedTasks);
                  setSelectedTask(updatedTasks.find(t => t.id === selectedTask.id)!);
                }}
                rows={3}
                className="w-full px-3 py-2 bg-slate-700 text-white border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Add notes here..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Files</label>
              <div className="space-y-2">
                <div className="flex gap-2">
                  <input
                    type="file"
                    accept=".png,.pdf"
                    className="flex-1 px-3 py-2 bg-slate-700 text-white border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const url = URL.createObjectURL(file);
                        const updatedTasks = tasks.map(t => t.id === selectedTask.id ? { ...t, files: [...t.files, url] } : t);
                        setTasks(updatedTasks);
                        setSelectedTask(updatedTasks.find(t => t.id === selectedTask.id)!);
                      }
                    }}
                  />
                </div>
                <div className="space-y-1">
                  {selectedTask.files.map((file, index) => (
                    <div key={index} className="flex items-center justify-between bg-slate-700 p-2 rounded">
                      <a href={file} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 truncate">
                        {file.split('/').pop() || file}
                      </a>
                      <button
                        onClick={() => {
                          const updatedTasks = tasks.map(t => t.id === selectedTask.id ? { ...t, files: t.files.filter((_, i) => i !== index) } : t);
                          setTasks(updatedTasks);
                          setSelectedTask(updatedTasks.find(t => t.id === selectedTask.id)!);
                        }}
                        className="text-red-400 hover:text-red-300 ml-2"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tooltip on task hover */}
      {hoveredTask && (
        <div
          className="fixed z-50 pointer-events-none"
          style={{
            left: tooltipPos.x + 15,
            top: tooltipPos.y + 15
          }}
        >
          <div className="bg-slate-900 border border-slate-700 p-4 rounded-lg shadow-2xl max-w-xs">
            <div className="mb-2">
              <span className="font-semibold text-blue-400">Type:</span>
              <span className="ml-2 text-white">{hoveredTask.type}</span>
            </div>
            <div className="mb-2">
              <span className="font-semibold text-blue-400">Details:</span>
              <span className="ml-2 text-slate-300">{hoveredTask.details}</span>
            </div>
            <div className="mb-2">
              <span className="font-semibold text-blue-400">Assigned to:</span>
              <span className="ml-2 text-slate-300">{getAssignees(hoveredTask) || 'N/A'}</span>
            </div>
            <div className="mb-2">
              <span className="font-semibold text-blue-400">Start:</span>
              <span className="ml-2 text-slate-300">{formatDate(tasks.find(t => t.id === hoveredTask.id)?.start || hoveredTask.start)}</span>
            </div>
            {hoveredTask.end && hoveredTask.type !== 'milestone' && (
              <div>
                <span className="font-semibold text-blue-400">End:</span>
                <span className="ml-2 text-slate-300">{formatDate(tasks.find(t => t.id === hoveredTask.id)?.end || hoveredTask.end)}</span>
              </div>
            )}
                      </div>
        </div>
      )}

      {/* Right-click context menu */}
      {contextMenu && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setContextMenu(null)}
          />
          <div
            className="fixed z-50 bg-slate-800 border border-slate-700 rounded-lg shadow-xl py-1 min-w-[160px]"
            style={{
              left: contextMenu.x,
              top: contextMenu.y
            }}
          >
            <button
              onClick={() => addChildTask(contextMenu.task.id)}
              className="w-full px-4 py-2 text-left text-white hover:bg-slate-700 flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Child Task
            </button>
            <div className="border-t border-slate-700 my-1" />
            <button
              onClick={() => {
                setEditingTask(contextMenu.task);
                setShowEditor(true);
                setContextMenu(null);
              }}
              className="w-full px-4 py-2 text-left text-white hover:bg-slate-700 flex items-center gap-2"
            >
              <Edit className="w-4 h-4" />
              Edit
            </button>
            <button
              onClick={() => deleteTask(contextMenu.task.id)}
              className="w-full px-4 py-2 text-left text-red-400 hover:bg-slate-700 flex items-center gap-2"
            >
              <Trash2 className="w-4 h-4" />
              Delete
            </button>
          </div>
        </>
      )}

      {/* Task editor modal */}
      {showEditor && editingTask && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-slate-800 border border-slate-700 rounded-lg shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
            <div className="p-6 border-b border-slate-700 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-white">Edit Task</h2>
              <button
                onClick={() => {
                  setShowEditor(false);
                  setEditingTask(null);
                }}
                className="p-1 hover:bg-slate-700 rounded transition-colors"
              >
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Task Name
                  </label>
                  <input
                    type="text"
                    value={editingTask.text}
                    onChange={(e) => setEditingTask({ ...editingTask, text: e.target.value })}
                    className="w-full px-4 py-2 bg-slate-700 text-white border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Type
                  </label>
                  <select
                    value={editingTask.type}
                    onChange={(e) => {
                      const newType = e.target.value as Task['type'];
                      if (newType === 'milestone') {
                        setEditingTask({ ...editingTask, type: newType, end: editingTask.start });
                      } else {
                        setEditingTask({ ...editingTask, type: newType });
                      }
                    }}
                    className="w-full px-4 py-2 bg-slate-700 text-white border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="task">Task</option>
                    <option value="milestone">Milestone</option>
                    <option value="project">Project</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Start Date
                    </label>
                    <input
                      type="date"
                      value={new Date(editingTask.start).toISOString().split('T')[0]}
                      onChange={(e) => {
                        const newStart = new Date(e.target.value);
                        setEditingTask({ ...editingTask, start: newStart, end: editingTask.type === 'milestone' ? newStart : editingTask.end });
                      }}
                      className="w-full px-4 py-2 bg-slate-700 text-white border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  {editingTask.type !== 'milestone' && (
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        End Date
                      </label>
                      <input
                        type="date"
                        value={new Date(editingTask.end).toISOString().split('T')[0]}
                        onChange={(e) => setEditingTask({ ...editingTask, end: new Date(e.target.value) })}
                        className="w-full px-4 py-2 bg-slate-700 text-white border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Progress: {editingTask.progress}%
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={editingTask.progress}
                    onChange={(e) => setEditingTask({ ...editingTask, progress: parseInt(e.target.value) })}
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Details
                  </label>
                  <textarea
                    value={editingTask.details}
                    onChange={(e) => setEditingTask({ ...editingTask, details: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-2 bg-slate-700 text-white border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Assigned to 1
                    </label>
                    <select
                      value={editingTask.to1}
                      onChange={(e) => setEditingTask({ ...editingTask, to1: parseInt(e.target.value) })}
                      className="w-full px-4 py-2 bg-slate-700 text-white border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {data.users.map(user => (
                        <option key={user.id} value={user.id}>{user.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Assigned to 2
                    </label>
                    <select
                      value={editingTask.to2}
                      onChange={(e) => setEditingTask({ ...editingTask, to2: parseInt(e.target.value) })}
                      className="w-full px-4 py-2 bg-slate-700 text-white border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {data.users.map(user => (
                        <option key={user.id} value={user.id}>{user.label}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-slate-700 flex justify-between">
              <button
                onClick={() => {
                  setShowEditor(false);
                  setEditingTask(null);
                }}
                className="px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-colors"
              >
                Close
              </button>
              <div className="flex gap-2">
                <button
                  onClick={() => deleteTask(editingTask.id)}
                  className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete
                </button>
                <button
                  onClick={updateTask}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Save className="w-4 h-4" />
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default GanttChart;
