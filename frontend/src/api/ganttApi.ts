import api from './axiosInstance';
import { Task, Link, Livrable, User } from '@/app/[clientId]/[projectId]/data';

// Re-export types for convenience
export type { Task, Link, Livrable, User };

export interface GanttData {
  tasks: Task[];
  links: Link[];
  users: User[];
  livrables: Livrable[];
}

export interface SubAction {
  id: number;
  label: string;
  actionId: number;
  actionName: string;
  startDate: string;
  endDate: string;
}

// Type for file upload response
interface FileUploadResponse {
  url: string;
  originalName: string;
  filename: string;
}

// Version type
export interface Version {
  versionId: number;
  projectId: number;
  name: string;
  description: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  taskCount?: number;
  linkCount?: number;
}

// Type for API task response (dates as strings)
export interface ApiTaskResponse {
  id: number;
  text: string;
  start: string | null;
  end: string | null;
  progress: number;
  parent: number;
  type: 'task' | 'milestone' | 'project';
  details: string;
  description?: string;
  notes: string;
  files: string[];
  assigneeIds: number[];
  livrableIds: number[];
  goal?: string;
  color?: string;
  subActionId?: number | null;
  actionId?: number;
}

/**
 * Convert API task response to Task type (dates as Date objects)
 */
export const convertApiTaskToTask = (apiTask: ApiTaskResponse): Task => ({
  id: apiTask.id,
  text: apiTask.text,
  start: apiTask.start ? new Date(apiTask.start) : new Date(),
  end: apiTask.end ? new Date(apiTask.end) : new Date(),
  progress: apiTask.progress,
  parent: apiTask.parent,
  type: apiTask.type,
  details: apiTask.details,
  description: apiTask.description,
  notes: apiTask.notes,
  files: apiTask.files,
  assigneeIds: apiTask.assigneeIds,
  livrableIds: apiTask.livrableIds,
  goal: apiTask.goal,
  color: apiTask.color || '#3b82f6',
});

/**
 * Fetch all Gantt data for a project
 */
export const fetchGanttData = async (projectId: number, versionId?: number): Promise<GanttData> => {
  const url = versionId ? `/gantt/${projectId}?versionId=${versionId}` : `/gantt/${projectId}`;
  const response = await api.get(url);
  const data = response.data;
  
  // Convert date strings to Date objects
  if (data.tasks) {
    data.tasks = data.tasks.map((task: ApiTaskResponse) => convertApiTaskToTask(task));
  }
  
  return data;
};

/**
 * Create a new task
 */
export const createTask = async (
  projectId: number,
  taskData: Partial<Task>
): Promise<Task> => {
  const response = await api.post(`/gantt/${projectId}/tasks`, {
    projectId,
    ...taskData
  });
  const task = response.data;
  
  // Convert date strings to Date objects with fallback
  return {
    id: task.id,
    text: task.text || 'New Task',
    start: task.start ? new Date(task.start) : new Date(),
    end: task.end ? new Date(task.end) : new Date(),
    progress: task.progress || 0,
    parent: task.parent || 0,
    type: task.type || 'task',
    details: task.details || '',
    notes: task.notes || '',
    files: task.files || [],
    assigneeIds: task.assigneeIds || [],
    livrableIds: task.livrableIds || [],
    goal: task.goal,
    color: task.color || '#3b82f6',
  };
};

/**
 * Update an existing task
 */
export const updateTask = async (
  projectId: number,
  taskId: number,
  taskData: Partial<Task>
): Promise<Task> => {
  const response = await api.put(`/gantt/${projectId}/tasks/${taskId}`, taskData);
  const task = response.data;
  
  // Convert date strings to Date objects with fallback
  return {
    id: task.id,
    text: task.text || 'Task',
    start: task.start ? new Date(task.start) : new Date(),
    end: task.end ? new Date(task.end) : new Date(),
    progress: task.progress || 0,
    parent: task.parent || 0,
    type: task.type || 'task',
    details: task.details || '',
    notes: task.notes || '',
    files: task.files || [],
    assigneeIds: task.assigneeIds || [],
    livrableIds: task.livrableIds || [],
    goal: task.goal,
    color: task.color || '#3b82f6',
  };
};

