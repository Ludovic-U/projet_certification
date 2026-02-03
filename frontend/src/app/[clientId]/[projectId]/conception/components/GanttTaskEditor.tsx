import React from 'react';
import { X, Save, Trash2, Plus } from 'lucide-react';
import { Task, EditorTab, Livrable, SelectOption } from '../types';
import { createEmptyBudget, calculateBudgetTotals } from '../utils/budgetUtils';
import Select from 'react-select';

interface GanttTaskEditorProps {
  showEditor: boolean;
  editingTask: Task | null;
  setEditingTask: (task: Task | null) => void;
  setShowEditor: (show: boolean) => void;
  editorTab: EditorTab;
  setEditorTab: (tab: EditorTab) => void;
  livrables: Livrable[];
  showAddLivrable: boolean;
  setShowAddLivrable: (show: boolean) => void;
  newLivrableLabel: string;
  setNewLivrableLabel: (label: string) => void;
  newLivrableDescription: string;
  setNewLivrableDescription: (description: string) => void;
  handleAddLivrable: () => void;
  deleteTask: (id: number) => void;
  updateTask: () => void;
  data: {
    users: { id: number; label: string }[];
  };
}

export const GanttTaskEditor: React.FC<GanttTaskEditorProps> = ({
  showEditor,
  editingTask,
  setEditingTask,
  setShowEditor,
  editorTab,
  setEditorTab,
  livrables,
  showAddLivrable,
  setShowAddLivrable,
  newLivrableLabel,
  setNewLivrableLabel,
  newLivrableDescription,
  setNewLivrableDescription,
  handleAddLivrable,
  deleteTask,
  updateTask,
  data,
}) => {
  if (!showEditor || !editingTask) return null;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-slate-800 border border-slate-700 rounded-lg shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">
            <div className="p-6 border-b border-slate-700 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-white">Edit Task</h2>
              <button
                onClick={() => {
                  setShowEditor(false);
                  setEditingTask(null);
                }}
                className="p-1 hover:bg-slate-700 rounded transition-colors"
              >
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>
            
            {/* Tabs */}
            <div className="flex border-b border-slate-700 overflow-x-auto">
              <button
                onClick={() => setEditorTab('general')}
                className={`px-4 py-3 font-medium transition-colors whitespace-nowrap ${
                  editorTab === 'general' 
                    ? 'text-blue-400 border-b-2 border-blue-400' 
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                General
              </button>
              <button
                onClick={() => setEditorTab('moyenHumain')}
                className={`px-4 py-3 font-medium transition-colors whitespace-nowrap ${
                  editorTab === 'moyenHumain' 
                    ? 'text-blue-400 border-b-2 border-blue-400' 
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Moyen humain
              </button>
              <button
                onClick={() => setEditorTab('interns')}
                className={`px-4 py-3 font-medium transition-colors whitespace-nowrap ${
                  editorTab === 'interns' 
                    ? 'text-blue-400 border-b-2 border-blue-400' 
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Interns
              </button>
              <button
                onClick={() => setEditorTab('amenagements')}
                className={`px-4 py-3 font-medium transition-colors whitespace-nowrap ${
                  editorTab === 'amenagements' 
                    ? 'text-blue-400 border-b-2 border-blue-400' 
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Amenagements
              </button>
              <button
                onClick={() => setEditorTab('equipementsPedagogiques')}
                className={`px-4 py-3 font-medium transition-colors whitespace-nowrap ${
                  editorTab === 'equipementsPedagogiques' 
                    ? 'text-blue-400 border-b-2 border-blue-400' 
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Equipements pedagogiques
              </button>
              <button
                onClick={() => setEditorTab('prestations')}
                className={`px-4 py-3 font-medium transition-colors whitespace-nowrap ${
                  editorTab === 'prestations' 
                    ? 'text-blue-400 border-b-2 border-blue-400' 
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Prestations
              </button>
              <button
                onClick={() => setEditorTab('communications')}
                className={`px-4 py-3 font-medium transition-colors whitespace-nowrap ${
                  editorTab === 'communications' 
                    ? 'text-blue-400 border-b-2 border-blue-400' 
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Communications
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6">
              {editorTab === 'general' ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Task Name
                    </label>
                    <input
                      type="text"
                      value={editingTask.text}
                      onChange={(e) => setEditingTask({ ...editingTask, text: e.target.value })}
                      className="w-full px-4 py-2 bg-slate-700 text-white border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Type
                    </label>
                    <select
                      value={editingTask.type}
                      onChange={(e) => {
                        const newType = e.target.value as Task['type'];
                        if (newType === 'milestone') {
                          setEditingTask({ ...editingTask, type: newType, end: editingTask.start });
                        } else {
                          setEditingTask({ ...editingTask, type: newType });
                        }
                      }}
                      className="w-full px-4 py-2 bg-slate-700 text-white border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="task">Task</option>
                      <option value="milestone">Milestone</option>
                      <option value="project">Project</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        Start Date
                      </label>
                      <input
                        type="date"
                        value={new Date(editingTask.start).toISOString().split('T')[0]}
                        onChange={(e) => {
                          const newStart = new Date(e.target.value);
                          setEditingTask({ ...editingTask, start: newStart, end: editingTask.type === 'milestone' ? newStart : editingTask.end });
                        }}
                        className="w-full px-4 py-2 bg-slate-700 text-white border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    {editingTask.type !== 'milestone' && (
                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">
                          End Date
                        </label>
                        <input
                          type="date"
                          value={new Date(editingTask.end).toISOString().split('T')[0]}
                          onChange={(e) => setEditingTask({ ...editingTask, end: new Date(e.target.value) })}
                          className="w-full px-4 py-2 bg-slate-700 text-white border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Progress: {editingTask.progress}%
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={editingTask.progress}
                      onChange={(e) => setEditingTask({ ...editingTask, progress: parseInt(e.target.value) })}
                      className="w-full"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Details
                    </label>
                    <textarea
                      value={editingTask.details}
                      onChange={(e) => setEditingTask({ ...editingTask, details: e.target.value })}
                      rows={3}
                      className="w-full px-4 py-2 bg-slate-700 text-white border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Assigned to
                    </label>
                    <Select
                      isMulti
                      options={data.users.map(user => ({ value: user.id, label: user.label }))}
                      value={(editingTask.assigneeIds || []).map(id => {
                        const user = data.users.find(u => u.id === id);
                        return user ? { value: user.id, label: user.label } : null;
                      }).filter(Boolean) as SelectOption[]}
                      onChange={(selected) => {
                        setEditingTask({
                          ...editingTask,
                          assigneeIds: (selected as SelectOption[]).map(s => s.value)
                        });
                      }}
                      className="react-select-container"
                      classNamePrefix="react-select"
                      styles={{
                        control: (base) => ({
                          ...base,
                          backgroundColor: '#334155',
                          borderColor: '#475569',
                          color: 'white',
                        }),
                        menu: (base) => ({
                          ...base,
                          backgroundColor: '#334155',
                        }),
                        option: (base, state) => ({
                          ...base,
                          backgroundColor: state.isSelected ? '#3b82f6' : state.isFocused ? '#475569' : 'transparent',
                          color: 'white',
                        }),
                        singleValue: (base) => ({
                          ...base,
                          color: 'white',
                        }),
                        multiValue: (base) => ({
                          ...base,
                          backgroundColor: '#1e40af',
                        }),
                        multiValueLabel: (base) => ({
                          ...base,
                          color: 'white',
                        }),
                      }}
                      placeholder="Select assignees..."
                    />
                  </div>

                  {/* Livrable Selection */}
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Livrable
                    </label>
                    <div className="flex items-center gap-2 mb-2">
                      <button
                        onClick={() => {
                          setShowAddLivrable(!showAddLivrable);
                          if (!showAddLivrable) {
                            setNewLivrableLabel('');
                            setNewLivrableDescription('');
                          }
                        }}
                        className="text-xs text-green-400 hover:text-green-300 flex items-center gap-1 px-2 py-1 rounded bg-green-600/20 hover:bg-green-600/30 transition-colors"
                      >
                        <Plus className="w-5 h-5" />
                        Add New
                      </button>
                    </div>
                    {showAddLivrable ? (
                      <div className="mb-4 p-4 bg-slate-700/50 border border-slate-600 rounded-lg">
                        <div className="space-y-3">
                          <input
                            type="text"
                            value={newLivrableLabel}
                            onChange={(e) => setNewLivrableLabel(e.target.value)}
                            placeholder="Livrable name..."
                            className="w-full px-3 py-2 bg-slate-700 text-white border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                            autoFocus
                          />
                          <input
                            type="text"
                            value={newLivrableDescription}
                            onChange={(e) => setNewLivrableDescription(e.target.value)}
                            placeholder="Description (optional)..."
                            className="w-full px-3 py-2 bg-slate-700 text-white border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                          />
                          <div className="flex gap-2">
                            <button
                              onClick={handleAddLivrable}
                              disabled={!newLivrableLabel.trim()}
                              className="flex-1 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                              <Plus className="w-4 h-4" />
                              Add
                            </button>
                            <button
                              onClick={() => {
                                setShowAddLivrable(false);
                                setNewLivrableLabel('');
                                setNewLivrableDescription('');
                              }}
                              className="px-3 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-500 transition-colors"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      editingTask.livrableIds && editingTask.livrableIds.length > 0 ? (
                        <div className="space-y-2">
                          {editingTask.livrableIds.map(livrableId => {
                            const livrable = livrables.find(l => l.id === livrableId);
                            if (!livrable) return null;
                            return (
                              <div key={livrableId} className="flex items-center gap-2">
                                <div className="flex-1 px-4 py-2 bg-slate-700 text-white border border-slate-600 rounded-lg">
                                  <p className="font-medium">{livrable.label}</p>
                                  {livrable.description && (
                                    <p className="text-xs text-slate-400 mt-1">{livrable.description}</p>
                                  )}
                                </div>
                                <button
                                  onClick={() => {
                                    setEditingTask({
                                      ...editingTask,
                                      livrableIds: editingTask.livrableIds!.filter(id => id !== livrableId)
                                    });
                                  }}
                                  className="p-2 hover:bg-slate-600 rounded text-slate-400 hover:text-red-400 transition-colors"
                                  title="Remove livrable"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="text-sm text-slate-500 italic">No livrable selected. Click &quot;Add New&quot; to create one.</div>
                      )
                    )}
                  </div>

                  {/* Goal */}
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2 flex items-center gap-2">
                      Goal {editingTask.livrableIds && editingTask.livrableIds.length > 0 && editingTask.goal && editingTask.goal.trim() ? (
                        <span className="inline-flex items-center gap-1 text-xs text-green-400 bg-green-600/20 px-2 py-0.5 rounded">
                          ✓ Task will auto-complete when saved
                        </span>
                      ) : (
                        <span className="text-xs text-slate-500">(required with livrable for 100% completion)</span>
                      )}
                    </label>
                    <textarea
                      value={editingTask.goal || ''}
                      onChange={(e) => setEditingTask({ ...editingTask, goal: e.target.value })}
                      rows={3}
                      className="w-full px-4 py-2 bg-slate-700 text-white border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Describe the goal that must be achieved before this task can be marked as 100% complete..."
                    />
                  </div>
                </div>
              ) : editorTab === 'moyenHumain' ? (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-white mb-4">Moyen humain</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        Personnel Days
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={editingTask.budget?.personnelDays || 0}
                        onChange={(e) => setEditingTask({
                          ...editingTask,
                          budget: { ...editingTask.budget!, personnelDays: parseFloat(e.target.value) || 0 }
                        })}
                        className="w-full px-4 py-2 bg-slate-700 text-white border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        Personnel Cost (€)
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={editingTask.budget?.personnelCost || 0}
                        onChange={(e) => setEditingTask({
                          ...editingTask,
                          budget: { ...editingTask.budget!, personnelCost: parseFloat(e.target.value) || 0 }
                        })}
                        className="w-full px-4 py-2 bg-slate-700 text-white border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>
              ) : editorTab === 'interns' ? (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-white mb-4">Interns</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        Interns Days
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={editingTask.budget?.internsDays || 0}
                        onChange={(e) => setEditingTask({
                          ...editingTask,
                          budget: { ...editingTask.budget!, internsDays: parseFloat(e.target.value) || 0 }
                        })}
                        className="w-full px-4 py-2 bg-slate-700 text-white border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        Interns Cost (€)
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={editingTask.budget?.internsCost || 0}
                        onChange={(e) => setEditingTask({
                          ...editingTask,
                          budget: { ...editingTask.budget!, internsCost: parseFloat(e.target.value) || 0 }
                        })}
                        className="w-full px-4 py-2 bg-slate-700 text-white border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>
              ) : editorTab === 'amenagements' ? (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-white mb-4">Amenagements</h3>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Description
                    </label>
                    <textarea
                      value={editingTask.budget?.amenagementsDescription || ''}
                      onChange={(e) => setEditingTask({
                        ...editingTask,
                        budget: {
                          personnelDays: editingTask.budget?.personnelDays ?? 0,
                          personnelCost: editingTask.budget?.personnelCost ?? 0,
                          internsDays: editingTask.budget?.internsDays ?? 0,
                          internsCost: editingTask.budget?.internsCost ?? 0,
                          amenagementsDescription: e.target.value,
                          fittingsCost: editingTask.budget?.fittingsCost ?? 0,
                          educationalEquipmentCost: editingTask.budget?.educationalEquipmentCost ?? 0,
                          subcontractorCost: editingTask.budget?.subcontractorCost ?? 0,
                          travelCost: editingTask.budget?.travelCost ?? 0,
                          otherPrestationsCost: editingTask.budget?.otherPrestationsCost ?? 0,
                          communicationCost: editingTask.budget?.communicationCost ?? 0,
                          overheadRate: editingTask.budget?.overheadRate ?? 0
                        }
                      })}
                      rows={4}
                      className="w-full px-4 py-2 bg-slate-700 text-white border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Describe the fittings/amenagements you have..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Fittings Cost (€)
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={editingTask.budget?.fittingsCost || 0}
                      onChange={(e) => setEditingTask({
                        ...editingTask,
                        budget: { ...editingTask.budget!, fittingsCost: parseFloat(e.target.value) || 0 }
                      })}
                      className="w-full px-4 py-2 bg-slate-700 text-white border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              ) : editorTab === 'equipementsPedagogiques' ? (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-white mb-4">Equipements pedagogiques</h3>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Educational Equipment Cost (€)
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={editingTask.budget?.educationalEquipmentCost || 0}
                      onChange={(e) => setEditingTask({
                        ...editingTask,
                        budget: { ...editingTask.budget!, educationalEquipmentCost: parseFloat(e.target.value) || 0 }
                      })}
                      className="w-full px-4 py-2 bg-slate-700 text-white border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              ) : editorTab === 'prestations' ? (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-white mb-4">Prestations</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        Subcontractor Cost (€)
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={editingTask.budget?.subcontractorCost || 0}
                        onChange={(e) => setEditingTask({
                          ...editingTask,
                          budget: { ...editingTask.budget!, subcontractorCost: parseFloat(e.target.value) || 0 }
                        })}
                        className="w-full px-4 py-2 bg-slate-700 text-white border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        Travel Cost (€)
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={editingTask.budget?.travelCost || 0}
                        onChange={(e) => setEditingTask({
                          ...editingTask,
                          budget: { ...editingTask.budget!, travelCost: parseFloat(e.target.value) || 0 }
                        })}
                        className="w-full px-4 py-2 bg-slate-700 text-white border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        Other Prestations Cost (€)
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={editingTask.budget?.otherPrestationsCost || 0}
                        onChange={(e) => setEditingTask({
                          ...editingTask,
                          budget: { ...editingTask.budget!, otherPrestationsCost: parseFloat(e.target.value) || 0 }
                        })}
                        className="w-full px-4 py-2 bg-slate-700 text-white border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        Overhead Rate (%)
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={editingTask.budget?.overheadRate || 0}
                        onChange={(e) => setEditingTask({
                          ...editingTask,
                          budget: { ...editingTask.budget!, overheadRate: parseFloat(e.target.value) || 0 }
                        })}
                        className="w-full px-4 py-2 bg-slate-700 text-white border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>
              ) : editorTab === 'communications' ? (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-white mb-4">Communications</h3>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Communication Cost (€)
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={editingTask.budget?.communicationCost || 0}
                      onChange={(e) => setEditingTask({
                        ...editingTask,
                        budget: { ...editingTask.budget!, communicationCost: parseFloat(e.target.value) || 0 }
                      })}
                      className="w-full px-4 py-2 bg-slate-700 text-white border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              ) : null}

              {/* Budget Total - Show on all budget tabs */}
              {editorTab !== 'general' && (() => {
                const budget = editingTask.budget || createEmptyBudget();
                const { subtotal, overhead, total } = calculateBudgetTotals(budget);
                return (
                  <div className="mt-6 bg-blue-600/20 border border-blue-500/50 p-4 rounded-lg">
                    <div className="flex justify-between text-slate-300 mb-2">
                      <span>Subtotal:</span>
                      <span>{subtotal.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}</span>
                    </div>
                    <div className="flex justify-between text-slate-300 mb-2">
                      <span>Overhead ({budget.overheadRate}%):</span>
                      <span>{overhead.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}</span>
                    </div>
                    <div className="flex justify-between text-xl font-bold text-white pt-2 border-t border-slate-600">
                      <span>Total Budget:</span>
                      <span>{total.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}</span>
                    </div>
                  </div>
                );
              })()}
            </div>

            <div className="p-6 border-t border-slate-700 flex justify-between">
              <button
                onClick={() => {
                  setShowEditor(false);
                  setEditingTask(null);
                }}
                className="px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-colors"
              >
                Close
              </button>
              <div className="flex gap-2">
                <button
                  onClick={() => deleteTask(editingTask.id)}
                  className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete
                </button>
                <button
                  onClick={updateTask}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Save className="w-4 h-4" />
                  Save
                </button>
              </div>
            </div>
          </div>
    </div>
  );
};
