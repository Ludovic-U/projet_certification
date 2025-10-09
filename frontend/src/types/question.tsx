export interface Question {
    id: number | string;
    label: string;
    answered: boolean;
    status?: "pending" | "answered" | "skipped";
    category?: string;
    numberOfSelectionableOpt?: number;
    isRelevant?: boolean;
    hasMultipleOpenResponse?: boolean;
    shouldMultiply?: boolean;
    parentId?: number | null;
    addType?: number[];
    removeType?: number[];
    addProject?: number[];
    removeProject?: number[];
}