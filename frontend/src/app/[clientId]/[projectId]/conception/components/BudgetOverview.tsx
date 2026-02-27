"use client";

import React, { useMemo, useState } from 'react';
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  Legend, 
  Tooltip as RechartsTooltip,
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid,
  AreaChart,
  Area,
  LineChart,
  Line,
  ComposedChart
} from 'recharts';
import { X, ChevronDown, ChevronUp, TrendingUp, PieChart as PieChartIcon, BarChart3, Calendar, DollarSign, Target } from 'lucide-react';
import { Task } from '../../data';
import { 
  splitBudgetByYears, 
  getTotalBudget, 
  getBudgetByCategoryFromTasks,
  calculateBudgetTotals,
  YearlyBudgetBreakdown 
} from '../utils/budgetUtils';

interface BudgetOverviewProps {
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

// Stats Card Component
const StatsCard: React.FC<{
  title: string;
  value: string;
  icon: React.ReactNode;
  color: string;
  trend?: string;
}> = ({ title, value, icon, color, trend }) => (
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
      </div>
      <div className="p-3 rounded-xl" style={{ backgroundColor: `${color}15` }}>
        {icon}
      </div>
    </div>
  </div>
);

// Year Card Component
const YearCard: React.FC<{ 
  data: YearlyBudgetBreakdown; 
  color: string;
  totalBudget: number;
  isExpanded: boolean;
  onToggle: () => void;
}> = ({ data, color, totalBudget, isExpanded, onToggle }) => {
  const percentage = totalBudget > 0 ? (data.budget / totalBudget) * 100 : 0;
  
  return (
    <div 
      className="bg-white rounded-2xl shadow-lg border border-slate-100 overflow-hidden cursor-pointer transition-all hover:shadow-xl hover:scale-[1.02] duration-300"
      onClick={onToggle}
    >
      <div className="p-5" style={{ borderLeft: `6px solid ${color}` }}>
        <div className="flex justify-between items-start mb-3">
          <div>
            <h3 className="text-xl font-bold text-slate-800">Année {data.year}</h3>
            <p className="text-sm text-slate-500">{data.taskCount} tâche{data.taskCount > 1 ? 's' : ''}</p>
          </div>
          <div className="flex items-center gap-2">
            {isExpanded ? (
              <ChevronUp className="w-5 h-5 text-slate-400" />
            ) : (
              <ChevronDown className="w-5 h-5 text-slate-400" />
            )}
          </div>
        </div>
        
        <div className="text-3xl font-bold mb-3 bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
          {formatCurrency(data.budget)}
        </div>
        
        <div className="flex items-center gap-3">
          <div className="flex-1 h-3 bg-slate-100 rounded-full overflow-hidden">
            <div 
              className="h-full rounded-full transition-all duration-500"
              style={{ width: `${percentage}%`, backgroundColor: color }}
            />
          </div>
          <span className="text-sm font-semibold text-slate-600">{percentage.toFixed(1)}%</span>
        </div>
      </div>
      
      {isExpanded && (
        <div className="px-5 pb-5 bg-slate-50 border-t border-slate-100">
          <div className="pt-4 space-y-3">
            {data.personnelCost > 0 && (
              <div className="flex justify-between items-center py-2 px-3 bg-white rounded-lg">
                <span className="text-sm text-slate-600 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  Moyen humain
                </span>
                <span className="font-semibold text-slate-800">{formatCurrency(data.personnelCost)}</span>
              </div>
            )}
            {data.internsCost > 0 && (
              <div className="flex justify-between items-center py-2 px-3 bg-white rounded-lg">
                <span className="text-sm text-slate-600 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-gray-500"></span>
                  Stagiaires
                </span>
                <span className="font-semibold text-slate-800">{formatCurrency(data.internsCost)}</span>
              </div>
            )}
            {data.fittingsCost > 0 && (
              <div className="flex justify-between items-center py-2 px-3 bg-white rounded-lg">
                <span className="text-sm text-slate-600 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-purple-500"></span>
                  Aménagements
                </span>
                <span className="font-semibold text-slate-800">{formatCurrency(data.fittingsCost)}</span>
              </div>
            )}
            {data.educationalEquipmentCost > 0 && (
              <div className="flex justify-between items-center py-2 px-3 bg-white rounded-lg">
                <span className="text-sm text-slate-600 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-pink-500"></span>
                  Équipements pédagogiques
                </span>
                <span className="font-semibold text-slate-800">{formatCurrency(data.educationalEquipmentCost)}</span>
              </div>
            )}
            {data.subcontractorCost > 0 && (
              <div className="flex justify-between items-center py-2 px-3 bg-white rounded-lg">
                <span className="text-sm text-slate-600 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-cyan-500"></span>
                  Prestations
                </span>
                <span className="font-semibold text-slate-800">{formatCurrency(data.subcontractorCost)}</span>
              </div>
            )}
            {data.communicationCost > 0 && (
              <div className="flex justify-between items-center py-2 px-3 bg-white rounded-lg">
                <span className="text-sm text-slate-600 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-orange-500"></span>
                  Communications
                </span>
                <span className="font-semibold text-slate-800">{formatCurrency(data.communicationCost)}</span>
              </div>
            )}
            {data.expenseLinesTotal > 0 && (
              <div className="flex justify-between items-center py-2 px-3 bg-white rounded-lg">
                <span className="text-sm text-slate-600 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
                  Lignes de dépenses
                </span>
                <span className="font-semibold text-slate-800">{formatCurrency(data.expenseLinesTotal)}</span>
              </div>
            )}
          </div>
          
          {data.taskNames.length > 0 && (
            <div className="mt-4 pt-4 border-t border-slate-200">
              <p className="text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wider">Tâches</p>
              <div className="flex flex-wrap gap-2">
                {data.taskNames.slice(0, 4).map((name, idx) => (
                  <span key={idx} className="px-3 py-1 bg-white rounded-full text-xs text-slate-600 border border-slate-200">
                    {name.length > 20 ? name.substring(0, 20) + '...' : name}
                  </span>
                ))}
                {data.taskNames.length > 4 && (
                  <span className="px-3 py-1 bg-indigo-50 rounded-full text-xs text-indigo-600 border border-indigo-200">
                    +{data.taskNames.length - 4}
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// Custom Tooltip
const CustomTooltip: React.FC<{ 
  active?: boolean; 
  payload?: Array<{ 
    name: string; 
    value: number; 
    color: string;
    payload?: { percentage?: number };
  }>;
}> = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0];
    return (
      <div className="bg-white/95 backdrop-blur-sm p-4 shadow-2xl rounded-xl border border-slate-200">
        <p className="font-bold text-slate-800 mb-1">{data.name}</p>
        <p className="text-lg font-semibold" style={{ color: data.color }}>
          {formatCurrency(data.value)}
        </p>
        {data.payload?.percentage !== undefined && (
          <p className="text-xs text-slate-500 mt-1">
            {data.payload.percentage.toFixed(1)}% du budget total
          </p>
        )}
      </div>
    );
  }
  return null;
};

export const BudgetOverview: React.FC<BudgetOverviewProps> = ({ tasks, onClose, customBudgetTypes = [] }) => {
  const [expandedYear, setExpandedYear] = useState<number | null>(null);
  const [activeChart, setActiveChart] = useState<'year' | 'category' | 'task'>('year');
  const [chartType, setChartType] = useState<'pie' | 'bar' | 'area' | 'line'>('pie');
  
  const yearlyData = useMemo(() => splitBudgetByYears(tasks), [tasks]);
  const totalBudget = useMemo(() => getTotalBudget(tasks), [tasks]);
  const categoryData = useMemo(() => getBudgetByCategoryFromTasks(tasks), [tasks]);
  
  // Prepare pie chart data for years
  const yearPieData = useMemo(() => {
    return yearlyData.map(item => ({
      name: item.year.toString(),
      value: item.budget,
      color: COLORS[yearlyData.indexOf(item) % COLORS.length],
      percentage: totalBudget > 0 ? (item.budget / totalBudget) * 100 : 0
    }));
  }, [yearlyData, totalBudget]);
  
  // Prepare pie chart data for categories
  const categoryPieData = useMemo(() => {
    const customColors = getCustomBudgetTypeColors(customBudgetTypes);
    const allColors = { ...CATEGORY_COLORS, ...customColors };
    return categoryData.map(item => ({
      name: item.category,
      value: item.budget,
      color: allColors[item.category] || '#8884d8',
      percentage: totalBudget > 0 ? (item.budget / totalBudget) * 100 : 0
    }));
  }, [categoryData, totalBudget, customBudgetTypes]);
  
  // Get budget by task for "Par Action" view
  const taskData = useMemo(() => {
    return tasks
      .filter(task => task.budget)
      .map(task => {
        const budget = task.budget!;
        const totals = calculateBudgetTotals(budget);
        return {
          name: task.text.length > 25 ? task.text.substring(0, 25) + '...' : task.text,
          fullName: task.text,
          budget: totals.total,
          color: task.color || '#3b82f6'
        };
      })
      .sort((a, b) => b.budget - a.budget);
  }, [tasks]);
  
  // Prepare pie chart data for tasks
  const taskPieData = useMemo(() => {
    return taskData.map(item => ({
      name: item.name,
      value: item.budget,
      color: item.color,
      percentage: totalBudget > 0 ? (item.budget / totalBudget) * 100 : 0
    }));
  }, [taskData, totalBudget]);
  
  // Prepare bar chart data
  const barChartData = useMemo(() => {
    const customColors = getCustomBudgetTypeColors(customBudgetTypes);
    const allColors = { ...CATEGORY_COLORS, ...customColors };
    if (activeChart === 'year') {
      return yearlyData.map(item => ({
        name: item.year.toString(),
        budget: item.budget,
        fill: COLORS[yearlyData.indexOf(item) % COLORS.length]
      }));
    } else if (activeChart === 'task') {
      return taskData.map(item => ({
        name: item.name,
        budget: item.budget,
        fill: item.color
      }));
    } else {
      return categoryData.map(item => ({
        name: item.category.length > 20 ? item.category.substring(0, 20) + '...' : item.category,
        budget: item.budget,
        fill: allColors[item.category] || '#8884d8'
      }));
    }
  }, [yearlyData, categoryData, taskData, activeChart, customBudgetTypes]);
  
  // Calculate dynamic chart height based on data count
  const chartHeight = useMemo(() => {
    const dataCount = activeChart === 'year' ? yearlyData.length : activeChart === 'task' ? taskData.length : categoryData.length;
    // Base height is 400, add more height for each item beyond 5
    return Math.max(400, 200 + dataCount * 50);
  }, [yearlyData, categoryData, taskData, activeChart]);
  
  // Calculate if horizontal scroll is needed for bar chart
  const needsHorizontalScroll = useMemo(() => {
    const dataCount = activeChart === 'year' ? yearlyData.length : activeChart === 'task' ? taskData.length : categoryData.length;
    return dataCount > 5;
  }, [yearlyData, categoryData, taskData, activeChart]);
  
  // Calculate stats
  const stats = useMemo(() => {
    const yearCount = yearlyData.length;
    const avgBudgetPerYear = yearCount > 0 ? totalBudget / yearCount : 0;
    const maxCategory = categoryData.length > 0 
      ? categoryData.reduce((max, cat) => cat.budget > max.budget ? cat : max, categoryData[0])
      : null;
    
    return { yearCount, avgBudgetPerYear, maxCategory };
  }, [yearlyData, totalBudget, categoryData]);
  

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
            <div className="p-3 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl shadow-lg">
              <DollarSign className="w-7 h-7 text-white" />
            </div>
            <div>
              <h2 className="text-3xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                Aperçu du Budget
              </h2>
              <p className="text-slate-500">
                Analyse détaillée par année et par catégorie
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
        
        {/* Stats Row */}
        <div className="px-8 py-6 bg-gradient-to-r from-indigo-50/50 to-purple-50/50 border-b border-slate-100">
          <div className="grid grid-cols-4 gap-4">
            <StatsCard 
              title="Budget Total" 
              value={formatCurrency(totalBudget)} 
              icon={<DollarSign className="w-6 h-6 text-indigo-600" />}
              color="#6366f1"
            />
            <StatsCard 
              title="Années" 
              value={stats.yearCount.toString()} 
              icon={<Calendar className="w-6 h-6 text-purple-600" />}
              color="#8b5cf6"
            />
            <StatsCard 
              title="Moy. par An" 
              value={formatCurrency(stats.avgBudgetPerYear)} 
              icon={<TrendingUp className="w-6 h-6 text-emerald-600" />}
              color="#10b981"
            />
            <StatsCard 
              title="Catégorie Principale" 
              value={stats.maxCategory?.category || 'N/A'} 
              icon={<Target className="w-6 h-6 text-pink-600" />}
              color="#ec4899"
              trend={stats.maxCategory ? `${formatCurrency(stats.maxCategory.budget)}` : undefined}
            />
          </div>
        </div>
        
        {/* Content */}
        <div className="flex flex-1 overflow-hidden">
          {/* Left Sidebar - Year Cards */}
          <div className="w-96 bg-slate-50 border-r border-slate-200 p-6 overflow-y-auto">
            <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-indigo-600" />
              Budget par Année
            </h3>
            <div className="space-y-4">
              {yearlyData.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 mx-auto mb-4 bg-slate-100 rounded-full flex items-center justify-center">
                    <DollarSign className="w-8 h-8 text-slate-300" />
                  </div>
                  <p className="text-slate-500 font-medium">Aucun budget défini</p>
                  <p className="text-slate-400 text-sm mt-1">Ajoutez des budgets aux taches pour voir lanalyse</p>
                </div>
              ) : (
                yearlyData.map((item, index) => (
                  <YearCard
                    key={item.year}
                    data={item}
                    color={COLORS[index % COLORS.length]}
                    totalBudget={totalBudget}
                    isExpanded={expandedYear === item.year}
                    onToggle={() => setExpandedYear(expandedYear === item.year ? null : item.year)}
                  />
                ))
              )}
            </div>
          </div>
          
          {/* Main Chart Area */}
          <div className="flex-1 p-6 overflow-y-auto bg-white">
            {/* Chart Controls */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex gap-2 bg-slate-100 p-1 rounded-xl">
                <button
                  onClick={() => {
                    setActiveChart('year');
                    setChartType('pie');
                  }}
                  className={`px-4 py-2 rounded-lg font-medium transition-all ${
                    activeChart === 'year' 
                      ? 'bg-white text-indigo-600 shadow-md' 
                      : 'text-slate-600 hover:text-slate-800'
                  }`}
                >
                  Par Année
                </button>
                <button
                  onClick={() => {
                    setActiveChart('category');
                    setChartType('pie');
                  }}
                  className={`px-4 py-2 rounded-lg font-medium transition-all ${
                    activeChart === 'category' 
                      ? 'bg-white text-indigo-600 shadow-md' 
                      : 'text-slate-600 hover:text-slate-800'
                  }`}
                >
                  Par Catégorie
                </button>
                <button
                  onClick={() => {
                    setActiveChart('task');
                    setChartType('line');
                  }}
                  className={`px-4 py-2 rounded-lg font-medium transition-all ${
                    activeChart === 'task' 
                      ? 'bg-white text-indigo-600 shadow-md' 
                      : 'text-slate-600 hover:text-slate-800'
                  }`}
                >
                  Par Action
                </button>
              </div>
              
              <div className="flex gap-2 bg-slate-100 p-1 rounded-xl">
                <button
                  onClick={() => setChartType('pie')}
                  className={`p-2 rounded-lg transition-all ${chartType === 'pie' ? 'bg-white text-indigo-600 shadow-md' : 'text-slate-500 hover:text-slate-700'}`}
                  title="Camembert"
                >
                  <PieChartIcon className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setChartType('bar')}
                  className={`p-2 rounded-lg transition-all ${chartType === 'bar' ? 'bg-white text-indigo-600 shadow-md' : 'text-slate-500 hover:text-slate-700'}`}
                  title="Barres"
                >
                  <BarChart3 className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setChartType('area')}
                  className={`p-2 rounded-lg transition-all ${chartType === 'area' ? 'bg-white text-indigo-600 shadow-md' : 'text-slate-500 hover:text-slate-700'}`}
                  title="Area"
                >
                  <TrendingUp className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setChartType('line')}
                  className={`p-2 rounded-lg transition-all ${chartType === 'line' ? 'bg-white text-indigo-600 shadow-md' : 'text-slate-500 hover:text-slate-700'}`}
                  title="Ligne"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                  </svg>
                </button>
              </div>
            </div>
            
            {/* Charts */}
            <div className="space-y-8">
              {/* Primary Chart */}
              <div className="bg-white rounded-2xl p-6 shadow-lg border border-slate-100">
                <h3 className="text-xl font-bold text-slate-800 mb-6">
                  {activeChart === 'year' ? 'Répartition par Année' : activeChart === 'task' ? 'Répartition par Action' : 'Répartition par Catégorie'}
                </h3>
                
                {chartType === 'pie' && (
                  <ResponsiveContainer width="100%" height={400}>
                    <PieChart>
                      <Pie
                        data={activeChart === 'year' ? yearPieData : activeChart === 'task' ? taskPieData : categoryPieData}
                        cx="50%"
                        cy="50%"
                        labelLine={true}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={140}
                        fill="#8884d8"
                        dataKey="value"
                        paddingAngle={2}
                      >
                        {(activeChart === 'year' ? yearPieData : activeChart === 'task' ? taskPieData : categoryPieData).map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} stroke="white" strokeWidth={2} />
                        ))}
                      </Pie>
                      <RechartsTooltip content={<CustomTooltip />} />
                      <Legend content={renderLegend} />
                    </PieChart>
                  </ResponsiveContainer>
                )}
                
