import { useState, useEffect, useRef, useMemo } from 'react';
import { Task, Link, Livrable, ViewMode, EditorTab, HistoryState, MenuPosition } from '../types';
import { getData } from '../../data';
import { createEmptyBudget } from '../utils/budgetUtils';
import { getDateRange } from '../utils/timelineUtils';
import { DEFAULT_DAY_WIDTH, MAX_HISTORY_STATES, MIN_START_DATE } from '../constants';

export const useGanttState = () => {
  // Load initial data from the data source
  const data = useMemo(() => getData(), []);

  // State for livrables (local, mutable)
  const [livrables, setLivrables] = useState<Livrable[]>(data.livrables);

  // State for tasks and links
  const [tasks, setTasks] = useState<Task[]>(data.tasks);
  const [links, setLinks] = useState<Link[]>(data.links);

  // UI state for editing and interactions
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [showEditor, setShowEditor] = useState(false);
  const [editorTab, setEditorTab] = useState<EditorTab>('general');
  const [hoveredTask, setHoveredTask] = useState<Task | null>(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });
  const [contextMenu, setContextMenu] = useState<{ task: Task; x: number; y: number } | null>(null);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [exportMenuOpen, setExportMenuOpen] = useState(false);
  const [importMenuOpen, setImportMenuOpen] = useState(false);
  const [menuPosition, setMenuPosition] = useState<MenuPosition>({ top: 0, left: 0 });
  const [exportMenuPosition, setExportMenuPosition] = useState<MenuPosition>({ top: 0, left: 0 });
  const [importMenuPosition, setImportMenuPosition] = useState<MenuPosition>({ top: 0, left: 0 });
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const exportMenuRef = useRef<HTMLDivElement>(null);
  const importMenuRef = useRef<HTMLDivElement>(null);

  // Livrable add state
  const [showAddLivrable, setShowAddLivrable] = useState(false);
  const [newLivrableLabel, setNewLivrableLabel] = useState('');
  const [newLivrableDescription, setNewLivrableDescription] = useState('');

  // Timeline view settings
  const [viewMode, setViewMode] = useState<ViewMode>('month');
  const [pxPerDay, setPxPerDay] = useState<number>(DEFAULT_DAY_WIDTH['month']);
  const [expandedTasks, setExpandedTasks] = useState<Set<number>>(new Set([0]));
  const [showTaskList, setShowTaskList] = useState(true);

  // History for undo/redo functionality
  const [history, setHistory] = useState<HistoryState[]>([{ tasks: data.tasks, links: data.links }]);
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

  // Auto-set progress to 100% when both livrable and goal are filled
  useEffect(() => {
    if (editingTask && editingTask.livrableIds && editingTask.livrableIds.length > 0 && editingTask.goal && editingTask.goal.trim()) {
      if (editingTask.progress !== 100) {
        setEditingTask({ ...editingTask, progress: 100 });
      }
    }
  }, [editingTask]);

  // Update menu positions on scroll to keep them in place
  useEffect(() => {
    const handleScroll = () => {
      if (menuOpen && menuButtonRef.current) {
        const rect = menuButtonRef.current.getBoundingClientRect();
        setMenuPosition({ 
          top: rect.bottom + 8 + window.scrollY, 
          left: rect.left + window.scrollX - 140
        });
      }
      if (exportMenuOpen && exportMenuRef.current) {
        const rect = exportMenuRef.current.getBoundingClientRect();
        setExportMenuPosition({ 
          top: rect.top + window.scrollY, 
          left: rect.right + window.scrollX 
        });
      }
      if (importMenuOpen && importMenuRef.current) {
        const rect = importMenuRef.current.getBoundingClientRect();
        setImportMenuPosition({ 
          top: rect.top + window.scrollY, 
          left: rect.right + window.scrollX 
        });
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [menuOpen, exportMenuOpen, importMenuOpen]);

  // Calculate submenu positions when they are opened
  useEffect(() => {
    if (exportMenuOpen && exportMenuRef.current) {
      requestAnimationFrame(() => {
        if (exportMenuRef.current) {
          const rect = exportMenuRef.current.getBoundingClientRect();
          setExportMenuPosition({ 
            top: rect.top + window.scrollY, 
            left: rect.right + window.scrollX 
          });
        }
      });
    }
  }, [exportMenuOpen]);

  useEffect(() => {
    if (importMenuOpen && importMenuRef.current) {
      requestAnimationFrame(() => {
        if (importMenuRef.current) {
          const rect = importMenuRef.current.getBoundingClientRect();
          setImportMenuPosition({ 
            top: rect.top + window.scrollY, 
            left: rect.right + window.scrollX 
          });
        }
      });
    }
  }, [importMenuOpen]);

  // Update date range when tasks change
  useEffect(() => {
    setCurrentDateRange(getDateRange(tasks, MIN_START_DATE));
  }, [tasks, isDraggingAny]);

  // Add new livrable handler
  const handleAddLivrable = () => {
    if (newLivrableLabel.trim() && editingTask) {
      const newId = Math.max(...livrables.map(l => l.id), 0) + 1;
      const newLivrable: Livrable = {
        id: newId,
        label: newLivrableLabel.trim(),
        description: newLivrableDescription.trim()
      };
      // Add to local state
      setLivrables(prev => [...prev, newLivrable]);
      // Assign to editing task (array to support multiple livrables)
      setEditingTask({
        ...editingTask,
        livrableIds: [...(editingTask.livrableIds || []), newId]
      });
      setShowAddLivrable(false);
      setNewLivrableLabel('');
      setNewLivrableDescription('');
    }
  };

  // Save state to history
  const saveState = (nextTasks: Task[] = tasks, nextLinks: Link[] = links) => {
    const newState = { tasks: [...nextTasks], links: [...nextLinks] };
    setHistory(prev => {
      const newHistory = prev.slice(0, historyIndex + 1);
      newHistory.push(newState);
      return newHistory.slice(-MAX_HISTORY_STATES); // Keep last MAX_HISTORY_STATES states
    });
    setHistoryIndex(prev => Math.min(prev + 1, MAX_HISTORY_STATES - 1));
  };

  // Undo action
  const undo = () => {
    if (historyIndex > 0) {
      const prevState = history[historyIndex - 1];
      setTasks(prevState.tasks);
      setLinks(prevState.links);
      setHistoryIndex(historyIndex - 1);
    }
  };

  // Redo action
  const redo = () => {
    if (historyIndex < history.length - 1) {
      const nextState = history[historyIndex + 1];
      setTasks(nextState.tasks);
      setLinks(nextState.links);
      setHistoryIndex(historyIndex + 1);
    }
  };

  // Add new task
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
      assigneeIds: [],
      budget: createEmptyBudget()
    };
    const nextTasks = [...tasks, newTask];
    setTasks(nextTasks);
    saveState(nextTasks, links);
    setEditingTask(newTask);
    setShowEditor(true);
  };

  // Add child task
  const addChildTask = (parentId: number) => {
    const newTask: Task = {
      id: Math.max(...tasks.map(t => t.id), 0) + 1,
      text: 'New Subtask',
      start: new Date(),
      end: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      progress: 0,
      parent: parentId,
      type: 'task',
      details: 'New subtask description',
      notes: '',
      files: [],
      assigneeIds: [],
      budget: createEmptyBudget()
    };
    const nextTasks = [...tasks, newTask];
    setTasks(nextTasks);
    saveState(nextTasks, links);
    setContextMenu(null);
  };

  // Delete task
  const deleteTask = (id: number) => {
    const nextTasks = tasks.filter(t => t.id !== id);
    const nextLinks = links.filter(l => l.source !== id && l.target !== id);
    setTasks(nextTasks);
    setLinks(nextLinks);
    saveState(nextTasks, nextLinks);
    setShowEditor(false);
    setContextMenu(null);
  };

  // Update task
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

  return {
    // Data
    data,
    livrables,
    tasks,
    links,
    
    // UI State
    editingTask,
    showEditor,
    editorTab,
    hoveredTask,
    tooltipPos,
    contextMenu,
    selectedTask,
    menuOpen,
    exportMenuOpen,
    importMenuOpen,
    menuPosition,
    exportMenuPosition,
    importMenuPosition,
    showAddLivrable,
    newLivrableLabel,
    newLivrableDescription,
    
    // View Settings
    viewMode,
    pxPerDay,
    expandedTasks,
    showTaskList,
    
    // History
    history,
    historyIndex,
    
    // Dragging State
    draggingTask,
    resizingTask,
    dragOffset,
    wasDragged,
    draggingProgress,
    isDraggingAny,
    dragStartPositions,
    
    // Refs
    rafId,
    pendingDeltaPx,
    draggingIdsRef,
    dragStartMapRef,
    draggingActiveRef,
    lastClientXRef,
    cursorX,
    timelineRef,
    taskListRef,
    menuButtonRef,
    exportMenuRef,
    importMenuRef,
    currentDateRange,
    
    // Setters
    setLivrables,
    setTasks,
    setLinks,
    setEditingTask,
    setShowEditor,
    setEditorTab,
    setHoveredTask,
    setTooltipPos,
    setContextMenu,
    setSelectedTask,
    setMenuOpen,
    setExportMenuOpen,
    setImportMenuOpen,
    setMenuPosition,
    setExportMenuPosition,
    setImportMenuPosition,
    setShowAddLivrable,
    setNewLivrableLabel,
    setNewLivrableDescription,
    setViewMode,
    setPxPerDay,
    setExpandedTasks,
    setShowTaskList,
    setDraggingTask,
    setResizingTask,
    setDragOffset,
    setWasDragged,
    setDraggingProgress,
    setIsDraggingAny,
    setDragStartPositions,
    setCursorX,
    
    // Actions
    handleAddLivrable,
    saveState,
    undo,
    redo,
    addTask,
    addChildTask,
    deleteTask,
    updateTask,
  };
};
