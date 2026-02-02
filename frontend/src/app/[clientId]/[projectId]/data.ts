// import { PrismaClient } from "@prisma/client";
//
// const globalForPrisma = globalThis as unknown as {
//   prisma: PrismaClient | undefined;
// }
//
// export const prisma =
//   globalForPrisma.prisma ??
//   new PrismaClient({
//     log: ['error', 'warn']
//   });
//
// if (process.env.NODE_ENV !== 'production') {
//   globalForPrisma.prisma = prisma;
// }

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
  to1: number;
  to2: number;
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

export interface GanttData {
  tasks: Task[];
  links: Link[];
  users: User[];
}

export const getData = async (clientId?: string): Promise<GanttData> => {
  try {
    if (!clientId) {
      // Return default data if no clientId provided (for development)
      return {
        tasks: [],
        links: [],
        users: []
      };
    }

    const res = await fetch(`http://localhost:5432/project/getByClientId/${clientId}`, {
      credentials: 'include',
    });
    
    if (!res.ok) throw new Error('Failed to fetch projects');

    const projects = await res.json();
    
    const ganttTask = projects.flatMap((project: any) => [
      { 
        id: project.projectId,
        text: project.projectName,
        description: project.projectDesc,
        start: new Date(project.startDate),
        end: new Date(project.endDate),
        status: project.projectStage,
        progress: project.projectProgress || 0,
        created: new Date(project.createdAt),
        parent: 0,
        type: 'project' as const,
        details: '',
        notes: '',
        files: [],
        to1: 0,
        to2: 0
      },
      ...(project.tasks || []).map((task: any) => ({
        id: task.taskId,
        text: task.taskName,
        start: new Date(task.taskStart),
        end: new Date(task.taskEnd),
        progress: task.taskProgress || 0,
        parent: project.projectId,
        type: 'task' as const,
        description: task.taskDesc ?? '',
        details: '',
        notes: '',
        files: [],
        to1: 0,
        to2: 0
      }))
    ]);

    return { 
      tasks: ganttTask, 
      links: [], 
      users: [] 
    };
  } catch (error) {
    console.error('Error fetching data:', error);
    // Return default data on error
    return {
      tasks: [],
      links: [],
      users: []
    };
  }
};

  // tasks: [
  //   {
  //     id: 1,
  //     text: 'Project Planning',
  //     start: new Date(2026, 0, 1),
  //     end: new Date(2026, 0, 15),
  //     progress: 100,
  //     parent: 0,
  //     type: 'project',
  //     details: 'Initial project planning and requirement gathering',
  //     notes: '',
  //     files: [],
  //     to1: 1,
  //     to2: 2
  //   },
  //   {
  //     id: 2,
  //     text: 'Requirements Gathering',
  //     start: new Date(2026, 0, 1),
  //     end: new Date(2026, 0, 5),
  //     progress: 100,
  //     parent: 1,
  //     type: 'task',
  //     details: 'Gather and document requirements',
  //     notes: '',
  //     files: [],
  //     to1: 1,
  //     to2: 2
  //   },
  //   {
  //     id: 3,
  //     text: 'Planning Meeting',
  //     start: new Date(2026, 0, 6),
  //     end: new Date(2026, 0, 10),
  //     progress: 100,
  //     parent: 1,
  //     type: 'milestone',
  //     details: 'Kickoff meeting',
  //     notes: '',
  //     files: [],
  //     to1: 1,
  //     to2: 2
  //   },
  //   {
  //     id: 4,
  //     text: 'Design Phase',
  //     start: new Date(2026, 0, 16),
  //     end: new Date(2026, 1, 15),
  //     progress: 75,
  //     parent: 0,
  //     type: 'project',
  //     details: 'UI/UX design and architecture planning',
  //     notes: '',
  //     files: [],
  //     to1: 2,
  //     to2: 3
  //   },
  //   {
  //     id: 5,
  //     text: 'Wireframing',
  //     start: new Date(2026, 0, 16),
  //     end: new Date(2026, 0, 25),
  //     progress: 80,
  //     parent: 4,
  //     type: 'task',
  //     details: 'Create wireframes',
  //     notes: '',
  //     files: [],
  //     to1: 2,
  //     to2: 3
  //   },
  //   {
  //     id: 6,
  //     text: 'Design Review',
  //     start: new Date(2026, 0, 26),
  //     end: new Date(2026, 0, 26),
  //     progress: 0,
  //     parent: 4,
  //     type: 'milestone',
  //     details: 'Design review milestone',
  //     notes: '',
  //     files: [],
  //     to1: 2,
  //     to2: 3
  //   },
  //   {
  //     id: 7,
  //     text: 'Development',
  //     start: new Date(2026, 1, 16),
  //     end: new Date(2026, 3, 30),
  //     progress: 45,
  //     parent: 0,
  //     type: 'project',
  //     details: 'Core feature development',
  //     notes: '',
  //     files: [],
  //     to1: 3,
  //     to2: 4
  //   },
  //   {
  //     id: 8,
  //     text: 'Frontend Development',
  //     start: new Date(2026, 1, 16),
  //     end: new Date(2026, 2, 15),
  //     progress: 60,
  //     parent: 7,
  //     type: 'task',
  //     details: 'Build frontend components',
  //     notes: '',
  //     files: [],
  //     to1: 3,
  //     to2: 4
  //   },
  //   {
  //     id: 9,
  //     text: 'Backend Development',
  //     start: new Date(2026, 2, 16),
  //     end: new Date(2026, 3, 15),
  //     progress: 30,
  //     parent: 7,
  //     type: 'task',
  //     details: 'Develop backend APIs',
  //     notes: '',
  //     files: [],
  //     to1: 4,
  //     to2: 1
  //   },
  //   {
  //     id: 10,
  //     text: 'Testing',
  //     start: new Date(2026, 3, 1),
  //     end: new Date(2026, 4, 15),
  //     progress: 20,
  //     parent: 0,
  //     type: 'task',
  //     details: 'QA testing and bug fixes',
  //     notes: '',
  //     files: [],
  //     to1: 4,
  //     to2: 1
  //   },
  //   {
  //     id: 11,
  //     text: 'Deployment',
  //     start: new Date(2026, 4, 16),
  //     end: new Date(2026, 4, 31),
  //     progress: 0,
  //     parent: 0,
  //     type: 'milestone',
  //     details: 'Production deployment and monitoring',
  //     notes: '',
  //     files: [],
  //     to1: 1,
  //     to2: 3
  //   }
  // ],
  // links: [
  //   { id: 1, source: 2, target: 3, type: 0 },
  //   { id: 2, source: 1, target: 4, type: 0 },
  //   { id: 3, source: 5, target: 6, type: 0 },
  //   { id: 4, source: 4, target: 7, type: 0 },
  //   { id: 5, source: 8, target: 9, type: 0 },
  //   { id: 6, source: 7, target: 10, type: 0 },
  //   { id: 7, source: 10, target: 11, type: 0 }
  // ],
  // users: [
  //   { id: 1, label: 'John Doe' },
  //   { id: 2, label: 'Jane Smith' },
  //   { id: 3, label: 'Mike Johnson' },
  //   { id: 4, label: 'Sarah Williams' }
  // ]
//});
