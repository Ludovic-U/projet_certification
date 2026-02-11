import React from 'react';
import { X, Save, Trash2, Plus, Calendar, CheckCircle2, Users, Target, DollarSign, Settings, FileText, UserMinus, CreditCard } from 'lucide-react';
import { Task, EditorTab, Livrable, SelectOption } from '../types';
import { createEmptyBudget, createEmptyExpenseLine, calculateExpenseLineTotal, calculateExpenseLinesTotal, calculateBudgetTotals, getExpenseLinesByCategory, Budget } from '../utils/budgetUtils';
import Select from 'react-select';

// Task color options for Gantt chart display
const TASK_COLORS = [
  { name: 'Blue', value: '#3b82f6' },
  { name: 'Green', value: '#22c55e' },
  { name: 'Red', value: '#ef4444' },
  { name: 'Orange', value: '#f97316' },
  { name: 'Purple', value: '#a855f7' },
  { name: 'Pink', value: '#ec4899' },
  { name: 'Cyan', value: '#06b6d4' },
];

// Livrables Section Component
interface LivrablesSectionProps {
  editingTask: Task;
  setEditingTask: (task: Task) => void;
  livrables: Livrable[];
  showAddLivrable: boolean;
  setShowAddLivrable: (show: boolean) => void;
  newLivrableLabel: string;
  setNewLivrableLabel: (label: string) => void;
  newLivrableDescription: string;
  setNewLivrableDescription: (description: string) => void;
  handleAddLivrable: () => void;
}

