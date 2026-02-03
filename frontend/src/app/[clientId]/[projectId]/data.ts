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
  // Livrable and goal
  livrableIds?: number[];
  goal?: string;
  // Budget fields
  budget?: {
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

export const getData = (): GanttData => ({
  tasks: [
    {
      id: 1,
      text: 'Project Planning',
      start: new Date(2026, 0, 1),
      end: new Date(2026, 0, 15),
      progress: 100,
      parent: 0,
      type: 'project',
      details: 'Initial project planning and requirement gathering',
      notes: '',
      files: [],
      assigneeIds: [1, 2]
    },
    {
      id: 2,
      text: 'Requirements Gathering',
      start: new Date(2026, 0, 1),
      end: new Date(2026, 0, 5),
      progress: 100,
      parent: 1,
      type: 'task',
      details: 'Gather and document requirements',
      notes: '',
      files: [],
      assigneeIds: [1, 2]
    },
    {
      id: 3,
      text: 'Planning Meeting',
      start: new Date(2026, 0, 6),
      end: new Date(2026, 0, 10),
      progress: 100,
      parent: 1,
      type: 'milestone',
      details: 'Kickoff meeting',
      notes: '',
      files: [],
      assigneeIds: [1, 2]
    },
    {
      id: 4,
      text: 'Design Phase',
      start: new Date(2026, 0, 16),
      end: new Date(2026, 1, 15),
      progress: 75,
      parent: 0,
      type: 'project',
      details: 'UI/UX design and architecture planning',
      notes: '',
      files: [],
      assigneeIds: [2, 3]
    },
    {
      id: 5,
      text: 'Wireframing',
      start: new Date(2026, 0, 16),
      end: new Date(2026, 0, 25),
      progress: 80,
      parent: 4,
      type: 'task',
      details: 'Create wireframes',
      notes: '',
      files: [],
      assigneeIds: [2, 3]
    },
    {
      id: 6,
      text: 'Design Review',
      start: new Date(2026, 0, 26),
      end: new Date(2026, 0, 26),
      progress: 0,
      parent: 4,
      type: 'milestone',
      details: 'Design review milestone',
      notes: '',
      files: [],
      assigneeIds: [2, 3]
    },
    {
      id: 7,
      text: 'Development',
      start: new Date(2026, 1, 16),
      end: new Date(2026, 3, 30),
      progress: 45,
      parent: 0,
      type: 'project',
      details: 'Core feature development',
      notes: '',
      files: [],
      assigneeIds: [3, 4]
    },
    {
      id: 8,
      text: 'Frontend Development',
      start: new Date(2026, 1, 16),
      end: new Date(2026, 2, 15),
      progress: 60,
      parent: 7,
      type: 'task',
      details: 'Build frontend components',
      notes: '',
      files: [],
      assigneeIds: [3, 4]
    },
    {
      id: 9,
      text: 'Backend Development',
      start: new Date(2026, 2, 16),
      end: new Date(2026, 3, 15),
      progress: 30,
      parent: 7,
      type: 'task',
      details: 'Develop backend APIs',
      notes: '',
      files: [],
      assigneeIds: [4, 1]
    },
    {
      id: 10,
      text: 'Testing',
      start: new Date(2026, 3, 1),
      end: new Date(2026, 4, 15),
      progress: 20,
      parent: 0,
      type: 'task',
      details: 'QA testing and bug fixes',
      notes: '',
      files: [],
      assigneeIds: [4, 1]
    },
    {
      id: 11,
      text: 'Deployment',
      start: new Date(2026, 4, 16),
      end: new Date(2026, 4, 31),
      progress: 0,
      parent: 0,
      type: 'milestone',
      details: 'Production deployment and monitoring',
      notes: '',
      files: [],
      assigneeIds: [1, 3]
    }
  ],
  links: [
    { id: 1, source: 2, target: 3, type: 0 },
    { id: 2, source: 1, target: 4, type: 0 },
    { id: 3, source: 5, target: 6, type: 0 },
    { id: 4, source: 4, target: 7, type: 0 },
    { id: 5, source: 8, target: 9, type: 0 },
    { id: 6, source: 7, target: 10, type: 0 },
    { id: 7, source: 10, target: 11, type: 0 }
  ],
  users: [
    { id: 1, label: 'John Doe' },
    { id: 2, label: 'Jane Smith' },
    { id: 3, label: 'Mike Johnson' },
    { id: 4, label: 'Sarah Williams' }
  ],
  livrables: []
});