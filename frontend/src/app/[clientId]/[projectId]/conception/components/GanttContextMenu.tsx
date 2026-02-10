import React from 'react';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { Task } from '../types';

interface GanttContextMenuProps {
  contextMenu: { task: Task; x: number; y: number } | null;
  setContextMenu: (menu: { task: Task; x: number; y: number } | null) => void;
  addChildTask: (parentId: number) => void;
  setEditingTask: (task: Task | null) => void;
  setShowEditor: (show: boolean) => void;
  deleteTask: (id: number) => void;
}

export const GanttContextMenu: React.FC<GanttContextMenuProps> = ({
  contextMenu,
  setContextMenu,
  addChildTask,
  setEditingTask,
  setShowEditor,
  deleteTask,
}) => {
  if (!contextMenu) return null;

  return (
    <>
      <div
        className="fixed inset-0 z-40"
        onClick={() => setContextMenu(null)}
      />
      <div
        className="fixed z-50 bg-slate-800 border border-slate-700 rounded-lg shadow-xl py-1 min-w-[160px]"
        style={{
          left: contextMenu.x,
          top: contextMenu.y
        }}
      >
        <button
          onClick={() => addChildTask(contextMenu.task.id)}
          className="w-full px-4 py-2 text-left text-white hover:bg-slate-700 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Ajouter une sous-tâche
        </button>
        <div className="border-t border-slate-700 my-1" />
        <button
          onClick={() => {
            setEditingTask(contextMenu.task);
            setShowEditor(true);
            setContextMenu(null);
          }}
          className="w-full px-4 py-2 text-left text-white hover:bg-slate-700 flex items-center gap-2"
        >
          <Edit className="w-4 h-4" />
          Modifier
        </button>
        <button
          onClick={() => deleteTask(contextMenu.task.id)}
          className="w-full px-4 py-2 text-left text-red-400 hover:bg-slate-700 flex items-center gap-2"
        >
          <Trash2 className="w-4 h-4" />
          Supprimer
        </button>
      </div>
    </>
  );
};
