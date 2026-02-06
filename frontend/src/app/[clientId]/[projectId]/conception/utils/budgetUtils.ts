import { Task, ExpenseLine } from '../types';

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
  return lines.reduce((sum, line) => sum + calculateExpenseLineTotal(line), 0);
};

// Calculate budget totals including expense lines
export const calculateBudgetTotals = (budget: Budget) => {
  const expenseLinesTotal = calculateExpenseLinesTotal(budget.expenseLines);
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
  return lines.filter(line => line.nature?.startsWith(category + ':') || line.nature === category);
};
