"use client";

/**
 * Gantt Chart Component for Project Conception
 * This component provides a full-featured Gantt chart for managing project tasks,
 * including drag-and-drop, resizing, progress tracking, and timeline visualization.
 */

import React, { useMemo, useState, useEffect, useRef, useCallback } from 'react';
import { PageHeader } from '@/components/ui';
import { useGanttHandlers } from './hooks/useGanttHandlers';
import { useGanttExportImport } from './hooks/useGanttExportImport';
import { GanttToolbar } from './components/GanttToolbar';
import { GanttTaskList } from './components/GanttTaskList';
import { GanttTimeline } from './components/GanttTimeline';
import { GanttTaskEditor } from './components/GanttTaskEditor';
import { GanttTaskSummary } from './components/GanttTaskSummary';
import { GanttTooltip } from './components/GanttTooltip';
import { GanttContextMenu } from './components/GanttContextMenu';
import { generateColumns, getBaseStart } from './utils/timelineUtils';
import { startOfDay } from './utils/dateUtils';
import { DAY_MS, DEFAULT_DAY_WIDTH, MAX_HISTORY_STATES, MIN_START_DATE } from './constants';
import { toUTC } from './utils/dateUtils';
import { MIN_PX_PER_DAY, MAX_PX_PER_DAY } from './constants';
import { PanelLeftClose, PanelLeftOpen, X, Plus, ChevronDown, ChevronUp } from 'lucide-react';
import { useParams } from 'next/navigation';
import { Task, Link, Livrable, ViewMode, EditorTab, HistoryState, MenuPosition } from './types';
import { fetchGanttData, updateTask as apiUpdateTask, deleteTask as apiDeleteTask, createDeliverable as apiCreateLivrable, createTask as apiCreateTask, bulkUpdateTasks, GanttData } from '@/api/ganttApi';
import { createEmptyBudget } from './utils/budgetUtils';
import { getDateRange } from './utils/timelineUtils';

// Define workflow type
interface Workflow {
  id: string;
  name: string;
  color: string;
}

// Generate initial workflows
const generateInitialWorkflows = (): Workflow[] => [
  { id: 'wf-1', name: 'Workflow 1', color: 'blue' },
];

// Color palette for new workflows
const WORKFLOW_COLORS = ['blue', 'green', 'orange', 'purple', 'pink', 'cyan'];

// Counter for generating temporary negative task IDs
let tempIdCounter = -1;
const generateTempId = (): number => {
  tempIdCounter--;
  return tempIdCounter;
};

