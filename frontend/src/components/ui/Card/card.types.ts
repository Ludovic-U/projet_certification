export interface CardProps {
    title: string;
    description?: string;
    progress?: number;
    buttonLabel?: string;
    onButtonClick?: () => void;
    color?: string,
    className?: string;
}