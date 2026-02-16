export interface CardProps {
    title: string;
    description?: string;
    progress?: number;
    buttonLabel?: string;
    onButtonClick?: () => void;
    color?: string,
    className?: string;
    max?: number;
    showPercent?: boolean;
    size?: "md" | "sm";
}