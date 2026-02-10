import { Task, Link, ImportedTask } from '../types';
import { createEmptyBudget } from '../utils/budgetUtils';
import { 
  transformMistralJSONToGanttTasks, 
  parseMistralJSON 
} from '../utils/mistralUtils';
import * as XLSX from 'xlsx';
import { createTask as apiCreateTask } from '@/api/ganttApi';

interface UseGanttExportImportProps {
  tasks: Task[];
  links: Link[];
  setTasks: (tasks: Task[]) => void;
  setLinks: (links: Link[]) => void;
  saveState: (nextTasks?: Task[], nextLinks?: Link[]) => void;
  data: {
    users: { id: number; label: string }[];
  };
  projectId: number | null;
}

export const useGanttExportImport = ({
  tasks,
  links,
  setTasks,
  setLinks,
  saveState,
  data,
  projectId,
}: UseGanttExportImportProps) => {
  
  // Helper to save tasks to API
  const saveTasksToApi = async (tasksToSave: Task[]) => {
    if (!projectId) return;
    
    // Filter only tasks with valid IDs (not negative/Date.now IDs which are local only)
    const validTasks = tasksToSave.filter(t => t.id > 0 && t.id < 1000000000000);
    
    // Sort tasks: parents first, then children (to ensure parent IDs exist when creating children)
    const sortedTasks = [...validTasks].sort((a, b) => {
      // If a is parent of b, a should come first
      if (a.id === b.parent) return -1;
      if (b.id === a.parent) return 1;
      // Otherwise sort by ID
      return a.id - b.id;
    });
    
    // Track ID mapping from old to new
    const idMapping = new Map<number, number>();
    
    for (const task of sortedTasks) {
      try {
        // Map old parent ID to new parent ID if needed
        const mappedParent = task.parent ? idMapping.get(task.parent) || 0 : 0;
        
        const createdTask = await apiCreateTask(projectId, {
          text: task.text,
          start: task.start,
          end: task.end,
          progress: task.progress,
          parent: mappedParent,
          type: task.type,
          details: task.details,
          notes: task.notes,
          files: task.files || [],
          assigneeIds: task.assigneeIds || [],
          livrableIds: task.livrableIds || [],
          goal: task.goal,
        });
        
        // Store the ID mapping for this task
        idMapping.set(task.id, createdTask.id);
      } catch (err) {
        console.error('Error saving task to API:', err);
      }
    }
  };
  
  // Export data to JSON
  const exportData = () => {
    const dataStr = JSON.stringify({ tasks, links }, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'gantt-chart.json';
    link.click();
  };

  // Import data from JSON
  const importData = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = async (event) => {
        try {
          const result = event.target?.result;
          if (typeof result === 'string') {
            const imported = JSON.parse(result);
            const nextTasks: Task[] = imported.tasks
              ? imported.tasks.map((t: ImportedTask) => ({
                  ...t,
                  start: new Date(t.start),
                  end: new Date(t.end),
                  files: t.files || [], // Ensure files is always an array
                  budget: t.budget || createEmptyBudget(),
                  livrableIds: t.livrableIds || [],
                  notes: t.notes || '',
                  details: t.details || '',
                }))
              : tasks;
            const nextLinks: Link[] = imported.links ? imported.links : links;
            setTasks(nextTasks);
            setLinks(nextLinks);
            saveState(nextTasks, nextLinks);
            
            // Save imported tasks to API
            await saveTasksToApi(nextTasks);
            alert('Données importées avec succès');
          }
        } catch {
          alert('Format de fichier invalide');
        }
      };
      reader.readAsText(file);
    }
  };

  // Export to CSV
  const exportToCSV = () => {
    const headers = ['ID', 'Task Name', 'Type', 'Start Date', 'End Date', 'Progress', 'Parent ID', 'Assignees', 'Details'];
    const rows = tasks.map(task => [
      task.id,
      task.text,
      task.type,
      new Date(task.start).toISOString().split('T')[0],
      new Date(task.end).toISOString().split('T')[0],
      task.progress,
      task.parent,
      (task.assigneeIds || []).map(id => data.users.find(u => u.id === id)?.label).join('; '),
      task.details
    ]);
    
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'gantt-chart.csv';
    link.click();
  };

  // Export to Excel
  const exportToExcel = () => {
    const tasksData = tasks.map(task => ({
      ID: task.id,
      'Task Name': task.text,
      Type: task.type,
      'Start Date': new Date(task.start).toISOString().split('T')[0],
      'End Date': new Date(task.end).toISOString().split('T')[0],
      'Progress (%)': task.progress,
      'Parent ID': task.parent,
      'Assignees': (task.assigneeIds || []).map(id => data.users.find(u => u.id === id)?.label).join('; '),
      Details: task.details,
      Notes: task.notes
    }));
    
    const linksData = links.map(link => ({
      'Source ID': link.source,
      'Target ID': link.target,
      'Link Type': link.type
    }));
    
    const wb = XLSX.utils.book_new();
    const tasksSheet = XLSX.utils.json_to_sheet(tasksData);
    const linksSheet = XLSX.utils.json_to_sheet(linksData);
    
    XLSX.utils.book_append_sheet(wb, tasksSheet, 'Tasks');
    XLSX.utils.book_append_sheet(wb, linksSheet, 'Links');
    
    XLSX.writeFile(wb, 'gantt-chart.xlsx');
  };

  // Export to MS Project (XML)
  const exportToMSProject = () => {
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<Project xmlns="http://schemas.microsoft.com/project">
  <Name>Gantt Chart Export</Name>
  <CreationDate>${new Date().toISOString()}</CreationDate>
  <Tasks>
    ${tasks.map(task => `
      <Task>
        <UID>${task.id}</UID>
        <ID>${task.id}</ID>
        <Name>${task.text.replace(/&/g, '&').replace(/</g, '<').replace(/>/g, '>')}</Name>
        <Type>${task.type === 'milestone' ? 2 : task.type === 'project' ? 1 : 0}</Type>
        <IsNull>0</IsNull>
        <Start>${task.start.toISOString()}</Start>
        <Finish>${task.end.toISOString()}</Finish>
        <PercentComplete>${task.progress}</PercentComplete>
        <ParentTaskUID>${task.parent || 0}</ParentTaskUID>
      </Task>
    `).join('')}
  </Tasks>
  <Assignments>
    ${tasks.flatMap(task => 
      (task.assigneeIds || []).map(assigneeId => `
        <Assignment>
          <TaskUID>${task.id}</TaskUID>
          <ResourceUID>${assigneeId}</ResourceUID>
        </Assignment>
      `)
    ).join('')}
  </Assignments>
</Project>`;
    
    const blob = new Blob([xml], { type: 'application/xml' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'gantt-chart.xml';
    link.click();
  };

  // Import from CSV
  const importFromCSV = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = async (event) => {
        try {
          const result = event.target?.result;
          if (typeof result === 'string') {
            const lines = result.split('\n');
            if (lines.length < 2) {
              alert('Le fichier CSV est vide ou ne contient pas de lignes de données');
              return;
            }
            const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
            const newTasks: Task[] = [];
            
            for (let i = 1; i < lines.length; i++) {
              const values = lines[i].match(/"([^"]*)"/g)?.map(v => v.replace(/"/g, '')) || lines[i].split(',');
              if (values.length >= 6) {
                const taskNameIdx = headers.findIndex(h => h === 'Task Name');
                const typeIdx = headers.findIndex(h => h === 'Type');
                const startIdx = headers.findIndex(h => h === 'Start Date');
                const endIdx = headers.findIndex(h => h === 'End Date');
                const progressIdx = headers.findIndex(h => h === 'Progress');
                const parentIdx = headers.findIndex(h => h === 'Parent ID');
                
                const newId = Math.max(...tasks.map(t => t.id), 0) + i;
                newTasks.push({
                  id: newId,
                  text: values[taskNameIdx] || `Task ${newId}`,
                  type: (values[typeIdx] as Task['type']) || 'task',
                  start: new Date(values[startIdx] || new Date()),
                  end: new Date(values[endIdx] || new Date()),
                  progress: parseInt(values[progressIdx]) || 0,
                  parent: parseInt(values[parentIdx]) || 0,
                  details: '',
                  notes: '',
                  files: [],
                  assigneeIds: [],
                  budget: createEmptyBudget()
                });
              }
            }
            
            if (newTasks.length > 0) {
              const updatedTasks = [...tasks, ...newTasks];
              setTasks(updatedTasks);
              saveState(updatedTasks, links);
              
              // Save imported tasks to API
              await saveTasksToApi(updatedTasks);
              alert(`${newTasks.length} tâches importées avec succès`);
            } else {
              alert('Aucune tâche valide trouvée dans le fichier CSV. Assurez-vous que le fichier possède les bons en-têtes.');
            }
          }
        } catch {
          alert('Invalid CSV format');
        }
      };
      reader.readAsText(file);
    }
  };

  // Import from Excel
  const importFromExcel = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = async (event) => {
        try {
          const data = new Uint8Array(event.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: 'array' });
          const tasksSheet = workbook.Sheets['Tasks'];
          
          if (!tasksSheet) {
            alert('Le fichier Excel doit contenir une feuille nommée "Tâches"');
            return;
          }
          
          const jsonData = XLSX.utils.sheet_to_json<Record<string, unknown>>(tasksSheet);
          
          const newTasks: Task[] = jsonData.map((row: Record<string, unknown>, index: number) => {
            const newId = Math.max(...tasks.map(t => t.id), 0) + index + 1;
            return {
              id: newId,
              text: String(row['Task Name'] || `Task ${newId}`),
              type: (row['Type'] as Task['type']) || 'task',
              start: new Date(String(row['Start Date'] || new Date())),
              end: new Date(String(row['End Date'] || new Date())),
              progress: parseInt(String(row['Progress (%)'] || 0)) || 0,
              parent: parseInt(String(row['Parent ID'] || 0)) || 0,
              details: String(row['Details'] || ''),
              notes: String(row['Notes'] || ''),
              files: [],
              assigneeIds: [],
              budget: createEmptyBudget()
            };
          });
          
          if (newTasks.length > 0) {
            const updatedTasks = [...tasks, ...newTasks];
            setTasks(updatedTasks);
            saveState(updatedTasks, links);
            
            // Save imported tasks to API
            await saveTasksToApi(updatedTasks);
            alert(`${newTasks.length} tâches importées avec succès`);
          } else {
            alert('Aucune tâche trouvée dans le fichier Excel');
          }
        } catch {
          alert('Format Excel invalide');
        }
      };
      reader.readAsArrayBuffer(file);
    }
  };

  // Import from Mistral JSON
  const importMistralGantt = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = async (event) => {
        try {
          const result = event.target?.result;
          if (typeof result === 'string') {
            const mistralJSON = parseMistralJSON(result);
            
            if (!mistralJSON) {
              alert('Format Mistral JSON invalide');
              return;
            }
            
            const newTasks = transformMistralJSONToGanttTasks(mistralJSON, tasks);
            
            if (newTasks.length > 0) {
              const updatedTasks = [...tasks, ...newTasks];
              setTasks(updatedTasks);
              saveState(updatedTasks, links);
              
              // Save imported tasks to API
              await saveTasksToApi(updatedTasks);
              alert(`${newTasks.length} tâches importées depuis Mistral avec succès`);
            } else {
              alert('Aucune tâche trouvée dans le fichier Mistral');
            }
          }
        } catch {
          alert('Erreur lors de l\'importation du fichier Mistral');
        }
      };
      reader.readAsText(file);
    }
  };

  return {
    exportData,
    importData,
    exportToCSV,
    exportToExcel,
    exportToMSProject,
    importFromCSV,
    importFromExcel,
    importMistralGantt,
  };
};
