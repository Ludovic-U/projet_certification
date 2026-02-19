import { Task, ExpenseLine } from '../types';
import { differenceInDays, isLeapYear } from 'date-fns';

export interface Budget {
  expenseLines: ExpenseLine[];
  personnelDays: number;
  personnelCost: number;
  internsDays: number;
  internsCost: number;
  amenagementsDescription: string;
  fittingsCost: number;
  educationalEquipmentCost: number;
  subcontractorCost: number;
  travelCost: number;
  otherPrestationsCost: number;
  communicationCost: number;
  overheadRate: number;
}

// Default empty budget object
export const createEmptyBudget = (): Budget => ({
  expenseLines: [],
  personnelDays: 0,
  personnelCost: 0,
  internsDays: 0,
  internsCost: 0,
  amenagementsDescription: '',
  fittingsCost: 0,
  educationalEquipmentCost: 0,
  subcontractorCost: 0,
  travelCost: 0,
  otherPrestationsCost: 0,
  communicationCost: 0,
  overheadRate: 0
});

// Create a new empty expense line
export const createEmptyExpenseLine = (): ExpenseLine => ({
  id: crypto.randomUUID(),
  nature: '',
  unites: 0,
  prix: 0
});

// Calculate the total for an expense line
export const calculateExpenseLineTotal = (line: ExpenseLine): number => {
  return line.unites * line.prix;
};

// Calculate total from expense lines by category
export const calculateExpenseLinesTotal = (lines: ExpenseLine[]): number => {
  if (!lines || !Array.isArray(lines)) return 0;
  return lines.reduce((sum, line) => sum + calculateExpenseLineTotal(line), 0);
};

// Calculate budget totals including expense lines
export const calculateBudgetTotals = (budget: Budget) => {
  const expenseLinesTotal = calculateExpenseLinesTotal(budget.expenseLines || []);
  const subtotal = expenseLinesTotal + budget.personnelCost + budget.internsCost + budget.fittingsCost + 
                  budget.educationalEquipmentCost + budget.subcontractorCost + budget.travelCost + 
                  budget.otherPrestationsCost + budget.communicationCost;
  const overhead = subtotal * (budget.overheadRate / 100);
  const total = subtotal + overhead;
  return { subtotal, overhead, total, expenseLinesTotal };
};

// Get budget from task or create empty one
export const getTaskBudget = (task: Task): Budget => {
  return task.budget || createEmptyBudget();
};

// Get expense lines filtered by category
export const getExpenseLinesByCategory = (lines: ExpenseLine[], category: string): ExpenseLine[] => {
  if (!lines || !Array.isArray(lines)) return [];
  return lines.filter(line => line.nature?.startsWith(category + ':') || line.nature === category);
};

// Calculate number of days in a specific year for a task that spans multiple years
const getDaysInYear = (start: Date, end: Date, year: number): number => {
  const yearStart = new Date(year, 0, 1);
  const yearEnd = new Date(year, 11, 31, 23, 59, 59);
  
  // Get the actual overlap period
  const effectiveStart = start > yearStart ? start : yearStart;
  const effectiveEnd = end < yearEnd ? end : yearEnd;
  
  if (effectiveStart > effectiveEnd) return 0;
  
  return differenceInDays(effectiveEnd, effectiveStart) + 1;
};

// Total days in a year (accounting for leap years)
const getTotalDaysInYear = (year: number): number => {
  return isLeapYear(new Date(year, 0, 1)) ? 366 : 365;
};

// Interface for yearly budget breakdown
export interface YearlyBudgetBreakdown {
  year: number;
  budget: number;
  personnelCost: number;
  internsCost: number;
  fittingsCost: number;
  educationalEquipmentCost: number;
  subcontractorCost: number;
  travelCost: number;
  otherPrestationsCost: number;
  communicationCost: number;
  overheadRate: number;
  expenseLinesTotal: number;
  taskCount: number;
  taskNames: string[];
}

// Interface for category breakdown
export interface CategoryBudget {
  category: string;
  budget: number;
  color: string;
}

