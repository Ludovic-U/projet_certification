import { Task } from '../types';

// Get task color based on progress
export const getTaskColor = (progress: number) => {
  if (progress === 100) return '#00C000';
  if (progress >= 75) return '#10b981';
  if (progress >= 50) return '#f59e0b';
  if (progress > 0) return '#FF0000';
  return '#6b7280';
};

// Get task depth (how many levels deep in the hierarchy)
export const getTaskDepth = (taskId: number, tasks: Task[]): number => {
  let depth = 0;
  const currentTask = tasks.find(t => t.id === taskId);
  if (!currentTask) return 0;
  let task: Task = currentTask;
  while (task.parent !== 0) {
    const parentTask = tasks.find(t => t.id === task.parent);
    if (!parentTask) break;
    depth++;
    task = parentTask;
  }
  return depth;
};

// Get all descendants of a task (recursive)
export const getAllDescendants = (taskId: number, tasks: Task[]): Task[] => {
  const descendants: Task[] = [];
  const collectDescendants = (parentId: number) => {
    const directChildren = tasks.filter(t => t.parent === parentId);
    directChildren.forEach(child => {
      descendants.push(child);
      collectDescendants(child.id);
    });
  };
  collectDescendants(taskId);
  return descendants;
};

// Get visible tasks based on expanded state
export const getVisibleTasks = (tasks: Task[], expandedTasks: Set<number>): Task[] => {
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

// Get assignees for a task
export const getAssignees = (task: Task, users: { id: number; label: string }[]): string => {
  return (task.assigneeIds || [])
    .map(id => users.find(u => u.id === id)?.label)
    .filter(Boolean)
    .join(', ');
};

// Check if task has children
export const hasChildren = (taskId: number, tasks: Task[]): boolean => {
  return tasks.some(t => t.parent === taskId);
};

// Get direct children of a task
export const getChildren = (taskId: number, tasks: Task[]): Task[] => {
  return tasks.filter(t => t.parent === taskId);
};
