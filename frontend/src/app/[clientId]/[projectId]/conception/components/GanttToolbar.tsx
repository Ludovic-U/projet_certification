import React from 'react';
import { 
  Calendar, 
  Plus, 
  Undo2, 
  Redo2, 
  MoreHorizontal, 
  ZoomIn, 
  ZoomOut,
  FileSpreadsheet,
  Download,
  Upload,
  ChevronRight,
  Layout,
  List,
  CalendarDays,
  Home,
  HelpCircle
} from 'lucide-react';
import { ViewMode, MenuPosition } from '../types';
import { PortalMenu } from './PortalMenu';
import { MistralModal } from './MistralModal';
import { Task, Link } from '../../data';
import { Version } from '@/api/ganttApi';
import { VersionSelector } from './VersionSelector';

interface GanttToolbarProps {
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
  pxPerDay: number;
  zoomBy: (delta: number) => void;
  scrollToDate: (date: Date) => void;
  today: Date;
  addTask: () => void;
  undo: () => void;
  redo: () => void;
  historyIndex: number;
  historyLength: number;
  menuOpen: boolean;
  setMenuOpen: (open: boolean) => void;
  exportMenuOpen: boolean;
  setExportMenuOpen: (open: boolean) => void;
  importMenuOpen: boolean;
  setImportMenuOpen: (open: boolean) => void;
  menuPosition: MenuPosition;
  setMenuPosition: (position: MenuPosition) => void;
  exportMenuPosition: MenuPosition;
  setExportMenuPosition: (position: MenuPosition) => void;
  importMenuPosition: MenuPosition;
  setImportMenuPosition: (position: MenuPosition) => void;
  menuButtonRef: React.RefObject<HTMLButtonElement | null>;
  exportMenuRef: React.RefObject<HTMLDivElement | null>;
  importMenuRef: React.RefObject<HTMLDivElement | null>;
  exportToCSV: () => void;
  exportToExcel: () => void;
  exportToMSProject: () => void;
  exportData: () => void;
  importFromCSV: (e: React.ChangeEvent<HTMLInputElement>) => void;
  importFromExcel: (e: React.ChangeEvent<HTMLInputElement>) => void;
  importData: (e: React.ChangeEvent<HTMLInputElement>) => void;
  importMistralGantt: (e: React.ChangeEvent<HTMLInputElement>) => void;
  mistralModalOpen: boolean;
  setMistralModalOpen: (open: boolean) => void;
  tasks: Task[];
  links: Link[];
  setTasks: (tasks: Task[]) => void;
  setLinks: (links: Link[]) => void;
  saveState: (nextTasks?: Task[], nextLinks?: Link[]) => void;
  versions: Version[];
  currentVersion: Version | null;
  setCurrentVersion: (version: Version | null) => void;
  onCreateVersion: (name: string, description?: string, sourceVersionId?: number | null) => void;
  onDeleteVersion: (versionId: number) => void;
  onActivateVersion: (versionId: number) => void;
  projectId: number;
  versionsKey?: number;
  // Tutorial props
  tutorialOpen?: boolean;
  setTutorialOpen?: (open: boolean) => void;
}