// Split budget by years - proration based on days in each year
export const splitBudgetByYears = (tasks: Task[]): YearlyBudgetBreakdown[] => {
  const yearlyMap = new Map<number, YearlyBudgetBreakdown>();
  
  tasks.forEach(task => {
    // Skip tasks without budget or valid dates
    if (!task.budget) return;
    if (!task.start || !task.end || isNaN(task.start.getTime()) || isNaN(task.end.getTime())) return;
    
    // Ensure expenseLines exists before processing
    const budgetWithDefaults: Budget = {
      expenseLines: task.budget.expenseLines || [],
      personnelDays: task.budget.personnelDays ?? 0,
      personnelCost: task.budget.personnelCost ?? 0,
      internsDays: task.budget.internsDays ?? 0,
      internsCost: task.budget.internsCost ?? 0,
      amenagementsDescription: task.budget.amenagementsDescription ?? '',
      fittingsCost: task.budget.fittingsCost ?? 0,
      educationalEquipmentCost: task.budget.educationalEquipmentCost ?? 0,
      subcontractorCost: task.budget.subcontractorCost ?? 0,
      travelCost: task.budget.travelCost ?? 0,
      otherPrestationsCost: task.budget.otherPrestationsCost ?? 0,
      communicationCost: task.budget.communicationCost ?? 0,
      overheadRate: task.budget.overheadRate ?? 0,
    };
    
    const totals = calculateBudgetTotals(budgetWithDefaults);
    const taskTotal = totals.total;
    const startYear = task.start.getFullYear();
    const endYear = task.end.getFullYear();
    const totalDays = differenceInDays(task.end, task.start) + 1;
    
    if (totalDays <= 0) return;
    
    if (startYear === endYear) {
      // Single year task - add full budget
      const existing = yearlyMap.get(startYear);
      if (existing) {
        existing.budget += taskTotal;
        existing.personnelCost += budgetWithDefaults.personnelCost;
        existing.internsCost += budgetWithDefaults.internsCost;
        existing.fittingsCost += budgetWithDefaults.fittingsCost;
        existing.educationalEquipmentCost += budgetWithDefaults.educationalEquipmentCost;
        existing.subcontractorCost += budgetWithDefaults.subcontractorCost;
        existing.travelCost += budgetWithDefaults.travelCost;
        existing.otherPrestationsCost += budgetWithDefaults.otherPrestationsCost;
        existing.communicationCost += budgetWithDefaults.communicationCost;
        existing.expenseLinesTotal += totals.expenseLinesTotal;
        existing.taskCount += 1;
        existing.taskNames.push(task.text);
      } else {
        yearlyMap.set(startYear, {
          year: startYear,
          budget: taskTotal,
          personnelCost: budgetWithDefaults.personnelCost,
          internsCost: budgetWithDefaults.internsCost,
          fittingsCost: budgetWithDefaults.fittingsCost,
          educationalEquipmentCost: budgetWithDefaults.educationalEquipmentCost,
          subcontractorCost: budgetWithDefaults.subcontractorCost,
          travelCost: budgetWithDefaults.travelCost,
          otherPrestationsCost: budgetWithDefaults.otherPrestationsCost,
          communicationCost: budgetWithDefaults.communicationCost,
          overheadRate: budgetWithDefaults.overheadRate,
          expenseLinesTotal: totals.expenseLinesTotal,
          taskCount: 1,
          taskNames: [task.text]
        });
      }
    } else {
      // Multi-year task - prorate budget by days in each year
      for (let year = startYear; year <= endYear; year++) {
        const daysInThisYear = getDaysInYear(task.start, task.end, year);
        const totalDaysInYear = getTotalDaysInYear(year);
        const yearRatio = daysInThisYear / totalDaysInYear;
        
        // Prorate each budget category
        const proratedPersonnelCost = budgetWithDefaults.personnelCost * yearRatio;
        const proratedInternsCost = budgetWithDefaults.internsCost * yearRatio;
        const proratedFittingsCost = budgetWithDefaults.fittingsCost * yearRatio;
        const proratedEducationalEquipmentCost = budgetWithDefaults.educationalEquipmentCost * yearRatio;
        const proratedSubcontractorCost = budgetWithDefaults.subcontractorCost * yearRatio;
        const proratedTravelCost = budgetWithDefaults.travelCost * yearRatio;
        const proratedOtherPrestationsCost = budgetWithDefaults.otherPrestationsCost * yearRatio;
        const proratedCommunicationCost = budgetWithDefaults.communicationCost * yearRatio;
        const proratedExpenseLinesTotal = totals.expenseLinesTotal * yearRatio;
        
        // Calculate subtotal and overhead for this year
        const yearSubtotal = proratedPersonnelCost + proratedInternsCost + proratedFittingsCost + 
                           proratedEducationalEquipmentCost + proratedSubcontractorCost + proratedTravelCost + 
                           proratedOtherPrestationsCost + proratedCommunicationCost + proratedExpenseLinesTotal;
        const yearOverhead = yearSubtotal * (budgetWithDefaults.overheadRate / 100);
        const yearTotal = yearSubtotal + yearOverhead;
        
        const existing = yearlyMap.get(year);
        if (existing) {
          existing.budget += yearTotal;
          existing.personnelCost += proratedPersonnelCost;
          existing.internsCost += proratedInternsCost;
          existing.fittingsCost += proratedFittingsCost;
          existing.educationalEquipmentCost += proratedEducationalEquipmentCost;
          existing.subcontractorCost += proratedSubcontractorCost;
          existing.travelCost += proratedTravelCost;
          existing.otherPrestationsCost += proratedOtherPrestationsCost;
          existing.communicationCost += proratedCommunicationCost;
          existing.expenseLinesTotal += proratedExpenseLinesTotal;
          existing.taskCount += 1;
          existing.taskNames.push(task.text);
        } else {
          yearlyMap.set(year, {
            year,
            budget: yearTotal,
            personnelCost: proratedPersonnelCost,
            internsCost: proratedInternsCost,
            fittingsCost: proratedFittingsCost,
            educationalEquipmentCost: proratedEducationalEquipmentCost,
            subcontractorCost: proratedSubcontractorCost,
            travelCost: proratedTravelCost,
            otherPrestationsCost: proratedOtherPrestationsCost,
            communicationCost: proratedCommunicationCost,
            overheadRate: budgetWithDefaults.overheadRate,
            expenseLinesTotal: proratedExpenseLinesTotal,
            taskCount: 1,
            taskNames: [task.text]
          });
        }
      }
    }
  });
  
  return Array.from(yearlyMap.values()).sort((a, b) => a.year - b.year);
};

