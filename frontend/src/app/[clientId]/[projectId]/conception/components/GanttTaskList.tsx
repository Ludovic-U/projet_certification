import React from 'react';
import { ChevronDown, ChevronRight, Trash2, Check } from 'lucide-react';
import { Task } from '../types';
import { ROW_HEIGHT } from '../constants';
import { formatDate } from '../utils/dateUtils';
import { getTaskColor, getTaskDepth, hasChildren, getAssignees } from '../utils/taskUtils';

interface GanttTaskListProps {
  tasks: Task[];
  expandedTasks: Set<number>;
  setExpandedTasks: (set: Set<number> | ((prev: Set<number>) => Set<number>)) => void;
  setSelectedTask: (task: Task | null) => void;
  setEditingTask: (task: Task | null) => void;
  setShowEditor: (show: boolean) => void;
  handleTaskContextMenu: (task: Task, e: React.MouseEvent<HTMLElement>) => void;
  deleteTask: (id: number) => void;
  wasDragged: boolean;
  setWasDragged: (wasDragged: boolean) => void;
  setDraggingProgress: (progress: { task: Task; startX: number; startProgress: number } | null) => void;
  taskListRef: React.RefObject<HTMLDivElement | null>;
  handleTaskListScroll: (e: React.UIEvent<HTMLDivElement>) => void;
  data: {
    users: { id: number; label: string }[];
  };
}

export const GanttTaskList: React.FC<GanttTaskListProps> = ({
  tasks,
  expandedTasks,
  setExpandedTasks,
  setSelectedTask,
  setEditingTask,
  setShowEditor,
  handleTaskContextMenu,
  deleteTask,
  wasDragged,
  setWasDragged,
  setDraggingProgress,
  taskListRef,
  handleTaskListScroll,
  data,
}) => {
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
    <div className="w-[32rem] border-r border-slate-700 bg-slate-800 flex flex-col overflow-hidden">
      {/* Header row */}
      <div className="flex border-b border-slate-700 bg-slate-800 flex-shrink-0">
        <div className="flex-1 px-3 py-2 font-semibold text-white border-r border-slate-600">Task name</div>
        <div className="w-32 px-3 py-2 font-semibold text-white border-r border-slate-600">Start</div>
        <div className="w-40 px-3 py-2 font-semibold text-white border-r border-slate-600">Assignees</div>
        <div className="w-32 px-3 py-2 font-semibold text-white">Progress</div>
      </div>
      {/* Task list rows */}
      <div ref={taskListRef} className="flex-1 overflow-y-auto pl-[10px]" onScroll={handleTaskListScroll}>
        {getVisibleTasks().map(task => {
          const isExpanded = expandedTasks.has(task.id);
          const indent = getTaskDepth(task.id, tasks) * 24;
          return (
            <div
              key={task.id}
              className="flex border-b border-slate-700 hover:bg-slate-700 cursor-pointer group items-center"
              style={{ height: `${ROW_HEIGHT}px` }}
              onClick={(e) => {
                if (wasDragged) {
                  setWasDragged(false);
                  return;
                }
                // Don't set selected task if clicking on expand/collapse button
                if ((e.target as HTMLElement).closest('button')) {
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
              <div className="flex-1 px-3 border-r border-slate-600 h-full flex items-center" style={{ paddingLeft: `${indent}px` }}>
                {hasChildren(task.id, tasks) && (
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
                    className="mr-2 p-0.5 hover:bg-slate-600 rounded flex-shrink-0"
                  >
                    {isExpanded ? <ChevronDown className="w-4 h-4 text-slate-400" /> : <ChevronRight className="w-4 h-4 text-slate-400" />}
                  </button>
                )}
                {task.type === 'milestone' && (
                  <div
                    className="w-5 h-5 bg-purple-500 mr-2 flex-shrink-0"
                    style={{ clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)' }}
                  ></div>
                )}
                <span className="font-medium text-white truncate text-sm">{task.text} {task.type === 'project' ? '■' : ''}</span>
              </div>
              <div className="w-32 px-3 border-r border-slate-600 h-full flex items-center text-xs text-slate-400">
                {formatDate(task.start)}
              </div>
              <div className="w-40 px-3 border-r border-slate-600 h-full flex items-center text-xs text-slate-400 truncate">
                {getAssignees(task, data.users)}
              </div>
              <div className="w-32 px-3 h-full flex items-center justify-end gap-2">
                {task.progress === 100 ? (
                  <div className="flex items-center gap-1 text-green-400">
                    <Check className="w-4 h-4" />
                    <span className="text-xs font-medium">Completed</span>
                  </div>
                ) : (
                  <>
                    <span className="text-xs text-slate-400">{task.progress}%</span>
                    <div
                      className="w-10 bg-slate-700 rounded-full h-1.5 cursor-ew-resize flex-shrink-0"
                      onMouseDown={(e) => {
                        e.stopPropagation();
                        const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
                        const deltaX = e.clientX - rect.left;
                        const initialProgress = (deltaX / rect.width) * 100;
                        setDraggingProgress({task, startX: e.clientX, startProgress: initialProgress});
                      }}
                    >
                      <div
                        className="h-1.5 rounded-full transition-all"
                        style={{
                          width: `${task.progress}%`,
                          backgroundColor: getTaskColor(task.progress)
                        }}
                      />
                    </div>
                  </>
                )}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteTask(task.id);
                  }}
                  className="opacity-0 group-hover:opacity-100 p-0.5 text-red-400 hover:bg-red-900/20 rounded transition-opacity flex-shrink-0"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
