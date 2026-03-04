"use client";

import React, { useMemo, useState } from 'react';
import { 
  ResponsiveContainer, 
  Tooltip as RechartsTooltip,
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid,
  AreaChart,
  Area
} from 'recharts';
import { 
  X, 
  TrendingUp, 
  BarChart3, 
  Calendar, 
  DollarSign, 
  Target,
  Plus,
  Trash2,
  Edit3,
  Calculator,
  AlertCircle,
  ArrowRight,
  RefreshCw
} from 'lucide-react';
import { Task } from '../../data';
import { 
  splitBudgetByYears, 
  getTotalBudget, 
  getBudgetByCategoryFromTasks,
  YearlyBudgetBreakdown 
} from '../utils/budgetUtils';

interface BudgetPrevisionnelProps {
  tasks: Task[];
  onClose: () => void;
  customBudgetTypes?: { id: string; name: string }[];
}

// Modern color palette
const COLORS = [
  '#6366f1', // Indigo
  '#8b5cf6', // Violet
  '#ec4899', // Pink
  '#f43f5e', // Rose
  '#f97316', // Orange
  '#eab308', // Yellow
  '#22c55e', // Green
  '#14b8a6', // Teal
  '#06b6d4', // Cyan
];

const CATEGORY_COLORS: Record<string, string> = {
  'Moyen humain': '#10b981',
  'Stagiaires': '#6b7280',
  'Aménagements': '#a855f7',
  'Équipements pédagogiques': '#ec4899',
  'Prestations': '#06b6d4',
  'Frais de déplacement': '#84cc16',
  'Autres prestations': '#14b8a6',
  'Communications': '#f97316',
  'Lignes de dépenses': '#6366f1',
};

// Generate colors for custom budget types
const getCustomBudgetTypeColors = (customTypes: { id: string; name: string }[]): Record<string, string> => {
  const colors: Record<string, string> = {};
  const customColors = ['#f59e0b', '#3b82f6', '#10b981', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316', '#6366f1'];
  customTypes.forEach((type, index) => {
    colors[type.name] = customColors[index % customColors.length];
  });
  return colors;
};

const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(value);
};

// Types for forecast items
interface ForecastItem {
  id: string;
  category: string;
  description: string;
  amount: number;
  year: number;
  quarter?: string;
  month?: number;
  isManual: boolean;
}

// Type for granularity selection
type Granularity = 'yearly' | 'quarterly' | 'monthly';

interface ForecastScenario {
  id: string;
  name: string;
  items: ForecastItem[];
  growthRate: number;
}

// Generate unique ID
const generateId = () => Math.random().toString(36).substr(2, 9);

// Stats Card Component
const StatsCard: React.FC<{
  title: string;
  value: string;
  icon: React.ReactNode;
  color: string;
  trend?: string;
  subtitle?: string;
}> = ({ title, value, icon, color, trend, subtitle }) => (
  <div className="bg-gradient-to-br from-white to-slate-50 rounded-2xl p-6 shadow-lg border border-slate-100 hover:shadow-xl transition-all duration-300">
    <div className="flex items-start justify-between">
      <div>
        <p className="text-sm font-medium text-slate-500 mb-1">{title}</p>
        <p className="text-2xl font-bold" style={{ color }}>{value}</p>
        {trend && (
          <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
            <TrendingUp className="w-3 h-3" />
            {trend}
          </p>
        )}
        {subtitle && (
          <p className="text-xs text-slate-400 mt-1">{subtitle}</p>
        )}
      </div>
      <div className="p-3 rounded-xl" style={{ backgroundColor: `${color}15` }}>
        {icon}
      </div>
    </div>
  </div>
);

// Forecast Item Row Component
const ForecastItemRow: React.FC<{
  item: ForecastItem;
  onEdit: (item: ForecastItem) => void;
  onDelete: (id: string) => void;
  color: string;
}> = ({ item, onEdit, onDelete, color }) => (
  <div className="flex items-center justify-between py-3 px-4 bg-white rounded-lg border border-slate-100 hover:border-slate-200 transition-colors">
    <div className="flex items-center gap-4">
      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color }}></div>
      <div>
        <p className="font-medium text-slate-800">{item.description}</p>
        <p className="text-xs text-slate-500">{item.category} • {item.year} {item.quarter ? `- ${item.quarter}` : ''} {item.month ? `- ${['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc'][item.month - 1]}` : ''}</p>
      </div>
    </div>
    <div className="flex items-center gap-4">
      <span className="font-semibold text-slate-800">{formatCurrency(item.amount)}</span>
      <div className="flex gap-1">
        <button 
          onClick={() => onEdit(item)}
          className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          title="Modifier"
        >
          <Edit3 className="w-4 h-4 text-slate-400" />
        </button>
        <button 
          onClick={() => onDelete(item.id)}
          className="p-2 hover:bg-red-50 rounded-lg transition-colors"
          title="Supprimer"
        >
          <Trash2 className="w-4 h-4 text-red-400" />
        </button>
      </div>
    </div>
  </div>
);

