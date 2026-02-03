import { Task } from '../types';

export interface Budget {
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

// Calculate budget totals
export const calculateBudgetTotals = (budget: Budget) => {
  const subtotal = budget.personnelCost + budget.internsCost + budget.fittingsCost + 
                  budget.educationalEquipmentCost + budget.subcontractorCost + budget.travelCost + 
                  budget.otherPrestationsCost + budget.communicationCost;
  const overhead = subtotal * (budget.overheadRate / 100);
  const total = subtotal + overhead;
  return { subtotal, overhead, total };
};

// Get budget from task or create empty one
export const getTaskBudget = (task: Task): Budget => {
  return task.budget || createEmptyBudget();
};
