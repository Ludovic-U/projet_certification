import React from 'react';
import { Calendar, Plus, Undo, Redo, MoreHorizontal, ZoomIn, ZoomOut } from 'lucide-react';
import { ViewMode, MenuPosition } from '../types';
import { PortalMenu } from './PortalMenu';
import { FileSpreadsheet, Download, Upload, ChevronRight } from 'lucide-react';
import { MistralModal } from './MistralModal';

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
  exportMenuPosition: MenuPosition;
  importMenuPosition: MenuPosition;
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
  exportMenuPosition,
  importMenuPosition,
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
}) => {
  return (
    <div className="bg-slate-800 border-b border-slate-700 flex-shrink-0">
      <div className="flex items-center justify-between px-4 py-4 gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <Calendar className="w-7 h-7 text-blue-400" />
          <h1 className="text-2xl font-bold text-white">Diagramme de Gantt</h1>
        </div>
        <div className="flex gap-2 flex-wrap items-center">
          <button
            onClick={undo}
            disabled={historyIndex === 0}
            className="p-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed"
            title="Annuler"
          >
            <Undo className="w-4 h-4" />
          </button>
          <button
            onClick={redo}
            disabled={historyIndex === historyLength - 1}
            className="p-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed"
            title="Rétablir"
          >
            <Redo className="w-4 h-4" />
          </button>
          <div className="flex gap-1">
            <button
              onClick={() => setViewMode('day')}
              className={`px-3 py-2 text-white rounded-lg transition-colors ${viewMode === 'day' ? 'bg-blue-600' : 'bg-slate-700 hover:bg-slate-600'}`}
            >
              Jour
            </button>
            <button
              onClick={() => setViewMode('week')}
              className={`px-3 py-2 text-white rounded-lg transition-colors ${viewMode === 'week' ? 'bg-blue-600' : 'bg-slate-700 hover:bg-slate-600'}`}
            >
              Semaine
            </button>
            <button
              onClick={() => setViewMode('month')}
              className={`px-3 py-2 text-white rounded-lg transition-colors ${viewMode === 'month' ? 'bg-blue-600' : 'bg-slate-700 hover:bg-slate-600'}`}
            >
              Mois
            </button>
          </div>
          <div className="flex gap-1 ml-2">
            <button onClick={() => zoomBy(-2)} className="p-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600" title="Zoom arrière">
              <ZoomOut className="w-4 h-4" />
            </button>
            <button onClick={() => zoomBy(2)} className="p-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600" title="Zoom avant">
              <ZoomIn className="w-4 h-4" />
            </button>
          </div>
          <button onClick={() => scrollToDate(today)} className="px-3 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600" title="Aller à aujourd'hui">Aujourd'hui</button>
          <button
            onClick={addTask}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors ml-2"
          >
            <Plus className="w-4 h-4" />
            Ajouter une tâche
          </button>
          <div className="relative">
              <button
                ref={menuButtonRef}
                onClick={() => {
                  setMenuOpen(!menuOpen);
                }}
                className="p-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-colors"
                title="Plus d'options"
              >
              <MoreHorizontal className="w-4 h-4" />
            </button>
            {menuOpen && (
              <PortalMenu
                isOpen={menuOpen}
                onClose={() => { setMenuOpen(false); setExportMenuOpen(false); setImportMenuOpen(false); }}
                position={menuPosition}
              >
                {/* Export Submenu */}
                <div ref={exportMenuRef} className="relative group">
                  <button
                    className="w-full px-4 py-2 text-left text-white hover:bg-slate-700 flex items-center gap-2 justify-between"
                    onClick={() => {
                      setExportMenuOpen(!exportMenuOpen);
                      setImportMenuOpen(false);
                    }}
                  >
                    <div className="flex items-center gap-2">
                      <Download className="w-4 h-4" />
                      Exporter
                    </div>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                  {exportMenuOpen && (
                    <PortalMenu
                      isOpen={exportMenuOpen}
                      onClose={() => { setExportMenuOpen(false); }}
                      position={exportMenuPosition}
                    >
                      <button
                        onClick={exportToCSV}
                        className="w-full px-4 py-2 text-left text-white hover:bg-slate-700 flex items-center gap-2"
                      >
                        <FileSpreadsheet className="w-4 h-4 text-green-400" />
                        CSV
                      </button>
                      <button
                        onClick={exportToExcel}
                        className="w-full px-4 py-2 text-left text-white hover:bg-slate-700 flex items-center gap-2"
                      >
                        <FileSpreadsheet className="w-4 h-4 text-blue-400" />
                        Excel
                      </button>
                      <button
                        onClick={exportToMSProject}
                        className="w-full px-4 py-2 text-left text-white hover:bg-slate-700 flex items-center gap-2"
                      >
                        <FileSpreadsheet className="w-4 h-4 text-orange-400" />
                        MS Project
                      </button>
                      <button
                        onClick={exportData}
                        className="w-full px-4 py-2 text-left text-white hover:bg-slate-700 flex items-center gap-2"
                      >
                        <FileSpreadsheet className="w-4 h-4 text-purple-400" />
                        JSON
                      </button>
                    </PortalMenu>
                  )}
                </div>
                {/* Import Submenu */}
                <div ref={importMenuRef} className="relative group">
                  <button
                    className="w-full px-4 py-2 text-left text-white hover:bg-slate-700 flex items-center gap-2 justify-between"
                    onClick={() => {
                      setImportMenuOpen(!importMenuOpen);
                      setExportMenuOpen(false);
                    }}
                  >
                    <div className="flex items-center gap-2">
                      <Upload className="w-4 h-4" />
                      Importer
                    </div>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                  {importMenuOpen && (
                    <PortalMenu
                      isOpen={importMenuOpen}
                      onClose={() => { setImportMenuOpen(false); setMenuOpen(false); }}
                      position={importMenuPosition}
                    >
                      <label className="w-full px-4 py-2 text-left text-white hover:bg-slate-700 flex items-center gap-2 cursor-pointer">
                        <FileSpreadsheet className="w-4 h-4 text-green-400" />
                        CSV
                        <input type="file" accept=".csv" onChange={importFromCSV} className="hidden" />
                      </label>
                      <label className="w-full px-4 py-2 text-left text-white hover:bg-slate-700 flex items-center gap-2 cursor-pointer">
                        <FileSpreadsheet className="w-4 h-4 text-blue-400" />
                        Excel
                        <input type="file" accept=".xlsx,.xls" onChange={importFromExcel} className="hidden" />
                      </label>
                      <label className="w-full px-4 py-2 text-left text-white hover:bg-slate-700 flex items-center gap-2 cursor-pointer">
                        <Upload className="w-4 h-4" />
                        JSON
                        <input type="file" accept=".json" onChange={importData} className="hidden" />
                      </label>
                      <label className="w-full px-4 py-2 text-left text-white hover:bg-slate-700 flex items-center gap-2 cursor-pointer">
                        <Upload className="w-4 h-4 text-purple-400" />
                        Mistral
                        <input type="file" accept=".json" onChange={importMistralGantt} className="hidden" />
                      </label>
                    </PortalMenu>
                  )}
                </div>
                {/* Mistral Modal */}
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
        </div>
      </div>
      {/* Mistral Modal */}
      <MistralModal 
        isOpen={mistralModalOpen} 
        onClose={() => setMistralModalOpen(false)} 
      />
    </div>
  );
};
