export interface Question {
    questionId: number;
    label: string;
    category?: string;
    numberOfSelectionableOpt?: number;
    isRelevant?: boolean;
    hasMultipleOpenResponse?: boolean;
    shouldMultiply?: boolean;
    questionIdParent?: number | null;
    addType?: number[];
    removeType?: number[];
    addProject?: number[];
    removeProject?: number[];
}