                {chartType === 'bar' && (
                  <div className={needsHorizontalScroll ? 'overflow-x-auto' : ''}>
                    <ResponsiveContainer width={needsHorizontalScroll ? Math.max(100, barChartData.length * 120) : "100%"} height={chartHeight}>
                      <BarChart data={barChartData} margin={{ top: 20, right: 30, left: 20, bottom: 80 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis 
                        dataKey="name" 
                        tick={{ fontSize: 12, fill: '#64748b' }}
                        angle={-45}
                        textAnchor="end"
                        height={80}
                      />
                      <YAxis 
                        tickFormatter={(value) => formatCurrency(value)}
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
                      <Bar dataKey="budget" radius={[8, 8, 0, 0]}>
                        {barChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                  </div>
                )}
                
                {chartType === 'area' && (
                  <div className={needsHorizontalScroll ? 'overflow-x-auto' : ''}>
                    <ResponsiveContainer width={needsHorizontalScroll ? Math.max(100, barChartData.length * 120) : "100%"} height={chartHeight}>
                    <AreaChart data={barChartData} margin={{ top: 20, right: 30, left: 20, bottom: 80 }}>
                      <defs>
                        {barChartData.map((entry, index) => (
                          <linearGradient key={`gradient-${index}`} id={`color${index}`} x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor={entry.fill} stopOpacity={0.3}/>
                            <stop offset="95%" stopColor={entry.fill} stopOpacity={0}/>
                          </linearGradient>
                        ))}
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis 
                        dataKey="name" 
                        tick={{ fontSize: 12, fill: '#64748b' }}
                        angle={-45}
                        textAnchor="end"
                        height={80}
                      />
                      <YAxis 
                        tickFormatter={(value) => formatCurrency(value)}
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
                      <Area 
                        type="monotone" 
                        dataKey="budget" 
                        stroke="#6366f1" 
                        strokeWidth={3}
                        fillOpacity={1}
                        fill="url(#color0)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                  </div>
                )}
                
                {chartType === 'line' && (
                  <div className={needsHorizontalScroll ? 'overflow-x-auto' : ''}>
                    <ResponsiveContainer width={needsHorizontalScroll ? Math.max(100, barChartData.length * 120) : "100%"} height={chartHeight}>
                      <LineChart data={barChartData} margin={{ top: 20, right: 30, left: 20, bottom: 80 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                        <XAxis 
                          dataKey="name" 
                          tick={{ fontSize: 12, fill: '#64748b' }}
                          angle={-45}
                          textAnchor="end"
                          height={80}
                        />
                        <YAxis 
                          tickFormatter={(value) => formatCurrency(value)}
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
                        <Line 
                          type="monotone" 
                          dataKey="budget" 
                          stroke="#6366f1" 
                          strokeWidth={3}
                          dot={{ fill: '#6366f1', strokeWidth: 2, r: 6 }}
                          activeDot={{ r: 8 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </div>
              
              {/* Summary Table */}
              <div className="bg-white rounded-2xl p-6 shadow-lg border border-slate-100">
                <h3 className="text-xl font-bold text-slate-800 mb-6">
                  {activeChart === 'task' ? 'Budget par Action' : 'Résumé Financier'}
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-slate-200">
                        <th className="text-left py-3 px-4 font-semibold text-slate-600 text-sm">
                          {activeChart === 'task' ? 'Action' : 'Catégorie'}
                        </th>
                        <th className="text-right py-3 px-4 font-semibold text-slate-600 text-sm">Budget</th>
                        <th className="text-right py-3 px-4 font-semibold text-slate-600 text-sm">% du Total</th>
                        <th className="text-right py-3 px-4 font-semibold text-slate-600 text-sm">Répartition</th>
                      </tr>
                    </thead>
                    <tbody>
                      {activeChart === 'task' ? (
                        // Task-based view
                        taskData.map((task, idx) => (
                          <tr key={idx} className="border-b border-slate-100 hover:bg-slate-50">
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-3">
                                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: task.color }}></div>
                                <span className="font-medium text-slate-700" title={task.fullName}>{task.name}</span>
                              </div>
                            </td>
                            <td className="py-3 px-4 text-right font-semibold text-slate-800">{formatCurrency(task.budget)}</td>
                            <td className="py-3 px-4 text-right text-slate-600">{totalBudget > 0 ? ((task.budget / totalBudget) * 100).toFixed(1) : 0}%</td>
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-2">
                                <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                                  <div 
                                    className="h-full rounded-full"
                                    style={{ 
                                      width: `${totalBudget > 0 ? (task.budget / totalBudget) * 100 : 0}%`,
                                      backgroundColor: task.color
                                    }}
                                  />
                                </div>
                                <span className="text-xs text-slate-400 w-12 text-right">
                                  {totalBudget > 0 ? ((task.budget / totalBudget) * 100).toFixed(0) : 0}%
                                </span>
                              </div>
                            </td>
                          </tr>
                        ))
                      ) : (
                        // Category-based view
                        categoryData.map((cat, idx) => {
                          const customColors = getCustomBudgetTypeColors(customBudgetTypes);
                          const allColors = { ...CATEGORY_COLORS, ...customColors };
                          return (
                          <tr key={idx} className="border-b border-slate-100 hover:bg-slate-50">
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-3">
                                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: allColors[cat.category] || '#8884d8' }}></div>
                                <span className="font-medium text-slate-700">{cat.category}</span>
                              </div>
                            </td>
                            <td className="py-3 px-4 text-right font-semibold text-slate-800">{formatCurrency(cat.budget)}</td>
                            <td className="py-3 px-4 text-right text-slate-600">{totalBudget > 0 ? ((cat.budget / totalBudget) * 100).toFixed(1) : 0}%</td>
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-2">
                                <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                                  <div 
                                    className="h-full rounded-full"
                                    style={{ 
                                      width: `${totalBudget > 0 ? (cat.budget / totalBudget) * 100 : 0}%`,
                                      backgroundColor: allColors[cat.category] || '#8884d8'
                                    }}
                                  />
                                </div>
                                <span className="text-xs text-slate-400 w-12 text-right">
                                  {totalBudget > 0 ? ((cat.budget / totalBudget) * 100).toFixed(0) : 0}%
                                </span>
                              </div>
                            </td>
                          </tr>
                        );
                        })
                      )}
                    </tbody>
                    <tfoot>
                      <tr className="bg-slate-50">
                        <td className="py-4 px-4 font-bold text-slate-800">Total</td>
                        <td className="py-4 px-4 text-right font-bold text-indigo-600 text-lg">{formatCurrency(totalBudget)}</td>
                        <td className="py-4 px-4 text-right font-bold text-slate-800">100%</td>
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-2">
                            <div className="flex-1 h-3 bg-slate-200 rounded-full overflow-hidden flex">
                              {activeChart === 'task' ? (
                                taskData.slice(0, 6).map((task, idx) => (
                                  <div 
                                    key={idx}
                                    className="h-full"
                                    style={{ 
                                      width: `${totalBudget > 0 ? (task.budget / totalBudget) * 100 : 0}%`,
                                      backgroundColor: task.color
                                    }}
                                  />
                                ))
                              ) : (
                                categoryData.slice(0, 6).map((cat, idx) => {
                                  const customColors = getCustomBudgetTypeColors(customBudgetTypes);
                                  const allColors = { ...CATEGORY_COLORS, ...customColors };
                                  return (
                                  <div 
                                    key={idx}
                                    className="h-full"
                                    style={{ 
                                      width: `${totalBudget > 0 ? (cat.budget / totalBudget) * 100 : 0}%`,
                                      backgroundColor: allColors[cat.category] || '#8884d8'
                                    }}
                                  />
                                );
                                })
                              )}
                            </div>
                          </div>
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BudgetOverview;
