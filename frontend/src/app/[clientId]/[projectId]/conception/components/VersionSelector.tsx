import React, { useState, useRef, useEffect } from 'react';
import { GitBranch, ChevronDown, PlusCircle, Trash2, Eye, Star, Check } from 'lucide-react';
import { Version } from '@/api/ganttApi';
import { createVersion, deleteVersion, activateVersion } from '@/api/ganttApi';

interface VersionSelectorProps {
  versions: Version[];
  currentVersion: Version | null;
  setCurrentVersion: (version: Version | null) => void;
  onCreateVersion: (name: string, description?: string) => void;
  onDeleteVersion: (versionId: number) => void;
  onActivateVersion: (versionId: number) => void;
  projectId: number;
}

export const VersionSelector: React.FC<VersionSelectorProps> = ({
  versions,
  currentVersion,
  setCurrentVersion,
  onCreateVersion,
  onDeleteVersion,
  onActivateVersion,
  projectId,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [newVersionName, setNewVersionName] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setIsCreating(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleCreateVersion = async () => {
    if (!newVersionName.trim()) return;
    
    try {
      await createVersion(projectId, { name: newVersionName.trim() });
      setNewVersionName('');
      setIsCreating(false);
    } catch (error) {
      console.error('Error creating version:', error);
    }
  };

  const handleDeleteVersion = async (versionId: number) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette version ?')) return;
    
    try {
      await deleteVersion(projectId, versionId);
      if (currentVersion?.versionId === versionId) {
        setCurrentVersion(null);
      }
    } catch (error) {
      console.error('Error deleting version:', error);
    }
  };

  const handleActivateVersion = async (versionId: number) => {
    try {
      await activateVersion(projectId, versionId);
      const version = versions.find(v => v.versionId === versionId);
      if (version) {
        setCurrentVersion(version);
      }
    } catch (error) {
      console.error('Error activating version:', error);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Version Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 bg-slate-800 text-slate-300 rounded-lg hover:bg-slate-700 hover:text-white transition-all text-sm font-medium border border-slate-700"
      >
        <GitBranch className="w-4 h-4 text-purple-400" />
        <span className="hidden sm:inline">
          {currentVersion ? currentVersion.name : 'Version'}
        </span>
        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute top-full right-0 mt-2 w-64 bg-slate-800 border border-slate-700 rounded-xl shadow-xl z-50 overflow-hidden">
          {/* Header */}
          <div className="px-4 py-3 border-b border-slate-700 bg-slate-800/50">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <GitBranch className="w-4 h-4 text-purple-400" />
              Versions
            </h3>
          </div>

          {/* Create New Version */}
          {isCreating ? (
            <div className="p-3 border-b border-slate-700">
              <input
                type="text"
                value={newVersionName}
                onChange={(e) => setNewVersionName(e.target.value)}
                placeholder="Nom de la version..."
                className="w-full px-3 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white text-sm placeholder-slate-500 focus:outline-none focus:border-blue-500"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleCreateVersion();
                  if (e.key === 'Escape') setIsCreating(false);
                }}
              />
              <div className="flex gap-2 mt-2">
                <button
                  onClick={handleCreateVersion}
                  disabled={!newVersionName.trim()}
                  className="flex-1 px-3 py-1.5 bg-blue-500 text-white text-xs rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Créer
                </button>
                <button
                  onClick={() => { setIsCreating(false); setNewVersionName(''); }}
                  className="flex-1 px-3 py-1.5 bg-slate-700 text-white text-xs rounded-lg hover:bg-slate-600"
                >
                  Annuler
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setIsCreating(true)}
              className="w-full px-4 py-3 text-left text-sm text-slate-300 hover:bg-slate-700 flex items-center gap-2 transition-colors"
            >
              <PlusCircle className="w-4 h-4 text-green-400" />
              Nouvelle version
            </button>
          )}

          {/* Version List */}
          <div className="max-h-64 overflow-y-auto">
            {/* Current Version / Default */}
            <button
              onClick={() => setCurrentVersion(null)}
              className={`w-full px-4 py-3 text-left text-sm flex items-center gap-3 transition-colors ${
                !currentVersion ? 'bg-blue-500/20 text-blue-400' : 'text-slate-300 hover:bg-slate-700'
              }`}
            >
              <Star className={`w-4 h-4 ${!currentVersion ? 'text-blue-400' : 'text-slate-600'}`} />
              <div className="flex-1">
                <div className="font-medium">Version principale</div>
                <div className="text-xs text-slate-500">Toutes les actions sans version</div>
              </div>
              {!currentVersion && <Check className="w-4 h-4" />}
            </button>

            {/* Version Items */}
            {versions.map((version) => (
              <div
                key={version.versionId}
                className={`flex items-center gap-2 px-4 py-3 border-t border-slate-700/50 ${
                  currentVersion?.versionId === version.versionId
                    ? 'bg-blue-500/20'
                    : 'hover:bg-slate-700'
                }`}
              >
                <button
                  onClick={() => setCurrentVersion(version)}
                  className="flex-1 text-left flex items-center gap-3 min-w-0"
                >
                  <GitBranch className={`w-4 h-4 flex-shrink-0 ${
                    currentVersion?.versionId === version.versionId ? 'text-blue-400' : 'text-slate-500'
                  }`} />
                  <div className="flex-1 min-w-0">
                    <div className={`font-medium truncate ${
                      currentVersion?.versionId === version.versionId ? 'text-blue-400' : 'text-slate-300'
                    }`}>
                      {version.name}
                    </div>
                    {version.description && (
                      <div className="text-xs text-slate-500 truncate">{version.description}</div>
                    )}
                    <div className="text-xs text-slate-600 mt-0.5">
                      {version.taskCount || 0} actions
                    </div>
                  </div>
                  {currentVersion?.versionId === version.versionId && (
                    <Check className="w-4 h-4 text-blue-400 flex-shrink-0" />
                  )}
                </button>

                {/* Version Actions */}
                <div className="flex items-center gap-1 flex-shrink-0">
                  <button
                    onClick={() => handleActivateVersion(version.versionId)}
                    className={`p-1.5 rounded-lg transition-colors ${
                      version.isActive
                        ? 'bg-yellow-500/20 text-yellow-400'
                        : 'text-slate-500 hover:text-yellow-400 hover:bg-slate-600'
                    }`}
                    title={version.isActive ? 'Version active' : 'Activer cette version'}
                  >
                    <Star className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDeleteVersion(version.versionId)}
                    className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-slate-600 rounded-lg transition-colors"
                    title="Supprimer la version"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}

            {versions.length === 0 && !isCreating && (
              <div className="px-4 py-6 text-center text-slate-500 text-sm">
                Aucune version créée
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
