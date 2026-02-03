import React from 'react';
import { GripVertical } from 'lucide-react';
import { Task, Column, Group } from '../types';
import { ROW_HEIGHT } from '../constants';
import { formatDate, startOfDay, isDateInRange } from '../utils/dateUtils';
import { getTaskColor } from '../utils/taskUtils';

interface GanttTimelineProps {
  tasks: Task[];
  columns: Column[];
  groups: Group[];
  totalTimelineWidth: number;
  todayX: number;
  today: Date;
  cursorX: number | null;
  xFromDate: (d: Date) => number;
  dateFromX: (x: number) => Date;
  handleMouseDown: (task: Task, e: React.MouseEvent<HTMLDivElement>) => void;
  handleTaskMouseEnter: (task: Task, e: React.MouseEvent<HTMLElement>) => void;
  handleTaskMouseLeave: () => void;
  handleTaskContextMenu: (task: Task, e: React.MouseEvent<HTMLElement>) => void;
  handleTimelineMouseMove: (e: React.MouseEvent) => void;
  handleTimelineMouseLeave: () => void;
  wasDragged: boolean;
  setWasDragged: (wasDragged: boolean) => void;
  setSelectedTask: (task: Task | null) => void;
  setEditingTask: (task: Task | null) => void;
  setShowEditor: (show: boolean) => void;
  setResizingTask: (task: { task: Task; side: 'left' | 'right' } | null) => void;
  setDragOffset: (offset: { x: number; y: number }) => void;
  timelineRef: React.RefObject<HTMLDivElement | null>;
  handleTimelineScroll: (e: React.UIEvent<HTMLDivElement>) => void;
  handleMouseMove: (e: React.MouseEvent<HTMLDivElement>) => void;
  handleMouseUp: () => void;
  expandedTasks: Set<number>;
}

export const GanttTimeline: React.FC<GanttTimelineProps> = ({
  tasks,
  columns,
  groups,
  totalTimelineWidth,
  todayX,
  today,
  cursorX,
  xFromDate,
  dateFromX,
  handleMouseDown,
  handleTaskMouseEnter,
  handleTaskMouseLeave,
  handleTaskContextMenu,
  handleTimelineMouseMove,
  handleTimelineMouseLeave,
  wasDragged,
  setWasDragged,
  setSelectedTask,
  setEditingTask,
  setShowEditor,
  setResizingTask,
  setDragOffset,
  timelineRef,
  handleTimelineScroll,
  handleMouseMove,
  handleMouseUp,
  expandedTasks,
}) => {
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

  return (
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
        <div className="relative" onMouseMove={handleTimelineMouseMove} onMouseLeave={handleTimelineMouseLeave}>
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
  );
};
