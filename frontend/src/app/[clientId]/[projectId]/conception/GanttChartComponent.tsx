"use client";

/**
 * Gantt Chart Component for Project Conception
 * This component provides a full-featured Gantt chart for managing project tasks,
 * including drag-and-drop, resizing, progress tracking, and timeline visualization.
 */

import React, { useMemo, useState, useEffect, useCallback, useRef } from 'react';
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
import { GanttTutorial } from './components/GanttTutorial';
import { generateColumns, getBaseStart } from './utils/timelineUtils';
import { startOfDay } from './utils/dateUtils';
import { DAY_MS } from './constants';
import { toUTC } from './utils/dateUtils';
import { MIN_PX_PER_DAY, MAX_PX_PER_DAY } from './constants';
import { getTotalBudget, calculateBudgetTotals, getTaskBudget, calculateExpenseLinesTotal } from './utils/budgetUtils';
import { PanelLeftClose, PanelLeftOpen, X } from 'lucide-react';

import { useParams } from 'next/navigation';
import { fetchVersions, createVersion, deleteVersion as deleteVersionApi, activateVersion as activateVersionApi, Version } from '@/api/ganttApi';

export default function GanttChartComponent() {
  const params = useParams();
  const projectId = params?.projectId ? parseInt(params.projectId as string, 10) : null;
  
  // Version state
  const [versions, setVersions] = useState<Version[]>([]);
  const [currentVersion, setCurrentVersion] = useState<Version | null>(null);
  
  // Tutorial state
  const [tutorialOpen, setTutorialOpen] = useState(false);
  
  // Budget view state
  const [showBudgetView, setShowBudgetView] = useState(false);
  
  // Ref to track current version (for async operations)
  const currentVersionRef = useRef<Version | null>(null);
  
  // Keep ref in sync with state
  useEffect(() => {
    currentVersionRef.current = currentVersion;
  }, [currentVersion]);
  
  // Persist version selection to localStorage
  useEffect(() => {
    if (projectId && currentVersion) {
      localStorage.setItem(`project_${projectId}_currentVersion`, JSON.stringify(currentVersion));
    }
  }, [projectId, currentVersion]);
  
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
    try {
      const data = await fetchVersions(projectId);
      setVersions(data);
      
      // If override is provided (e.g., newly created version), use it
      if (overrideVersion) {
        const stillExists = data.find(v => v.versionId === overrideVersion.versionId);
        if (stillExists) {
          setCurrentVersion(overrideVersion);
          return;
        }
      }
      
      // Check if current version still exists
      const savedVersion = currentVersionRef.current;
      if (savedVersion) {
        const stillExists = data.find(v => v.versionId === savedVersion.versionId);
        if (stillExists) {
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
      
      // Set default version
      if (data.length > 0) {
        const activeVersion = data.find(v => v.isActive);
        setCurrentVersion(activeVersion || data[0]);
      } else {
        setCurrentVersion(null);
      }
    } catch (error) {
      console.error('Error loading versions:', error);
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
  
  // Use custom hooks for state management
  const ganttState = useGanttState();
  
  // Handler to open budget view - shows the project budget modal
  const handleOpenBudgetView = useCallback(() => {
    setShowBudgetView(true);
  }, []);
  
  // Re-fetch Gantt data when currentVersion changes
  // Only load on version change, NOT on every ganttState change (which would break dragging)
  useEffect(() => {
    if (projectId && currentVersion !== undefined) {
      ganttState.loadData(currentVersion?.versionId);
      ganttState.setVersionId(currentVersion?.versionId || null);
    }
  }, [projectId, currentVersion]);
  
  // Use custom hook for event handlers
  const handlers = useGanttHandlers({
    tasks: ganttState.tasks,
    links: ganttState.links,
    projectId: projectId,
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
    tasksRef: ganttState.tasksRef,
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
    <div className="flex flex-col h-full overflow-hidden">
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
          // Tutorial props
          tutorialOpen={tutorialOpen}
          setTutorialOpen={setTutorialOpen}
          // Budget view props
          onOpenBudgetView={handleOpenBudgetView}
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
          handleDeleteLivrable={ganttState.handleDeleteLivrable}
          deleteTask={ganttState.deleteTask}
          updateTask={ganttState.updateTask}
          projectId={projectId}
          data={ganttState.data}
        />
        
        {/* Tutorial Modal */}
        <GanttTutorial 
          isOpen={tutorialOpen} 
          onClose={() => setTutorialOpen(false)} 
        />
        
        {/* Budget View Modal */}
        {showBudgetView && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
            <div className="bg-slate-800 rounded-2xl w-full max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
              {/* Header */}
              <div className="flex justify-between items-center p-6 border-b border-slate-700">
                <h2 className="text-2xl font-bold text-white">Budget du Projet</h2>
                <button 
                  onClick={() => setShowBudgetView(false)}
                  className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-slate-400" />
                </button>
              </div>
              
              {/* Content */}
              <div className="flex-1 overflow-auto p-6">
                {(() => {
                  const tasksWithBudget = ganttState.tasks.filter(t => t.budget);
                  const totalBudget = getTotalBudget(ganttState.tasks);
                  
                  return (
                    <div className="space-y-6">
                      {/* Total Budget Summary */}
                      <div className="bg-gradient-to-r from-cyan-500/20 to-blue-500/20 rounded-2xl p-6 border border-cyan-500/30">
                        <div className="text-center">
                          <p className="text-slate-400 text-sm uppercase tracking-wide mb-2">Budget Total du Projet</p>
                          <p className="text-4xl font-bold text-cyan-400">
                            {totalBudget.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
                          </p>
                          <p className="text-slate-400 mt-2">
                            {tasksWithBudget.length} tâche{tasksWithBudget.length !== 1 ? 's' : ''} avec budget
                          </p>
                        </div>
                      </div>
                      
                      {/* Task Budgets */}
                      <div className="grid gap-4">
                        {tasksWithBudget.map(task => {
                          const budget = task.budget!;
                          const totals = calculateBudgetTotals(budget);
                          return (
                            <div key={task.id} className="bg-slate-700/50 rounded-xl p-4 hover:bg-slate-700/70 transition-colors">
                              <div className="flex justify-between items-start mb-3">
                                <h3 className="text-lg font-semibold text-white">{task.text}</h3>
                                <span className="text-emerald-400 font-bold text-lg">
                                  {totals.total.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
                                </span>
                              </div>
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                <div>
                                  <span className="text-slate-400">Lignes de dépenses:</span>
                                  <p className="text-cyan-400 font-medium">
                                    {totals.expenseLinesTotal.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
                                  </p>
                                </div>
                                <div>
                                  <span className="text-slate-400">Personnel:</span>
                                  <p className="text-white font-medium">
                                    {budget.personnelCost.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
                                  </p>
                                </div>
                                <div>
                                  <span className="text-slate-400">Frais:</span>
                                  <p className="text-white font-medium">
                                    {(budget.fittingsCost + budget.educationalEquipmentCost + budget.subcontractorCost + budget.travelCost + budget.otherPrestationsCost + budget.communicationCost).toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
                                  </p>
                                </div>
                                <div>
                                  <span className="text-slate-400">Frais généraux:</span>
                                  <p className="text-purple-400 font-medium">
                                    {totals.overhead.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
                                  </p>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                      
                      {tasksWithBudget.length === 0 && (
                        <div className="text-center py-12">
                          <p className="text-slate-400 text-lg">Aucune tâche avec budget défini</p>
                          <p className="text-slate-500 text-sm mt-2">Créez une tâche et ajoutez un budget pour voir les détails ici</p>
                        </div>
                      )}
                    </div>
                  );
                })()}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