export const GanttToolbar: React.FC<GanttToolbarProps> = ({
  viewMode,
  setViewMode,
  zoomBy,
  scrollToDate,
  today,
  addTask,
  undo,
  redo,
  historyIndex,
  historyLength,
  menuOpen,
  setMenuOpen,
  exportMenuOpen,
  setExportMenuOpen,
  importMenuOpen,
  setImportMenuOpen,
  menuPosition,
  setMenuPosition,
  exportMenuPosition,
  setExportMenuPosition,
  importMenuPosition,
  setImportMenuPosition,
  menuButtonRef,
  exportMenuRef,
  importMenuRef,
  exportToCSV,
  exportToExcel,
  exportToMSProject,
  exportData,
  importFromCSV,
  importFromExcel,
  importData,
  importMistralGantt,
  mistralModalOpen,
  setMistralModalOpen,
  tasks,
  links,
  setTasks,
  setLinks,
  saveState,
  versions,
  currentVersion,
  setCurrentVersion,
  onCreateVersion,
  onDeleteVersion,
  onActivateVersion,
  projectId,
  versionsKey,
  // Tutorial props
  tutorialOpen,
  setTutorialOpen,
}) => {
  const viewModes: { value: ViewMode; label: string; icon: React.ReactNode }[] = [
    { value: 'day', label: 'Jour', icon: <CalendarDays className="w-4 h-4" /> },
    { value: 'week', label: 'Semaine', icon: <Layout className="w-4 h-4" /> },
    { value: 'month', label: 'Mois', icon: <List className="w-4 h-4" /> },
  ];

  // Calculate main menu position based on button
  const updateMenuPosition = () => {
    if (menuButtonRef.current) {
      const rect = menuButtonRef.current.getBoundingClientRect();
      setMenuPosition({
        top: rect.bottom + 8,
        left: rect.left
      });
    }
  };

  // Calculate export menu position with overflow detection
  const updateExportMenuPosition = () => {
    if (exportMenuRef.current) {
      const rect = exportMenuRef.current.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      const submenuWidth = 180;
      
      const wouldOverflowRight = rect.right + 8 + submenuWidth > viewportWidth;
      
      setExportMenuPosition({
        top: rect.top - 4,
        left: wouldOverflowRight ? rect.left - submenuWidth - 8 : rect.right + 8
      });
    }
  };

  // Calculate import menu position with overflow detection
  const updateImportMenuPosition = () => {
    if (importMenuRef.current) {
      const rect = importMenuRef.current.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      const submenuWidth = 180;
      
      const wouldOverflowRight = rect.right + 8 + submenuWidth > viewportWidth;
      
      setImportMenuPosition({
        top: rect.top - 4,
        left: wouldOverflowRight ? rect.left - submenuWidth - 8 : rect.right + 8
      });
    }
  };

  // Handle menu button click
  const handleMenuClick = () => {
    if (!menuOpen) {
      updateMenuPosition();
    }
    setMenuOpen(!menuOpen);
  };

  return (
    <div className="bg-slate-800 border-b border-slate-700 flex-shrink-0">
      <div className="flex items-center justify-between px-4 py-4 gap-4 flex-wrap">
        {/* Left Section - Title with Menu Button */}
        <div className="flex items-center gap-3">
          {/* More Options Button - Left of title */}
          <div className="relative">
            <button
              ref={menuButtonRef}
              onClick={handleMenuClick}
              className="p-2.5 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-colors"
              title="Plus d'options"
            >
              <MoreHorizontal className="w-5 h-5" />
            </button>
            {menuOpen && (
              <PortalMenu
                isOpen={menuOpen}
                onClose={() => { setMenuOpen(false); setExportMenuOpen(false); setImportMenuOpen(false); }}
                position={menuPosition}
              >
                {/* Export Submenu */}
                <div ref={exportMenuRef} className="relative">
                  <button
                    className="w-full px-4 py-3 text-left text-slate-300 hover:bg-slate-800 hover:text-white flex items-center gap-3 justify-between rounded-lg"
                    onClick={() => {
                      updateExportMenuPosition();
                      setExportMenuOpen(!exportMenuOpen);
                      setImportMenuOpen(false);
                    }}
                  >
                    <div className="flex items-center gap-2">
                      <Download className="w-4 h-4" />
                      Exporter
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-500" />
                  </button>
                  {exportMenuOpen && (
                    <PortalMenu
                      isOpen={exportMenuOpen}
                      onClose={() => { setExportMenuOpen(false); }}
                      position={exportMenuPosition}
                    >
                      <ExportButton
                        onClick={exportToCSV}
                        icon={<FileSpreadsheet className="w-4 h-4" />}
                        label="CSV"
                        color="text-green-400"
                      />
                      <ExportButton
                        onClick={exportToExcel}
                        icon={<FileSpreadsheet className="w-4 h-4" />}
                        label="Excel"
                        color="text-blue-400"
                      />
                      <ExportButton
                        onClick={exportToMSProject}
                        icon={<FileSpreadsheet className="w-4 h-4" />}
                        label="MS Project"
                        color="text-orange-400"
                      />
                      <ExportButton
                        onClick={exportData}
                        icon={<FileSpreadsheet className="w-4 h-4" />}
                        label="JSON"
                        color="text-purple-400"
                      />
                    </PortalMenu>
                  )}
                </div>
                {/* Import Submenu */}
                <div ref={importMenuRef} className="relative">
                  <button
                    className="w-full px-4 py-3 text-left text-slate-300 hover:bg-slate-800 hover:text-white flex items-center gap-3 justify-between rounded-lg"
                    onClick={() => {
                      updateImportMenuPosition();
                      setImportMenuOpen(!importMenuOpen);
                      setExportMenuOpen(false);
                    }}
                  >
                    <div className="flex items-center gap-2">
                      <Upload className="w-4 h-4" />
                      Importer
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-500" />
                  </button>
                  {importMenuOpen && (
                    <PortalMenu
                      isOpen={importMenuOpen}
                      onClose={() => { setImportMenuOpen(false); setMenuOpen(false); }}
                      position={importMenuPosition}
                    >
                      <ImportLabel
                        icon={<FileSpreadsheet className="w-4 h-4 text-green-400" />}
                        label="CSV"
                        accept=".csv"
                        onChange={importFromCSV}
                      />
                      <ImportLabel
                        icon={<FileSpreadsheet className="w-4 h-4 text-blue-400" />}
                        label="Excel"
                        accept=".xlsx,.xls"
                        onChange={importFromExcel}
                      />
                      <ImportLabel
                        icon={<Upload className="w-4 h-4" />}
                        label="JSON"
                        accept=".json"
                        onChange={importData}
                      />
                      <ImportLabel
                        icon={<Upload className="w-4 h-4 text-purple-400" />}
                        label="Mistral"
                        accept=".json"
                        onChange={importMistralGantt}
                      />
                    </PortalMenu>
                  )}
                </div>
                {/* Mistral Modal Button */}
                <button
                  className="w-full px-4 py-2 text-left text-white hover:bg-slate-700 flex items-center gap-2"
                  onClick={() => {
                    setMistralModalOpen(true);
                    setMenuOpen(false);
                  }}
                >
                  <div className="flex items-center gap-2">
                    <Upload className="w-4 h-4" />
                    Mistral
                  </div>
                </button>
              </PortalMenu>
            )}
          </div>
          
          {/* Title */}
          <div className="p-2 bg-blue-500/10 rounded-xl">
            <Calendar className="w-6 h-6 text-blue-400" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">Diagramme de Gantt</h1>
            <p className="text-xs text-slate-400">Chronologie du projet</p>
          </div>
        </div>

        {/* Center Section - Controls */}
        <div className="flex items-center gap-2">
          {/* History Controls */}
          <div 
            className="flex items-center gap-1 bg-slate-800/50 rounded-lg p-1"
            data-tutorial-id="undo-redo"
          >
            <ToolbarButton
              onClick={undo}
              disabled={historyIndex === 0}
              icon={<Undo2 className="w-4 h-4" />}
              tooltip="Annuler"
            />
            <ToolbarButton
              onClick={redo}
              disabled={historyIndex === historyLength - 1}
              icon={<Redo2 className="w-4 h-4" />}
              tooltip="Rétablir"
            />
          </div>

          {/* View Mode - Segmented Control */}
          <div 
            className="flex items-center gap-1 bg-slate-800/50 rounded-lg p-1"
            data-tutorial-id="view-mode"
          >
            {viewModes.map((mode) => (
              <button
                key={mode.value}
                onClick={() => setViewMode(mode.value)}
                className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-all ${
                  viewMode === mode.value 
                    ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/25' 
                    : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
                }`}
              >
                {mode.icon}
                <span className="hidden sm:inline">{mode.label}</span>
              </button>
            ))}
          </div>

          {/* Zoom Controls */}
          <div 
            className="flex items-center gap-1 bg-slate-800/50 rounded-lg p-1"
            data-tutorial-id="zoom-controls"
          >
            <ToolbarButton
              onClick={() => zoomBy(-2)}
              icon={<ZoomOut className="w-4 h-4" />}
              tooltip="Zoom arrière"
            />
            <ToolbarButton
              onClick={() => zoomBy(2)}
              icon={<ZoomIn className="w-4 h-4" />}
              tooltip="Zoom avant"
            />
          </div>

          {/* Today Button */}
          <button
            onClick={() => scrollToDate(today)}
            className="flex items-center gap-2 px-4 py-2 bg-slate-800 text-slate-300 rounded-lg hover:bg-slate-700 hover:text-white transition-all text-sm font-medium"
            data-tutorial-id="today-btn"
          >
            <Home className="w-4 h-4" />
            <span className="hidden sm:inline">Aujourd&apos;hui</span>
          </button>

          {/* Version Selector */}
          <VersionSelector
            versions={versions}
            currentVersion={currentVersion}
            setCurrentVersion={setCurrentVersion}
            onCreateVersion={onCreateVersion}
            onDeleteVersion={onDeleteVersion}
            onActivateVersion={onActivateVersion}
            projectId={projectId}
            versionsKey={versionsKey}
          />
        </div>

        {/* Right Section - Add Task */}
        <div className="flex items-center gap-3">
          {/* Tutorial Button */}
          {setTutorialOpen && (
            <button
              onClick={() => setTutorialOpen(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-purple-500/20 text-purple-300 border border-purple-500/30 rounded-xl hover:bg-purple-500/30 transition-all text-sm font-medium"
              data-tutorial-id="tutorial-btn"
            >
              <HelpCircle className="w-5 h-5" />
              <span className="hidden sm:inline">Tutoriel</span>
            </button>
          )}
          {/* Add Task Button */}
          <button
            onClick={addTask}
            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all shadow-lg shadow-blue-500/25 font-medium"
            data-tutorial-id="add-task-btn"
          >
            <Plus className="w-5 h-5" />
            <span className="hidden sm:inline">Ajouter une tâche</span>
          </button>
        </div>
      </div>
      
      {/* Mistral Modal */}
      <MistralModal 
        isOpen={mistralModalOpen} 
        onClose={() => setMistralModalOpen(false)}
        tasks={tasks}
        links={links}
        setTasks={setTasks}
        setLinks={setLinks}
        saveState={saveState}
      />
    </div>
  );
};

// Toolbar Button Component
const ToolbarButton: React.FC<{
  onClick: () => void;
  disabled?: boolean;
  icon: React.ReactNode;
  tooltip: string;
}> = ({ onClick, disabled, icon, tooltip }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className="flex items-center justify-center w-9 h-9 text-slate-400 rounded-lg hover:bg-slate-700 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed transition-all"
    title={tooltip}
  >
    {icon}
  </button>
);

// Export Button Component
const ExportButton: React.FC<{
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
  color: string;
}> = ({ onClick, icon, label, color }) => (
  <button
    onClick={onClick}
    className="w-full px-4 py-3 text-left text-slate-300 hover:bg-slate-800 hover:text-white flex items-center gap-3 rounded-lg transition-colors"
  >
    <span className={color}>{icon}</span>
    <span>{label}</span>
  </button>
);

// Import Label Component
const ImportLabel: React.FC<{
  icon: React.ReactNode;
  label: string;
  accept: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}> = ({ icon, label, accept, onChange }) => (
  <label className="w-full px-4 py-3 text-left text-slate-300 hover:bg-slate-800 hover:text-white flex items-center gap-3 rounded-lg cursor-pointer transition-colors">
    {icon}
    <span>{label}</span>
    <input type="file" accept={accept} onChange={onChange} className="hidden" />
  </label>
);