/**
 * Delete a task
 */
export const deleteTask = async (projectId: number, taskId: number): Promise<void> => {
  await api.delete(`/gantt/${projectId}/tasks/${taskId}`);
};

/**
 * Bulk update tasks (for drag/drop operations)
 */
export const bulkUpdateTasks = async (
  projectId: number,
  tasks: Array<{ id: number; start?: Date; end?: Date; progress?: number; parent?: number }>
): Promise<void> => {
  await api.put(`/gantt/${projectId}/tasks/bulk`, { tasks });
};

/**
 * Create a new task link
 */
export const createTaskLink = async (
  projectId: number,
  linkData: { source: number; target: number; type?: number }
): Promise<Link> => {
  const response = await api.post(`/gantt/${projectId}/links`, linkData);
  return response.data;
};

/**
 * Delete a task link
 */
export const deleteTaskLink = async (projectId: number, linkId: number): Promise<void> => {
  await api.delete(`/gantt/${projectId}/links/${linkId}`);
};

/**
 * Create a new deliverable
 */
export const createDeliverable = async (
  projectId: number,
  deliverableData: { label: string; description?: string; startDate?: string; endDate?: string }
): Promise<Livrable> => {
  const response = await api.post(`/gantt/${projectId}/deliverables`, deliverableData);
  return response.data;
};

/**
 * Get subActions for a project (for task creation dropdown)
 */
export const fetchSubActions = async (projectId: number): Promise<SubAction[]> => {
  const response = await api.get(`/gantt/${projectId}/subactions`);
  return response.data;
};

/**
 * Save the entire Gantt state (tasks)
 */
export const saveGanttState = async (
  projectId: number,
  tasks: Task[]
): Promise<void> => {
  // Update each task that needs to be saved
  const taskUpdatePromises = tasks.map((task) => {
    if (task.id && (task as Task & { _modified?: boolean })._modified) {
      return updateTask(projectId, task.id, task);
    }
    return Promise.resolve(task);
  });

  await Promise.all(taskUpdatePromises);
};

/**
 * Format date for API (YYYY-MM-DD)
 */
export const formatDateForApi = (date: Date | string | null | undefined): string | null => {
  if (!date) return null;
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toISOString().split('T')[0];
};

/**
 * Format date from API (returns Date object)
 */
export const formatDateFromApi = (dateString: string | null | undefined): Date | null => {
  if (!dateString) return null;
  return new Date(dateString);
};

/**
 * Upload a file to the server
 */
export const uploadFile = async (file: File): Promise<FileUploadResponse> => {
  const formData = new FormData();
  formData.append('file', file);
  const response = await api.post<FileUploadResponse>('/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

// ==================== VERSION API ====================

/**
 * Fetch all versions for a project
 */
export const fetchVersions = async (projectId: number): Promise<Version[]> => {
  const response = await api.get(`/gantt/${projectId}/versions`);
  return response.data;
};

/**
 * Create a new version with optional duplication from source version
 */
export const createVersion = async (
  projectId: number,
  versionData: { name: string; description?: string; isActive?: boolean; sourceVersionId?: number | null }
): Promise<Version> => {
  const response = await api.post(`/gantt/${projectId}/versions`, versionData);
  return response.data;
};

/**
 * Update a version
 */
export const updateVersion = async (
  projectId: number,
  versionId: number,
  versionData: { name?: string; description?: string; isActive?: boolean }
): Promise<Version> => {
  const response = await api.put(`/gantt/${projectId}/versions/${versionId}`, versionData);
  return response.data;
};

/**
 * Delete a version
 */
export const deleteVersion = async (projectId: number, versionId: number): Promise<void> => {
  await api.delete(`/gantt/${projectId}/versions/${versionId}`);
};

/**
 * Set a version as active (deactivates others)
 */
export const activateVersion = async (projectId: number, versionId: number): Promise<Version> => {
  const response = await api.put(`/gantt/${projectId}/versions/${versionId}/activate`);
  return response.data;
};