const LivrablesSection: React.FC<LivrablesSectionProps> = ({
  editingTask,
  setEditingTask,
  livrables,
  showAddLivrable,
  setShowAddLivrable,
  newLivrableLabel,
  setNewLivrableLabel,
  newLivrableDescription,
  setNewLivrableDescription,
  handleAddLivrable,
}) => {
  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-slate-300 flex items-center gap-2">
        <Target className="w-4 h-4 text-emerald-400" />
        Livrables
      </label>
      <div className="flex items-center gap-2">
        <button
          onClick={() => {
            setShowAddLivrable(!showAddLivrable);
            if (!showAddLivrable) {
              setNewLivrableLabel('');
              setNewLivrableDescription('');
            }
          }}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-xl hover:bg-emerald-500/30 transition-all"
        >
          <Plus className="w-4 h-4" />
          Ajouter un livrable
        </button>
      </div>
      
      {showAddLivrable ? (
        <div className="p-4 bg-slate-800/50 border border-slate-600 rounded-xl space-y-3 animate-in slide-in-from-top-2">
          <input
            type="text"
            value={newLivrableLabel}
            onChange={(e) => setNewLivrableLabel(e.target.value)}
            placeholder="Nom du livrable..."
            className="w-full px-4 py-3 bg-slate-800 text-white border border-slate-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
            autoFocus
          />
          <input
            type="text"
            value={newLivrableDescription}
            onChange={(e) => setNewLivrableDescription(e.target.value)}
            placeholder="Description (optionnelle)..."
            className="w-full px-4 py-3 bg-slate-800 text-white border border-slate-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
          <div className="flex gap-2">
            <button
              onClick={handleAddLivrable}
              disabled={!newLivrableLabel.trim()}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-xl hover:bg-emerald-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Plus className="w-4 h-4" />
              Ajouter
            </button>
            <button
              onClick={() => {
                setShowAddLivrable(false);
                setNewLivrableLabel('');
                setNewLivrableDescription('');
              }}
              className="px-4 py-2 bg-slate-700 text-slate-300 rounded-xl hover:bg-slate-600 transition-all"
            >
              Annuler
            </button>
          </div>
        </div>
      ) : editingTask.livrableIds && editingTask.livrableIds.length > 0 ? (
        <div className="space-y-2">
          {editingTask.livrableIds.map(livrableId => {
            const livrable = livrables.find(l => l.id === livrableId);
            if (!livrable) return null;
            return (
              <div key={livrableId} className="flex items-center gap-3 group">
                <div className="flex-1 px-4 py-3 bg-slate-800 border border-slate-600 rounded-xl">
                  <p className="font-medium text-white">{livrable.label}</p>
                  {livrable.description && (
                    <p className="text-sm text-slate-400 mt-1">{livrable.description}</p>
                  )}
                </div>
                <button
                  onClick={() => {
                    setEditingTask({
                      ...editingTask,
                      livrableIds: editingTask.livrableIds!.filter(id => id !== livrableId)
                    });
                  }}
                  className="p-2 bg-slate-800 border border-slate-600 rounded-xl text-slate-400 hover:text-red-400 hover:border-red-500/50 transition-all opacity-0 group-hover:opacity-100"
                  title="Supprimer le livrable"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-sm text-slate-500 italic bg-slate-800/30 px-4 py-3 rounded-xl">
          Aucun livrable sélectionné
        </div>
      )}
    </div>
  );
};

// Budget Total Preview Component
const BudgetTotalPreview: React.FC<{ budget: Budget }> = ({ budget }) => {
  const { total } = calculateBudgetTotals(budget);
  
  return (
    <div className="mt-4 p-3 bg-gradient-to-r from-blue-500/10 to-cyan-500/5 border border-blue-500/20 rounded-xl">
      <div className="flex items-center justify-between">
        <span className="text-sm text-slate-400">Budget total</span>
        <span className="text-lg font-bold text-blue-400">
          {total.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
        </span>
      </div>
    </div>
  );
};

// Moyens Humains Section with User Assignment
interface MoyensHumainsSectionProps {
  editingTask: Task;
  setEditingTask: (task: Task) => void;
  users: { id: number; label: string }[];
}

const MoyensHumainsSection: React.FC<MoyensHumainsSectionProps> = ({
  editingTask,
  setEditingTask,
  users,
}) => {
  const moyenHumainLines = editingTask.budget?.expenseLines.filter(line => 
    line.nature?.startsWith('moyenHumain:') || (!line.nature?.includes(':') && line.nature)
  ) || [];

  const assignedUserIds = editingTask.assigneeIds || [];

  const addPersonne = () => {
    const newLine = createEmptyExpenseLine();
    setEditingTask({
      ...editingTask,
      assigneeIds: [...assignedUserIds, users[0]?.id].filter(Boolean),
      budget: {
        ...editingTask.budget!,
        expenseLines: [...(editingTask.budget?.expenseLines || []), { ...newLine, nature: 'moyenHumain:' }]
      }
    });
  };

  const updatePersonne = (id: string, userId: number | null, jours: number, cout: number) => {
    const user = users.find(u => u.id === userId);
    setEditingTask({
      ...editingTask,
      budget: {
        ...editingTask.budget!,
        expenseLines: editingTask.budget!.expenseLines.map(line =>
          line.id === id ? { ...line, unites: jours, prix: cout, nature: `moyenHumain:${user?.label || ''}` } : line
        )
      }
    });
  };

  const removePersonne = (id: string) => {
    setEditingTask({
      ...editingTask,
      budget: {
        ...editingTask.budget!,
        expenseLines: editingTask.budget!.expenseLines.filter(line => line.id !== id)
      }
    });
  };

  const moyenHumainTotal = moyenHumainLines.reduce((sum, line) => sum + calculateExpenseLineTotal(line), 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 pb-3 border-b border-slate-700">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-slate-800 rounded-lg">
            <Users className="w-5 h-5 text-emerald-400" />
          </div>
          <h3 className="text-lg font-semibold text-white">Moyen humain</h3>
        </div>
      </div>
      <div className="p-4 bg-gradient-to-r from-emerald-500/10 to-cyan-500/5 border border-emerald-500/20 rounded-xl">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-emerald-400">budgets Moyen humain</span>
          <span className="text-xl font-bold text-emerald-400">
            {moyenHumainTotal.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
          </span>
        </div>
      </div>

      <div className="space-y-3">
        <div className="grid grid-cols-12 gap-3 px-4 py-2 bg-slate-800/50 rounded-t-xl text-sm font-medium text-slate-300">
          <div className="col-span-5">Personne</div>
          <div className="col-span-3 text-center">Jours</div>
          <div className="col-span-3 text-center">Coût (€)</div>
          <div className="col-span-1"></div>
        </div>

        <div className="space-y-2">
          {moyenHumainLines.map((line) => (
            <div key={line.id} className="grid grid-cols-12 gap-3 items-center px-4 py-3 bg-slate-800/30 border border-slate-700/50 rounded-xl hover:border-slate-600 transition-all">
              <div className="col-span-5">
                <Select
                  options={users.map(user => ({ value: user.id, label: user.label }))}
                  value={users.find(u => u.label === line.nature?.replace('moyenHumain:', '')) ? { value: users.find(u => u.label === line.nature?.replace('moyenHumain:', ''))!.id, label: users.find(u => u.label === line.nature?.replace('moyenHumain:', ''))!.label } : null}
                  onChange={(selected) => {
                    const userId = (selected as SelectOption)?.value || null;
                    updatePersonne(line.id, userId, line.unites, line.prix);
                  }}
                  className="react-select-container"
                  classNamePrefix="react-select"
                  styles={{
                    control: (base) => ({
                      ...base,
                      backgroundColor: '#1e293b',
                      borderColor: '#475569',
                      color: 'white',
                      borderRadius: '8px',
                      minHeight: '36px',
                    }),
                    menu: (base) => ({ ...base, backgroundColor: '#1e293b', borderRadius: '8px' }),
                    option: (base, state) => ({
                      ...base,
                      backgroundColor: state.isSelected ? '#3b82f6' : state.isFocused ? '#334155' : 'transparent',
                      color: 'white',
                    }),
                    singleValue: (base) => ({ ...base, color: 'white' }),
                  }}
                  placeholder="Sélectionner..."
                  isClearable
                />
              </div>
              <div className="col-span-3">
                <input
                  type="number"
                  min="0"
                  value={line.unites || ''}
                  onChange={(e) => updatePersonne(line.id, null, parseFloat(e.target.value) || 0, line.prix)}
                  placeholder="0"
                  className="w-full px-3 py-2 bg-slate-800 text-white border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-center"
                />
              </div>
              <div className="col-span-3">
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={line.prix || ''}
                  onChange={(e) => updatePersonne(line.id, null, line.unites, parseFloat(e.target.value) || 0)}
                  placeholder="0.00"
                  className="w-full px-3 py-2 bg-slate-800 text-white border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-center"
                />
              </div>
              <div className="col-span-1 flex justify-end">
                <button
                  onClick={() => removePersonne(line.id)}
                  className="p-2 text-slate-400 hover:text-red-400 hover:bg-slate-700 rounded-lg transition-all"
                  title="Supprimer"
                >
                  <UserMinus className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}

          {moyenHumainLines.length === 0 && (
            <div className="text-center py-8 text-slate-500 bg-slate-800/20 border border-slate-700/50 rounded-xl">
              Aucune personne assignée. Cliquez ci-dessous pour ajouter des personnes.
            </div>
          )}
        </div>

        <button
          onClick={addPersonne}
          className="flex items-center gap-2 px-4 py-3 bg-slate-800 text-slate-300 border border-slate-600 rounded-xl hover:bg-slate-700 hover:text-white transition-all w-full justify-center"
        >
          <Plus className="w-4 h-4" />
          Ajouter une personne
        </button>
      </div>
    </div>
  );
};

// Budget Section with Expense Lines Component
interface BudgetSectionWithLinesProps {
  editingTask: Task;
  setEditingTask: (task: Task) => void;
  title: string;
  icon: React.ReactNode;
  category: string;
  addExpenseLine: () => void;
  updateExpenseLine: (id: string, updates: Partial<{ nature: string; unites: number; prix: number; }>) => void;
  removeExpenseLine: (id: string) => void;
}

const BudgetSectionWithLines: React.FC<BudgetSectionWithLinesProps> = ({
  editingTask,
  title,
  icon,
  category,
  addExpenseLine,
  updateExpenseLine,
  removeExpenseLine,
}) => {
  const expenseLines = editingTask.budget?.expenseLines.filter(line => 
    line.nature?.startsWith(category + ':') || (!line.nature?.includes(':') && category === 'moyenHumain')
  ) || [];

  const categoryTotal = expenseLines.reduce((sum, line) => sum + calculateExpenseLineTotal(line), 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 pb-3 border-b border-slate-700">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-slate-800 rounded-lg">{icon}</div>
          <h3 className="text-lg font-semibold text-white">{title}</h3>
        </div>
      </div>
      <div className="p-4 bg-gradient-to-r from-blue-500/10 to-cyan-500/5 border border-blue-500/20 rounded-xl">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-blue-400">budgets {title}</span>
          <span className="text-xl font-bold text-white">
            {categoryTotal.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
          </span>
        </div>
      </div>

      <div className="space-y-3">
        <div className="grid grid-cols-12 gap-3 px-4 py-2 bg-slate-800/50 rounded-t-xl text-sm font-medium text-slate-300">
          <div className="col-span-6">Nature / name</div>
          <div className="col-span-3 text-center">Unité</div>
          <div className="col-span-3 text-right">Prix (€)</div>
        </div>

        <div className="space-y-2">
          {expenseLines.map((line) => (
            <div key={line.id} className="grid grid-cols-12 gap-3 items-center px-4 py-3 bg-slate-800/30 border border-slate-700/50 rounded-xl hover:border-slate-600 transition-all">
              <div className="col-span-6">
                <input
                  type="text"
                  value={line.nature.replace(category + ':', '')}
                  onChange={(e) => updateExpenseLine(line.id, { nature: `${category}:${e.target.value}` })}
                  placeholder="Nature / name..."
                  className="w-full px-3 py-2 bg-slate-800 text-white border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                />
              </div>
              <div className="col-span-3">
                <input
                  type="number"
                  min="0"
                  value={line.unites || ''}
                  onChange={(e) => updateExpenseLine(line.id, { unites: parseFloat(e.target.value) || 0 })}
                  placeholder="0"
                  className="w-full px-3 py-2 bg-slate-800 text-white border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-center"
                />
              </div>
              <div className="col-span-2">
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={line.prix || ''}
                  onChange={(e) => updateExpenseLine(line.id, { prix: parseFloat(e.target.value) || 0 })}
                  placeholder="0.00"
                  className="w-full px-3 py-2 bg-slate-800 text-white border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-right"
                />
              </div>
              <div className="col-span-1 flex justify-end">
                <button
                  onClick={() => removeExpenseLine(line.id)}
                  className="p-2 text-slate-400 hover:text-red-400 hover:bg-slate-700 rounded-lg transition-all"
                  title="Supprimer la ligne"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}

          {expenseLines.length === 0 && (
            <div className="text-center py-8 text-slate-500 bg-slate-800/20 border border-slate-700/50 rounded-xl">
              Aucune dépense ajoutée. Cliquez ci-dessous pour ajouter des lignes de dépenses.
            </div>
          )}
        </div>

        <button
          onClick={addExpenseLine}
          className="flex items-center gap-2 px-4 py-3 bg-slate-800 text-slate-300 border border-slate-600 rounded-xl hover:bg-slate-700 hover:text-white transition-all w-full justify-center"
        >
          <Plus className="w-4 h-4" />
          Ajouter une ligne de dépense
        </button>
      </div>
    </div>
  );
};

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
  projectId: number | null;
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
  projectId, // eslint-disable-line @typescript-eslint/no-unused-vars
  data,
}) => {
  if (!showEditor || !editingTask) return null;

  const tabs: { id: EditorTab; label: string; icon: React.ReactNode; color: string; category: string }[] = [
    { id: 'general', label: 'Général', icon: <Settings className="w-4 h-4" />, color: 'text-blue-400', category: '' },
    { id: 'budgets', label: 'Budgets', icon: <CreditCard className="w-4 h-4" />, color: 'text-cyan-400', category: 'budgets' },
    { id: 'moyenHumain', label: 'Moyen humain', icon: <Users className="w-4 h-4" />, color: 'text-emerald-400', category: 'moyenHumain' },
    { id: 'amenagements', label: 'Aménagements', icon: <Target className="w-4 h-4" />, color: 'text-purple-400', category: 'amenagements' },
    { id: 'equipementsPedagogiques', label: 'Équipements pédagogiques', icon: <FileText className="w-4 h-4" />, color: 'text-pink-400', category: 'equipements' },
    { id: 'prestations', label: 'Prestations', icon: <DollarSign className="w-4 h-4" />, color: 'text-cyan-400', category: 'prestations' },
    { id: 'communications', label: 'Communications', icon: <CheckCircle2 className="w-4 h-4" />, color: 'text-orange-400', category: 'communications' },
  ];

  const getTypeStyles = (type: string) => {
    switch (type) {
      case 'milestone':
        return { bg: 'bg-purple-500/20', text: 'text-purple-400', border: 'border-purple-500/30', icon: '◆' };
      case 'project':
        return { bg: 'bg-emerald-500/20', text: 'text-emerald-400', border: 'border-emerald-500/30', icon: '■' };
      default:
        return { bg: 'bg-blue-500/20', text: 'text-blue-400', border: 'border-blue-500/30', icon: '○' };
    }
  };

  const typeStyles = getTypeStyles(editingTask.type);

  const addExpenseLine = (category: string) => {
    const newLine = { ...createEmptyExpenseLine(), nature: `${category}:` };
    setEditingTask({
      ...editingTask,
      budget: {
        ...editingTask.budget!,
        expenseLines: [...(editingTask.budget?.expenseLines || []), newLine]
      }
    });
  };

  const updateExpenseLine = (id: string, updates: Partial<{ nature: string; unites: number; prix: number }>) => {
    setEditingTask({
      ...editingTask,
      budget: {
        ...editingTask.budget!,
        expenseLines: editingTask.budget!.expenseLines.map(line =>
          line.id === id ? { ...line, ...updates } : line
        )
      }
    });
  };

  const removeExpenseLine = (id: string) => {
    setEditingTask({
      ...editingTask,
      budget: {
        ...editingTask.budget!,
        expenseLines: editingTask.budget!.expenseLines.filter(line => line.id !== id)
      }
    });
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="relative bg-gradient-to-r from-slate-800 to-slate-800/50 p-6 border-b border-slate-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-xl ${typeStyles.bg} ${typeStyles.border} border`}>
                <span className={`text-xl ${typeStyles.text}`}>{typeStyles.icon}</span>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">Modifier la tâche</h2>
                <p className="text-sm text-slate-400">Configurer les détails et le budget de la tâche</p>
              </div>
            </div>
            <button
              onClick={() => {
                setShowEditor(false);
                setEditingTask(null);
              }}
              className="p-2 hover:bg-slate-700 rounded-xl transition-colors group"
            >
              <X className="w-5 h-5 text-slate-400 group-hover:text-white transition-colors" />
            </button>
          </div>
        </div>
        
        {/* Tabs */}
        <div className="flex border-b border-slate-700 overflow-x-auto bg-slate-800/30 px-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setEditorTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-3 font-medium transition-all whitespace-nowrap border-b-2 ${
                editorTab === tab.id 
                  ? `${tab.color} border-current opacity-100` 
                  : 'text-slate-400 hover:text-white border-transparent opacity-60 hover:opacity-100'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
        
        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
          {editorTab === 'general' ? (
            <div className="space-y-6">
              {/* Livrables Section */}
              <LivrablesSection
                editingTask={editingTask}
                setEditingTask={setEditingTask}
                livrables={livrables}
                showAddLivrable={showAddLivrable}
                setShowAddLivrable={setShowAddLivrable}
                newLivrableLabel={newLivrableLabel}
                setNewLivrableLabel={setNewLivrableLabel}
                newLivrableDescription={newLivrableDescription}
                setNewLivrableDescription={setNewLivrableDescription}
                handleAddLivrable={handleAddLivrable}
              />
              
              {/* Budget Total Preview */}
              <BudgetTotalPreview budget={editingTask.budget || createEmptyBudget()} />

              {/* Task Name */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-300 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-slate-400" />
                  Nom de la tâche
                </label>
                <input
                  type="text"
                  value={editingTask.text}
                  onChange={(e) => setEditingTask({ ...editingTask, text: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-800 text-white border border-slate-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="Entrez le nom de la tâche..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Type */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-slate-300 flex items-center gap-2">
                    <Settings className="w-4 h-4 text-slate-400" />
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
                    className="w-full px-4 py-3 bg-slate-800 text-white border border-slate-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all cursor-pointer"
                  >
                    <option value="task">Tâche</option>
                    <option value="milestone">Jalon</option>
                    <option value="project">Projet</option>
                  </select>
                </div>

                {/* Color Picker */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-slate-300 flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full" style={{ backgroundColor: editingTask.color || '#3b82f6' }} />
                    Couleur
                  </label>
                  <div className="flex gap-2">
                    {TASK_COLORS.map((color) => (
                      <button
                        key={color.value}
                        type="button"
                        onClick={() => setEditingTask({ ...editingTask, color: color.value })}
                        className={`w-8 h-8 rounded-full transition-all transform hover:scale-110 ${
                          editingTask.color === color.value 
                            ? 'ring-2 ring-white ring-offset-2 ring-offset-slate-800 scale-110' 
                            : ''
                        }`}
                        style={{ backgroundColor: color.value }}
                        title={color.name}
                      />
                    ))}
                  </div>
                </div>

                {/* Progress */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-slate-300 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-slate-400" />
                    Progression: <span className="text-blue-400 font-bold">{editingTask.progress}%</span>
                  </label>
                  <div className="relative pt-2">
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={editingTask.progress}
                      onChange={(e) => setEditingTask({ ...editingTask, progress: parseInt(e.target.value) })}
                      className="w-full h-2 bg-slate-700 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:bg-blue-500 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:shadow-lg [&::-webkit-slider-thumb]:transition-transform hover:[&::-webkit-slider-thumb]:scale-110"
                    />
                    <div className="flex justify-between text-xs text-slate-500 mt-1">
                      <span>0%</span>
                      <span>25%</span>
                      <span>50%</span>
                      <span>75%</span>
                      <span>100%</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Dates */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-slate-300 flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-slate-400" />
                    Date de début
                  </label>
                  <input
                    type="date"
                    value={new Date(editingTask.start).toISOString().split('T')[0]}
                    onChange={(e) => {
                      const newStart = new Date(e.target.value);
                      setEditingTask({ ...editingTask, start: newStart, end: editingTask.type === 'milestone' ? newStart : editingTask.end });
                    }}
                    className="w-full px-4 py-3 bg-slate-800 text-white border border-slate-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                  />
                </div>
                {editingTask.type !== 'milestone' && (
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-slate-300 flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-slate-400" />
                      Date de fin
                    </label>
                    <input
                      type="date"
                      value={new Date(editingTask.end).toISOString().split('T')[0]}
                      onChange={(e) => setEditingTask({ ...editingTask, end: new Date(e.target.value) })}
                      className="w-full px-4 py-3 bg-slate-800 text-white border border-slate-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                    />
                  </div>
                )}
              </div>

              {/* Details */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-300 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-slate-400" />
                  Details
                </label>
                <textarea
                  value={editingTask.details}
                  onChange={(e) => setEditingTask({ ...editingTask, details: e.target.value })}
                  rows={4}
                  className="w-full px-4 py-3 bg-slate-800 text-white border border-slate-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all resize-none"
                  placeholder="Enter task details..."
                />
              </div>

              {/* Assignees */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-300 flex items-center gap-2">
                  <Users className="w-4 h-4 text-slate-400" />
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
                      backgroundColor: '#1e293b',
                      borderColor: '#475569',
                      color: 'white',
                      borderRadius: '12px',
                      padding: '4px',
                    }),
                    menu: (base) => ({
                      ...base,
                      backgroundColor: '#1e293b',
                      borderRadius: '12px',
                    }),
                    option: (base, state) => ({
                      ...base,
                      backgroundColor: state.isSelected ? '#3b82f6' : state.isFocused ? '#334155' : 'transparent',
                      color: 'white',
                      padding: '10px 12px',
                    }),
                    singleValue: (base) => ({
                      ...base,
                      color: 'white',
                    }),
                    multiValue: (base) => ({
                      ...base,
                      backgroundColor: '#1e40af',
                      borderRadius: '8px',
                    }),
                    multiValueLabel: (base) => ({
                      ...base,
                      color: 'white',
                    }),
                  }}
                  placeholder="Sélectionnez les responsables..."
                />
              </div>

              {/* Goal */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-300 flex items-center gap-2">
                  <Target className="w-4 h-4 text-slate-400" />
                  Objectif
                  {editingTask.livrableIds && editingTask.livrableIds.length > 0 && editingTask.goal && editingTask.goal.trim() ? (
                    <span className="flex items-center gap-1 text-xs bg-emerald-500/20 text-emerald-400 px-2 py-1 rounded-full border border-emerald-500/30">
                      <CheckCircle2 className="w-3 h-3" />
                      Auto-complétion activée
                    </span>
                  ) : (
                    <span className="text-xs text-slate-500">(obligatoire avec livrable pour 100% de complétion)</span>
                  )}
                </label>
                <textarea
                  value={editingTask.goal || ''}
                  onChange={(e) => setEditingTask({ ...editingTask, goal: e.target.value })}
                  rows={4}
                  className="w-full px-4 py-3 bg-slate-800 text-white border border-slate-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all resize-none"
                  placeholder="Describe the goal that must be achieved before this task can be marked as 100% complete..."
                />
              </div>
            </div>
          ) : editorTab === 'budgets' ? (
            <div className="space-y-6">
              {/* Budget Total */}
              <BudgetTotalPreview budget={editingTask.budget || createEmptyBudget()} />
              
              {/* Moyen Humain Summary */}
              <div className="p-4 bg-gradient-to-r from-emerald-500/10 to-cyan-500/5 border border-emerald-500/20 rounded-xl">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-emerald-400">budgets Moyen humain</span>
                  <span className="text-lg font-bold text-emerald-400">
                    {calculateExpenseLinesTotal(getExpenseLinesByCategory(editingTask.budget?.expenseLines || [], 'moyenHumain')).toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
                  </span>
                </div>
              </div>
              
              {/* Aménagements Summary */}
              <div className="p-4 bg-gradient-to-r from-purple-500/10 to-cyan-500/5 border border-purple-500/20 rounded-xl">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-purple-400">budgets Aménagements</span>
                  <span className="text-lg font-bold text-purple-400">
                    {calculateExpenseLinesTotal(getExpenseLinesByCategory(editingTask.budget?.expenseLines || [], 'amenagements')).toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
                  </span>
                </div>
              </div>
              
              {/* Équipements Summary */}
              <div className="p-4 bg-gradient-to-r from-pink-500/10 to-cyan-500/5 border border-pink-500/20 rounded-xl">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-pink-400">budgets Équipements pédagogiques</span>
                  <span className="text-lg font-bold text-pink-400">
                    {calculateExpenseLinesTotal(getExpenseLinesByCategory(editingTask.budget?.expenseLines || [], 'equipements')).toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
                  </span>
                </div>
              </div>
              
              {/* Prestations Summary */}
              <div className="p-4 bg-gradient-to-r from-cyan-500/10 to-blue-500/5 border border-cyan-500/20 rounded-xl">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-cyan-400">budgets Prestations</span>
                  <span className="text-lg font-bold text-cyan-400">
                    {calculateExpenseLinesTotal(getExpenseLinesByCategory(editingTask.budget?.expenseLines || [], 'prestations')).toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
                  </span>
                </div>
              </div>
              
              {/* Communications Summary */}
              <div className="p-4 bg-gradient-to-r from-orange-500/10 to-cyan-500/5 border border-orange-500/20 rounded-xl">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-orange-400">budgets Communications</span>
                  <span className="text-lg font-bold text-orange-400">
                    {calculateExpenseLinesTotal(getExpenseLinesByCategory(editingTask.budget?.expenseLines || [], 'communications')).toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
                  </span>
                </div>
              </div>
            </div>
          ) : editorTab === 'moyenHumain' ? (
            <MoyensHumainsSection
              editingTask={editingTask}
              setEditingTask={setEditingTask}
              users={data.users}
            />
          ) : editorTab === 'amenagements' ? (
            <BudgetSectionWithLines
              editingTask={editingTask}
              setEditingTask={setEditingTask}
              title="Aménagements"
              icon={<Target className="w-5 h-5 text-purple-400" />}
              category="amenagements"
              addExpenseLine={() => addExpenseLine('amenagements')}
              updateExpenseLine={updateExpenseLine}
              removeExpenseLine={removeExpenseLine}
            />
          ) : editorTab === 'equipementsPedagogiques' ? (
            <BudgetSectionWithLines
              editingTask={editingTask}
              setEditingTask={setEditingTask}
              title="Équipements pédagogiques"
              icon={<FileText className="w-5 h-5 text-pink-400" />}
              category="equipements"
              addExpenseLine={() => addExpenseLine('equipements')}
              updateExpenseLine={updateExpenseLine}
              removeExpenseLine={removeExpenseLine}
            />
          ) : editorTab === 'prestations' ? (
            <BudgetSectionWithLines
              editingTask={editingTask}
              setEditingTask={setEditingTask}
              title="Prestations"
              icon={<DollarSign className="w-5 h-5 text-cyan-400" />}
              category="prestations"
              addExpenseLine={() => addExpenseLine('prestations')}
              updateExpenseLine={updateExpenseLine}
              removeExpenseLine={removeExpenseLine}
            />
          ) : editorTab === 'communications' ? (
            <BudgetSectionWithLines
              editingTask={editingTask}
              setEditingTask={setEditingTask}
              title="Communications"
              icon={<CheckCircle2 className="w-5 h-5 text-orange-400" />}
              category="communications"
              addExpenseLine={() => addExpenseLine('communications')}
              updateExpenseLine={updateExpenseLine}
              removeExpenseLine={removeExpenseLine}
            />
          ) : null}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-slate-700 bg-slate-800/30 flex justify-between items-center">
          <button
            onClick={() => {
              setShowEditor(false);
              setEditingTask(null);
            }}
            className="px-6 py-3 bg-slate-800 text-slate-300 rounded-xl hover:bg-slate-700 hover:text-white transition-all font-medium"
          >
            Annuler
          </button>
          <div className="flex gap-3">
            <button
              onClick={() => deleteTask(editingTask.id)}
              className="flex items-center gap-2 px-6 py-3 bg-red-500/20 text-red-400 border border-red-500/30 rounded-xl hover:bg-red-500/30 transition-all font-medium"
            >
              <Trash2 className="w-4 h-4" />
              Supprimer
            </button>
            <button
              onClick={updateTask}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all font-medium shadow-lg shadow-blue-500/25"
            >
              <Save className="w-4 h-4" />
              Enregistrer les modifications
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
