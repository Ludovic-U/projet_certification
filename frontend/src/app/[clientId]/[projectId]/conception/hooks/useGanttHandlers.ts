import { useCallback } from 'react';
import { Task, Link } from '../types';
import { DAY_MS, RESIZE_HANDLE_WIDTH, PROGRESS_BAR_WIDTH } from '../constants';
import { startOfDay } from '../utils/dateUtils';
import { getAllDescendants } from '../utils/taskUtils';

interface UseGanttHandlersProps {
  tasks: Task[];
  links: Link[];
  setTasks: (tasks: Task[]) => void;
  setDraggingTask: (task: Task | null) => void;
  setResizingTask: (task: { task: Task; side: 'left' | 'right' } | null) => void;
  setDragOffset: (offset: { x: number; y: number }) => void;
  setWasDragged: (wasDragged: boolean) => void;
  setDraggingProgress: (progress: { task: Task; startX: number; startProgress: number } | null) => void;
  setIsDraggingAny: (isDragging: boolean) => void;
  setDragStartPositions: (positions: Map<number, { start: Date; end: Date }>) => void;
  draggingIdsRef: React.MutableRefObject<Set<number>>;
  dragStartMapRef: React.MutableRefObject<Map<number, { start: number; end: number }>>;
  draggingActiveRef: React.MutableRefObject<boolean>;
  rafId: React.MutableRefObject<number | null>;
  pendingDeltaPx: React.MutableRefObject<number | null>;
  pxPerDay: number;
  saveState: (nextTasks?: Task[], nextLinks?: Link[]) => void;
  setHoveredTask: (task: Task | null) => void;
  setTooltipPos: (pos: { x: number; y: number }) => void;
  setContextMenu: (menu: { task: Task; x: number; y: number } | null) => void;
  setCursorX: (x: number | null) => void;
  timelineRef: React.RefObject<HTMLDivElement | null>;
  taskListRef: React.RefObject<HTMLDivElement | null>;
  lastClientXRef: React.MutableRefObject<number | null>;
  totalTimelineWidth: number;
  draggingTask: Task | null;
  resizingTask: { task: Task; side: 'left' | 'right' } | null;
  draggingProgress: { task: Task; startX: number; startProgress: number } | null;
  dragOffset: { x: number; y: number };
  dragStartPositions: Map<number, { start: Date; end: Date }>;
}

export const useGanttHandlers = ({
  tasks,
  links,
  setTasks,
  setDraggingTask,
  setResizingTask,
  setDragOffset,
  setWasDragged,
  setDraggingProgress,
  setIsDraggingAny,
  setDragStartPositions,
  draggingIdsRef,
  dragStartMapRef,
  draggingActiveRef,
  rafId,
  pendingDeltaPx,
  pxPerDay,
  saveState,
  setHoveredTask,
  setTooltipPos,
  setContextMenu,
  setCursorX,
  timelineRef,
  taskListRef,
  lastClientXRef,
  totalTimelineWidth,
  draggingTask,
  resizingTask,
  draggingProgress,
  dragOffset,
  dragStartPositions,
}: UseGanttHandlersProps) => {
  
  // Smooth drag animation frame tick
  const tick = useCallback(() => {
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
  }, [tasks, pxPerDay, draggingIdsRef, dragStartMapRef, draggingActiveRef, rafId, pendingDeltaPx, setTasks]);

  // Handles mouse down on task bars for dragging or resizing
  const handleMouseDown = useCallback((task: Task, e: React.MouseEvent<HTMLDivElement>) => {
    setWasDragged(false);
    setIsDraggingAny(true);
    if (e.button === 2) return; // Right click, don't start dragging

    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const x = e.clientX - rect.left;
    const width = rect.width;
    const isNearLeft = x < RESIZE_HANDLE_WIDTH;
    const isNearRight = x > width - RESIZE_HANDLE_WIDTH;

    // For milestones, always drag (no resize) due to small hit area
    if (task.type !== 'milestone' && (isNearLeft || isNearRight)) {
      setResizingTask({ task, side: isNearLeft ? 'left' : 'right' });
      setDragOffset({ x: e.clientX, y: e.clientY });
    } else {
      // Store initial positions when drag starts
      // Get ALL descendants recursively (not just direct children)
      const allDescendants = getAllDescendants(task.id, tasks);
      const positions = new Map<number, { start: Date; end: Date }>();
      positions.set(task.id, { start: new Date(task.start), end: new Date(task.end) });
      allDescendants.forEach(child => {
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
  }, [setWasDragged, setIsDraggingAny, setResizingTask, setDragOffset, setDraggingTask, setDragStartPositions, dragStartMapRef, draggingIdsRef, pendingDeltaPx, draggingActiveRef, tasks]);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (draggingTask || resizingTask || draggingProgress) {
      setWasDragged(true);
    }
    if (draggingProgress) {
      const deltaX = e.clientX - draggingProgress.startX;
      const deltaProgress = (deltaX / PROGRESS_BAR_WIDTH) * 100;
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
  }, [draggingTask, resizingTask, draggingProgress, setWasDragged, setTasks, dragOffset, pxPerDay, rafId, pendingDeltaPx, tick]);

  const handleMouseUp = useCallback(() => {
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
  }, [rafId, draggingActiveRef, pendingDeltaPx, dragStartMapRef, draggingIdsRef, draggingTask, resizingTask, draggingProgress, dragStartPositions, tasks, links, setTasks, saveState, setDraggingTask, setResizingTask, setDraggingProgress, setDragStartPositions, setIsDraggingAny]);

  const handleTaskMouseEnter = useCallback((task: Task, e: React.MouseEvent<HTMLElement>) => {
    setHoveredTask(task);
    setTooltipPos({ x: e.clientX, y: e.clientY });
  }, [setHoveredTask, setTooltipPos]);

  const handleTaskMouseLeave = useCallback(() => {
    setHoveredTask(null);
  }, [setHoveredTask]);

  const handleTaskContextMenu = useCallback((task: Task, e: React.MouseEvent<HTMLElement>) => {
    e.preventDefault();
    setContextMenu({
      task,
      x: e.clientX,
      y: e.clientY
    });
  }, [setContextMenu]);

  const handleTaskListScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    if (timelineRef.current) {
      timelineRef.current.scrollTop = e.currentTarget.scrollTop;
    }
  }, [timelineRef]);

  const handleTimelineScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
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
  }, [taskListRef, timelineRef, lastClientXRef, totalTimelineWidth, setCursorX]);

  const handleTimelineMouseMove = useCallback((e: React.MouseEvent) => {
    const scroller = timelineRef.current;
    if (!scroller) return;
    lastClientXRef.current = e.clientX;
    const rect = scroller.getBoundingClientRect();
    const x = (e.clientX - rect.left) + scroller.scrollLeft;
    const clamped = Math.max(0, Math.min(x, totalTimelineWidth));
    setCursorX(clamped);
  }, [timelineRef, lastClientXRef, totalTimelineWidth, setCursorX]);

  const handleTimelineMouseLeave = useCallback(() => {
    lastClientXRef.current = null;
    setCursorX(null);
  }, [lastClientXRef, setCursorX]);

  return {
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    handleTaskMouseEnter,
    handleTaskMouseLeave,
    handleTaskContextMenu,
    handleTaskListScroll,
    handleTimelineScroll,
    handleTimelineMouseMove,
    handleTimelineMouseLeave,
  };
};
