import React from 'react';
import { ChevronDown, ChevronRight, Trash2, Check, Folder } from 'lucide-react';
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

  const getTypeStyles = (type: string) => {
    switch (type) {
      case 'milestone':
        return { icon: '◆', color: 'text-purple-400', bg: 'bg-purple-500/20' };
      case 'project':
        return { icon: '■', color: 'text-emerald-400', bg: 'bg-emerald-500/20' };
      default:
        return { icon: '○', color: 'text-blue-400', bg: 'bg-blue-500/20' };
    }
  };

  return (
    <div className="w-[36rem] border-r border-slate-700 bg-slate-900/50 backdrop-blur-sm flex flex-col overflow-hidden">
      {/* Header row */}
      <div className="flex border-b border-slate-700 bg-slate-800/80 backdrop-blur flex-shrink-0">
        <div className="flex-1 px-4 py-3 font-semibold text-slate-300 text-sm border-r border-slate-700 flex items-center">
          <span className="flex items-center gap-2">
            <Folder className="w-4 h-4 text-slate-400" />
            Task Name
          </span>
        </div>
        <div className="w-28 px-3 py-3 font-semibold text-slate-300 text-sm border-r border-slate-700 flex items-center justify-center">
          <span className="flex items-center gap-2">
            <CalendarIcon className="w-4 h-4" />
            Start
          </span>
        </div>
        <div className="w-36 px-3 py-3 font-semibold text-slate-300 text-sm border-r border-slate-700 flex items-center">
          <span className="flex items-center gap-2">
            <UserIcon className="w-4 h-4" />
            Assignees
          </span>
        </div>
        <div className="w-28 px-3 py-3 font-semibold text-slate-300 text-sm flex items-center justify-center">
          <span className="flex items-center gap-2">
            <ProgressIcon className="w-4 h-4" />
            Progress
          </span>
        </div>
      </div>
      
      {/* Task list rows */}
      <div ref={taskListRef} className="flex-1 overflow-y-auto pl-[10px] custom-scrollbar" onScroll={handleTaskListScroll}>
        {getVisibleTasks().map(task => {
          const isExpanded = expandedTasks.has(task.id);
          const indent = getTaskDepth(task.id, tasks) * 28;
          const typeStyles = getTypeStyles(task.type);
          const isCompleted = task.progress === 100;

          return (
            <div
              key={task.id}
              className="flex border-b border-slate-800 hover:bg-slate-800/70 cursor-pointer group items-center transition-colors"
              style={{ height: `${ROW_HEIGHT}px` }}
              onClick={(e) => {
                if (wasDragged) {
                  setWasDragged(false);
                  return;
                }
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
              <div 
                className="flex-1 px-4 border-r border-slate-700 h-full flex items-center gap-2 transition-colors"
                style={{ paddingLeft: `${indent + 8}px` }}
              >
                {hasChildren(task.id, tasks) ? (
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
                    className="p-1.5 hover:bg-slate-700 rounded-lg flex-shrink-0 transition-colors"
                  >
                    {isExpanded ? (
                      <ChevronDown className="w-4 h-4 text-slate-400" />
                    ) : (
                      <ChevronRight className="w-4 h-4 text-slate-400" />
                    )}
                  </button>
                ) : (
                  <span className="w-8 flex-shrink-0" />
                )}
                
                <div className={`w-8 h-8 rounded-lg ${typeStyles.bg} flex items-center justify-center flex-shrink-0`}>
                  {task.type === 'milestone' ? (
                    <div className="w-4 h-4 bg-purple-400" style={{ clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)' }} />
                  ) : task.type === 'project' ? (
                    <span className="text-emerald-400 font-bold text-sm">■</span>
                  ) : (
                    <span className="w-2 h-2 rounded-full bg-blue-400" />
                  )}
                </div>
                
                <span className={`font-medium text-slate-200 truncate text-sm ${isCompleted ? 'line-through opacity-60' : ''}`}>
                  {task.text}
                </span>
                
                {hasChildren(task.id, tasks) && (
                  <span className="text-xs text-slate-500 bg-slate-700/50 px-2 py-0.5 rounded-full flex-shrink-0">
                    {expandedTasks.has(task.id) ? 'Expanded' : 'Collapsed'}
                  </span>
                )}
              </div>
              
              <div className="w-28 px-3 border-r border-slate-700 h-full flex items-center justify-center">
                <span className="text-xs text-slate-400 font-medium bg-slate-800/50 px-2 py-1 rounded-lg">
                  {formatDate(task.start)}
                </span>
              </div>
              
              <div className="w-36 px-3 border-r border-slate-700 h-full flex items-center">
                <AssigneeAvatars assignees={getAssignees(task, data.users)} />
              </div>
              
              <div className="w-28 px-3 h-full flex items-center justify-end gap-2">
                {isCompleted ? (
                  <div className="flex items-center gap-1.5 px-2 py-1 bg-emerald-500/20 rounded-lg">
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-xs font-medium text-emerald-400">Done</span>
                  </div>
                ) : (
                  <>
                    <span className="text-xs font-semibold text-slate-300 w-10 text-right">{task.progress}%</span>
                    <div
                      className="w-12 bg-slate-700 rounded-full h-2 cursor-ew-resize flex-shrink-0 overflow-hidden"
                      onMouseDown={(e) => {
                        e.stopPropagation();
                        const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
                        const deltaX = e.clientX - rect.left;
                        const initialProgress = Math.max(0, Math.min(100, (deltaX / rect.width) * 100));
                        setDraggingProgress({ task, startX: e.clientX, startProgress: initialProgress });
                      }}
                    >
                      <div
                        className="h-full rounded-full transition-all"
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
                  className="opacity-0 group-hover:opacity-100 p-1.5 text-slate-500 hover:text-red-400 hover:bg-red-900/20 rounded-lg transition-all flex-shrink-0"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// Helper Components
const CalendarIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <rect x="3" y="4" width="18" height="18" rx="2" strokeWidth="2" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 2v4M8 2v4M3 10h18" />
  </svg>
);

const UserIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <circle cx="12" cy="8" r="4" strokeWidth="2" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 20c0-4 4-6 8-6s8 2 8 6" />
  </svg>
);

const ProgressIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <circle cx="12" cy="12" r="10" strokeWidth="2" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6l4 2" />
  </svg>
);

const AssigneeAvatars: React.FC<{ assignees: string }> = ({ assignees }) => {
  const names = assignees.split(', ').filter(n => n);
  const displayNames = names.slice(0, 3);
  const remaining = names.length - 3;

  if (!assignees || assignees === 'Unassigned') {
    return (
      <span className="text-xs text-slate-500 italic">Unassigned</span>
    );
  }

  return (
    <div className="flex items-center">
      {displayNames.map((name, index) => {
        const initials = name.split(' ').map(n => n[0]).join('').toUpperCase();
        const colors = [
          'bg-blue-500',
          'bg-emerald-500',
          'bg-amber-500',
        ];
        
        return (
          <div
            key={index}
            className={`${colors[index]} w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold ring-2 ring-slate-800 -ml-2 first:ml-0`}
            title={name}
          >
            {initials}
          </div>
        );
      })}
      {remaining > 0 && (
        <div className="w-7 h-7 rounded-full bg-slate-600 flex items-center justify-center text-white text-xs font-bold ring-2 ring-slate-800 -ml-2">
          +{remaining}
        </div>
      )}
    </div>
  );
};
