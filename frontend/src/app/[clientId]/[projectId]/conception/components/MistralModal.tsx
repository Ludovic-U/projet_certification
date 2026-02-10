import React, { useState } from 'react';
import { useParams } from 'next/navigation';
import { X, Upload, FileText } from 'lucide-react';
import api_backend from '@/api/axiosInstance';
import { 
  transformMistralJSONToGanttTasks, 
  parseMistralJSON,
  type MistralGanttJSON
} from '../utils/mistralUtils';
import { Task, Link } from '../../data';
import { createEmptyBudget } from '../utils/budgetUtils';
import { convertApiTaskToTask, type ApiTaskResponse } from '@/api/ganttApi';

interface MistralModalProps {
  isOpen: boolean;
  onClose: () => void;
  tasks: Task[];
  links: Link[];
  setTasks: (tasks: Task[]) => void;
  setLinks: (links: Link[]) => void;
  saveState: (nextTasks?: Task[], nextLinks?: Link[]) => void;
}

export const MistralModal: React.FC<MistralModalProps> = ({ 
  isOpen, 
  onClose, 
  tasks, 
  links, 
  setTasks, 
  setLinks, 
  saveState 
}) => {
  const params = useParams();
  const projectId = params?.projectId ? parseInt(params.projectId as string, 10) : null;
  const [text, setText] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!text && !file) {
      alert("Veuillez entrer du texte et/ou sélectionner un fichier");
      return;
    }

    setLoading(true);
    setResult(null);
    
    try {
      const formData = new FormData();
      
      if (text) {
        formData.append('text', text);
      }
      
      if (file) {
        formData.append('file', file);
      }
      
      const res = await api_backend.post('/mistral/generateGanttviaMistral', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      console.log(res.data);
      setResult(res.data);
    } catch (error: any) {
      console.error(error);
      setResult({ error: error.message });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setText("");
    setFile(null);
    setResult(null);
    setLoading(false);
    onClose();
  };

  const handleImportToGantt = async () => {
    if (!result) {
      alert('Aucun résultat à importer');
      return;
    }

    if (!projectId) {
      alert('ID de projet non valide');
      return;
    }

    try {
      console.log('Résultat à importer:', result);
      // Handle both direct object and wrapped response
      const dataToParse = typeof result === 'string' ? result : JSON.stringify(result);
      const mistralJSON = parseMistralJSON(dataToParse);

      if (!mistralJSON) {
        alert('Format de résultat invalide');
        return;
      }

      // Get the tasks from Mistral JSON directly (don't transform yet)
      const mistralTasks = mistralJSON.Gantt || [];

      if (mistralTasks.length > 0) {
        // Call backend API to persist tasks - send original Mistral data
        // The backend will handle ID mapping and parent relationships
        const response = await api_backend.post(`/gantt/import/${projectId}`, mistralTasks);
        
        if (response.data && response.data.tasks) {
          // Convert API response tasks to Gantt format
          const savedTasks = response.data.tasks.map((apiTask: ApiTaskResponse) => 
            convertApiTaskToTask(apiTask)
          );
          
          const updatedTasks = [...tasks, ...savedTasks];
          setTasks(updatedTasks);
          setLinks(links);
          saveState(updatedTasks, links);
          alert(`${savedTasks.length} tâches importées et sauvegardées dans la base de données avec succès`);
        } else {
          // Fallback: transform locally if API doesn't return tasks
          const newTasks = transformMistralJSONToGanttTasks(mistralJSON, tasks);
          const updatedTasks = [...tasks, ...newTasks];
          setTasks(updatedTasks);
          setLinks(links);
          saveState(updatedTasks, links);
          alert(`${newTasks.length} tâches importées (attention: non sauvegardées dans la base de données)`);
        }
        handleClose();
      } else {
        alert('Aucune tâche valide trouvée dans le résultat');
      }
    } catch (error: any) {
      console.error('Erreur lors de l\'importation:', error);
      alert('Erreur lors de l\'importation du résultat: ' + (error.response?.data?.error || error.message));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black bg-opacity-50"
        onClick={handleClose}
      />
      
      {/* Modal */}
      <div className="relative bg-slate-800 rounded-lg shadow-xl w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-700">
          <h2 className="text-xl font-bold text-white">Mistral AI - Génération de Gantt</h2>
          <button
            onClick={handleClose}
            className="p-1 hover:bg-slate-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <form onSubmit={handleGenerate}>
            {/* Text Input Section */}
            <div className="mb-6">
              <label className="block mb-2">
                <span className="text-white font-semibold mb-2 block flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  Entrez votre texte
                </span>
                <textarea 
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="Décrivez votre projet et ses tâches..."
                  className="w-full p-4 bg-slate-700 text-white border-2 border-slate-600 rounded-lg focus:border-blue-500 focus:outline-none resize-vertical min-h-32 placeholder-gray-400"
                />
              </label>
            </div>
            
            {/* File Upload Section */}
            <div className="bg-slate-700 rounded-lg p-6 mb-6 border-2 border-dashed border-slate-600 hover:border-blue-500 transition-colors">
              <label className="block">
                <span className="text-white font-semibold mb-2 block flex items-center gap-2">
                  <Upload className="w-4 h-4" />
                  Sélectionnez un fichier
                </span>
                <input 
                  type="file" 
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                  accept=".txt,.pdf,.doc,.docx,.jpg,.jpeg,.png"
                  className="block w-full text-sm text-gray-300
                    file:mr-4 file:py-2 file:px-4
                    file:rounded-full file:border-0
                    file:text-sm file:font-semibold
                    file:bg-blue-600 file:text-white
                    hover:file:bg-blue-700
                    file:cursor-pointer cursor-pointer"
                />
              </label>
              {file && (
                <div className="mt-3 flex items-center text-green-400 bg-slate-600 px-4 py-2 rounded-lg">
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="font-medium">Fichier sélectionné: {file.name}</span>
                </div>
              )}
            </div>

            {/* Results Section */}
            {result && (
              <div className="bg-slate-700 rounded-lg p-4 mb-6">
                <h3 className="text-lg font-bold text-white mb-3">Résultat</h3>
                <div className="bg-slate-900 rounded-lg p-4 overflow-auto max-h-64">
                  <pre className="text-sm text-gray-300 font-mono whitespace-pre-wrap break-words">
                    {typeof result === 'string' ? result : JSON.stringify(result, null, 2)}
                  </pre>
                </div>
              </div>
            )}

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 pt-4">
              <button
                type="button"
                onClick={handleClose}
                className="px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-colors"
                disabled={loading}
              >
                Annuler
              </button>
              {result && !loading && (
                <button
                  type="button"
                  onClick={handleImportToGantt}
                  className="px-6 py-2 rounded-lg font-semibold text-white flex items-center gap-2 bg-green-600 hover:bg-green-700 transition-colors"
                >
                  📥 Importer dans le Gantt
                </button>
              )}
              <button
                type="submit"
                disabled={loading || (!text && !file)}
                className={`px-6 py-2 rounded-lg font-semibold text-white flex items-center gap-2
                  ${loading || (!text && !file)
                    ? 'bg-gray-600 cursor-not-allowed' 
                    : 'bg-blue-600 hover:bg-blue-700'} 
                  transition-colors`}
              >
                {loading ? (
                  <>
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Génération...
                  </>
                ) : (
                  <>
                    🚀 Générer avec Mistral AI
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
