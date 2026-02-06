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
  Home
} from 'lucide-react';
import { ViewMode, MenuPosition } from '../types';
import { PortalMenu } from './PortalMenu';

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
}) => {
  const viewModes: { value: ViewMode; label: string; icon: React.ReactNode }[] = [
    { value: 'day', label: 'Day', icon: <CalendarDays className="w-4 h-4" /> },
    { value: 'week', label: 'Week', icon: <Layout className="w-4 h-4" /> },
    { value: 'month', label: 'Month', icon: <List className="w-4 h-4" /> },
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
      const submenuWidth = 180; // approximate submenu width
      
      // Check if opening to the right would overflow
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
      const submenuWidth = 180; // approximate submenu width
      
      // Check if opening to the right would overflow
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
    <div className="bg-slate-900/80 backdrop-blur-md border-b border-slate-700 flex-shrink-0">
      <div className="flex items-center justify-between px-6 py-3 gap-4">
        {/* Left Section - Menu & Title */}
        <div className="flex items-center gap-4">
          {/* More Options Menu - Far Left */}
          <div className="relative">
            <button
              ref={menuButtonRef}
              onClick={handleMenuClick}
              className="flex items-center justify-center w-10 h-10 bg-slate-800 text-slate-400 rounded-xl hover:bg-slate-700 hover:text-white transition-all"
              title="More options"
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
                    <div className="flex items-center gap-3">
                      <div className="p-1.5 bg-emerald-500/10 rounded-lg">
                        <Download className="w-4 h-4 text-emerald-400" />
                      </div>
                      <span>Export</span>
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
                    <div className="flex items-center gap-3">
                      <div className="p-1.5 bg-blue-500/10 rounded-lg">
                        <Upload className="w-4 h-4 text-blue-400" />
                      </div>
                      <span>Import</span>
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
                        icon={<Upload className="w-4 h-4 text-blue-400" />}
                        label="JSON"
                        accept=".json"
                        onChange={importData}
                      />
                    </PortalMenu>
                  )}
                </div>
              </PortalMenu>
            )}
          </div>
          
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500/10 rounded-xl">
              <Calendar className="w-6 h-6 text-blue-400" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">Gantt Chart</h1>
              <p className="text-xs text-slate-400">Project Timeline</p>
            </div>
          </div>
        </div>

        {/* Center Section - Actions */}
        <div className="flex items-center gap-2">
          {/* History Controls */}
          <div className="flex items-center gap-1 bg-slate-800/50 rounded-lg p-1">
            <ToolbarButton
              onClick={undo}
              disabled={historyIndex === 0}
              icon={<Undo2 className="w-4 h-4" />}
              tooltip="Undo"
            />
            <ToolbarButton
              onClick={redo}
              disabled={historyIndex === historyLength - 1}
              icon={<Redo2 className="w-4 h-4" />}
              tooltip="Redo"
            />
          </div>

          {/* View Mode - Segmented Control */}
          <div className="flex items-center gap-1 bg-slate-800/50 rounded-lg p-1">
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
          <div className="flex items-center gap-1 bg-slate-800/50 rounded-lg p-1">
            <ToolbarButton
              onClick={() => zoomBy(-2)}
              icon={<ZoomOut className="w-4 h-4" />}
              tooltip="Zoom Out"
            />
            <ToolbarButton
              onClick={() => zoomBy(2)}
              icon={<ZoomIn className="w-4 h-4" />}
              tooltip="Zoom In"
            />
          </div>

          {/* Today Button */}
          <button
            onClick={() => scrollToDate(today)}
            className="flex items-center gap-2 px-4 py-2 bg-slate-800 text-slate-300 rounded-lg hover:bg-slate-700 hover:text-white transition-all text-sm font-medium"
          >
            <Home className="w-4 h-4" />
            <span className="hidden sm:inline">Today</span>
          </button>
        </div>

        {/* Right Section - Add Task */}
        <div className="flex items-center gap-3">
          {/* Add Task Button */}
          <button
            onClick={addTask}
            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all shadow-lg shadow-blue-500/25 font-medium"
          >
            <Plus className="w-5 h-5" />
            <span className="hidden sm:inline">Add Task</span>
          </button>
        </div>
      </div>
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
