"use client";

/**
 * Gantt Chart Component for Project Conception
 * This component provides a full-featured Gantt chart for managing project tasks,
 * including drag-and-drop, resizing, progress tracking, and timeline visualization.
 */

import React, { useMemo, useState, useEffect, useCallback, useRef } from 'react';
import { PageHeader } from '@/components/ui';
import { useGanttState } from './hooks/useGanttState';
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
import { DAY_MS } from './constants';
import { toUTC } from './utils/dateUtils';
import { MIN_PX_PER_DAY, MAX_PX_PER_DAY } from './constants';
import { PanelLeftClose, PanelLeftOpen } from 'lucide-react';

import { useParams } from 'next/navigation';
import { fetchVersions, fetchGanttData, createVersion, deleteVersion as deleteVersionApi, activateVersion as activateVersionApi, Version } from '@/api/ganttApi';

const GanttChart = () => {
  const params = useParams();
  const projectId = params?.projectId ? parseInt(params.projectId as string, 10) : null;
  
  // Version state
  const [versions, setVersions] = useState<Version[]>([]);
  const [currentVersion, setCurrentVersion] = useState<Version | null>(null);
  const [versionLoading, setVersionLoading] = useState(false);
  const [versionsKey, setVersionsKey] = useState(0); // Increment to force VersionSelector refresh
  
  // Ref to track current version selection (for use in async functions)
  const currentVersionRef = useRef<Version | null>(null);
  
  // Increment versionsKey when versions change to force VersionSelector refresh
  useEffect(() => {
    setVersionsKey(prev => prev + 1);
  }, [versions]);
  
  // Get persisted version from localStorage
  
  // Persist version selection to localStorage
  useEffect(() => {
    if (projectId && currentVersion) {
      localStorage.setItem(`project_${projectId}_currentVersion`, JSON.stringify(currentVersion));
    }
  }, [projectId, currentVersion]);
  
  // Keep ref in sync with state
  useEffect(() => {
    currentVersionRef.current = currentVersion;
  }, [currentVersion]);
  
  // Get persisted version from localStorage
  const getPersistedVersion = useCallback((): Version | null => {
    if (!projectId) return null;
    const persisted = localStorage.getItem(`project_${projectId}_currentVersion`);
    if (persisted) {
      try {
        return JSON.parse(persisted) as Version;
      } catch {
        return null;
      }
    }
    return null;
  }, [projectId]);

  const loadVersions = useCallback(async (overrideVersion?: Version | null) => {
    if (!projectId) return;
    setVersionLoading(true);
    try {
      const data = await fetchVersions(projectId);
      setVersions(data);
      setVersionsKey(prev => prev + 1);
      
      // If override is provided (e.g., newly created version), use it
      if (overrideVersion) {
        const stillExists = data.find(v => v.versionId === overrideVersion.versionId);
        if (stillExists) {
          setCurrentVersion(overrideVersion);
          return;
        }
      }
      
      // Check if current version still exists, or try to restore from localStorage
      let savedVersion = currentVersionRef.current;
      if (savedVersion) {
        // Check if the saved version still exists in the updated list
        const stillExists = data.find(v => v.versionId === savedVersion.versionId);
        if (stillExists) {
          // Keep the current version
          setCurrentVersion(savedVersion);
          return;
        }
      }
      
      // Try to restore from localStorage
      const persistedVersion = getPersistedVersion();
      if (persistedVersion) {
        const stillExistsInData = data.find(v => v.versionId === persistedVersion.versionId);
        if (stillExistsInData) {
          setCurrentVersion(persistedVersion);
          return;
        }
      }
      
      // Set default version only if no current version or current version was deleted
      if (data.length > 0) {
        const activeVersion = data.find(v => v.isActive);
        setCurrentVersion(activeVersion || data[0]);
      } else {
        setCurrentVersion(null);
      }
    } catch (error) {
      console.error('Error loading versions:', error);
    } finally {
      setVersionLoading(false);
    }
  }, [projectId, getPersistedVersion]);

  // Fetch versions on mount
  useEffect(() => {
    if (projectId) {
      loadVersions();
    }
  }, [projectId, loadVersions]);

  const handleCreateVersion = useCallback(async (name: string, description?: string, sourceVersionId?: number | null) => {
    if (!projectId) return;
    try {
      const newVersion = await createVersion(projectId, { name, description, sourceVersionId });
      // Pass the new version to loadVersions so it selects it
      await loadVersions(newVersion);
    } catch (error) {
      console.error('Error creating version:', error);
    }
  }, [projectId, loadVersions]);

  const handleDeleteVersion = useCallback(async (versionId: number) => {
    if (!projectId) return;
    
    // Check if we're deleting the current version (using ref for latest value)
    const isDeletingCurrent = currentVersionRef.current?.versionId === versionId;
    
    try {
      await deleteVersionApi(projectId, versionId);
      await loadVersions();
      
      // If we deleted the current version, switch to null (main version)
      if (isDeletingCurrent) {
        setCurrentVersion(null);
      }
    } catch (error) {
      console.error('Error deleting version:', error);
    }
  }, [projectId, loadVersions]);

  const handleActivateVersion = useCallback(async (versionId: number) => {
    if (!projectId) return;
    try {
      await activateVersionApi(projectId, versionId);
      await loadVersions();
    } catch (error) {
      console.error('Error activating version:', error);
    }
  }, [projectId, loadVersions]);
  
  // Re-fetch Gantt data when currentVersion changes
  useEffect(() => {
    if (projectId && currentVersion !== undefined) {
      ganttState.loadData(currentVersion?.versionId);
      ganttState.setVersionId(currentVersion?.versionId || null);
    }
  }, [projectId, currentVersion]);
  
  // Use custom hooks for state management
  const ganttState = useGanttState();
  
  // Use custom hook for event handlers
  const handlers = useGanttHandlers({
    tasks: ganttState.tasks,
    links: ganttState.links,
    setTasks: ganttState.setTasks,
    setDraggingTask: ganttState.setDraggingTask,
    setResizingTask: ganttState.setResizingTask,
    setDragOffset: ganttState.setDragOffset,
    setWasDragged: ganttState.setWasDragged,
    setDraggingProgress: ganttState.setDraggingProgress,
    setIsDraggingAny: ganttState.setIsDraggingAny,
    setDragStartPositions: ganttState.setDragStartPositions,
    draggingIdsRef: ganttState.draggingIdsRef,
    dragStartMapRef: ganttState.dragStartMapRef,
    draggingActiveRef: ganttState.draggingActiveRef,
    rafId: ganttState.rafId,
    pendingDeltaPx: ganttState.pendingDeltaPx,
    pxPerDay: ganttState.pxPerDay,
    saveState: ganttState.saveState,
    setHoveredTask: ganttState.setHoveredTask,
    setTooltipPos: ganttState.setTooltipPos,
    setContextMenu: ganttState.setContextMenu,
    setCursorX: ganttState.setCursorX,
    timelineRef: ganttState.timelineRef,
    taskListRef: ganttState.taskListRef,
    lastClientXRef: ganttState.lastClientXRef,
    totalTimelineWidth: useMemo(() => {
      const { columns } = generateColumns(ganttState.viewMode, getBaseStart(ganttState.viewMode, ganttState.currentDateRange), ganttState.currentDateRange, ganttState.pxPerDay);
      return columns.reduce((s, c) => s + c.width, 0);
    }, [ganttState.viewMode, ganttState.pxPerDay, ganttState.currentDateRange]),
    draggingTask: ganttState.draggingTask,
    resizingTask: ganttState.resizingTask,
    draggingProgress: ganttState.draggingProgress,
    dragOffset: ganttState.dragOffset,
    dragStartPositions: ganttState.dragStartPositions,
  });

  // Use custom hook for export/import functions
  const exportImport = useGanttExportImport({
    tasks: ganttState.tasks,
    links: ganttState.links,
    setTasks: ganttState.setTasks,
    setLinks: ganttState.setLinks,
    saveState: ganttState.saveState,
    data: ganttState.data,
    projectId,
  });

  // Calculate timeline columns and groups
  const { groups, columns } = useMemo(
    () => generateColumns(ganttState.viewMode, getBaseStart(ganttState.viewMode, ganttState.currentDateRange), ganttState.currentDateRange, ganttState.pxPerDay),
    [ganttState.viewMode, ganttState.pxPerDay, ganttState.currentDateRange]
  );

  // Helper functions for date conversion
  const xFromDate = (d: Date) => ((toUTC(d) - toUTC(getBaseStart(ganttState.viewMode, ganttState.currentDateRange))) / DAY_MS) * ganttState.pxPerDay;
  const dateFromX = (x: number) => startOfDay(new Date(toUTC(getBaseStart(ganttState.viewMode, ganttState.currentDateRange)) + (x / ganttState.pxPerDay) * DAY_MS));

  const totalTimelineWidth = useMemo(() => columns.reduce((s, c) => s + c.width, 0), [columns]);

  // Calculate today's position on timeline
  const today = startOfDay(new Date());
  const todayX = useMemo(() => {
    const baseStart = getBaseStart(ganttState.viewMode, ganttState.currentDateRange);
    return ((toUTC(today) - toUTC(baseStart)) / DAY_MS) * ganttState.pxPerDay;
  }, [ganttState.viewMode, ganttState.pxPerDay, ganttState.currentDateRange]);

  // Scroll to date function
  const scrollToDate = (d: Date) => {
    const el = ganttState.timelineRef.current;
    if (!el) return;
    const baseStart = getBaseStart(ganttState.viewMode, ganttState.currentDateRange);
    const x = ((toUTC(d) - toUTC(baseStart)) / DAY_MS) * ganttState.pxPerDay;
    el.scrollLeft = Math.max(0, x - el.clientWidth / 2);
  };

  // Zoom function
  const zoomBy = (delta: number) => {
    const el = ganttState.timelineRef.current;
    const next = Math.min(MAX_PX_PER_DAY, Math.max(MIN_PX_PER_DAY, ganttState.pxPerDay + delta));
    if (!el || next === ganttState.pxPerDay) {
      ganttState.setPxPerDay(next);
      return;
    }
    const centerX = el.scrollLeft + el.clientWidth / 2;
    const centerDays = centerX / ganttState.pxPerDay;
    ganttState.setPxPerDay(next);
    // keep same center date
    const newCenterX = centerDays * next;
    el.scrollLeft = Math.max(0, newCenterX - el.clientWidth / 2);
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      {/* Page header */}
      <PageHeader
        title="Conception"
        description="Planification et gestion des tâches du projet"
      />
      <div className={`flex-1 bg-gradient-to-br from-slate-900 to-slate-800 flex flex-col overflow-hidden ${ganttState.selectedTask ? 'pr-96' : ''}`}>
        {/* Toolbar with controls */}
        <GanttToolbar
          viewMode={ganttState.viewMode}
          setViewMode={ganttState.setViewMode}
          pxPerDay={ganttState.pxPerDay}
          zoomBy={zoomBy}
          scrollToDate={scrollToDate}
          today={today}
          addTask={ganttState.addTask}
          undo={ganttState.undo}
          redo={ganttState.redo}
          historyIndex={ganttState.historyIndex}
          historyLength={ganttState.history.length}
          menuOpen={ganttState.menuOpen}
          setMenuOpen={ganttState.setMenuOpen}
          exportMenuOpen={ganttState.exportMenuOpen}
          setExportMenuOpen={ganttState.setExportMenuOpen}
          importMenuOpen={ganttState.importMenuOpen}
          setImportMenuOpen={ganttState.setImportMenuOpen}
          menuPosition={ganttState.menuPosition}
          setMenuPosition={ganttState.setMenuPosition}
          exportMenuPosition={ganttState.exportMenuPosition}
          setExportMenuPosition={ganttState.setExportMenuPosition}
          importMenuPosition={ganttState.importMenuPosition}
          setImportMenuPosition={ganttState.setImportMenuPosition}
          menuButtonRef={ganttState.menuButtonRef}
          exportMenuRef={ganttState.exportMenuRef}
          importMenuRef={ganttState.importMenuRef}
          exportToCSV={exportImport.exportToCSV}
          exportToExcel={exportImport.exportToExcel}
          exportToMSProject={exportImport.exportToMSProject}
          exportData={exportImport.exportData}
          importFromCSV={exportImport.importFromCSV}
          importFromExcel={exportImport.importFromExcel}
          importData={exportImport.importData}
          importMistralGantt={exportImport.importMistralGantt}
          mistralModalOpen={ganttState.mistralModalOpen}
          setMistralModalOpen={ganttState.setMistralModalOpen}
          tasks={ganttState.tasks}
          links={ganttState.links}
          setTasks={ganttState.setTasks}
          setLinks={ganttState.setLinks}
          saveState={ganttState.saveState}
          // Version props
          versions={versions}
          currentVersion={currentVersion}
          setCurrentVersion={setCurrentVersion}
          onCreateVersion={handleCreateVersion}
          onDeleteVersion={handleDeleteVersion}
          onActivateVersion={handleActivateVersion}
          projectId={projectId || 0}
          versionsKey={versionsKey}
        />

        {/* Main Gantt Chart Area */}
        <div className="flex-1 overflow-hidden" onMouseMove={handlers.handleMouseMove} onMouseUp={handlers.handleMouseUp}>
          <div className="h-full max-w-[93vw] flex bg-slate-800 overflow-hidden relative">
            {/* Toggle button on the edge between panels */}
            <button
              onClick={() => ganttState.setShowTaskList(!ganttState.showTaskList)}
              className={`
                absolute top-1/2 -translate-y-1/2 z-50
                flex items-center gap-2 px-3 py-3
                bg-slate-800 border border-slate-700
                rounded-r-xl shadow-lg
                transition-all duration-300 ease-out
                hover:bg-slate-700 hover:border-slate-600 hover:shadow-xl
                ${ganttState.showTaskList 
                  ? 'left-[36rem] border-l-0 bg-slate-800/90 backdrop-blur-sm' 
                  : 'left-0 border bg-slate-800/95 backdrop-blur-sm'
                }
              `}
              title={ganttState.showTaskList ? 'Hide task list' : 'Show task list'}
            >
              <div className={`
                flex items-center justify-center w-8 h-8 rounded-lg
                transition-all duration-300
                ${ganttState.showTaskList 
                  ? 'bg-blue-500/20 text-blue-400' 
                  : 'bg-emerald-500/20 text-emerald-400'
                }
              `}>
                {ganttState.showTaskList ? (
                  <PanelLeftClose className="w-5 h-5" />
                ) : (
                  <PanelLeftOpen className="w-5 h-5" />
                )}
              </div>
              <span className={`
                text-sm font-medium whitespace-nowrap
                transition-all duration-300
                ${ganttState.showTaskList ? 'text-slate-400' : 'text-white'}
              `}>
                {ganttState.showTaskList ? 'Hide' : 'Show'}
              </span>
              <span className="text-slate-500 text-xs">
                {ganttState.showTaskList ? '' : 'List'}
              </span>
              {/* Animated indicator dot */}
              <div className={`
                absolute right-2 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full
                ${ganttState.showTaskList ? 'bg-blue-400 animate-pulse' : 'bg-emerald-400 animate-pulse'}
              `} />
            </button>
            
            {/* Left panel: Task list with details */}
            {ganttState.showTaskList && (
              <GanttTaskList
                tasks={ganttState.tasks}
                expandedTasks={ganttState.expandedTasks}
                setExpandedTasks={ganttState.setExpandedTasks}
                setSelectedTask={ganttState.setSelectedTask}
                setEditingTask={ganttState.setEditingTask}
                setShowEditor={ganttState.setShowEditor}
                handleTaskContextMenu={handlers.handleTaskContextMenu}
                deleteTask={ganttState.deleteTask}
                wasDragged={ganttState.wasDragged}
                setWasDragged={ganttState.setWasDragged}
                setDraggingProgress={ganttState.setDraggingProgress}
                taskListRef={ganttState.taskListRef}
                handleTaskListScroll={handlers.handleTaskListScroll}
                data={ganttState.data}
              />
            )}

            {/* Right panel: Scrollable timeline */}
            <GanttTimeline
              tasks={ganttState.tasks}
              columns={columns}
              groups={groups}
              totalTimelineWidth={totalTimelineWidth}
              todayX={todayX}
              today={today}
              cursorX={ganttState.cursorX}
              xFromDate={xFromDate}
              dateFromX={dateFromX}
              handleMouseDown={handlers.handleMouseDown}
              handleTaskMouseEnter={handlers.handleTaskMouseEnter}
              handleTaskMouseLeave={handlers.handleTaskMouseLeave}
              handleTaskContextMenu={handlers.handleTaskContextMenu}
              handleTimelineMouseMove={handlers.handleTimelineMouseMove}
              handleTimelineMouseLeave={handlers.handleTimelineMouseLeave}
              wasDragged={ganttState.wasDragged}
              setWasDragged={ganttState.setWasDragged}
              setSelectedTask={ganttState.setSelectedTask}
              setEditingTask={ganttState.setEditingTask}
              setShowEditor={ganttState.setShowEditor}
              setResizingTask={ganttState.setResizingTask}
              setDragOffset={ganttState.setDragOffset}
              timelineRef={ganttState.timelineRef}
              handleTimelineScroll={handlers.handleTimelineScroll}
              handleMouseMove={handlers.handleMouseMove}
              handleMouseUp={handlers.handleMouseUp}
              expandedTasks={ganttState.expandedTasks}
            />
          </div>
        </div>

        {/* Side panel: Task details when a task is selected */}
        <GanttTaskSummary
          selectedTask={ganttState.selectedTask}
          setSelectedTask={ganttState.setSelectedTask}
          livrables={ganttState.livrables}
          tasks={ganttState.tasks}
          setTasks={ganttState.setTasks}
          data={ganttState.data}
          projectId={projectId}
          updateTask={ganttState.updateTask}
          updateSelectedTask={ganttState.updateSelectedTask}
        />

        {/* Tooltip on task hover */}
        <GanttTooltip
          hoveredTask={ganttState.hoveredTask}
          tooltipPos={ganttState.tooltipPos}
          tasks={ganttState.tasks}
          data={ganttState.data}
        />

        {/* Right-click context menu */}
        <GanttContextMenu
          contextMenu={ganttState.contextMenu}
          setContextMenu={ganttState.setContextMenu}
          addChildTask={ganttState.addChildTask}
          setEditingTask={ganttState.setEditingTask}
          setShowEditor={ganttState.setShowEditor}
          deleteTask={ganttState.deleteTask}
        />

        {/* Task editor modal */}
        <GanttTaskEditor
          showEditor={ganttState.showEditor}
          editingTask={ganttState.editingTask}
          setEditingTask={ganttState.setEditingTask}
          setShowEditor={ganttState.setShowEditor}
          editorTab={ganttState.editorTab}
          setEditorTab={ganttState.setEditorTab}
          livrables={ganttState.livrables}
          showAddLivrable={ganttState.showAddLivrable}
          setShowAddLivrable={ganttState.setShowAddLivrable}
          newLivrableLabel={ganttState.newLivrableLabel}
          setNewLivrableLabel={ganttState.setNewLivrableLabel}
          newLivrableDescription={ganttState.newLivrableDescription}
          setNewLivrableDescription={ganttState.setNewLivrableDescription}
          handleAddLivrable={ganttState.handleAddLivrable}
          handleUploadLivrableFile={ganttState.handleUploadLivrableFile}
          deleteTask={ganttState.deleteTask}
          updateTask={ganttState.updateTask}
          data={ganttState.data}
        />
      </div>
    </div>
  );
};

export default GanttChart;