const GanttChart = () => {
  const params = useParams();
  const projectId = params?.projectId ? parseInt(params.projectId as string, 10) : null;
  
  // Workflow tabs state
  const [workflows, setWorkflows] = useState<Workflow[]>(generateInitialWorkflows);
  const [activeWorkflowId, setActiveWorkflowId] = useState('wf-1');
  const [showWorkflowTabs, setShowWorkflowTabs] = useState(true);
  
  // Store tasks and links per workflow
  const [workflowTasks, setWorkflowTasks] = useState<Record<string, Task[]>>({});
  const [workflowLinks, setWorkflowLinks] = useState<Record<string, Link[]>>({});
  
  // Get current workflow's tasks and links
  const tasks = workflowTasks[activeWorkflowId] || [];
  const links = workflowLinks[activeWorkflowId] || [];
  
  // Loading and error states
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  void isLoading; void error;
  
  // State for Gantt data
  const [data, setData] = useState<GanttData>({ tasks: [], links: [], users: [], livrables: [] });
  const [users, setUsers] = useState<{ id: number; label: string }[]>([]);
  void users;
  const [livrables, setLivrables] = useState<Livrable[]>([]);
  
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
  const [cursorY, setCursorY] = useState<number | null>(null);
  
  // Current visible date range for the timeline
  const [currentDateRange, setCurrentDateRange] = useState(() => ({
    start: new Date(new Date().getFullYear(), 0, 1),
    end: new Date(new Date().getFullYear(), 11, 31)
  }));
  
  // Refs for DOM elements
  const timelineRef = useRef<HTMLDivElement>(null);
  const taskListRef = useRef<HTMLDivElement>(null);
  
  // Fetch data from API on mount
  useEffect(() => {
    const loadData = async () => {
      if (!projectId) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);
        const ganttData = await fetchGanttData(projectId);
        
        setData(ganttData);
        setUsers(ganttData.users || []);
        setLivrables(ganttData.livrables || []);
        
        // Initialize workflow 1 with the fetched data
        setWorkflowTasks({ 'wf-1': ganttData.tasks || [] });
        setWorkflowLinks({ 'wf-1': ganttData.links || [] });

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
        console.error('Error loading Gantt data:', err);
        setError('Failed to load Gantt data. Using offline mode.');
        setHistory([{ tasks: [], links: [] }]);
        setHistoryIndex(0);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [projectId]);
  
  // Reset pxPerDay on view change
  useEffect(() => {
    setPxPerDay(DEFAULT_DAY_WIDTH[viewMode]);
  }, [viewMode]);
  
  // Update date range when tasks change
  useEffect(() => {
    setCurrentDateRange(getDateRange(tasks, MIN_START_DATE));
  }, [tasks, isDraggingAny]);
  
  // Helper to update current workflow's tasks
  const updateCurrentTasks = useCallback((newTasks: Task[]) => {
    setWorkflowTasks(prev => ({
      ...prev,
      [activeWorkflowId]: newTasks
    }));
  }, [activeWorkflowId]);
  
  // Helper to update current workflow's links
  const updateCurrentLinks = useCallback((newLinks: Link[]) => {
    setWorkflowLinks(prev => ({
      ...prev,
      [activeWorkflowId]: newLinks
    }));
  }, [activeWorkflowId]);
  
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
      updateCurrentTasks(prevState.tasks);
      updateCurrentLinks(prevState.links);
      setHistoryIndex(historyIndex - 1);
    }
  };
  
  // Redo action
  const redo = () => {
    if (historyIndex < history.length - 1) {
      const nextState = history[historyIndex + 1];
      updateCurrentTasks(nextState.tasks);
      updateCurrentLinks(nextState.links);
      setHistoryIndex(historyIndex + 1);
    }
  };
  
  // Add new task
  const addTask = async () => {
    const newTask: Task & { subActionId?: number | null } = {
      id: generateTempId(),
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
      budget: createEmptyBudget(),
      subActionId: null,
    };

    const nextTasks = [...tasks, newTask];
    updateCurrentTasks(nextTasks);
    saveState(nextTasks, links);
    setEditingTask(newTask);
    setShowEditor(true);
  };
  
  // Add child task
  const addChildTask = async (parentId: number) => {
    const newTask: Task & { subActionId?: number | null } = {
      id: generateTempId(),
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
      budget: createEmptyBudget(),
      subActionId: null,
    };

    const nextTasks = [...tasks, newTask];
    updateCurrentTasks(nextTasks);
    saveState(nextTasks, links);
    setContextMenu(null);
  };
  
  // Delete task
  const deleteTask = async (id: number) => {
    const nextTasks = tasks.filter(t => t.id !== id);
    const nextLinks = links.filter(l => l.source !== id && l.target !== id);
    
    updateCurrentTasks(nextTasks);
    updateCurrentLinks(nextLinks);
    saveState(nextTasks, nextLinks);
    setShowEditor(false);
    setContextMenu(null);

    if (projectId && id > 0) {
      try {
        await apiDeleteTask(projectId, id);
      } catch (err) {
        console.error('Error deleting task from API:', err);
      }
    }
  };
  
  // Update task
  const updateTask = async () => {
    if (!editingTask) return;
    
    if (editingTask.type !== 'milestone' && editingTask.start > editingTask.end) {
      alert('Start date must be before end date');
      return;
    }
    
    const isNewTask = editingTask.id < 0;
    
    if (isNewTask) {
      if (projectId) {
        try {
          const createdTask = await apiCreateTask(projectId, {
            text: editingTask.text,
            start: editingTask.start,
            end: editingTask.end,
            progress: editingTask.progress,
            parent: editingTask.parent < 0 ? 0 : editingTask.parent,
            type: editingTask.type,
            details: editingTask.details,
            notes: editingTask.notes,
            files: editingTask.files || [],
            goal: editingTask.goal,
            assigneeIds: editingTask.assigneeIds || [],
            livrableIds: editingTask.livrableIds || []
          });
          
          const oldTempId = editingTask.id;
          const nextTasks = tasks.map(t => {
            if (t.id === oldTempId) {
              return { ...editingTask, id: createdTask.id };
            }
            if (t.parent === oldTempId) {
              return { ...t, parent: createdTask.id };
            }
            return t;
          });
          updateCurrentTasks(nextTasks);
          saveState(nextTasks, links);
        } catch (err) {
          console.error('Error creating task in API:', err);
          const nextTasks = tasks.map(t => t.id === editingTask.id ? editingTask : t);
          updateCurrentTasks(nextTasks);
          saveState(nextTasks, links);
        }
      } else {
        const nextTasks = tasks.map(t => t.id === editingTask.id ? editingTask : t);
        updateCurrentTasks(nextTasks);
        saveState(nextTasks, links);
      }
    } else {
      const nextTasks = tasks.map(t => t.id === editingTask.id ? editingTask : t);
      updateCurrentTasks(nextTasks);
      saveState(nextTasks, links);
      
      if (projectId && editingTask.id > 0) {
        try {
          await apiUpdateTask(projectId, editingTask.id, editingTask);
        } catch (err) {
          console.error('Error updating task in API:', err);
        }
      }
    }
    
    setShowEditor(false);
    setEditingTask(null);
  };
  
  // Add new livrable handler
  const handleAddLivrable = async () => {
    if (newLivrableLabel.trim() && editingTask && projectId) {
      try {
        const newLivrable = await apiCreateLivrable(projectId, {
          label: newLivrableLabel.trim(),
          description: newLivrableDescription.trim()
        });
        
        setLivrables(prev => [...prev, newLivrable]);
        setEditingTask({
          ...editingTask,
          livrableIds: [...(editingTask.livrableIds || []), newLivrable.id]
        });
        setShowAddLivrable(false);
        setNewLivrableLabel('');
        setNewLivrableDescription('');
      } catch (err) {
        console.error('Error creating livrable:', err);
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
  
  // Save dragged/resized tasks to database
  const handleTaskUpdate = useCallback(async (updatedTasks: Task[]) => {
    if (!projectId || updatedTasks.length === 0) return;
    
    try {
      const tasksToSave = updatedTasks.map(t => ({
        id: t.id,
        start: t.start,
        end: t.end,
        progress: t.progress,
        parent: t.parent,
      }));
      await bulkUpdateTasks(projectId, tasksToSave);
      console.log('Tasks saved successfully');
    } catch (err) {
      console.error('Error saving tasks:', err);
    }
  }, [projectId]);
  
  // Use custom hook for event handlers
  const handlers = useGanttHandlers({
    tasks,
    links,
    setTasks: updateCurrentTasks,
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
    setCursorY,
    timelineRef,
    taskListRef,
    lastClientXRef,
    totalTimelineWidth: useMemo(() => {
      const { columns } = generateColumns(viewMode, getBaseStart(viewMode, currentDateRange), currentDateRange, pxPerDay);
      return columns.reduce((s, c) => s + c.width, 0);
    }, [viewMode, pxPerDay, currentDateRange]),
    draggingTask,
    resizingTask,
    draggingProgress,
    dragOffset,
    dragStartPositions,
    onTaskUpdate: handleTaskUpdate,
  });

  // Use custom hook for export/import functions
  const exportImport = useGanttExportImport({
    tasks,
    links,
    setTasks: updateCurrentTasks,
    setLinks: updateCurrentLinks,
    saveState,
    data,
    projectId,
  });

  // Calculate timeline columns and groups
  const { groups, columns } = useMemo(
    () => generateColumns(viewMode, getBaseStart(viewMode, currentDateRange), currentDateRange, pxPerDay),
    [viewMode, pxPerDay, currentDateRange]
  );

  // Helper functions for date conversion
  const xFromDate = (d: Date) => ((toUTC(d) - toUTC(getBaseStart(viewMode, currentDateRange))) / DAY_MS) * pxPerDay;
  const dateFromX = (x: number) => startOfDay(new Date(toUTC(getBaseStart(viewMode, currentDateRange)) + (x / pxPerDay) * DAY_MS));

  const totalTimelineWidth = useMemo(() => columns.reduce((s, c) => s + c.width, 0), [columns]);

  // Calculate today's position on timeline
  const today = startOfDay(new Date());
  const todayX = useMemo(() => {
    const baseStart = getBaseStart(viewMode, currentDateRange);
    return ((toUTC(today) - toUTC(baseStart)) / DAY_MS) * pxPerDay;
  }, [viewMode, pxPerDay, currentDateRange]);

  // Scroll to date function
  const scrollToDate = (d: Date) => {
    const el = timelineRef.current;
    if (!el) return;
    const baseStart = getBaseStart(viewMode, currentDateRange);
    const x = ((toUTC(d) - toUTC(baseStart)) / DAY_MS) * pxPerDay;
    el.scrollLeft = Math.max(0, x - el.clientWidth / 2);
  };

  // Zoom function
  const zoomBy = (delta: number) => {
    const el = timelineRef.current;
    const next = Math.min(MAX_PX_PER_DAY, Math.max(MIN_PX_PER_DAY, pxPerDay + delta));
    if (!el || next === pxPerDay) {
      setPxPerDay(next);
      return;
    }
    const centerX = el.scrollLeft + el.clientWidth / 2;
    const centerDays = centerX / pxPerDay;
    setPxPerDay(next);
    const newCenterX = centerDays * next;
    el.scrollLeft = Math.max(0, newCenterX - el.clientWidth / 2);
  };

  // Add new workflow
  const addWorkflow = () => {
    const newId = `wf-${Date.now()}`;
    const colorIndex = workflows.length % WORKFLOW_COLORS.length;
    const newWorkflow: Workflow = {
      id: newId,
      name: `Workflow ${workflows.length + 1}`,
      color: WORKFLOW_COLORS[colorIndex],
    };
    setWorkflows([...workflows, newWorkflow]);
    setActiveWorkflowId(newId);
  };

  // Remove workflow
  const removeWorkflow = useCallback((id: string) => {
    if (workflows.length === 1) return;
    const newWorkflows = workflows.filter(w => w.id !== id);
    setWorkflows(newWorkflows);
    
    // Remove workflow's tasks and links
    const newWorkflowTasks = { ...workflowTasks };
    const newWorkflowLinks = { ...workflowLinks };
    delete newWorkflowTasks[id];
    delete newWorkflowLinks[id];
    setWorkflowTasks(newWorkflowTasks);
    setWorkflowLinks(newWorkflowLinks);
    
    if (activeWorkflowId === id) {
      setActiveWorkflowId(newWorkflows[0].id);
    }
  }, [workflows, workflowTasks, workflowLinks, activeWorkflowId]);

  // Update menu positions on scroll
  useEffect(() => {
    const handleScroll = () => {
      if (menuOpen && menuButtonRef.current) {
        const rect = menuButtonRef.current.getBoundingClientRect();
        setMenuPosition({ 
          top: rect.bottom + 8, 
          left: rect.left
        });
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [menuOpen]);

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      {/* Page header */}
      <PageHeader
        title="Conception"
        description="Planification et gestion des tâches du projet"
      />
      <div className={`flex-1 bg-gradient-to-br from-slate-900 to-slate-800 flex flex-col overflow-hidden ${selectedTask ? 'pr-96' : ''}`}>
        
        {/* Toolbar with controls */}
        <GanttToolbar
          viewMode={viewMode}
          setViewMode={setViewMode}
          pxPerDay={pxPerDay}
          zoomBy={zoomBy}
          scrollToDate={scrollToDate}
          today={today}
          addTask={addTask}
          undo={undo}
          redo={redo}
          historyIndex={historyIndex}
          historyLength={history.length}
          menuOpen={menuOpen}
          setMenuOpen={setMenuOpen}
          exportMenuOpen={exportMenuOpen}
          setExportMenuOpen={setExportMenuOpen}
          importMenuOpen={importMenuOpen}
          setImportMenuOpen={setImportMenuOpen}
          menuPosition={menuPosition}
          setMenuPosition={setMenuPosition}
          exportMenuPosition={exportMenuPosition}
          setExportMenuPosition={setExportMenuPosition}
          importMenuPosition={importMenuPosition}
          setImportMenuPosition={setImportMenuPosition}
          menuButtonRef={menuButtonRef}
          exportMenuRef={exportMenuRef}
          importMenuRef={importMenuRef}
          exportToCSV={exportImport.exportToCSV}
          exportToExcel={exportImport.exportToExcel}
          exportToMSProject={exportImport.exportToMSProject}
          exportData={exportImport.exportData}
          importFromCSV={exportImport.importFromCSV}
          importFromExcel={exportImport.importFromExcel}
          importData={exportImport.importData}
        />

        {/* Toggle button for workflow tabs */}
        <div className="bg-slate-800/80 backdrop-blur-sm border-b border-slate-700 px-4 py-1 flex items-center justify-between">
          <button
            onClick={() => setShowWorkflowTabs(!showWorkflowTabs)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium bg-slate-700/50 text-slate-300 hover:bg-slate-700 hover:text-white transition-all"
          >
            {showWorkflowTabs ? (
              <>
                <ChevronUp className="w-4 h-4" />
                Hide
              </>
            ) : (
              <>
                <ChevronDown className="w-4 h-4" />
                Show
              </>
            )}
          </button>
          
          {/* Current workflow name in the middle */}
          {workflows.map(w => w.id === activeWorkflowId && (
            <span key={w.id} className={`text-sm font-medium px-4 py-1 rounded bg-${w.color}-500/20 text-${w.color}-400`}>
              {w.name}
            </span>
          ))}
          
          {/* Add workflow button */}
          <button
            onClick={addWorkflow}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium bg-slate-700/50 text-slate-300 hover:bg-slate-700 hover:text-white transition-all"
          >
            <Plus className="w-4 h-4" />
            Add Workflow
          </button>
        </div>

        {/* Workflow tabs bar */}
        {showWorkflowTabs && (
          <div className="bg-slate-800/80 backdrop-blur-sm border-b border-slate-700 px-4 py-2 flex items-center gap-2">
            {workflows.map((workflow, index) => (
              <div key={workflow.id} className="relative group">
                <button
                  onClick={() => setActiveWorkflowId(workflow.id)}
                  className={`
                    px-4 py-1.5 rounded-lg text-sm font-medium transition-all flex items-center gap-2
                    ${activeWorkflowId === workflow.id 
                      ? `bg-${workflow.color}-500 text-white shadow-lg` 
                      : 'bg-slate-700/50 text-slate-300 hover:bg-slate-700 hover:text-white'
                    }
                  `}
                >
                  {index + 1}
                  {activeWorkflowId === workflow.id && workflows.length > 1 && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeWorkflow(workflow.id);
                      }}
                      className="ml-1 p-0.5 rounded hover:bg-white/20 transition-colors"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Main Gantt Chart Area */}
        <div className="flex-1 overflow-hidden" onMouseMove={handlers.handleMouseMove} onMouseUp={handlers.handleMouseUp}>
          <div className="h-full max-w-[93vw] flex bg-slate-800 overflow-hidden relative">
            {/* Toggle button on the edge between panels */}
            <button
              onClick={() => setShowTaskList(!showTaskList)}
              className={`
                absolute top-1/2 -translate-y-1/2 z-50
                flex items-center gap-2 px-3 py-3
                bg-slate-800 border border-slate-700
                rounded-r-xl shadow-lg
                transition-all duration-300 ease-out
                hover:bg-slate-700 hover:border-slate-600 hover:shadow-xl
                ${showTaskList 
                  ? 'left-[36rem] border-l-0 bg-slate-800/90 backdrop-blur-sm' 
                  : 'left-0 border bg-slate-800/95 backdrop-blur-sm'
                }
              `}
              title={showTaskList ? 'Hide task list' : 'Show task list'}
            >
              <div className={`
                flex items-center justify-center w-8 h-8 rounded-lg
                transition-all duration-300
                ${showTaskList 
                  ? 'bg-blue-500/20 text-blue-400' 
                  : 'bg-emerald-500/20 text-emerald-400'
                }
              `}>
                {showTaskList ? (
                  <PanelLeftClose className="w-5 h-5" />
                ) : (
                  <PanelLeftOpen className="w-5 h-5" />
                )}
              </div>
              <span className={`
                text-sm font-medium whitespace-nowrap
                transition-all duration-300
                ${showTaskList ? 'text-slate-400' : 'text-white'}
              `}>
                {showTaskList ? 'Hide' : 'Show'}
              </span>
              <span className="text-slate-500 text-xs">
                {showTaskList ? '' : 'List'}
              </span>
              <div className={`
                absolute right-2 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full
                ${showTaskList ? 'bg-blue-400 animate-pulse' : 'bg-emerald-400 animate-pulse'}
              `} />
            </button>
            
            {/* Left panel: Task list with details */}
            {showTaskList && (
              <GanttTaskList
                tasks={tasks}
                expandedTasks={expandedTasks}
                setExpandedTasks={setExpandedTasks}
                setSelectedTask={setSelectedTask}
                setEditingTask={setEditingTask}
                setShowEditor={setShowEditor}
                handleTaskContextMenu={handlers.handleTaskContextMenu}
                deleteTask={deleteTask}
                wasDragged={wasDragged}
                setWasDragged={setWasDragged}
                setDraggingProgress={setDraggingProgress}
                taskListRef={taskListRef}
                handleTaskListScroll={handlers.handleTaskListScroll}
                data={data}
              />
            )}

            {/* Right panel: Scrollable timeline */}
            <GanttTimeline
              tasks={tasks}
              columns={columns}
              groups={groups}
              totalTimelineWidth={totalTimelineWidth}
              todayX={todayX}
              today={today}
              cursorX={cursorX}
              cursorY={cursorY}
              xFromDate={xFromDate}
              dateFromX={dateFromX}
              handleMouseDown={handlers.handleMouseDown}
              handleTaskMouseEnter={handlers.handleTaskMouseEnter}
              handleTaskMouseLeave={handlers.handleTaskMouseLeave}
              handleTaskContextMenu={handlers.handleTaskContextMenu}
              handleTimelineMouseMove={handlers.handleTimelineMouseMove}
              handleTimelineMouseLeave={handlers.handleTimelineMouseLeave}
              wasDragged={wasDragged}
              setWasDragged={setWasDragged}
              setSelectedTask={setSelectedTask}
              setEditingTask={setEditingTask}
              setShowEditor={setShowEditor}
              setResizingTask={setResizingTask}
              setDragOffset={setDragOffset}
              timelineRef={timelineRef}
              handleTimelineScroll={handlers.handleTimelineScroll}
              handleMouseMove={handlers.handleMouseMove}
              handleMouseUp={handlers.handleMouseUp}
              expandedTasks={expandedTasks}
            />
          </div>
        </div>

        {/* Side panel: Task details when a task is selected */}
        <GanttTaskSummary
          selectedTask={selectedTask}
          setSelectedTask={setSelectedTask}
          livrables={livrables}
          tasks={tasks}
          setTasks={updateCurrentTasks}
          data={data}
        />

        {/* Tooltip on task hover */}
        <GanttTooltip
          hoveredTask={hoveredTask}
          tooltipPos={tooltipPos}
          tasks={tasks}
          data={data}
        />

        {/* Right-click context menu */}
        <GanttContextMenu
          contextMenu={contextMenu}
          setContextMenu={setContextMenu}
          addChildTask={addChildTask}
          setEditingTask={setEditingTask}
          setShowEditor={setShowEditor}
          deleteTask={deleteTask}
        />

        {/* Task editor modal */}
        <GanttTaskEditor
          showEditor={showEditor}
          editingTask={editingTask}
          setEditingTask={setEditingTask}
          setShowEditor={setShowEditor}
          editorTab={editorTab}
          setEditorTab={setEditorTab}
          livrables={livrables}
          showAddLivrable={showAddLivrable}
          setShowAddLivrable={setShowAddLivrable}
          newLivrableLabel={newLivrableLabel}
          setNewLivrableLabel={setNewLivrableLabel}
          newLivrableDescription={newLivrableDescription}
          setNewLivrableDescription={setNewLivrableDescription}
          handleAddLivrable={handleAddLivrable}
          deleteTask={deleteTask}
          updateTask={updateTask}
          data={data}
        />
      </div>
    </div>
  );
};

export default GanttChart;