// Get total budget from all tasks
export const getTotalBudget = (tasks: Task[]): number => {
  return tasks.reduce((sum, task) => {
    if (!task.budget) return sum;
    // Skip tasks without valid dates
    if (!task.start || !task.end || isNaN(task.start.getTime()) || isNaN(task.end.getTime())) return sum;
    // Ensure budget has all required fields
    const budgetWithDefaults: Budget = {
      expenseLines: task.budget.expenseLines || [],
      personnelDays: task.budget.personnelDays ?? 0,
      personnelCost: task.budget.personnelCost ?? 0,
      internsDays: task.budget.internsDays ?? 0,
      internsCost: task.budget.internsCost ?? 0,
      amenagementsDescription: task.budget.amenagementsDescription ?? '',
      fittingsCost: task.budget.fittingsCost ?? 0,
      educationalEquipmentCost: task.budget.educationalEquipmentCost ?? 0,
      subcontractorCost: task.budget.subcontractorCost ?? 0,
      travelCost: task.budget.travelCost ?? 0,
      otherPrestationsCost: task.budget.otherPrestationsCost ?? 0,
      communicationCost: task.budget.communicationCost ?? 0,
      overheadRate: task.budget.overheadRate ?? 0,
    };
    return sum + calculateBudgetTotals(budgetWithDefaults).total;
  }, 0);
};

