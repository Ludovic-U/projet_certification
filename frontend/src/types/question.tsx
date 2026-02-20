export interface Question extends Record<string, unknown> {
  questionId: number | string;
  label: string;
  keyword?: string;
  answered: boolean;
  status?: "pending" | "answered" | "skipped";
  category?: string;
  numberOfSelectionableOpt?: number;
  options?: string[];
  parentId?: number | null;
  types?: (number | { typeId: number; label: string })[];
  removeType?: number[];
  addProject?: number[];
  removeProject?: number[];
}