// Add/Edit Forecast Modal
const ForecastItemModal: React.FC<{
  isOpen: boolean;
  item?: ForecastItem | null;
  onSave: (item: ForecastItem) => void;
  onClose: () => void;
  availableCategories: string[];
  existingYears: number[];
}> = ({ isOpen: isModalOpen, item, onSave, onClose, availableCategories, existingYears }) => {
  const [description, setDescription] = useState(item?.description || '');
  const [category, setCategory] = useState(item?.category || availableCategories[0] || 'Moyen humain');
  const [amount, setAmount] = useState(item?.amount?.toString() || '');
  const [year, setYear] = useState(item?.year || existingYears[0] || new Date().getFullYear());
  const [quarter, setQuarter] = useState(item?.quarter || '');
  const [month, setMonth] = useState(item?.month || 0);

  if (!isModalOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newItem: ForecastItem = {
      id: item?.id || generateId(),
      description,
      category,
      amount: parseFloat(amount) || 0,
      year,
      quarter: quarter || undefined,
      month: month > 0 ? month : undefined,
      isManual: true
    };
    onSave(newItem);
    onClose();
  };

  const quarters = ['T1', 'T2', 'T3', 'T4'];
  const months = [
    { value: 1, label: 'Janvier' },
    { value: 2, label: 'Février' },
    { value: 3, label: 'Mars' },
    { value: 4, label: 'Avril' },
    { value: 5, label: 'Mai' },
    { value: 6, label: 'Juin' },
    { value: 7, label: 'Juillet' },
    { value: 8, label: 'Août' },
    { value: 9, label: 'Septembre' },
    { value: 10, label: 'Octobre' },
    { value: 11, label: 'Novembre' },
    { value: 12, label: 'Décembre' }
  ];
  const maxYear = existingYears.length > 0 ? Math.max(...existingYears) + 5 : new Date().getFullYear() + 5;
  const minYear = existingYears.length > 0 ? Math.min(...existingYears) : new Date().getFullYear();
  const futureYears = [];
  for (let y = minYear; y <= maxYear; y++) {
    futureYears.push(y);
  }

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        <div className="p-6 border-b border-slate-100">
          <h3 className="text-xl font-bold text-slate-800">
            {item ? 'Modifier la prévision' : 'Ajouter une prévision'}
          </h3>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Description</label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all"
              placeholder="Description de la dépense"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Catégorie</label>
            <input
              type="text"
              list="category-options"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all"
              placeholder="Entrez une catégorie"
            />
            <datalist id="category-options">
              {availableCategories.map(cat => (
                <option key={cat} value={cat} />
              ))}
            </datalist>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Montant (€)</label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all"
              placeholder="0"
              min="0"
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Année</label>
              <select
                value={year}
                onChange={(e) => setYear(parseInt(e.target.value))}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all"
              >
                {futureYears.map(y => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Trimestre (optionnel)</label>
              <select
                value={quarter}
                onChange={(e) => setQuarter(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all"
              >
                <option value="">Non spécifié</option>
                {quarters.map(q => (
                  <option key={q} value={q}>{q}</option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Mois (optionnel)</label>
            <select
              value={month}
              onChange={(e) => setMonth(parseInt(e.target.value))}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all"
            >
              <option value={0}>Non spécifié</option>
              {months.map(m => (
                <option key={m.value} value={m.value}>{m.label}</option>
              ))}
            </select>
          </div>
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 rounded-xl border border-slate-200 text-slate-600 font-medium hover:bg-slate-50 transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-3 rounded-xl bg-indigo-600 text-white font-medium hover:bg-indigo-700 transition-colors"
            >
              {item ? 'Modifier' : 'Ajouter'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Scenario Selector Component
const ScenarioSelector: React.FC<{
  scenarios: ForecastScenario[];
  currentScenarioId: string;
  onSelect: (id: string) => void;
  onCreate: () => void;
  onDelete: (id: string) => void;
}> = ({ scenarios, currentScenarioId, onSelect, onCreate, onDelete }) => (
  <div className="flex items-center gap-2">
    <select
      value={currentScenarioId}
      onChange={(e) => onSelect(e.target.value)}
      className="px-4 py-2 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none bg-white"
    >
      {scenarios.map(scenario => (
        <option key={scenario.id} value={scenario.id}>{scenario.name}</option>
      ))}
    </select>
    <button
      onClick={onCreate}
      className="p-2 bg-indigo-100 text-indigo-600 rounded-lg hover:bg-indigo-200 transition-colors"
      title="Créer un nouveau scénario"
    >
      <Plus className="w-5 h-5" />
    </button>
    {scenarios.length > 1 && (
      <button
        onClick={() => onDelete(currentScenarioId)}
        className="p-2 bg-red-50 text-red-500 rounded-lg hover:bg-red-100 transition-colors"
        title="Supprimer ce scénario"
      >
        <Trash2 className="w-5 h-5" />
      </button>
    )}
  </div>
);

// Quarterly View Component
const QuarterlyView: React.FC<{
  items: ForecastItem[];
  allColors: Record<string, string>;
  onEdit: (item: ForecastItem) => void;
  onDelete: (id: string) => void;
  formatCurrency: (value: number) => string;
}> = ({ items, allColors, onEdit, onDelete, formatCurrency }) => {
  const quarterLabels: Record<string, string> = { T1: 'T1 (Jan-Mar)', T2: 'T2 (Avr-Juin)', T3: 'T3 (Juil-Sep)', T4: 'T4 (Oct-Dec)' };
  
  const itemsByQuarter = useMemo(() => {
    const grouped: Record<string, ForecastItem[]> = { T1: [], T2: [], T3: [], T4: [] };
    items.forEach(item => {
      const q = item.quarter || 'T1';
      if (!grouped[q]) grouped[q] = [];
      grouped[q].push(item);
    });
    return grouped;
  }, [items]);

  return (
    <div className="space-y-6">
      {Object.entries(itemsByQuarter).map(([quarter, quarterItems]) => (
        <div key={quarter} className="bg-white rounded-xl p-4 border border-slate-200">
          <h4 className="font-bold text-slate-800 mb-3 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-indigo-600" />
            {quarterLabels[quarter] || quarter}
            <span className="text-sm font-normal text-slate-500">
              ({formatCurrency(quarterItems.reduce((sum, i) => sum + i.amount, 0))})
            </span>
          </h4>
          <div className="space-y-2">
            {quarterItems.map(item => (
              <ForecastItemRow
                key={item.id}
                item={item}
                onEdit={onEdit}
                onDelete={onDelete}
                color={allColors[item.category] || '#8884d8'}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

// Monthly View Component
const MonthlyView: React.FC<{
  items: ForecastItem[];
  allColors: Record<string, string>;
  onEdit: (item: ForecastItem) => void;
  onDelete: (id: string) => void;
  formatCurrency: (value: number) => string;
}> = ({ items, allColors, onEdit, onDelete, formatCurrency }) => {
  const monthLabels = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];
  
  const itemsByMonth = useMemo(() => {
    const grouped: Record<number, ForecastItem[]> = {};
    for (let i = 1; i <= 12; i++) grouped[i] = [];
    items.forEach(item => {
      const m = item.month || 1;
      if (!grouped[m]) grouped[m] = [];
      grouped[m].push(item);
    });
    return grouped;
  }, [items]);

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {Object.entries(itemsByMonth).map(([month, monthItems]) => (
        <div key={month} className="bg-white rounded-xl p-4 border border-slate-200">
          <h4 className="font-bold text-slate-800 mb-3 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-indigo-600" />
            {monthLabels[parseInt(month) - 1]}
          </h4>
          <div className="space-y-2">
            {monthItems.length > 0 ? (
              monthItems.map(item => (
                <ForecastItemRow
                  key={item.id}
                  item={item}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  color={allColors[item.category] || '#8884d8'}
                />
              ))
            ) : (
              <p className="text-sm text-slate-400 italic">Aucune prévision</p>
            )}
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100">
            <span className="text-sm font-semibold text-slate-700">
              Total: {formatCurrency(monthItems.reduce((sum, i) => sum + i.amount, 0))}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
};


// Overview Tab Component
const OverviewTab: React.FC<{
  yearlyData: YearlyBudgetBreakdown[];
  forecastByYear: { year: number; budget: number; forecast: number }[];
  totalBudget: number;
  totalForecast: number;
  comparisonData: { name: string; year: number; actual: number; forecast: number; difference: number }[];
  COLORS: string[];
  formatCurrency: (value: number) => string;
  renderLegend: (props: any) => React.ReactElement | null;
}> = ({ yearlyData, forecastByYear, totalBudget, totalForecast, comparisonData, formatCurrency, renderLegend }) => {
  const [chartType, setChartType] = useState<'bar' | 'area'>('bar');

  // Prepare data for charts
  const combinedData = useMemo(() => {
    const allYears = new Map<number, { actual: number; forecast: number }>();
    
    yearlyData.forEach(item => {
      allYears.set(item.year, { actual: item.budget, forecast: 0 });
    });
    
    forecastByYear.forEach(item => {
      const existing = allYears.get(item.year);
      if (existing) {
        existing.forecast = item.forecast;
      } else {
        allYears.set(item.year, { actual: 0, forecast: item.forecast });
      }
    });
    
    return Array.from(allYears.entries())
      .map(([year, data]) => ({
        name: year.toString(),
        year,
        Réel: data.actual,
        Prévision: data.forecast
      }))
      .sort((a, b) => a.year - b.year);
  }, [yearlyData, forecastByYear]);

  return (
    <div className="flex-1 p-6 overflow-y-auto bg-white">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-slate-800">
          Vue d'ensemble Budgétaire
        </h3>
        <div className="flex gap-2 bg-slate-100 p-1 rounded-xl">
          <button
            onClick={() => setChartType('bar')}
            className={`p-2 rounded-lg transition-all ${chartType === 'bar' ? 'bg-white text-amber-600 shadow-md' : 'text-slate-500 hover:text-slate-700'}`}
            title="Barres"
          >
            <BarChart3 className="w-5 h-5" />
          </button>
          <button
            onClick={() => setChartType('area')}
            className={`p-2 rounded-lg transition-all ${chartType === 'area' ? 'bg-white text-amber-600 shadow-md' : 'text-slate-500 hover:text-slate-700'}`}
            title="Area"
          >
            <TrendingUp className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Combined Chart */}
      <div className="bg-white rounded-2xl p-6 shadow-lg border border-slate-100 mb-6">
        <h4 className="text-lg font-semibold text-slate-700 mb-4">
          Budget Réel vs Prévisionnel
        </h4>
        {chartType === 'bar' ? (
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={combinedData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis 
                dataKey="name" 
                tick={{ fontSize: 12, fill: '#64748b' }}
              />
              <YAxis 
                tickFormatter={formatCurrency}
                tick={{ fontSize: 11, fill: '#64748b' }}
              />
              <RechartsTooltip 
                formatter={(value: number) => formatCurrency(value)}
                contentStyle={{ 
                  backgroundColor: 'white', 
                  border: '1px solid #e2e8f0',
                  borderRadius: '12px',
                  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                }}
              />
              {renderLegend({ payload: [
                { value: 'Réel', color: '#10b981' },
                { value: 'Prévision', color: '#f59e0b' }
              ]})}
              <Bar dataKey="Réel" fill="#10b981" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Prévision" fill="#f59e0b" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <ResponsiveContainer width="100%" height={400}>
            <AreaChart data={combinedData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
              <defs>
                <linearGradient id="colorActual" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorForecast" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis 
                dataKey="name" 
                tick={{ fontSize: 12, fill: '#64748b' }}
              />
              <YAxis 
                tickFormatter={formatCurrency}
                tick={{ fontSize: 11, fill: '#64748b' }}
              />
              <RechartsTooltip 
                formatter={(value: number) => formatCurrency(value)}
                contentStyle={{ 
                  backgroundColor: 'white', 
                  border: '1px solid #e2e8f0',
                  borderRadius: '12px',
                  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                }}
              />
              {renderLegend({ payload: [
                { value: 'Réel', color: '#10b981' },
                { value: 'Prévision', color: '#f59e0b' }
              ]})}
              <Area 
                type="monotone" 
                dataKey="Réel" 
                stroke="#10b981" 
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#colorActual)"
              />
              <Area 
                type="monotone" 
                dataKey="Prévision" 
                stroke="#f59e0b" 
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#colorForecast)"
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Summary Table */}
      <div className="bg-white rounded-2xl p-6 shadow-lg border border-slate-100">
        <h4 className="text-lg font-semibold text-slate-700 mb-4">
          Détail par Année
        </h4>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="text-left py-3 px-4 font-semibold text-slate-600 text-sm">Année</th>
                <th className="text-right py-3 px-4 font-semibold text-slate-600 text-sm">Réel</th>
                <th className="text-right py-3 px-4 font-semibold text-slate-600 text-sm">Prévision</th>
                <th className="text-right py-3 px-4 font-semibold text-slate-600 text-sm">Écart</th>
                <th className="text-right py-3 px-4 font-semibold text-slate-600 text-sm">Statut</th>
              </tr>
            </thead>
            <tbody>
              {comparisonData.map((row, idx) => (
                <tr key={idx} className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="py-3 px-4 font-medium text-slate-800">{row.name}</td>
                  <td className="py-3 px-4 text-right font-semibold text-emerald-600">{formatCurrency(row.actual)}</td>
                  <td className="py-3 px-4 text-right font-semibold text-amber-600">{formatCurrency(row.forecast)}</td>
                  <td className={`py-3 px-4 text-right font-semibold ${row.difference > 0 ? 'text-red-500' : row.difference < 0 ? 'text-blue-500' : 'text-slate-600'}`}>
                    {row.difference !== 0 ? formatCurrency(row.difference) : '-'}
                  </td>
                  <td className="py-3 px-4 text-right">
                    {row.actual > 0 && row.forecast > 0 ? (
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        Math.abs(row.difference) / row.forecast < 0.1 
                          ? 'bg-green-100 text-green-700' 
                          : Math.abs(row.difference) / row.forecast < 0.25
                          ? 'bg-yellow-100 text-yellow-700'
                          : 'bg-red-100 text-red-700'
                      }`}>
                        {Math.abs(row.difference) / row.forecast < 0.1 ? 'Excellent' : Math.abs(row.difference) / row.forecast < 0.25 ? 'Correct' : 'Écart'}
                      </span>
                    ) : row.actual > 0 ? (
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700">
                        Réel
                      </span>
                    ) : (
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-700">
                        Prévision
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-slate-50">
                <td className="py-4 px-4 font-bold text-slate-800">Total</td>
                <td className="py-4 px-4 text-right font-bold text-emerald-600">{formatCurrency(totalBudget)}</td>
                <td className="py-4 px-4 text-right font-bold text-amber-600">{formatCurrency(totalForecast)}</td>
                <td className="py-4 px-4 text-right font-bold text-slate-800">{formatCurrency(totalBudget - totalForecast)}</td>
                <td className="py-4 px-4"></td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
};

// Forecast Tab Component
const ForecastTab: React.FC<{
  forecastItems: ForecastItem[];
  currentScenario: ForecastScenario;
  scenarios: ForecastScenario[];
  currentScenarioId: string;
  onSelectScenario: (id: string) => void;
  onCreateScenario: () => void;
  onDeleteScenario: (id: string) => void;
  onAddItem: () => void;
  onEditItem: (item: ForecastItem) => void;
  onDeleteItem: (id: string) => void;
  onGenerateForecast: () => void;
  onGrowthRateChange: (rate: number) => void;
  availableCategories: string[];
  CATEGORY_COLORS: Record<string, string>;
  customBudgetTypes: { id: string; name: string }[];
  formatCurrency: (value: number) => string;
}> = ({ 
  forecastItems, 
  currentScenario,
  scenarios,
  currentScenarioId,
  onSelectScenario,
  onCreateScenario,
  onDeleteScenario,
  onAddItem,
  onEditItem,
  onDeleteItem,
  onGenerateForecast,
  onGrowthRateChange,
  CATEGORY_COLORS,
  customBudgetTypes,
  formatCurrency 
}) => {
  const customColors = getCustomBudgetTypeColors(customBudgetTypes);
  const allColors = { ...CATEGORY_COLORS, ...customColors };
  
  // Granularity state for display toggle
  const [granularity, setGranularity] = useState<Granularity>('yearly');

  // Group forecast items by year
  const itemsByYear = useMemo(() => {
    const grouped: Record<number, ForecastItem[]> = {};
    forecastItems.forEach(item => {
      if (!grouped[item.year]) grouped[item.year] = [];
      grouped[item.year].push(item);
    });
    return Object.entries(grouped).sort((a, b) => parseInt(a[0]) - parseInt(b[0]));
  }, [forecastItems]);

  return (
    <div className="flex-1 overflow-y-auto bg-slate-50">
      {/* Scenario and Actions Bar */}
      <div className="p-6 bg-white border-b border-slate-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <ScenarioSelector
              scenarios={scenarios}
              currentScenarioId={currentScenarioId}
              onSelect={onSelectScenario}
              onCreate={onCreateScenario}
              onDelete={onDeleteScenario}
            />
            <div className="flex items-center gap-2">
              <label className="text-sm text-slate-600">Taux de croissance:</label>
              <input
                type="number"
                value={currentScenario.growthRate}
                onChange={(e) => onGrowthRateChange(parseFloat(e.target.value) || 0)}
                className="w-20 px-3 py-2 rounded-lg border border-slate-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 outline-none"
                min="-20"
                max="50"
              />
              <span className="text-sm text-slate-500">%</span>
            </div>
          </div>
          <div className="flex gap-3">
            <button
              onClick={onGenerateForecast}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-100 text-indigo-600 rounded-xl hover:bg-indigo-200 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Générer depuis l'historique
            </button>
            <button
              onClick={onAddItem}
              className="flex items-center gap-2 px-4 py-2 bg-amber-500 text-white rounded-xl hover:bg-amber-600 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Ajouter une prévision
            </button>
          </div>
        </div>
      </div>

      {/* Forecast Items List */}
      <div className="p-6">
        {/* Granularity Toggle */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl">
            <button
              onClick={() => setGranularity('yearly')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                granularity === 'yearly'
                  ? 'bg-white text-amber-600 shadow-md'
                  : 'text-slate-600 hover:text-slate-800'
              }`}
            >
              Annuel
            </button>
            <button
              onClick={() => setGranularity('quarterly')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                granularity === 'quarterly'
                  ? 'bg-white text-amber-600 shadow-md'
                  : 'text-slate-600 hover:text-slate-800'
              }`}
            >
              Trimestriel
            </button>
            <button
              onClick={() => setGranularity('monthly')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                granularity === 'monthly'
                  ? 'bg-white text-amber-600 shadow-md'
                  : 'text-slate-600 hover:text-slate-800'
              }`}
            >
              Mensuel
            </button>
          </div>
          <div className="text-sm text-slate-500">
            {forecastItems.length} prévision{forecastItems.length !== 1 ? 's' : ''}
          </div>
        </div>
        
        {forecastItems.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-slate-200">
            <div className="w-20 h-20 mx-auto mb-4 bg-amber-50 rounded-full flex items-center justify-center">
              <Calculator className="w-10 h-10 text-amber-300" />
            </div>
            <h3 className="text-xl font-semibold text-slate-800 mb-2">Aucune prévision</h3>
            <p className="text-slate-500 mb-6">Commencez par ajouter vos premières prévisions budgétaires</p>
            <button
              onClick={onAddItem}
              className="inline-flex items-center gap-2 px-6 py-3 bg-amber-500 text-white rounded-xl hover:bg-amber-600 transition-colors"
            >
              <Plus className="w-5 h-5" />
              Ajouter une prévision
            </button>
          </div>
        ) : (
          <div className="space-y-8">
            {granularity === 'yearly' ? (
              itemsByYear.map(([year, items]) => (
                <div key={year}>
                  <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-amber-600" />
                    Année {year}
                    <span className="text-sm font-normal text-slate-500">
                      ({formatCurrency(items.reduce((sum, i) => sum + i.amount, 0))})
                    </span>
                  </h3>
                  <div className="space-y-2">
                    {items.map(item => (
                      <ForecastItemRow
                        key={item.id}
                        item={item}
                        onEdit={onEditItem}
                        onDelete={onDeleteItem}
                        color={allColors[item.category] || '#8884d8'}
                      />
                    ))}
                  </div>
                </div>
              ))
            ) : granularity === 'quarterly' ? (
              <QuarterlyView items={forecastItems} allColors={allColors} onEdit={onEditItem} onDelete={onDeleteItem} formatCurrency={formatCurrency} />
            ) : (
              <MonthlyView items={forecastItems} allColors={allColors} onEdit={onEditItem} onDelete={onDeleteItem} formatCurrency={formatCurrency} />
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// Comparison Tab Component
const ComparisonTab: React.FC<{
  comparisonData: { name: string; year: number; actual: number; forecast: number; difference: number }[];
  formatCurrency: (value: number) => string;
  renderLegend: (props: any) => React.ReactElement | null;
}> = ({ comparisonData, formatCurrency, renderLegend }) => {
  return (
    <div className="flex-1 p-6 overflow-y-auto bg-white">
      <h3 className="text-xl font-bold text-slate-800 mb-6">
        Analyse Comparative
      </h3>

      {/* Bar Chart Comparison */}
      <div className="bg-white rounded-2xl p-6 shadow-lg border border-slate-100 mb-6">
        <h4 className="text-lg font-semibold text-slate-700 mb-4">
          Réel vs Prévisionnel
        </h4>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart 
            data={comparisonData.map(d => ({
              ...d,
              'Prévision': d.forecast,
              'Réel': d.actual
            }))} 
            margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis 
              dataKey="name" 
              tick={{ fontSize: 12, fill: '#64748b' }}
            />
            <YAxis 
              tickFormatter={formatCurrency}
              tick={{ fontSize: 11, fill: '#64748b' }}
            />
            <RechartsTooltip 
              formatter={(value: number, name: string) => [formatCurrency(value), name]}
              contentStyle={{ 
                backgroundColor: 'white', 
                border: '1px solid #e2e8f0',
                borderRadius: '12px',
                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
              }}
            />
            {renderLegend({ payload: [
              { value: 'Réel', color: '#22c55e' },
              { value: 'Prévision', color: '#6366f1' }
            ]})}
            <Bar dataKey="Réel" fill="#22c55e" radius={[4, 4, 0, 0]} />
            <Bar dataKey="Prévision" fill="#6366f1" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Difference Analysis */}
      <div className="bg-white rounded-2xl p-6 shadow-lg border border-slate-100">
        <h4 className="text-lg font-semibold text-slate-700 mb-4">
          Analyse des Écarts
        </h4>
        <div className="space-y-4">
          {comparisonData.map((row, idx) => {
            const percentDiff = row.forecast > 0 ? (row.difference / row.forecast) * 100 : 0;
            return (
              <div key={idx} className="p-4 bg-slate-50 rounded-xl">
                <div className="flex items-center justify-between mb-3">
                  <span className="font-semibold text-slate-800">Année {row.name}</span>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    percentDiff > 0 
                      ? 'bg-red-100 text-red-700' 
                      : percentDiff < 0 
                      ? 'bg-blue-100 text-blue-700'
                      : 'bg-green-100 text-green-700'
                  }`}>
                    {percentDiff > 0 ? '+' : ''}{percentDiff.toFixed(1)}%
                  </span>
                </div>
                <div className="relative h-4 bg-slate-200 rounded-full overflow-hidden">
                  <div 
                    className="absolute top-0 left-0 h-full bg-red-400"
                    style={{ width: `${Math.min(100, Math.max(0, 50 + percentDiff / 2))}%` }}
                  />
                  <div 
                    className="absolute top-0 h-full bg-green-400"
                    style={{ 
                      width: `${Math.abs(percentDiff)}%`,
                      left: percentDiff > 0 ? '50%' : `${50 - Math.abs(percentDiff) / 2}%`
                    }}
                  />
                  <div className="absolute top-0 left-1/2 w-0.5 h-full bg-slate-800 transform -translate-x-1/2" />
                </div>
                <div className="flex justify-between mt-2 text-sm">
                  <span className="text-slate-600">
                    Réel: <span className="font-semibold text-slate-800">{formatCurrency(row.actual)}</span>
                  </span>
                  <span className="text-slate-600">
                    Prévision: <span className="font-semibold text-slate-800">{formatCurrency(row.forecast)}</span>
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export const BudgetPrevisionnel: React.FC<BudgetPrevisionnelProps> = ({ tasks, onClose, customBudgetTypes = [] }) => {
  const [activeView, setActiveView] = useState<'overview' | 'forecast' | 'comparison'>('overview');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingItem, setEditingItem] = useState<ForecastItem | null>(null);
  const [currentScenarioId, setCurrentScenarioId] = useState<string>('default');
  
  // Scenarios state
  const [scenarios, setScenarios] = useState<ForecastScenario[]>([
    {
      id: 'default',
      name: 'Scénario de base',
      items: [],
      growthRate: 3
    }
  ]);

  // Get current scenario
  const currentScenario = scenarios.find(s => s.id === currentScenarioId) || scenarios[0];

  // Calculate actual budget from tasks
  const yearlyData = useMemo(() => splitBudgetByYears(tasks), [tasks]);
  const totalBudget = useMemo(() => getTotalBudget(tasks), [tasks]);
  const categoryData = useMemo(() => getBudgetByCategoryFromTasks(tasks), [tasks]);

  // Available years for forecast
  const existingYears = useMemo(() => {
    const years = new Set<number>();
    yearlyData.forEach(y => years.add(y.year));
    tasks.forEach((task: Task) => {
      if (task.start) {
        const startYear = new Date(task.start).getFullYear();
        years.add(startYear);
      }
    });
    return Array.from(years).sort((a, b) => a - b);
  }, [yearlyData, tasks]);

  // Available categories
  const availableCategories = useMemo(() => {
    const cats = new Set<string>(Object.keys(CATEGORY_COLORS));
    categoryData.forEach(c => cats.add(c.category));
    customBudgetTypes.forEach((t: { id: string; name: string }) => cats.add(t.name));
    return Array.from(cats);
  }, [categoryData, customBudgetTypes]);

  // Get forecast data from current scenario
  const forecastItems = currentScenario.items;
  
  // Calculate forecast totals by year
  const forecastByYear = useMemo(() => {
    const byYear: Record<number, number> = {};
    forecastItems.forEach(item => {
      byYear[item.year] = (byYear[item.year] || 0) + item.amount;
    });
    return Object.entries(byYear).map(([year, budget]) => ({
      year: parseInt(year),
      budget,
      forecast: budget
    })).sort((a, b) => a.year - b.year);
  }, [forecastItems]);

  // Calculate total forecast
  const totalForecast = useMemo(() => {
    return forecastItems.reduce((sum, item) => sum + item.amount, 0);
  }, [forecastItems]);

  // Combine actual and forecast data for comparison
  const comparisonData = useMemo(() => {
    const allYears = new Map<number, { actual: number; forecast: number }>();
    
    // Add actual data
    yearlyData.forEach(item => {
      allYears.set(item.year, { actual: item.budget, forecast: 0 });
    });
    
    // Add forecast data
    forecastByYear.forEach(item => {
      const existing = allYears.get(item.year);
      if (existing) {
        existing.forecast = item.forecast;
      } else {
        allYears.set(item.year, { actual: 0, forecast: item.forecast });
      }
    });
    
    return Array.from(allYears.entries())
      .map(([year, data]) => ({
        name: year.toString(),
        year,
        actual: data.actual,
        forecast: data.forecast,
        difference: data.actual - data.forecast
      }))
      .sort((a, b) => a.year - b.year);
  }, [yearlyData, forecastByYear]);

  // Calculate projected total (actual + forecast for future years)
  const projectedTotal = useMemo(() => {
    const actualYears = new Set(yearlyData.map(y => y.year));
    const futureForecast = forecastByYear
      .filter(y => !actualYears.has(y.year))
      .reduce((sum, y) => sum + y.budget, 0);
    return totalBudget + futureForecast;
  }, [totalBudget, forecastByYear, yearlyData]);

  // Generate forecast from historical data
  const generateForecastFromHistory = () => {
    if (yearlyData.length === 0) return;

    const growthRate = currentScenario.growthRate / 100;
    const lastYear = Math.max(...yearlyData.map(y => y.year));
    const lastYearData = yearlyData.find(y => y.year === lastYear);
    
    if (!lastYearData) return;

    // Generate forecast for next 2 years
    const newItems: ForecastItem[] = [];
    
    for (let i = 1; i <= 2; i++) {
      const projectedYear = lastYear + i;
      const projectedAmount = lastYearData.budget * Math.pow(1 + growthRate, i);
      
      // Distribute by category
      categoryData.forEach(cat => {
        const categoryRatio = cat.budget / lastYearData.budget;
        newItems.push({
          id: generateId(),
          category: cat.category,
          description: `Prévision ${cat.category} - ${projectedYear}`,
          amount: Math.round(projectedAmount * categoryRatio),
          year: projectedYear,
          isManual: false
        });
      });
    }

    setScenarios(prev => prev.map(s => 
      s.id === currentScenarioId 
        ? { ...s, items: [...s.items.filter(item => item.isManual), ...newItems] }
        : s
    ));
  };

  // Add/Edit forecast item
  const handleSaveItem = (item: ForecastItem) => {
    setScenarios(prev => prev.map(s => {
      if (s.id !== currentScenarioId) return s;
      const existingIndex = s.items.findIndex(i => i.id === item.id);
      if (existingIndex >= 0) {
        const newItems = [...s.items];
        newItems[existingIndex] = item;
        return { ...s, items: newItems };
      }
      return { ...s, items: [...s.items, item] };
    }));
    setEditingItem(null);
  };

  // Delete forecast item
  const handleDeleteItem = (id: string) => {
    setScenarios(prev => prev.map(s => 
      s.id === currentScenarioId 
        ? { ...s, items: s.items.filter(i => i.id !== id) }
        : s
    ));
  };

  // Create new scenario
  const handleCreateScenario = () => {
    const newId = generateId();
    setScenarios(prev => [...prev, {
      id: newId,
      name: `Scénario ${prev.length + 1}`,
      items: [],
      growthRate: 3
    }]);
    setCurrentScenarioId(newId);
  };

  // Delete scenario
  const handleDeleteScenario = (id: string) => {
    if (scenarios.length <= 1) return;
    setScenarios(prev => prev.filter(s => s.id !== id));
    if (currentScenarioId === id) {
      setCurrentScenarioId(scenarios[0].id);
    }
  };

  // Update growth rate
  const handleGrowthRateChange = (rate: number) => {
    setScenarios(prev => prev.map(s => 
      s.id === currentScenarioId ? { ...s, growthRate: rate } : s
    ));
  };

  // Stats
  const stats = useMemo(() => {
    const yearCount = yearlyData.length;
    const forecastYearCount = forecastByYear.length;
    const avgBudgetPerYear = yearCount > 0 ? totalBudget / yearCount : 0;
    const maxCategory = categoryData.length > 0 
      ? categoryData.reduce((max, cat) => cat.budget > max.budget ? cat : max, categoryData[0])
      : null;
    
    return { 
      yearCount, 
      forecastYearCount,
      avgBudgetPerYear, 
      maxCategory,
      variance: comparisonData.length > 0 
        ? comparisonData.reduce((sum, d) => sum + Math.abs(d.difference), 0) 
        : 0
    };
  }, [yearlyData, totalBudget, categoryData, forecastByYear, comparisonData]);

  // Render legend
  const renderLegend = (props: any) => {
    const { payload } = props;
    if (!payload) return null;
    return (
      <div className="flex flex-wrap justify-center gap-3 mt-4">
        {payload.map((entry: { value: string; color?: string }, index: number) => (
          <div key={`legend-${index}`} className="flex items-center gap-2 px-3 py-1 bg-white/80 rounded-full border border-slate-200">
            <div 
              className="w-3 h-3 rounded-full shadow-sm" 
              style={{ backgroundColor: entry.color || '#8884d8' }}
            />
            <span className="text-xs font-medium text-slate-600">{entry.value}</span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gradient-to-br from-slate-50 to-white rounded-3xl shadow-2xl w-full max-w-7xl h-[95vh] flex flex-col overflow-hidden border border-slate-200">
        {/* Header */}
        <div className="flex items-center justify-between px-8 py-6 border-b border-slate-200 bg-white/50 backdrop-blur-sm">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl shadow-lg">
              <Calculator className="w-7 h-7 text-white" />
            </div>
            <div>
              <h2 className="text-3xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                Budget Prévisionnel
              </h2>
              <p className="text-slate-500">
                Anticipez et planifiez vos dépenses futures
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-3 hover:bg-slate-100 rounded-xl transition-colors group"
          >
            <X className="w-6 h-6 text-slate-400 group-hover:text-slate-600" />
          </button>
        </div>

        {/* View Tabs */}
        <div className="px-8 py-4 border-b border-slate-200 bg-white">
          <div className="flex gap-2 bg-slate-100 p-1 rounded-xl inline-flex">
            <button
              onClick={() => setActiveView('overview')}
              className={`px-6 py-3 rounded-lg font-medium transition-all ${
                activeView === 'overview' 
                  ? 'bg-white text-amber-600 shadow-md' 
                  : 'text-slate-600 hover:text-slate-800'
              }`}
            >
              <span className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                Aperçu
              </span>
            </button>
            <button
              onClick={() => setActiveView('forecast')}
              className={`px-6 py-3 rounded-lg font-medium transition-all ${
                activeView === 'forecast' 
                  ? 'bg-white text-amber-600 shadow-md' 
                  : 'text-slate-600 hover:text-slate-800'
              }`}
            >
              <span className="flex items-center gap-2">
                <Edit3 className="w-4 h-4" />
                Prévisions
              </span>
            </button>
            <button
              onClick={() => setActiveView('comparison')}
              className={`px-6 py-3 rounded-lg font-medium transition-all ${
                activeView === 'comparison' 
                  ? 'bg-white text-amber-600 shadow-md' 
                  : 'text-slate-600 hover:text-slate-800'
              }`}
            >
              <span className="flex items-center gap-2">
                <ArrowRight className="w-4 h-4" />
                Comparaison
              </span>
            </button>
          </div>
        </div>
        
        {/* Stats Row */}
        <div className="px-8 py-6 bg-gradient-to-r from-amber-50/50 to-orange-50/50 border-b border-slate-100">
          <div className="grid grid-cols-5 gap-4">
            <StatsCard 
              title="Budget Réel" 
              value={formatCurrency(totalBudget)} 
              icon={<DollarSign className="w-6 h-6 text-emerald-600" />}
              color="#10b981"
              subtitle={`${stats.yearCount} année(s)`}
            />
            <StatsCard 
              title="Budget Prévisionnel" 
              value={formatCurrency(totalForecast)} 
              icon={<Calculator className="w-6 h-6 text-amber-600" />}
              color="#f59e0b"
              subtitle={`${stats.forecastYearCount} année(s)`}
            />
            <StatsCard 
              title="Budget Projeté" 
              value={formatCurrency(projectedTotal)} 
              icon={<TrendingUp className="w-6 h-6 text-indigo-600" />}
              color="#6366f1"
              subtitle="Réel + Prévisions"
            />
            <StatsCard 
              title="Écart Total" 
              value={formatCurrency(stats.variance)} 
              icon={<AlertCircle className="w-6 h-6 text-pink-600" />}
              color="#ec4899"
              subtitle="Somme des écarts"
            />
            <StatsCard 
              title="Catégorie Principale" 
              value={stats.maxCategory?.category || 'N/A'} 
              icon={<Target className="w-6 h-6 text-purple-600" />}
              color="#8b5cf6"
              trend={stats.maxCategory ? `${formatCurrency(stats.maxCategory.budget)}` : undefined}
            />
          </div>
        </div>
        
        {/* Content */}
        <div className="flex flex-1 overflow-hidden">
          {activeView === 'overview' && (
            <OverviewTab 
              yearlyData={yearlyData}
              forecastByYear={forecastByYear}
              totalBudget={totalBudget}
              totalForecast={totalForecast}
              comparisonData={comparisonData}
              COLORS={COLORS}
              formatCurrency={formatCurrency}
              renderLegend={renderLegend}
            />
          )}

          {activeView === 'forecast' && (
            <ForecastTab 
              forecastItems={forecastItems}
              currentScenario={currentScenario}
              scenarios={scenarios}
              currentScenarioId={currentScenarioId}
              onSelectScenario={setCurrentScenarioId}
              onCreateScenario={handleCreateScenario}
              onDeleteScenario={handleDeleteScenario}
              onAddItem={() => setShowAddModal(true)}
              onEditItem={setEditingItem}
              onDeleteItem={handleDeleteItem}
              onGenerateForecast={generateForecastFromHistory}
              onGrowthRateChange={handleGrowthRateChange}
              availableCategories={availableCategories}
              CATEGORY_COLORS={CATEGORY_COLORS}
              customBudgetTypes={customBudgetTypes}
              formatCurrency={formatCurrency}
            />
          )}

          {activeView === 'comparison' && (
            <ComparisonTab 
              comparisonData={comparisonData}
              formatCurrency={formatCurrency}
              renderLegend={renderLegend}
            />
          )}
        </div>
      </div>

      {/* Add/Edit Modal */}
      <ForecastItemModal
        isOpen={showAddModal || editingItem !== null}
        item={editingItem}
        onSave={handleSaveItem}
        onClose={() => {
          setShowAddModal(false);
          setEditingItem(null);
        }}
        availableCategories={availableCategories}
        existingYears={existingYears}
      />
    </div>
  );
};

export default BudgetPrevisionnel;
