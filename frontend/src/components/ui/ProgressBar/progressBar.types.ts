export interface ProgressBarProps {
    value: number;
    max?: number;
    size?: "sm" | "md" | "lg";
    className?: string;
    color: string;
    showLabel?: boolean;
}