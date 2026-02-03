import React from 'react';
import { X } from 'lucide-react';
import { Task, Livrable } from '../types';
import { formatDate } from '../utils/dateUtils';
import { getAssignees } from '../utils/taskUtils';

interface GanttTaskSummaryProps {
  selectedTask: Task | null;
  setSelectedTask: (task: Task | null) => void;
  livrables: Livrable[];
  tasks: Task[];
  setTasks: (tasks: Task[]) => void;
  data: {
    users: { id: number; label: string }[];
  };
}

export const GanttTaskSummary: React.FC<GanttTaskSummaryProps> = ({
  selectedTask,
  setSelectedTask,
  livrables,
  tasks,
  setTasks,
  data,
}) => {
  if (!selectedTask) return null;

  return (
    <div className="fixed right-0 top-0 h-full w-96 border-l border-slate-700 bg-slate-800 p-4 overflow-y-auto z-40">
      <div className="flex items-center justify-between mb-4 bg-slate-700 p-2 rounded">
        <h3 className="text-lg font-semibold text-white">Task Summary</h3>
        <button
          onClick={() => setSelectedTask(null)}
          className="p-1 hover:bg-slate-600 rounded"
        >
          <X className="w-4 h-4 text-slate-400" />
        </button>
      </div>
      <div className="space-y-4 bg-slate-800 p-4 rounded">
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1">Task Name</label>
          <p className="text-white text-lg">{selectedTask.text}</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1">Type</label>
          <p className="text-white capitalize">{selectedTask.type}</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1">Start Date</label>
          <p className="text-white">{formatDate(selectedTask.start)}</p>
        </div>
        {selectedTask.end && selectedTask.type !== 'milestone' && (
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">End Date</label>
            <p className="text-white">{formatDate(selectedTask.end)}</p>
          </div>
        )}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1">Progress</label>
          <p className="text-white">{selectedTask.progress}%</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1">Assigned to</label>
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
          <p className="text-white">{selectedTask.details || 'No description available'}</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1">Notes</label>
          <textarea
            value={selectedTask.notes}
            onChange={(e) => {
              const updatedTasks = tasks.map(t => t.id === selectedTask.id ? { ...t, notes: e.target.value } : t);
              setTasks(updatedTasks);
            }}
            rows={3}
            className="w-full px-3 py-2 bg-slate-700 text-white border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Add notes here..."
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1">Files</label>
          <div className="space-y-2">
            <div className="flex gap-2">
              <input
                type="file"
                accept=".png,.pdf"
                className="flex-1 px-3 py-2 bg-slate-700 text-white border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    const url = URL.createObjectURL(file);
                    const updatedTasks = tasks.map(t => t.id === selectedTask.id ? { ...t, files: [...(t.files || []), url] } : t);
                    setTasks(updatedTasks);
                  }
                }}
              />
            </div>
            {selectedTask.files && selectedTask.files.length > 0 && (
              <div className="space-y-1">
                {selectedTask.files.map((file, index) => (
                  <div key={index} className="flex items-center justify-between bg-slate-700 p-2 rounded">
                    <a href={file} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 truncate">
                      {file.split('/').pop() || file}
                    </a>
                    <button
                      onClick={() => {
                        const updatedTasks = tasks.map(t => t.id === selectedTask.id ? { ...t, files: (t.files || []).filter((_, i) => i !== index) } : t);
                        setTasks(updatedTasks);
                      }}
                      className="text-red-400 hover:text-red-300 ml-2"
                    >
                      <X className="w-4 h-4" />
                    </button>
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
