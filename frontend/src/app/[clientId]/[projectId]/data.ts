export interface Task {
  id: number;
  text: string;
  start: Date;
  end: Date;
  progress: number;
  parent: number;
  type: 'task' | 'milestone' | 'project';
  details: string;
  notes: string;
  files: string[];
  assigneeIds: number[]; // Array of user IDs
  // Color for Gantt chart display
  color: string;
  // Livrable and goal
  livrableIds?: number[];
  goal?: string;
  // Version ID for task versioning
  versionId?: number | null;
  // Budget fields
  budget?: {
    // Expense lines for each category
    expenseLines: ExpenseLine[];
    // Legacy fields for backward compatibility
    // Moyen humain
    personnelDays: number;
    personnelCost: number;
    internsDays: number;
    internsCost: number;
    // Amenagements
    amenagementsDescription: string;
    fittingsCost: number;
    // Equipements pedagogiques
    educationalEquipmentCost: number;
    // Prestations
    subcontractorCost: number;
    travelCost: number;
    otherPrestationsCost: number;
    // Communications
    communicationCost: number;
    overheadRate: number;
  };
}

export interface ExpenseLine {
  id: string;
  nature: string; // Nature de dépense
  unites: number; // Unités (quantity)
  prix: number; // Prix unitaire
}

export interface Link {
  id: number;
  source: number;
  target: number;
  type: number;
}

export interface User {
  id: number;
  label: string;
}

export interface Livrable {
  id: number;
  label: string;
  description: string;
}

export interface GanttData {
  tasks: Task[];
  links: Link[];
  users: User[];
  livrables: Livrable[];
}

/**
 * @deprecated This function is kept for backward compatibility.
 * Use the API functions from ganttApi.ts instead.
 */
export const getData = (): GanttData => ({
  tasks: [],
  links: [],
  users: [],
  livrables: []
});