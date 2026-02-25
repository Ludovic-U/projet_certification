import React from 'react';
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
    <div 
      ref={timelineRef} 
      className="flex-1 overflow-x-auto bg-slate-900/50 backdrop-blur-sm min-w-0 custom-scrollbar"
      onScroll={handleTimelineScroll}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
    >
      <div className="relative" style={{ width: `${totalTimelineWidth}px` }}>
        {/* Sticky timeline headers */}
        <div className="sticky top-0 z-20 bg-slate-800/95 backdrop-blur shadow-lg">
          {/* Group row */}
          <div className="flex border-b border-slate-700">
            {groups.map((g) => (
              <div
                key={g.key}
                className="px-3 py-2 text-center text-sm font-semibold text-slate-300 border-r border-slate-700 flex items-center justify-center bg-slate-800/50"
                style={{ width: `${g.width}px` }}
              >
                <span className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-blue-400" />
                  {g.label}
                </span>
              </div>
            ))}
          </div>
          {/* Unit row */}
          <div className="flex border-b border-slate-700">
            {columns.map((col) => {
              const isToday = isDateInRange(today, col.start, col.end);
              const isWeekend = col.label === 'Sam' || col.label === 'Dim';
              
              return (
                <div
                  key={col.key}
                  className={`
                    px-2 py-2 text-center text-xs font-medium border-r border-slate-700 flex flex-col items-center justify-center
                    ${isToday ? 'bg-blue-500/20 text-blue-400' : 'text-slate-400'}
                    ${isWeekend ? 'bg-slate-800/50' : ''}
                  `}
                  style={{ width: `${col.width}px` }}
                >
                  <span className={isToday ? 'text-blue-400 font-bold' : ''}>{col.label}</span>
                  {isToday && (
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-1 animate-pulse" />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Task bars and grid lines */}
        <div className="relative" onMouseMove={handleTimelineMouseMove} onMouseLeave={handleTimelineMouseLeave}>
          {/* Today marker - enhanced */}
          <div 
            className="pointer-events-none absolute top-0 bottom-0 w-[2px] bg-gradient-to-b from-red-500 via-red-400 to-red-500 z-30 shadow-[0_0_10px_rgba(239,68,68,0.5)]"
            style={{ left: `${todayX}px` }}
          >
            <div className="absolute -top-1 -left-1.5 w-4 h-4 bg-red-500 rounded-full shadow-lg flex items-center justify-center">
              <div className="w-2 h-2 bg-white rounded-full" />
            </div>
          </div>
          
          {/* Cursor tooltip */}
          {cursorX !== null && (
            <>
              <div className="pointer-events-none absolute top-0 bottom-0 w-px bg-white/30 z-30" style={{ left: `${cursorX}px` }} />
              <div 
                className="pointer-events-none absolute z-40 -translate-x-1/2 translate-y-1 px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 shadow-xl flex items-center gap-2"
                style={{ top: 0, left: `${cursorX}px` }}
              >
                <div className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
                <span className="text-sm font-medium text-white">
                  {formatDate(startOfDay(dateFromX(cursorX)))}
                </span>
              </div>
            </>
          )}
          
          {/* Grid lines with subtle styling */}
          <div className="absolute inset-0 flex">
            {columns.map((col) => (
              <div
                key={col.key}
                className={`
                  border-r border-slate-800/50
                  ${isDateInRange(today, col.start, col.end) ? 'bg-blue-500/5' : ''}
                `}
                style={{ width: `${col.width}px` }}
              />
            ))}
          </div>

          {getVisibleTasks().map((task) => {
            const isMilestone = task.type === 'milestone';
            const isCompleted = task.progress === 100;
            
            return (
              <div
                key={task.id}
                className="relative border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors"
                style={{ height: `${ROW_HEIGHT}px` }}
              >
                {isMilestone ? (
                  <div
                    className="absolute top-1/2 -translate-y-1/2 cursor-move z-10 group"
                    style={{
                      left: `${xFromDate(new Date(task.start)) - 12}px`,
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
                    {/* Milestone diamond with glow - always purple */}
                    <div 
                      className={`
                        w-6 h-6 shadow-lg transition-all duration-200 bg-purple-500
                        hover:scale-110 hover:shadow-purple-400/30
                      `}
                      style={{ clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)' }}
                    >
                      {isCompleted && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <svg className="w-4 h-4 text-emerald-900" fill="currentColor" viewBox="0 0 20 20">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" />
                          </svg>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div
                    className="group absolute top-1/2 -translate-y-1/2 cursor-move z-10"
                    data-tutorial-id="task-bar"
                    style={{
                      ...getTaskStyle(task),
                      minWidth: '40px',
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
                    {/* Task bar with gradient based on progress */}
                    <div
                      className={`
                        h-8 rounded-lg shadow-lg transition-all duration-200 relative overflow-hidden
                        ${isCompleted ? 'bg-gradient-to-r from-emerald-500 to-emerald-400' : 'bg-gradient-to-r from-blue-500 to-blue-400'}
                        group-hover:shadow-blue-400/25 group-hover:scale-[1.02]
                      `}
                      style={{ 
                        background: isCompleted 
                          ? undefined 
                          : `linear-gradient(to right, ${getTaskColor(task.progress)}, ${getTaskColor(task.progress)}aa)`
                      }}
                    >
                      {/* Animated shine effect */}
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-[shine_1s_ease-in-out]" />
                      
                      {/* Inner shadow */}
                      <div className="absolute inset-0 rounded-lg ring-1 ring-black/10" />

                      {/* Progress overlay */}
                      <div
                        className="absolute bottom-0 left-0 h-1 bg-white/30 rounded-b-lg"
                        data-tutorial-id="task-progress"
                        style={{ width: `${task.progress}%` }}
                      />

                      {/* Content */}
                      <div className="h-full flex items-center justify-between px-3 text-white text-sm font-medium relative z-10">
                        <span className="truncate drop-shadow-md">{task.text}</span>
                        <div className="flex flex-col items-end text-xs opacity-90">
                          <span className="font-bold">{task.progress}%</span>
                        </div>
                      </div>
                    </div>

                    {/* Resize handles - more visible */}
                    <div
                      className="absolute inset-y-0 left-0 w-5 cursor-ew-resize opacity-0 group-hover:opacity-100 transition-opacity z-20 flex items-center justify-center"
                      onMouseDown={(e) => { e.stopPropagation(); setResizingTask({ task, side: 'left' }); setDragOffset({ x: e.clientX, y: e.clientY }); }}
                      title="Redimensionner le début"
                    >
                      <div className="w-1 h-6 bg-white/40 rounded-full hover:bg-white/80 transition-colors" />
                    </div>
                    <div
                      className="absolute inset-y-0 right-0 w-5 cursor-ew-resize opacity-0 group-hover:opacity-100 transition-opacity z-20 flex items-center justify-center"
                      onMouseDown={(e) => { e.stopPropagation(); setResizingTask({ task, side: 'right' }); setDragOffset({ x: e.clientX, y: e.clientY }); }}
                      title="Redimensionner la fin"
                    >
                      <div className="w-1 h-6 bg-white/40 rounded-full hover:bg-white/80 transition-colors" />
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
