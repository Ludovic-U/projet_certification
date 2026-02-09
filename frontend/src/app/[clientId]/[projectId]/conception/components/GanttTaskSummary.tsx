import React, { useState } from 'react';
import { 
  X, 
  Save, 
  FileText, 
  Upload, 
  Trash2, 
  Calendar, 
  Clock, 
  User, 
  CheckCircle2,
  FolderOpen,
  ChevronDown,
  ChevronRight,
  Link2,
  AlertCircle
} from 'lucide-react';
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
  updateSelectedTask: (filesToSave?: string[]) => Promise<void>;
}

interface SavedNote {
  id: string;
  content: string;
  createdAt: Date;
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
  const [newNote, setNewNote] = useState('');
  const [isAddingNote, setIsAddingNote] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    details: true,
    notes: true,
    files: true,
    livrables: true,
  });

  if (!selectedTask) return null;

  const savedNotes: SavedNote[] = selectedTask.notes 
    ? JSON.parse(selectedTask.notes) 
    : [];

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const handleSaveNote = () => {
    if (newNote.trim()) {
      const note: SavedNote = {
        id: Date.now().toString(),
        content: newNote.trim(),
        createdAt: new Date(),
      };
      const updatedNotes = [...savedNotes, note];
      const updatedTasks = tasks.map(t => 
        t.id === selectedTask.id 
          ? { ...t, notes: JSON.stringify(updatedNotes) } 
          : t
      );
      setTasks(updatedTasks);
      setSelectedTask({ ...selectedTask, notes: JSON.stringify(updatedNotes) });
      setNewNote('');
      setIsAddingNote(false);
    }
  };

  const handleDeleteNote = (noteId: string) => {
    const updatedNotes = savedNotes.filter(n => n.id !== noteId);
    const updatedTasks = tasks.map(t => 
      t.id === selectedTask.id 
        ? { ...t, notes: JSON.stringify(updatedNotes) } 
        : t
    );
    setTasks(updatedTasks);
    setSelectedTask({ ...selectedTask, notes: JSON.stringify(updatedNotes) });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const fileArray = Array.from(files).map(file => ({
        name: file.name,
        url: URL.createObjectURL(file),
        type: file.type,
        size: file.size,
      }));
      
      const updatedTasks = tasks.map(t => 
        t.id === selectedTask.id 
          ? { ...t, files: [...(t.files || []), ...fileArray.map(f => f.url)] } 
          : t
      );
      setTasks(updatedTasks);
    }
  };

  const handleDeleteFile = (fileIndex: number) => {
    const updatedTasks = tasks.map(t => 
      t.id === selectedTask.id 
        ? { ...t, files: (t.files || []).filter((_, i) => i !== fileIndex) } 
        : t
    );
    setTasks(updatedTasks);
    setSelectedTask({ ...selectedTask, files: (selectedTask.files || []).filter((_, i) => i !== fileIndex) });
  };

  const getFileIcon = (filename: string) => {
    if (filename.endsWith('.pdf')) return '📄';
    if (filename.match(/\.(jpg|jpeg|png|gif)$/i)) return '🖼️';
    if (filename.match(/\.(doc|docx)$/i)) return '📝';
    if (filename.match(/\.(xls|xlsx)$/i)) return '📊';
    return '📎';
  };

  const getTypeColor = (type: string) => {
    const colors: Record<string, { bg: string; text: string; border: string }> = {
      task: { bg: 'bg-blue-500/20', text: 'text-blue-400', border: 'border-blue-500/30' },
      milestone: { bg: 'bg-amber-500/20', text: 'text-amber-400', border: 'border-amber-500/30' },
      project: { bg: 'bg-emerald-500/20', text: 'text-emerald-400', border: 'border-emerald-500/30' },
    };
    return colors[type] || colors.task;
  };

  const typeColors = getTypeColor(selectedTask.type);

  return (
    <div className="fixed right-0 top-0 h-full w-96 border-l border-slate-700 bg-slate-900/95 backdrop-blur-sm p-0 overflow-y-auto z-40 shadow-2xl">
      {/* Header */}
      <div className="sticky top-0 bg-slate-800/95 backdrop-blur border-b border-slate-700 p-4 z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`px-3 py-1 rounded-full text-xs font-medium capitalize border ${typeColors.bg} ${typeColors.text} ${typeColors.border}`}>
              {selectedTask.type}
            </div>
            <h3 className="text-lg font-semibold text-white">Détails de la tâche</h3>
          </div>
          <button
            onClick={() => setSelectedTask(null)}
            className="p-2 hover:bg-slate-700 rounded-lg transition-colors group"
            title="Fermer le panneau"
          >
            <X className="w-5 h-5 text-slate-400 group-hover:text-white transition-colors" />
          </button>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Task Name - Prominent */}
        <div className="bg-gradient-to-r from-slate-800 to-slate-750 rounded-xl p-4 border border-slate-700">
          <h2 className="text-xl font-bold text-white leading-tight">{selectedTask.text}</h2>
        </div>

        {/* Progress Bar */}
        <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-slate-300 flex items-center gap-2">
              <Clock className="w-4 h-4 text-slate-400" />
              Progression
            </span>
            <span className="text-sm font-bold text-white">{selectedTask.progress}%</span>
          </div>
          <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-blue-500 to-blue-400 rounded-full transition-all duration-500"
              style={{ width: `${selectedTask.progress}%` }}
            />
          </div>
        </div>

        {/* Quick Info Grid */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
            <div className="flex items-center gap-2 text-slate-400 mb-1">
              <Calendar className="w-4 h-4" />
              <span className="text-xs font-medium">Début</span>
            </div>
            <p className="text-white font-medium">{formatDate(selectedTask.start)}</p>
          </div>
          {selectedTask.end && selectedTask.type !== 'milestone' && (
            <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
              <div className="flex items-center gap-2 text-slate-400 mb-1">
                <Calendar className="w-4 h-4" />
                <span className="text-xs font-medium">Fin</span>
              </div>
              <p className="text-white font-medium">{formatDate(selectedTask.end)}</p>
            </div>
          )}
          <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
            <div className="flex items-center gap-2 text-slate-400 mb-1">
              <User className="w-4 h-4" />
              <span className="text-xs font-medium">Attribué à</span>
            </div>
            <p className="text-white font-medium truncate">{getAssignees(selectedTask, data.users) || 'Non attribué'}</p>
          </div>
          <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
            <div className="flex items-center gap-2 text-slate-400 mb-1">
              <CheckCircle2 className="w-4 h-4" />
              <span className="text-xs font-medium">Statut</span>
            </div>
            <p className="text-white font-medium capitalize">{selectedTask.type}</p>
          </div>
        </div>

        {/* Description Section - Collapsible */}
        <SectionBox 
          icon={<FileText className="w-5 h-5" />}
          title="Description"
          isExpanded={expandedSections.details}
          onToggle={() => toggleSection('details')}
        >
          <p className="text-slate-300 leading-relaxed">
            {selectedTask.details || (
              <span className="text-slate-500 italic flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                No description available
              </span>
            )}
          </p>
        </SectionBox>

        {/* Livrables Section - Collapsible */}
        {selectedTask.livrableIds && selectedTask.livrableIds.length > 0 && (
          <SectionBox 
            icon={<FolderOpen className="w-5 h-5" />}
            title={`Livrables (${selectedTask.livrableIds.length})`}
            isExpanded={expandedSections.livrables}
            onToggle={() => toggleSection('livrables')}
          >
            <div className="space-y-3">
              {selectedTask.livrableIds.map(livrableId => {
                const livrable = livrables.find(l => l.id === livrableId);
                return livrable ? (
                  <div key={livrableId} className="bg-slate-800/50 rounded-lg p-3 border border-slate-700/50 hover:border-slate-600 transition-colors">
                    <div className="flex items-start gap-2">
                      <div className="w-2 h-2 rounded-full bg-emerald-500 mt-2 flex-shrink-0" />
                      <div>
                        <p className="text-white font-medium">{livrable.label}</p>
                        <p className="text-slate-400 text-sm mt-1">{livrable.description}</p>
                      </div>
                    </div>
                  </div>
                ) : null;
              })}
            </div>
          </SectionBox>
        )}

        {/* Notes Section - Collapsible */}
        <SectionBox 
          icon={<FileText className="w-5 h-5" />}
          title={`Notes (${savedNotes.length})`}
          isExpanded={expandedSections.notes}
          onToggle={() => toggleSection('notes')}
        >
          {/* Saved Notes List */}
          {savedNotes.length > 0 && (
            <div className="space-y-3 mb-4">
              {savedNotes.map(note => (
                <div key={note.id} className="bg-slate-800/50 rounded-lg p-3 border border-slate-700/50">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-slate-200 text-sm leading-relaxed flex-1">{note.content}</p>
                    <button
                      onClick={() => handleDeleteNote(note.id)}
                      className="text-slate-500 hover:text-red-400 transition-colors p-1 hover:bg-slate-700 rounded"
                      title="Supprimer la note"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="flex items-center gap-2 mt-2 pt-2 border-t border-slate-700/50">
                    <div className="w-4 h-4 rounded-full bg-blue-500/20 flex items-center justify-center">
                      <div className="w-2 h-2 rounded-full bg-blue-400" />
                    </div>
                    <p className="text-xs text-slate-500">
                      {new Date(note.createdAt).toLocaleString('fr-FR', { 
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          {/* Add Note Form */}
          {isAddingNote ? (
            <div className="space-y-3 animate-in slide-in-from-top-2">
              <textarea
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                rows={4}
                className="w-full px-4 py-3 bg-slate-800 text-white border border-slate-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                placeholder="Écrivez votre note ici..."
                autoFocus
              />
              <div className="flex gap-2">
                <button
                  onClick={handleSaveNote}
                  disabled={!newNote.trim()}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex-1 justify-center"
                >
                  <Save className="w-4 h-4" />
                  Enregistrer
                </button>
                <button
                  onClick={() => {
                    setIsAddingNote(false);
                    setNewNote('');
                  }}
                  className="px-4 py-2 bg-slate-700 text-slate-300 rounded-lg hover:bg-slate-600 transition-colors"
                >
                  Annuler
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setIsAddingNote(true)}
              className="flex items-center justify-center gap-2 px-4 py-3 bg-slate-800 text-blue-400 rounded-xl border border-slate-700 border-dashed hover:border-blue-500 hover:bg-slate-700 transition-all w-full"
            >
              <FileText className="w-5 h-5" />
              <span>Ajouter une note</span>
            </button>
          )}
        </SectionBox>

        {/* Files Section - Collapsible */}
        <SectionBox 
          icon={<Link2 className="w-5 h-5" />}
          title={`Fichiers (${selectedTask.files?.length || 0})`}
          isExpanded={expandedSections.files}
          onToggle={() => toggleSection('files')}
        >
          <div className="space-y-3">
            {/* File List */}
            {selectedTask.files && selectedTask.files.length > 0 && (
              <div className="space-y-2">
                {selectedTask.files.map((file, index) => {
                  const fileName = file.split('/').pop()?.split('?')[0] || file;
                  
                  return (
                    <div key={file} className="flex items-center gap-3 bg-slate-800/50 rounded-lg p-3 border border-slate-700/50 hover:border-slate-600 transition-colors group">
                      <span className="text-xl">{getFileIcon(fileName)}</span>
                      <div className="flex-1 min-w-0">
                        <a 
                          href={file} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-400 hover:text-blue-300 truncate block text-sm font-medium"
                        >
                          {fileName}
                        </a>
                      </div>
                      <button
                        onClick={() => handleDeleteFile(index)}
                        className="text-slate-500 hover:text-red-400 transition-colors p-1.5 hover:bg-slate-700 rounded-lg opacity-0 group-hover:opacity-100"
                        title="Supprimer le fichier"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
            
            {/* Upload Button */}
            <div className="relative group">
              <input
                type="file"
                multiple
                accept=".png,.pdf,.jpg,.jpeg,.gif,.doc,.docx,.xls,.xlsx,.ppt,.pptx"
                onChange={handleFileUpload}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              />
              <div className="flex items-center justify-center gap-3 px-4 py-4 bg-slate-800 border-2 border-dashed border-slate-600 rounded-xl text-slate-400 group-hover:border-blue-500 group-hover:text-blue-400 group-hover:bg-slate-700/50 transition-all">
                <Upload className="w-5 h-5" />
                <span className="text-sm font-medium">Déposez des fichiers ou cliquez pour télécharger</span>
              </div>
            </div>
          </div>
        </SectionBox>
      </div>
    </div>
  );
};

// Collapsible Section Component
const SectionBox: React.FC<{
  icon: React.ReactNode;
  title: string;
  isExpanded: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}> = ({ icon, title, isExpanded, onToggle, children }) => (
  <div className="bg-slate-800/50 rounded-xl border border-slate-700/50 overflow-hidden">
    <button
      onClick={onToggle}
      className="w-full flex items-center justify-between p-4 bg-slate-800 hover:bg-slate-750 transition-colors"
    >
      <div className="flex items-center gap-3">
        <span className="text-slate-400">{icon}</span>
        <span className="text-white font-medium">{title}</span>
      </div>
      {isExpanded ? (
        <ChevronDown className="w-5 h-5 text-slate-400" />
      ) : (
        <ChevronRight className="w-5 h-5 text-slate-400" />
      )}
    </button>
    {isExpanded && (
      <div className="p-4 pt-2 border-t border-slate-700/50">
        {children}
      </div>
    )}
  </div>
);
