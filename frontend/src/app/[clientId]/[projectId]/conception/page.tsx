"use client";

/**
 * Gantt Chart Component for Project Conception
 * This component provides a full-featured Gantt chart for managing project tasks,
 * including drag-and-drop, resizing, progress tracking, and timeline visualization.
 */

import React, { useMemo } from 'react';
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

import { useParams } from 'next/navigation';

const GanttChart = () => {
  const params = useParams();
  const projectId = params?.projectId ? parseInt(params.projectId as string, 10) : null;
  
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
          exportMenuPosition={ganttState.exportMenuPosition}
          importMenuPosition={ganttState.importMenuPosition}
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
        />

        {/* Main Gantt Chart Area */}
        <div className="flex-1 overflow-hidden" onMouseMove={handlers.handleMouseMove} onMouseUp={handlers.handleMouseUp}>
          <div className="h-full max-w-[93vw] flex bg-slate-800 overflow-hidden relative">
            {/* Toggle button on the edge between panels */}
            <button
              onClick={() => ganttState.setShowTaskList(!ganttState.showTaskList)}
              className={`absolute top-1/2 -translate-y-1/2 z-50 flex items-center gap-1 px-3 py-2 bg-slate-800 border border-slate-700 rounded-r-lg hover:bg-slate-700 transition-all ${ganttState.showTaskList ? 'left-[32rem] border-l-0' : 'left-0 border'}`}
              title={ganttState.showTaskList ? 'Masquer la liste des tâches' : 'Afficher la liste des tâches'}
            >
              {ganttState.showTaskList ? (
                <span className="text-white text-sm whitespace-nowrap">Masquer la liste</span>
              ) : (
                <>
                  <span className="text-white text-sm whitespace-nowrap">Afficher la liste</span>
                </>
              )}
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
          deleteTask={ganttState.deleteTask}
          updateTask={ganttState.updateTask}
          data={ganttState.data}
        />
      </div>
    </div>
  );
};

export default GanttChart;
