import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { Task, Link, Livrable, ViewMode, EditorTab, HistoryState, MenuPosition } from '../types';
import { fetchGanttData, updateTask as apiUpdateTask, deleteTask as apiDeleteTask, createDeliverable as apiCreateLivrable, createTask as apiCreateTask, GanttData, uploadFile, updateTaskDeliverable as apiUpdateTaskDeliverable } from '@/api/ganttApi';
import { createEmptyBudget } from '../utils/budgetUtils';
import { getDateRange } from '../utils/timelineUtils';
import { DEFAULT_DAY_WIDTH, MAX_HISTORY_STATES, MIN_START_DATE } from '../constants';

// Counter for generating temporary negative task IDs (avoids INT4 overflow)
let tempIdCounter = -1;

// Generate a unique temporary task ID (negative to distinguish from real IDs)
const generateTempId = (): number => {
  tempIdCounter--;
  return tempIdCounter;
};

// Helper to create empty initial data
const createEmptyGanttData = (): GanttData => ({
  tasks: [],
  links: [],
  users: [],
  livrables: []
});

// Extended Task interface with subActionId for API operations
export interface ExtendedTask extends Task {
  subActionId?: number | null;
  actionId?: number;
}

export const useGanttState = () => {
  const params = useParams();
  const projectId = params?.projectId ? parseInt(params.projectId as string, 10) : null;

  // Loading and error states
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // State for Gantt data
  const [data, setData] = useState<GanttData>(createEmptyGanttData());
  
  // State for tasks, links, and users (extracted from data for easier updates)
  const [tasks, setTasks] = useState<Task[]>([]);
  const [links, setLinks] = useState<Link[]>([]);
  const [users, setUsers] = useState<{ id: number; label: string }[]>([]);

  // State for livrables (local, mutable)
  const [livrables, setLivrables] = useState<Livrable[]>([]);

  // State for current version ID (used when creating/updating tasks)
  const [versionId, setVersionId] = useState<number | null>(null);

  // UI state for editing and interactions
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [showEditor, setShowEditor] = useState(false);
  const [editorTab, setEditorTab] = useState<EditorTab>('general');
  const [hoveredTask, setHoveredTask] = useState<Task | null>(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });
  const [contextMenu, setContextMenu] = useState<{ task: Task; x: number; y: number } | null>(null);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const selectedTaskRef = useRef<Task | null>(null);

  // Keep ref in sync with selectedTask state
  useEffect(() => {
    selectedTaskRef.current = selectedTask;
  }, [selectedTask]);
  const [menuOpen, setMenuOpen] = useState(false);
  const [exportMenuOpen, setExportMenuOpen] = useState(false);
  const [importMenuOpen, setImportMenuOpen] = useState(false);
  const [mistralModalOpen, setMistralModalOpen] = useState(false);
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
  const [history, setHistory] = useState<HistoryState[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

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
  const [currentDateRange, setCurrentDateRange] = useState(() => ({
    start: new Date(new Date().getFullYear(), 0, 1),
    end: new Date(new Date().getFullYear(), 11, 31)
  }));

  // Refs for DOM elements
  const timelineRef = useRef<HTMLDivElement>(null);
  const taskListRef = useRef<HTMLDivElement>(null);

  // Fetch data from API
  const loadData = async (versionId?: number) => {
    if (!projectId) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      const ganttData = await fetchGanttData(projectId, versionId);
      
      setData(ganttData);
      setTasks(ganttData.tasks || []);
      setLinks(ganttData.links || []);
      setUsers(ganttData.users || []);
      setLivrables(ganttData.livrables || []);
      
      // Set version ID if provided
      if (versionId !== undefined) {
        setVersionId(versionId);
      }

      // Initialize history with initial state
      const initialState = {
        tasks: ganttData.tasks || [],
        links: ganttData.links || []
      };
      setHistory([initialState]);
      setHistoryIndex(0);

      // Set initial date range based on tasks
      if (ganttData.tasks && ganttData.tasks.length > 0) {
        setCurrentDateRange(getDateRange(ganttData.tasks, MIN_START_DATE));
      }
    } catch (err) {
      console.error('Erreur lors du chargement des données du diagramme de Gantt :', err);
      setError('Échec du chargement des données. Utilisation du mode hors ligne.');
      // Initialize with empty data but allow the app to work
      setHistory([{ tasks: [], links: [] }]);
      setHistoryIndex(0);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [projectId]);

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
          top: rect.bottom + 8, 
          left: rect.left
        });
      }
      if (exportMenuOpen && exportMenuRef.current) {
        const rect = exportMenuRef.current.getBoundingClientRect();
        setExportMenuPosition({ 
          top: rect.top - 4, 
          left: rect.right + 8
        });
      }
      if (importMenuOpen && importMenuRef.current) {
        const rect = importMenuRef.current.getBoundingClientRect();
        setImportMenuPosition({ 
          top: rect.top - 4, 
          left: rect.right + 8
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
            top: rect.top - 4, 
            left: rect.right + 8
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
            top: rect.top - 4, 
            left: rect.right + 8
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
  const handleAddLivrable = async () => {
    if (newLivrableLabel.trim() && editingTask && projectId) {
      try {
        const newLivrable = await apiCreateLivrable(projectId, {
          taskId: editingTask.id,
          label: newLivrableLabel.trim(),
          description: newLivrableDescription.trim()
        });
        
        // Add to local state
        setLivrables(prev => [...prev, newLivrable]);
        // Assign to editing task (array to support multiple livrables)
        setEditingTask({
          ...editingTask,
          livrableIds: [...(editingTask.livrableIds || []), newLivrable.id]
        });
        setShowAddLivrable(false);
        setNewLivrableLabel('');
        setNewLivrableDescription('');
      } catch (err) {
        console.error('Error creating livrable:', err);
        // Fallback to local creation
        const newId = Math.max(...livrables.map(l => l.id), 0) + 1;
        const localLivrable: Livrable = {
          id: newId,
          label: newLivrableLabel.trim(),
          description: newLivrableDescription.trim()
        };
        setLivrables(prev => [...prev, localLivrable]);
        setEditingTask({
          ...editingTask,
          livrableIds: [...(editingTask.livrableIds || []), newId]
        });
        setShowAddLivrable(false);
        setNewLivrableLabel('');
        setNewLivrableDescription('');
      }
    }
  };

  // Upload file to livrable handler
  const handleUploadLivrableFile = async (livrableId: number, file: File) => {
    if (!editingTask || !projectId) return;
    
    try {
      // Upload file first
      const uploadResult = await uploadFile(file);
      
      // Update the livrable with file URL
      const updatedLivrable = await apiUpdateTaskDeliverable(
        Number(projectId),
        editingTask.id,
        livrableId,
        {
          fileUrl: uploadResult.url,
          fileName: uploadResult.originalName
        }
      );
      
      // Update local state
      setLivrables(prev => prev.map(l => 
        l.id === livrableId 
          ? { 
              ...l, 
              fileUrl: updatedLivrable.fileUrl, 
              fileName: updatedLivrable.fileName,
              confirmed: updatedLivrable.confirmed 
            } 
          : l
      ));
      
      // Update task progress if returned
      if (updatedLivrable.progress !== undefined) {
        setEditingTask(prev => prev ? { ...prev, progress: updatedLivrable.progress } : null);
        setTasks(prev => prev.map(t => 
          t.id === editingTask.id 
            ? { ...t, progress: updatedLivrable.progress } 
            : t
        ));
      }
    } catch (err) {
      console.error('Error uploading file to livrable:', err);
    }
  };

  // Calculate progress based on confirmed livrables
  const calculateLivrableProgress = (taskLivrableIds: number[] | undefined): number => {
    if (!taskLivrableIds || taskLivrableIds.length === 0) return 0;
    
    const confirmedLivrables = taskLivrableIds.filter(id => {
      const livrable = livrables.find(l => l.id === id);
      return livrable?.confirmed;
    });
    
    return Math.round((confirmedLivrables.length / taskLivrableIds.length) * 100);
  };

  // Save state to history
  const saveState = useCallback((nextTasks: Task[] = tasks, nextLinks: Link[] = links) => {
    const newState = { tasks: [...nextTasks], links: [...nextLinks] };
    setHistory(prev => {
      const newHistory = prev.slice(0, historyIndex + 1);
      newHistory.push(newState);
      return newHistory.slice(-MAX_HISTORY_STATES);
    });
    setHistoryIndex(prev => Math.min(prev + 1, MAX_HISTORY_STATES - 1));
  }, [historyIndex, tasks, links]);

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
  const addTask = async () => {
    const newTask: ExtendedTask = {
      id: generateTempId(), // Temporary negative ID until saved
      text: '',  // Empty instead of 'New Task'
      start: new Date(),
      end: new Date(),
      progress: 0,
      parent: 0,
      type: 'task',
      details: '',  // Empty instead of 'New task description'
      notes: '',
      files: [],
      assigneeIds: [],
      color: '#3b82f6',
      budget: createEmptyBudget(),
      subActionId: null,
    };

    // Optimistically add to local state
    const nextTasks = [...tasks, newTask];
    setTasks(nextTasks);
    saveState(nextTasks, links);
    setEditingTask(newTask);
    setShowEditor(true);
  };

  // Add child task
  const addChildTask = async (parentId: number) => {
    const newTask: ExtendedTask = {
      id: generateTempId(), // Temporary negative ID until saved
      text: '',  // Empty instead of 'New Subtask'
      start: new Date(),
      end: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      progress: 0,
      parent: parentId,
      type: 'task',
      details: '',  // Empty instead of 'New subtask description'
      notes: '',
      files: [],
      assigneeIds: [],
      color: '#3b82f6',
      budget: createEmptyBudget(),
      subActionId: null,
    };

    // Optimistically add to local state
    const nextTasks = [...tasks, newTask];
    setTasks(nextTasks);
    saveState(nextTasks, links);
    setContextMenu(null);
  };

  // Delete task and all its children
  const deleteTask = async (id: number) => {
    // Collect all task IDs to delete (task + all descendants)
    const tasksToDelete = new Set<number>([id]);
    let foundNew = true;
    while (foundNew) {
      foundNew = false;
      tasks.forEach(task => {
        if (task.parent && tasksToDelete.has(task.parent) && !tasksToDelete.has(task.id)) {
          tasksToDelete.add(task.id);
          foundNew = true;
        }
      });
    }
    
    // Filter out tasks and links to be deleted
    const nextTasks = tasks.filter(t => !tasksToDelete.has(t.id));
    const nextLinks = links.filter(l => !tasksToDelete.has(l.source) && !tasksToDelete.has(l.target));
    
    // Optimistically update local state
    setTasks(nextTasks);
    setLinks(nextLinks);
    saveState(nextTasks, nextLinks);
    setShowEditor(false);
    setContextMenu(null);

    // Sync with API if we have a valid projectId
    if (projectId && id > 0) {
      try {
        await apiDeleteTask(projectId, id);
        // Refresh data from server to ensure consistency
        await loadData(versionId || undefined);
      } catch (err) {
        console.error('Error deleting task from API:', err);
        // Task was already removed from local state, so we keep it that way
      }
    }
  };

  // Update task (handles both create and update)
  const updateTask = async () => {
    if (editingTask) {
      if (editingTask.type !== 'milestone' && editingTask.start > editingTask.end) {
        alert('La date de début doit être antérieure à la date de fin');
        return;
      }
      
      // Check if this is a new task (negative ID indicates temporary local task)
      const isNewTask = editingTask.id < 0;
      
      if (isNewTask) {
        // Create new task via API
        if (projectId) {
          try {
            const createdTask = await apiCreateTask(projectId, {
              text: editingTask.text,
              start: editingTask.start,
              end: editingTask.end,
              progress: editingTask.progress,
              // Send 0 if parent is a temporary ID (negative), otherwise send the real ID
              parent: editingTask.parent < 0 ? 0 : editingTask.parent,
              type: editingTask.type,
              details: editingTask.details,
              notes: editingTask.notes,
              files: editingTask.files || [],
              goal: editingTask.goal,
              assigneeIds: editingTask.assigneeIds || [],
              livrableIds: editingTask.livrableIds || [],
              color: editingTask.color || '#3b82f6',
              versionId: versionId || null
            });
            
            // Refresh data from server to ensure consistency
            await loadData(versionId || undefined);
          } catch (err) {
            console.error('Error creating task in API:', err);
            // Still update local state
            const nextTasks = tasks.map(t => t.id === editingTask.id ? editingTask : t);
            setTasks(nextTasks);
            saveState(nextTasks, links);
          }
        } else {
          // No projectId, just update local state
          const nextTasks = tasks.map(t => t.id === editingTask.id ? editingTask : t);
          setTasks(nextTasks);
          saveState(nextTasks, links);
        }
      } else {
        // Update existing task
        const nextTasks = tasks.map(t => t.id === editingTask.id ? editingTask : t);
        setTasks(nextTasks);
        saveState(nextTasks, links);
        
        // Sync with API if we have a valid projectId and a real task ID
        if (projectId && editingTask.id > 0) {
          try {
            await apiUpdateTask(projectId, editingTask.id, editingTask);
            // Refresh data from server to ensure consistency
            await loadData(versionId || undefined);
          } catch (err) {
            console.error('Error updating task in API:', err);
          }
        }
      }
      
      setShowEditor(false);
      setEditingTask(null);
    }
  };

  // Update selected task (for Task Summary panel)
  const updateSelectedTask = async (filesToSave?: string[]) => {
    const taskToUpdate = selectedTaskRef.current;
    if (taskToUpdate && projectId && taskToUpdate.id > 0) {
      try {
        // Use provided files or fall back to ref
        const files = filesToSave || taskToUpdate.files;
        console.log('Saving task files to DB:', files);
        await apiUpdateTask(projectId, taskToUpdate.id, { ...taskToUpdate, files });
        console.log('Task saved successfully');
        // Refresh tasks to ensure files and other updates are synced
        await loadData();
      } catch (err) {
        console.error('Error updating selected task in API:', err);
      }
    }
  };

  return {
    // Data
    data,
    livrables,
    tasks,
    links,
    users,
    isLoading,
    error,
    loadData,
    
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
    mistralModalOpen,
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
    setMistralModalOpen,
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
    setVersionId,
    
    // Actions
    handleAddLivrable,
    handleUploadLivrableFile,
    calculateLivrableProgress,
    saveState,
    undo,
    redo,
    addTask,
    addChildTask,
    deleteTask,
    updateTask,
    updateSelectedTask,
  };
};
