import { Task } from '../../data';
import { createEmptyBudget } from './budgetUtils';

// Mistral JSON format interface
export interface MistralGanttTask {
  id: number;
  title: string;
  start_date: string;
  end_date: string;
  progress_percent: number;
  parent_id: number | null;
  type: 'action' | 'sous-action' | 'milestone';
  description: string;
  note: string;
}

export interface MistralGanttJSON {
  Gantt: MistralGanttTask[];
}

/**
 * Transforms a Mistral JSON task to Gantt Task format
 */
export const transformMistralTaskToGanttTask = (
  mistralTask: MistralGanttTask,
  newId: number
): Task => {
  // Convert Mistral type to Gantt type
  let ganttType: Task['type'];
  switch (mistralTask.type) {
    case 'milestone':
      ganttType = 'milestone';
      break;
    case 'action':
    case 'sous-action':
    default:
      ganttType = 'task';
      break;
  }

  return {
    id: newId,
    text: mistralTask.title,
    start: new Date(mistralTask.start_date),
    end: new Date(mistralTask.end_date),
    progress: mistralTask.progress_percent,
    parent: mistralTask.parent_id || 0,
    type: ganttType,
    details: mistralTask.description,
    notes: mistralTask.note,
    files: [],
    assigneeIds: [],
    livrableIds: [],
    color: '#3b82f6',
    budget: createEmptyBudget(),
  };
};

/**
 * Transforms Mistral JSON to Gantt Task array
 */
export const transformMistralJSONToGanttTasks = (
  mistralJSON: MistralGanttJSON,
  existingTasks: Task[]
): Task[] => {
  if (!mistralJSON.Gantt || !Array.isArray(mistralJSON.Gantt)) {
    return [];
  }

  // Get the maximum existing task ID to generate new unique IDs
  const maxExistingId = existingTasks.reduce(
    (max, task) => Math.max(max, task.id),
    0
  );

  return mistralJSON.Gantt.map((mistralTask, index) =>
    transformMistralTaskToGanttTask(mistralTask, maxExistingId + index + 1)
  );
};

/**
 * Parses and validates Mistral JSON
 */
export const parseMistralJSON = (jsonString: string): MistralGanttJSON | null => {
  try {
    const parsed = JSON.parse(jsonString);
    
    // Validate the structure
    if (!parsed.Gantt || !Array.isArray(parsed.Gantt)) {
      console.error('Invalid Mistral JSON: missing Gantt array');
      return null;
    }

    // Validate each task has required fields
    for (const task of parsed.Gantt) {
      if (typeof task.id !== 'number') {
        console.error('Invalid Mistral JSON: task missing id');
        return null;
      }
      if (typeof task.title !== 'string') {
        console.error('Invalid Mistral JSON: task missing title');
        return null;
      }
      if (typeof task.start_date !== 'string') {
        console.error('Invalid Mistral JSON: task missing start_date');
        return null;
      }
      if (typeof task.end_date !== 'string') {
        console.error('Invalid Mistral JSON: task missing end_date');
        return null;
      }
    }

    return parsed as MistralGanttJSON;
  } catch (error) {
    console.error('Failed to parse Mistral JSON:', error);
    return null;
  }
};
