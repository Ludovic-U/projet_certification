import React, { useState, useRef } from 'react';
import { X, Upload, File } from 'lucide-react';
import { Task, Livrable } from '../types';
import { formatDate } from '../utils/dateUtils';
import { getAssignees } from '../utils/taskUtils';
import { uploadFile } from '@/api/ganttApi';

interface GanttTaskSummaryProps {
  selectedTask: Task | null;
  setSelectedTask: (task: Task | null) => void;
  livrables: Livrable[];
  tasks: Task[];
  setTasks: (tasks: Task[]) => void;
  data: {
    users: { id: number; label: string }[];
  };
  projectId: number | null;
  updateTask: () => Promise<void>;
  updateSelectedTask: (files?: string[]) => Promise<void>;
}

export const GanttTaskSummary: React.FC<GanttTaskSummaryProps> = ({
  selectedTask,
  setSelectedTask,
  livrables,
  tasks,
  setTasks,
  data,
  projectId,
  updateTask,
  updateSelectedTask,
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  if (!selectedTask) return null;

  return (
    <div className="fixed right-0 top-0 h-full w-96 border-l border-slate-700 bg-slate-800 p-4 overflow-y-auto z-40">
      <div className="flex items-center justify-between mb-4 bg-slate-700 p-2 rounded">
        <h3 className="text-lg font-semibold text-white">Résumé de la tâche</h3>
        <button
          onClick={() => setSelectedTask(null)}
          className="p-1 hover:bg-slate-600 rounded"
        >
          <X className="w-4 h-4 text-slate-400" />
        </button>
      </div>
      <div className="space-y-4 bg-slate-800 p-4 rounded">
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1">Nom de la tâche</label>
          <p className="text-white text-lg">{selectedTask.text}</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1">Type</label>
          <p className="text-white capitalize">{selectedTask.type}</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1">Date de début</label>
          <p className="text-white">{formatDate(selectedTask.start)}</p>
        </div>
        {selectedTask.end && selectedTask.type !== 'milestone' && (
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Date de fin</label>
            <p className="text-white">{formatDate(selectedTask.end)}</p>
          </div>
        )}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1">Progression</label>
          <p className="text-white">{selectedTask.progress}%</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1">Assigné à</label>
          <p className="text-white">{getAssignees(selectedTask, data.users)}</p>
        </div>
        {selectedTask.livrableIds && selectedTask.livrableIds.length > 0 && (
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Livrables</label>
            <div className="space-y-2">
              {selectedTask.livrableIds.map(livrableId => {
                const livrable = livrables.find(l => l.id === livrableId);
                return livrable ? (
                  <div key={livrableId} className="bg-slate-700 p-3 rounded-lg">
                    <p className="text-white font-medium">{livrable.label}</p>
                    <p className="text-slate-400 text-sm mt-1">{livrable.description}</p>
                  </div>
                ) : null;
              })}
            </div>
          </div>
        )}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1">Description</label>
          <p className="text-white">{selectedTask.details || 'Aucune description disponible'}</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1">Notes</label>
          <textarea
            value={selectedTask.notes}
            onChange={(e) => {
              const updatedTasks = tasks.map(t => t.id === selectedTask.id ? { ...t, notes: e.target.value } : t);
              setTasks(updatedTasks);
              setSelectedTask({ ...selectedTask, notes: e.target.value });
            }}
            onBlur={() => {
              // Save to API when notes field loses focus
              if (projectId && selectedTask.id > 0) {
                updateSelectedTask();
              }
            }}
            rows={3}
            className="w-full px-3 py-2 bg-slate-700 text-white border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Ajouter des notes ici..."
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1">Fichiers</label>
          <div className="space-y-2">
            {/* Hidden file input triggered by button */}
            <input
              ref={fileInputRef}
              type="file"
              accept=".png,.pdf,.doc,.docx"
              disabled={isUploading}
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file && projectId && selectedTask.id > 0) {
                  setIsUploading(true);
                  console.log('Starting file upload:', file.name);
                  uploadFile(file)
                    .then((uploadResponse) => {
                      const fileUrl = uploadResponse.url;
                      console.log('File uploaded successfully:', fileUrl);
                      
                      // Update local state with new file
                      const newFiles = [...(selectedTask.files || []), fileUrl];
                      console.log('New files array:', newFiles);
                      
                      const updatedTasks = tasks.map(t => t.id === selectedTask.id ? { ...t, files: newFiles } : t);
                      setTasks(updatedTasks);
                      setSelectedTask({ ...selectedTask, files: newFiles });
                      
                      // Save to API after adding file
                      console.log('Calling updateSelectedTask with files:', newFiles);
                      updateSelectedTask(newFiles).then(() => {
                        console.log('File URL saved to database:', fileUrl);
                      });
                    })
                    .catch((err) => {
                      console.error('Error uploading file:', err);
                      alert('Échec du téléversement du fichier');
                    })
                    .finally(() => {
                      setIsUploading(false);
                      // Reset input so same file can be selected again
                      if (fileInputRef.current) {
                        fileInputRef.current.value = '';
                      }
                    });
                }
              }}
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg transition-colors"
            >
              {isUploading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Téléversement...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4" />
                  Ajouter un fichier
                </>
              )}
            </button>
            {selectedTask.files && selectedTask.files.length > 0 && (
              <div className="space-y-2">
                {selectedTask.files.map((file, index) => (
                  <div key={index} className="bg-slate-700 p-3 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2 overflow-hidden">
                        <File className="w-5 h-5 text-blue-400 flex-shrink-0" />
                        <span className="text-white font-medium truncate">
                          {file.split('/').pop() || file}
                        </span>
                      </div>
                      <button
                        onClick={() => {
                          const remainingFiles = (selectedTask.files || []).filter((_, i) => i !== index);
                          const updatedTasks = tasks.map(t => t.id === selectedTask.id ? { ...t, files: remainingFiles } : t);
                          setTasks(updatedTasks);
                          setSelectedTask({ ...selectedTask, files: remainingFiles });
                          // Save to API after removing file
                          updateSelectedTask(remainingFiles);
                        }}
                        className="text-red-400 hover:text-red-300 ml-2 flex-shrink-0"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                    <a 
                      href={file} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-xs text-slate-400 hover:text-blue-400 truncate block"
                    >
                      {file}
                    </a>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