// Get budget breakdown by category for chart (from yearly data)
export const getBudgetByCategory = (yearlyData: YearlyBudgetBreakdown[]): CategoryBudget[] => {
  const categoryColors: Record<string, string> = {
    'Moyen humain': '#10b981', // emerald
    'Stagiaires': '#6b7280',   // gray
    'Amenagements': '#a855f7', // purple
    'Equipements pedagogiques': '#ec4899', // pink
    'Prestations': '#06b6d4',  // cyan
    'Communications': '#f97316', // orange
    'Frais de deplacement': '#84cc16', // lime
    'Autres prestations': '#14b8a6', // teal
    'Lignes de depenses': '#6366f1', // indigo
  };
  
  const totals = yearlyData.reduce((acc, year) => ({
    personnel: acc.personnel + year.personnelCost,
    interns: acc.interns + year.internsCost,
    fittings: acc.fittings + year.fittingsCost,
    educational: acc.educational + year.educationalEquipmentCost,
    subcontractor: acc.subcontractor + year.subcontractorCost,
    travel: acc.travel + year.travelCost,
    otherPrestations: acc.otherPrestations + year.otherPrestationsCost,
    communication: acc.communication + year.communicationCost,
    expenseLines: acc.expenseLines + year.expenseLinesTotal,
  }), {
    personnel: 0,
    interns: 0,
    fittings: 0,
    educational: 0,
    subcontractor: 0,
    travel: 0,
    otherPrestations: 0,
    communication: 0,
    expenseLines: 0,
  });
  
  return [
    { category: 'Moyen humain', budget: totals.personnel, color: categoryColors['Moyen humain'] },
    { category: 'Stagiaires', budget: totals.interns, color: categoryColors['Stagiaires'] },
    { category: 'Amenagements', budget: totals.fittings, color: categoryColors['Amenagements'] },
    { category: 'Equipements pedagogiques', budget: totals.educational, color: categoryColors['Equipements pedagogiques'] },
    { category: 'Prestations', budget: totals.subcontractor, color: categoryColors['Prestations'] },
    { category: 'Frais de deplacement', budget: totals.travel, color: categoryColors['Frais de deplacement'] },
    { category: 'Autres prestations', budget: totals.otherPrestations, color: categoryColors['Autres prestations'] },
    { category: 'Communications', budget: totals.communication, color: categoryColors['Communications'] },
    { category: 'Lignes de depenses', budget: totals.expenseLines, color: categoryColors['Lignes de depenses'] },
  ].filter(c => c.budget > 0);
};

// Get budget breakdown by category DIRECTLY from tasks (not prorated by year)
export const getBudgetByCategoryFromTasks = (tasks: Task[]): CategoryBudget[] => {
  const categoryColors: Record<string, string> = {
    'Moyen humain': '#10b981',
    'Stagiaires': '#6b7280',
    'Amenagements': '#a855f7',
    'Equipements pedagogiques': '#ec4899',
    'Prestations': '#06b6d4',
    'Communications': '#f97316',
    'Frais de deplacement': '#84cc16',
    'Autres prestations': '#14b8a6',
    'Lignes de depenses': '#6366f1',
  };
  
  const totals = tasks.reduce((acc, task) => {
    if (!task.budget) return acc;
    
    const expenseLinesTotal = calculateExpenseLinesTotal(task.budget.expenseLines || []);
    
    return {
      personnel: acc.personnel + (task.budget.personnelCost || 0),
      interns: acc.interns + (task.budget.internsCost || 0),
      fittings: acc.fittings + (task.budget.fittingsCost || 0),
      educational: acc.educational + (task.budget.educationalEquipmentCost || 0),
      subcontractor: acc.subcontractor + (task.budget.subcontractorCost || 0),
      travel: acc.travel + (task.budget.travelCost || 0),
      otherPrestations: acc.otherPrestations + (task.budget.otherPrestationsCost || 0),
      communication: acc.communication + (task.budget.communicationCost || 0),
      expenseLines: acc.expenseLines + expenseLinesTotal,
    };
  }, {
    personnel: 0,
    interns: 0,
    fittings: 0,
    educational: 0,
    subcontractor: 0,
    travel: 0,
    otherPrestations: 0,
    communication: 0,
    expenseLines: 0,
  });
  
  return [
    { category: 'Moyen humain', budget: totals.personnel, color: categoryColors['Moyen humain'] },
    { category: 'Stagiaires', budget: totals.interns, color: categoryColors['Stagiaires'] },
    { category: 'Amenagements', budget: totals.fittings, color: categoryColors['Amenagements'] },
    { category: 'Equipements pedagogiques', budget: totals.educational, color: categoryColors['Equipements pedagogiques'] },
    { category: 'Prestations', budget: totals.subcontractor, color: categoryColors['Prestations'] },
    { category: 'Frais de deplacement', budget: totals.travel, color: categoryColors['Frais de deplacement'] },
    { category: 'Autres prestations', budget: totals.otherPrestations, color: categoryColors['Autres prestations'] },
    { category: 'Communications', budget: totals.communication, color: categoryColors['Communications'] },
    { category: 'Lignes de depenses', budget: totals.expenseLines, color: categoryColors['Lignes de depenses'] },
  ].filter(c => c.budget > 0);
};
